import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createAdminClient } from "@/lib/supabase/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          redirect_uri: process.env.AUTH_URL
            ? `${process.env.AUTH_URL}/api/auth/callback/google`
            : undefined,
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async jwt({ token, user, account }) {
      // Solo en el primer sign-in (account y user están presentes)
      if (account?.provider === "google" && user?.email) {
        // Guardar email y nombre siempre, independientemente de si Supabase falla
        token.email = user.email;
        token.name  = user.name ?? user.email;

        const adminClient = createAdminClient();
        if (!adminClient) {
          console.error("[NextAuth jwt] SUPABASE_SERVICE_ROLE_KEY no configurado — paneles no cargarán");
          return token;
        }

        try {
          // 1. Buscar usuario en Supabase auth por email
          const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });

          if (listError) throw listError;

          const existingAuthUser = users.find(
            (u) => u.email?.toLowerCase() === user.email?.toLowerCase()
          );
          let supabaseId: string;

          if (existingAuthUser) {
            supabaseId = existingAuthUser.id;
          } else {
            const { data: { user: newAuthUser }, error: createError } =
              await adminClient.auth.admin.createUser({
                email: user.email,
                email_confirm: true,
                user_metadata: { full_name: user.name ?? user.email },
              });
            if (createError) throw createError;
            if (!newAuthUser) throw new Error("No se pudo crear el usuario en Supabase auth");
            supabaseId = newAuthUser.id;
          }

          // 2. Buscar perfil existente (select-then-insert para evitar dependencia de constraint UNIQUE)
          const { data: existingProfile } = await adminClient
            .from("user_profile")
            .select("id, user_role, is_active")
            .eq("supabase_id", supabaseId)
            .maybeSingle();

          if (!existingProfile) {
            await adminClient.from("user_profile").insert({
              supabase_id: supabaseId,
              name: user.name ?? user.email,
              user_role: "postulant",
              is_active: true,
            });
          }

          // 3. Leer rol actualizado
          const { data: profile, error: profileError } = await adminClient
            .from("user_profile")
            .select("user_role, is_active")
            .eq("supabase_id", supabaseId)
            .single();

          if (profileError) console.error("[NextAuth jwt] Error leyendo perfil:", profileError);
          console.log(`[NextAuth jwt] supabaseId=${supabaseId} role=${profile?.user_role}`);

          token.supabaseId = supabaseId;
          token.role     = profile?.user_role ?? "postulant";
          token.isActive = profile?.is_active ?? true;
        } catch (err) {
          console.error("[NextAuth jwt] Error al sincronizar con Supabase:", err);
          // token.email y token.name ya están seteados — getCurrentUser() usará email como fallback
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.supabaseId = (token.supabaseId as string) ?? "";
      session.user.role       = (token.role as string) ?? "postulant";
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
});
