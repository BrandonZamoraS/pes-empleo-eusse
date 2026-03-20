import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getGeneralCvs, type GeneralCvData } from "@/lib/actions/resumes";
import ResumesContent from "./resumes_content";

export default async function ResumesPage() {
  const { user, profile } = await getCurrentUser();

  // Verificar autenticación y autorización
  if (!user || !profile) {
    redirect("/login");
  }

  if (!["hr", "admin"].includes(profile.user_role)) {
    redirect("/dashboard/postulante");
  }

  let initialCvs: GeneralCvData[] = [];
  let initialError: string | null = null;

  try {
    const { data, error } = await getGeneralCvs();
    initialCvs = data || [];
    initialError = error || null;
  } catch {
    initialError = "Error al cargar los CVs. Intenta recargar la página.";
  }

  return (
    <ResumesContent
      initialCvs={initialCvs}
      initialError={initialError}
    />
  );
}
