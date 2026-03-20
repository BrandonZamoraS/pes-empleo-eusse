import { Skeleton } from "@/ui/components/skeleton";

export default function LoadingBuscarEmpleos() {
  return (
    <main className="min-h-screen bg-brand-50 pb-16 text-brand-900">
      <section className="bg-linear-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-3xl space-y-4">
            <Skeleton className="h-4 w-52 rounded-full" />
            <Skeleton className="h-14 w-full max-w-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-4">
        <div className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl space-y-5 px-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="w-full max-w-48 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-4/5" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

