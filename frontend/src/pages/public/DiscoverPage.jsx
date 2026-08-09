import { useCallback, useMemo } from "react";
import { useSongs } from "@/hooks/useSongs";
import { songService } from "@/services/songService";

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export default function DiscoverPage({ onPlay }) {
  const fetchDiscoverSongs = useCallback(() => songService.getDiscover(), []);

  const { data: songs, loading, error } = useSongs(fetchDiscoverSongs);

  const topCharts = useMemo(
    () => songs.slice().sort((a, b) => b.playCount - a.playCount).slice(0, 3),
    [songs]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/80">
        <div className="text-center">
          <div className="mb-3 animate-pulse">Loading Discover content...</div>
          <div className="h-1.5 w-48 bg-white/10 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-400">
        <div className="max-w-xl text-center px-6">
          <h1 className="text-2xl font-semibold mb-3">Không thể tải dữ liệu</h1>
          <p className="text-white/70">
            Có lỗi xảy ra khi lấy danh sách bài hát. Vui lòng thử lại sau.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-6 py-8 text-white">
      <section className="mb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/40">
              Discover
            </p>
            <h1 className="text-4xl font-bold mt-2">Nhạc mới hot hôm nay</h1>
            <p className="mt-3 max-w-2xl text-white/70">
              Khám phá danh sách bài hát mới nhất, nghe thử và phát ngay chỉ với
              một cú click.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topCharts.map((song, index) => (
              <div key={song.id} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden">
                    <img src={song.imgUrl} alt={song.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Top {index + 1}</p>
                    <h3 className="text-sm font-semibold text-white line-clamp-2">{song.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-white/50 mb-3">{song.artist}</p>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{song.genres?.slice(0, 2).join(', ')}</span>
                  <span>{song.playCount.toLocaleString()} lượt nghe</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {songs.map((song) => (
          <article
            key={song.id}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-violet-400/20"
          >
            <div className="relative overflow-hidden bg-slate-900">
              <img
                src={song.imgUrl}
                alt={song.title}
                className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-sm text-white/80">{song.artist}</p>
                <h2 className="text-xl font-semibold text-white line-clamp-2">
                  {song.title}
                </h2>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>{formatDuration(song.duration)}</span>
                <span>{song.genres?.slice(0, 2).join(", ")}</span>
              </div>
              <button
                type="button"
                onClick={() => onPlay?.(song)}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Play now
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
