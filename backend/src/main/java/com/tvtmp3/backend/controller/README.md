# Package `controller` — Cửa ngõ nhận request (CHƯA CODE — xem hướng dẫn)

## Vai trò

Controller là **người chuyển lời**: nhận request → gọi service → trả JSON.
KHÔNG chứa logic nghiệp vụ — mọi "suy nghĩ" nằm ở service.

## Quy tắc

- `@RestController` + `@RequestMapping("/api/v1/...")` — khớp ĐÚNG path trong
  `frontend/src/api/GUIDE.md` (frontend đã code theo path này sẵn)
- `@Valid` trước request body để kích hoạt validation
- Trả `ResponseEntity<...>` khi cần status đặc biệt (201 khi tạo mới),
  còn lại trả thẳng DTO cũng được (tự động 200)

## Bảng endpoint → controller (theo GUIDE.md)

| Method + Path | Controller | Công khai? |
|---|---|---|
| `POST /api/v1/auth/register` | `AuthController` | ✅ permitAll |
| `POST /api/v1/auth/login` | `AuthController` | ✅ permitAll |
| `GET /api/v1/auth/me` | `AuthController` | 🔒 cần token |
| `PUT /api/v1/auth/me` | `AuthController` | 🔒 cần token |
| `GET /api/v1/songs` | `SongController` | ✅ permitAll |
| `GET /api/v1/songs/{id}` | `SongController` | ✅ permitAll |
| `GET /api/v1/songs/{id}/stream` | `SongController` | ✅ permitAll |
| `GET /api/v1/songs/{id}/cover` | `SongController` | ✅ permitAll |
| `GET /api/v1/songs/search?q=` | `SongController` | ✅ permitAll |
| `GET /api/v1/songs/charts?type=` | `SongController` | ✅ permitAll |
| `POST /api/v1/songs` | `SongController` | 🔒 cần token |
| `DELETE /api/v1/songs/{id}` | `SongController` | 🔒 cần token |
| `GET /api/v1/genres` | `GenreController` | ✅ permitAll |
| `GET /api/v1/favorites` | `FavoriteController` | 🔒 cần token |
| `POST /api/v1/favorites` | `FavoriteController` | 🔒 cần token |
| `DELETE /api/v1/favorites/{songId}` | `FavoriteController` | 🔒 cần token |
| `GET /api/v1/history` | `HistoryController` | 🔒 cần token |
| `POST /api/v1/history` | `HistoryController` | 🔒 cần token |
| `GET /api/v1/me/songs` | `MeController` | 🔒 cần token |
| `GET /api/v1/me/stats` | `MeController` | 🔒 cần token |

⚠️ 6 endpoint GET songs/genres đã được permitAll trong `SecurityConfig` —
**nếu thêm endpoint công khai mới, phải thêm vào SecurityConfig**.

## Code mẫu

### AuthController

```java
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    // constructor injection

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)   // 201 Created
                .body(authService.register(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserDto getMe() {
        return authService.getMe();
    }

    @PutMapping("/me")
    public UserDto updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return authService.updateMe(request);
    }
}
```

### SongController

```java
@RestController
@RequestMapping("/api/v1/songs")
public class SongController {

    private final SongService songService;

    // GET /api/v1/songs?genre=&sort=latest&page=1&size=20
    @GetMapping
    public PageResponse<SongDto> getSongs(
            @RequestParam(required = false) String genre,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return songService.getSongs(genre, sort, page, size);
    }

    // GET /api/v1/songs/search?q=abc
    @GetMapping("/search")
    public PageResponse<SongDto> search(@RequestParam String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return songService.search(q, page, size);
    }

    @GetMapping("/{id}")
    public SongDto getSong(@PathVariable Long id) {
        return songService.getSong(id);
    }

    // Upload: nhận multipart (audio + cover) — chi tiết ở task upload file
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SongDto> upload(
            @RequestParam("title") String title,
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "cover", required = false) MultipartFile cover) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(songService.upload(title, audio, cover));
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> delete(@PathVariable Long id) {
        songService.deleteSong(id);
        return Map.of("success", true);   // format frontend mock đang trả
    }
}
```

### GenreController / FavoriteController / HistoryController / MeController

```java
@RestController
@RequestMapping("/api/v1/genres")
public class GenreController {
    @GetMapping
    public List<GenreDto> getAll() { return genreService.getAll(); }
}

@RestController
@RequestMapping("/api/v1/favorites")
public class FavoriteController {
    @GetMapping
    public PageResponse<SongDto> getFavorites(@RequestParam(defaultValue = "1") int page,
                                              @RequestParam(defaultValue = "20") int size) { ... }

    @PostMapping
    public Map<String, Boolean> add(@Valid @RequestBody FavoriteRequest request) {
        favoriteService.addFavorite(request);
        return Map.of("success", true);
    }

    @DeleteMapping("/{songId}")
    public Map<String, Boolean> remove(@PathVariable Long songId) {
        favoriteService.removeFavorite(songId);
        return Map.of("success", true);
    }
}

@RestController
@RequestMapping("/api/v1/history")
public class HistoryController {
    @GetMapping
    public PageResponse<HistoryDto> getHistory(@RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "20") int size) { ... }

    @PostMapping
    public Map<String, Boolean> record(@Valid @RequestBody HistoryRequest request) {
        historyService.record(request);
        return Map.of("success", true);
    }
}

@RestController
@RequestMapping("/api/v1/me")
public class MeController {
    @GetMapping("/songs")
    public PageResponse<SongDto> mySongs(@RequestParam(defaultValue = "1") int page,
                                         @RequestParam(defaultValue = "20") int size) { ... }

    @GetMapping("/stats")
    public StatsResponse myStats() { return statsService.getStats(); }
}
```

## ⚠️ Lưu ý

- `@Min(1)` trên `@RequestParam int page` — nếu client gửi `page=0`,
  `HandlerMethodValidationException` bị ném và `GlobalExceptionHandler`
  đã sẵn sàng trả `VALIDATION_ERROR`
- `DELETE /favorites/{songId}` dùng **songId** làm path variable (không phải
  khóa ghép) — service tự ghép với `SecurityUtils.getCurrentUserId()`
- `/stream` và `/cover` (trả file, hỗ trợ Range để phát nhạc) thuộc task
  upload file — có thể viết sau khi `FileStorageConfig` xong
