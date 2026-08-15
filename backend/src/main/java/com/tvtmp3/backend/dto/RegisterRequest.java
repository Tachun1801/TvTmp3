package com.tvtmp3.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Body của POST /api/v1/auth/register.
 *
 * Validation chạy khi controller có @Valid trước tham số:
 * request không hợp lệ -> MethodArgumentNotValidException ->
 * GlobalExceptionHandler trả 400 VALIDATION_ERROR (không cần code kiểm tra tay).
 */
public record RegisterRequest(
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        String email,

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
        String password,

        @NotBlank(message = "Họ tên không được để trống")
        String fullName,

        LocalDate birth // không bắt buộc
) {
}
