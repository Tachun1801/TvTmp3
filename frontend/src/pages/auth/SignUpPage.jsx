import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register, loading, error, clearError, isAuthenticated } = useAuth();

  // Nếu đã đăng nhập rồi thì redirect luôn
  useEffect(() => {
    if (isAuthenticated) navigate('/discover', { replace: true });
  }, [isAuthenticated, navigate]);

  // Clear error cũ khi user thay đổi input
  useEffect(() => {
    if (error) clearError();
  }, [name, email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register({ email, password, fullName: name });
    if (result.success) {
      navigate('/discover');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f0520 0%, #1a0a2e 50%, #0d1535 100%)' }}>
      {/* Left form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">Z</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">TVT MP3</span>
          </div>

          <h2 className="text-white text-3xl font-bold mb-2">Create account</h2>
          <p className="text-white/50 mb-8">Join millions of music lovers today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/70 text-sm font-medium mb-2 block">Full name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                  required
                />
              </div>
            </div>

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

            <div className="space-y-2">
              {['Free streaming for all music', 'Create and share playlists', 'No ads, no interruptions'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-white/60 text-sm">
                  <Check size={14} className="text-cyan-400" />
                  {f}
                </div>
              ))}
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
                  Create Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right visual panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/7193457/pexels-photo-7193457.jpeg?auto=compress&cs=tinysrgb&h=1000"
          alt="Woman with headphones"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-purple-900/60 via-purple-900/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <h1 className="text-white text-5xl font-bold leading-tight mb-4">
            Start your<br />music journey.
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            Join a community of music lovers. Create playlists, discover new artists, and enjoy ad-free streaming.
          </p>
        </div>
      </div>
    </div>
  );
}
