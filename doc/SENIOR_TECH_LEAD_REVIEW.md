# 🔴 Senior Tech Lead Review — TvTmp3

> **Vai trò:** Senior Tech Lead khó tính, 8 năm kinh nghiệm
> **Ngày review:** 2026-08-05
> **Người bị review:** PM + team 3 người
> **Tài liệu bị review:** [PROJECT_EXECUTION_PLAYBOOK.md](PROJECT_EXECUTION_PLAYBOOK.md)

---

Ngồi xuống đi. Tôi đã đọc playbook của cậu. Có chỗ đúng, có chỗ **sai**. Tôi sẽ nói thẳng từng điểm.

---

## 1. "8 bảng database cho MVP" — CẬU ĐANG OVER-DESIGN

```
users, genres, songs, song_genres, favorites, playlists, playlist_songs, play_history
```

Cậu có **3 người** và **5 tuần dev**. Vậy mà thiết kế 8 bảng ngay Sprint 1.

**Vấn đề cụ thể:**

### `play_history` — có thực sự cần trong MVP?

"Recently Played" có thể làm bằng **localStorage** ở frontend. Khi user chưa login, họ vẫn nghe nhạc, và frontend vẫn lưu được lịch sử local. Chỉ khi nào cần sync lịch sử giữa các thiết bị thì mới cần lưu server.

**→ Hành động:** Bỏ bảng `play_history` khỏi Sprint 1. Thêm vào Sprint 3-4 nếu còn thời gian.

### `playlists` + `playlist_songs` — sao migration ngay Sprint 1?

Cậu định làm Playlist ở Sprint 4. Vậy mà migration chạy ngay từ đầu → tạo bảng rỗng, không dùng đến trong 3 tuần. Mỗi lần thay đổi schema thì phải sửa migration → conflict → mất thời gian.

**→ Hành động:** Sprint 1 chỉ migration 3 bảng: `users`, `genres`, `songs`, `song_genres`. Bảng `favorites` làm ở Sprint 3, `playlists` + `playlist_songs` làm ở Sprint 4.

### `favorites` — bảng trung gian có cần `created_at` không?

Nếu favorite chỉ là toggle (thêm/xóa), không cần timestamp. Timestamp chỉ cần khi cậu muốn sắp xếp "mới thêm gần đây". Cậu có cần không? Nếu không → bỏ cột.

**→ Hành động:** Cân nhắc bỏ `created_at` khỏi bảng `favorites`. Chỉ thêm khi thực sự cần.

---

## 2. "Song có uploader_id nhưng thiếu ràng buộc" — THIẾU

Cậu có cột `uploader_id` trong bảng `songs` nhưng:

```sql
uploader_id BIGINT,
FOREIGN KEY (uploader_id) REFERENCES users(id)
```

Không có `ON DELETE` clause. Điều gì xảy ra khi:
- User upload 10 bài hát
- User xóa tài khoản
- Bảng `songs` vẫn trỏ đến user_id đã bị xóa → LỖI

**→ Sửa thành:**

```sql
uploader_id BIGINT,
FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE SET NULL
```

Và: bài hát seed data (20 bài mẫu) thì `uploader_id` để NULL → nghĩa là "bài hát hệ thống".

---

## 3. Music Player Context — SAI PHẠM VI STATE

Cậu thiết kế `PlayerContext` global chứa cả `volume`. Đây là sai lầm.

**Phân tích:**

| State | Phạm vi đúng | Lý do |
|-------|-------------|-------|
| `currentSong` | Global (Context) | Nhiều component cần: MusicPlayer, RightPanel, SongRow (highlight bài đang phát) |
| `queue` | Global (Context) | RightPanel hiển thị queue, MusicPlayer đọc queue để next/prev |
| `isPlaying` | Global (Context) | Nhiều nút Play/Pause trong app cần biết trạng thái |
| `volume` | **Local** (useState trong MusicPlayer) + localStorage | Chỉ MusicPlayer dùng. Mỗi lần kéo volume → re-render toàn bộ cây component ngầm dưới Context |
| `currentTime` | **Local** (useState trong MusicPlayer) | Cập nhật mỗi giây. Nếu để global → re-render cả app mỗi giây → lag |

