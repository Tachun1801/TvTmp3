import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Loader2 } from 'lucide-react';

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Đang kiểm tra token (app vừa load) → hiển thị spinner
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="text-white/40 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="flex-1 flex items-center justify-center overflow-y-auto">
      <div className="text-center px-8 py-16 max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <LogIn size={32} className="text-white/30" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Yêu cầu đăng nhập</h2>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          Bạn cần đăng nhập để truy cập nội dung này. Hãy đăng nhập vào tài khoản của bạn để xem danh sách yêu thích, hồ sơ và nhiều thông tin khác.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-400/30"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-2.5 rounded-xl transition-all"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
