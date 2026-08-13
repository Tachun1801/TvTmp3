package com.tvtmp3.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.tvtmp3.backend.security.CustomAccessDeniedHandler;
import com.tvtmp3.backend.security.CustomAuthenticationEntryPoint;
import com.tvtmp3.backend.security.JwtAuthenticationFilter;

/**
 * Cấu hình trung tâm của Spring Security.
 *
 * === TỔNG QUAN LUỒNG MỘT REQUEST ===
 *   Request đến
 *     -> CORS filter (trả lời preflight OPTIONS, chặn origin lạ)
 *     -> JwtAuthenticationFilter (đọc Bearer token, xác định "ai đang gọi")
 *     -> authorizeHttpRequests (kiểm tra endpoint này có cần đăng nhập không?)
 *         - không cần (permitAll) -> đi thẳng vào controller
 *         - cần mà chưa đăng nhập  -> CustomAuthenticationEntryPoint trả 401
 *         - cần mà đã đăng nhập    -> đi vào controller
 *
 * === CHÚ Ý: KHI THÊM ENDPOINT MỚI ===
 * Mọi endpoint KHÔNG nằm trong danh sách permitAll() bên dưới đều mặc định
 * YÊU CẦU đăng nhập (anyRequest().authenticated()).
 * Khi thêm endpoint công khai mới, nhớ khai báo ở đây, nếu không frontend
 * sẽ nhận 401.
 */
@Configuration
public class SecurityConfig {

    /**
     * Chuỗi lọc bảo mật — nơi định nghĩa quy tắc cho TOÀN BỘ request.
     *
     * @param http do Spring Boot tự truyền vào, dùng để ráp các filter
     * @return SecurityFilterChain đã cấu hình xong
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomAuthenticationEntryPoint authenticationEntryPoint,
            CustomAccessDeniedHandler accessDeniedHandler) throws Exception {

        http
            // Tắt CSRF: CSRF chỉ cần cho web dùng form + cookie session.
            // API xác thực bằng Bearer token trong header nên không bị tấn
            // công kiểu CSRF, tắt đi cho đỡ vướng.
            .csrf(AbstractHttpConfigurer::disable)

            // Bật CORS với cấu hình ở bean corsConfigurationSource() bên dưới.
            // Khi bật, Spring Security đặt CorsFilter TRƯỚC chuỗi lọc, nên
            // request preflight OPTIONS được trả lời tự động, KHÔNG đi qua
            // authorizeHttpRequests — không cần permitAll() cho OPTIONS.
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // STATELESS: server KHÔNG tạo session, không lưu trạng thái đăng
            // nhập. Mỗi request phải tự mang token — chuẩn cho API + JWT.
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Lỗi xác thực (chưa đăng nhập) -> 401 JSON
            // Lỗi phân quyền (không đủ quyền) -> 403 JSON
            .exceptionHandling(handler -> handler
                    .authenticationEntryPoint(authenticationEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler))

            .authorizeHttpRequests(auth -> auth
                    // --- ENDPOINT CÔNG KHAI (không cần token) ---
                    // /error: trang lỗi mặc định của Spring Boot phải truy cập được
                    .requestMatchers("/error").permitAll()

                    // Đăng ký + đăng nhập: ai cũng được gọi
                    .requestMatchers(HttpMethod.POST,
                            "/api/v1/auth/register", "/api/v1/auth/login").permitAll()

                    // Xem danh sách/chi tiết/nghe bài hát + danh sách thể loại:
                    // công khai cho cả người chưa đăng nhập
                    .requestMatchers(HttpMethod.GET,
                            "/api/v1/songs/**", "/api/v1/genres/**").permitAll()

                    // --- MỌI ENDPOINT CÒN LẠI ĐỀU CẦN ĐĂNG NHẬP ---
                    // (upload/xóa bài hát, favorites, history, /auth/me,
                    //  /me/songs, /me/stats...)
                    .anyRequest().authenticated())

            // Không dùng form login / basic auth mặc định của Spring Security
            // (dự án đăng nhập qua JWT thủ công)
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)

            // Đặt JWT filter chạy TRƯỚC UsernamePasswordAuthenticationFilter:
            // đảm bảo danh tính (userId) đã được xác định trước khi Spring
            // Security kiểm tra quyền truy cập endpoint
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Bộ mã hóa mật khẩu BCrypt.
     *
     * === VÌ SAO PHẢI DÙNG BCrypt ===
     * - Tự thêm "muối" (salt) ngẫu nhiên cho MỖI mật khẩu -> 2 user cùng
     *   mật khẩu vẫn ra 2 chuỗi hash khác nhau
     * - Cố ý chạy CHẬM -> hacker không thể dò hàng triệu mật khẩu/giây
     * - Tuyệt đối KHÔNG dùng MD5/SHA thường cho mật khẩu
     *
     * === CÁCH DÙNG TRONG AUTH SERVICE ===
     *   user.setPassword(passwordEncoder.encode(rawPassword)); // khi register
     *   passwordEncoder.matches(rawPassword, user.getPassword()); // khi login
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Cấu hình CORS: cho phép frontend React (chạy ở http://localhost:5173)
     * gọi API từ trình duyệt.
     *
     * === GIẢI THÍCH CORS ===
     * Trình duyệt mặc định CHẶN trang web ở origin A gọi API ở origin B
     * (chính sách same-origin). CORS là cách server "đồng ý" cho một số
     * origin nhất định được gọi. Không cấu hình dòng này thì mọi request
     * từ frontend đều bị chặn với lỗi "CORS policy".
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Chỉ cho phép đúng origin của frontend dev
        // (deploy thật thì thêm domain production vào đây)
        config.setAllowedOrigins(List.of("http://localhost:5173"));

        // Các method thật mà frontend được gọi.
        // KHÔNG cần liệt kê OPTIONS ở đây: preflight được CorsFilter trả lời
        // tự động (xem comment ở phần .cors() phía trên)
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));

        // Cho phép mọi header (đặc biệt là Authorization gửi Bearer token)
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
