/**
 * Stats API — Data Access Layer
 *
 * Thống kê cho Profile Page. Backend query JOIN/COUNT trả về con số,
 * frontend chỉ việc hiển thị.
 *
 * === HƯỚNG DẪN BẬT API THẬT ===
 * 1. Đổi MOCK = false bên dưới
 * 2. Bỏ comment dòng import client và phần real API
 * 3. Xóa toàn bộ phần "Mock"
 * 4. Xóa file @/mock/stats.js
 * 5. KHÔNG cần sửa file nào khác
 */

// ============================================================
// Mock (xóa hết phần này khi bật real API)
// ============================================================
import { mockStats } from '@/mock/stats';
const MOCK = true;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// ============================================================

// ============================================================
// Real API (bỏ comment khi bật real API)
// ============================================================
// import client from './client';
// ============================================================

// ============================================================
// GET /api/v1/me/stats — Thống kê user (cần token)
// Response: { songsPlayed, favorites, uploads, daysActive }
//
// Backend query:
//   SELECT COUNT(*) FROM play_history WHERE user_id = ?       → songsPlayed
//   SELECT COUNT(*) FROM favorite_songs WHERE user_id = ?     → favorites
//   SELECT COUNT(*) FROM songs WHERE user_id = ?              → uploads
//   SELECT COUNT(DISTINCT DATE(played_at))
//     FROM play_history WHERE user_id = ?                     → daysActive
// ============================================================

export async function getMyStats() {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(150);
    return { ...mockStats };
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.get('/api/v1/me/stats');
  // return res.data;
}
