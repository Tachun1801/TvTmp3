/**
 * useSongs — Hook quản lý state fetch dữ liệu bài hát
 *
 * Pattern: { data, loading, error }
 *
 * === CÁCH DÙNG ===
 * const { data: songs, loading, error } = useSongs(() => songService.getDiscover());
 *
 * === HƯỚNG DẪN MỞ RỘNG ===
 * - Thêm refetch: export ra 1 function gọi lại fetchFn
 * - Thêm pagination: nhận tham số page, gọi fetchFn(page)
 * - Thêm cache: dùng useRef hoặc context để tránh gọi lại khi đã có data
 *
 * Khi backend có API thật:
 * - Hook này KHÔNG cần sửa — chỉ cần MOCK=false trong songApi.js
 */

import { useState, useEffect, useCallback } from 'react';

export function useSongs(fetchFn) {
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

  return { data, loading, error };
}
