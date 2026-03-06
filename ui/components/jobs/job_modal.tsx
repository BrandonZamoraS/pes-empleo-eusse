"use client";

import { useEffect } from "react";
import type { JobData } from "@/types/jobs";

type UserRole = "postulant" | "hr" | "admin";

type Props = {
  job: JobData | null;
  open: boolean;
  onClose: () => void;
  onApply?: (jobId: number) => void;
  userRole?: UserRole | null;
};

export default function JobModal({ job, open, onClose, onApply, userRole = null }: Props) {
  const isHROrAdmin = userRole === "hr" || userRole === "admin";

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !job) return null;

  const companyName = job.company_data?.name || 'Empresa';
  const locationName = job.location_data?.name || 'Ubicación';


  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-101 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-brand-700">{companyName}</p>
            <h3 className="text-2xl font-semibold text-brand-900">{job.title}</h3>
            <p className="mt-2 text-sm text-brand-700">{locationName}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-2 text-brand-700 transition hover:bg-brand-200 hover:text-brand-900"
          >
            ✕
          </button>
        </header>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
          <section>
            <h4 className="text-xs uppercase tracking-wider text-brand-700">Descripción</h4>
            <p className="mt-2 text-brand-800 whitespace-pre-line">{job.description}</p>
          </section>

          <section className="rounded-xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-brand-700">Empresa</p>
              <p className="text-sm font-semibold text-brand-900 truncate">{companyName}</p>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-brand-700">Ubicación</p>
              <p className="text-sm font-semibold text-brand-900 truncate">{locationName}</p>
            </div>
          </section>

        </div>

        <footer className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-200/40"
          >
            Cerrar
          </button>
          <div className="flex-1" />
          
          {/* Botón de aplicar con lógica de autenticación */}
          <button
            onClick={() => onApply?.(job.id)}
            disabled={isHROrAdmin}
            className={`rounded-xl px-5 py-2 text-sm font-semibold shadow ${
              isHROrAdmin
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-accent text-accent-foreground hover:bg-accent/90"
            }`}
            title={isHROrAdmin ? "Los usuarios HR/Admin no pueden aplicar a vacantes" : undefined}
          >
            Aplicar Ya
          </button>
        </footer>
      </div>
    </div>
  );
}
