package com.tvtmp3.backend.dto;

/**
 * Thống kê cá nhân — trả về ở GET /api/v1/me/stats.
 *
 * 4 chỉ số khớp đúng backend query trong frontend/src/api/GUIDE.md:
 *   songsPlayed : SELECT COUNT(*) FROM play_history WHERE user_id = ?
 *   favorites   : SELECT COUNT(*) FROM favorite_songs WHERE user_id = ?
 *   uploads     : SELECT COUNT(*) FROM songs WHERE user_id = ?
 *   daysActive  : SELECT COUNT(DISTINCT DATE(played_at)) FROM play_history WHERE user_id = ?
 */
public record StatsResponse(
        long songsPlayed,   // tổng lượt nghe
        long favorites,     // số bài hát yêu thích
        long uploads,       // số bài hát đã upload
        long daysActive     // số ngày có hoạt động nghe nhạc
) {
}
