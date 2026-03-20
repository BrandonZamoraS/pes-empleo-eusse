import { Skeleton } from "@/ui/components/skeleton";

export default function LoadingDashboardAdmin() {
  return (
    <main className="min-h-screen bg-brand-50 pb-12 text-brand-900">
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-14 text-center">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="mx-auto h-4 w-32 rounded-full" />
          <Skeleton className="mx-auto h-10 w-full max-w-xl" />
          <Skeleton className="mx-auto h-4 w-full max-w-2xl" />
        </div>
      </section>

      <nav className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-transparent bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-36 rounded-2xl" />
          ))}
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <div className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-11 w-full md:col-span-2" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)]"
          >
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="mt-3 h-8 w-1/2" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </div>
        ))}
      </section>
    </main>
  );
}

