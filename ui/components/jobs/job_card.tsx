"use client";

import { useRouter } from "next/navigation";
import type { JobData } from "@/types/jobs";

type UserRole = "postulant" | "hr" | "admin";

type Props = {
  job: JobData;
  onOpen: (job: JobData) => void;
  isAuthenticated?: boolean;
  userRole?: UserRole | null;
};

export default function JobCard({ job, onOpen, isAuthenticated = false, userRole = null }: Props) {
  const router = useRouter();
  
  const isHROrAdmin = userRole === "hr" || userRole === "admin";

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/aplicar/${job.id}`);
    } else if (userRole === "postulant") {
      router.push(`/aplicar/${job.id}`);
    }
  };

  const companyName = job.company_data?.name || 'Empresa';
  const locationName = job.location_data?.name || 'Ubicación';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-700">{companyName}</p>
          <h3 className="mt-1 text-xl font-semibold text-brand-900">{job.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-brand-700">
            <span title="Ubicación">{locationName}</span>
          </div>
        </div>
        <div className="rounded-full bg-brand-200 px-4 py-1 text-xs font-semibold text-brand-900">
          Publicada {new Date(job.created_at).toLocaleDateString('es-CR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
        </div>
      </header>

      <p className="mt-4 line-clamp-3 text-brand-800">{job.description}</p>

      <footer className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => onOpen(job)}
          className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground shadow hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
          aria-label={`Ver más información de ${job.title}`}
        >
          Ver más información
        </button>
        
        <button
          onClick={handleApply}
          disabled={isHROrAdmin}
          title={isHROrAdmin ? "Los usuarios HR/Admin no pueden aplicar a vacantes" : undefined}
          className={`ml-auto rounded-xl px-5 py-2 text-sm font-semibold shadow ${
            isHROrAdmin
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
        >
          Aplicar
        </button>
        
        <div className="text-xs text-brand-700">
          {job.applicants_count || 0} postulantes
        </div>
      </footer>
    </article>
  );
}
