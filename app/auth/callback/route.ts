import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { UserRole } from '@/types/auth';

const ROLE_REDIRECT: Record<UserRole, string> = {
  postulant: '/dashboard/postulante',
  hr:        '/dashboard/puestos',
  admin:     '/dashboard/puestos',
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  // Sanitize: only allow internal paths (starting with / but not //)
  const safePath = next && next.startsWith('/') && !next.startsWith('//') ? next : null;

  if (code) {
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
            } catch {
              // Ignorado en Server Components de solo lectura
            }
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If there's a safe returnUrl, use it
      if (safePath) {
        return NextResponse.redirect(`${origin}${safePath}`);
      }

      // Otherwise, redirect based on user role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profile')
          .select('user_role')
          .eq('supabase_id', user.id)
          .single();

        const role = profile?.user_role as UserRole | undefined;
        const dest = (role && ROLE_REDIRECT[role]) || '/';
        return NextResponse.redirect(`${origin}${dest}`);
      }

      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
