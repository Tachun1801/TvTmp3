package com.tvtmp3.backend.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tvtmp3.backend.entity.PlayHistory;

@Repository
public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {

    /** Lịch sử nghe của 1 user, mới nhất trước — GET /api/v1/history. */
    Page<PlayHistory> findByUser_UserIdOrderByPlayedAtDesc(Long userId, Pageable pageable);

    /** Tổng lượt nghe của 1 user — stats.songsPlayed. */
    long countByUser_UserId(Long userId);

    /** Số ngày hoạt động (distinct date) của 1 user — stats.daysActive. */
    @Query(value = """
            SELECT COUNT(DISTINCT DATE(played_at)) FROM play_history WHERE user_id = :userId
            """, nativeQuery = true)
    long countDistinctDays(@Param("userId") Long userId);

    /**
     * Đếm tổng lượt nghe của MỌI bài hát — charts alltime.
     * Trả về [songId, count] để service tự gom vào Map.
     */
    @Query("SELECT h.song.songId, COUNT(h) FROM PlayHistory h GROUP BY h.song.songId")
    List<Object[]> countAllPlays();

    /** Đếm lượt nghe trong 1 khoảng thời gian — charts weekly/monthly. */
    @Query("""
            SELECT h.song.songId, COUNT(h) FROM PlayHistory h
            WHERE h.playedAt >= :since
            GROUP BY h.song.songId
            """)
    List<Object[]> countPlaysSince(@Param("since") Instant since);

    /**
     * Đếm lượt nghe của 1 TẬP bài hát — batch playCount cho các list endpoint
     * (quy tắc N+1: 1 query cho cả trang thay vì N query từng bài).
     */
    @Query("""
            SELECT h.song.songId, COUNT(h) FROM PlayHistory h
            WHERE h.song.songId IN :songIds
            GROUP BY h.song.songId
            """)
    List<Object[]> countPlaysBySongIds(@Param("songIds") List<Long> songIds);
}
