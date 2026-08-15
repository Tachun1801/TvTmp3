# Hướng dẫn chi tiết: Upload & Stream audio/cover (Phương án B — backend tự lưu file)

> Hướng dẫn từng bước để làm 3 endpoint:
> - `POST /api/v1/songs` — upload bài hát (multipart: audio + cover)
> - `GET /api/v1/songs/{id}/stream` — phát nhạc, hỗ trợ HTTP Range (tua bài)
> - `GET /api/v1/songs/{id}/cover` — ảnh bìa

---

## 1. Tổng quan kiến trúc

```
UPLOAD:
Browser ──POST /api/v1/songs (multipart: file, title)──► SongController
   └─► SongService.upload()
         ├─► FileStorageService.store()  → lưu file vào uploads/songs/uuid.mp3
         │                                  (tên file = UUID, KHÔNG dùng tên gốc)
         └─► SongRepository.save()       → DB lưu ĐƯỜNG DẪN FILE NỘI BỘ

PHÁT NHẠC:
Browser ──GET /api/v1/songs/5/stream (kèm Range: bytes=...)──► SongController
   └─► SongService.getAudioResource(5)
         ├─► SongRepository.findById(5) → lấy đường dẫn file nội bộ từ DB
         ├─► FileStorageService.load(...) → đọc file từ ổ cứng
         └─► trả bytes theo Range (206 Partial Content)
```

**DB lưu gì?** Cột `file_url` lưu **đường dẫn file nội bộ** — ví dụ
`songs/7f3c2a1b-...mp3` (KHÔNG có tiền tố `/uploads`, KHÔNG lộ ra API).
Endpoint `/api/v1/songs/{id}/stream` do CODE sinh ra từ `songId`, không cần
lưu vào DB — vì endpoint chỉ là "cửa ngõ", còn để đọc file thì backend phải
biết file nằm ở đâu trên ổ cứng.

**Frontend nhận gì?** `SongDto.fileUrl` trả về URL TUYỆT ĐỐI:
`http://localhost:8080/api/v1/songs/5/stream` (nối origin từ request — xem
bước 4). Frontend (`MusicPlayer`) gán thẳng vào `<audio src>` nên không sửa gì.

---

## 2. Bước 1 — Cấu hình giới hạn multipart

Thêm vào `application.properties`:

```properties
# ===============================
# UPLOAD FILE
# ===============================
# Giới hạn 1 file tối đa 20MB và cả request 25MB.
# Vượt quá -> Spring ném MaxUploadSizeExceededException (rơi vào
# GlobalExceptionHandler catch-all -> 500; nếu muốn 400 đẹp thì thêm
# handler riêng cho MaxUploadSizeExceededException)
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=25MB
```

## 3. Bước 2 — Thư mục uploads không được commit

Thêm dòng vào **`backend/.gitignore`**:

```
uploads/
```

Thư mục sẽ tự tạo lúc app chạy (xem FileStorageService) — không cần tạo tay.

## 4. Bước 3 — Tạo `FileStorageService` (service/FileStorageService.java)

Lớp duy nhất đụng tới ổ cứng: lưu file, đọc file, xóa file. Sau này chuyển
sang S3/Cloudinary thì **chỉ sửa mỗi class này**.

