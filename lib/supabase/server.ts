/**
 * RAMA: feature/nextauth-migration
 *
 * createClient() devuelve el admin client (service role) para que todas las
 * queries de datos existentes funcionen sin RLS mientras probamos NextAuth.
 * En una migración completa se evaluaría pasar el JWT de NextAuth a Supabase
 * para mantener el RLS por usuario.
 *
 * getCurrentUser() obtiene la sesión de NextAuth y busca el perfil en
 * user_profile usando el supabaseId almacenado en el JWT.
 */

import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cliente de Supabase para uso en server actions y server components.
 * En esta rama usa service role para evitar bloqueos de RLS sin sesión de
 * Supabase Auth.
 */
export async function createClient() {
  return createAdminClient();
}

export async function getCurrentUser() {
  const session = await auth();
  const supabaseId = session?.user?.supabaseId;

  if (!supabaseId) return { user: null, profile: null };

  const adminClient = createAdminClient();
  if (!adminClient) return { user: null, profile: null };

  const { data: profile, error: profileError } = await adminClient
    .from("user_profile")
    .select("*")
    .eq("supabase_id", supabaseId)
    .single();

  if (profileError) console.error("Error fetching user profile:", profileError);

  return {
    user: {
      id: supabaseId,
      email: session.user.email ?? "",
    },
    profile: profile ?? null,
  };
}

export async function checkUserRole(allowedRoles: string[]) {
  const { profile } = await getCurrentUser();
  return !!profile?.is_active && allowedRoles.includes(profile.user_role);
}
