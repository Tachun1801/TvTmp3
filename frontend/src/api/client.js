/**
 * Axios HTTP client — cấu hình gốc cho toàn bộ app
 *
 * Tất cả API module (songApi, authApi...) đều dùng chung instance này.
 *
 * === CƠ CHẾ ===
 * - baseURL:        tự động gắn vào trước mọi request path
 * - Authorization:  tự động gắn token (nếu có) vào header
 * - responseType:   'json' mặc định, axios tự parse JSON
 *
 * === KHI NÀO DÙNG ===
 * Khi MOCK = false trong các file api, client này sẽ được dùng để gọi backend thật.
 * Hiện tại MOCK = true nên file này chưa được import ở đâu cả.
 */

import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8080', // TODO: đổi thành URL production khi deploy

  // Tự động parse JSON response
  responseType: 'json',

  // Timeout sau 10 giây
  timeout: 10000,
});

// ============================================================
// Request interceptor — chạy TRƯỚC mỗi request gửi đi
// ============================================================
client.interceptors.request.use(
  (config) => {
    // Gắn token từ localStorage vào header Authorization
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================================
// Response interceptor — chạy SAU mỗi response nhận về
// ============================================================
client.interceptors.response.use(
  (response) => response, // thành công: trả nguyên response
  (error) => {
    // 401 Unauthorized → token hết hạn, logout
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // TODO: redirect về /login nếu cần
    }
    return Promise.reject(error);
  },
);

export default client;
