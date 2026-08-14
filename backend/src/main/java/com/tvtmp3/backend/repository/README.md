# Package `repository` — Cầu nối tới database

## Vai trò

Repository là **nơi duy nhất** trong project viết query. Service không biết
SQL ở đâu — chỉ gọi repository. Với Spring Data JPA, bạn chỉ khai báo
interface, **Spring tự sinh toàn bộ implementation lúc runtime**, kèm sẵn:
`save()`, `findById()`, `findAll()`, `delete()`, `count()`, `existsById()`...

```
Service ──gọi──> Repository (interface) ──Spring sinh ra──> SQL ──> MySQL
```

## Từng file

| File | Entity | Khóa chính | Khi nào dùng |
|---|---|---|---|
| `UserRepository` | `User` | `Long` | Đăng ký, đăng nhập, đổi thông tin |
| `SongRepository` | `Song` | `Long` | Danh sách, tìm kiếm, upload, xóa bài hát |
| `GenreRepository` | `Genre` | `Long` | Danh sách thể loại |
| `SongGenreRepository` | `SongGenre` | `SongGenreId` (ghép) | Lọc bài hát theo thể loại |
| `FavoriteSongRepository` | `FavoriteSong` | `FavoriteSongId` (ghép) | Yêu thích / bỏ yêu thích |
| `PlayHistoryRepository` | `PlayHistory` | `Long` | Ghi lịch sử nghe, thống kê |

Lưu ý: `@Repository` annotation hiện có trong file — thực ra **không bắt buộc**
với Spring Data JPA (Spring tự nhận diện interface extends `JpaRepository`),
nhưng để cũng vô hại.

## Cách thêm query mới — 3 cách

### Cách 1: Derived query (khai báo theo tên method, KHÔNG viết SQL)

Spring đọc tên method và tự sinh SQL. Dùng cho query đơn giản:

```java
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);        // WHERE email = ?

    boolean existsByEmail(String email);             // SELECT COUNT(*) > 0

    long countByUserId(Long userId);                 // WHERE user_id = ?

    List<Song> findByUserIdOrderByCreatedAtDesc(Long userId); // WHERE user_id = ? ORDER BY created_at DESC
}
```

Từ khóa: `findBy`/`existsBy`/`countBy` + tên field (`Email`, `UserId`) +
`And`/`Or`/`OrderByXxxDesc`/`Top10`/`Containing`...

### Cách 2: `@Query` JPQL (query trên entity, KHÔNG phải bảng)

Dùng khi query phức tạp hoặc join. Lưu ý JPQL join qua **quan hệ đã khai báo
trong entity** (`f.song`), không phải tên bảng:

```java
public interface FavoriteSongRepository extends JpaRepository<FavoriteSong, FavoriteSongId> {

    // Danh sách bài hát user yêu thích, mới nhất trước, có phân trang
    @Query("""
            SELECT f.song FROM FavoriteSong f
            WHERE f.user.userId = :userId
            ORDER BY f.createdAt DESC
            """)
    Page<Song> findFavoriteSongs(@Param("userId") Long userId, Pageable pageable);
}
```

### Cách 3: Native query (SQL thuần, dùng tên BẢNG + CỘT)

Chỉ dùng khi JPQL không diễn đạt được (thống kê phức tạp):

```java
@Query(value = """
        SELECT COUNT(DISTINCT DATE(played_at))
        FROM play_history WHERE user_id = :userId
        """, nativeQuery = true)
long countDistinctDays(@Param("userId") Long userId);
```

## Quy tắc đặt query

**Query join nhiều bảng đặt ở repository của entity ĐƯỢC TRẢ VỀ** —
"ai là nhân vật chính của query thì query ở nhà người đó":

| Query | Trả về | Đặt ở |
|---|---|---|
| Tìm bài hát theo genre | `Song` | `SongRepository` (hoặc `SongGenreRepository`) |
| Bài hát user yêu thích | `Song` | `FavoriteSongRepository` (join sang song) |
| Lịch sử nghe kèm tên bài | `PlayHistory` | `PlayHistoryRepository` |

## Phân trang với `Pageable`

Endpoint danh sách cần phân trang (GUIDE.md: page, size) — chỉ cần thêm
tham số `Pageable`, controller nhận `page`/`size` tự động:

```java
Page<Song> findByTitleContainingIgnoreCase(String q, Pageable pageable);
// gọi: /api/v1/songs/search?q=abc&page=1&size=20
```

`Page<T>` có sẵn: `getContent()`, `getTotalElements()`, `getTotalPages()` —
khớp format frontend mong đợi `{ data, total, page, size }`.
