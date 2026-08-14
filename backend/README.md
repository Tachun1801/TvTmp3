# Backend TvTmp3 — Kiến trúc tổng quan

## Kiến trúc phân tầng

```
Request từ frontend
      │
      ▼
┌─────────────┐   CORS + JWT + phân quyền (ai được gọi gì)
│  config/    │
│  security/  │
└─────────────┘
      │
      ▼
┌─────────────┐   Nhận request, gọi service, trả JSON
│ controller/ │
└─────────────┘
      │
      ▼
┌─────────────┐   Business logic — nơi duy nhất có "suy nghĩ"
│  service/   │
└─────────────┘
      │
      ▼
┌─────────────┐   Truy cập database (Spring tự sinh implementation)
│ repository/ │
└─────────────┘
      │
      ▼
┌─────────────┐   Bảng DB ↔ class Java
│   entity/   │
└─────────────┘

Hai tầng xuyên suốt:
- dto/      : khuôn dữ liệu vào/ra (request/response)
- exception/: xử lý lỗi tập trung, trả JSON thống nhất
```

## Trạng thái từng package

| Package | Trạng thái | Ghi chú |
|---|---|---|
| `entity` | ✅ Hoàn thiện | Có README riêng, kèm phần nâng cấp |
| `repository` | ✅ Hoàn thiện | Sẽ thêm query tùy biến khi viết service |
| `exception` | ✅ Hoàn thiện | Bộ lỗi chuẩn + handler toàn cục |
| `security` | ✅ Hoàn thiện | Spring Security + JWT đã chạy được |
| `config` | 🟡 Mới có 1 file | Xem README — có hướng dẫn thêm `JwtProperties`, cấu hình upload file |
| `dto` | ⏳ Trống | README có toàn bộ hướng dẫn + code mẫu |
| `service` | ⏳ Trống | README có toàn bộ hướng dẫn + code mẫu |
| `controller` | ⏳ Trống | README có toàn bộ hướng dẫn + code mẫu |

## Luồng một request hoàn chỉnh (VD: GET /api/v1/me/stats)

```
1. CORS filter                 → origin frontend hợp lệ?
2. JwtAuthenticationFilter      → đọc Bearer token, gắn userId vào SecurityContext
3. SecurityFilterChain          → endpoint này cần đăng nhập? → có userId ✓
4. MeController                 → nhận request
5. StatsService                 → SecurityUtils.getCurrentUserId() → business logic
6. Repository (4 câu count)     → SELECT COUNT(*) ...
7. Entity ↔ MySQL               → dữ liệu thật
8. DTO (StatsResponse)          → JSON trả về frontend
```

Lỗi ở bước 2-3 → `CustomAuthenticationEntryPoint` (401) / `CustomAccessDeniedHandler` (403).
Lỗi ở bước 4 trở đi → `GlobalExceptionHandler` (400/404/409/500).

## Việc còn lại để hoàn thiện backend

1. Tạo database MySQL từ `../database.md` + điền `.env` (DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET)
2. Viết `dto/` (hướng dẫn trong README của package)
3. Viết `service/`
4. Viết `controller/`
5. Upload & stream file audio/cover cho bài hát
6. Kiểm thử toàn bộ API
7. Bật API thật ở frontend (`MOCK=false`)

## Cách chạy

```bash
cd backend
# .env đã có sẵn (bị gitignore) — chạy app từ thư mục này để đọc được .env
./mvnw spring-boot:run
# App chạy tại http://localhost:8080
```
