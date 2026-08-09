import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { useSongs } from '@/hooks/useSongs';
import { songService } from '@/services/songService';

/**
 * GenreDetailPage — Danh sách bài hát theo thể loại
 *
 * === DATA FLOW ===
 * useSongs(() => songService.getByGenre(genreName))
 *   → songService.getByGenre(genreName)
 *     → getSongs({ genre: genreName })
 *       → MOCK: filter mockSongs → REAL: client.get('/api/v1/songs', { params: { genre } })
 */

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatPlayCount(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return String(count);
}

function SongRow({ song, onPlay }) {
  const { title, artist, duration, playCount, imgUrl } = song;

  return (
    <button
      type="button"
      onClick={() => onPlay(song)}
      className="w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all duration-200
                 hover:bg-white/5 group focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      {/* Ảnh bìa */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {imgUrl ? (
          <img src={imgUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-500" />
        )}
      </div>

      {/* Title + Artist */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white text-sm font-medium truncate group-hover:text-purple-300 transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 text-xs truncate">{artist}</p>
      </div>

      {/* Play count */}
      <span className="text-gray-600 text-xs w-14 text-right hidden sm:block">
        {formatPlayCount(playCount)}
      </span>

      {/* Duration */}
      <span className="text-gray-500 text-xs w-10 text-right flex items-center gap-1">
        <Clock size={12} className="text-gray-600" />
        {formatDuration(duration)}
      </span>
    </button>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="w-12 h-12 rounded-lg animate-pulse flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <div className="h-3 w-10 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      ))}
    </div>
  );
}

export default function GenreDetailPage({ onPlay }) {
  const { genreName } = useParams();
  const decodedName = decodeURIComponent(genreName);

  const fetchSongs = useCallback(() => songService.getByGenre(decodedName), [decodedName]);
  const { data: songs, loading, error } = useSongs(fetchSongs);

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <BackLink />
        <h1 className="text-2xl font-bold text-white mb-6 capitalize">{decodedName}</h1>
        <SkeletonList />
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <BackLink />
        <div className="flex items-center justify-center flex-1" style={{ minHeight: '60vh' }}>
          <div className="text-center max-w-sm">
            <p className="text-red-400 text-lg mb-1">Failed to load songs</p>
            <p className="text-gray-500 text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Empty ---
  if (!songs.length) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <BackLink />
        <h1 className="text-2xl font-bold text-white mb-6 capitalize">{decodedName}</h1>
        <div className="flex items-center justify-center" style={{ minHeight: '40vh' }}>
          <p className="text-gray-400">No songs found for this genre.</p>
        </div>
      </div>
    );
  }

  // --- Data ---
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <BackLink />

      <h1 className="text-2xl font-bold text-white mb-1 capitalize">{decodedName}</h1>
      <p className="text-gray-500 text-sm mb-6">{songs.length} songs</p>

      <div className="space-y-1">
        {songs.map((song) => (
          <SongRow key={song.id} song={song} onPlay={onPlay} />
        ))}
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/genres"
      className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
    >
      <ArrowLeft size={16} />
      All Genres
    </Link>
  );
}
