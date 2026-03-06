import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getGeneralCvs } from "@/lib/actions/resumes";
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

  try {
    const { data, error } = await getGeneralCvs();

    return (
      <ResumesContent 
        initialCvs={data || []} 
        initialError={error || null} 
      />
    );
  } catch (error) {
    return (
      <ResumesContent 
        initialCvs={[]} 
        initialError="Error al cargar los CVs. Intenta recargar la página." 
      />
    );
  }
}
