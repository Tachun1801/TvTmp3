package com.tvtmp3.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import com.tvtmp3.backend.dto.PageResponse;
import com.tvtmp3.backend.dto.SongDto;
import com.tvtmp3.backend.entity.Song;
import com.tvtmp3.backend.repository.PlayHistoryRepository;
import com.tvtmp3.backend.repository.SongGenreRepository;

/**
 * Enrich SongDto với genres + playCount cho MỌI list endpoint.
 *
 * === QUY TẮC N+1 ===
 * Mọi thao tác dùng ĐÚNG 2 batch query (genres + playCount) cho cả danh sách,
 * không bao giờ query từng bài. Các service (Song/Favorite/History) đều đi
 * qua class này để không lặp lại logic map giống nhau.
 */
@Component
public class SongEnricher {

    private final SongGenreRepository songGenreRepository;
    private final PlayHistoryRepository playHistoryRepository;

    public SongEnricher(SongGenreRepository songGenreRepository,
                        PlayHistoryRepository playHistoryRepository) {
        this.songGenreRepository = songGenreRepository;
        this.playHistoryRepository = playHistoryRepository;
    }

    /** Trang bài hát → PageResponse kèm genres + playCount (khớp contract FE). */
    public PageResponse<SongDto> toPageResponse(Page<Song> page) {
        List<Song> songs = page.getContent();
        Map<Long, List<String>> genresMap = loadGenres(songs);
        Map<Long, Long> countMap = loadPlayCounts(ids(songs));

        Page<SongDto> dtoPage = page.map(song -> SongDto.from(
                song,
                genresMap.getOrDefault(song.getSongId(), List.of()),
                countMap.getOrDefault(song.getSongId(), 0L)));
        return PageResponse.of(dtoPage);
    }

    /** Danh sách bài hát → List<SongDto> kèm genres + playCount. */
    public List<SongDto> toDtoList(List<Song> songs) {
        Map<Long, List<String>> genresMap = loadGenres(songs);
        Map<Long, Long> countMap = loadPlayCounts(ids(songs));
        return songs.stream()
                .map(song -> SongDto.from(
                        song,
                        genresMap.getOrDefault(song.getSongId(), List.of()),
                        countMap.getOrDefault(song.getSongId(), 0L)))
                .toList();
    }

    /** 1 query lấy tên genre của cả danh sách bài hát → Map<songId, [tên]>. */
    public Map<Long, List<String>> loadGenres(List<Song> songs) {
        Map<Long, List<String>> map = new HashMap<>();
        for (Object[] row : songGenreRepository.findGenreNamesBySongIds(ids(songs))) {
            map.computeIfAbsent((Long) row[0], k -> new ArrayList<>()).add((String) row[1]);
        }
        return map;
    }

    /** 1 query đếm lượt nghe của cả danh sách bài hát → Map<songId, count>. */
    public Map<Long, Long> loadPlayCounts(List<Long> songIds) {
        return toCountMap(playHistoryRepository.countPlaysBySongIds(songIds));
    }

    /** Chuyển kết quả GROUP BY [songId, count] → Map. */
    public static Map<Long, Long> toCountMap(List<Object[]> rows) {
        Map<Long, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((Long) row[0], (Long) row[1]);
        }
        return map;
    }

    private static List<Long> ids(List<Song> songs) {
        return songs.stream().map(Song::getSongId).toList();
    }
}
