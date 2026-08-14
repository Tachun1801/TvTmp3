# Package `dto` — Khuôn dữ liệu vào/ra (CHƯA CODE — xem hướng dẫn)

## Vì sao cần DTO thay vì dùng thẳng entity?

1. **Bảo mật**: không bao giờ trả entity `User` ra JSON — sẽ lộ `password`!
2. **Validation**: request có `@NotBlank`, `@Email`... — `GlobalExceptionHandler`
   đã sẵn sàng bắt lỗi `@Valid` và trả `VALIDATION_ERROR`
3. **Đúng khuôn frontend**: frontend chờ field nào thì DTO trả đúng field đó,
   entity thay đổi không làm vỡ API

## Quy ước

- Dùng **record** (Java 21) cho mọi DTO — ngắn gọn, tự sinh getter/constructor
- Class tên theo pattern: `XxxRequest` (dữ liệu gửi lên, có validation),
  `XxxResponse`/`XxxDto` (dữ liệu trả về)

## Danh sách DTO cần tạo (theo `frontend/src/api/GUIDE.md`)

| Nhóm | DTO | Ghi chú |
|---|---|---|
| Auth | `RegisterRequest`, `LoginRequest`, `UpdateProfileRequest` | Có validation |
| Auth | `UserDto`, `AuthResponse(user, token)` | Trả về sau register/login/me |
| Song | `SongDto` | Trả về ở mọi endpoint bài hát |
| Song | `PageResponse<T>` | Khuôn phân trang chung `{data, total, page, size}` |
| Favorite | `FavoriteRequest` | Chỉ chứa `songId` |
| History | `HistoryRequest`, `HistoryDto` | Ghi lịch sử nghe |
| Stats | `StatsResponse` | `{songsPlayed, favorites, uploads, daysActive}` |

## Code mẫu

### Nhóm Auth

```java
// RegisterRequest.java
public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
        String password,
        @NotBlank String fullName,
        LocalDate birth
) {}

// LoginRequest.java
public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
) {}

// UpdateProfileRequest.java
public record UpdateProfileRequest(
        @NotBlank String fullName,
        LocalDate birth
) {}

// UserDto.java — AN TOÀN, không bao giờ có password
public record UserDto(
        Long userId,
        String email,
        String fullName,
        LocalDate birth
) {}

// AuthResponse.java
public record AuthResponse(UserDto user, String token) {}
```

### Nhóm Song

```java
// SongDto.java
public record SongDto(
        Long songId,
        String title,
        Integer duration,
        String fileUrl,
        String imgUrl,
        UserDto uploader,     // thông tin người upload (không lộ password)
        Instant createdAt
) {}

// PageResponse.java — dùng chung cho MỌI endpoint phân trang
public record PageResponse<T>(
        List<T> data,
        long total,
        int page,
        int size
) {
    public static <T> PageResponse<T> of(Page<T> p) {
        return new PageResponse<>(p.getContent(), p.getTotalElements(),
                                  p.getNumber() + 1, p.getSize());
    }
}
```

### Nhóm Favorite / History / Stats

```java
public record FavoriteRequest(@NotNull Long songId) {}

public record HistoryRequest(@NotNull Long songId) {}

public record HistoryDto(
        Long historyId,
        SongDto song,
        Instant playedAt
) {}

public record StatsResponse(
        long songsPlayed,   // SELECT COUNT(*) FROM play_history WHERE user_id = ?
        long favorites,     // SELECT COUNT(*) FROM favorite_songs WHERE user_id = ?
        long uploads,       // SELECT COUNT(*) FROM songs WHERE user_id = ?
        long daysActive     // SELECT COUNT(DISTINCT DATE(played_at)) FROM play_history WHERE user_id = ?
) {}
```

## ⚠️ Lưu ý

- `SongDto.uploader` cần map thủ công từ entity: `new UserDto(user.getUserId(), user.getEmail(), ...)`
  — nên viết 1 method static `UserDto.from(User)` để tái sử dụng
- `@Valid` trên request body là thứ kích hoạt validation → controller phải
  đặt `@Valid` trước tham số (xem README package `controller`)
- File upload KHÔNG nằm trong DTO JSON — audio/cover gửi dạng multipart,
  xử lý bằng `@RequestParam("file") MultipartFile` trong controller
