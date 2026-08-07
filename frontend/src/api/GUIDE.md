# Hướng dẫn kiến trúc API

## Tổng quan

```
Browser → Page/Component  →  Hook  →  Service  →  API  ─┬─ Mock (hiện tại)
                                                         └─ Real (sau này)
```

Mỗi layer chỉ biết layer kế tiếp, không biết data từ đâu đến:

| Layer | File | Vai trò | Biết mock? |
|---|---|---|---|
| **API** | `src/api/*.js` | Gọi HTTP (axios) hoặc trả mock | **Có** — nơi duy nhất |
| **Service** | `src/services/*.js` | Business logic, transform data | Không |
| **Hook** | `src/hooks/*.js` | State management (loading/error/data) | Không |
| **Page/Component** | `src/pages/*.jsx` | Render UI | Không |

---

## Danh sách API endpoints

### Auth (không cần token)

| Method | Endpoint | File | Mock |
|---|---|---|---|
| POST | `/api/v1/auth/register` | `authApi.js` | `mock/auth.js` |
| POST | `/api/v1/auth/login` | `authApi.js` | `mock/auth.js` |

### Auth (cần token)

| Method | Endpoint | File | Mock |
|---|---|---|---|
| GET | `/api/v1/auth/me` | `authApi.js` | `mock/auth.js` |
| PUT | `/api/v1/auth/me` | `authApi.js` | `mock/auth.js` |

### Songs (public)

| Method | Endpoint | File | Mock |
|---|---|---|---|
| GET | `/api/v1/songs` | `songApi.js` | `mock/songs.js` |
| GET | `/api/v1/songs/{id}` | `songApi.js` | `mock/songs.js` |
| GET | `/api/v1/songs/{id}/stream` | `songApi.js` | URL tĩnh |
| GET | `/api/v1/songs/{id}/cover` | `songApi.js` | URL tĩnh |
| GET | `/api/v1/songs/search?q=` | `songApi.js` | `mock/songs.js` |
| GET | `/api/v1/songs/charts?type=` | `songApi.js` | `mock/songs.js` |

### Songs (cần token)

| Method | Endpoint | File | Mock |
|---|---|---|---|
| POST | `/api/v1/songs` | `songApi.js` | Tạo mới |
| DELETE | `/api/v1/songs/{id}` | `songApi.js` | `{ success: true }` |

### Genres (public)

| Method | Endpoint | File | Mock |
|---|---|---|---|
| GET | `/api/v1/genres` | `genreApi.js` | `mock/genres.js` |

### Favorites (cần token)

| Method | Endpoint | File | Mock |
|---|---|---|---|
| GET | `/api/v1/favorites` | `favoriteApi.js` | `mock/favorites.js` |
| POST | `/api/v1/favorites` | `favoriteApi.js` | `mock/favorites.js` |
| DELETE | `/api/v1/favorites/{songId}` | `favoriteApi.js` | `mock/favorites.js` |

### History (cần token)

| Method | Endpoint | File | Mock |
|---|---|---|---|
| GET | `/api/v1/history` | `historyApi.js` | `mock/history.js` |
| POST | `/api/v1/history` | `historyApi.js` | `mock/history.js` |

### My Songs (cần token)

| Method | Endpoint | File | Mock |
|---|---|---|---|
| GET | `/api/v1/me/songs` | `mySongsApi.js` | `mock/songs.js` |

### Stats (cần token)

| Method | Endpoint | File | Mock |
|---|---|---|---|
| GET | `/api/v1/me/stats` | `statsApi.js` | `mock/stats.js` |

Response: `{ songsPlayed, favorites, uploads, daysActive }`

Backend query:

```sql
-- songsPlayed
SELECT COUNT(*) FROM play_history WHERE user_id = ?;

-- favorites
SELECT COUNT(*) FROM favorite_songs WHERE user_id = ?;

-- uploads
SELECT COUNT(*) FROM songs WHERE user_id = ?;

-- daysActive
SELECT COUNT(DISTINCT DATE(played_at)) FROM play_history WHERE user_id = ?;
```

---

## Cách chuyển sang API thật

### Bước 1: Backend Spring Boot phải có đủ các endpoint trên

Ví dụ (Spring Boot controller):

