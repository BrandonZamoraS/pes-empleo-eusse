import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAllowedRoles,
  getRedirectForRole,
  isAuthEntryRoute,
} from "@/lib/auth/navigation";
import type { UserRole } from "@/types/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Excluir rutas propias de NextAuth para que no se intercepten
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const session = await auth();
  const user = session?.user ?? null;
  const userRole = (user?.role ?? null) as UserRole | null;

  // Ruta de login/registro: si ya está autenticado, redirigir al dashboard
  if (isAuthEntryRoute(pathname)) {
    if (!user) return NextResponse.next();
    return NextResponse.redirect(
      new URL(getRedirectForRole(userRole ?? "postulant"), request.url),
    );
  }

  // Ruta protegida sin sesión: redirigir al login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar rol para la ruta
  const allowedRoles = getAllowedRoles(pathname);
  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    return NextResponse.redirect(
      new URL(getRedirectForRole(userRole ?? "postulant"), request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/registro"],
};
