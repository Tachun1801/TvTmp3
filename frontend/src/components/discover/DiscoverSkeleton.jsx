export default function DiscoverSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto px-6 py-8 text-white">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-72 animate-pulse rounded-lg bg-white/10" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-white/10" />
      </div>

      <div className="mb-10 h-64 animate-pulse rounded-[2rem] border border-white/10 bg-white/5" />

      {[1, 2, 3].map((section) => (
        <div key={section} className="mb-8">
          <div className="mb-4 h-7 w-48 animate-pulse rounded bg-white/10" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((card) => (
              <div
                key={card}
                className="w-[180px] shrink-0 animate-pulse space-y-3"
              >
                <div className="aspect-square rounded-2xl bg-white/10" />
                <div className="h-4 w-3/4 rounded bg-white/10" />
                <div className="h-3 w-1/2 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
