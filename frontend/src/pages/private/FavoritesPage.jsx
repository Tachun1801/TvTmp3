import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Heart,
  Music2,
  Play,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { getFavorites, removeFavorite } from '@/api/favoriteApi';
import SectionHeader from '@/components/discover/SectionHeader';
import HorizontalRow from '@/components/discover/HorizontalRow';
import SongCard from '@/components/discover/SongCard';

function formatCount(value) {
  return value?.toLocaleString('en-US') ?? '0';
}

export default function FavoritesPage({ onPlay }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getFavorites();
      setSongs(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredSongs = useMemo(() => {
    if (!normalizedQuery) return songs;

    return songs.filter(({ title, artist, genres = [] }) => {
      const haystack = `${title} ${artist} ${genres.join(' ')}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, songs]);

  const heroSong = filteredSongs[0] ?? songs[0];
  const quickPicks = filteredSongs.slice(0, 6);

  const handlePlayAll = () => {
    if (heroSong) onPlay?.(heroSong);
  };

  const handleRemoveFavorite = async (songId) => {
    setRemovingId(songId);
    try {
      await removeFavorite(songId);
      setSongs((current) => current.filter((song) => song.id !== songId));
    } catch (err) {
      setError(err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto px-6 py-8 text-white">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-28 rounded-full bg-white/10" />
          <div className="h-12 w-72 rounded-2xl bg-white/10" />
          <div className="h-32 rounded-[2rem] bg-white/5" />
          <div className="h-12 rounded-2xl bg-white/5" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-64 rounded-3xl bg-white/5" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12 text-white">
        <div className="max-w-xl rounded-[2rem] border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-red-300">Favorite songs</p>
          <h1 className="text-3xl font-bold">Không thể tải danh sách yêu thích</h1>
          <p className="mt-3 text-white/70">
            Có lỗi xảy ra khi lấy dữ liệu bài hát yêu thích. Vui lòng thử lại sau.
          </p>
          <button
            type="button"
            onClick={fetchFavorites}
            className="mt-6 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
          >
            Thử lại
          </button>
        </div>
      </main>
    );
  }

  if (songs.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-white">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-pink-400/30 bg-pink-500/10">
            <Heart size={32} className="text-pink-300" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold">Chưa có bài hát yêu thích</h1>
          <p className="mt-3 text-white/60">
            Hãy lưu những bài hát bạn thích để xem lại nhanh chóng ở đây.
          </p>
          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-400"
          >
            <Compass size={16} />
            Khám phá nhạc
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-6 py-8 text-white">
      <section className="mb-8">
        <p className="text-sm uppercase tracking-[0.4em] text-pink-200/70">Thư viện cá nhân</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">Favorite Songs</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/70">
          Những bài hát bạn đã lưu yêu thích và muốn nghe lại bất cứ lúc nào.
        </p>
      </section>

      <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),_transparent_30%),linear-gradient(90deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.02))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {heroSong && (
              <img
                src={heroSong.imgUrl}
                alt={heroSong.title}
                className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-lg shadow-pink-500/20"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-200/80">Bài yêu thích nhất</p>
              <h2 className="mt-2 truncate text-2xl font-semibold">{heroSong?.title ?? 'Favorite songs'}</h2>
              <p className="truncate text-white/70">{heroSong?.artist}</p>
              <p className="mt-2 text-sm text-white/50">
                {formatCount(filteredSongs.length)} bài • {formatCount(quickPicks.length)} đang hiển thị
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePlayAll}
              className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-400"
            >
              <Play size={16} className="fill-white" />
              Phát lại
            </button>
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <Compass size={16} />
              Khám phá thêm
            </button>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="relative mb-6">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm bài hát, nghệ sĩ hoặc thể loại..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-10 text-sm text-white outline-none transition focus:border-pink-300 focus:bg-white/10"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Xóa tìm kiếm"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {quickPicks.length > 0 && (
          <>
            <SectionHeader
              eyebrow="Yêu thích nhanh"
              title="Bài hát bạn đang thích"
              description="Bộ sưu tập ngắn gọn để lướt nhanh"
            />
            <HorizontalRow className="mb-8">
              {quickPicks.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPlay={onPlay}
                  variant="compact"
                />
              ))}
            </HorizontalRow>
          </>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music2 size={18} className="text-pink-300" />
            <p className="text-sm text-white/60">
              {filteredSongs.length} bài hát yêu thích
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60">
            <Sparkles size={12} className="text-pink-300" />
            Sẵn sàng phát
          </div>
        </div>

        {filteredSongs.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 px-6 py-16 text-center">
            <p className="text-xl font-semibold text-white">Không tìm thấy bài hát nào</p>
            <p className="mt-2 text-white/60">Hãy thử từ khóa khác hoặc xóa bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-3 transition hover:border-pink-300/40 hover:bg-white/10"
              >
                <div className="relative mb-3 overflow-hidden rounded-2xl">
                  <img
                    src={song.imgUrl}
                    alt={song.title}
                    className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onPlay?.(song)}
                      aria-label={`Phát ${song.title}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg shadow-pink-500/30 transition hover:scale-105"
                    >
                      <Play size={18} className="fill-white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(song.id)}
                      disabled={removingId === song.id}
                      aria-label={`Xóa ${song.title} khỏi yêu thích`}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {removingId === song.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{song.title}</p>
                  <p className="truncate text-sm text-white/60">{song.artist}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-white/45">
                    <span>{song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}` : '3:42'}</span>
                    <span>{song.playCount?.toLocaleString('en-US') ?? '0'} lượt nghe</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}