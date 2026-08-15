package com.tvtmp3.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tvtmp3.backend.dto.GenreDto;
import com.tvtmp3.backend.repository.GenreRepository;

/**
 * Xử lý thể loại — hiện chỉ có 1 việc: trả danh sách thể loại
 * cho GET /api/v1/genres (trang upload + GenresPage).
 *
 * Dữ liệu được seed sẵn bằng SQL INSERT (xem database.md + mock genres).
 */
@Service
public class GenreService {

    private final GenreRepository genreRepository;

    public GenreService(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    /** Trả toàn bộ thể loại, map entity -> GenreDto (không trả entity ra ngoài). */
    public List<GenreDto> getAll() {
        return genreRepository.findAll().stream()
                .map(GenreDto::from)
                .toList();
    }
}
