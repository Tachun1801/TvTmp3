package com.tvtmp3.backend.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Body của POST /api/v1/history — ghi nhận user vừa nghe một bài hát.
 * userId do service lấy từ token (SecurityUtils).
 */
public record HistoryRequest(
        @NotNull(message = "songId không được để trống")
        Long songId
) {
}