**→ Sửa:**

```javascript
// PlayerContext.jsx — chỉ global state thực sự cần thiết
const PlayerContext = createContext({
  currentSong: null,
  queue: [],
  isPlaying: false,
  play: (song, queue) => {},
  pause: () => {},
  next: () => {},
  prev: () => {},
  addToQueue: (song) => {},
  clearQueue: () => {},
});

// MusicPlayer.jsx — volume + currentTime là local
function MusicPlayer() {
  const [volume, setVolume] = useState(() => {
    return Number(localStorage.getItem('player_volume') ?? 80);
  });
  const [currentTime, setCurrentTime] = useState(0);

  // Sync volume xuống localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('player_volume', volume);
  }, [volume]);
  // ...
}
```

---

## 4. "VITE_USE_MOCK và MSW" — CẨN THẬN VỚI TẢI TRANG ĐẦU

MSW cần thời gian đăng ký service worker. Lần đầu mở app, service worker chưa kịp đăng ký → request đầu tiên đi thẳng đến backend (đang không chạy) → **lỗi trắng màn hình**.

**→ Fix:**

```javascript
// main.jsx
async function bootstrap() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false') {
    try {
      const { setupWorker } = await import('msw/browser');
      const { handlers } = await import('./mock/mockHandlers');
      const worker = setupWorker(...handlers);
      await worker.start({
        onUnhandledRequest: 'bypass',
        waitUntilReady: true,  // ← QUAN TRỌNG: đợi SW sẵn sàng mới render
      });
      console.log('[MSW] Mock API ready');
    } catch (err) {
      console.warn('[MSW] Failed to start, falling back to real API:', err);
      // Không crash app, fallback về real API
    }
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
}

bootstrap();
```

Ngoài ra, thêm `msw` vào `devDependencies` (không phải `dependencies`) vì chỉ dùng trong development.

---

## 5. Stream endpoint — THIẾU 3 THỨ QUAN TRỌNG

Cậu viết `GET /api/v1/songs/{id}/stream`. Tốt. Nhưng:

### a) Không có rate limit

App nghe miễn phí → OK không cần auth. Nhưng không có rate limit? Một script có thể:

```bash
for i in {1..10000}; do
  curl http://your-server/api/v1/songs/1/stream -o /dev/null &
done
```

→ Tải hết nhạc của cậu trong 5 phút.

**→ Fix:** Thêm rate limiter cho stream endpoint. Spring Boot có thể dùng Bucket4j hoặc đơn giản là đếm request mỗi IP trong 1 phút. 30 stream/phút/IP là hợp lý.

### b) Không tăng `play_count`

Cậu có cột `play_count` trong DB nhưng không thấy logic tăng nó ở đâu.

**→ Fix:** Trong `SongService.getStream()`, tăng `play_count` khi bắt đầu stream (không phải mỗi lần seek — phân biệt bằng cách kiểm tra Range header: nếu không có Range header hoặc Range bắt đầu từ 0 → mới tăng count).

### c) Range request — CẬU ĐÃ TEST SAFARI CHƯA?

Safari **yêu cầu** server hỗ trợ `Accept-Ranges: bytes` và xử lý đúng `Range` header để phát nhạc. Nếu server không hỗ trợ, Safari sẽ không phát được file MP3. Chrome thì OK, Safari thì không.

Đây là bug phổ biến của mọi app nghe nhạc mới.

**→ Fix mẫu (Spring Boot):**

```java
@GetMapping("/{id}/stream")
public ResponseEntity<Resource> stream(@PathVariable Long id, HttpServletRequest request) {
    Song song = songService.getById(id);
    File file = new File(song.getFilePath());

    if (!file.exists()) {
        throw new ResourceNotFoundException("File not found");
    }

    Resource resource = new FileSystemResource(file);
    String rangeHeader = request.getHeader("Range");

    if (rangeHeader == null) {
        // Full request — không có Range
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("audio/mpeg"))
            .header(HttpHeaders.ACCEPT_RANGES, "bytes")
            .body(resource);
    }

    // Range request — xử lý seek
    long fileLength = file.length();
    // Parse "bytes=1000-2000" hoặc "bytes=1000-"
    // ... Xử lý Range header
    // Trả về 206 Partial Content với Content-Range header
}
```

