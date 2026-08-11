export default function RecentlyPlayedSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto px-6 py-8 text-white">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-64 animate-pulse rounded-lg bg-white/10" />
        <div className="h-5 w-80 max-w-full animate-pulse rounded bg-white/10" />
      </div>

      <div className="mb-10 h-36 animate-pulse rounded-[2rem] border border-white/10 bg-white/5" />

      <div className="mb-8">
        <div className="mb-4 h-7 w-40 animate-pulse rounded bg-white/10" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="w-[200px] shrink-0 animate-pulse space-y-3">
              <div className="aspect-square rounded-2xl bg-white/10" />
              <div className="h-4 w-3/4 rounded bg-white/10" />
              <div className="h-3 w-1/2 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="flex animate-pulse items-center gap-4 rounded-2xl bg-white/5 p-3"
          >
            <div className="h-14 w-14 rounded-xl bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded bg-white/10" />
              <div className="h-3 w-1/3 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
