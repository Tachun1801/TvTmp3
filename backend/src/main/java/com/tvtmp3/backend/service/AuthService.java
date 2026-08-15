package com.tvtmp3.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tvtmp3.backend.dto.AuthResponse;
import com.tvtmp3.backend.dto.LoginRequest;
import com.tvtmp3.backend.dto.RegisterRequest;
import com.tvtmp3.backend.dto.UpdateProfileRequest;
import com.tvtmp3.backend.dto.UserDto;
import com.tvtmp3.backend.entity.User;
import com.tvtmp3.backend.exception.BadRequestException;
import com.tvtmp3.backend.exception.ResourceNotFoundException;
import com.tvtmp3.backend.exception.UnauthorizedException;
import com.tvtmp3.backend.repository.UserRepository;
import com.tvtmp3.backend.security.JwtService;
import com.tvtmp3.backend.security.SecurityUtils;

/**
 * Xử lý đăng ký / đăng nhập / thông tin cá nhân.
 *
 * Đây là service ĐẦU TIÊN hoàn chỉnh trong project — xem nó như bản mẫu cho
 * các service khác: business logic ở đây, SQL ở repository, lỗi thì ném
 * exception (không try-catch), trả về DTO (không trả entity).
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;   // bean trong SecurityConfig (BCrypt)
    private final JwtService jwtService;             // package security — tạo token

    // Spring tự inject 3 dependency qua constructor (constructor injection)
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ============================================================
    // ĐĂNG KÝ
    // ============================================================

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. Kiểm tra quy tắc nghiệp vụ: email phải là duy nhất
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email đã tồn tại, vui lòng dùng email khác");
        }

        // 2. Tạo user — LUÔN mã hóa mật khẩu trước khi lưu.
        //    DB chỉ chứa chuỗi BCrypt, không bao giờ chứa mật khẩu thô.
        User user = new User();
        user.setEmail(request.email().trim().toLowerCase());  // chuẩn hóa để tránh trùng "A@gmail" vs "a@gmail"
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setBirth(request.birth());
        userRepository.save(user);   // save xong thì user.getUserId() đã có giá trị (IDENTITY)

        // 3. Cấp token luôn — đăng ký xong coi như đã đăng nhập (khớp flow frontend)
        String token = jwtService.generateToken(user.getUserId());
        return new AuthResponse(UserDto.from(user), token);
    }

    // ============================================================
    // ĐĂNG NHẬP
    // ============================================================

    public AuthResponse login(LoginRequest request) {
        // BẢO MẬT: email không tồn tại hay sai mật khẩu đều trả CHUNG 1 message —
        // không cho kẻ tấn công dò biết email nào đã đăng ký.
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không đúng"));

        // matches() tự xử lý salt + chống timing attack — đừng tự so sánh chuỗi hash
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
        }

        String token = jwtService.generateToken(user.getUserId());
        return new AuthResponse(UserDto.from(user), token);
    }

    // ============================================================
    // THÔNG TIN CÁ NHÂN
    // ============================================================

    /** GET /api/v1/auth/me — user gọi API tự xem thông tin của chính mình. */
    public UserDto getMe() {
        Long userId = SecurityUtils.getCurrentUserId();   // userId từ JWT (đã verify ở filter)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return UserDto.from(user);
    }

    /** PUT /api/v1/auth/me — cập nhật fullName/birth (không đổi email/password). */
    @Transactional
    public UserDto updateMe(UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        user.setFullName(request.fullName());
        user.setBirth(request.birth());
        userRepository.save(user);   // entity đã được JPA quản lý, save() để rõ ý đồ cập nhật

        return UserDto.from(user);
    }
}
