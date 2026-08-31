/**
 * Normalizers — map DTO backend → shape FE (nội bộ api layer).
 *
 * Shape FE (toàn bộ page/component đang đọc):
 *   { id, title, duration, fileUrl, imgUrl, artist, userId, genres, playCount, rank, uploadedAt }
 *
 * Backend SongDto trả:
 *   { songId, title, duration, fileUrl, imgUrl, uploader: { userId, fullName }, createdAt, genres, playCount, rank }
 *
 * Quy tắc GUIDE.md: api layer là nơi DUY NHẤT biết shape backend —
 * mọi module @/api/*.js map qua đây, page/component không đổi.
 */

export function toFeSong(dto) {
  return {
    id: dto.songId,
    title: dto.title,
    duration: dto.duration ?? 0,
    fileUrl: dto.fileUrl,
    // Bài hát không có cover → dùng ảnh placeholder để <img> không bao giờ vỡ
    imgUrl: dto.imgUrl ?? `https://picsum.photos/seed/song${dto.songId}/300/300`,
    artist: dto.uploader?.fullName ?? 'Unknown',
    userId: dto.uploader?.userId ?? null,
    genres: dto.genres ?? [],
    playCount: dto.playCount ?? 0,
    rank: dto.rank ?? null,
    uploadedAt: dto.createdAt,
  };
}
