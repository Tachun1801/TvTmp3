# Package `entity` — Bảng database ↔ Class Java

## Vai trò

Mỗi entity mô hình hóa **một bảng** trong database. JPA (Hibernate) đọc các
annotation để biết class nào tương ứng bảng nào, field nào tương ứng cột nào,
và tự sinh SQL khi thao tác dữ liệu.

**Quy ước trong project:**
- Tên class = PascalCase (`FavoriteSong`), tên bảng = snake_case (`favorite_songs`)
- Khóa chính tự tăng (`GenerationType.IDENTITY`), tên cột `xxx_id`

## Từng file

| File | Bảng | Mô tả |
|---|---|---|
| `User.java` | `users` | Tài khoản: email, password (sẽ mã hóa BCrypt), fullName, birth |
| `Song.java` | `songs` | Bài hát do user upload: title, duration, fileUrl, imgUrl + `@ManyToOne User` |
| `Genre.java` | `genres` | Thể loại: name (unique), description, imgUrl |
| `SongGenre.java` | `song_genres` | Bảng nối song↔genre, khóa chính ghép `@EmbeddedId SongGenreId` |
| `SongGenreId.java` | (embedded) | Khóa ghép: `(songId, genreId)` + `equals`/`hashCode` |
| `FavoriteSong.java` | `favorite_songs` | Bài hát yêu thích: khóa ghép (userId, songId) + cột phụ createdAt |
| `FavoriteSongId.java` | (embedded) | Khóa ghép: `(userId, songId)` + `equals`/`hashCode` |
| `PlayHistory.java` | `play_history` | Lịch sử nghe: khóa riêng historyId + user + song + playedAt |

## Các annotation quan trọng

| Annotation | Ý nghĩa |
|---|---|
| `@Entity` | Đánh dấu class là entity, JPA sẽ quản lý |
| `@Table(name = "...")` | Ánh xạ sang tên bảng cụ thể |
| `@Id` + `@GeneratedValue(IDENTITY)` | Khóa chính + database tự tăng |
| `@Column(name = "...")` | Ánh xạ field sang tên cột |
| `@ManyToOne` + `@JoinColumn` | Quan hệ nhiều-một: `songs.user_id → users.user_id` |
| `@EmbeddedId` | Khóa chính ghép — dùng class `*Id` làm khóa |
| `@Embeddable` | Class được nhúng làm khóa ghép |
| `@MapsId("songId")` | Field quan hệ dùng chung giá trị với cột trong khóa ghép |
| `@Getter`/`@Setter` (Lombok) | Sinh getter/setter lúc compile |

## Quy ước Lombok trong project

- Trường **khóa chính** và **createdAt/playedAt** (do DB sinh): chỉ `@Getter`
- Trường còn lại: `@Getter @Setter`
- Lý do: service không nên tự set `songId` hay `createdAt`

## ⚠️ Nâng cấp / cải thiện có thể làm

### 1. Class khóa ghép chưa có getter (không bắt buộc)

`SongGenreId` và `FavoriteSongId` hiện chỉ có constructor + equals/hashCode.
JPA chạy bình thường, nhưng nếu service muốn ĐỌC `songId` từ khóa ghép thì
thêm Lombok:

```java
@Embeddable
@Getter   // ← chỉ cần getter, khóa ghép không nên set từng field
public class SongGenreId implements Serializable {
    private Long songId;
    private Long genreId;
    // ...giữ nguyên constructor + equals + hashCode
}
```

### 2. `created_at` tự điền khi tạo mới (khuyên dùng)

Hiện `createdAt` để null, DB có DEFAULT CURRENT_TIMESTAMP nhưng Hibernate
gửi NULL nên cột vẫn có thể null (trừ khi dùng `columnDefinition`). Cách chuẩn:

```java
@Getter
@Column(name = "created_at", nullable = false, updatable = false)
private Instant createdAt;

@PrePersist
void onCreate() {
    this.createdAt = Instant.now();   // tự set trước khi INSERT
}
```

Tương tự cho `PlayHistory.playedAt`.

### 3. Quan hệ ngược `@OneToMany` (chỉ khi cần)

Hiện chỉ có chiều nhiều→một (`Song.user`). Nếu muốn viết
`user.getSongs()` thì thêm chiều ngược:

```java
// Trong User.java
@OneToMany(mappedBy = "user")   // "user" = tên field trong Song.java
private List<Song> songs = new ArrayList<>();
```

⚠️ Cẩn thận vòng lặp vô hạn khi serialize JSON (User ↔ Song) — nếu thêm
quan hệ ngược thì DTO phải lọc, hoặc dùng `@JsonIgnore`.

### 4. Thay `SongGenre` bằng `@ManyToMany` (tùy chọn thiết kế)

Bảng `song_genres` chỉ có 2 khóa ngoại, không có cột phụ — có thể bỏ entity
`SongGenre` + repository, map trực tiếp quan hệ nhiều-nhiều:

```java
// Trong Song.java
@ManyToMany
@JoinTable(
    name = "song_genres",
    joinColumns = @JoinColumn(name = "song_id"),
    inverseJoinColumns = @JoinColumn(name = "genre_id"))
private Set<Genre> genres = new HashSet<>();
```

Lợi: gọi `song.getGenres()` trực tiếp, không cần query qua bảng nối.
Nhược: không lưu được cột phụ trong bảng nối (hiện tại không cần, nên hợp lý).
Cách hiện tại (entity riêng) vẫn ĐÚNG — chỉ là lựa chọn thiết kế.
