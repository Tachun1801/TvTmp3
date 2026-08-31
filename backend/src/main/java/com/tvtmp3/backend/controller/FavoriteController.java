package com.tvtmp3.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tvtmp3.backend.dto.FavoriteRequest;
import com.tvtmp3.backend.dto.PageResponse;
import com.tvtmp3.backend.dto.SongDto;
import com.tvtmp3.backend.service.FavoriteService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * Endpoint yêu thích — CẦN TOKEN (SecurityConfig: anyRequest().authenticated()).
 * User được xác định từ token trong service (SecurityUtils), không phải body.
 */
@RestController
@RequestMapping("/api/v1/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    /** GET /api/v1/favorites — danh sách yêu thích, mới thêm trước. */
    @GetMapping
    public PageResponse<SongDto> getFavorites(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return favoriteService.getFavorites(page, size);
    }

    /** POST /api/v1/favorites — thêm vào yêu thích. Response { success: true }. */
    @PostMapping
    public Map<String, Boolean> add(@Valid @RequestBody FavoriteRequest request) {
        favoriteService.addFavorite(request.songId());
        return Map.of("success", true);
    }

    /** DELETE /api/v1/favorites/{songId} — xóa khỏi yêu thích. */
    @DeleteMapping("/{songId}")
    public Map<String, Boolean> remove(@PathVariable Long songId) {
        favoriteService.removeFavorite(songId);
        return Map.of("success", true);
    }
}
