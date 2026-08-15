package com.tvtmp3.backend.dto;

import com.tvtmp3.backend.entity.Genre;

/**
 * Thể loại nhạc — trả về ở GET /api/v1/genres.
 */
public record GenreDto(
        Long genreId,
        String name,
        String description,
        String imgUrl
) {

    /** Chuyển entity -> DTO. */
    public static GenreDto from(Genre genre) {
        return new GenreDto(
                genre.getGenreId(),
                genre.getName(),
                genre.getDescription(),
                genre.getImgUrl()
        );
    }
}
