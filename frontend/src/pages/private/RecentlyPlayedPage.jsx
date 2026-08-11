import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Compass, Play, Search, X } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { songService } from '@/services/songService';
import SectionHeader from '@/components/discover/SectionHeader';
import HorizontalRow from '@/components/discover/HorizontalRow';
import SongCard from '@/components/discover/SongCard';
import HistoryListItem from '@/components/recently-played/HistoryListItem';
import RecentlyPlayedSkeleton from '@/components/recently-played/RecentlyPlayedSkeleton';
import {
  getHistoryStats,
  getUniqueRecentSongs,
  groupHistoryByDay,
} from '@/utils/historyUtils';

/**
 * RecentlyPlayedPage — Vinh
 *
 * API đang dùng:
 *   GET /api/v1/history  → songService.getRecentlyPlayed() → getHistory()
 *
 * API liên quan (khi phát nhạc):
 *   POST /api/v1/history { songId }  → recordPlay() — backend ghi lượt nghe
 *   GET /api/v1/songs/{id}/stream    → phát nhạc qua MusicPlayer
 *
 * Yêu cầu nhóm (EPIC 3 — Personal Library):
 *   - Trang protected (RequireAuth)
 *   - Hiển thị lịch sử nghe gần đây của user
 *   - Dùng mock trước, nối API khi backend sẵn sàng
 */
export default function RecentlyPlayedPage({ onPlay }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // GET /api/v1/history — Vinh (RecentlyPlayedPage)
  const fetchHistory = useCallback(() => songService.getRecentlyPlayed(), []);
  const { data: history, loading, error } = useHistory(fetchHistory);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredHistory = useMemo(() => {
    if (!normalizedQuery) return history;

    return history.filter(({ song }) => {
      const title = song?.title?.toLowerCase() ?? '';
      const artist = song?.artist?.toLowerCase() ?? '';
      const genres = song?.genres?.join(' ').toLowerCase() ?? '';
      return (
        title.includes(normalizedQuery) ||
        artist.includes(normalizedQuery) ||
        genres.includes(normalizedQuery)
      );
    });
  }, [history, normalizedQuery]);

  const stats = useMemo(() => getHistoryStats(filteredHistory), [filteredHistory]);
  const quickReplaySongs = useMemo(
    () => getUniqueRecentSongs(filteredHistory),
    [filteredHistory],
  );
  const groupedHistory = useMemo(
    () => groupHistoryByDay(filteredHistory),
    [filteredHistory],
  );

  const latestEntry = filteredHistory[0];
  const latestSong = latestEntry?.song;

  const handlePlayAll = () => {
    if (latestSong) {
      onPlay?.(latestSong);
    }
  };

  if (loading) {
    return <RecentlyPlayedSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-red-400">
        <div className="max-w-xl px-6 text-center">
          <h1 className="mb-3 text-2xl font-semibold">Không thể tải lịch sử nghe</h1>
          <p className="text-white/70">
            Có lỗi xảy ra khi lấy danh sách nghe gần đây. Vui lòng thử lại sau.
          </p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Clock size={32} className="text-white/30" />
          </div>
          <h1 className="text-3xl font-bold">Chưa có lịch sử nghe</h1>
          <p className="mt-3 text-white/60">
            Các bài hát bạn nghe sẽ xuất hiện ở đây. Hãy khám phá và bắt đầu nghe nhé.
          </p>
          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
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
        <p className="text-sm uppercase tracking-[0.4em] text-white/40">
          Thư viện cá nhân
        </p>
        <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">
          Nghe gần đây
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-white/70">
          Tiếp tục từ bài vừa nghe hoặc quay lại những ca khúc bạn đã phát.
        </p>
      </section>

      <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_30%),linear-gradient(90deg,_rgba(255,255,255,0.07),_rgba(255,255,255,0.02))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {latestSong && (
              <img
                src={latestSong.imgUrl}
                alt={latestSong.title}
                className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-lg"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
                Nghe tiếp
              </p>
              <h2 className="mt-2 truncate text-2xl font-semibold">
                {latestSong?.title ?? 'Bài gần nhất'}
              </h2>
              <p className="truncate text-white/70">{latestSong?.artist}</p>
              <p className="mt-2 text-sm text-white/50">
                {stats.uniqueSongs} bài · {stats.uniqueArtists} nghệ sĩ ·{' '}
                {stats.totalPlays} lượt nghe
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePlayAll}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
            >
              <Play size={16} className="fill-black" />
              Phát tiếp
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
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Lọc theo bài hát, nghệ sĩ hoặc thể loại..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-10 text-sm text-white outline-none transition focus:border-cyan-300 focus:bg-white/10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Xóa tìm kiếm"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {quickReplaySongs.length > 0 && (
          <>
            <SectionHeader
              eyebrow="Nghe lại nhanh"
              title="Những bài bạn vừa nghe"
              description="Chọn nhanh từ các ca khúc gần đây nhất"
            />
            <HorizontalRow className="mb-8">
              {quickReplaySongs.map((song) => (
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

        {filteredHistory.length === 0 ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-lg font-semibold text-white">
              Không tìm thấy bài hát nào khớp.
            </p>
            <p className="mt-3 text-sm text-white/70">
              Thử đổi từ khóa tìm kiếm để xem thêm lịch sử nghe.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-5 rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-black transition hover:bg-cyan-300"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          groupedHistory.map(({ label, items }) => (
            <section key={label} className="mb-8">
              <SectionHeader eyebrow="Lịch sử" title={label} />
              <div className="space-y-1">
                {items.map((entry) => (
                  <HistoryListItem
                    key={entry.id}
                    entry={entry}
                    onPlay={onPlay}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </section>
    </main>
  );
}
