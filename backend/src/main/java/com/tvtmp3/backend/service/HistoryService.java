package com.tvtmp3.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tvtmp3.backend.dto.HistoryDto;
import com.tvtmp3.backend.dto.PageResponse;
import com.tvtmp3.backend.dto.SongDto;
import com.tvtmp3.backend.entity.PlayHistory;
import com.tvtmp3.backend.entity.Song;
import com.tvtmp3.backend.exception.ResourceNotFoundException;
import com.tvtmp3.backend.repository.PlayHistoryRepository;
import com.tvtmp3.backend.repository.SongRepository;
import com.tvtmp3.backend.repository.UserRepository;
import com.tvtmp3.backend.security.SecurityUtils;

/**
 * Xử lý lịch sử nghe — user hiện tại lấy từ token (SecurityUtils).
 */
@Service
public class HistoryService {

    private final PlayHistoryRepository historyRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;
    private final SongEnricher songEnricher;

    public HistoryService(PlayHistoryRepository historyRepository,
                          SongRepository songRepository,
                          UserRepository userRepository,
                          SongEnricher songEnricher) {
        this.historyRepository = historyRepository;
        this.songRepository = songRepository;
        this.userRepository = userRepository;
        this.songEnricher = songEnricher;
    }

    /**
     * Lịch sử nghe mới nhất trước — kèm song đầy đủ (genres + playCount)
     * để frontend render không cần gọi thêm API (RecentlyPlayedPage đọc
     * song.genres / song.artist).
     */
    public PageResponse<HistoryDto> getHistory(int page, int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<PlayHistory> historyPage = historyRepository
                .findByUser_UserIdOrderByPlayedAtDesc(userId, PageRequest.of(page - 1, size));

        // Enrich song cho CẢ trang bằng 2 batch query (quy tắc N+1)
        List<Song> songs = historyPage.getContent().stream()
                .map(PlayHistory::getSong)
                .toList();
        Map<Long, List<String>> genresMap = songEnricher.loadGenres(songs);
        Map<Long, Long> countMap = songEnricher.loadPlayCounts(
                songs.stream().map(Song::getSongId).toList());

        Page<HistoryDto> dtoPage = historyPage.map(h -> new HistoryDto(
                h.getHistoryId(),
                SongDto.from(
                        h.getSong(),
                        genresMap.getOrDefault(h.getSong().getSongId(), List.of()),
                        countMap.getOrDefault(h.getSong().getSongId(), 0L)),
                h.getPlayedAt()));
        return PageResponse.of(dtoPage);
    }

    /** Ghi nhận user vừa nghe 1 bài — played_at tự @PrePersist. */
    @Transactional
    public void record(Long songId) {
        Long userId = SecurityUtils.getCurrentUserId();

        // Bài hát phải tồn tại — 404 thân thiện thay vì FK violation 409
        if (!songRepository.existsById(songId)) {
            throw new ResourceNotFoundException("Song", songId);
        }

        PlayHistory history = new PlayHistory();
        // getReferenceById: chỉ cần khóa ngoại, không tốn query đọc cả row
        history.setUser(userRepository.getReferenceById(userId));
        history.setSong(songRepository.getReferenceById(songId));
        historyRepository.save(history);
    }
}
