package com.tvtmp3.backend.exception;

/**
 * Ném khi request CÓ Ý NGHĨA NHƯNG VI PHẠM QUY TẮC NGHIỆP VỤ
 * -> client nhận HTTP 400.
 *
 * === PHÂN BIỆT VỚI LỖI VALIDATION (@Valid) ===
 * - @Valid (@NotBlank, @Email...): kiểm tra ĐỊNH DẠNG từng field, tự động ở DTO.
 * - BadRequestException: kiểm tra LOGIC cần truy vấn DB hoặc quy tắc phức tạp,
 *   service tự ném thủ công.
 *
 * === VÍ DỤ KHI NÀO DÙNG ===
 * - Đăng ký mà email đã tồn tại trong DB
 * - POST /api/v1/favorites mà bài hát đã được yêu thích rồi (trùng lặp)
 * - sort phải là 1 trong {latest, popular} mà client gửi giá trị khác
 *
 * === CÁCH DÙNG ===
 *   if (userRepository.existsByEmail(request.email())) {
 *       throw new BadRequestException("Email đã tồn tại, vui lòng dùng email khác");
 *   }
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
