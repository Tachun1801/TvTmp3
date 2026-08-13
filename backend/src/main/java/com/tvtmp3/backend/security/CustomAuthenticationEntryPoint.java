package com.tvtmp3.backend.security;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import tools.jackson.databind.ObjectMapper;
import com.tvtmp3.backend.exception.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Được Spring Security gọi khi client truy cập endpoint CẦN ĐĂNG NHẬP
 * mà chưa có token hợp lệ -> trả HTTP 401 với body JSON chuẩn ErrorResponse.
 *
 * === VÌ SAO PHẢI TỰ VIẾT JSON Ở ĐÂY ===
 * Class này chạy BÊN TRONG chuỗi filter của Spring Security — trước khi
 * request tới DispatcherServlet. Vì vậy GlobalExceptionHandler
 * (@RestControllerAdvice) KHÔNG bắt được lỗi phát sinh ở đây, nếu không
 * tự viết response thì client nhận 401 với body rỗng, frontend không
 * biết lỗi gì.
 *
 * === VÌ SAO PHẢI ĐÚNG STATUS 401 ===
 * frontend/src/api/client.js có interceptor: nhận 401 -> xóa token khỏi
 * localStorage (đăng xuất). Trả sai status sẽ phá vỡ cơ chế này.
 */
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    // ObjectMapper (Jackson) do Spring Boot tự cấu hình sẵn — dùng để
    // biến ErrorResponse thành chuỗi JSON
    public CustomAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
        response.setContentType("application/json;charset=UTF-8");

        // Ghi body JSON giống hệt format của GlobalExceptionHandler
        objectMapper.writeValue(response.getWriter(),
                new ErrorResponse("UNAUTHORIZED", "Bạn cần đăng nhập để thực hiện thao tác này"));
    }
}
