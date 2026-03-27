import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSafeInternalPath } from '@/lib/auth/safe_redirect';
import type { UserRole } from '@/types/auth';

const ROLE_REDIRECT: Record<UserRole, string> = {
  postulant: '/dashboard/postulante',
  hr: '/dashboard/puestos',
  admin: '/dashboard/puestos',
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');
  const safePath = getSafeInternalPath(next);

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (error) {
            console.error('[auth/callback] Error setting cookies:', error);
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error('[auth/callback] Error de exchangeCodeForSession:', error);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(safePath ? `${origin}${safePath}` : `${origin}/`);
  }

  if (safePath) {
    return NextResponse.redirect(`${origin}${safePath}`);
  }

  const { data: profile } = await supabase
    .from('user_profile')
    .select('user_role')
    .eq('supabase_id', user.id)
    .single();

  const role = profile?.user_role as UserRole | undefined;
  return NextResponse.redirect(`${origin}${(role && ROLE_REDIRECT[role]) || '/'}`);
}
