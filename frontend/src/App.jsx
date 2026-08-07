import { useState, useEffect } from 'react';
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
import { useSongs } from '@/hooks/useSongs';
import { songService } from '@/services/songService';

/**
 * App — Root component
 *
 * === DATA FLOW (api → service → hook → component) ===
 *
 * useSongs(() => songService.getDiscover())
 *   → songService.getDiscover()
 *     → songApi.getAll()
 *       → MOCK ? mockSongs : axios.get('/api/songs')
 *
 * Khi backend có API thật:
 *   1. Vào @/api/songApi.js, set MOCK = false
 *   2. Bỏ comment phần real API + import client
 *   3. KHÔNG cần sửa App.jsx này
 */

function App() {
  /*
   * TODO API: Khi các page (Discover, Charts...) đã tự fetch data qua useSongs,
   * có thể bỏ useSongs ở App và chỉ giữ currentTrack state.
   * Hiện tại App cần fetch để có track đầu tiên cho MusicPlayer.
   */
  const { data: songs } = useSongs(() => songService.getDiscover());

  const [currentTrack, setCurrentTrack] = useState(null);

  // Set bài đầu tiên làm current track khi data load xong
  useEffect(() => {
    if (songs.length > 0 && !currentTrack) {
      setCurrentTrack(songs[0]);
    }
  }, [songs, currentTrack]);

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
