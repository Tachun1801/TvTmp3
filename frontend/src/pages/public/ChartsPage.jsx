import { useCallback, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Ellipsis,
  Heart,
  Play,
  Sparkles,
} from "lucide-react";
import { useSongs } from "@/hooks/useSongs";
import { songService } from "@/services/songService";

const chartTabs = [
  { key: "alltime", label: "Tổng hợp" },
  { key: "weekly", label: "Tuần" },
  { key: "monthly", label: "Tháng" },
];

function formatDuration(seconds = 0) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatCompactNumber(value = 0) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toString();
}

export default function ChartsPage({ onPlay }) {
  const [selectedTab, setSelectedTab] = useState("alltime");

  const fetchCharts = useCallback(
    () => songService.getCharts(selectedTab),
    [selectedTab],
  );

  const { data: songs, loading, error } = useSongs(fetchCharts);

  const rankedSongs = useMemo(
    () => [...(songs ?? [])].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999)),
    [songs],
  );

  const [favoriteIds, setFavoriteIds] = useState(() => new Set());

  const topThree = rankedSongs.slice(0, 3);
  const restSongs = rankedSongs.slice(3);
  const heroTrack = rankedSongs[0] ?? null;

  const toggleFavorite = (songId) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
  };

  const rankColors = [
    "bg-gradient-to-br from-[#fbbf24] via-[#f59e0b] to-[#d97706] text-[#1f1200]",
    "bg-gradient-to-br from-[#c084fc] via-[#8b5cf6] to-[#6d28d9] text-white",
    "bg-gradient-to-br from-[#fca5a5] via-[#fb7185] to-[#e11d48] text-white",
  ];

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#12081f] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400" />
          <p className="text-sm text-white/70">Đang tải bảng xếp hạng...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#12081f] text-white">
        <div className="max-w-md rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-xl font-semibold">Không tải được dữ liệu</p>
          <p className="mt-2 text-sm text-white/70">
            Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-[#12081f] text-white">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-7 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Quay lại"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">
                  TvTchart
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
                  Bảng xếp hạng
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <Sparkles size={16} className="text-cyan-300" />
                Mới cập nhật
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-[#180a2d] transition hover:bg-cyan-300"
                onClick={() => heroTrack && onPlay?.(heroTrack)}
              >
                <Play size={16} className="fill-current" />
                Phát tất cả
              </button>
            </div>
          </header>

          <div className="mb-7 flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-sm">
            {chartTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedTab === tab.key
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                    : "text-white/65 hover:bg-white/8 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-[#1a0d2a]/90 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <div className="space-y-2">
              {rankedSongs.slice(0, 10).map((song, index) => (
                <div
                  key={song.id}
                  className="group flex w-full items-center gap-4 rounded-[1.2rem] px-3 py-3 transition hover:bg-white/5"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${
                      index === 0
                        ? "bg-gradient-to-br from-[#f7d365] to-[#f59e0b] text-[#1a0d2a]"
                        : index === 1
                          ? "bg-gradient-to-br from-[#c084fc] to-[#8b5cf6] text-white"
                          : index === 2
                            ? "bg-gradient-to-br from-[#fca5a5] to-[#fb7185] text-white"
                            : "bg-[#12081f] text-white/80"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <button
                    type="button"
                    onClick={() => onPlay?.(song)}
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={song.imgUrl}
                        alt={song.title}
                        className="h-16 w-16 rounded-xl object-cover shadow-md shadow-black/25"
                      />
                      <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/15 opacity-0 transition group-hover:opacity-100">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
                          <Play size={14} className="ml-0.5 fill-current" />
                        </span>
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-base font-semibold text-white">
                        {song.title}
                      </p>
                      <p className="mt-1 line-clamp-1 text-sm text-white/60">
                        {song.artist}
                      </p>
                    </div>
                  </button>

                  <div className="hidden min-w-[130px] text-right text-sm text-white/60 md:block">
                    {song.title}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <span>{formatDuration(song.duration)}</span>
                    <button
                      type="button"
                      aria-label={`Yêu thích ${song.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavorite(song.id);
                      }}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                        favoriteIds.has(song.id)
                          ? "border-pink-400 bg-pink-500/20 text-pink-300"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Heart
                        size={15}
                        className={favoriteIds.has(song.id) ? "fill-current" : ""}
                      />
                    </button>
                    <button
                      type="button"
                      aria-label={`Tùy chọn ${song.title}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      <Ellipsis size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}