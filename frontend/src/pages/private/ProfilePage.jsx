import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getMyStats } from '@/api/statsApi';
import {
  User, Mail, Calendar, Music, Heart, Upload, Settings, LogOut,
  Edit2, Check, X, Loader2,
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, loading: authLoading } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [birth, setBirth] = useState(user?.birth || '');

  // Stats từ API (mock tính từ history, favorites, songs)
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    getMyStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  // Guard: đang load user
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="text-white/40 animate-spin" />
      </div>
    );
  }

  // Guard: chưa đăng nhập (RequireAuth đã bảo vệ, nhưng thêm safety)
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/50">Vui lòng đăng nhập để xem profile</p>
      </div>
    );
  }

  // ============================================================
  // Handlers
  // ============================================================

  const handleEdit = () => {
    setFullName(user.fullName || '');
    setBirth(user.birth || '');
    setSaveError(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const result = await updateProfile({ fullName, birth: birth || null });
    if (result.success) {
      setEditing(false);
    } else {
      setSaveError(result.error);
    }
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // ============================================================
  // Format helpers
  // ============================================================

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Format số: 1247 → "1,247"
  const fmt = (n) => n != null ? n.toLocaleString('en-US') : '—';

  const statItems = [
    { label: 'Songs Played', value: fmt(stats?.songsPlayed), icon: Music, color: 'from-purple-600 to-pink-600' },
    { label: 'Favorites', value: fmt(stats?.favorites), icon: Heart, color: 'from-pink-600 to-rose-500' },
    { label: 'Uploads', value: fmt(stats?.uploads), icon: Upload, color: 'from-blue-600 to-cyan-500' },
    { label: 'Days Active', value: fmt(stats?.daysActive), icon: Calendar, color: 'from-teal-500 to-emerald-500' },
  ];

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
      <div className="px-8 pt-8 pb-8 max-w-3xl mx-auto">

        {/* ================= Profile header ================= */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <User size={48} className="text-white" />
            </div>
            {!editing && (
              <button
                onClick={handleEdit}
                className="absolute bottom-0 right-0 w-9 h-9 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>

          {/* --- View mode --- */}
          {!editing && (
            <>
              <h1 className="text-white text-3xl font-bold mb-1">{user.fullName}</h1>
              <p className="text-white/50 text-sm mb-4">
                Member since {formatDate(user.createdAt)}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEdit}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                >
                  <Settings size={14} />
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 font-medium px-5 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </>
          )}

          {/* --- Edit mode --- */}
          {editing && (
            <div className="w-full max-w-sm space-y-4">
              <div>
                <label className="text-white/70 text-sm font-medium mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-white/70 text-sm font-medium mb-1.5 block">Birth Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="date"
                    value={birth}
                    onChange={(e) => setBirth(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              {saveError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
                  <p className="text-red-400 text-xs text-center">{saveError}</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving || !fullName.trim()}
                  className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={14} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= Stats grid ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon size={18} className="text-white" />
              </div>
              <div className="text-white text-2xl font-bold">
                {statsLoading ? (
                  <span className="inline-block w-16 h-7 bg-white/10 rounded animate-pulse align-middle" />
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-white/40 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ================= Account details ================= */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-5">Account Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/40 text-xs">Full Name</div>
                <div className="text-white text-sm font-medium truncate">{user.fullName}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={16} className="text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/40 text-xs">Email</div>
                <div className="text-white text-sm font-medium truncate">{user.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/40 text-xs">Birth Date</div>
                <div className="text-white text-sm font-medium">
                  {user.birth ? formatDate(user.birth) : 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/40 text-xs">Member Since</div>
                <div className="text-white text-sm font-medium">{formatDate(user.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
