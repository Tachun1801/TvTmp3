package com.tvtmp3.backend.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Chạy ĐÚNG 1 LẦN cho mỗi request tới server (OncePerRequestFilter đảm bảo
 * điều này, kể cả khi request bị forward nhiều lần).
 *
 * Nhiệm vụ:
 *   1. Đọc header  Authorization: Bearer <token>
 *   2. Token hợp lệ -> "đăng nhập" user bằng cách gắn userId vào SecurityContext
 *   3. Không có token / token sai -> cứ cho request đi tiếp với trạng thái
 *      "chưa đăng nhập"
 *
 * === VÌ SAO TOKEN SAI KHÔNG NÉM LỖI NGAY Ở ĐÂY ===
 * Có những endpoint công khai không cần token (xem danh sách bài hát...).
 * Nếu filter ném 401 ngay thì endpoint công khai sẽ chết khi client gửi kèm
 * token cũ/hết hạn. Cách đúng: filter chỉ "xác định danh tính nếu có thể",
 * việc chặn endpoint nào cần đăng nhập do authorizeHttpRequests trong
 * SecurityConfig quyết định — lúc đó mới gọi AuthenticationEntryPoint trả 401.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // Chỉ xử lý khi header có đúng dạng: Bearer <token>
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            String token = header.substring(BEARER_PREFIX.length());

            try {
                Long userId = jwtService.extractUserId(token);

                // Tạo đối tượng authentication đại diện cho user đang gọi API:
                // - principal = userId -> service đọc bằng SecurityUtils.getCurrentUserId()
                // - credentials = null (token đã verify rồi, không cần giữ)
                // - authorities rỗng vì project chưa có phân vai trò admin/user
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, List.of());

                // Gắn thêm thông tin request (IP...) để có thể log/kiểm tra sau này
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // Đưa vào SecurityContext: từ giờ request này được coi là "đã đăng nhập"
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtException | IllegalArgumentException e) {
                // Token sai chữ ký / hết hạn / sai cấu trúc -> coi như CHƯA đăng nhập.
                // Không ném lỗi ở đây, lý do xem comment đầu file.
                SecurityContextHolder.clearContext();
            }
        }

        // LUÔN cho request đi tiếp vào chuỗi filter phía sau
        // (tầng authorizeHttpRequests sẽ kiểm tra quyền)
        filterChain.doFilter(request, response);
    }
}
