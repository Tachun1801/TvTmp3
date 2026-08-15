package com.tvtmp3.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tvtmp3.backend.dto.GenreDto;
import com.tvtmp3.backend.service.GenreService;

/**
 * Endpoint thể loại — GET /api/v1/genres.
 * Đã permitAll trong SecurityConfig (GET /api/v1/genres/**).
 */
@RestController
@RequestMapping("/api/v1/genres")
public class GenreController {

    private final GenreService genreService;

    public GenreController(GenreService genreService) {
        this.genreService = genreService;
    }

    @GetMapping
    public List<GenreDto> getAll() {
        return genreService.getAll();
    }
}
