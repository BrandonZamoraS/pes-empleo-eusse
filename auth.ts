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
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    /**
     * Primera vez que el usuario inicia sesión: busca o crea el usuario en
     * Supabase auth y hace upsert en user_profile.
     * Nota: account y user solo están presentes en el primer sign-in.
     */
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const adminClient = createAdminClient();
        if (!adminClient) {
          console.error("[NextAuth jwt] SUPABASE_SERVICE_ROLE_KEY no configurado");
          return token;
        }

        try {
          // Buscar usuario en Supabase auth por email
          const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });

          if (listError) throw listError;

          const existingAuthUser = users.find((u) => u.email === user.email);
          let supabaseId: string;

          if (existingAuthUser) {
            supabaseId = existingAuthUser.id;
          } else {
            // Crear nuevo usuario en Supabase auth (sin contraseña, solo para mantener la FK)
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

          // Upsert en user_profile: inserta si no existe, ignora si ya existe
          // ignoreDuplicates: true preserva el user_role y is_active existentes
          const { error: upsertError } = await adminClient
            .from("user_profile")
            .upsert(
              {
                supabase_id: supabaseId,
                name: user.name ?? user.email,
                user_role: "postulant",
                is_active: true,
              },
              { onConflict: "supabase_id", ignoreDuplicates: true }
            );

          if (upsertError) throw upsertError;

          // Leer el rol actual (puede ser distinto de "postulant" si ya existe)
          const { data: profile } = await adminClient
            .from("user_profile")
            .select("user_role, is_active")
            .eq("supabase_id", supabaseId)
            .single();

          token.supabaseId = supabaseId;
          token.role = profile?.user_role ?? "postulant";
          token.isActive = profile?.is_active ?? true;
        } catch (err) {
          console.error("[NextAuth jwt]", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.supabaseId = token.supabaseId as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
