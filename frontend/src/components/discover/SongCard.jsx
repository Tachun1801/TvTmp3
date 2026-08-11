import { Play } from "lucide-react";

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export default function SongCard({
  song,
  onPlay,
  variant = "poster",
  rank,
  className = "",
}) {
  const handlePlay = () => onPlay?.(song);

  if (variant === "rank") {
    return (
      <button
        type="button"
        onClick={handlePlay}
        aria-label={`Phát ${song.title}`}
        className={`group flex w-[280px] shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-cyan-300/40 hover:bg-white/10 ${className}`}
      >
        <span className="w-6 shrink-0 text-center text-sm font-bold text-cyan-200">
          {rank}
        </span>
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
          <img
            src={song.imgUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
            <Play size={16} className="fill-white text-white" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{song.title}</p>
          <p className="truncate text-sm text-white/60">{song.artist}</p>
        </div>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handlePlay}
        aria-label={`Phát ${song.title}`}
        className={`group w-[200px] shrink-0 rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-left transition hover:border-cyan-300/40 hover:bg-slate-900 ${className}`}
      >
        <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
          <img
            src={song.imgUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/30">
              <Play size={18} className="ml-0.5 fill-black text-black" />
            </span>
          </div>
        </div>
        <p className="truncate text-sm font-semibold text-white">{song.title}</p>
        <p className="truncate text-xs text-white/60">{song.artist}</p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      aria-label={`Phát ${song.title}`}
      className={`group w-[180px] shrink-0 text-left transition ${className}`}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl border border-white/10 bg-slate-800 shadow-lg">
        <img
          src={song.imgUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/40 transition group-hover:scale-110">
            <Play size={20} className="ml-0.5 fill-black text-black" />
          </span>
        </div>
      </div>
      <p className="truncate font-semibold text-white">{song.title}</p>
      <p className="truncate text-sm text-white/60">{song.artist}</p>
      <p className="mt-1 text-xs text-white/40">
        {formatDuration(song.duration)} · {song.playCount.toLocaleString()} lượt nghe
      </p>
    </button>
  );
}
