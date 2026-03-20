import { Skeleton } from "@/ui/components/skeleton";

export default function LoadingResumesAdmin() {
  return (
    <div className="space-y-6 text-brand-900">
      <section className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-11 min-w-55 flex-1" />
          <Skeleton className="h-11 w-28" />
          <Skeleton className="h-11 w-32" />
          <Skeleton className="h-11 w-44" />
        </div>
      </section>

      <section className="space-y-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)]"
          >
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="mt-3 h-7 w-2/3" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </div>
        ))}
      </section>
    </div>
  );
}
