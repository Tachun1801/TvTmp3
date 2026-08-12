package com.tvtmp3.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tvtmp3.backend.entity.FavoriteSong;
import com.tvtmp3.backend.entity.FavoriteSongId;

@Repository
public interface FavoriteSongRepository extends JpaRepository<FavoriteSong, FavoriteSongId> {
 
}
