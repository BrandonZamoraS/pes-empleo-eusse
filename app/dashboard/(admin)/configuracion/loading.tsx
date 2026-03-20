import { Skeleton } from "@/ui/components/skeleton";

export default function LoadingConfiguracionAdmin() {
  return (
    <div className="space-y-6 text-brand-900">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-32 rounded-2xl" />
        ))}
      </div>

      <section className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </section>

      <section className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
        <Skeleton className="h-7 w-48" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}