```java
package com.tvtmp3.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tvtmp3.backend.exception.BadRequestException;
import com.tvtmp3.backend.exception.ResourceNotFoundException;

@Service
public class FileStorageService {

    // Thư mục gốc chứa mọi file upload (tự tạo nếu chưa có)
    private static final Path ROOT = Path.of("uploads").toAbsolutePath().normalize();

    // Chỉ chấp nhận các loại file này — chặn upload file độc hại
    private static final Set<String> ALLOWED_AUDIO_TYPES = Set.of("audio/mpeg", "audio/mp3");
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    public FileStorageService() {
        try {
            Files.createDirectories(ROOT);
        } catch (IOException e) {
            throw new IllegalStateException("Không tạo được thư mục uploads: " + ROOT, e);
        }
    }

    /**
     * Lưu file vào uploads/<subDir>/<uuid>.<ext>
     * Trả về đường dẫn NỘI BỘ dạng "songs/xxxx.mp3" — giá trị lưu vào DB.
     */
    public String store(MultipartFile file, String subDir, Set<String> allowedTypes) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new BadRequestException("Loại file không hợp lệ: " + contentType);
        }

        // Đuôi file lấy từ tên gốc, chuyển thường để đồng nhất
        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.')).toLowerCase()
                : "";

        // UUID: tên file an toàn, KHÔNG bao giờ tin tên file của client
        // (chống path traversal: "../../etc/passwd")
        String filename = UUID.randomUUID() + ext;

        try {
            Path target = ROOT.resolve(subDir).resolve(filename);
            Files.createDirectories(target.getParent());
            file.transferTo(target);
        } catch (IOException e) {
            throw new IllegalStateException("Lưu file thất bại", e);
        }
        return subDir + "/" + filename;
    }

    /**
     * Đọc file từ đường dẫn nội bộ (giá trị file_url trong DB).
     */
    public Resource load(String relativePath) {
        Path path = ROOT.resolve(relativePath).normalize();

        // CHỐNG PATH TRAVERSAL: sau khi normalize, path phải vẫn nằm trong ROOT
        // ("../" sẽ thoát ra ngoài uploads/ -> từ chối)
        if (!path.startsWith(ROOT)) {
            throw new BadRequestException("Đường dẫn file không hợp lệ");
        }
        Resource resource = new FileSystemResource(path);
        if (!resource.exists()) {
            throw new ResourceNotFoundException("File không tồn tại trên server");
        }
        return resource;
    }

    /** Xóa file (dùng khi xóa bài hát). Không tồn tại thì bỏ qua. */
    public void delete(String relativePath) {
        try {
            Path path = ROOT.resolve(relativePath).normalize();
            if (path.startsWith(ROOT)) {
                Files.deleteIfExists(path);
            }
        } catch (IOException e) {
            // Xóa thất bại không nên làm hỏng cả thao tác xóa bài hát
        }
    }
}
```

## 5. Bước 4 — Sửa `SongService`

Thêm 4 việc: upload, đọc file để stream, nối URL tuyệt đối cho DTO, xóa file
khi xóa bài hát.

```java
@Service
public class SongService {

    private final SongRepository songRepository;
    private final FileStorageService fileStorageService;

    // constructor injection...

    // ============ UPLOAD ============

    @Transactional
    public SongDto upload(String title, MultipartFile audio, MultipartFile cover) {
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Tiêu đề bài hát không được để trống");
        }

        // 1. Lưu file vật lý trước — lưu DB mà file hỏng thì mất công nhất quán
        String audioPath = fileStorageService.store(audio, "songs", ALLOWED_AUDIO);
        String coverPath = (cover != null && !cover.isEmpty())
                ? fileStorageService.store(cover, "covers", ALLOWED_IMAGE)
                : null;

        // 2. Lưu thông tin vào DB — file_url là đường dẫn NỘI BỘ
        Song song = new Song();
        song.setTitle(title);
        song.setFileUrl(audioPath);
        song.setImgUrl(coverPath);
        song.setDuration(null);   // frontend tự đo duration từ audio metadata
        song.setUser(userRepository.getReferenceById(SecurityUtils.getCurrentUserId()));
        songRepository.save(song);

        return SongDto.from(song, buildAbsoluteUrl(song.getSongId()));
    }

    // ============ STREAM (đọc file cho controller) ============

    /** Lấy file audio từ ổ cứng — controller dùng để stream theo Range. */
    public Resource getAudioResource(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", songId));
        return fileStorageService.load(song.getFileUrl());
    }

    /** Lấy ảnh bìa — trả null nếu bài hát không có cover. */
    public Resource getCoverResource(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", songId));
        if (song.getImgUrl() == null) {
            throw new ResourceNotFoundException("Bài hát không có ảnh bìa");
        }
        return fileStorageService.load(song.getImgUrl());
    }

    // ============ URL TUYỆT ĐỐI CHO FRONTEND ============

    /**
     * Frontend gán thẳng fileUrl vào <audio src> — phải là URL TUYỆT ĐỐI
     * trỏ về backend (localhost:8080), không phải đường dẫn tương đối
     * (đường tương đối sẽ bị hiểu là localhost:5173 — frontend Vite).
     * Sinh động từ request hiện tại nên đổi domain deploy không cần sửa DB.
     */
    private String buildAbsoluteUrl(Long songId) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/songs/{id}/stream")
                .buildAndExpand(songId)
                .toUriString();
        // → "http://localhost:8080/api/v1/songs/5/stream"
    }

    /** Tương tự cho ảnh bìa — SongCard/MusicPlayer dùng thẳng <img src={song.imgUrl}>. */
    private String buildAbsoluteCoverUrl(Long songId) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/songs/{id}/cover")
                .buildAndExpand(songId)
                .toUriString();
        // → "http://localhost:8080/api/v1/songs/5/cover"
    }

    // ============ XÓA ============

    @Transactional
    public void deleteSong(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", songId));

        if (!song.getUser().getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("Bạn không có quyền xóa bài hát này");
        }

        // Xóa file vật lý trước khi xóa bản ghi DB
        fileStorageService.delete(song.getFileUrl());
        if (song.getImgUrl() != null) {
            fileStorageService.delete(song.getImgUrl());
        }
        songRepository.delete(song);
    }
}
```

