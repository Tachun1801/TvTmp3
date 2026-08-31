/**
 * My Songs API — Danh sách bài hát user đã upload (REAL API)
 *
 * Backend xác định user từ token; SongDto map qua toFeSong.
 */

import client from './client';
import { toFeSong } from './normalizers';

// ============================================================
// GET /api/v1/me/songs — Danh sách bài hát user đã upload (cần token)
// Response: [...songs]
// ============================================================

export async function getMySongs() {
  const res = await client.get('/api/v1/me/songs', { params: { page: 1, size: 100 } });
  return res.data.data.map(toFeSong);
}
