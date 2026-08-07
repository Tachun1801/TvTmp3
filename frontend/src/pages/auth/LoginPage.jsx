import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();

  // Nếu đã đăng nhập rồi thì redirect luôn
  useEffect(() => {
    if (isAuthenticated) navigate('/discover', { replace: true });
  }, [isAuthenticated, navigate]);

  // Clear error cũ khi user thay đổi input
  useEffect(() => {
    if (error) clearError();
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/discover');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f0520 0%, #1a0a2e 50%, #0d1535 100%)' }}>
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/3756940/pexels-photo-3756940.jpeg?auto=compress&cs=tinysrgb&h=1000"
          alt="Woman with headphones"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 via-purple-900/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">Z</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Zingify MP3</span>
          </div>
          <h1 className="text-white text-5xl font-bold leading-tight mb-4">
            Music for<br />everyone.
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            Discover, stream, and share a constantly expanding mix of music from emerging and major artists.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">Z</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Zingify MP3</span>
          </div>

          <h2 className="text-white text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-white/50 mb-8">Sign in to your account to continue listening</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/70 text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-purple-600" />
                <span className="text-white/60 text-sm">Remember me</span>
              </label>
              <button type="button" className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/40 text-sm">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['Google', 'Apple', 'Facebook'].map((p) => (
              <button
                key={p}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white py-3 rounded-xl text-sm font-medium transition-all"
              >
                {p}
              </button>
            ))}
          </div>

          <p className="text-center text-white/50 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
