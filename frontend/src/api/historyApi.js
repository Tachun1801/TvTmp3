/**
 * History API — Data Access Layer
 *
 * === HƯỚNG DẪN BẬT API THẬT ===
 * 1. Đổi MOCK = false bên dưới
 * 2. Bỏ comment dòng import client và phần real API trong mỗi hàm
 * 3. Xóa toàn bộ phần "Mock"
 * 4. Xóa file @/mock/history.js
 * 5. KHÔNG cần sửa file nào khác
 */

// ============================================================
// Mock (xóa hết phần này khi bật real API)
// ============================================================
import { mockGetHistory, mockRecordPlay } from '@/mock/history';
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
// GET /api/v1/history — Lịch sử nghe (cần token)
// Response: [{ id, song: {...}, playedAt }]
// ============================================================

export async function getHistory() {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(200);
    return mockGetHistory(MOCK_USER_ID);
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.get('/api/v1/history');
  // return res.data;
}

// ============================================================
// POST /api/v1/history — Ghi nhận lượt nghe (cần token)
// Body: { songId }
// Response: { success: true }
// ============================================================

export async function recordPlay(songId) {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(100);
    return mockRecordPlay(MOCK_USER_ID, songId);
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.post('/api/v1/history', { songId });
  // return res.data;
}
