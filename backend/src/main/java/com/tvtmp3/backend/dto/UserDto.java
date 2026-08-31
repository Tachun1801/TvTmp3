package com.tvtmp3.backend.dto;

import java.time.Instant;
import java.time.LocalDate;

import com.tvtmp3.backend.entity.User;

/**
 * Thông tin user trả về cho client.
 *
 * === QUY TẮC QUAN TRỌNG ===
 * KHÔNG BAO GIỜ có field password trong DTO này — dù entity User có nó.
 * Nếu lỡ trả entity User ra JSON thì mật khẩu (dù đã băm BCrypt) cũng bị lộ.
 * Mọi nơi cần trả user (register, login, /auth/me, SongDto.uploader...)
 * đều dùng đúng class này.
 */
public record UserDto(
        Long userId,
        String email,
        String fullName,
        LocalDate birth,
        Instant createdAt   // users.created_at — FE hiển thị "Member since" ở ProfilePage
) {

    /** Chuyển entity -> DTO. Dùng một nơi duy nhất để map khớp nhau toàn app. */
    public static UserDto from(User user) {
        return new UserDto(
                user.getUserId(),
                user.getEmail(),
                user.getFullName(),
                user.getBirth(),
                user.getCreateAt()
        );
    }
}
