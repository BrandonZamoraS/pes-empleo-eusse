"use client";

import { useEffect, useMemo, useState } from "react";
import { PROVINCES } from "@/lib/locations";
import { APPLICATION_STATUS_MAP, type ApplicationStatus } from "@/lib/constants";

type MetricsResponse = {
  totalApplications: number;
  byStatus: Record<string, number>;
  contactSLAHours: number | null;
  conversionContacted: number;
  conversionInReview: number;
  rejectedRatio: number;
  avgHoursReceivedToReview: number | null;
  avgHoursReviewToContact: number | null;
  withEducation: number;
  withExperience: number;
  byCompany: Record<string, number>;
  byProvince: Record<string, number>;
  rangeDays: number;
};

const STATUS_ORDER: ApplicationStatus[] = ["received", "in_review", "contacted", "rejected"];

const pct = (ratio: number) => `${Math.round((ratio || 0) * 100)}%`;

const formatHours = (hours: number | null | undefined) => {
  if (hours == null) return "Sin datos";
  if (hours < 0.1) return `${Math.max(1, Math.round(hours * 60))} min`;
  return `${hours.toFixed(1)} h`;
};

export default function MetricsContent() {
  const [range, setRange] = useState("30");
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/metrics?rangeDays=${range}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "No se pudieron cargar las métricas");
        } else {
          setData(json as MetricsResponse);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las métricas");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [range]);

  const provinceNames = useMemo(
    () => Object.fromEntries(PROVINCES.map((p) => [p.code.toString(), p.name])),
    []
  );

  const total = data?.totalApplications || 0;
  const coveragePct = (n = 0) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="space-y-6 text-brand-900">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
        <div>
          <h2 className="text-lg font-semibold text-brand-900">Indicadores clave</h2>
          <p className="text-sm text-brand-900/70">Datos reales del periodo seleccionado.</p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="rounded-2xl border border-transparent bg-brand-50 px-4 py-2 text-sm text-brand-900 outline-none focus:ring-2 focus:ring-brand-400/40"
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
        </select>
      </section>

      {loading && (
        <div className="rounded-3xl border border-dashed border-brand-200 bg-white p-6 text-sm text-brand-900/70 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          Cargando métricas...
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Total postulaciones" value={data.totalApplications} helper="Periodo seleccionado" />
            <MetricCard label="Conversión a contacto" value={pct(data.conversionContacted)} helper="Porcentaje en estado Contactado" />
            <MetricCard label="Conversión a revisión" value={pct(data.conversionInReview)} helper="Porcentaje en estado En revisión" />
            <MetricCard label="% Rechazadas" value={pct(data.rejectedRatio)} helper="Del total en el periodo" />
          </section>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Educación registrada" value={`${coveragePct(data.withEducation)}%`} helper={`${data.withEducation || 0} apps con educación`} />
            <MetricCard label="Experiencia registrada" value={`${coveragePct(data.withExperience)}%`} helper={`${data.withExperience || 0} apps con experiencia`} />
            <MetricCard label="Recibida → Revisión" value={formatHours(data.avgHoursReceivedToReview)} helper="Promedio apps en revisión" />
            <MetricCard
              label="Revisión → Contacto"
              value={formatHours(data.avgHoursReviewToContact)}
              helper={data.avgHoursReviewToContact == null ? "Sin registros de revisión a contacto en el periodo" : "Promedio entre revisión y contacto"}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card title="Postulaciones por empresa" subtitle="Conteo real en el periodo.">
              <DistributionList data={data.byCompany} labelSuffix="aplicaciones" />
            </Card>
            <Card title="Postulaciones por provincia" subtitle="Residencia de postulantes.">
              <DistributionList data={data.byProvince} labelSuffix="aplicaciones" nameMap={provinceNames} />
            </Card>
          </section>

          <section className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
            <h3 className="text-lg font-semibold text-brand-900">Embudo</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {STATUS_ORDER.map((status) => (
                <div key={status} className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-center">
                  <p className="text-sm font-semibold text-brand-900">{APPLICATION_STATUS_MAP[status]}</p>
                  <p className="mt-2 text-3xl font-bold text-brand-900">{data.byStatus[status] || 0}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
      <h3 className="text-lg font-semibold text-brand-900">{title}</h3>
      <p className="text-sm text-brand-900/70">{subtitle}</p>
      {children}
    </div>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <div className="rounded-2xl border border-transparent bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
      <p className="text-xs uppercase tracking-widest text-brand-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-brand-900">{value}</p>
      {helper && <p className="text-xs text-brand-900/60">{helper}</p>}
    </div>
  );
}

function DistributionList({
  data,
  labelSuffix,
  nameMap,
}: {
  data: Record<string, number>;
  labelSuffix: string;
  nameMap?: Record<string, string>;
}) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  const maxValue = entries[0]?.[1] ?? 0;

  if (entries.length === 0 || maxValue === 0) {
    return <p className="mt-4 text-sm text-brand-900/60">Sin datos en el periodo.</p>;
  }

  return (
    <div className="mt-6 space-y-4">
      {entries.map(([name, total]) => (
        <div key={name}>
          <div className="flex items-center justify-between text-sm text-brand-900/70">
            <span className="font-medium text-brand-900">{nameMap?.[name] || name}</span>
            <span>{total} {labelSuffix}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-brand-50">
            <div className="h-full rounded-full bg-brand-400" style={{ width: `${(total / maxValue) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
