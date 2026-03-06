
export const TABLE_USER_PROFILE = 'user_profile';


export const USER_ROLES = {
  POSTULANT: 'postulant',
  HR: 'hr',
  ADMIN: 'admin',
} as const;


export type ApplicationStatus = 'received' | 'in_review' | 'contacted' | 'rejected';


export const APPLICATION_STATUS_MAP: Record<ApplicationStatus, string> = {
  received: 'Recibida',
  in_review: 'En revisión',
  contacted: 'Contactado',
  rejected: 'Rechazada',
};

export const APPLICATION_STATUS_REVERSE = Object.fromEntries(
  Object.entries(APPLICATION_STATUS_MAP).map(([k, v]) => [v, k as ApplicationStatus])
) as Record<string, ApplicationStatus>;
