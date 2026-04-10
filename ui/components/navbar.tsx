'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { useSession } from 'next-auth/react';
import BurgerBtn from './burguer_btn';
import { logout } from '@/lib/actions/auth';
import type { UserRole } from '@/types/auth';

interface NavbarUser {
  id: string;
  email: string;
}

const PUBLIC_LINKS = [
  { href: '/buscar-empleos', label: 'Buscar empleos' },
  { href: '/quienes-somos', label: 'Quiénes somos' },
  { href: '/faq', label: 'FAQ' },
];

const DASHBOARD_PATHS = [
  '/dashboard/puestos',
  '/dashboard/aplicaciones',
  '/dashboard/resumes',
  '/dashboard/configuracion',
  '/dashboard/metricas',
];

const canAccessDashboard = (role?: UserRole | null) => role === 'hr' || role === 'admin';

export default function Navbar() {
  const pathname = usePathname();
  const disablePrefetch = pathname.startsWith('/dashboard');
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();

  const user: NavbarUser | null = session?.user
    ? { id: session.user.supabaseId ?? '', email: session.user.email ?? '' }
    : null;
  const userRole = (session?.user?.role ?? null) as UserRole | null;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const isDashboardActive = DASHBOARD_PATHS.some((p) => pathname.startsWith(p));

  const links = [
    ...PUBLIC_LINKS,
    ...(user && userRole === 'postulant' ? [{ href: '/dashboard/postulante', label: 'Mi panel' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-brand-50/80 backdrop-blur">
      <nav className="relative mx-auto min-h-14 lg:min-h-[7vh] px-4 py-1 flex items-center lg:mx-[5vw]">
        <Link
          href="/"
          prefetch={disablePrefetch ? false : undefined}
          className="h-full shrink-0 sm:shrink basis-[200px] sm:basis-60 md:basis-[200px]"
        >
          <Image
            src="/logo-eusse-completo.png"
            alt="Eusse"
            width={240}
            height={56}
            className="h-full max-h-14 w-auto object-contain transition-[height] duration-200 hidden sm:block"
            priority
          />
          <Image
            src="/logo-eusse-reducido.png"
            alt="Eusse"
            width={56}
            height={56}
            className="h-full max-h-14 w-auto object-contain transition-[height] duration-200 block sm:hidden"
            priority
          />
        </Link>

        <div className="flex-1" />

        <ul className="hidden sm:flex items-center gap-x-[clamp(0.5rem,2.2vw,1.25rem)] whitespace-nowrap">
          {links.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                prefetch={disablePrefetch ? false : undefined}
                className={`transition-colors duration-200 text-[clamp(1rem,1.5vw,1.3rem)] ${
                  isActive(link.href)
                    ? 'text-accent font-semibold border-b-2 border-accent pb-1'
                    : 'text-brand-900 hover:text-accent/80'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {!user ? (
            <li className="ml-4">
              <Link
                href="/login"
                prefetch={disablePrefetch ? false : undefined}
                className="bg-accent text-white font-medium px-4 py-2 rounded-md shadow-sm hover:bg-accent/90 transition-all duration-200"
              >
                Iniciar sesión
              </Link>
            </li>
          ) : (
            <>
              {canAccessDashboard(userRole) && (
                <li>
                  <Link
                    href="/dashboard/puestos"
                    prefetch={disablePrefetch ? false : undefined}
                    className={`border border-slate-200 text-brand-900 font-medium px-4 py-2 rounded-md shadow-sm hover:border-accent/50 transition-all duration-200 ${
                      isDashboardActive ? 'border-accent bg-accent/10' : ''
                    }`}
                  >
                    RRHH
                  </Link>
                </li>
              )}
              <li className="ml-2">
                <button
                  onClick={() => startTransition(() => logout())}
                  disabled={isPending}
                  className="bg-brand-900 text-white font-medium px-4 py-2 rounded-md shadow-sm hover:bg-brand-800 transition-all duration-200 disabled:opacity-50"
                >
                  {isPending ? 'Saliendo...' : 'Cerrar sesión'}
                </button>
              </li>
            </>
          )}
        </ul>

        <div className="md:hidden ml-2 shrink-0">
          <BurgerBtn links={links} user={user} userRole={userRole} disablePrefetch={disablePrefetch} />
        </div>
      </nav>
    </header>
  );
}
