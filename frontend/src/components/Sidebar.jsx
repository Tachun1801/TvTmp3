import { NavLink } from 'react-router-dom';
import { Compass, Clock, Heart, Upload, BarChart2, Grid, User } from 'lucide-react';

const navItems = [
  { id: 'discover', to: '/discover', label: 'Discover', sublabel: 'Khám phá', icon: Compass },
  { id: 'recently-played', to: '/recently-played', label: 'Recently Played', sublabel: 'Nghe gần đây', icon: Clock },
  { id: 'favorites', to: '/favorites', label: 'Favorite Songs', sublabel: 'Bài hát yêu thích', icon: Heart },
  { id: 'uploaded', to: '/uploaded', label: 'Uploaded', sublabel: 'Đã tải lên', icon: Upload },
  { id: 'charts', to: '/charts', label: 'Charts', sublabel: 'BXH', icon: BarChart2 },
  { id: 'genres', to: '/genres', label: 'Genres & Themes', sublabel: 'Chủ đề thể loại', icon: Grid },
];

export default function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-black/20 backdrop-blur-sm border-r border-white/5 h-full">
      {/* Logo */}
      <div className="p-5 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">Z</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">TVT MP3</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ id, to, label, sublabel, icon: Icon }) => (
          <NavLink
            key={id}
            to={to}
            end
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={isActive ? 'text-purple-400' : 'text-white/40 group-hover:text-white/70'}
                />
                <div>
                  <div className="text-sm font-medium leading-tight">{label}</div>
                  {sublabel && (
                    <div className="text-[10px] text-white/40 leading-tight mt-0.5">{sublabel}</div>
                  )}
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10 mb-3" />

      {/* Profile */}
      <NavLink
        to="/profile"
        end
        className={({ isActive }) =>
          `mx-3 mb-4 flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
            isActive
              ? 'bg-white/10 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`
        }
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-white" />
        </div>
        <span className="text-sm font-medium">User profile</span>
      </NavLink>
    </aside>
  );
}
