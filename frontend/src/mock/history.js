/**
 * Mock data — Play history (lịch sử nghe)
 *
 * Backend thật: bảng play_history (history_id, user_id, song_id, played_at).
 * API trả về: { id, song, playedAt }
 */

import { mockSongs } from './songs';

// Mỗi user có 1 mảng history entries
const historyMap = new Map([
  [
    1,
    [
      { id: 101, songId: 8, playedAt: '2024-09-20T08:00:00Z' },
      { id: 102, songId: 14, playedAt: '2024-09-20T07:50:00Z' },
      { id: 103, songId: 20, playedAt: '2024-09-20T07:30:00Z' },
      { id: 104, songId: 4, playedAt: '2024-09-19T22:00:00Z' },
      { id: 105, songId: 11, playedAt: '2024-09-19T21:00:00Z' },
      { id: 106, songId: 7, playedAt: '2024-09-19T18:00:00Z' },
      { id: 107, songId: 1, playedAt: '2024-09-19T12:00:00Z' },
    ],
  ],
  [
    2,
    [
      { id: 201, songId: 5, playedAt: '2024-09-20T09:00:00Z' },
      { id: 202, songId: 11, playedAt: '2024-09-20T08:00:00Z' },
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
