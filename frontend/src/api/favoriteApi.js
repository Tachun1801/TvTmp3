/**
 * Favorite API — Data Access Layer
 *
 * === HƯỚNG DẪN BẬT API THẬT ===
 * 1. Đổi MOCK = false bên dưới
 * 2. Bỏ comment dòng import client và phần real API trong mỗi hàm
 * 3. Xóa toàn bộ phần "Mock"
 * 4. Xóa file @/mock/favorites.js
 * 5. KHÔNG cần sửa file nào khác
 */

// ============================================================
// Mock (xóa hết phần này khi bật real API)
// ============================================================
import { mockGetFavorites, mockAddFavorite, mockRemoveFavorite } from '@/mock/favorites';
const MOCK = true;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock: luôn dùng userId = 1 (khi có backend thật, token sẽ xác định user)
const MOCK_USER_ID = 1;
// ============================================================

// ============================================================
// Real API (bỏ comment khi bật real API)
// ============================================================
// import client from './client';
// ============================================================

// ============================================================
// GET /api/v1/favorites — Danh sách yêu thích (cần token)
// Response: [...songs]
// ============================================================

export async function getFavorites() {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(200);
    return mockGetFavorites(MOCK_USER_ID);
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.get('/api/v1/favorites');
  // return res.data;
}

// ============================================================
// POST /api/v1/favorites — Thêm vào yêu thích (cần token)
// Body: { songId }
// Response: { success: true }
// ============================================================

export async function addFavorite(songId) {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(150);
    return mockAddFavorite(MOCK_USER_ID, songId);
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.post('/api/v1/favorites', { songId });
  // return res.data;
}

// ============================================================
// DELETE /api/v1/favorites/{songId} — Xóa khỏi yêu thích (cần token)
// Response: { success: true }
// ============================================================

export async function removeFavorite(songId) {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(150);
    return mockRemoveFavorite(MOCK_USER_ID, songId);
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.delete(`/api/v1/favorites/${songId}`);
  // return res.data;
}
