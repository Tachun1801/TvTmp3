package com.tvtmp3.backend.exception;

/**
 * Ném khi client CHƯA ĐĂNG NHẬP hoặc THÔNG TIN XÁC THỰC SAI
 * -> client nhận HTTP 401.
 *
 * === KHI NÀO DÙNG ===
 * - Đăng nhập sai email/mật khẩu
 * - Token JWT hết hạn, sai chữ ký, hoặc không gửi token
 *
 * === LƯU Ý QUAN TRỌNG ===
 * Frontend có xử lý riêng cho 401 trong client.js:
 *   if (error.response?.status === 401) -> xóa token khỏi localStorage (logout)
 * nên mọi lỗi "không xác thực được" PHẢI dùng đúng 401 để cơ chế này chạy.
 *
 * === CÁCH DÙNG ===
 *   if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
 *       throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
 *   }
 *
 * === TRƯỜNG HỢP ĐẶC BIỆT: SPRING SECURITY ===
 * Exception ném trong filter chain của Spring Security KHÔNG đi qua
 * GlobalExceptionHandler. Lỗi 401 ở đó do CustomAuthenticationEntryPoint
 * trả về (vẫn dùng chung ErrorResponse nên format giống hệt các lỗi khác).
 * Còn khi ném từ controller/service (sai mật khẩu khi login...), exception
 * vẫn đi qua GlobalExceptionHandler như bình thường.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
