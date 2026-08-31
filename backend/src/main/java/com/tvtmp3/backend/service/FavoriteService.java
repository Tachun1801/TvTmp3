package com.tvtmp3.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tvtmp3.backend.dto.PageResponse;
import com.tvtmp3.backend.dto.SongDto;
import com.tvtmp3.backend.entity.FavoriteSong;
import com.tvtmp3.backend.entity.FavoriteSongId;
import com.tvtmp3.backend.entity.Song;
import com.tvtmp3.backend.exception.BadRequestException;
import com.tvtmp3.backend.exception.ResourceNotFoundException;
import com.tvtmp3.backend.repository.FavoriteSongRepository;
import com.tvtmp3.backend.repository.SongRepository;
import com.tvtmp3.backend.repository.UserRepository;
import com.tvtmp3.backend.security.SecurityUtils;

/**
 * Xử lý danh sách yêu thích — user hiện tại lấy từ token (SecurityUtils).
 */
@Service
public class FavoriteService {

    private final FavoriteSongRepository favoriteRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;
    private final SongEnricher songEnricher;

    public FavoriteService(FavoriteSongRepository favoriteRepository,
                           SongRepository songRepository,
                           UserRepository userRepository,
                           SongEnricher songEnricher) {
        this.favoriteRepository = favoriteRepository;
        this.songRepository = songRepository;
        this.userRepository = userRepository;
        this.songEnricher = songEnricher;
    }

    /** Danh sách bài hát yêu thích, kèm genres + playCount (batch). */
    public PageResponse<SongDto> getFavorites(int page, int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<Song> songs = favoriteRepository.findFavoriteSongs(
                userId, PageRequest.of(page - 1, size));
        return songEnricher.toPageResponse(songs);
    }

    @Transactional
    public void addFavorite(Long songId) {
        Long userId = SecurityUtils.getCurrentUserId();

        // Bài hát phải tồn tại — trả 404 thân thiện thay vì FK violation 409
        if (!songRepository.existsById(songId)) {
            throw new ResourceNotFoundException("Song", songId);
        }
        // Đã yêu thích rồi → 400 (frontend toggle dựa vào lỗi này để rollback)
        if (favoriteRepository.existsById(new FavoriteSongId(userId, songId))) {
            throw new BadRequestException("Bài hát đã có trong danh sách yêu thích");
        }

        FavoriteSong favorite = new FavoriteSong();
        // @MapsId: KHÔNG cần setId — Hibernate tự điền khóa ghép FavoriteSongId
        // từ 2 quan hệ dưới đây (pattern giống SongService.upload)
        favorite.setSong(songRepository.getReferenceById(songId));
        favorite.setUser(userRepository.getReferenceById(userId));
        favoriteRepository.save(favorite);   // created_at tự @PrePersist
    }

    @Transactional
    public void removeFavorite(Long songId) {
        Long userId = SecurityUtils.getCurrentUserId();
        FavoriteSong favorite = favoriteRepository
                .findById(new FavoriteSongId(userId, songId))
                .orElseThrow(() -> new ResourceNotFoundException("Bài hát không có trong danh sách yêu thích"));
        favoriteRepository.delete(favorite);
    }
}
