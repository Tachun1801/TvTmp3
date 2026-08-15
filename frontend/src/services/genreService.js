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
   *
   * === MAP TÊN FIELD ===
   * Mock trả snake_case ({ genre_id, img_url }), backend thật trả camelCase
   * ({ genreId, imgUrl }). Các trang (GenresPage, UploadedPage) đang đọc
   * snake_case -> map về snake_case ở ĐÂY (nơi duy nhất), UI không phải sửa.
   */
  async getAll() {
    const genres = await getGenres();
    return genres.map((g) => ({
      genre_id: g.genreId ?? g.genre_id,
      name: g.name,
      description: g.description,
      img_url: g.imgUrl ?? g.img_url,
    }));
  },
};
