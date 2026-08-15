package com.tvtmp3.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.tvtmp3.backend.dto.SongDto;
import com.tvtmp3.backend.entity.Song;
import com.tvtmp3.backend.entity.SongGenre;
import com.tvtmp3.backend.exception.BadRequestException;
import com.tvtmp3.backend.exception.ResourceNotFoundException;
import com.tvtmp3.backend.repository.GenreRepository;
import com.tvtmp3.backend.repository.SongGenreRepository;
import com.tvtmp3.backend.repository.SongRepository;
import com.tvtmp3.backend.repository.UserRepository;
import com.tvtmp3.backend.security.SecurityUtils;

/**
 * Xử lý bài hát — phạm vi hiện tại: UPLOAD.
 *
 * Các phần KHÁC do thành viên khác làm, sẽ thêm vào class này sau:
 * - Stream + cover + xóa      -> xem backend/docs/upload-stream.md (bước 4)
 * - Danh sách/tìm kiếm/charts -> xem service/README.md
 */
@Service
public class SongService {

    private final SongRepository songRepository;
    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final SongGenreRepository songGenreRepository;
    private final FileStorageService fileStorageService;

    public SongService(SongRepository songRepository,
                       UserRepository userRepository,
                       GenreRepository genreRepository,
                       SongGenreRepository songGenreRepository,
                       FileStorageService fileStorageService) {
        this.songRepository = songRepository;
        this.userRepository = userRepository;
        this.genreRepository = genreRepository;
        this.songGenreRepository = songGenreRepository;
        this.fileStorageService = fileStorageService;
    }

    // ============================================================
    // UPLOAD — POST /api/v1/songs (multipart)
    // ============================================================

    @Transactional
    public SongDto upload(String title, MultipartFile audio, MultipartFile cover,
                          Integer duration, List<Long> genreIds) {
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Tiêu đề bài hát không được để trống");
        }

        // 1. Lưu file VẬT LÝ trước — nếu lưu DB trước mà lưu file hỏng thì
        //    DB sẽ có bản ghi trỏ tới file không tồn tại
        String audioPath = fileStorageService.store(audio, "songs", FileStorageService.ALLOWED_AUDIO_TYPES);
        String coverPath = (cover != null && !cover.isEmpty())
                ? fileStorageService.store(cover, "covers", FileStorageService.ALLOWED_IMAGE_TYPES)
                : null;

        // 2. Lưu thông tin vào DB — file_url là đường dẫn NỘI BỘ trên ổ cứng
        //    (đổi thành URL tuyệt đối cho frontend do SongDto.from() đảm nhiệm)
        Song song = new Song();
        song.setTitle(title);
        song.setFileUrl(audioPath);
        song.setImgUrl(coverPath);
        // duration do frontend đo từ audio metadata gửi lên kèm FormData.
        // Fallback 0 vì cột NOT NULL trong DB (khi không đo được) — MusicPlayer
        // vẫn tự đo lại giá trị chính xác khi phát.
        song.setDuration(duration != null && duration > 0 ? duration : 0);
        // getReferenceById: chỉ cần khóa ngoại user_id, không tốn query đọc cả User
        song.setUser(userRepository.getReferenceById(SecurityUtils.getCurrentUserId()));
        songRepository.save(song);   // save trước để có songId (IDENTITY) cho bảng song_genres

        // 3. Lưu quan hệ bài hát <-> thể loại vào bảng song_genres
        if (genreIds != null && !genreIds.isEmpty()) {
            for (Long genreId : genreIds) {
                // Kiểm tra genre tồn tại để trả lỗi 404 thân thiện
                // (không kiểm tra thì FK violation -> 409 khó hiểu)
                if (!genreRepository.existsById(genreId)) {
                    throw new ResourceNotFoundException("Genre", genreId);
                }
                SongGenre songGenre = new SongGenre();
                // @MapsId: không cần set id — Hibernate tự lấy song_id/genre_id
                // từ 2 quan hệ dưới đây để điền khóa ghép SongGenreId
                songGenre.setSong(song);
                songGenre.setGenre(genreRepository.getReferenceById(genreId));
                songGenreRepository.save(songGenre);
            }
        }

        return SongDto.from(song);
    }
}
