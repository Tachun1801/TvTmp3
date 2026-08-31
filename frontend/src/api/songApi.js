/**
 * Song API — Data Access Layer (REAL API)
 *
 * === SHAPE MAP ===
 * Backend trả SongDto { songId, uploader, createdAt, genres, playCount... }
 * → map qua toFeSong (normalizers.js) thành shape FE { id, artist, ... }.
 * Chỉ nơi này biết shape backend — service/hook/page không đổi.
 */

import client from './client';
import { toFeSong } from './normalizers';

// ============================================================
// GET /api/v1/songs — Danh sách bài hát
// Query: ?genre=Pop&sort=latest|popular&page=1&size=20
// Response: { data: [...], total, page, size }
// ============================================================

export async function getSongs({ genre, sort, page = 1, size = 20 } = {}) {
  const res = await client.get('/api/v1/songs', {
    params: { genre, sort, page, size },
  });
  return { ...res.data, data: res.data.data.map(toFeSong) };
}

// ============================================================
// GET /api/v1/songs/{id} — Chi tiết bài hát
// Response: { id, title, duration, fileUrl, imgUrl, artist, genres, ... }
// ============================================================

export async function getSongById(id) {
  const res = await client.get(`/api/v1/songs/${id}`);
  return toFeSong(res.data);
}

// ============================================================
// GET /api/v1/songs/{id}/stream — Stream file MP3 (trả binary)
// URL TUYỆT ĐỐI do backend tự ghép sẵn trong song.fileUrl —
// hàm này giữ để dùng khi chỉ có id (chưa dùng ở UI hiện tại).
// ============================================================

export function getStreamUrl(id) {
  return `${client.defaults.baseURL}/api/v1/songs/${id}/stream`;
}

// ============================================================
// GET /api/v1/songs/{id}/cover — Ảnh bìa (trả binary)
// ============================================================

export function getCoverUrl(id) {
  return `${client.defaults.baseURL}/api/v1/songs/${id}/cover`;
}

// ============================================================
// GET /api/v1/songs/search — Tìm kiếm
// Query: ?q=từ khóa
// Response: [...songs]
// ============================================================

export async function searchSongs(q) {
  const res = await client.get('/api/v1/songs/search', { params: { q } });
  return res.data.data.map(toFeSong);
}

// ============================================================
// GET /api/v1/songs/charts — Bảng xếp hạng
// Query: ?type=weekly|monthly|alltime
// Response: [...songs] (có thêm field rank)
// ============================================================

export async function getCharts(type = 'alltime') {
  const res = await client.get('/api/v1/songs/charts', { params: { type } });
  return res.data.map(toFeSong);
}

// ============================================================
// POST /api/v1/songs — Upload bài hát (cần token)
// Body: FormData { file, title, genreIds, duration, cover }
// Response: song object vừa tạo
// ============================================================

export async function uploadSong(formData) {
  const res = await client.post('/api/v1/songs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ============================================================
// DELETE /api/v1/songs/{id} — Xóa bài hát (cần token)
// Response: { success: true }
// ============================================================

export async function deleteSong(id) {
  const res = await client.delete(`/api/v1/songs/${id}`);
  return res.data;
}
