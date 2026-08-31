package com.tvtmp3.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.tvtmp3.backend.dto.PageResponse;
import com.tvtmp3.backend.dto.SongDto;
import com.tvtmp3.backend.entity.Song;
import com.tvtmp3.backend.entity.SongGenre;
import com.tvtmp3.backend.exception.BadRequestException;
import com.tvtmp3.backend.exception.ResourceNotFoundException;
import com.tvtmp3.backend.repository.GenreRepository;
import com.tvtmp3.backend.repository.PlayHistoryRepository;
import com.tvtmp3.backend.repository.SongGenreRepository;
import com.tvtmp3.backend.repository.SongRepository;
import com.tvtmp3.backend.repository.UserRepository;
import com.tvtmp3.backend.security.SecurityUtils;

/**
 * Xử lý bài hát: upload, danh sách, tìm kiếm, charts, chi tiết, xóa.
 *
 * === QUY TẮC N+1 ===
 * Mọi list endpoint enrich genres + playCount bằng ĐÚNG 2 batch query
 * (loadGenres + loadPlayCounts) — không bao giờ query từng bài.
 */
@Service
public class SongService {

    private final SongRepository songRepository;
    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final SongGenreRepository songGenreRepository;
    private final PlayHistoryRepository playHistoryRepository;
    private final FileStorageService fileStorageService;
    private final SongEnricher songEnricher;

    public SongService(SongRepository songRepository,
                       UserRepository userRepository,
                       GenreRepository genreRepository,
                       SongGenreRepository songGenreRepository,
                       PlayHistoryRepository playHistoryRepository,
                       FileStorageService fileStorageService,
                       SongEnricher songEnricher) {
        this.songRepository = songRepository;
        this.userRepository = userRepository;
        this.genreRepository = genreRepository;
        this.songGenreRepository = songGenreRepository;
        this.playHistoryRepository = playHistoryRepository;
        this.fileStorageService = fileStorageService;
        this.songEnricher = songEnricher;
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

    // ============================================================
    // DANH SÁCH — GET /api/v1/songs
    // ============================================================

    /**
     * @param genre tên genre để lọc (null = tất cả)
     * @param sort  "latest" (mới nhất) hoặc "popular" (nhiều lượt nghe nhất)
     * @param page  đếm từ 1 (khớp contract frontend)
     */
    public PageResponse<SongDto> getSongs(String genre, String sort, int page, int size) {
        PageRequest pageable = PageRequest.of(page - 1, size);  // JPA đếm từ 0

        Page<Song> result;
        if ("latest".equalsIgnoreCase(sort)) {
            result = songRepository.findAllLatest(genre, pageable);
        } else if ("popular".equalsIgnoreCase(sort)) {
            result = songRepository.findAllPopular(genre, pageable);
        } else {
            throw new BadRequestException("sort phải là 'latest' hoặc 'popular'");
        }
        return songEnricher.toPageResponse(result);
    }

    // ============================================================
    // TÌM KIẾM — GET /api/v1/songs/search
    // ============================================================

    public PageResponse<SongDto> search(String q, int page, int size) {
        if (q == null || q.isBlank()) {
            throw new BadRequestException("Từ khóa tìm kiếm không được để trống");
        }
        return songEnricher.toPageResponse(
                songRepository.search(q.trim(), PageRequest.of(page - 1, size)));
    }

    // ============================================================
    // CHARTS — GET /api/v1/songs/charts?type=weekly|monthly|alltime
    // ============================================================

    /**
     * Xếp hạng theo lượt nghe (play_history) trong cửa sổ thời gian.
     * KHÔNG phân trang: trả về TOÀN BỘ bài hát kèm rank — kể cả bài 0 lượt
     * (rank thấp nhất), frontend tự cắt theo nhu cầu.
     */
    public List<SongDto> getCharts(String type) {
        Instant since;
        if ("weekly".equalsIgnoreCase(type)) {
            since = Instant.now().minus(7, ChronoUnit.DAYS);
        } else if ("monthly".equalsIgnoreCase(type)) {
            since = Instant.now().minus(30, ChronoUnit.DAYS);
        } else if ("alltime".equalsIgnoreCase(type)) {
            since = null;
        } else {
            throw new BadRequestException("type phải là 'weekly', 'monthly' hoặc 'alltime'");
        }

        List<Song> songs = songRepository.findAll();
        Map<Long, Long> countMap = SongEnricher.toCountMap(
                since == null
                        ? playHistoryRepository.countAllPlays()
                        : playHistoryRepository.countPlaysSince(since));

        // Sort trong Java: playCount giảm dần, tie-break songId giảm dần (ổn định)
        songs.sort(Comparator
                .comparing((Song s) -> countMap.getOrDefault(s.getSongId(), 0L)).reversed()
                .thenComparing(Comparator.comparing(Song::getSongId).reversed()));

        Map<Long, List<String>> genresMap = songEnricher.loadGenres(songs);
        List<SongDto> result = new ArrayList<>(songs.size());
        for (int i = 0; i < songs.size(); i++) {
            Song song = songs.get(i);
            result.add(SongDto.from(
                    song,
                    genresMap.getOrDefault(song.getSongId(), List.of()),
                    countMap.getOrDefault(song.getSongId(), 0L),
                    i + 1));   // rank đếm từ 1
        }
        return result;
    }

    // ============================================================
    // CHI TIẾT — GET /api/v1/songs/{id}
    // ============================================================

    public SongDto getSong(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", songId));
        Map<Long, List<String>> genresMap = songEnricher.loadGenres(List.of(song));
        Map<Long, Long> countMap = songEnricher.loadPlayCounts(List.of(songId));
        return SongDto.from(
                song,
                genresMap.getOrDefault(songId, List.of()),
                countMap.getOrDefault(songId, 0L));
    }

    // ============================================================
    // BÀI HÁT CỦA TÔI — GET /api/v1/me/songs
    // ============================================================

    /** Danh sách bài hát user hiện tại đã upload, mới nhất trước. */
    public PageResponse<SongDto> getMySongs(int page, int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        return songEnricher.toPageResponse(
                songRepository.findByUser_UserIdOrderByCreatedAtDesc(userId, PageRequest.of(page - 1, size)));
    }

    // ============================================================
    // STREAM / COVER — đọc file cho controller (không stream ở đây)
    // ============================================================

    /** Lấy file audio từ ổ cứng — controller dùng để stream theo Range. */
    public Resource getAudioResource(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", songId));
        return fileStorageService.load(song.getFileUrl());
    }

    /** Lấy ảnh bìa — bài hát không có cover thì ném 404. */
    public Resource getCoverResource(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", songId));
        if (song.getImgUrl() == null) {
            throw new ResourceNotFoundException("Bài hát không có ảnh bìa");
        }
        return fileStorageService.load(song.getImgUrl());
    }

    // ============================================================
    // XÓA — DELETE /api/v1/songs/{id}
    // ============================================================

    @Transactional
    public void deleteSong(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", songId));

        // Chỉ người upload mới được xóa bài của mình — vi phạm → 403
        // (GlobalExceptionHandler bắt AccessDeniedException từ service)
        if (!song.getUser().getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("Bạn không có quyền xóa bài hát này");
        }

        // Xóa file VẬT LÝ trước khi xóa DB row — nếu DB xóa trước mà xóa file
        // lỗi thì không còn đường dẫn để dọn lại. Các bảng con (song_genres,
        // favorite_songs, play_history) được DB tự cascade theo schema database.md.
        fileStorageService.delete(song.getFileUrl());
        fileStorageService.delete(song.getImgUrl());
        songRepository.delete(song);
    }
}
