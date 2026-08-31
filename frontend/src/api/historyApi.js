/**
 * History API — Data Access Layer (REAL API)
 *
 * Backend trả { historyId, song: SongDto, playedAt } → map về shape FE
 * { id, song, playedAt } qua toFeSong — nơi DUY NHẤT biết shape backend.
 */

import client from './client';
import { toFeSong } from './normalizers';
import { getSessionUserId } from './session';

// ============================================================
// GET /api/v1/history — Lịch sử nghe — Vinh (RecentlyPlayedPage)
// Response: [{ id, song: {...}, playedAt }]
// ============================================================

export async function getHistory() {
  const res = await client.get('/api/v1/history', { params: { page: 1, size: 50 } });
  return res.data.data.map((h) => ({
    id: h.historyId,
    song: toFeSong(h.song),
    playedAt: h.playedAt,
  }));
}

// ============================================================
// POST /api/v1/history — Ghi nhận lượt nghe (khi phát nhạc)
// Body: { songId }
// Response: { success: true }
// ============================================================

export async function recordPlay(songId) {
  // Chưa đăng nhập → bỏ qua im lặng, không gọi API chắc chắn 401
  if (getSessionUserId() == null) return { success: true };
  const res = await client.post('/api/v1/history', { songId });
  return res.data;
}