```java
@RestController
@RequestMapping("/api/v1/songs")
public class SongController {

    @GetMapping
    public ResponseEntity<Page<SongDto>> getSongs(
        @RequestParam(required = false) String genre,
        @RequestParam(defaultValue = "latest") String sort,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size
    ) { ... }

    @GetMapping("/{id}")
    public ResponseEntity<SongDto> getSong(@PathVariable Long id) { ... }
}
```

### Bước 2: Mở từng file trong `src/api/`

Mỗi file có 1 dòng:

```js
const MOCK = true; // TODO API: đổi thành false khi backend sẵn sàng
```

Đổi `true` → `false`, bỏ comment phần real API, xóa phần mock.

### Bước 3: Xóa thư mục mock (tùy chọn)

```bash
rm -rf frontend/src/mock/
```

### Bước 4: Kiểm tra

```bash
cd frontend && npm run dev
```

Tất cả page/component vẫn hoạt động bình thường — không cần sửa gì khác.

---

## Cấu trúc thư mục

```
src/
├── api/                    # Data Access Layer
│   ├── GUIDE.md            # File này
│   ├── client.js           # Axios instance (baseURL, interceptor)
│   ├── authApi.js          # Auth endpoints
│   ├── songApi.js          # Song endpoints
│   ├── genreApi.js         # Genre endpoints
│   ├── favoriteApi.js      # Favorite endpoints
│   ├── historyApi.js       # History endpoints
│   ├── mySongsApi.js       # My uploaded songs
│   └── statsApi.js         # User stats (songsPlayed, favorites...)
│
├── services/               # Business Logic Layer
│   └── songService.js      # Gọi api, transform data
│
├── hooks/                  # State Management Layer
│   └── useSongs.js         # { data, loading, error }
│
├── mock/                   # Mock data (xóa khi có backend thật)
│   ├── songs.js
│   ├── auth.js
│   ├── genres.js
│   ├── favorites.js
│   ├── history.js
│   └── stats.js
│
├── contexts/               # React Context
│   └── AuthContext.jsx     # Auth state, gọi authApi
│
├── pages/                  # UI
│   ├── auth/
│   │   ├── LoginPage.jsx   # → useAuth().login()
│   │   └── SignUpPage.jsx  # → useAuth().register()
│   └── private/
│       └── ProfilePage.jsx # → useAuth() + statsApi.getMyStats()
│
├── components/             # UI
└── layouts/                # Layout
```

---

## Ví dụ data flow

### Đăng nhập

```
LoginPage
  handleSubmit
    → useAuth().login(email, password)              // AuthContext
      → authApi.login(email, password)              // API layer
        MOCK=true  → mockLogin() kiểm tra email/password
        MOCK=false → POST /api/v1/auth/login
      ← { user, token }
      → localStorage.setItem('token', token)
      → setUser(user)
    ← { success: true }
  → navigate('/discover')
```

### Đăng ký

```
SignUpPage
  handleSubmit
    → useAuth().register({ email, password, fullName })
      → authApi.register(...)
        MOCK=true  → mockRegister() tạo user mới
        MOCK=false → POST /api/v1/auth/register
      ← { user, token }
    ← { success: true }
  → navigate('/discover')
```

### Load Discover

```
DiscoverPage (sau này code)
  const { data: songs } = useSongs(() => songService.getDiscover())

    → songService.getDiscover()
        gọi songApi.getSongs({ sort: 'latest' })
        trích xuất result.data

        → songApi.getSongs()
            MOCK=true  → filter + sort mockSongs, trả { data, total, page, size }
            MOCK=false → GET /api/v1/songs?sort=latest
```

### Profile & Stats

```
ProfilePage
  ┌─ user info: useAuth().user                        // từ AuthContext
  ├─ stats:     statsApi.getMyStats()                 // gọi API stats
  │               MOCK=true  → return mockStats
  │               MOCK=false → GET /api/v1/me/stats
  ├─ edit:      useAuth().updateProfile({ fullName, birth })
  │               → authApi.updateMe(...)
  │                 MOCK=true  → mockUpdateMe()
  │                 MOCK=false → PUT /api/v1/auth/me
  └─ logout:    useAuth().logout()
```

### Auto-login (khi F5 reload trang)

```
AuthProvider (useEffect khi app load)
  token = localStorage.getItem('token')
  if (token)
    → authApi.getMe()
        MOCK=true  → mockGetMe(token)
        MOCK=false → GET /api/v1/auth/me   (Header: Authorization: Bearer <token>)
    ← user → setUser(user)
  else
    setLoading(false)  // chưa đăng nhập
```
