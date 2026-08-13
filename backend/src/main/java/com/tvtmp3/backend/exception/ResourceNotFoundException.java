package com.tvtmp3.backend.exception;

/**
 * Ném khi KHÔNG TÌM THẤY dữ liệu trong database -> client nhận HTTP 404.
 *
 * === KHI NÀO DÙNG ===
 * - GET /api/v1/songs/{id} mà id không tồn tại
 * - DELETE /api/v1/favorites/{songId} mà bài hát không có
 * - Bất kỳ chỗ nào gọi findById(...) mà kết quả rỗng
 *
 * === CÁCH DÙNG TRONG SERVICE ===
 *   Song song = songRepository.findById(songId)
 *           .orElseThrow(() -> new ResourceNotFoundException("Song", songId));
 *
 *   // hoặc tự viết message:
 *   throw new ResourceNotFoundException("Không tìm thấy bài hát trong danh sách yêu thích");
 *
 * === VÌ SAO KHÔNG DÙNG CHECK IF NULL ===
 * Cách cũ: `if (song == null) return ResponseEntity.notFound()...`
 * Nhược điểm: controller phải tự xử lý, mỗi nơi một kiểu, dễ quên.
 * Cách này: service cứ ném, GlobalExceptionHandler bắt tập trung 1 chỗ -> code gọn.
 *
 * Exception này extends RuntimeException (unchecked) nên KHÔNG bắt buộc khai báo
 * `throws` ở mọi method gọi nó.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Tự do đặt nội dung message.
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Sinh message tự động theo mẫu: "Không tìm thấy Song với id = 99".
     * resourceName: tên entity, VD "Song", "User", "Genre".
     * id: giá trị khóa chính đang tìm.
     */
    public ResourceNotFoundException(String resourceName, Object id) {
        super("Không tìm thấy " + resourceName + " với id = " + id);
    }
}
