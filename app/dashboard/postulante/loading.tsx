import { Skeleton } from "@/ui/components/skeleton";

export default function LoadingDashboardPostulante() {
  return (
    <main className="min-h-screen bg-brand-50 pb-16 text-brand-900">
      <div className="mx-auto max-w-6xl px-4 pt-12">
        <header className="rounded-3xl border border-transparent bg-white p-8 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-4">
              <Skeleton className="h-4 w-44 rounded-full" />
              <Skeleton className="h-10 w-80 max-w-full" />
              <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-11 w-44" />
              <Skeleton className="h-11 w-44" />
            </div>
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-transparent bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)]"
            >
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="mt-3 h-10 w-16" />
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)] lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-3">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-60" />
              </div>
              <Skeleton className="h-11 w-44" />
            </div>
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="rounded-2xl bg-brand-50 p-4">
                  <Skeleton className="h-4 w-32 rounded-full" />
                  <Skeleton className="mt-3 h-7 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="mt-4 h-40 w-full" />
            <Skeleton className="mt-4 h-11 w-full" />
          </div>
        </section>
      </div>
    </main>
  );
}

