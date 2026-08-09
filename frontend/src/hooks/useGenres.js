/**
 * useGenres — Hook quản lý state fetch dữ liệu thể loại
 *
 * Pattern: { data, loading, error, refetch }
 *
 * === CÁCH DÙNG ===
 * const { data: genres, loading, error, refetch } = useGenres(() => genreService.getAll());
 *
 * === HƯỚNG DẪN MỞ RỘNG ===
 * - Thêm pagination: nhận tham số page, gọi fetchFn(page)
 * - Thêm cache: dùng useRef hoặc context để tránh gọi lại khi đã có data
 *
 * Khi backend có API thật:
 * - Hook này KHÔNG cần sửa — chỉ cần MOCK=false trong genreApi.js
 */

import { useState, useEffect, useCallback } from 'react';

export function useGenres(fetchFn) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchFn()
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [fetchFn]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
