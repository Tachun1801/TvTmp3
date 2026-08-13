package com.tvtmp3.backend.security;

import java.io.IOException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import tools.jackson.databind.ObjectMapper;
import com.tvtmp3.backend.exception.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Được Spring Security gọi khi client ĐÃ ĐĂNG NHẬP nhưng không đủ quyền
 * thực hiện thao tác -> trả HTTP 403 với body JSON chuẩn ErrorResponse.
 *
 * === KHI NÀO XẢY RA ===
 * - Sau này có role admin: user thường gọi API của admin
 * - @PreAuthorize trên controller/service từ chối quyền
 *
 * Cùng lý do phải tự viết JSON như CustomAuthenticationEntryPoint:
 * nằm trong filter chain, GlobalExceptionHandler không bắt được.
 */
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public CustomAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
        response.setContentType("application/json;charset=UTF-8");

        objectMapper.writeValue(response.getWriter(),
                new ErrorResponse("FORBIDDEN", "Bạn không có quyền thực hiện thao tác này"));
    }
}