**Test ngay:** Mở Safari → vào app → bấm Play → nhạc có phát không? Nếu không → fix gấp.

---

## 6. "Mọi người đều fullstack" — NGUY HIỂM

Cậu nói "mọi người đều fullstack". Thực tế: không ai thực sự fullstack khi mới bắt đầu. Sẽ có người mạnh FE hơn, người mạnh BE hơn.

**Rủi ro nếu ép mọi người làm cả 2:**

| Vấn đề | Hậu quả |
|--------|---------|
| Backend dev viết React component | CSS vỡ, UI không responsive, state management sai |
| Frontend dev viết Spring Boot controller | API trả sai format, không validation, SQL injection |
| Người chưa thiết kế DB bao giờ | Bảng thiếu index, sai kiểu dữ liệu, quan hệ sai |

**→ Khuyến nghị thực tế:**

Vẫn gọi là "fullstack", nhưng mỗi người có **chuyên môn chính**:

| Người | Chuyên môn chính | Có thể làm phụ |
|-------|-----------------|----------------|
| Bạn (PM) | Backend + Architecture | Frontend page đơn giản |
| Thành viên A | Frontend + UI/UX | Backend API đơn giản (CRUD genres) |
| Thành viên B | Backend + Database | Frontend page đơn giản |

Nguyên tắc: **Mỗi người làm chuyên môn chính 70% thời gian, làm phụ 30%.**

---

## 7. "Sprint 1 tuần" — QUÁ NGẮN CHO SPRINT ĐẦU

Sprint 1 luôn là Sprint khó nhất vì:

```
Thời gian thực tế Sprint 1:
├── Setup môi trường: 0.5-1 ngày (cài đặt, Docker, database)
├── Học công nghệ mới: 0.5-1 ngày (Spring Security, JWT, Tailwind)
├── Thống nhất convention: 0.5 ngày (code style, Git, PR rules)
├── Code thực sự: còn 2-3 ngày
└── Integration FE+BE lần đầu: LUÔN LUÔN CÓ VẤN ĐỀ
```

**→ Sửa:**

- Sprint 1: **10 ngày** (1.5 tuần)
- Sprint 2-3: **1 tuần** (khi team đã quen)
- Sprint 4-5: **1 tuần**

Hoặc nếu muốn giữ đều 1 tuần, **giảm scope Sprint 1**: chỉ cần Register + Login + Layout. Chưa cần Music Player trong Sprint 1.

---

## 8. "Không cần test" — SAI

Cậu phân loại test là P2 (tốt nhưng không bắt buộc). Nhưng:

### Ít nhất phải test AuthService

Nếu auth sai, toàn bộ app sai theo. Test cho `AuthService` mất 1-2 giờ:

```java
@Test
void shouldReturnTokenWhenCredentialsAreCorrect() {
    // Register user
    // Login
    // Assert: token không null, token có thể decode
}

@Test
void shouldThrowWhenPasswordIsWrong() {
    // Login with wrong password
    // Assert: throw BadCredentialsException
}

@Test
void shouldThrowWhenEmailAlreadyExists() {
    // Register same email twice
    // Assert: throw EmailExistsException
}
```

**Rẻ hơn nhiều so với debug auth bug trong 2 ngày.**

### Ít nhất phải test stream với file thật

Mock file MP3 không phát hiện được:
- Safari Range request bug
- File path traversal bug
- File size lớn gây timeout
- Memory leak khi đọc file lớn

**→ Test:** Upload 1 file MP3 5MB thật, gọi stream API, verify response.

---

## 9. File upload — THIẾU metadata extraction

Khi user upload MP3, làm sao lấy được `duration`?

Cậu cần đọc ID3 tag của file MP3. Không có duration → frontend không hiển thị được tổng thời gian → progress bar không hoạt động đúng cho đến khi load xong file.

**→ Java dependencies:**

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.mpatric</groupId>
    <artifactId>mp3agic</artifactId>
    <version>0.9.1</version>
