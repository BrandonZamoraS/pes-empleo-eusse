'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/auth';
import type { UserRole } from '@/types/auth';

export interface AuthResult {
  error?: string;
  success?: boolean;
}

const ROLE_REDIRECT: Record<UserRole, string> = {
  postulant: '/dashboard/postulante',
  hr:        '/dashboard/puestos',
  admin:     '/dashboard/puestos',
};

// ─── Google OAuth ────────────────────────────────────────────────────────────

export async function loginWithGoogle(returnUrl?: string): Promise<void> {
  // Redirigir a /auth/redirect para que determine el dashboard correcto según el rol
  const callbackUrl = returnUrl ?? '/auth/redirect';
  await signIn('google', { redirectTo: callbackUrl });
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  revalidatePath('/', 'layout');
  await signOut({ redirectTo: '/login' });
}

// ─── Email / password ────────────────────────────────────────────────────────
// Las siguientes funciones no se usan en esta rama de prueba (solo Google OAuth).
// Se mantienen para no romper importaciones existentes.

export async function login(_formData: FormData): Promise<AuthResult> {
  return { error: 'Login con email no disponible en esta rama. Usa Google.' };
}

export async function signup(_formData: FormData): Promise<AuthResult> {
  return { error: 'Registro con email no disponible en esta rama. Usa Google.' };
}

export async function requestPasswordReset(_email: string): Promise<AuthResult> {
  return { error: 'Reset de contraseña no disponible en esta rama.' };
}

export async function updatePassword(_newPassword: string): Promise<AuthResult> {
  return { error: 'Actualización de contraseña no disponible en esta rama.' };
}
