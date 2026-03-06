import { getCurrentUser } from "@/lib/supabase/server";
import { getJobs, getCompanies, getLocations } from "@/lib/actions/jobs";
import JobsPageContent from "./jobs_page_content";

export default async function JobsPage() {
  // Obtener información de autenticación
  const { user, profile } = await getCurrentUser();
  
  const isAuthenticated = !!user && !!profile;
  const userRole = profile?.user_role ?? null;

  // Obtener datos de la base de datos
  const { data: jobs } = await getJobs();
  const { data: companies } = await getCompanies();
  const { data: locations } = await getLocations();

  return (
    <JobsPageContent 
      isAuthenticated={isAuthenticated} 
      userRole={userRole}
      jobs={jobs || []}
      companies={companies || []}
      locations={locations || []}
    />
  );
}
