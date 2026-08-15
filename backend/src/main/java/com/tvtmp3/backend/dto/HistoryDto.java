package com.tvtmp3.backend.dto;

import java.time.Instant;

import com.tvtmp3.backend.entity.PlayHistory;

/**
 * Một dòng trong lịch sử nghe — trả về ở GET /api/v1/history.
 * Kèm thông tin bài hát đầy đủ để frontend render không cần gọi thêm API.
 */
public record HistoryDto(
        Long historyId,
        SongDto song,       // bài hát đã nghe — dùng SongDto (kèm URL stream sẵn)
        Instant playedAt
) {

    /** Chuyển entity -> DTO. */
    public static HistoryDto from(PlayHistory history) {
        return new HistoryDto(
                history.getHistoryId(),
                SongDto.from(history.getSong()),
                history.getPlayedAt()
        );
    }
}
