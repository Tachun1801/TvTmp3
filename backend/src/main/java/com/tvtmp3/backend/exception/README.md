# Package `exception` — Xử lý lỗi tập trung

## Vai trò

Mọi lỗi phát sinh đều được chuyển thành JSON **cùng một khuôn** để frontend
dễ xử lý. Service chỉ việc NÉM exception, không cần try-catch —
`GlobalExceptionHandler` bắt tập trung một chỗ.

## Từng file

| File | Vai trò |
|---|---|
| `ErrorResponse` | Khuôn JSON lỗi `{code, message}` — frontend đọc field `message` |
| `ResourceNotFoundException` | 404 — không tìm thấy dữ liệu |
| `BadRequestException` | 400 — vi phạm quy tắc nghiệp vụ |
| `UnauthorizedException` | 401 — chưa đăng nhập / sai mật khẩu |
| `GlobalExceptionHandler` | `@RestControllerAdvice` bắt mọi exception và trả JSON |

## Bảng lỗi đầy đủ

| Ném cái gì | Status | code | Khi nào |
|---|---|---|---|
| `ResourceNotFoundException` | 404 | `NOT_FOUND` | `findById(...).orElseThrow(...)` |
| `NoResourceFoundException` (Spring tự ném) | 404 | `NOT_FOUND` | Gọi endpoint không tồn tại |
| `BadRequestException` | 400 | `BAD_REQUEST` | Email đã tồn tại, favorite trùng... |
| Lỗi `@Valid` trên body | 400 | `VALIDATION_ERROR` | RegisterRequest thiếu email... |
| Lỗi `@Valid` trên param | 400 | `VALIDATION_ERROR` | `size=0` khi yêu cầu `@Min(1)` |
| Body JSON sai cú pháp | 400 | `BAD_REQUEST` | Client gửi JSON hỏng |
| `UnauthorizedException` | 401 | `UNAUTHORIZED` | Sai mật khẩu, `SecurityUtils` khi chưa login |
| `AccessDeniedException` (Spring Security) | 403 | `FORBIDDEN` | Xóa bài hát không phải của mình |
| `DataIntegrityViolationException` (JPA) | 409 | `CONFLICT` | Email UNIQUE bị trùng, khóa ngoại sai |
| Mọi exception còn lại | 500 | `INTERNAL_ERROR` | Bug bất ngờ — log đủ, trả message chung |

## Cách dùng

```java
// 404
Song song = songRepository.findById(songId)
        .orElseThrow(() -> new ResourceNotFoundException("Song", songId));

// 400 — vi phạm quy tắc nghiệp vụ
if (userRepository.existsByEmail(request.email())) {
    throw new BadRequestException("Email đã tồn tại, vui lòng dùng email khác");
}

// 401 — sai mật khẩu khi login
throw new UnauthorizedException("Email hoặc mật khẩu không đúng");

// 403 — đã đăng nhập nhưng không có quyền
throw new AccessDeniedException("Bạn không có quyền xóa bài hát này");
```

## Cách thêm exception mới (3 bước)

1. Tạo class extends `RuntimeException` (chép mẫu `BadRequestException`)
2. Thêm method `@ExceptionHandler` trong `GlobalExceptionHandler`
3. Service ném nó như bình thường

## ⚠️ 2 lưu ý quan trọng

1. **Lỗi 401/403 từ filter chain KHÔNG đi qua đây.** Spring Security xử lý
   riêng bằng `CustomAuthenticationEntryPoint` (401) và
   `CustomAccessDeniedHandler` (403) — 2 nơi đó dùng chung `ErrorResponse`
   nên format vẫn thống nhất.

2. **`AccessDeniedException` có 2 đường đi** (xem `GlobalExceptionHandler`):
   - Ném từ controller/service → advice này bắt → 403 JSON
   - Phát sinh trong filter chain (`@PreAuthorize`) → DeniedHandler xử lý
