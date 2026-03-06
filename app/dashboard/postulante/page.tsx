import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/server";
import PostulantDashboardContent, { 
  type JobApplicationWithDetails, 
  type CandidateCVGeneral,
  type ApplicationStatusDB,
} from "./postulant_dashboard_content";

// Tipos para las respuestas de Supabase (las relaciones FK pueden venir como array u objeto)
interface JobApplicationRow {
  id: number;
  status: ApplicationStatusDB;
  created_at: string;
  updated_at: string | null;
  status_changed_at: string;
  job: {
    id: number;
    title: string;
    description: string;
    company: { id: number; name: string } | { id: number; name: string }[];
    location: { id: number; name: string } | { id: number; name: string }[];
  } | null;
  cv: {
    id: number;
    path: string;
    mime_type: string;
  } | null;
}

// Helper para extraer objeto de una relación que puede ser array u objeto
function extractRelation<T>(rel: T | T[] | null | undefined): T | null {
  if (rel === null || rel === undefined) return null;
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

export default async function PostulantDashboard() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentUser();

  // Verificación de seguridad (también está en layout, pero doble check)
  if (!supabase || !user || !profile) {
    redirect("/login");
  }

  if (profile.user_role !== "postulant") {
    redirect("/");
  }

  // Obtener las postulaciones del usuario con datos relacionados
  const { data: applicationsData, error: applicationsError } = await supabase
    .from("job_application")
    .select(`
      id,
      status,
      created_at,
      updated_at,
      status_changed_at,
      job:job_id (
        id,
        title,
        description,
        company:company (
          id,
          name
        ),
        location:location (
          id,
          name
        )
      ),
      cv:cv_id (
        id,
        path,
        mime_type
      )
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (applicationsError) {
    console.error("Error fetching applications:", applicationsError);
  }

  // Obtener el CV general del usuario (cv_type = 'general')
  const { data: generalCVData, error: cvError } = await supabase
    .from("candidate_cvs")
    .select("id, path, bucket, mime_type, file_size_bytes, created_at")
    .eq("user_id", profile.id)
    .eq("cv_type", "general")
    .single();

  if (cvError && cvError.code !== "PGRST116") {
    // PGRST116 = no rows found (esto es esperado si el usuario no tiene CV)
    console.error("Error fetching general CV:", cvError);
  }

  // Transformar los datos para que coincidan con los tipos esperados
  const rawData = (applicationsData ?? []) as unknown as JobApplicationRow[];
  
  const applications: JobApplicationWithDetails[] = rawData.map((app) => {
    const job = extractRelation(app.job);
    const cv = extractRelation(app.cv);
    const company = job ? extractRelation(job.company) : null;
    const location = job ? extractRelation(job.location) : null;

    return {
      id: app.id,
      status: app.status,
      created_at: app.created_at,
      updated_at: app.updated_at,
      status_changed_at: app.status_changed_at,
      job: {
        id: job?.id ?? 0,
        title: job?.title ?? "Sin título",
        description: job?.description ?? "",
        company: {
          id: company?.id ?? 0,
          name: company?.name ?? "Empresa desconocida",
        },
        location: {
          id: location?.id ?? 0,
          name: location?.name ?? "Sin ubicación",
        },
      },
      cv: {
        id: cv?.id ?? 0,
        path: cv?.path ?? "",
        mime_type: cv?.mime_type ?? "",
      },
    };
  });

  const generalCV: CandidateCVGeneral | null = generalCVData
    ? {
        id: generalCVData.id,
        path: generalCVData.path,
        bucket: generalCVData.bucket,
        mime_type: generalCVData.mime_type,
        file_size_bytes: generalCVData.file_size_bytes,
        created_at: generalCVData.created_at,
      }
    : null;

  return (
    <PostulantDashboardContent
      profile={profile}
      userEmail={user.email ?? ""}
      applications={applications}
      generalCV={generalCV}
    />
  );
}
