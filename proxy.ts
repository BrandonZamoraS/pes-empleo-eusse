import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  getAllowedRoles,
  getRedirectForRole,
  isAuthEntryRoute,
} from "@/lib/auth/navigation";
import type { UserRole } from "@/types/auth";

export default auth((request: NextRequest & { auth: ReturnType<typeof auth> extends Promise<infer T> ? T : never }) => {
  const { pathname } = request.nextUrl;

  // Excluir rutas propias de NextAuth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const session = (request as any).auth;
  const user = session?.user ?? null;
  const userRole = (user?.role ?? null) as UserRole | null;

  // Login/registro: si ya autenticado redirigir al dashboard
  if (isAuthEntryRoute(pathname)) {
    if (!user) return NextResponse.next();
    return NextResponse.redirect(
      new URL(getRedirectForRole(userRole ?? "postulant"), request.url),
    );
  }

  // Ruta protegida sin sesión
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar rol — solo redirigir si el rol es conocido y no tiene acceso
  const allowedRoles = getAllowedRoles(pathname);
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return NextResponse.redirect(
      new URL(getRedirectForRole(userRole), request.url),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/registro"],
};
