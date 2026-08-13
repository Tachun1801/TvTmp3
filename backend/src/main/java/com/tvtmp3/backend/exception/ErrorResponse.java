package com.tvtmp3.backend.exception;

/**
 * Khuôn mẫu THỐNG NHẤT cho mọi body lỗi trả về cho frontend.
 *
 * === VÌ SAO CẦN ===
 * Frontend đọc lỗi qua:  err.response?.data?.message
 * (xem frontend/src/contexts/AuthContext.jsx dòng ~36, 53, 69)
 *
 * Body lỗi mặc định của Spring Boot KHÔNG có field `message`, nên nếu không
 * dùng class này, UI chỉ hiển thị được thông báo fallback chung chung
 * ("Đăng nhập thất bại") thay vì lỗi cụ thể ("Sai mật khẩu", "Email đã tồn tại").
 *
 * === VÍ DỤ JSON THỰC TẾ GỬI VỀ CLIENT ===
 *   { "code": "NOT_FOUND", "message": "Không tìm thấy Song với id = 99" }
 *   { "code": "VALIDATION_ERROR", "message": "Trường 'email' không hợp lệ: must not be blank" }
 *
 * `record` là tính năng Java 16+ (project dùng Java 21):
 * tự sinh constructor, getter, equals, hashCode, toString — không cần Lombok.
 */
public record ErrorResponse(String code, String message) {
}
