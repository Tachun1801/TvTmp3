import { useCallback, useMemo, useState } from "react";
import { useSongs } from "@/hooks/useSongs";
import { songService } from "@/services/songService";

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export default function DiscoverPage({ currentTrack, onPlay }) {
  const [sortMode, setSortMode] = useState("latest");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const fetchDiscoverSongs = useCallback(() => songService.getDiscover(), []);

  const { data: songs, loading, error } = useSongs(fetchDiscoverSongs);

  const genres = useMemo(() => {
    const uniqueGenres = new Set();
    songs.forEach((song) =>
      song.genres?.forEach((genre) => uniqueGenres.add(genre)),
    );
    return ["All", ...Array.from(uniqueGenres).sort()];
  }, [songs]);

  const filteredSongs = useMemo(() => {
    if (selectedGenre === "All") {
      return songs;
    }
    return songs.filter((song) => song.genres?.includes(selectedGenre));
  }, [songs, selectedGenre]);

  const sortedSongs = useMemo(() => {
    const base = filteredSongs.slice();
    if (sortMode === "popular") {
      return base.sort((a, b) => b.playCount - a.playCount);
    }
    return base.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  }, [filteredSongs, sortMode]);

  const searchedSongs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return sortedSongs;
    }
    return sortedSongs.filter((song) => {
      const title = song.title?.toLowerCase() ?? "";
      const artist = song.artist?.toLowerCase() ?? "";
      const genresText = song.genres?.join(" ").toLowerCase() ?? "";
      return (
        title.includes(query) ||
        artist.includes(query) ||
        genresText.includes(query)
      );
    });
  }, [searchQuery, sortedSongs]);

  const topCharts = useMemo(
    () =>
      sortedSongs
        .slice()
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 3),
    [sortedSongs],
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
      <section className="mb-10">
        <div className="grid gap-10 xl:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/40">
              Discover
            </p>
            <h1 className="text-5xl font-bold mt-2 leading-tight">
              Nhạc mới hot hôm nay
            </h1>
            <p className="mt-3 max-w-2xl text-white/70 text-lg">
              Khám phá danh sách bài hát mới nhất, nghe thử và phát ngay chỉ với
              một cú click.
            </p>

            <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_30%),linear-gradient(90deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr] xl:items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200/80 shadow-sm shadow-cyan-500/10">
                    Gợi ý hôm nay
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-4xl font-semibold tracking-tight">
                      {topCharts[0]?.title ?? "Khám phá giai điệu đang thịnh hành"}
                    </h2>
                    <p className="max-w-xl text-white/70 leading-7">
                      {topCharts[0]
                        ? "Bài hát được nghe nhiều nhất hôm nay, được người dùng yêu thích."
                        : "Cập nhật nhanh những ca khúc mới nhất cho mọi tâm trạng."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onPlay?.(topCharts[0] || sortedSongs[0] || songs[0])}
                      className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
                    >
                      Phát ngay
                    </button>
                    <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/70">
                      {sortedSongs.length} bài hát trong danh sách
                    </span>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/40 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                  <img
                    src={topCharts[0]?.imgUrl ?? "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"}
                    alt={topCharts[0]?.title ?? "Featured song"}
                    className="h-full w-full object-cover brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute left-5 bottom-5 text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">Top chart</p>
                    <h3 className="mt-2 text-2xl font-semibold">
                      {topCharts[0]?.artist ?? "Featured Artist"}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <div className="relative mb-4">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm bài hát, nghệ sĩ hoặc thể loại..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-cyan-300 focus:bg-white/10"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50">🔍</span>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setSelectedGenre(genre)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedGenre === genre
                        ? "bg-cyan-400 text-black"
                        : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              <div className="mb-4 text-sm text-white/60">
                {searchedSongs.length} bài hát phù hợp với filter và tìm kiếm
              </div>
              <div className="flex flex-wrap gap-2">
                {["latest", "popular"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSortMode(mode)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      sortMode === mode
                        ? "bg-violet-500 text-black"
                        : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    {mode === "latest" ? "Latest" : "Popular"}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Top Charts</p>
            <h2 className="text-2xl font-semibold text-white">Những ca khúc được nghe nhiều nhất</h2>
          </div>
          <p className="text-sm text-white/60">Thứ tự theo lượt nghe và bộ lọc hiện tại</p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {topCharts.map((song, index) => (
            <div
              key={song.id}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_25px_70px_rgba(0,0,0,0.24)] transition hover:-translate-y-1 hover:border-cyan-300"
            >
              <div className="absolute left-5 top-5 rounded-full bg-cyan-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100 shadow-sm shadow-cyan-500/10">
                #{index + 1}
              </div>
              <div className="flex gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-[1.5rem] bg-slate-900">
                  <img
                    src={song.imgUrl}
                    alt={song.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/50">Top {index + 1}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white line-clamp-2">
                    {song.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/60">{song.artist}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/50">
                    <span>{song.genres?.slice(0, 2).join(", ")}</span>
                    <span>•</span>
                    <span>{song.playCount.toLocaleString()} lượt nghe</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Hot</div>
                <button
                  type="button"
                  onClick={() => onPlay?.(song)}
                  className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-300"
                >
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {searchedSongs.map((song) => (
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
                className={`inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  currentTrack?.id === song.id
                    ? "bg-cyan-400 text-black"
                    : "bg-violet-500 text-white hover:bg-violet-400"
                }`}
              >
                {currentTrack?.id === song.id ? "Playing" : "Play now"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
