import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';
import { useSongs } from '@/hooks/useSongs';
import { songService } from '@/services/songService';

// TODO: tách ra utils/format.js khi có nhiều nơi dùng
function formatDuration(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function RightPanel({ onPlay }) {
  const [tab, setTab] = useState('playlist');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // useCallback để giữ tham chiếu ổn định, tránh re-render vô hạn do inline arrow
  const fetchCharts = useCallback(() => songService.getCharts('alltime'), []);
  const { data: charts, loading: chartLoading, error: chartError } = useSongs(fetchCharts);
  const fetchRecentlyPlayed = useCallback(() => songService.getRecentlyPlayed(), []);
  const { data: recentlyPlayed, loading: recentLoading, error: recentError } = useSongs(fetchRecentlyPlayed);

  const renderContent = () => {
    // Tab "playlist": hiển thị charts (tạm thời, sau này thay bằng playlist thật)
    if (tab === 'playlist') {
      // --- Đang tải ---
      if (chartLoading) {
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/30 text-sm">Đang tải...</p>
          </div>
        );
      }

      // --- Lỗi ---
      if (chartError) {
        return (
          <div className="flex-1 flex items-center justify-center px-4">
            <p className="text-red-400 text-sm text-center">Không tải được Danh sách nghe</p>
          </div>
        );
      }

      // --- Danh sách charts ---
      return (
        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {charts.map((song) => (
            <div
              key={song.id} onClick={() => onPlay(song)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
            >
              {/* Rank */}
              <span className="text-white/30 text-xs w-5 text-right font-mono tabular-nums">
                {song.rank}
              </span>

              {/* Cover */}
              <img
                src={song.imgUrl}
                alt={song.title}
                className="w-10 h-10 rounded object-cover flex-shrink-0"
              />

              {/* Title + Artist */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate group-hover:text-cyan-400 transition-colors">
                  {song.title}
                </p>
                <p className="text-white/40 text-xs truncate">{song.artist}</p>
              </div>

              {/* Duration */}
              <span className="text-white/30 text-xs tabular-nums">
                {formatDuration(song.duration)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Tab "recent": cần đăng nhập
    if (tab === 'recent') {
      if (!isAuthenticated) {
        return (
          <div className="flex-1 flex items-center justify-center overflow-y-auto px-4">
            <div className="text-center py-8 max-w-xs">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <LogIn size={24} className="text-white/30" />
              </div>
              <h3 className="text-white text-base font-bold mb-2">Yêu cầu đăng nhập</h3>
              <p className="text-white/40 text-xs mb-5 leading-relaxed">
                Đăng nhập để xem lịch sử nghe gần đây của bạn.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-lg shadow-cyan-400/30"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </div>
          </div>
        );
      }

      // --- Đang tải ---
      if (recentLoading) {
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/30 text-sm">
              Đang tải...
            </p>
          </div>
        );
      }

      // --- Lỗi ---
      if (recentError) {
        return (
          <div className="flex-1 flex items-center justify-center px-4">
            <p className="text-red-400 text-sm text-center">Không tải được Danh sách nghe</p>
          </div>
        );
      }

      // --- Danh sách nghe gần đây ---
      return (
        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {recentlyPlayed.map((entry) => (
            <div
              key={entry.id} onClick={() => onPlay(entry.song)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
            >
              {/* Cover */}
              <img
                src={entry.song.imgUrl}
                alt={entry.song.title}
                className="w-10 h-10 rounded object-cover flex-shrink-0"
              />

              {/* Title + Artist */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate group-hover:text-cyan-400 transition-colors">
                  {entry.song.title}
                </p>
                <p className="text-white/40 text-xs truncate">{entry.song.artist}</p>
              </div>

              {/* Duration */}
              <span className="text-white/30 text-xs tabular-nums">
                {formatDuration(entry.song.duration)}
              </span>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col bg-black/20 backdrop-blur-sm border-l border-white/5 h-full">
      {/* ================= Tabs ================= */}
      <div className="p-4 pb-2">
        <div className="flex bg-white/5 rounded-xl p-1">
          {['playlist', 'recent'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                tab === t
                  ? 'bg-white/15 text-white shadow'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {t === 'playlist' ? 'Playlist' : 'Recently Played'}
            </button>
          ))}
        </div>
      </div>

      {/* ================= Content ================= */}
      {renderContent()}
    </aside>
  );
}
