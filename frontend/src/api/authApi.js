/**
 * Auth API — Data Access Layer (REAL API)
 *
 * === SHAPE MAP ===
 * Backend trả { user: { userId, email, fullName, birth, createdAt }, token }
 * nhưng toàn bộ app dùng { id, ... } (AuthContext đọc userData.id).
 * Map ở đây — nơi DUY NHẤT biết shape backend (quy tắc GUIDE.md) — nên
 * AuthContext, ProfilePage, MusicPlayer không phải sửa gì.
 *
 * === CÁCH DÙNG TOKEN ===
 * - login/register trả về { user, token }
 * - Lưu token vào localStorage
 * - client.js tự động gắn token vào header các request sau
 */

import client from './client';

/** UserDto backend → shape FE { id, email, fullName, birth, createdAt }. */
function toFeUser(u) {
  return {
    id: u.userId,
    email: u.email,
    fullName: u.fullName,
    birth: u.birth ?? null,
    createdAt: u.createdAt ?? null,
  };
}

// ============================================================
// POST /api/v1/auth/register — Đăng ký
// Body: { email, password, fullName, birth? }
// Response: { user: { id, email, fullName, birth, createdAt }, token }
// ============================================================

export async function register({ email, password, fullName, birth }) {
  const res = await client.post('/api/v1/auth/register', {
    email, password, fullName, birth,
  });
  return { user: toFeUser(res.data.user), token: res.data.token };
}

// ============================================================
// POST /api/v1/auth/login — Đăng nhập
// Body: { email, password }
// Response: { user: { id, email, fullName, birth, createdAt }, token }
// ============================================================

export async function login(email, password) {
  const res = await client.post('/api/v1/auth/login', { email, password });
  return { user: toFeUser(res.data.user), token: res.data.token };
}

// ============================================================
// GET /api/v1/auth/me — Thông tin user hiện tại (cần token)
// Header: Authorization: Bearer <token>
// Response: { id, email, fullName, birth, createdAt }
// ============================================================

export async function getMe() {
  const res = await client.get('/api/v1/auth/me');
  return toFeUser(res.data);
}

// ============================================================
// PUT /api/v1/auth/me — Cập nhật profile (cần token)
// Body: { fullName?, birth? }
// Response: { id, email, fullName, birth, createdAt }
// ============================================================

export async function updateMe({ fullName, birth }) {
  const res = await client.put('/api/v1/auth/me', { fullName, birth });
  return toFeUser(res.data);
}
