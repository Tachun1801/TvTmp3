package com.tvtmp3.backend.dto;

import java.time.Instant;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.tvtmp3.backend.entity.Song;

/**
 * Thông tin bài hát trả về cho client — dùng ở MỌI endpoint liên quan tới
 * bài hát: danh sách, chi tiết, search, charts, favorites, /me/songs...
 *
 * === fileUrl / imgUrl LÀ URL TUYỆT ĐỐI ===
 * DB chỉ lưu đường dẫn file NỘI BỘ ("songs/xxx.mp3"), nhưng frontend gán
 * thẳng vào <audio src>/<img src> nên DTO phải trả URL TUYỆT ĐỐI trỏ về
 * endpoint stream/cover của backend (xem backend/docs/upload-stream.md mục 6).
 * URL được sinh động từ request hiện tại nên đổi domain deploy không cần sửa DB.
 */
public record SongDto(
        Long songId,
        String title,
        Integer duration,     // giây — có thể null, frontend tự đo từ audio metadata
        String fileUrl,       // TUYỆT ĐỐI: http://localhost:8080/api/v1/songs/{id}/stream
        String imgUrl,        // TUYỆT ĐỐI: http://localhost:8080/api/v1/songs/{id}/cover (null nếu không có)
        UserDto uploader,     // người upload — dùng UserDto để không lộ password
        Instant createdAt
) {

    /** Chuyển entity -> DTO, đồng thời đổi đường dẫn file nội bộ thành URL tuyệt đối. */
    public static SongDto from(Song song) {
        String base = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();
        String songUrl = base + "/api/v1/songs/" + song.getSongId();

        return new SongDto(
                song.getSongId(),
                song.getTitle(),
                song.getDuration(),
                song.getFileUrl() != null ? songUrl + "/stream" : null,
                song.getImgUrl() != null ? songUrl + "/cover" : null,
                UserDto.from(song.getUser()),
                song.getCreatedAt()
        );
    }
}
