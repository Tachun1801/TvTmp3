import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHistory } from '@/hooks/useHistory';
import { songService } from '@/services/songService';
import { LogIn, Play } from 'lucide-react';
import { formatPlayedTime } from '@/utils/historyUtils';

export default function RightPanel({ onPlay }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchHistory = useCallback(() => songService.getRecentlyPlayed(), []);
  const { data: history, loading } = useHistory(fetchHistory);

  const recentItems = history.slice(0, 8);

  if (!isAuthenticated) {
    return (
      <aside className="flex h-full w-72 shrink-0 flex-col border-l border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="flex flex-1 items-center justify-center overflow-y-auto px-4">
          <div className="max-w-xs py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <LogIn size={24} className="text-white/30" />
            </div>
            <h3 className="text-base font-bold text-white">Yêu cầu đăng nhập</h3>
            <p className="mb-5 mt-2 text-xs leading-relaxed text-white/40">
              Đăng nhập để xem lịch sử nghe gần đây của bạn.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/login')}
                className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-cyan-400/30 transition-all hover:bg-cyan-300"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="rounded-lg bg-white/10 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-white/20"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="border-b border-white/10 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          Nghe gần đây
        </p>
        <h3 className="mt-1 text-sm font-semibold text-white">Recently Played</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {loading ? (
          <div className="space-y-3 px-1 py-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex animate-pulse items-center gap-3 rounded-xl bg-white/5 p-2">
                <div className="h-10 w-10 rounded-lg bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-white/10" />
                  <div className="h-2 w-1/2 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="px-2 py-8 text-center">
            <p className="text-sm text-white/60">Chưa có lịch sử nghe.</p>
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="mt-4 text-xs font-semibold text-cyan-200 hover:text-cyan-100"
            >
              Khám phá nhạc
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {recentItems.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onPlay?.(entry.song)}
                className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/5"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={entry.song.imgUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <Play size={14} className="fill-white text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {entry.song.title}
                  </p>
                  <p className="truncate text-xs text-white/50">
                    {entry.song.artist}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-white/40">
                  {formatPlayedTime(entry.playedAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => navigate('/recently-played')}
          className="w-full rounded-lg bg-white/10 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
        >
          Xem tất cả
        </button>
      </div>
    </aside>
  );
}
