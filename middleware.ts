import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isPublicRoute, getAllowedRoles } from "@/types/auth";
import type { UserRole } from "@/types/auth";

const ROLE_REDIRECT: Record<UserRole, string> = {
  postulant: "/dashboard/postulante",
  hr: "/dashboard/puestos",
  admin: "/dashboard/puestos",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  const userRole = req.auth?.user?.role as UserRole | undefined;

  // Rutas públicas: acceso libre
  if (isPublicRoute(pathname)) {
    // Si ya está autenticado y va al login/registro, redirigir al dashboard
    if (isAuthenticated && (pathname === "/login" || pathname === "/registro")) {
      const dest = (userRole && ROLE_REDIRECT[userRole]) || "/";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // Ruta protegida sin sesión: redirigir al login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar rol para la ruta
  const allowedRoles = getAllowedRoles(pathname);
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    const dest = (userRole && ROLE_REDIRECT[userRole]) || "/";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Excluir: archivos estáticos, imágenes optimizadas, favicon,
     * y las rutas propias de NextAuth (/api/auth/*)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
