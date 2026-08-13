package com.tvtmp3.backend.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Nơi DUY NHẤT trong project làm việc với JWT: tạo token khi đăng nhập,
 * đọc/verify token khi có request gửi lên.
 *
 * === JWT LÀ GÌ (tóm tắt) ===
 * Token là chuỗi "xxx.yyy.zzz" gồm 3 phần base64:
 *   xxx = header   (thuật toán ký, VD HS256)
 *   yyy = payload  (dữ liệu: userId, thời gian hết hạn...)
 *   zzz = chữ ký   (được tạo bằng secret, dùng để chống giả mạo)
 *
 * Server KHÔNG lưu token vào DB — chỉ cần secret để kiểm tra chữ ký.
 * Ai không có secret thì không thể tự chế token giả.
 *
 * === LUỒNG SỬ DỤNG ===
 * Login thành công  -> generateToken(userId) trả token cho client
 * Request gửi lên   -> JwtAuthenticationFilter gọi extractUserId(token) để
 *                      kiểm tra chữ ký + hạn dùng, lấy lại userId
 */
@Component
public class JwtService {

    private final String secret;
    private final long expirationMs;

    // @Value đọc giá trị từ application.properties (mục JWT)
    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.secret = secret;
        this.expirationMs = expirationMs;
    }

    /**
     * Tạo token mới cho user — gọi sau khi login/register thành công.
     *
     * @param userId userId cần nhét vào token
     * @return chuỗi JWT gửi về client, client để trong header
     *         Authorization: Bearer <token>
     */
    public String generateToken(Long userId) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .subject(String.valueOf(userId))          // payload: ai là chủ token
                .issuedAt(new Date(now))                  // thời điểm phát hành
                .expiration(new Date(now + expirationMs)) // thời điểm hết hạn
                .signWith(getKey())                       // ký bằng HS256 + secret
                .compact();                               // nén thành chuỗi xxx.yyy.zzz
    }

    /**
     * Đọc userId từ token, đồng thời KIỂM TRA chữ ký và hạn dùng.
     *
     * @return userId nếu token hợp lệ
     * @throws io.jsonwebtoken.JwtException nếu token sai chữ ký / hết hạn /
     *         sai cấu trúc — caller (JwtAuthenticationFilter) sẽ catch và
     *         coi như chưa đăng nhập
     */
    public Long extractUserId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getKey())   // nếu chữ ký không khớp -> ném lỗi ngay
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return Long.parseLong(claims.getSubject());
    }

    /**
     * Chuyển secret (String trong config) thành SecretKey cho thuật toán HS256.
     * HS256 yêu cầu secret >= 32 byte nên application.properties đã dùng
     * chuỗi đủ dài.
     */
    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
