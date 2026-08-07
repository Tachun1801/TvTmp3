/**
 * Song API — Data Access Layer
 *
 * === HƯỚNG DẪN BẬT API THẬT ===
 * 1. Đổi MOCK = false bên dưới
 * 2. Bỏ comment dòng import client và phần real API trong mỗi hàm
 * 3. Xóa toàn bộ phần "Mock" (import + const MOCK + delay)
 * 4. Xóa file @/mock/songs.js
 * 5. KHÔNG cần sửa file nào khác (service, hook, component)
 */

// ============================================================
// Mock (xóa hết phần này khi bật real API)
// ============================================================
import { mockSongs } from '@/mock/songs';
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
// GET /api/v1/songs — Danh sách bài hát
// Query: ?genre=Pop&sort=latest|popular&page=1&size=20
// Response: { data: [...], total, page, size }
// ============================================================

export async function getSongs({ genre, sort, page = 1, size = 20 } = {}) {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(200 + Math.random() * 300);
    let result = [...mockSongs];
    if (genre) result = result.filter((s) => s.genres.includes(genre));
    if (sort === 'popular') {
      result.sort((a, b) => b.playCount - a.playCount);
    } else {
      result.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    }
    const total = result.length;
    const start = (page - 1) * size;
    return { data: result.slice(start, start + size), total, page, size };
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.get('/api/v1/songs', {
  //   params: { genre, sort, page, size },
  // });
  // return res.data;
}

// ============================================================
// GET /api/v1/songs/{id} — Chi tiết bài hát
// Response: { id, title, duration, fileUrl, imgUrl, artist, genres, ... }
// ============================================================

export async function getSongById(id) {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(100 + Math.random() * 150);
    const song = mockSongs.find((s) => s.id === id);
    if (!song) {
      const err = new Error('Không tìm thấy bài hát');
      err.status = 404;
      throw err;
    }
    return { ...song };
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.get(`/api/v1/songs/${id}`);
  // return res.data;
}

// ============================================================
// GET /api/v1/songs/{id}/stream — Stream file MP3 (trả binary)
// Response: audio/mpeg stream
// ============================================================

export function getStreamUrl(id) {
  // --- Mock ---
  if (MOCK) {
    return `/uploads/song-${id}.mp3`; // fallback tĩnh
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // return `${client.defaults.baseURL}/api/v1/songs/${id}/stream`;
}

// ============================================================
// GET /api/v1/songs/{id}/cover — Ảnh bìa (trả binary)
// Response: image/jpeg stream
// ============================================================

export function getCoverUrl(id) {
  // --- Mock ---
  if (MOCK) {
    const song = mockSongs.find((s) => s.id === id);
    if (song) return song.imgUrl;
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // return `${client.defaults.baseURL}/api/v1/songs/${id}/cover`;
}

// ============================================================
// GET /api/v1/songs/search — Tìm kiếm
// Query: ?q=từ khóa
// Response: [...songs]
// ============================================================

export async function searchSongs(q) {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(200 + Math.random() * 300);
    const query = q.toLowerCase();
    return mockSongs.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query),
    );
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.get('/api/v1/songs/search', { params: { q } });
  // return res.data;
}

// ============================================================
// GET /api/v1/songs/charts — Bảng xếp hạng
// Query: ?type=weekly|monthly|alltime
// Response: [...songs] (có thêm field rank)
// ============================================================

export async function getCharts(type = 'alltime') {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(200 + Math.random() * 300);
    const sorted = [...mockSongs].sort((a, b) => b.playCount - a.playCount);
    return sorted.slice(0, 10).map((s, i) => ({ ...s, rank: i + 1 }));
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.get('/api/v1/songs/charts', { params: { type } });
  // return res.data;
}

// ============================================================
// POST /api/v1/songs — Upload bài hát (cần token)
// Body: FormData { file, title, genreIds }
// Response: song object vừa tạo
// ============================================================

export async function uploadSong(formData) {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(500);
    return {
      id: mockSongs.length + 1,
      title: formData.get('title'),
      duration: 180,
      fileUrl: '/uploads/new-song.mp3',
      imgUrl: `https://picsum.photos/seed/song${mockSongs.length + 1}/300/300`,
      artist: 'Bạn',
      userId: 1,
      genres: ['Pop'],
      playCount: 0,
      uploadedAt: new Date().toISOString(),
    };
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.post('/api/v1/songs', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  // });
  // return res.data;
}

// ============================================================
// DELETE /api/v1/songs/{id} — Xóa bài hát (cần token)
// Response: { success: true }
// ============================================================

export async function deleteSong(id) {
  // --- Mock: xóa block này ---
  if (MOCK) {
    await delay(150);
    return { success: true };
  }
  // --- End mock ---

  // TODO API: bỏ comment bên dưới
  // const res = await client.delete(`/api/v1/songs/${id}`);
  // return res.data;
}
