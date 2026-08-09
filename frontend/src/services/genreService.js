/**
 * Genre Service — Business Logic Layer
 *
 * Service KHÔNG biết data đến từ mock hay real API.
 * Gọi genreApi và xử lý business logic (transform, filter, cache...).
 *
 * === HƯỚNG DẪN MỞ RỘNG ===
 * Khi backend có thêm endpoint:
 * - Thêm hàm mới ở đây
 * - Thêm API call tương ứng trong @/api/genreApi.js
 * - Hook + Component chỉ cần gọi service mới, không cần sửa gì khác
 */

import { getGenres } from '@/api/genreApi';

export const genreService = {
  /**
   * Lấy danh sách tất cả thể loại.
   * Gọi GET /api/v1/genres
   * Response: [{ genre_id, name, description, img_url }]
   */
  async getAll() {
    return getGenres();
  },
};
