/**
 * My Songs API — Danh sách bài hát user đã upload
 *
 * === HƯỚNG DẪN BẬT API THẬT ===
 * 1. Đổi MOCK = false bên dưới
 * 2. Bỏ comment dòng import client và phần real API
 * 3. Xóa toàn bộ phần "Mock"
 * 4. Có thể xóa file @/mock/songs.js nếu các API khác cũng đã bật thật
 * 5. KHÔNG cần sửa file nào khác
 */

// ============================================================
// Mock (xóa hết phần này khi bật real API)
// ============================================================
import { mockSongs } from '@/mock/songs';
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
// GET /api/v1/me/songs — Danh sách bài hát user đã upload (cần token)
// Response: [...songs]
// ============================================================

export async function getMySongs() {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(200);
    return mockSongs.filter((s) => s.userId === MOCK_USER_ID);
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.get('/api/v1/me/songs');
  // return res.data;
}
