/**
 * RAMA: feature/nextauth-migration
 *
 * El callback de OAuth ahora lo maneja NextAuth en /api/auth/callback/google.
 * Esta ruta queda como redirección de compatibilidad para links viejos o emails
 * de confirmación que puedan apuntar aquí.
 */
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}
