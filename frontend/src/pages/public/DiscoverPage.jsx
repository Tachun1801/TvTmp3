import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, X } from "lucide-react";
import { useSongs } from "@/hooks/useSongs";
import { songService } from "@/services/songService";
import DiscoverSkeleton from "@/components/discover/DiscoverSkeleton";
import HorizontalRow from "@/components/discover/HorizontalRow";
import SectionHeader from "@/components/discover/SectionHeader";
import SongCard from "@/components/discover/SongCard";

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

function isRecentlyAdded(song) {
  const uploadedAt = new Date(song.uploadedAt);
  const days = (Date.now() - uploadedAt.getTime()) / (1000 * 60 * 60 * 24);
  return days <= 7;
}

export default function DiscoverPage({ onPlay }) {
  const [sortMode, setSortMode] = useState("latest");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedMood, setSelectedMood] = useState("chill");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedQuery(searchQuery.trim().toLowerCase()),
      300,
    );
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDiscoverSongs = useCallback(() => songService.getDiscover(), []);
  const { data: songs, loading, error } = useSongs(fetchDiscoverSongs);

  const genres = useMemo(() => {
    const uniqueGenres = new Set();
    songs.forEach((song) =>
      song.genres?.forEach((genre) => uniqueGenres.add(genre)),
    );
    return ["All", ...Array.from(uniqueGenres).sort()];
  }, [songs]);

  const topCharts = useMemo(
    () =>
      [...songs]
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 8),
    [songs],
  );

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

  const activeMood =
    moodOptions.find((option) => option.key === selectedMood) ?? moodOptions[0];

  const moodSongs = useMemo(() => {
    const genreSet = new Set(activeMood.genres);
    return songs
      .filter((song) => song.genres?.some((genre) => genreSet.has(genre)))
      .slice(0, 12);
  }, [activeMood, songs]);

  const recommendedGenre = featuredGenres[0] ?? "Pop";
  const genreRecommendationSongs = useMemo(
    () =>
      songs
        .filter((song) => song.genres?.includes(recommendedGenre))
        .slice(0, 12),
    [recommendedGenre, songs],
  );

  const recentSongs = useMemo(
    () => songs.filter(isRecentlyAdded).slice(0, 12),
    [songs],
  );

  const catalogSongs = useMemo(() => {
    let result = songs.slice();
    if (selectedGenre !== "All") {
      result = result.filter((song) => song.genres?.includes(selectedGenre));
    }
    if (sortMode === "popular") {
      result.sort((a, b) => b.playCount - a.playCount);
    } else {
      result.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    }
    return result;
  }, [songs, selectedGenre, sortMode]);

  const displaySongs = useMemo(() => {
    if (!debouncedQuery) {
      return catalogSongs;
    }
    return catalogSongs.filter((song) => {
      const title = song.title?.toLowerCase() ?? "";
      const artist = song.artist?.toLowerCase() ?? "";
      const genresText = song.genres?.join(" ").toLowerCase() ?? "";
      return (
        title.includes(debouncedQuery) ||
        artist.includes(debouncedQuery) ||
        genresText.includes(debouncedQuery)
      );
    });
  }, [debouncedQuery, catalogSongs]);

  const heroTrack = topCharts[0] ?? songs[0];
  const hasActiveFilters =
    selectedGenre !== "All" || sortMode !== "latest" || debouncedQuery;

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSelectedGenre("All");
    setSortMode("latest");
  };

  const handlePlayMoodPlaylist = () => {
    if (moodSongs[0]) {
      onPlay?.(moodSongs[0]);
    }
  };

  if (loading) {
    return <DiscoverSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-red-400">
        <div className="max-w-xl px-6 text-center">
          <h1 className="mb-3 text-2xl font-semibold">Không thể tải dữ liệu</h1>
          <p className="text-white/70">
            Có lỗi xảy ra khi lấy danh sách bài hát. Vui lòng thử lại sau.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden text-white">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0f0520]/90 px-6 py-4 backdrop-blur-xl">
        <div className="relative mb-3">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm bài hát, nghệ sĩ hoặc thể loại..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-cyan-300 focus:bg-white/10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Xóa tìm kiếm"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="scrollbar-hide flex flex-1 gap-2 overflow-x-auto pb-1">
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(genre)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  selectedGenre === genre
                    ? "bg-cyan-400 text-black"
                    : "bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 gap-2">
            {["latest", "popular"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSortMode(mode)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  sortMode === mode
                    ? "bg-violet-500 text-black"
                    : "bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {mode === "latest" ? "Mới nhất" : "Nổi bật"}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-2 text-xs text-white/40">
          Bộ lọc chỉ áp dụng cho danh sách &quot;Khám phá tất cả&quot; bên dưới
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <section className="mb-10">
          <p className="text-sm uppercase tracking-[0.4em] text-white/40">
            Discover
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">
            Dành cho bạn hôm nay
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/70">
            Nghe ngay, chọn đúng tâm trạng và khám phá những bài hát mới.
          </p>

          <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_30%),linear-gradient(90deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200/80">
                  Bài đang hot
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {heroTrack?.title ?? "Khám phá bài hát mới"}
                  </h2>
                  <p className="max-w-xl leading-7 text-white/70">
                    {heroTrack
                      ? `${heroTrack.artist} • ${heroTrack.genres?.slice(0, 2).join(" • ")}`
                      : "Cập nhật nhanh những ca khúc được nghe nhiều nhất."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onPlay?.(heroTrack)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
                  >
                    <Play size={16} className="fill-black" />
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
              <button
                type="button"
                onClick={() => onPlay?.(heroTrack)}
                aria-label={`Phát ${heroTrack?.title}`}
                className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/40 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
              >
                <img
                  src={
                    heroTrack?.imgUrl ??
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={heroTrack?.title ?? "Featured song"}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover brightness-90 transition duration-300 group-hover:scale-105 lg:aspect-auto lg:h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/40">
                    <Play size={24} className="ml-0.5 fill-black text-black" />
                  </span>
                </div>
                <div className="absolute bottom-5 left-5 text-white">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Top nghe nhiều
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">
                    {heroTrack?.artist ?? "Featured Artist"}
                  </h3>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <SectionHeader
            eyebrow="Tâm trạng"
            title="Chọn một cảm xúc để bắt đầu"
            description={activeMood.description}
            action={
              moodSongs.length > 0 ? (
                <button
                  type="button"
                  onClick={handlePlayMoodPlaylist}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <Play size={14} className="fill-white" />
                  Phát playlist
                </button>
              ) : null
            }
          />

          <div className="mb-4 flex flex-wrap gap-2">
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

          {moodSongs.length === 0 ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-center text-white/70">
              Chưa có bài phù hợp cho tâm trạng này.
            </div>
          ) : (
            <HorizontalRow>
              {moodSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPlay={onPlay}
                  variant="compact"
                />
              ))}
            </HorizontalRow>
          )}
        </section>

        <section className="mb-10">
          <SectionHeader
            eyebrow="Top Việt Nam"
            title="Top nghe nhiều hôm nay"
            action={
              <button
                type="button"
                onClick={() => navigate("/charts")}
                className="shrink-0 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
              >
                Xem thêm
              </button>
            }
          />
          <HorizontalRow>
            {topCharts.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={onPlay}
                variant="rank"
                rank={`#${index + 1}`}
              />
            ))}
          </HorizontalRow>
        </section>

        {recentSongs.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              eyebrow="Mới phát hành"
              title="Nhạc mới trong 7 ngày"
              description={`${recentSongs.length} bài`}
            />
            <HorizontalRow>
              {recentSongs.map((song) => (
                <SongCard key={song.id} song={song} onPlay={onPlay} />
              ))}
            </HorizontalRow>
          </section>
        )}

        <section className="mb-10">
          <SectionHeader
            eyebrow="Khám phá theo thể loại"
            title={`Thể loại nổi bật: ${recommendedGenre}`}
            action={
              <button
                type="button"
                onClick={() => navigate("/genres")}
                className="shrink-0 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
              >
                Xem tất cả thể loại
              </button>
            }
          />
          <HorizontalRow>
            {genreRecommendationSongs.map((song) => (
              <SongCard key={song.id} song={song} onPlay={onPlay} />
            ))}
          </HorizontalRow>
        </section>

        <section className="pb-4">
          <SectionHeader
            eyebrow="Khám phá"
            title={
              debouncedQuery ? "Kết quả tìm kiếm" : "Khám phá tất cả bài hát"
            }
            description={`${displaySongs.length} bài hát`}
          />

          {displaySongs.length === 0 ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center">
              <p className="text-lg font-semibold text-white">
                Không tìm thấy bài hát nào khớp.
              </p>
              <p className="mt-3 text-sm text-white/70">
                Thử thay đổi từ khóa hoặc bộ lọc để mở rộng khám phá.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-black transition hover:bg-cyan-300"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {displaySongs.map((song) => (
                <SongCard key={song.id} song={song} onPlay={onPlay} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
