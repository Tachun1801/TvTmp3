/**
 * Stats API — Data Access Layer (REAL API)
 *
 * Thống kê cho Profile Page. Backend trả 4 con số, field khớp thẳng với
 * StatsResponse — không cần map.
 */

import client from './client';

// ============================================================
// GET /api/v1/me/stats — Thống kê user (cần token)
// Response: { songsPlayed, favorites, uploads, daysActive }
//
// Backend query:
//   SELECT COUNT(*) FROM play_history WHERE user_id = ?       → songsPlayed
//   SELECT COUNT(*) FROM favorite_songs WHERE user_id = ?     → favorites
//   SELECT COUNT(*) FROM songs WHERE user_id = ?              → uploads
//   SELECT COUNT(DISTINCT DATE(played_at))
//     FROM play_history WHERE user_id = ?                     → daysActive
// ============================================================

export async function getMyStats() {
  const res = await client.get('/api/v1/me/stats');
  return res.data;
}
