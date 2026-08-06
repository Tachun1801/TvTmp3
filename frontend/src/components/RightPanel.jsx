import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';

export default function RightPanel() {
  const [tab, setTab] = useState('playlist');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const renderContent = () => {
    // Tab "playlist": hiển thị không cần đăng nhập
    if (tab === 'playlist') {
      return (
        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {/* ---------------------------------------------------------------- */}
          {/* Playlist content ở đây */}
          {/* ---------------------------------------------------------------- */}
        </div>
      );
    }

    // Tab "recent": cần đăng nhập
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
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Đã đăng nhập: hiển thị recently played
    return (
      <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {/* ---------------------------------------------------------------- */}
        {/* Recently played content ở đây */}
        {/* ---------------------------------------------------------------- */}
      </div>
    );
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