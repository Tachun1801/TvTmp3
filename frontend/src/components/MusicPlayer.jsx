import { useState, useRef, useEffect, useCallback } from 'react';
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Volume2, ListMusic } from 'lucide-react';

/**
 * MusicPlayer — Thanh phát nhạc dưới cùng (fixed bottom bar).
 *
 * === DATA FLOW ===
 *
 *   App.jsx (currentTrack state)
 *     → Layout (pass-through)
 *       → MusicPlayer (nhận currentTrack, render <audio>)
 *
 *   Khi user click 1 bài ở bất kỳ page nào:
 *     page gọi handlePlay(track)
 *       → App.setCurrentTrack(track)
 *         → currentTrack.id thay đổi
 *           → MusicPlayer: useEffect load src mới + auto-play
 *
 * === SHAPE của currentTrack ===
 *   { id, title, duration (giây), fileUrl, imgUrl, artist, genres }
 *
 *   - fileUrl: URL playable trực tiếp — mock trả về Vite-resolved MP3,
 *              real API trả về CDN/S3 URL. Không cần gọi riêng /stream endpoint.
 *
 * === DESIGN DECISIONS ===
 *
 *   1. Watch currentTrack.id (không phải fileUrl) để phát hiện đổi bài.
 *      Với mock data, tất cả bài dùng chung 1 file mock.mp3 → fileUrl không
 *      thay đổi giữa các track. Watch id đảm bảo đổi bài luôn trigger auto-play.
 *
 *   2. Drag progress/volume dùng document-level event listener (mousemove,
 *      mouseup, touchmove, touchend). Điều này cho phép user kéo chuột ra
 *      ngoài thanh bar mà vẫn tiếp tục điều chỉnh được (UX chuẩn).
 *
 *   3. Tắt CSS transition-all trên fill bar khi đang kéo (isDragging* = true)
 *      để tránh lag do transition delay.
 *
 *   4. duration có 2 nguồn:
 *      - currentTrack.duration (DB/API) → giá trị khởi tạo, hiển thị ngay
 *      - audio.onLoadedMetadata → ghi đè bằng duration thật từ file MP3
 */