> Lưu ý: `ALLOWED_AUDIO`/`ALLOWED_IMAGE` — khai báo hằng ở `FileStorageService`
> hoặc `SongService`, tùy tổ chức; giữ chúng công khai để dùng ở cả 2 nơi.

## 6. Hai cách đưa URL cho frontend — backend ghép hay frontend ghép

Thẻ `<audio>`/`<img>` cần URL **tuyệt đối** trỏ đúng backend (8080).
Có 2 cách để có URL đó — **cả 2 đều dùng được** và đều trỏ về cùng endpoint
`/stream`, nên Range/206, tua bài hoạt động **giống hệt nhau**.
Khác biệt duy nhất: **ai là người ghép URL**.

### Cách 1 — Backend ghép sẵn, frontend dùng thẳng `song.fileUrl` (khuyên dùng)

**Backend:** DTO trả `fileUrl`/`imgUrl` TUYỆT ĐỐI
(`buildAbsoluteUrl` + `buildAbsoluteCoverUrl` ở bước 4).

**Frontend dùng như thế nào — luồng dữ liệu đầy đủ:**

```
Backend trả SongDto:
  { songId: 5, title: "...", fileUrl: "http://localhost:8080/api/v1/songs/5/stream",
    imgUrl: "http://localhost:8080/api/v1/songs/5/cover", ... }

  1. songApi.getSongs()          → gọi GET /api/v1/songs, trả res.data (mảng SongDto)
  2. songService.getDiscover()   → truyền nguyên dữ liệu, không đụng fileUrl
  3. useSongs(fetchDiscoverSongs) → hook giữ state { data, loading, error }
  4. DiscoverPage                → render <SongCard song={s} />
  5. SongCard.jsx:31/58/84       → <img src={song.imgUrl} />
                                   ↑ imgUrl TUYỆT ĐỐI → ảnh load từ backend 8080 ✓
  6. Người dùng bấm play → App.jsx: setCurrentTrack(song)
  7. MusicPlayer.jsx:116-117     → audioRef.current.src = currentTrack.fileUrl
                                   ↑ fileUrl TUYỆT ĐỐI → <audio> stream từ backend 8080 ✓
  8. MusicPlayer.jsx:258         → <img src={currentTrack.imgUrl} /> (ảnh bìa player)
```

→ **KHÔNG sửa file frontend nào** — URL tuyệt đối từ API cứ thế chảy qua
các layer (API → service → hook → component) tới thẻ `<audio>`/`<img>`.

### Cách 2 — Frontend ghép bằng `getStreamUrl(id)` / `getCoverUrl(id)`

**Backend:** có thể trả `fileUrl` TƯƠNG ĐỐI (`/api/v1/songs/5/stream`)
hoặc bỏ hẳn `fileUrl`/`imgUrl` khỏi DTO — vì frontend không đọc chúng nữa,
chỉ cần `songId`.

**Frontend dùng như thế nào — luồng và những chỗ phải sửa:**

```
  1. songApi.getSongs()          → song object giờ chỉ cần có id
  2-4. service/hook/page         → KHÔNG đổi
  5. SongCard.jsx (3 chỗ)        → SỬA: <img src={getCoverUrl(song.id)} />
  6. App.jsx setCurrentTrack(song) → KHÔNG đổi
  7. MusicPlayer.jsx:116-117     → SỬA: audioRef.current.src = getStreamUrl(currentTrack.id)
  8. MusicPlayer.jsx:258         → SỬA: <img src={getCoverUrl(currentTrack.id)} />
```

Cụ thể từng chỗ sửa:

```js
// SongCard.jsx — thêm import
import { getCoverUrl } from '@/api/songApi';
// 3 chỗ đang là src={song.imgUrl} → đổi thành:
<img src={getCoverUrl(song.id)} />

// MusicPlayer.jsx — thêm import
import { getStreamUrl, getCoverUrl } from '@/api/songApi';
// dòng 116-117 — thay:
audioRef.current.src = currentTrack.fileUrl;
// thành:
audioRef.current.src = getStreamUrl(currentTrack.id);
// dòng 258 — thay:
<img src={currentTrack.imgUrl} />
// thành:
<img src={getCoverUrl(currentTrack.id)} />
```

