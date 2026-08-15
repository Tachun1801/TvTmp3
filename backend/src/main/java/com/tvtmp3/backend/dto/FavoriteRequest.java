package com.tvtmp3.backend.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Body của POST /api/v1/favorites — thêm bài hát vào danh sách yêu thích.
 * Chỉ cần songId; userId do service lấy từ token (SecurityUtils).
 */
public record FavoriteRequest(
        @NotNull(message = "songId không được để trống")
        Long songId
) {
}
