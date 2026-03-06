"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import type { JobData, JobStatus } from "@/types/jobs";
import {
  updateJobStatusClient,
  duplicateJobClient,
  deleteJobClient,
} from "@/lib/actions/jobs.client";

const STATUS_STYLES: Record<JobStatus, string> = {
  draft: "bg-brand-50 text-brand-700 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]",
  pending: "bg-amber-50 text-amber-700 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]",
  active: "bg-brand-400/25 text-brand-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]",
  paused: "bg-amber-50 text-amber-700 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]",
  closed: "bg-brand-50 text-brand-700 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]",
};

const STATUS_DISPLAY: Record<JobStatus, string> = {
  draft: "Borrador",
  pending: "Pendiente",
  active: "Activo",
  paused: "Pausado",
  closed: "Cerrado",
};

interface JobCardRecruiterProps {
  job: JobData;
  onEdit: (job: JobData) => void;
  onViewApplicants: (jobId: number) => void;
  onRefresh: () => void;
}

export default function JobCardRecruiter({
  job,
  onEdit,
  onViewApplicants,
  onRefresh,
}: JobCardRecruiterProps) {
  const [isPending, startTransition] = useTransition();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const isClosed = job.status === "closed";

  const handleStatusChange = (newStatus: JobStatus) => {
    startTransition(async () => {
      const result = await updateJobStatusClient(job.id, newStatus);
      if (result.error) alert(result.error);
      else onRefresh();
    });
  };

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicateJobClient(job.id);
      if (result.error) alert(result.error);
      else onRefresh();
    });
  };

  const handleClose = () => {
    startTransition(async () => {
      const result = await deleteJobClient(job.id);
      if (result.error) {
        alert(result.error);
      } else {
        onRefresh();
        setShowCloseConfirm(false);
      }
    });
  };

  return (
    <article className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-600">
            {job.company_data?.name ?? "Sin empresa"}
          </p>
          <h3 className="text-xl font-semibold text-brand-900">{job.title}</h3>
          <p className="text-sm text-brand-900/70">
            {job.location_data?.name ?? "Sin ubicación"}
          </p>
        </div>
        <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", STATUS_STYLES[job.status])}>
          {STATUS_DISPLAY[job.status]}
        </span>
      </header>

      <p className="mt-4 line-clamp-3 text-brand-900/80">{job.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-900">
          {job.applicants_count ?? 0} postulantes
        </span>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-900/70">
          {job.questions?.length ?? 0} preguntas
        </span>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-900/70">
          Creado: {new Date(job.created_at).toLocaleDateString("es-CR")}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-xs text-brand-900/70 sm:grid-cols-3">
        <div>
          <p className="text-brand-600">Activación</p>
          <p>{job.activate_at ? new Date(job.activate_at).toLocaleDateString("es-CR") : "Inmediata"}</p>
        </div>
        <div>
          <p className="text-brand-600">Desactivación</p>
          <p>{job.deactivated_at ? new Date(job.deactivated_at).toLocaleDateString("es-CR") : "N/A"}</p>
        </div>
        <div>
          <p className="text-brand-600">Cambiar estado</p>
          <select
            value={job.status}
            onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
            disabled={isPending || isClosed}
            className="mt-1 w-full rounded-xl border border-brand-200 bg-white px-2 py-1 text-xs disabled:opacity-50"
          >
            {(Object.keys(STATUS_DISPLAY) as JobStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_DISPLAY[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <footer className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => onEdit(job)}
          disabled={isPending || isClosed}
          className="rounded-2xl border border-transparent bg-white px-4 py-2 text-sm text-brand-900 shadow-[0_12px_30px_rgba(0,0,0,0.05)] disabled:opacity-50"
        >
          Editar
        </button>
        <button
          onClick={handleDuplicate}
          disabled={isPending || isClosed}
          className="rounded-2xl border border-transparent bg-white px-4 py-2 text-sm text-brand-900 shadow-[0_12px_30px_rgba(0,0,0,0.05)] disabled:opacity-50"
        >
          Duplicar
        </button>
        {isClosed ? (
          <button
            onClick={() => handleStatusChange("active")}
            disabled={isPending}
            className="rounded-2xl border border-transparent bg-brand-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.05)] disabled:opacity-50"
          >
            Reabrir
          </button>
        ) : (
          <button
            onClick={() => setShowCloseConfirm(true)}
            disabled={isPending}
            className="rounded-2xl border border-transparent bg-rose-50 px-4 py-2 text-sm text-rose-700 shadow-[0_12px_30px_rgba(0,0,0,0.05)] disabled:opacity-50"
          >
            Cerrar
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={() => onViewApplicants(job.id)}
          className="rounded-2xl bg-brand-400 px-4 py-2 text-sm font-semibold text-brand-50 shadow-[0_20px_55px_rgba(0,0,0,0.15)]"
        >
          Ver postulaciones
        </button>
      </footer>

      {showCloseConfirm &&
        createPortal(
          <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 px-4">
            <button
              className="absolute inset-0"
              onClick={() => setShowCloseConfirm(false)}
              aria-label="Cerrar modal"
            />
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-rose-600">Cerrar oferta</p>
                  <h4 className="mt-1 text-lg font-semibold text-brand-900">{job.title}</h4>
                </div>
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="rounded-full p-2 text-brand-400 transition hover:bg-brand-50 hover:text-brand-600"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
              <p className="mt-3 text-sm text-brand-800">
                Esta acción moverá la oferta a estado <strong>Cerrado</strong> y no recibirá nuevas postulaciones.
                Los datos existentes se conservarán para consulta interna.
              </p>
              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCloseConfirm(false)}
                  disabled={isPending}
                  className="rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
                >
                  {isPending ? "Cerrando..." : "Cerrar oferta"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </article>
  );
}