`getStreamUrl(id)`/`getCoverUrl(id)` trong `songApi.js` đã trả sẵn
`${client.defaults.baseURL}/api/v1/songs/${id}/stream` — baseURL 8080 từ
`client.js`, nên URL sinh ra vẫn tuyệt đối đúng máy chủ.

⚠️ **Phải sửa MỌI chỗ render ảnh bài hát** — không được sót (hiện tại là
SongCard + MusicPlayer; sau này thêm trang genre/favorites mà render ảnh
bằng `imgUrl` thì cũng phải đổi sang `getCoverUrl`).

### Bảng so sánh

| | Cách 1: `song.fileUrl` | Cách 2: `getStreamUrl(id)` |
|---|---|---|
| Ai ghép URL | Backend (`buildAbsoluteUrl`) | Frontend (`baseURL` + path) |
| Backend trả gì | URL tuyệt đối trong DTO | Tương đối hoặc bỏ hẳn |
| Sửa frontend | ❌ Không — URL chảy thẳng qua các layer | ✅ MusicPlayer (2 chỗ) + SongCard (3 chỗ) + import |
| Tua bài / Range | ✅ | ✅ (cùng endpoint) |
| Đổi domain deploy | Backend tự sinh theo request — không đổi gì | `client.js` đổi baseURL — cũng không đổi gì |
| Phù hợp khi | Muốn frontend đơn giản, backend quyết hết | Muốn frontend chủ động xây URL, backend thuần dữ liệu |

> **Khuyến nghị cho project này:** Cách 1 — làm đúng guide (backend trả
> tuyệt đối) là frontend chạy ngay không cần sửa. Chọn cách 2 chỉ khi team
> muốn đồng nhất "mọi URL do frontend xây" — lúc đó sửa đúng các chỗ liệt kê
> ở trên, nhớ sửa hết mọi nơi render ảnh.

## 7. Bước 5 — Thêm endpoint vào `SongController`

```java
// ============ UPLOAD (cần token — SecurityConfig đã chặn sẵn) ============

// Field name "file" phải KHỚP với FormData của frontend:
//   uploadSong(formData) gửi: formData.append('file', ...), append('title', ...)
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<SongDto> upload(
        @RequestParam("title") String title,
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "cover", required = false) MultipartFile cover) {
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(songService.upload(title, file, cover));
}

// ============ STREAM (công khai — permitAll GET /api/v1/songs/**) ============

@GetMapping("/{id}/stream")
public ResponseEntity<byte[]> stream(@PathVariable Long id,
        @RequestHeader(value = "Range", required = false) String rangeHeader)
        throws IOException {

    Resource file = songService.getAudioResource(id);
    long fileLength = file.contentLength();
    final String contentType = "audio/mpeg";

    // --- Không có Range: trả toàn bộ file (200 OK) ---
    if (rangeHeader == null) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .contentLength(fileLength)
                .body(file.getContentAsByteArray());   // file mp3 nhỏ, đọc 1 lần
    }

    // --- Có Range: bytes=0-1023 -> trả ĐÚNG đoạn được yêu cầu (206) ---
    // Trình duyệt dùng Range khi TUA bài: chỉ tải đoạn cần nghe, không tải
    // lại cả file. Thiếu phần này thì tua sẽ không hoạt động.
    HttpRange range = HttpRange.parseRanges(rangeHeader).get(0);
    long start = range.getRangeStart(fileLength);
    long end = range.getRangeEnd(fileLength);
    long chunkLength = end - start + 1;

    byte[] chunk;
    try (InputStream in = file.getInputStream()) {
        in.skipNBytes(start);
        chunk = in.readNBytes((int) chunkLength);
    }

    return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)   // 206
            .header(HttpHeaders.CONTENT_TYPE, contentType)
            .header(HttpHeaders.ACCEPT_RANGES, "bytes")
            .header(HttpHeaders.CONTENT_RANGE,
                    "bytes " + start + "-" + end + "/" + fileLength)
            .contentLength(chunkLength)
            .body(chunk);
}

// ============ COVER (công khai) ============

@GetMapping("/{id}/cover")
public ResponseEntity<Resource> cover(@PathVariable Long id) throws IOException {
    Resource file = songService.getCoverResource(id);

    // Content type theo đuôi file (jpg/png/webp)
    String ext = file.getFilename() != null
            ? file.getFilename().substring(file.getFilename().lastIndexOf('.') + 1).toLowerCase()
            : "jpg";
    MediaType mediaType = switch (ext) {
        case "png" -> MediaType.IMAGE_PNG;
        case "webp" -> MediaType.IMAGE_WEBP;   // nếu Spring không có hằng này thì dùng parseMediaType
        default -> MediaType.IMAGE_JPEG;
    };

    return ResponseEntity.ok()
            .contentType(mediaType)
            .body(file);
}
```

