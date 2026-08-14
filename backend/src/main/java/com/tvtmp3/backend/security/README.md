# Package `security` — Xác thực & phân quyền (JWT + Spring Security)

## Vai trò

Trả lời 2 câu hỏi cho MỌI request: **"Bạn là ai?"** (xác thực — JWT) và
**"Bạn được làm gì?"** (phân quyền — SecurityFilterChain trong `config/`).

## Từng file

| File | Vai trò |
|---|---|
| `JwtService` | Tạo token khi đăng nhập + verify token khi nhận request |
| `JwtAuthenticationFilter` | Chạy mỗi request: đọc `Authorization: Bearer`, gắn userId vào SecurityContext |
| `SecurityUtils` | Helper: service gọi `getCurrentUserId()` để biết ai đang gọi API |
| `CustomAuthenticationEntryPoint` | Chưa đăng nhập mà gọi endpoint cần token → 401 JSON |
| `CustomAccessDeniedHandler` | Đã đăng nhập nhưng không đủ quyền → 403 JSON |

## Luồng xác thực

```
ĐĂNG NHẬP (trong AuthService — sẽ viết ở package service):
  1. Kiểm tra email + password (passwordEncoder.matches)
  2. jwtService.generateToken(userId) → trả token cho client

MỖI REQUEST SAU ĐÓ:
  1. JwtAuthenticationFilter đọc header "Authorization: Bearer <token>"
  2. jwtService.extractUserId(token) — verify chữ ký + hạn dùng
  3. Gắn userId vào SecurityContext → request này "đã đăng nhập"
  4. SecurityFilterChain (config/) kiểm tra endpoint có cần đăng nhập không
```

## Cách dùng trong Service

```java
// Lấy user đang gọi API
Long userId = SecurityUtils.getCurrentUserId();

// Cấp token khi login/register thành công (inject JwtService)
String token = jwtService.generateToken(user.getUserId());

// Mã hóa / kiểm tra mật khẩu (inject PasswordEncoder — bean ở config/)
user.setPassword(passwordEncoder.encode(rawPassword));            // register
passwordEncoder.matches(rawPassword, user.getPassword());         // login
```

## Nâng cấp có thể làm

### 1. Refresh token (access token ngắn + refresh token dài)

Hiện token sống 7 ngày. Pattern chuẩn: access token 15 phút + refresh token
30 ngày. Khi access hết hạn, client gọi `POST /api/v1/auth/refresh` với
refresh token để nhận access mới, không cần đăng nhập lại.

### 2. Logout / vô hiệu token (blacklist)

JWT không thể "thu hồi" — token vẫn hợp lệ tới khi hết hạn. Nếu cần logout
thật sự: lưu token đã hủy vào bảng `revoked_tokens` (hoặc Redis), filter
kiểm tra trước khi verify.

### 3. Phân vai trò admin/user

```java
// Trong JwtAuthenticationFilter — thêm authorities:
new UsernamePasswordAuthenticationToken(userId, null,
        List.of(new SimpleGrantedAuthority("ROLE_" + role)));

// Trong SecurityConfig:
.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

// Hoặc chặn ở method:
@PreAuthorize("hasRole('ADMIN')")
```

### 4. Thêm `jti` (ID ngẫu nhiên) cho từng token

2 token cấp cùng 1 miligiây sẽ giống hệt nhau. Thêm claim `jti` ngẫu nhiên
để mỗi token là duy nhất (cũng là nền tảng cho blacklist):

```java
.id(UUID.randomUUID().toString())   // thêm vào Jwts.builder()
```

## ⚠️ Lưu ý bảo mật

- Secret JWT **≥ 32 ký tự**, để trong `backend/.env` (đã gitignore) — KHÔNG
  commit secret thật lên GitHub
- Không tự băm mật khẩu bằng MD5/SHA — luôn dùng `PasswordEncoder` (BCrypt)
- Token đổi secret là **mọi token đang dùng hết hiệu lực ngay** (tất cả
  người dùng buộc đăng nhập lại)
