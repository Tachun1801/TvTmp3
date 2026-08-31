package com.tvtmp3.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tvtmp3.backend.dto.PageResponse;
import com.tvtmp3.backend.dto.SongDto;
import com.tvtmp3.backend.dto.StatsResponse;
import com.tvtmp3.backend.service.SongService;
import com.tvtmp3.backend.service.StatsService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * Endpoint "của tôi" — CẦN TOKEN (anyRequest().authenticated()).
 */
@RestController
@RequestMapping("/api/v1/me")
public class MeController {

    private final SongService songService;
    private final StatsService statsService;

    public MeController(SongService songService, StatsService statsService) {
        this.songService = songService;
        this.statsService = statsService;
    }

    /** GET /api/v1/me/songs — bài hát user đã upload, mới nhất trước. */
    @GetMapping("/songs")
    public PageResponse<SongDto> mySongs(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return songService.getMySongs(page, size);
    }

    /** GET /api/v1/me/stats — 4 chỉ số thống kê cá nhân. */
    @GetMapping("/stats")
    public StatsResponse myStats() {
        return statsService.getStats();
    }
}
