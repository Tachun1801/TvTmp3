# Package `service` — Business logic (CHƯA CODE — xem hướng dẫn)

## Vai trò

Service là nơi duy nhất có **"suy nghĩ"**: kiểm tra quy tắc nghiệp vụ, gọi
repository, chuyển entity ↔ DTO, ném exception. Controller chỉ là "người
chuyển lời", không chứa logic.

## Quy tắc

- `@Service` đánh dấu class, `@Transactional` cho method thay đổi dữ liệu
- **Không viết SQL ở đây** — chỉ gọi repository
- **Không try-catch** — ném exception, `GlobalExceptionHandler` lo phần còn lại
- Lấy user hiện tại bằng `SecurityUtils.getCurrentUserId()`
- Trả về DTO, không trả entity ra khỏi service

## Danh sách service cần tạo

| Service | Nhiệm vụ chính |
|---|---|
| `AuthService` | register, login, getMe, updateMe |
| `SongService` | danh sách/lọc/phân trang, search, charts, upload, delete |
| `GenreService` | danh sách thể loại |
| `FavoriteService` | thêm/xóa/danh sách yêu thích |
| `HistoryService` | ghi + xem lịch sử nghe |
| `StatsService` | 4 chỉ số thống kê cho trang profile |

## Code mẫu

### AuthService — quan trọng nhất, viết trước

```java
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;   // bean trong SecurityConfig
    private final JwtService jwtService;             // package security

    // constructor injection (Spring tự làm nếu chỉ có 1 constructor — có thể bỏ @Autowired)

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. Kiểm tra quy tắc nghiệp vụ
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email đã tồn tại, vui lòng dùng email khác");
        }

        // 2. Tạo + lưu user (LUÔN mã hóa mật khẩu trước khi lưu)
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setBirth(request.birth());
        userRepository.save(user);

        // 3. Cấp token
        String token = jwtService.generateToken(user.getUserId());
        return new AuthResponse(UserDto.from(user), token);
    }

    public AuthResponse login(LoginRequest request) {
        // KHÔNG tiết lộ email tồn tại hay không — chỉ 1 message chung
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
        }

        String token = jwtService.generateToken(user.getUserId());
        return new AuthResponse(UserDto.from(user), token);
    }

    public UserDto getMe() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return UserDto.from(user);
    }

    @Transactional
    public UserDto updateMe(UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setFullName(request.fullName());
        user.setBirth(request.birth());
        return UserDto.from(userRepository.save(user));
    }
}
```

### SongService — lọc + phân trang + kiểm tra quyền

```java
@Service
public class SongService {

    private final SongRepository songRepository;
    private final SongGenreRepository songGenreRepository;

    public PageResponse<SongDto> getSongs(String genre, String sort, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);   // frontend đếm từ 1, JPA đếm từ 0
        Page<Song> result;

        if ("popular".equals(sort)) {
            // gợi ý: sắp theo lượt nghe — cần query đếm trong SongRepository
            result = songRepository.findByOrderByPlayCountDesc(pageable);
        } else {
            result = songRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        // genre != null -> lọc qua SongGenreRepository

        return PageResponse.of(result.map(SongDto::from));
    }

    public SongDto getSong(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", songId));
        return SongDto.from(song);
    }

    @Transactional
    public void deleteSong(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", songId));

        // KIỂM TRA QUYỀN: chỉ chủ bài hát được xóa
        if (!song.getUser().getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("Bạn không có quyền xóa bài hát này");
        }

        songRepository.delete(song);
    }
}
```

### FavoriteService — check trùng + 404

```java
@Service
public class FavoriteService {

    private final FavoriteSongRepository favoriteRepository;
    private final SongRepository songRepository;

    @Transactional
    public void addFavorite(FavoriteRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        // Bài hát phải tồn tại
        if (!songRepository.existsById(request.songId())) {
            throw new ResourceNotFoundException("Song", request.songId());
        }

        // Chống trùng lặp
        FavoriteSongId id = new FavoriteSongId(userId, request.songId());
        if (favoriteRepository.existsById(id)) {
            throw new BadRequestException("Bài hát đã có trong danh sách yêu thích");
        }

        FavoriteSong favorite = new FavoriteSong();
        favorite.setId(id);
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long songId) {
        FavoriteSongId id = new FavoriteSongId(SecurityUtils.getCurrentUserId(), songId);
        FavoriteSong favorite = favoriteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bài hát không có trong danh sách yêu thích"));
        favoriteRepository.delete(favorite);
    }
}
```

### StatsService — 4 query trong GUIDE.md

```java
@Service
public class StatsService {

    private final PlayHistoryRepository playHistoryRepository;
    private final FavoriteSongRepository favoriteRepository;
    private final SongRepository songRepository;

    public StatsResponse getStats() {
        Long userId = SecurityUtils.getCurrentUserId();
        return new StatsResponse(
                playHistoryRepository.countByUserId(userId),
                favoriteRepository.countByUserId(userId),
                songRepository.countByUserId(userId),
                playHistoryRepository.countDistinctDays(userId)   // native query, xem README repository
        );
    }
}
```

## ⚠️ Lưu ý

- Method cần `UserDto.from(User)` và `SongDto.from(Song)` static — viết trong
  chính DTO (xem README package `dto`)
- `FavoriteSong`/`SongGenre` có `@MapsId` — chỉ cần set khóa ghép, không cần
  set `user`/`song` đầy đủ, nhưng phải tạo sẵn entity `User`/`Song` nếu dùng
  `favorite.setUser(...)` (cách an toàn: `userRepository.getReferenceById(id)`)
- `PageRequest.of(page - 1, size)` — frontend gửi `page` từ 1, JPA đếm từ 0
