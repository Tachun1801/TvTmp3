import { Play } from 'lucide-react';
import { formatPlayedTime } from '@/utils/historyUtils';

export default function HistoryListItem({ entry, onPlay }) {
  const { song, playedAt } = entry;

  if (!song) return null;

  return (
    <button
      type="button"
      onClick={() => onPlay?.(song)}
      aria-label={`Phát lại ${song.title}`}
      className="group flex w-full items-center gap-4 rounded-2xl border border-transparent px-3 py-2.5 text-left transition hover:border-white/10 hover:bg-white/5"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-800">
        <img
          src={song.imgUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100">
          <Play size={18} className="fill-white text-white" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{song.title}</p>
        <p className="truncate text-sm text-white/60">{song.artist}</p>
        <p className="mt-0.5 truncate text-xs text-white/40">
          {song.genres?.slice(0, 2).join(' • ')}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-medium text-white/70">
          {formatPlayedTime(playedAt)}
        </p>
      </div>
    </button>
  );
}
