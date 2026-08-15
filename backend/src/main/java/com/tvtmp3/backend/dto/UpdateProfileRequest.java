package com.tvtmp3.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

/**
 * Body của PUT /api/v1/auth/me — cập nhật thông tin cá nhân.
 * Không cho đổi email/password ở đây (2 thứ đó cần flow riêng, cẩn thận hơn).
 */
public record UpdateProfileRequest(
        @NotBlank(message = "Họ tên không được để trống")
        String fullName,

        LocalDate birth // có thể null — nghĩa là xóa ngày sinh
) {
}
