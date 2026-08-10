import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSongs } from "@/hooks/useSongs";
import { songService } from "@/services/songService";

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

const moodOptions = [
  {
    key: "chill",
    label: "Chill",
    description: "Nhạc thư giãn buổi tối",
    genres: ["Acoustic", "Ballad", "Indie"],
  },
  {
    key: "focus",
    label: "Tập trung",
    description: "Giai điệu nhẹ để làm việc",
    genres: ["Indie", "Acoustic", "Pop"],
  },
  {
    key: "drive",
    label: "Đi đường",
    description: "Beat sôi động cho chuyến đi",
    genres: ["Pop", "Dance", "EDM"],
  },
  {
    key: "party",
    label: "Party",
    description: "Nhạc năng lượng cao",
    genres: ["Dance", "EDM", "Pop"],
  },
  {
    key: "sad",
    label: "Buồn",
    description: "Nhạc chậm và sâu lắng",
    genres: ["Ballad", "R&B"],
  },
];

export default function DiscoverPage({ onPlay }) {
  const [sortMode, setSortMode] = useState("latest");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedMood, setSelectedMood] = useState("chill");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

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
      base.sort((a, b) => b.playCount - a.playCount);
    } else {
      base.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    }
    return base;
  }, [filteredSongs, sortMode]);

  const featuredGenres = useMemo(() => {
    const countByGenre = new Map();
    songs.forEach((song) =>
      song.genres?.forEach((genre) => {
        countByGenre.set(genre, (countByGenre.get(genre) ?? 0) + 1);
      }),
    );
    return Array.from(countByGenre.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([genre]) => genre);
  }, [songs]);

  const topCharts = useMemo(
    () => sortedSongs.slice().sort((a, b) => b.playCount - a.playCount).slice(0, 4),
    [sortedSongs],
  );

  const activeMood =
    moodOptions.find((option) => option.key === selectedMood) ?? moodOptions[0];

  const moodSongs = useMemo(() => {
    const genreSet = new Set(activeMood.genres);
    return sortedSongs
      .filter((song) => song.genres?.some((genre) => genreSet.has(genre)))
      .slice(0, 4);
  }, [activeMood, sortedSongs]);

  const recommendedGenre = featuredGenres[0] ?? "Pop";
  const genreRecommendationSongs = useMemo(() => {
    return sortedSongs
      .filter((song) => song.genres?.includes(recommendedGenre))
      .slice(0, 4);
  }, [recommendedGenre, sortedSongs]);

  const isRecentlyAdded = (song) => {
    const uploadedAt = new Date(song.uploadedAt);
    const days = (Date.now() - uploadedAt.getTime()) / (1000 * 60 * 60 * 24);
    return days <= 7;
  };

  const recentSongs = useMemo(
    () => sortedSongs.filter(isRecentlyAdded).slice(0, 4),
    [sortedSongs],
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchedSongs = useMemo(() => {
    if (!normalizedQuery) {
      return sortedSongs;
    }
    return sortedSongs.filter((song) => {
      const title = song.title?.toLowerCase() ?? "";
      const artist = song.artist?.toLowerCase() ?? "";
      const genresText = song.genres?.join(" ").toLowerCase() ?? "";
      return title.includes(normalizedQuery) || artist.includes(normalizedQuery) || genresText.includes(normalizedQuery);
    });
  }, [normalizedQuery, sortedSongs]);

  const showSearchResults = Boolean(normalizedQuery || searchTriggered);
  const displaySongs = showSearchResults ? searchedSongs : sortedSongs.slice(0, 8);
  const heroTrack = topCharts[0] ?? sortedSongs[0] ?? songs[0];

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
        <div className="grid gap-10 xl:grid-cols-[1.45fr_1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/40">Discover</p>
            <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">
              Dành cho bạn hôm nay
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-white/70">
              Một trải nghiệm khám phá ngắn gọn: nghe ngay, tìm nhanh và chọn đúng tâm trạng.
            </p>

            <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_30%),linear-gradient(90deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200/80 shadow-sm shadow-cyan-500/10">
                    Mix hôm nay
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                      {heroTrack?.title ?? "Khám phá một bản mix mới"}
                    </h2>
                    <p className="max-w-xl text-white/70 leading-7">
                      {heroTrack
                        ? `${heroTrack.artist} • ${heroTrack.genres?.slice(0, 2).join(" • ")}`
                        : "Cập nhật nhanh những ca khúc mới nhất cho nhiều tâm trạng."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onPlay?.(heroTrack)}
                      className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
                    >
                      Phát ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/charts")}
                      className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      Xem bảng xếp hạng
                    </button>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/40 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                  <img
                    src={heroTrack?.imgUrl ?? "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"}
                    alt={heroTrack?.title ?? "Featured song"}
                    className="h-full w-full object-cover brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute left-5 bottom-5 text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">Top hôm nay</p>
                    <h3 className="mt-2 text-2xl font-semibold">{heroTrack?.artist ?? "Featured Artist"}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <div className="relative mb-4">
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchTriggered(false);
                  }}
                  placeholder="Tìm bài hát, nghệ sĩ hoặc thể loại..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-24 text-sm text-white outline-none transition focus:border-cyan-300 focus:bg-white/10"
                />
                <button
                  type="button"
                  onClick={() => {
                    searchInputRef.current?.focus();
                    setSearchTriggered(true);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                >
                  Tìm
                </button>
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

              <div className="flex flex-wrap gap-2">
                {['latest', 'popular'].map((mode) => (
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
                    {mode === 'latest' ? 'Mới nhất' : 'Nổi bật'}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mb-8 rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Tâm trạng</p>
            <h2 className="text-2xl font-semibold text-white">Chọn một cảm xúc để bắt đầu</h2>
          </div>
          <p className="text-sm text-white/60">{activeMood.description}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {moodOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSelectedMood(option.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedMood === option.key
                  ? "bg-cyan-400 text-black"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {moodSongs.length === 0 ? (
            <div className="col-span-full rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-center text-white/70">
              Chưa có bài phù hợp cho tâm trạng này.
            </div>
          ) : (
            moodSongs.map((song) => (
              <article key={song.id} className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-4">
                <div className="flex items-center gap-3">
                  <img src={song.imgUrl} alt={song.title} className="h-12 w-12 rounded-2xl object-cover" />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-white">{song.title}</h3>
                    <p className="truncate text-xs text-white/60">{song.artist}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onPlay?.(song)}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-300"
                >
                  Phát
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">Top Việt Nam</p>
              <h2 className="text-2xl font-semibold text-white">Top nghe nhiều hôm nay</h2>
            </div>
            <button type="button" onClick={() => navigate("/charts")} className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100">
              Xem thêm
            </button>
          </div>
          <div className="mt-6 space-y-3">
            {topCharts.map((song, index) => (
              <div key={song.id} className="flex items-center justify-between rounded-[1.25rem] bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-cyan-200">#{index + 1}</span>
                  <div>
                    <p className="font-semibold text-white">{song.title}</p>
                    <p className="text-sm text-white/60">{song.artist}</p>
                  </div>
                </div>
                <button type="button" onClick={() => onPlay?.(song)} className="rounded-full bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15">
                  Phát
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">Mới phát hành</p>
              <h2 className="text-2xl font-semibold text-white">Nhạc mới trong 7 ngày</h2>
            </div>
            <p className="text-sm text-white/60">{recentSongs.length} bài</p>
          </div>
          <div className="mt-6 grid gap-3">
            {recentSongs.map((song) => (
              <div key={song.id} className="flex items-center justify-between rounded-[1.25rem] bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <img src={song.imgUrl} alt={song.title} className="h-11 w-11 rounded-xl object-cover" />
                  <div>
                    <p className="font-semibold text-white">{song.title}</p>
                    <p className="text-sm text-white/60">{song.artist}</p>
                  </div>
                </div>
                <button type="button" onClick={() => onPlay?.(song)} className="rounded-full bg-cyan-400/90 px-3 py-2 text-sm font-semibold text-black transition hover:bg-cyan-300">
                  Phát
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Khám phá theo thể loại</p>
            <h2 className="text-2xl font-semibold text-white">Vì bạn đã nghe {recommendedGenre}</h2>
          </div>
          <button type="button" onClick={() => navigate("/genres")} className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100">
            Xem tất cả thể loại
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {genreRecommendationSongs.map((song) => (
            <article key={song.id} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-4">
              <img src={song.imgUrl} alt={song.title} className="h-32 w-full rounded-[1.2rem] object-cover" />
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white">{song.title}</h3>
                <p className="mt-1 text-sm text-white/60">{song.artist}</p>
              </div>
              <button type="button" onClick={() => onPlay?.(song)} className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-300">
                Phát
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Khám phá</p>
            <h2 className="text-2xl font-semibold text-white">
              {showSearchResults ? "Kết quả tìm kiếm" : "Khám phá toàn bộ bài hát"}
            </h2>
          </div>
          <p className="text-sm text-white/60">{displaySongs.length} bài hát đang hiển thị</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {displaySongs.length === 0 ? (
            <div className="col-span-full rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center text-white/80">
              <p className="text-lg font-semibold text-white">Không tìm thấy bài hát nào khớp.</p>
              <p className="mt-3 text-sm text-white/70">Thử thay đổi từ khóa hoặc bộ lọc để mở rộng khám phá.</p>
            </div>
          ) : (
            displaySongs.map((song) => (
              <article key={song.id} className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 transition hover:border-cyan-300">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-800">
                    <img src={song.imgUrl} alt={song.title} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white line-clamp-2">{song.title}</h3>
                    <p className="text-sm text-white/60">{song.artist}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-white/50">
                  <span>{formatDuration(song.duration)}</span>
                  <span>{song.playCount.toLocaleString()} lượt nghe</span>
                </div>
                <button type="button" onClick={() => onPlay?.(song)} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300">
                  Phát bài hát
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
