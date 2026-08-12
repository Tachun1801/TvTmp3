/**
 * Nhóm lịch sử nghe theo ngày — pattern Spotify / Apple Music
 */

export function formatPlayedTime(playedAt) {
  const date = new Date(playedAt);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDayGroupLabel(playedAt) {
  const date = new Date(playedAt);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return 'Hôm nay';
  if (date >= startOfYesterday) return 'Hôm qua';
  if (date >= startOfWeek) return 'Tuần này';

  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

export function groupHistoryByDay(entries) {
  const groups = new Map();

  entries.forEach((entry) => {
    const label = getDayGroupLabel(entry.playedAt);
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label).push(entry);
  });

  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items,
  }));
}

export function getUniqueRecentSongs(entries, limit = 12) {
  const seen = new Set();
  const unique = [];

  for (const entry of entries) {
    if (!entry.song || seen.has(entry.song.id)) continue;
    seen.add(entry.song.id);
    unique.push(entry.song);
    if (unique.length >= limit) break;
  }

  return unique;
}

export function getHistoryStats(entries) {
  const songIds = new Set();
  const artists = new Set();

  entries.forEach(({ song }) => {
    if (!song) return;
    songIds.add(song.id);
    if (song.artist) artists.add(song.artist);
  });

  return {
    totalPlays: entries.length,
    uniqueSongs: songIds.size,
    uniqueArtists: artists.size,
  };
}
