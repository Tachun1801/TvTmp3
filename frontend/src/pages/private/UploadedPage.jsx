import { useState, useCallback, useRef } from 'react';
import { Upload, X, Music, CheckCircle } from 'lucide-react';
import { useSongs } from '@/hooks/useSongs';
import { useGenres } from '@/hooks/useGenres';
import { songService } from '@/services/songService';
import { genreService } from '@/services/genreService';

/**
 * UploadedPage — Trang quản lý bài hát đã upload
 *
 * === DATA FLOW ===
 * GET:  useSongs(() => songService.getMyUploads())
 *         → songService.getMyUploads()
 *           → mySongsApi.getMySongs()
 *
 * POST: songService.upload(formData)
 *         → songApi.uploadSong(formData)
 *           → MOCK: return new song object
 *           → REAL: POST /api/v1/songs (multipart/form-data)
 */

// ─── Helpers ────────────────────────────────────────────────

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

function getFileNameWithoutExt(filename) {
  const dot = filename.lastIndexOf('.');
  return dot > 0 ? filename.slice(0, dot) : filename;
}

// ─── Upload Zone ────────────────────────────────────────────

function UploadZone({ onFileSelect }) {
  const inputRef = useRef(null);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    // Reset để cùng 1 file vẫn trigger onChange lần sau
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleClick}
        className="w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3
                   transition-all duration-200 hover:border-purple-500 hover:bg-white/[0.02]
                   focus:outline-none focus:ring-2 focus:ring-purple-500 group"
        style={{ borderColor: 'rgba(255,255,255,0.12)' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center transition-colors
                      group-hover:bg-purple-500/10"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <Upload size={24} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
        </div>
        <div>
          <p className="text-white font-medium">Click to upload a song</p>
          <p className="text-gray-500 text-sm mt-0.5">MP3, WAV, FLAC supported</p>
        </div>
      </button>
    </>
  );
}

// ─── Upload Form (sau khi chọn file) ────────────────────────

function UploadForm({ file, genres, uploading, uploadError, onUpload, onCancel }) {
  const [title, setTitle] = useState(() => getFileNameWithoutExt(file.name));
  const [selectedGenres, setSelectedGenres] = useState([]);

  const toggleGenre = (id) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim() || file.name);
    onUpload(formData);
  };

  const isValid = title.trim().length > 0;

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {/* File info */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(147,51,234,0.15)' }}
        >
          <Music size={18} className="text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{file.name}</p>
          <p className="text-gray-500 text-xs">
            {(file.size / (1024 * 1024)).toFixed(1)} MB
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          disabled={uploading}
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Title input */}
      <div>
        <label className="text-gray-400 text-xs block mb-1.5">Song Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter song title"
          disabled={uploading}
          className="w-full px-3 py-2 rounded-lg text-white text-sm placeholder-gray-600
                     border border-white/10 bg-white/[0.04] focus:outline-none focus:ring-2
                     focus:ring-purple-500 focus:border-transparent transition-colors
                     disabled:opacity-50"
        />
      </div>

      {/* Genre checkboxes */}
      {genres.length > 0 && (
        <div>
          <label className="text-gray-400 text-xs block mb-2">Genres (optional)</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => {
              const isSelected = selectedGenres.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  disabled={uploading}
                  onClick={() => toggleGenre(g.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                              ${isSelected
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white'
                              }`}
                  style={!isSelected ? { background: 'rgba(255,255,255,0.06)' } : {}}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <p className="text-red-400 text-sm">{uploadError}</p>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={handleUpload}
        disabled={!isValid || uploading}
        className="w-full py-2.5 rounded-lg text-white text-sm font-semibold
                   bg-purple-600 hover:bg-purple-500 transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {uploading ? 'Uploading...' : 'Upload Song'}
      </button>
    </div>
  );
}

// ─── Song Card (grid) ────────────────────────────────────────

function SongCard({ song, onPlay }) {
  const { title, artist, duration, playCount, imgUrl } = song;

  return (
    <button
      type="button"
      onClick={() => onPlay(song)}
      className="group relative w-full text-left rounded-xl overflow-hidden transition-all duration-300
                 hover:scale-[1.03] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      {/* Ảnh bìa */}
      <div className="relative aspect-square overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />
        )}
        {/* Overlay + play icon khi hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 text-white/90 text-xs font-medium
                         bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
          {formatDuration(duration)}
        </span>
      </div>

      {/* Title + Artist */}
      <div className="p-3">
        <h3 className="text-white text-sm font-medium truncate">{title}</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-gray-500 text-xs truncate">{artist}</p>
          <span className="text-gray-600 text-xs ml-2 flex-shrink-0">
            {formatPlayCount(playCount)}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Skeleton Grid ──────────────────────────────────────────

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
          <div className="p-3 space-y-2">
            <div className="h-4 w-2/3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-3 w-1/3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────

export default function UploadedPage({ onPlay }) {
  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Data
  const fetchSongs = useCallback(() => songService.getMyUploads(), []);
  const { data: songs, loading, error, refetch } = useSongs(fetchSongs);

  const fetchGenres = useCallback(() => genreService.getAll(), []);
  const { data: genres } = useGenres(fetchGenres);

  // Handlers
  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccess(false);
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    setUploadError(null);
  }, []);

  const handleUpload = useCallback(async (formData) => {
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      await songService.upload(formData);
      setSelectedFile(null);
      setUploadSuccess(true);
      refetch();
      // Tự động ẩn success message sau 3s
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [refetch]);

  // ─── Render ───────────────────────────────────────────

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Uploaded Songs</h1>

      {/* ── Upload Zone ── */}
      <div className="mb-8">
        {selectedFile ? (
          <UploadForm
            file={selectedFile}
            genres={genres || []}
            uploading={uploading}
            uploadError={uploadError}
            onUpload={handleUpload}
            onCancel={handleCancel}
          />
        ) : (
          <UploadZone onFileSelect={handleFileSelect} />
        )}

        {/* Success feedback */}
        {uploadSuccess && (
          <div className="flex items-center gap-2 mt-3 text-green-400 text-sm">
            <CheckCircle size={16} />
            Song uploaded successfully!
          </div>
        )}
      </div>

      {/* ── Song Grid ── */}
      {loading && <SkeletonGrid />}

      {error && (
        <div className="text-center py-10">
          <p className="text-red-400 text-lg mb-1">Failed to load songs</p>
          <p className="text-gray-500 text-sm">{error.message}</p>
        </div>
      )}

      {!loading && !error && !songs.length && (
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <Music size={28} className="text-gray-600" />
          </div>
          <p className="text-gray-400 text-lg">No uploaded songs yet</p>
          <p className="text-gray-600 text-sm mt-1">Click above to upload your first song</p>
        </div>
      )}

      {!loading && !error && songs.length > 0 && (
        <>
          <p className="text-gray-500 text-sm mb-4">{songs.length} songs</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} onPlay={onPlay} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
