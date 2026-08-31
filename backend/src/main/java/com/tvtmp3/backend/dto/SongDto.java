package com.tvtmp3.backend.dto;

import java.time.Instant;
import java.util.List;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.fasterxml.jackson.annotation.JsonInclude;
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
 *
 * === genres / playCount / rank LÀ FIELD "LƯỜI" ===
 * Chỉ nạp khi endpoint cần (query batch riêng trong SongService). Upload
 * response dùng from(Song) → 3 field này null và bị @JsonInclude bỏ khỏi
 * JSON — không tốn query thêm cho flow upload.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SongDto(
        Long songId,
        String title,
        Integer duration,     // giây — có thể null, frontend tự đo từ audio metadata
        String fileUrl,       // TUYỆT ĐỐI: http://localhost:8080/api/v1/songs/{id}/stream
        String imgUrl,        // TUYỆT ĐỐI: http://localhost:8080/api/v1/songs/{id}/cover (null nếu không có)
        UserDto uploader,     // người upload — dùng UserDto để không lộ password
        Instant createdAt,
        List<String> genres,  // tên genre (song_genres → genres.name) — null khi không nạp
        Long playCount,       // tổng lượt nghe (đếm từ play_history) — null khi không nạp
        Integer rank          // thứ hạng trong charts — null ngoài charts
) {

    /** Upload response — không nạp genres/playCount/rank (rẻ, không query thêm). */
    public static SongDto from(Song song) {
        return build(song, null, null, null);
    }

    /** Danh sách / chi tiết / search / favorites / me-songs — có genres + playCount. */
    public static SongDto from(Song song, List<String> genres, Long playCount) {
        return build(song, genres, playCount, null);
    }

    /** Charts — có thêm thứ hạng. */
    public static SongDto from(Song song, List<String> genres, Long playCount, Integer rank) {
        return build(song, genres, playCount, rank);
    }

    /**
     * Core builder DUY NHẤT chứa logic đổi đường dẫn file nội bộ thành URL
     * tuyệt đối — mọi overload phải đi qua đây để không lệch nhau.
     */
    private static SongDto build(Song song, List<String> genres, Long playCount, Integer rank) {
        String base = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();
        String songUrl = base + "/api/v1/songs/" + song.getSongId();

        return new SongDto(
                song.getSongId(),
                song.getTitle(),
                song.getDuration(),
                song.getFileUrl() != null ? songUrl + "/stream" : null,
                song.getImgUrl() != null ? songUrl + "/cover" : null,
                UserDto.from(song.getUser()),
                song.getCreatedAt(),
                genres,
                playCount,
                rank
        );
    }
}
