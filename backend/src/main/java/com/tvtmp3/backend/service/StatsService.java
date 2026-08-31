package com.tvtmp3.backend.service;

import org.springframework.stereotype.Service;

import com.tvtmp3.backend.dto.StatsResponse;
import com.tvtmp3.backend.repository.FavoriteSongRepository;
import com.tvtmp3.backend.repository.PlayHistoryRepository;
import com.tvtmp3.backend.repository.SongRepository;
import com.tvtmp3.backend.security.SecurityUtils;

/**
 * Thống kê cá nhân — 4 chỉ số khớp SQL trong frontend/src/api/GUIDE.md:
 *   songsPlayed : COUNT(*) FROM play_history WHERE user_id = ?
 *   favorites   : COUNT(*) FROM favorite_songs WHERE user_id = ?
 *   uploads     : COUNT(*) FROM songs WHERE user_id = ?
 *   daysActive  : COUNT(DISTINCT DATE(played_at)) FROM play_history WHERE user_id = ?
 */
@Service
public class StatsService {

    private final PlayHistoryRepository playHistoryRepository;
    private final FavoriteSongRepository favoriteRepository;
    private final SongRepository songRepository;

    public StatsService(PlayHistoryRepository playHistoryRepository,
                        FavoriteSongRepository favoriteRepository,
                        SongRepository songRepository) {
        this.playHistoryRepository = playHistoryRepository;
        this.favoriteRepository = favoriteRepository;
        this.songRepository = songRepository;
    }

    public StatsResponse getStats() {
        Long userId = SecurityUtils.getCurrentUserId();
        return new StatsResponse(
                playHistoryRepository.countByUser_UserId(userId),
                favoriteRepository.countByUser_UserId(userId),
                songRepository.countByUser_UserId(userId),
                playHistoryRepository.countDistinctDays(userId));
    }
}
