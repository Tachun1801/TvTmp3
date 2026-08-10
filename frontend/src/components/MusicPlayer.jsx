import { useState, useRef, useEffect, useCallback } from 'react';
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Volume2, ListMusic } from 'lucide-react';

/**
 * MusicPlayer — Thanh phát nhạc dưới cùng
 *
 * Nhận currentTrack (shape từ API/DB):
 *   { id, title, duration (INT giây), fileUrl, imgUrl, artist, genres }
 *
 * Dùng thẻ <audio> thật để play nhạc.
 * fileUrl là URL playable (mock: Vite-resolved MP3; real: CDN/S3 URL).
 */

export default function MusicPlayer({ currentTrack, onQueueToggle }) {
  // Guard: chưa có track thì không render gì
  if (!currentTrack) return null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [duration, setDuration] = useState(currentTrack.duration || 0);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);

  /** Lấy % (0-100) từ vị trí chuột/touch trên thanh */
  const getPercent = useCallback((e, ref) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return 0;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  // Sync isPlaying → audio.play() / audio.pause()
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Sync volume → audio.volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Đổi track → load src mới + auto-play
  useEffect(() => {
    if (audioRef.current && currentTrack?.fileUrl) {
      audioRef.current.src = currentTrack.fileUrl;
      audioRef.current.load();
      setProgress(0);
      setIsPlaying(true);
    }
  }, [currentTrack?.id]);

  // Drag progress bar → seek audio
  useEffect(() => {
    if (!isDraggingProgress) return;
    const onMove = (e) => {
      e.preventDefault();
      const pct = getPercent(e, progressBarRef);
      setProgress(pct);
      if (audioRef.current) {
        audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
      }
    };
    const onUp = () => setIsDraggingProgress(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
  }, [isDraggingProgress, getPercent]);

  // Drag volume bar
  useEffect(() => {
    if (!isDraggingVolume) return;
    const onMove = (e) => {
      e.preventDefault();
      setVolume(Math.round(getPercent(e, volumeBarRef)));
    };
    const onUp = () => setIsDraggingVolume(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
  }, [isDraggingVolume, getPercent]);

  const handleTimeUpdate = useCallback(() => {
    const a = audioRef.current;
    if (a && a.duration) {
      setProgress((a.currentTime / a.duration) * 100);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const a = audioRef.current;
    if (a?.duration) {
      setDuration(a.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
  }, []);

  /** Convert progress (%) → "m:ss" */
  const formatTime = (pct) => {
    const elapsed = Math.floor((pct / 100) * duration);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /** Format duration giây → "m:ss" */
  const formatDuration = (dur) => {
    const m = Math.floor(dur / 60);
    const s = Math.floor(dur % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
      />
      <div className="h-20 bg-[#0d0718]/95 backdrop-blur-xl border-t border-white/10 flex items-center px-6 gap-6 flex-shrink-0">
      {/* Track info */}
      <div className="flex items-center gap-3 w-56 flex-shrink-0">
        <img
          src={currentTrack.imgUrl}
          alt={currentTrack.title}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="text-white text-sm font-semibold truncate">{currentTrack.title}</div>
          <div className="text-white/50 text-xs truncate">{currentTrack.artist}</div>
        </div>
      </div>

      {/* Controls + Progress */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="flex items-center gap-5">
          <button className="text-white/40 hover:text-white/80 transition-colors">
            <Shuffle size={16} />
          </button>
          <button className="text-white/60 hover:text-white transition-colors">
            <SkipBack size={20} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 bg-cyan-400 hover:bg-cyan-300 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-cyan-400/30"
          >
            {isPlaying ? (
              <Pause size={18} className="text-black" />
            ) : (
              <Play size={18} className="text-black ml-0.5" />
            )}
          </button>
          <button className="text-white/60 hover:text-white transition-colors">
            <SkipForward size={20} />
          </button>
          <button className="text-white/40 hover:text-white/80 transition-colors">
            <Repeat size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xl flex items-center gap-3">
          <span className="text-white/40 text-xs w-8 text-right">
            {formatTime(progress)}
          </span>
          <div
            ref={progressBarRef}
            className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative group"
            onMouseDown={(e) => {
              const pct = getPercent(e, progressBarRef);
              setProgress(pct);
              setIsDraggingProgress(true);
              if (audioRef.current) {
                audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
              }
            }}
            onTouchStart={(e) => {
              const pct = getPercent(e, progressBarRef);
              setProgress(pct);
              setIsDraggingProgress(true);
              if (audioRef.current) {
                audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
              }
            }}
          >
            <div
              className={`absolute left-0 top-0 h-full bg-cyan-400 rounded-full ${isDraggingProgress ? '' : 'transition-all'}`}
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <span className="text-white/40 text-xs w-8">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Volume + Queue */}
      <div className="flex items-center gap-3 w-48 justify-end flex-shrink-0">
        <Volume2 size={16} className="text-white/50" />
        <div
          ref={volumeBarRef}
          className="w-24 h-1 bg-white/20 rounded-full cursor-pointer relative group"
          onMouseDown={(e) => {
            setVolume(Math.round(getPercent(e, volumeBarRef)));
            setIsDraggingVolume(true);
          }}
          onTouchStart={(e) => {
            setVolume(Math.round(getPercent(e, volumeBarRef)));
            setIsDraggingVolume(true);
          }}
        >
          <div
            className={`absolute left-0 top-0 h-full bg-white/70 rounded-full ${isDraggingVolume ? '' : 'transition-all'}`}
            style={{ width: `${volume}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${volume}% - 6px)` }}
          />
        </div>
        <button onClick={onQueueToggle} className="text-white/40 hover:text-white/80 transition-colors ml-2">
          <ListMusic size={18} />
        </button>
      </div>
    </div>
    </>
  );
}
