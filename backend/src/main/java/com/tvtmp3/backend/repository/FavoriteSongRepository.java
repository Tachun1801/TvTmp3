package com.tvtmp3.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tvtmp3.backend.entity.FavoriteSong;
import com.tvtmp3.backend.entity.FavoriteSongId;
import com.tvtmp3.backend.entity.Song;

@Repository
public interface FavoriteSongRepository extends JpaRepository<FavoriteSong, FavoriteSongId> {

    /**
     * Danh sách bài hát yêu thích của 1 user — mới thêm vào trước.
     * Trả trực tiếp Song (không phải FavoriteSong) vì frontend chỉ cần bài hát.
     */
    @Query("""
            SELECT f.song FROM FavoriteSong f
            WHERE f.user.userId = :userId
            ORDER BY f.createdAt DESC
            """)
    Page<Song> findFavoriteSongs(@Param("userId") Long userId, Pageable pageable);

    /** Số bài yêu thích của 1 user — stats.favorites. */
    long countByUser_UserId(Long userId);
}
