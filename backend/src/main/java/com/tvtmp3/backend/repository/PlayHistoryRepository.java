package com.tvtmp3.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tvtmp3.backend.entity.PlayHistory;

@Repository
public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {
}
