package com.tvtmp3.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tvtmp3.backend.entity.SongGenre;
import com.tvtmp3.backend.entity.SongGenreId;

@Repository
public interface SongGenreRepository extends JpaRepository<SongGenre, SongGenreId> {

    /**
     * Lấy tên genre của 1 TẬP bài hát — batch query cho SongDto.genres
     * (quy tắc N+1: 1 query cho cả trang thay vì N query từng bài).
     * Trả về [songId, genreName].
     */
    @Query("""
            SELECT sg.song.songId, sg.genre.name FROM SongGenre sg
            WHERE sg.song.songId IN :songIds
            ORDER BY sg.genre.name
            """)
    List<Object[]> findGenreNamesBySongIds(@Param("songIds") List<Long> songIds);
}
