/**
 * Song Service — Business Logic Layer
 *
 * Service KHÔNG biết data đến từ mock hay real API.
 * Gọi songApi và xử lý business logic (transform, filter, cache...).
 *
 * === HƯỚNG DẪN MỞ RỘNG ===
 * Khi backend có thêm endpoint:
 * - Thêm hàm mới ở đây
 * - Thêm API call tương ứng trong @/api/songApi.js
 * - Hook + Component chỉ cần gọi service mới, không cần sửa gì khác
 */

import { getSongs, getSongById, searchSongs, getCharts, uploadSong } from '@/api/songApi';
import { getHistory } from '@/api/historyApi';
import { getMySongs } from '@/api/mySongsApi';

export const songService = {
  /**
   * Lấy danh sách bài hát cho Discover.
   * Gọi GET /api/v1/songs?sort=latest
   */
  async getDiscover() {
    const result = await getSongs({ sort: 'latest' });
    // Trích xuất mảng data từ paginated response { data, total, page, size }
    return result.data;
  },

  /**
   * Lấy danh sách nghe gần đây.
   * Gọi GET /api/v1/history (cần token — mock trả về user 1)
   */
  async getRecentlyPlayed() {
    return getHistory();
  },

  /**
   * Lấy chi tiết 1 bài hát.
   * Gọi GET /api/v1/songs/{id}
   */
  async getSongById(id) {
    return getSongById(id);
  },

  /**
   * Tìm kiếm bài hát.
   * Gọi GET /api/v1/songs/search?q=
   */
  async search(query) {
    return searchSongs(query);
  },

  /**
   * Bảng xếp hạng.
   * Gọi GET /api/v1/songs/charts?type=
   */
  async getCharts(type) {
    return getCharts(type);
  },

  /**
   * Lấy danh sách bài hát user đã upload.
   * Gọi GET /api/v1/me/songs (cần token — mock trả về userId 1)
   */
  async getMyUploads() {
    return getMySongs();
  },

  /**
   * Upload bài hát mới.
   * Gọi POST /api/v1/songs (multipart/form-data)
   * Body: FormData { file, title }
   */
  async upload(formData) {
    return uploadSong(formData);
  },
};
