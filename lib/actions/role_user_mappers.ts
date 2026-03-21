export type AdminUserRole = "postulant" | "hr" | "admin";

export interface AdminProfileRecord {
  id: string;
  supabase_id: string;
  name: string | null;
  user_role: AdminUserRole;
  is_active: boolean;
  created_at: string;
}

export interface AdminUserRecord {
  id: string;
  supabase_id: string;
  name: string;
  email: string;
  user_role: AdminUserRole;
  is_active: boolean;
  created_at: string;
}

function buildFallbackEmail(profileId: string): string {
  return `user-${profileId.slice(0, 8)}@empresa.com`;
}

export function mapAdminProfilesWithEmails(
  profiles: AdminProfileRecord[] | null | undefined,
  currentUserId: string | null | undefined,
  currentUserEmail: string | null | undefined,
  authEmailsById: Map<string, string>,
): AdminUserRecord[] {
  return (profiles ?? []).map((profile) => {
    const email =
      profile.supabase_id === currentUserId
        ? currentUserEmail || authEmailsById.get(profile.supabase_id) || buildFallbackEmail(profile.id)
        : authEmailsById.get(profile.supabase_id) || buildFallbackEmail(profile.id);

    return {
      id: profile.id,
      supabase_id: profile.supabase_id,
      name: profile.name || "Sin nombre",
      email,
      user_role: profile.user_role,
      is_active: profile.is_active,
      created_at: profile.created_at,
    };
  });
}
