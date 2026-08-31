/**
 * Favorite API — Data Access Layer (REAL API)
 *
 * Backend xác định user từ token (client.js). Response shape backend
 * (SongDto) map qua toFeSong — nơi DUY NHẤT biết shape backend.
 */

import client from './client';
import { toFeSong } from './normalizers';
import { getSessionUserId } from './session';

// ============================================================
// GET /api/v1/favorites — Danh sách yêu thích (cần token)
// Response: [...songs]
// ============================================================

export async function getFavorites() {
  const res = await client.get('/api/v1/favorites', { params: { page: 1, size: 100 } });
  return res.data.data.map(toFeSong);
}

// ============================================================
// GET favorite ids — chỉ lấy mảng songId (MusicPlayer check nhanh).
// Chưa đăng nhập → [] (không gọi API chắc chắn 401).
// ============================================================

export async function getFavoriteIds() {
  if (getSessionUserId() == null) return [];
  const res = await client.get('/api/v1/favorites', { params: { page: 1, size: 100 } });
  return res.data.data.map((song) => song.songId);
}

// ============================================================
// POST /api/v1/favorites — Thêm vào yêu thích (cần token)
// Body: { songId }
// Response: { success: true }
// ============================================================

export async function addFavorite(songId) {
  const res = await client.post('/api/v1/favorites', { songId });
  return res.data;
}

// ============================================================
// DELETE /api/v1/favorites/{songId} — Xóa khỏi yêu thích (cần token)
// Response: { success: true }
// ============================================================

export async function removeFavorite(songId) {
  const res = await client.delete(`/api/v1/favorites/${songId}`);
  return res.data;
}
