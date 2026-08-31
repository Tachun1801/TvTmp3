package com.tvtmp3.backend.controller;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tvtmp3.backend.dto.PageResponse;
import com.tvtmp3.backend.dto.SongDto;
import com.tvtmp3.backend.service.SongService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * Endpoint bài hát: upload, danh sách, tìm kiếm, charts, chi tiết, xóa.
 *
 * Phân quyền (SecurityConfig):
 *   - GET /api/v1/songs/** : permitAll — <audio>/<img> không gửi được header
 *     Authorization nên stream/cover phải public.
 *   - POST/DELETE            : cần token (anyRequest().authenticated()).
 */
@RestController
@RequestMapping("/api/v1/songs")
public class SongController {

    private final SongService songService;

    public SongController(SongService songService) {
        this.songService = songService;
    }

    // ============================================================
    // DANH SÁCH / TÌM KIẾM / CHARTS / CHI TIẾT / XÓA
    // (khai báo /search và /charts TRƯỚC /{id} để không bị match nhầm)
    // ============================================================

    /**
     * GET /api/v1/songs?genre=&sort=latest|popular&page=1&size=20
     * Response khớp contract frontend: { data, total, page, size }
     */
    @GetMapping
    public PageResponse<SongDto> getSongs(
            @RequestParam(required = false) String genre,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return songService.getSongs(genre, sort, page, size);
    }

    /** GET /api/v1/songs/search?q= — tìm theo tiêu đề hoặc tên người upload. */
    @GetMapping("/search")
    public PageResponse<SongDto> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return songService.search(q, page, size);
    }

    /** GET /api/v1/songs/charts?type=weekly|monthly|alltime — toàn bộ bài kèm rank. */
    @GetMapping("/charts")
    public List<SongDto> charts(@RequestParam(defaultValue = "alltime") String type) {
        return songService.getCharts(type);
    }

    /** GET /api/v1/songs/{id} — chi tiết 1 bài hát. */
    @GetMapping("/{id}")
    public SongDto getSong(@PathVariable Long id) {
        return songService.getSong(id);
    }

    /**
     * DELETE /api/v1/songs/{id} — chỉ người upload được xóa (khác → 403).
     * Response { success: true } khớp contract frontend.
     */
    @DeleteMapping("/{id}")
    public Map<String, Boolean> delete(@PathVariable Long id) {
        songService.deleteSong(id);
        return Map.of("success", true);
    }

    // ============================================================
    // STREAM / COVER (public — permitAll GET /api/v1/songs/**)
    // ============================================================

    /**
     * GET /api/v1/songs/{id}/stream — phát nhạc, hỗ trợ HTTP Range (tua bài).
     *
     * - Không có Range  → 200 full file + Accept-Ranges: bytes
     * - Có Range        → 206 + Content-Range (trình duyệt chỉ tải đoạn cần nghe)
     * - Range sai/ngoài → 416 REQUESTED_RANGE_NOT_SATISFIABLE
     *
     * Đọc cả file vào byte[]: chấp nhận được vì multipart đã giới hạn 20MB
     * (xem backend/docs/upload-stream.md §9 — production nên dùng ResourceRegion).
     */
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
                    .body(file.getContentAsByteArray());
        }

        // --- Có Range: bytes=0-1023 -> trả ĐÚNG đoạn được yêu cầu (206) ---
        // Range sai cú pháp hoặc ngoài kích thước file -> 416 (không crash 500)
        HttpRange range;
        try {
            List<HttpRange> ranges = HttpRange.parseRanges(rangeHeader);
            if (ranges.isEmpty()) {
                return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                        .header(HttpHeaders.CONTENT_RANGE, "bytes */" + fileLength)
                        .build();
            }
            range = ranges.get(0);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                    .header(HttpHeaders.CONTENT_RANGE, "bytes */" + fileLength)
                    .build();
        }

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

    /** GET /api/v1/songs/{id}/cover — ảnh bìa, Content-Type theo đuôi file. */
    @GetMapping("/{id}/cover")
    public ResponseEntity<Resource> cover(@PathVariable Long id) throws IOException {
        Resource file = songService.getCoverResource(id);

        String filename = file.getFilename() != null ? file.getFilename() : "cover.jpg";
        String ext = filename.contains(".")
                ? filename.substring(filename.lastIndexOf('.') + 1).toLowerCase()
                : "jpg";
        MediaType mediaType = switch (ext) {
            case "png" -> MediaType.IMAGE_PNG;
            case "webp" -> MediaType.parseMediaType("image/webp");
            default -> MediaType.IMAGE_JPEG;
        };

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(file);
    }

    // ============================================================
    // UPLOAD — POST /api/v1/songs (multipart)
    // ============================================================

    /**
     * Field "file" phải KHỚP với FormData của frontend (songApi.uploadSong):
     *   formData.append('file', ...); formData.append('title', ...)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SongDto> upload(
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "cover", required = false) MultipartFile cover,
            @RequestParam(value = "duration", required = false) Integer duration,
            @RequestParam(value = "genreIds", required = false) List<Long> genreIds) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(songService.upload(title, file, cover, duration, genreIds));
    }
}
