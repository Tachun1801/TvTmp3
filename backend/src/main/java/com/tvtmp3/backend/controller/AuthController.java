package com.tvtmp3.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tvtmp3.backend.dto.AuthResponse;
import com.tvtmp3.backend.dto.LoginRequest;
import com.tvtmp3.backend.dto.RegisterRequest;
import com.tvtmp3.backend.dto.UpdateProfileRequest;
import com.tvtmp3.backend.dto.UserDto;
import com.tvtmp3.backend.service.AuthService;

import jakarta.validation.Valid;

/**
 * Endpoint xác thực — path khớp ĐÚNG frontend/src/api/GUIDE.md.
 *
 * Phân quyền đã khai trong SecurityConfig:
 *   POST /register, POST /login  → công khai (permitAll)
 *   GET /me, PUT /me             → cần token (anyRequest().authenticated())
 *
 * Controller KHÔNG chứa logic — chỉ nhận request, gọi service, trả DTO.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/v1/auth/register
     * @Valid kích hoạt validation trong RegisterRequest — lỗi thì
     * GlobalExceptionHandler tự trả 400 VALIDATION_ERROR.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)   // 201 Created — chuẩn REST cho tạo mới
                .body(authService.register(request));
    }

    /** POST /api/v1/auth/login — sai mật khẩu sẽ nhận 401 UNAUTHORIZED. */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** GET /api/v1/auth/me — trả thông tin người đang đăng nhập (userId lấy từ JWT). */
    @GetMapping("/me")
    public UserDto getMe() {
        return authService.getMe();
    }

    /** PUT /api/v1/auth/me — cập nhật fullName/birth. */
    @PutMapping("/me")
    public UserDto updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return authService.updateMe(request);
    }
}