</dependency>
```

```java
// FileStorageService.java
public int extractDuration(MultipartFile file) throws Exception {
    Mp3File mp3 = new Mp3File(file.getInputStream(), file.getSize());
    return (int) mp3.getLengthInSeconds();
}
```

Ngoài ra, cậu còn cần:
- Validate file type thực sự (magic bytes `0xFF 0xFB` hoặc `ID3`), đừng tin extension `.mp3`
- Giới hạn kích thước file (Spring: `spring.servlet.multipart.max-file-size=20MB`)
- Generate UUID filename để tránh trùng + path traversal

---

## 10. Deploy: File uploads trên Render — MẤT HẾT KHI RESTART

Render free tier có **ephemeral disk** (ổ đĩa tạm). Khi service restart (deploy mới, crash, hết memory), **toàn bộ file upload biến mất**.

Đây là lỗi production nghiêm trọng mà team mới thường không biết.

**→ Giải pháp (chọn 1):**

| Giải pháp | Chi phí | Phù hợp? |
|-----------|--------|----------|
| Render persistent disk | $1-2/tháng | ✅ Đơn giản nhất |
| Cloudflare R2 | Free 10GB | ✅ Miễn phí, có S3-compatible API |
| AWS S3 | ~$0.023/GB | ❌ Overkill cho project sinh viên |
| Giữ nguyên local, cảnh báo mất file | Free | ⚠️ OK cho dev, không OK cho production |

**Khuyến nghị:** Dùng **Cloudflare R2**. Free 10GB, S3-compatible API, có thể migrate lên S3 sau này nếu cần.

---

## 11. TOÀN BỘ API trả 200 OK kể cả khi lỗi?

Cậu dùng format `{ success: true/false }` — nhưng cậu có chắc status code HTTP vẫn đúng không?

**Tình huống xấu tôi từng thấy:** Backend dev set `@ControllerAdvice` trả về `{ success: false }` nhưng quên set status code → mọi response đều là 200 OK. Frontend axios `response.data.success` thì biết lỗi, nhưng HTTP status 200 → cache nhầm, SEO sai, monitor tool không bắt được lỗi.

**→ Fix:** Đảm bảo `GlobalExceptionHandler` set đúng HTTP status:

```java
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
    return ResponseEntity
        .status(HttpStatus.NOT_FOUND)  // ← 404, không phải 200
        .body(ApiResponse.error("NOT_FOUND", ex.getMessage()));
}
```

---

## 12. Không có fallback cho Music Player

Trường hợp `GET /api/v1/songs/{id}/stream` trả về 404 hoặc network lỗi:

Cậu chưa nói MusicPlayer xử lý thế nào. App nên:
- Hiển thị toast "Không thể phát bài hát này"
- Tự động skip sang bài tiếp theo trong queue
- Đánh dấu bài lỗi (màu đỏ, icon lỗi) để user biết

Không làm → user bấm Play, không có gì xảy ra, không biết lỗi gì → tưởng app hỏng.

---

## 13. Thiếu kế hoạch xử lý CORS khi deploy

Khi deploy lên Vercel (FE) và Render (BE), domain khác nhau → CORS sẽ block request.

Cậu có `CorsConfig.java` trong cấu trúc backend nhưng chưa chi tiết.

**→ Fix:**

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:5173",              // dev
                        "https://tvtmp3.vercel.app"           // production
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

Đừng dùng `.allowedOrigins("*")` — vừa không an toàn, vừa không hoạt động với `allowCredentials(true)`.

---

## 🟢 NHỮNG ĐIỂM ĐÚNG

Để công bằng, những thứ cậu làm đúng:

1. ✅ **API contract trước khi code** — Nguyên tắc quan trọng nhất. Làm đúng.
2. ✅ **Mock bằng MSW, không if/else trong code** — Sạch. Đúng kiến trúc.
3. ✅ **Monolith, không microservices** — Đừng ai nhắc đến microservices với team 3 người.
4. ✅ **Không cần Redux** — Context API đủ cho app này.
5. ✅ **Sprint review demo cái chạy được** — "Code xong" không phải là xong. Demo mới là xong.
6. ✅ **Out of scope list** — Có cái để chỉ vào khi ai đó đòi thêm tính năng.
7. ✅ **Conventional Commits** — Git history rõ ràng, dễ revert.
8. ✅ **2 môi trường, không cần staging** — Team 3 người không cần 3 môi trường.
9. ✅ **Mock data đã có sẵn** — Lợi thế lớn. Tận dụng ngay.
10. ✅ **Đọc playbook của chính project, không copy-paste** — Điều này cho thấy cậu nghiêm túc.

---

## 📊 TÓM TẮT: Fix những gì TRƯỚC KHI CODE?

| # | Vấn đề | Mức độ | Hành động cụ thể |
|---|--------|--------|-----------------|
| 1 | Quá nhiều bảng DB ngay Sprint 1 | 🔴 CRITICAL | Chỉ tạo `users`, `genres`, `songs`, `song_genres` trước |
| 2 | Volume + currentTime trong global context | 🟡 HIGH | Chuyển về local state + localStorage |
| 3 | Thiếu rate limit cho stream endpoint | 🟡 HIGH | Thêm Bucket4j hoặc đếm request/IP |
| 4 | Chưa test Safari Range request | 🔴 CRITICAL | Test stream endpoint trên Safari NGAY khi code xong |
| 5 | Chưa có thư viện đọc MP3 metadata | 🟡 HIGH | Thêm `mp3agic` vào pom.xml |
| 6 | File uploads mất khi Render restart | 🔴 CRITICAL | Dùng Cloudflare R2 (free 10GB) hoặc Render persistent disk |
| 7 | `play_history` không cần trong MVP | 🟢 MEDIUM | Dùng localStorage, thêm DB migration sau |
| 8 | `playlists` migration quá sớm | 🟢 MEDIUM | Dời migration sang Sprint 4 |
| 9 | Chưa có unit test AuthService | 🟡 HIGH | Viết 2-3 test cơ bản mất 1-2h |
| 10 | `uploader_id` thiếu ON DELETE SET NULL | 🟢 MEDIUM | Sửa FOREIGN KEY clause |
| 11 | Chưa có CORS config cụ thể cho production | 🟡 HIGH | Cấu hình allowed origins rõ ràng |
| 12 | Thiếu error handling cho MusicPlayer | 🟢 MEDIUM | Toast + auto skip khi stream lỗi |
| 13 | GlobalExceptionHandler có thể trả sai status code | 🟡 HIGH | Kiểm tra tất cả exception handler set đúng HTTP status |

---

## 🎯 CÂU HỎI DÀNH CHO PM

Trước khi bắt đầu Sprint 1, trả lời những câu hỏi này:

1. **Nếu chỉ có 4 tuần thay vì 5, cậu cắt cái gì?** → Trả lời được câu này nghĩa là cậu biết MVP thực sự là gì.

2. **Nếu một thành viên nghỉ 1 tuần, ai cover?** → Nếu không ai cover được, cậu có bus factor = 1. Rất nguy hiểm.

3. **File nhạc 20MB có stream được trên 3G không?** → Nếu không, cần nén MP3 hoặc có phiên bản chất lượng thấp.

4. **Làm sao biết app đang hoạt động sau khi deploy?** → Có health check endpoint không? Có monitoring không? Hay deploy xong rồi "hy vọng nó chạy"?

5. **Nếu backend crash, frontend hiển thị gì?** → Nếu là màn hình trắng, cậu thất bại. Phải có error boundary + thông báo thân thiện.

---

## 🔚 KẾT LUẬN

Playbook của cậu **ở mức khá**. Nó cho thấy cậu đã suy nghĩ nghiêm túc. Nhưng có 3 lỗi CRITICAL phải fix trước khi code:

1. **Giảm số bảng DB** — 3 bảng cho Sprint 1, không phải 8.
2. **Giải quyết vấn đề file storage trên production** — Cloudflare R2 hoặc persistent disk.
3. **Test Safari stream ngay khi có stream endpoint** — Đừng đợi đến Sprint cuối.

Chúc team làm tốt. Đừng làm tôi thất vọng. 🎵
