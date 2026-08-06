import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/layouts/Layout';
import RequireAuth from '@/components/RequireAuth';
import LoginPage from '@/pages/auth/LoginPage';
import SignUpPage from '@/pages/auth/SignUpPage';
import DiscoverPage from '@/pages/public/DiscoverPage';
import RecentlyPlayedPage from '@/pages/private/RecentlyPlayedPage';
import FavoritesPage from '@/pages/private/FavoritesPage';
import UploadedPage from '@/pages/private/UploadedPage';
import ChartsPage from '@/pages/public/ChartsPage';
import GenresPage from '@/pages/public/GenresPage';
import ProfilePage from '@/pages/private/ProfilePage';
import { newReleases } from '@/mock/mockData';

function App() {
  const [currentTrack, setCurrentTrack] = useState(newReleases[0]);

  const handlePlay = (track) => {
    setCurrentTrack(track);
  };

  return (
    <Routes>
      {/* Auth pages — không Layout, luôn public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* App pages — có Layout + Sidebar + MusicPlayer */}
      <Route element={<Layout currentTrack={currentTrack} onPlay={handlePlay} />}>

        {/* === PUBLIC: ai cũng vào được === */}
        <Route path="/discover" element={<DiscoverPage onPlay={handlePlay} />} />
        <Route path="/charts" element={<ChartsPage onPlay={handlePlay} />} />
        <Route path="/genres" element={<GenresPage onPlay={handlePlay}/>} />

        {/* === PROTECTED: hiển thị nút login nếu chưa đăng nhập === */}
        <Route path="/recently-played" element={
          <RequireAuth><RecentlyPlayedPage onPlay={handlePlay} /></RequireAuth>
        } />
        <Route path="/favorites" element={
          <RequireAuth><FavoritesPage onPlay={handlePlay} /></RequireAuth>
        } />
        <Route path="/uploaded" element={
          <RequireAuth><UploadedPage onPlay={handlePlay} /></RequireAuth>
        } />
        <Route path="/profile" element={
          <RequireAuth><ProfilePage /></RequireAuth>
        } />
      </Route>

      <Route path="/" element={<Navigate to="/discover" replace />} />
    </Routes>
  );
}

export default App;