export default function MusicPlayer({ currentTrack, onQueueToggle }) {
  // =========================================================================
  // Guard: chưa có track nào được chọn → không render gì
  // =========================================================================
  if (!currentTrack) return null;

  // =========================================================================
  // State
  // =========================================================================
  const [isPlaying, setIsPlaying] = useState(false);           // play/pause
  const [progress, setProgress] = useState(0);                  // 0–100 (%)
  const [volume, setVolume] = useState(70);                     // 0–100 (%)
  const [duration, setDuration] = useState(currentTrack.duration || 0); // giây — khởi tạo từ DB, ghi đè bởi audio metadata
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);  // đang kéo thanh progress?
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);      // đang kéo thanh volume?

  // =========================================================================
  // Refs
  // =========================================================================
  const audioRef = useRef(null);          // thẻ <audio>
  const progressBarRef = useRef(null);    // thanh progress (để tính toạ độ drag)
  const volumeBarRef = useRef(null);      // thanh volume

  // =========================================================================
  // Helper: lấy phần trăm (0–100) từ vị trí chuột/touch trên thanh
  // Hỗ trợ cả mouse (e.clientX) và touch (e.touches[0].clientX).
  // Clamp 0–100 để tránh giá trị ngoài range khi kéo ra ngoài bar.
  // =========================================================================
  const getPercent = useCallback((e, ref) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return 0;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  // =========================================================================
  // Effect: sync trạng thái isPlaying → thẻ <audio>
  // .play() trả về Promise — nếu browser chặn autoplay thì catch & reset state
  // =========================================================================
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // =========================================================================
  // Effect: sync volume state → audio.volume (0.0–1.0)
  // =========================================================================
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // =========================================================================
  // Effect: đổi bài hát → load src mới + reset progress + auto-play
  //
  // Watch currentTrack.id (KHÔNG phải fileUrl) vì:
  //   - Mock data: tất cả bài dùng chung 1 file → fileUrl không đổi
  //   - Real API: id là unique identifier chuẩn để phát hiện đổi track
  // =========================================================================
  useEffect(() => {
    if (audioRef.current && currentTrack?.fileUrl) {
      audioRef.current.src = currentTrack.fileUrl;
      audioRef.current.load();
      setProgress(0);
      setIsPlaying(true);
    }
  }, [currentTrack?.id]);

  // =========================================================================
  // Effect: drag thanh progress → seek audio real-time
  //
  // Dùng document-level listener (không phải onMouseMove trên chính bar) để:
  //   - User kéo chuột ra ngoài bar vẫn tiếp tục seek được
  //   - Thả chuột ở bất kỳ đâu cũng kết thúc drag
  //
  // touchmove dùng { passive: false } để cho phép e.preventDefault()
  // (ngăn scroll trang khi kéo trên mobile).
  // =========================================================================
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

  // =========================================================================
  // Effect: drag thanh volume — tương tự progress nhưng chỉ set volume
  // =========================================================================
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

  // =========================================================================
  // Audio event handlers (dùng useCallback để tránh re-render không cần thiết)
  // =========================================================================

  /** onTimeUpdate — đồng bộ progress bar với audio.currentTime */
  const handleTimeUpdate = useCallback(() => {
    const a = audioRef.current;
    if (a && a.duration) {
      setProgress((a.currentTime / a.duration) * 100);
    }
  }, []);

  /**
   * onLoadedMetadata — lấy duration thật từ file MP3.
   * Ghi đè giá trị khởi tạo (từ DB/API) vì file thực tế có thể khác vài giây.
   */
  const handleLoadedMetadata = useCallback(() => {
    const a = audioRef.current;
    if (a?.duration) {
      setDuration(a.duration);
    }
  }, []);

  /** onEnded — reset về đầu, dừng phát */
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
  }, []);

  // =========================================================================
  // Format helpers
  // =========================================================================

  /** Convert progress (%) → "m:ss" */
  const formatTime = (pct) => {
    const elapsed = Math.floor((pct / 100) * duration);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /** Convert duration (giây) → "m:ss" */
  const formatDuration = (dur) => {
    const m = Math.floor(dur / 60);
    const s = Math.floor(dur % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <>
      {/*
       * Thẻ <audio> ẩn — tất cả điều khiển thông qua audioRef + state.
       * preload="auto" để browser tải metadata ngay, lấy được duration sớm.
       */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
      />

      <div className="h-20 bg-[#0d0718]/95 backdrop-blur-xl border-t border-white/10 flex items-center px-6 gap-6 flex-shrink-0">

        {/* ================================================================ */}
        {/* Track info — ảnh + tên bài + tên nghệ sĩ                           */}
        {/* ================================================================ */}
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

        {/* ================================================================ */}
        {/* Center: nút điều khiển + progress bar                             */}
        {/* ================================================================ */}
        <div className="flex-1 flex flex-col items-center gap-2">

          {/* Nút điều khiển */}
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

          {/* Progress bar — click hoặc kéo để seek */}
          <div className="w-full max-w-xl flex items-center gap-3">
            <span className="text-white/40 text-xs w-8 text-right">
              {formatTime(progress)}
            </span>

            {/* Bar — ref để tính toạ độ, onMouseDown/onTouchStart để bắt drag */}
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
              {/* Fill — tắt transition khi đang kéo để theo chuột mượt */}
              <div
                className={`absolute left-0 top-0 h-full bg-cyan-400 rounded-full ${isDraggingProgress ? '' : 'transition-all'}`}
                style={{ width: `${progress}%` }}
              />
              {/* Thumb — hiện khi hover group */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>

            <span className="text-white/40 text-xs w-8">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Right: Volume + Queue                                             */}
        {/* ================================================================ */}
        <div className="flex items-center gap-3 w-48 justify-end flex-shrink-0">
          <Volume2 size={16} className="text-white/50" />

          {/* Volume bar — tương tự progress: click hoặc kéo */}
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
            {/* Fill — tắt transition khi đang kéo */}
            <div
              className={`absolute left-0 top-0 h-full bg-white/70 rounded-full ${isDraggingVolume ? '' : 'transition-all'}`}
              style={{ width: `${volume}%` }}
            />
            {/* Thumb — hiện khi hover group */}
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
