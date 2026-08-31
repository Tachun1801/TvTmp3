/**
 * Session module — user hiện tại cho các api module còn chạy MOCK.
 *
 * === VÌ SAO CẦN ===
 * Mock không phân biệt được user qua token (mock/auth.js dùng 1 token chung
 * cho mọi user) nên AuthContext gọi setSessionUserId(user.id) khi login/
 * logout/auto-login. Các mock cần user (favorites, history, mySongs) đọc từ
 * đây thay vì hardcode MOCK_USER_ID = 1.
 *
 * Khi bật real API toàn bộ: token trong client.js tự xác định user, module
 * này chỉ còn dùng để guard "chưa đăng nhập" ở phía frontend (tránh gọi API
 * chắc chắn 401).
 */

let currentUserId = null;

export function setSessionUserId(userId) {
  currentUserId = userId;
}

export function getSessionUserId() {
  return currentUserId;
}

/** Chưa đăng nhập → ném lỗi 401 (giống backend thật). */
export function requireUser() {
  if (currentUserId == null) {
    const err = new Error('Yêu cầu đăng nhập');
    err.status = 401;
    throw err;
  }
  return currentUserId;
}
