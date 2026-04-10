import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  // En entornos Serverless/Edge a veces las variables pueden incluir espacios,
  // comillas accidentales del dashboard, o ser inyectadas como el string literal "undefined".
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const url = rawUrl?.replace(/['"]/g, '')?.trim();
  const serviceRoleKey = rawKey?.replace(/['"]/g, '')?.trim();

  if (!url || !serviceRoleKey || url === "undefined" || serviceRoleKey === "undefined") {
    console.warn("[Supabase Admin] Credenciales faltantes o inválidas en este entorno.");
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
