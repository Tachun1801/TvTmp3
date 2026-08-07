/**
 * Auth API — Data Access Layer
 *
 * === HƯỚNG DẪN BẬT API THẬT ===
 * 1. Đổi MOCK = false bên dưới
 * 2. Bỏ comment dòng import client và phần real API trong mỗi hàm
 * 3. Xóa toàn bộ phần "Mock" (import + const MOCK + block mock)
 * 4. Xóa file @/mock/auth.js
 * 5. KHÔNG cần sửa file nào khác (service, hook, component)
 *
 * === CÁCH DÙNG TOKEN ===
 * - login/register trả về { user, token }
 * - Lưu token vào localStorage
 * - client.js tự động gắn token vào header các request sau
 */

// ============================================================
// Mock (xóa hết phần này khi bật real API)
// ============================================================
import { mockLogin, mockRegister, mockGetMe, mockUpdateMe } from '@/mock/auth';
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
// POST /api/v1/auth/register — Đăng ký
// Body: { email, password, fullName, birth? }
// Response: { user: { id, email, fullName, birth, createdAt }, token }
// ============================================================

export async function register({ email, password, fullName, birth }) {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(300);
    return mockRegister({ email, password, fullName, birth });
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.post('/api/v1/auth/register', {
  //   email, password, fullName, birth,
  // });
  // return res.data;
}

// ============================================================
// POST /api/v1/auth/login — Đăng nhập
// Body: { email, password }
// Response: { user: { id, email, fullName, birth, createdAt }, token }
// ============================================================

export async function login(email, password) {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(300);
    return mockLogin(email, password);
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.post('/api/v1/auth/login', { email, password });
  // return res.data;
}

// ============================================================
// GET /api/v1/auth/me — Thông tin user hiện tại (cần token)
// Header: Authorization: Bearer <token>
// Response: { id, email, fullName, birth, createdAt }
// ============================================================

export async function getMe() {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(150);
    return mockGetMe(localStorage.getItem('token'));
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.get('/api/v1/auth/me');
  // return res.data;
}

// ============================================================
// PUT /api/v1/auth/me — Cập nhật profile (cần token)
// Body: { fullName?, birth? }
// Response: { id, email, fullName, birth, createdAt }
// ============================================================

export async function updateMe({ fullName, birth }) {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(200);
    return mockUpdateMe(localStorage.getItem('token'), { fullName, birth });
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.put('/api/v1/auth/me', { fullName, birth });
  // return res.data;
}
