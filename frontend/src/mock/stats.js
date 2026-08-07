/**
 * Mock data — Stats (thống kê user)
 *
 * Backend thật: GET /api/v1/me/stats
 * Response: { songsPlayed, favorites, uploads, daysActive }
 *
 * Backend query:
 *   SELECT COUNT(*) FROM play_history WHERE user_id = ?          → songsPlayed
 *   SELECT COUNT(*) FROM favorite_songs WHERE user_id = ?         → favorites
 *   SELECT COUNT(*) FROM songs WHERE user_id = ?                  → uploads
 *   SELECT COUNT(DISTINCT DATE(played_at))
 *     FROM play_history WHERE user_id = ?                         → daysActive
 */

export const mockStats = {
  songsPlayed: 1247,
  favorites: 86,
  uploads: 12,
  daysActive: 142,
};
