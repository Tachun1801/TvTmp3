package com.tvtmp3.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tvtmp3.backend.entity.Song;

/**
 * Truy vấn bảng songs.
 *
 * Genre filter lọc theo genre NAME (không phải id) vì frontend điều hướng
 * /genres/:genreName và gửi tên lên query param `genre`.
 */
@Repository
public interface SongRepository extends JpaRepository<Song, Long> {

    /**
     * Danh sách bài hát mới nhất — có thể lọc theo tên genre.
     * ORDER BY songId DESC làm tie-break ổn định khi createdAt trùng.
     */
    @Query("""
            SELECT s FROM Song s
            WHERE (:genreName IS NULL OR s.songId IN
                (SELECT sg.song.songId FROM SongGenre sg WHERE sg.genre.name = :genreName))
            ORDER BY s.createdAt DESC, s.songId DESC
            """)
    Page<Song> findAllLatest(@Param("genreName") String genreName, Pageable pageable);

    /**
     * Danh sách bài hát theo độ PHỔ BIẾN — đếm tổng lượt nghe từ play_history
     * (bảng songs không có cột play_count, số liệu phải tính động).
     */
    @Query("""
            SELECT s FROM Song s
            LEFT JOIN PlayHistory h ON h.song = s
            WHERE (:genreName IS NULL OR s.songId IN
                (SELECT sg.song.songId FROM SongGenre sg WHERE sg.genre.name = :genreName))
            GROUP BY s.songId
            ORDER BY COUNT(h) DESC, s.songId DESC
            """)
    Page<Song> findAllPopular(@Param("genreName") String genreName, Pageable pageable);

    /**
     * Tìm kiếm theo tiêu đề HOẶC tên người upload (không phân biệt hoa thường).
     */
    @Query("""
            SELECT s FROM Song s
            WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(s.user.fullName) LIKE LOWER(CONCAT('%', :q, '%'))
            ORDER BY s.createdAt DESC, s.songId DESC
            """)
    Page<Song> search(@Param("q") String q, Pageable pageable);

    /** Bài hát của 1 user — GET /api/v1/me/songs. */
    Page<Song> findByUser_UserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** Số bài đã upload của 1 user — stats. */
    long countByUser_UserId(Long userId);
}
