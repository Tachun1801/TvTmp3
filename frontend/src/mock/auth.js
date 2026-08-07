/**
 * Mock data — Auth (users, tokens)
 *
 * Shape khớp với database.md (bảng users):
 *   id        → user_id
 *   email     → users.email
 *   fullName  → users.full_name
 *   birth     → users.birth
 *   createdAt → users.created_at
 *
 * Token: JWT giả lập, backend thật dùng Spring Security + JWT.
 */

// Mật khẩu giả lập (plain text trong mock — backend thật sẽ hash)
const PASSWORDS = {
  'admin@tvtmp3.com': 'admin123',
  'user@tvtmp3.com': 'user123',
  'singer@tvtmp3.com': 'singer123',
};

export const mockUsers = [
  {
    id: 1,
    email: 'admin@tvtmp3.com',
    fullName: 'Admin TVT',
    birth: '2000-01-01',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'user@tvtmp3.com',
    fullName: 'Nguyễn Văn A',
    birth: '1998-05-15',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 3,
    email: 'singer@tvtmp3.com',
    fullName: 'Ca Sĩ B',
    birth: '1995-12-20',
    createdAt: '2024-02-01T00:00:00Z',
  },
];

// Token giả lập (backend thật: JWT signed)
const MOCK_TOKEN = 'mock-jwt-token-abc123';

// ============================================================
// Mock auth business logic
// ============================================================

export function mockLogin(email, password) {
  if (PASSWORDS[email] !== password) {
    const err = new Error('Sai email hoặc mật khẩu');
    err.status = 401;
    throw err;
  }
  const user = mockUsers.find((u) => u.email === email);
  return { user: { ...user }, token: MOCK_TOKEN };
}

export function mockRegister({ email, password, fullName, birth }) {
  // Validate email unique
  if (mockUsers.find((u) => u.email === email)) {
    const err = new Error('Email đã được sử dụng');
    err.status = 409;
    throw err;
  }
  const newUser = {
    id: mockUsers.length + 1,
    email,
    fullName,
    birth: birth || null,
    createdAt: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  PASSWORDS[email] = password;
  return { user: { ...newUser }, token: MOCK_TOKEN };
}

export function mockGetMe(token) {
  if (token !== MOCK_TOKEN) {
    const err = new Error('Token không hợp lệ');
    err.status = 401;
    throw err;
  }
  // Luôn trả về user đầu tiên (giả lập)
  return { ...mockUsers[0] };
}

export function mockUpdateMe(token, { fullName, birth }) {
  if (token !== MOCK_TOKEN) {
    const err = new Error('Token không hợp lệ');
    err.status = 401;
    throw err;
  }
  const user = mockUsers[0];
  if (fullName) user.fullName = fullName;
  if (birth) user.birth = birth;
  return { ...user };
}
