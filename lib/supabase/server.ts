import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createClient() {
  return createAdminClient();
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return { user: null, profile: null };

  const adminClient = createAdminClient();
  if (!adminClient) return { user: null, profile: null };

  const supabaseId = session.user.supabaseId;
  const email      = session.user.email;

  // Camino rápido: supabaseId en el token
  if (supabaseId) {
    const { data: profile, error } = await adminClient
      .from("user_profile")
      .select("*")
      .eq("supabase_id", supabaseId)
      .single();

    if (error) console.error("[getCurrentUser] Error fetching profile:", error);

    return {
      user: { id: supabaseId, email: email ?? "" },
      profile: profile ?? null,
    };
  }

  // Fallback: buscar por email cuando el token no tiene supabaseId
  // (ocurre si el JWT callback falló al sincronizar con Supabase)
  if (email) {
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      console.error("[getCurrentUser] Error listing users:", listError);
      return { user: null, profile: null };
    }

    const authUser = users.find((u) => u.email === email);
    if (!authUser) return { user: null, profile: null };

    const { data: profile, error: profileError } = await adminClient
      .from("user_profile")
      .select("*")
      .eq("supabase_id", authUser.id)
      .single();

    if (profileError) console.error("[getCurrentUser] Error fetching profile by email:", profileError);

    return {
      user: { id: authUser.id, email },
      profile: profile ?? null,
    };
  }

  return { user: null, profile: null };
}

export async function checkUserRole(allowedRoles: string[]) {
  const { profile } = await getCurrentUser();
  return !!profile?.is_active && allowedRoles.includes(profile.user_role);
}
