import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import MusicPlayer from '@/components/MusicPlayer';
import RightPanel from '@/components/RightPanel';

export default function Layout({ currentTrack, onPlay, playVersion }) {
  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0520 0%, #1a0a2e 40%, #0d1535 100%)',
      }}
    >
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </main>
        <RightPanel onPlay={onPlay} />
      </div>
      <MusicPlayer currentTrack={currentTrack} playVersion={playVersion} />
    </div>
  );
}
