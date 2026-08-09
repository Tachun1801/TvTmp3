import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenres } from '@/hooks/useGenres';
import { genreService } from '@/services/genreService';

/**
 * GenresPage — Trang duyệt thể loại nhạc
 *
 * === DATA FLOW ===
 * useGenres(() => genreService.getAll())
 *   → genreService.getAll()
 *     → genreApi.getGenres()
 *       → MOCK ? [...mockGenres] : axios.get('/api/v1/genres')
 */

function GenreCard({ genre, onClick }) {
  const { name, description, img_url: imgUrl } = genre;

  return (
    <button
      type="button"
      className="group relative w-full text-left rounded-xl overflow-hidden transition-all duration-300
                 hover:scale-[1.03] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
      style={{ background: 'rgba(255,255,255,0.04)' }}
      onClick={onClick}
    >
      {/* Ảnh thể loại hoặc gradient fallback */}
      <div className="relative aspect-square overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />
        )}
        {/* Overlay gradient khi hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Tên + mô tả */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-base truncate">{name}</h3>
        {description && (
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{description}</p>
        )}
      </div>
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="aspect-square animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="p-4 space-y-2">
            <div className="h-4 w-2/3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-3 w-full rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GenresPage() {
  const navigate = useNavigate();
  const fetchGenres = useCallback(() => genreService.getAll(), []);
  const { data: genres, loading, error, refetch } = useGenres(fetchGenres);

  const handleGenreClick = useCallback((genreName) => {
    navigate(`/genres/${encodeURIComponent(genreName)}`);
  }, [navigate]);

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Genres</h1>
        <SkeletonGrid />
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-red-400 text-lg mb-1">Failed to load genres</p>
          <p className="text-gray-500 text-sm mb-4">{error.message}</p>
          <button
            type="button"
            onClick={refetch}
            className="px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors
                       hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --- Empty ---
  if (!genres.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-gray-400">No genres found.</p>
      </div>
    );
  }

  // --- Data ---
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Genres</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {genres.map((genre) => (
          <GenreCard
            key={genre.genre_id}
            genre={genre}
            onClick={() => handleGenreClick(genre.name)}
          />
        ))}
      </div>
    </div>
  );
}
