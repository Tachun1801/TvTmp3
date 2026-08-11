/**
 * Mock data — Play history (lịch sử nghe)
 *
 * Backend thật: bảng play_history (history_id, user_id, song_id, played_at).
 * API trả về: { id, song, playedAt }
 */

import { mockSongs } from './songs';

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

// Mỗi user có 1 mảng history entries (playedAt tương đối để demo UI)
const historyMap = new Map([
  [
    1,
    [
      { id: 101, songId: 8, playedAt: hoursAgo(1) },
      { id: 102, songId: 14, playedAt: hoursAgo(3) },
      { id: 103, songId: 20, playedAt: hoursAgo(5) },
      { id: 104, songId: 4, playedAt: hoursAgo(28) },
      { id: 105, songId: 11, playedAt: hoursAgo(30) },
      { id: 106, songId: 7, playedAt: hoursAgo(48) },
      { id: 107, songId: 1, playedAt: hoursAgo(120) },
    ],
  ],
  [
    2,
    [
      { id: 201, songId: 5, playedAt: hoursAgo(2) },
      { id: 202, songId: 11, playedAt: hoursAgo(6) },
    ],
  ],
]);

function getHistoryForUser(userId) {
  return historyMap.get(userId) || [];
}

export function mockGetHistory(userId) {
  const entries = getHistoryForUser(userId);
  return entries
    .map((e) => {
      const song = mockSongs.find((s) => s.id === e.songId);
      return song ? { id: e.id, song, playedAt: e.playedAt } : null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
}

export function mockRecordPlay(userId, songId) {
  const entries = getHistoryForUser(userId);
  entries.unshift({
    id: Date.now(),
    songId,
    playedAt: new Date().toISOString(),
  });
  if (!historyMap.has(userId)) historyMap.set(userId, entries);
  return { success: true };
}
