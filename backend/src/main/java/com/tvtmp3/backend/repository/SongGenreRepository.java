package com.tvtmp3.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tvtmp3.backend.entity.SongGenre;
import com.tvtmp3.backend.entity.SongGenreId;

@Repository
public interface SongGenreRepository extends JpaRepository<SongGenre, SongGenreId>{
}