> **Vì sao `/stream` và `/cover` không cần token?** `SecurityConfig` đã permitAll
> `GET /api/v1/songs/**` — vì thẻ `<audio>`/`<img>` KHÔNG gửi được header
> Authorization. Nếu sau này muốn chặn thì phải truyền token qua query param
> (`?token=...`) hoặc cookie — không cần lo lúc này.

## 8. Bước 6 — Kiểm thử bằng curl

```bash
# 1. Đăng nhập lấy token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}' | jq -r .token)

# 2. Upload bài hát (field "file" — đúng tên frontend gửi)
curl -X POST http://localhost:8080/api/v1/songs \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Test Song" \
  -F "file=@/path/to/song.mp3;type=audio/mpeg" \
  -F "cover=@/path/to/cover.jpg;type=image/jpeg"
# → 201 + SongDto, fileUrl = "http://localhost:8080/api/v1/songs/5/stream"
# Kiểm tra file đã nằm ở uploads/songs/*.mp3

# 3. Phát toàn bộ (không Range) → 200
curl -i http://localhost:8080/api/v1/songs/5/stream | head -20
#   HTTP/1.1 200, Accept-Ranges: bytes, Content-Length: <size>

# 4. Tua bài (có Range) → 206 Partial Content
curl -i -H "Range: bytes=0-1023" http://localhost:8080/api/v1/songs/5/stream | head -20
#   HTTP/1.1 206, Content-Range: bytes 0-1023/<size>, body dài đúng 1024 byte

# 5. Ảnh bìa → 200 image/jpeg
curl -I http://localhost:8080/api/v1/songs/5/cover

# 6. Case lỗi
curl -i http://localhost:8080/api/v1/songs/999/stream   # 404 NOT_FOUND (bài hát không tồn tại)
curl -X POST http://localhost:8080/api/v1/songs -F "file=@a.txt" -H "Authorization: Bearer $TOKEN"
#   400 BAD_REQUEST (loại file không hợp lệ)
curl -X POST http://localhost:8080/api/v1/songs -F "file=@song.mp3"   # thiếu token
#   401 UNAUTHORIZED
```

Sau đó chạy frontend (`MOCK=false`) và nghe thử: phát + tua bài trên
MusicPlayer — Range hoạt động thì tua mới chạy.

## 9. Lưu ý & nâng cấp

| Vấn đề | Hướng xử lý |
|---|---|
| Đọc cả file vào RAM khi stream | Chấp nhận được với mp3 < 20MB. Production: trả `ResourceRegion` cho Spring stream dần, không nạp cả file |
| `duration` ✅ ĐÃ LÀM | Frontend đo bằng Audio API trước khi upload (`UploadedPage.readAudioDuration`) rồi gửi kèm FormData field `duration`; backend nhận `@RequestParam(value="duration", required=false)` và lưu, fallback 0 nếu không đo được |
| `genreIds` trong FormData frontend | Bỏ qua ở bản v1 — cần quan hệ Song↔SongGenre trước. Sau khi có, thêm `@RequestParam(required=false) List<Long> genreIds` |
| Muốn đếm lượt nghe khi stream | Thêm 1 dòng trong `getAudioResource`: gọi `historyService.record(...)` hoặc tăng cột play_count (chú ý: gọi từ controller chứ không phải service để không nằm trong transaction đọc) |
| Chuyển sang S3/Cloudinary sau này | Chỉ sửa `FileStorageService` (store/load/delete) + đổi `buildAbsoluteUrl` — DB và frontend không đổi |
| Phương án rút gọn (không dùng /stream) | Serve thẳng thư mục uploads qua `WebMvcConfigurer.addResourceHandlers("/uploads/**")`, DB lưu `/uploads/songs/x.mp3`, DTO nối origin. Ít code hơn nhưng mất kiểm soát quyền và lệch GUIDE.md |
| Upload quá 20MB | Spring ném `MaxUploadSizeExceededException` — thêm handler trong `GlobalExceptionHandler` trả 400 cho đẹp |
