package com.tvtmp3.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.tvtmp3.backend.exception.UnauthorizedException;

/**
 * Helper cho Service lấy userId của người đang gọi API.
 *
 * === VÌ SAO CẦN ===
 * Cách cũ: controller đọc userId rồi truyền xuống từng method của service —
 * lặp lại khắp nơi và dễ quên kiểm tra. SecurityUtils cho phép service
 * tự lấy đúng một chỗ, đúng một cách.
 *
 * === CÁCH DÙNG TRONG SERVICE ===
 *   Long userId = SecurityUtils.getCurrentUserId();
 *   // rồi dùng như bình thường:
 *   List<PlayHistory> history = playHistoryRepository.findByUserId(userId);
 */
public final class SecurityUtils {

    // Class tiện ích toàn method static -> không cho phép tạo instance
    private SecurityUtils() {
    }

    /**
     * Lấy userId của người đang đăng nhập, do JwtAuthenticationFilter gắn vào
     * SecurityContext trước khi request đi vào controller.
     *
     * @return userId hiện tại
     * @throws UnauthorizedException nếu request chưa đăng nhập
     *         (về lý thuyết không xảy ra ở endpoint đã chặn trong
     *         SecurityConfig, nhưng vẫn kiểm tra để code an toàn)
     */
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // principal phải là Long userId (xem JwtAuthenticationFilter)
        if (authentication != null && authentication.getPrincipal() instanceof Long userId) {
            return userId;
        }

        throw new UnauthorizedException("Bạn cần đăng nhập để thực hiện thao tác này");
    }
}
