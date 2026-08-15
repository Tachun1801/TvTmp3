package com.tvtmp3.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tvtmp3.backend.dto.SongDto;
import com.tvtmp3.backend.service.SongService;

/**
 * Endpoint bài hát — phạm vi hiện tại: UPLOAD.
 *
 * Các endpoint KHÁC do thành viên khác làm, sẽ thêm vào class này sau:
 * - GET /{id}/stream (HTTP Range) + /{id}/cover + DELETE /{id}
 *   -> xem backend/docs/upload-stream.md (bước 5)
 * - GET danh sách/tìm kiếm/charts/chi tiết
 *   -> xem controller/README.md
 *
 * Phân quyền: POST /api/v1/songs cần token (SecurityConfig đã chặn sẵn).
 */
@RestController
@RequestMapping("/api/v1/songs")
public class SongController {

    private final SongService songService;

    public SongController(SongService songService) {
        this.songService = songService;
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
