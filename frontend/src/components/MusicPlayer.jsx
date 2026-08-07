import { useState, useRef, useEffect } from 'react';
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Volume2, ListMusic } from 'lucide-react';

/**
 * MusicPlayer — Thanh phát nhạc dưới cùng
 *
 * Nhận currentTrack (shape từ API/DB):
 *   { id, title, duration (INT giây), fileUrl, imgUrl, artist, genres }
 *
 * TODO API: Khi backend trả fileUrl thật (.mp3):
 *   - Thay fake progress interval bằng thẻ <audio>
 *   - Dùng ref audio: <audio ref={audioRef} src={currentTrack.fileUrl} />
 *   - Sync isPlaying → audioRef.current.play() / pause()
 *   - Sync progress → audioRef.current.currentTime / duration
 *   - Bỏ intervalRef + formatTime, dùng onTimeUpdate event của <audio>
 */

export default function MusicPlayer({ currentTrack, onQueueToggle }) {
  // Guard: chưa có track thì không render gì
  if (!currentTrack) return null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 0.1));
      }, 300);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  /**
   * Convert progress (%) + total duration (INT giây) → "m:ss" hiển thị
   * duration: số giây (INT), khớp với DB schema songs.duration
   */
  const formatTime = (pct, durationSec) => {
    const elapsed = Math.floor((pct / 100) * durationSec);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /** Format duration INT giây → "m:ss" */
  const formatDuration = (durationSec) => {
    const m = Math.floor(durationSec / 60);
    const s = durationSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
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
            {formatTime(progress, currentTrack.duration)}
          </span>
          <div
            className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setProgress(((e.clientX - rect.left) / rect.width) * 100);
            }}
          >
            <div
              className="absolute left-0 top-0 h-full bg-cyan-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <span className="text-white/40 text-xs w-8">{formatDuration(currentTrack.duration)}</span>
        </div>
      </div>

      {/* Volume + Queue */}
      <div className="flex items-center gap-3 w-48 justify-end flex-shrink-0">
        <Volume2 size={16} className="text-white/50" />
        <div
          className="w-24 h-1 bg-white/20 rounded-full cursor-pointer relative group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setVolume(Math.round(((e.clientX - rect.left) / rect.width) * 100));
          }}
        >
          <div
            className="absolute left-0 top-0 h-full bg-white/70 rounded-full"
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
  );
}
