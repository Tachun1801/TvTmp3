package com.tvtmp3.backend.dto;

/**
 * Response của register + login: thông tin user + JWT token.
 *
 * Frontend (AuthContext) lưu token vào localStorage và gắn vào header
 * Authorization: Bearer <token> cho các request sau — khớp cấu trúc
 * { user, token } mà mock/frontend đã code sẵn.
 */
public record AuthResponse(
        UserDto user,
        String token
) {
}
