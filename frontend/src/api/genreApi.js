/**
 * Genre API — Data Access Layer
 *
 * === HƯỚNG DẪN BẬT API THẬT ===
 * 1. Đổi MOCK = false bên dưới
 * 2. Bỏ comment dòng import client và phần real API
 * 3. Xóa toàn bộ phần "Mock"
 * 4. Xóa file @/mock/genres.js
 * 5. KHÔNG cần sửa file nào khác
 */

// ============================================================
// Mock (xóa hết phần này khi bật real API)
// ============================================================
const MOCK = true;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// ============================================================

// ============================================================
// Real API (bỏ comment khi bật real API)
// ============================================================
import client from './client';
// ============================================================

// ============================================================
// GET /api/v1/genres — Danh sách thể loại
// Response: [{ genre_id, name, description, img_url }]
// ============================================================

export async function getGenres() {
  const res = await client.get('/api/v1/genres');
  return res.data;
}
