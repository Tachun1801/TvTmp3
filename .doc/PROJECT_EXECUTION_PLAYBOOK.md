# Project Execution Playbook — TvTmp3

> **Dự án:** TvTmp3 — Web app nghe nhạc MP3
> **Team:** 3 người, fullstack
> **Stack:** React 19 + Vite + Tailwind | Spring Boot 4.1 + JPA | MySQL 8
> **Vai trò của bạn:** Manager + Developer (điều phối + code)
> **Triết lý:** Đơn giản, rõ ràng, ít overhead. Không Scrum theater. Không over-engineer.

---

## MỤC LỤC

1. [Giai đoạn khởi động dự án](#1-giai-đoạn-khởi-động-dự-án)
2. [Phân tích requirement](#2-phân-tích-requirement)
3. [Thiết kế hệ thống](#3-thiết-kế-hệ-thống)
4. [Thiết kế database](#4-thiết-kế-database)
5. [Thiết kế API](#5-thiết-kế-api)
6. [Thiết kế source code](#6-thiết-kế-source-code)
7. [Chia team 3 người](#7-chia-team-3-người)
8. [Chia project thành Epic → Feature → Task → Subtask](#8-chia-project-thành-epic--feature--task--subtask)
9. [Cách giao task cho team](#9-cách-giao-task-cho-team)
10. [Git workflow](#10-git-workflow)
11. [Pull Request và Code Review](#11-pull-request-và-code-review)
12. [Quản lý dependency giữa các task](#12-quản-lý-dependency-giữa-các-task)
13. [Cách làm khi Backend chưa xong](#13-cách-làm-khi-backend-chưa-xong)
14. [Planning và Sprint](#14-planning-và-sprint)
15. [Estimation](#15-estimation)
16. [Project Management Board](#16-project-management-board)
17. [Testing](#17-testing)
18. [Security](#18-security)
19. [Deployment](#19-deployment)
20. [Documentation](#20-documentation)
21. [Project management hằng ngày](#21-project-management-hằng-ngày)
22. [Risk management](#22-risk-management)
23. [Quy trình hoàn chỉnh](#23-quy-trình-hoàn-chỉnh)
24. [Project Execution Playbook](#24-project-execution-playbook)

---

## 1. GIAI ĐOẠN KHỞI ĐỘNG DỰ ÁN

### 1.1 Case Study: TvTmp3

Dưới đây là cách tôi điền các mục cho chính app nghe nhạc của bạn:

| Mục | Nội dung |
|-----|----------|
| **Problem** | Người dùng muốn nghe nhạc MP3 trực tuyến, khám phá bài hát mới, tạo playlist cá nhân — tất cả trên trình duyệt, không cần cài app. |
| **Target User** | Người yêu nhạc, độ tuổi 16-30, dùng web trên cả desktop và mobile. |
| **Business Goal** | Không có (đây là project học tập). Nhưng nếu có thật: tăng thời gian nghe, thu hút người upload nhạc. |
| **MVP Scope** | Nghe nhạc, xem bảng xếp hạng, khám phá theo thể loại, nghe gần đây, yêu thích, upload nhạc, đăng nhập/đăng ký. |
| **Out of Scope** | App mobile native, thanh toán, comment/reaction, chia sẻ mạng xã hội, AI recommendation, chat, podcast. |
| **Functional Reqs** | Xem [Section 2](#2-phân-tích-requirement) |
| **Non-functional Reqs** | Page load < 3s, stream nhạc không giật, hỗ trợ mobile responsive, concurrent 30-50 users |
| **Constraint** | Deadline 8-10 tuần, 3 người, server sinh viên (có thể dùng free tier cloud) |
| **Tech Stack** | Đã chốt: React 19 + Vite + Tailwind, Spring Boot 4.1, MySQL 8, file MP3 lưu local |
| **Timeline** | 8 tuần: Design (1) → Dev (5) → Test (1) → Deploy + Docs (1) |
| **Definition of Done** | Code merged, AC passed, tested trên môi trường thật, tài liệu API cập nhật |

### 1.2 Thứ tự quyết định — áp dụng cho TvTmp3

```
PHẢI quyết định TRƯỚC KHI CODE (tuần này):
├── MVP Scope: những page nào có trong lần deploy đầu tiên?
│   → Tôi đề xuất: Discover + Charts + Genres + MusicPlayer + Login/Register
│   → Favorites, Uploaded, Profile, Playlist có thể làm Sprint sau
├── Cách lưu file nhạc: local folder backend/uploads/
├── Auth model: Nghe tự do, login mới được favorite/upload
└── API contract: ít nhất cho Auth và Song (2 domain đầu tiên)

NÊN quyết định trước:
├── Database schema (bảng users, songs, favorites, playlists)
├── File nhạc lưu thế nào? (tên file = UUID, metadata trong DB)
├── Git workflow + branch naming
└── Cấu trúc thư mục frontend (đã có khung sẵn)

CÓ THỂ quyết định SAU:
├── Admin dashboard (chưa cần)
├── Social features (comment, like, share)
├── Recommendation engine
└── CI/CD pipeline phức tạp
```

### 1.3 Những sai lầm phổ biến với app nghe nhạc

| Sai lầm | Tại sao sai? |
|---------|-------------|
| **"Để em làm cái AI recommendation"** | Bạn chưa có đủ user + data. Làm sau. |
| **"Mình nên dùng MongoDB cho linh hoạt"** | Bạn có quan hệ rõ ràng: User → Playlist → Song. SQL là lựa chọn đúng. |
| **"Tạo cái music visualizer như SoundCloud"** | Mất 2 tuần cho hiệu ứng đẹp. Làm sau MVP. |
| **"Upload nhạc phải check bản quyền"** | Không cần cho project sinh viên. Có thể thêm disclaimer. |
| **"Dùng WebSocket để sync real-time playlist"** | Overkill. REST API + polling đơn giản hơn cho team mới. |
| **"Stream nhạc chuẩn HLS/DASH"** | Quá phức tạp. File MP3 tĩnh qua HTTP Range request là đủ. |

---

## 2. PHÂN TÍCH REQUIREMENT

### 2.1 Từ Idea → Task cho TvTmp3

```
IDEA: "Tôi muốn app nghe nhạc MP3 online"
  ↓
FEATURE: "Người dùng có thể nghe nhạc và tạo playlist cá nhân"
  ↓
USER STORY: "Là một người yêu nhạc, tôi muốn tạo playlist riêng để
             tập hợp các bài hát tôi thích và nghe sau."
  ↓
USE CASE: Tạo playlist
  - Normal: User bấm "New Playlist" → Nhập tên → Playlist được tạo → Add bài hát
  - Alternative: User bấm "Save to Playlist" từ bài hát đang phát → Chọn playlist có sẵn
  - Exception: Tên playlist trống → Báo lỗi validation
  ↓
ACCEPTANCE CRITERIA:
  - [ ] User có thể tạo playlist mới với tên (required)
  - [ ] Tên playlist tối thiểu 1 ký tự, tối đa 100 ký tự
  - [ ] User có thể thêm bài hát vào playlist từ bất kỳ đâu (trang Discover, Charts, Genres)
  - [ ] Một bài hát có thể nằm trong nhiều playlist
  - [ ] User có thể xóa bài hát khỏi playlist
  - [ ] User có thể xóa playlist
  - [ ] Playlist rỗng hiển thị "Chưa có bài hát nào"
  ↓
TASK: "Tạo API CRUD cho Playlist"
  ↓
SUBTASK:
  - Tạo entity Playlist và PlaylistSong
  - Tạo repository
  - Tạo service với logic CRUD
  - Tạo controller: POST/GET/PUT/DELETE /api/v1/playlists
  - Validate input
  - Viết unit test
```

### 2.2 User Story cho từng page — TvTmp3

```
EPIC: Music Discovery
├── "Là người nghe nhạc, tôi muốn xem danh sách nhạc mới phát hành để khám phá bài mới."
├── "Là người nghe nhạc, tôi muốn xem bảng xếp hạng để biết bài nào đang phổ biến."
├── "Là người nghe nhạc, tôi muốn duyệt theo thể loại để nghe nhạc đúng sở thích."

EPIC: Music Playback
├── "Là người nghe nhạc, tôi muốn phát/pause/tua bài hát để kiểm soát việc nghe."
├── "Là người nghe nhạc, tôi muốn xem bài đang phát và danh sách chờ."
├── "Là người nghe nhạc, tôi muốn nghe nhạc ngay cả khi không đăng nhập."

EPIC: Personal Library
├── "Là người dùng đã đăng nhập, tôi muốn lưu bài hát yêu thích để nghe lại sau."
├── "Là người dùng đã đăng nhập, tôi muốn xem lịch sử nghe gần đây."
├── "Là người dùng đã đăng nhập, tôi muốn tạo playlist riêng."

EPIC: Content Contribution
├── "Là người dùng đã đăng nhập, tôi muốn upload bài hát của mình lên nền tảng."
├── "Là người dùng, tôi muốn xem các bài hát tôi đã upload."

EPIC: User Management
├── "Là người dùng mới, tôi muốn đăng ký tài khoản."
├── "Là người dùng đã có tài khoản, tôi muốn đăng nhập."
└── "Là người dùng, tôi muốn xem và sửa thông tin cá nhân."
```

### 2.3 Cách viết Acceptance Criteria tốt — Ví dụ thực tế

**Tính năng: Music Player (Bottom Bar)**

```markdown
ACCEPTANCE CRITERIA:

### Core Playback
- [ ] Bấm nút Play → bài hát bắt đầu phát, icon đổi sang Pause
- [ ] Bấm nút Pause → bài hát tạm dừng, icon đổi sang Play
- [ ] Bấm Next → phát bài tiếp theo trong danh sách chờ
- [ ] Bấm Previous → nếu đã phát > 3 giây thì restart bài hiện tại, nếu < 3 giây thì lùi bài trước

### Progress & Seek
- [ ] Thanh progress hiển thị thời gian đã phát / tổng thời gian
- [ ] User có thể click vào thanh progress để tua đến vị trí bất kỳ
- [ ] Thời gian cập nhật mỗi giây

### Volume
- [ ] Volume slider hoạt động từ 0-100%
- [ ] Mute/unmute khi bấm icon volume
- [ ] Volume được lưu giữa các lần reload (localStorage)

### Queue
- [ ] Khi bấm Play một bài trong danh sách → danh sách đó trở thành queue
- [ ] Queue hiển thị trong Right Panel
- [ ] Khi phát hết queue, tự động dừng (hoặc loop nếu user bật)

### Edge Cases
- [ ] File nhạc không tồn tại (404) → hiển thị lỗi "Không thể phát bài hát này"
- [ ] Network lỗi khi đang stream → hiển thị lỗi, giữ nguyên trạng thái player
- [ ] Chưa có bài nào trong queue → nút Play/Next/Previous bị disable
```

---

## 3. THIẾT KẾ HỆ THỐNG

### 3.1 Architecture — TvTmp3

```
┌────────────────────────────────────────────────────┐
│                    BROWSER                         │
│  ┌──────────────────────────────────────────────┐ │
│  │              React SPA (Vite)                │ │
│  │                                              │ │
│  │  ┌──────────┐  ┌────────┐  ┌─────────────┐  │ │
│  │  │ Sidebar  │  │  Main  │  │ Right Panel │  │ │
│  │  │ Nav      │  │ Content│  │ Queue       │  │ │
│  │  └──────────┘  └────────┘  └─────────────┘  │ │
│  │                                              │ │
│  │  ┌──────────────────────────────────────┐    │ │
│  │  │       Music Player (Bottom Bar)      │    │ │
│  │  │  <audio> element + custom controls   │    │ │
│  │  └──────────────────────────────────────┘    │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────┬─────────────────────────────┘
                       │  HTTP REST (JSON)
                       │  GET /api/v1/songs/{id}/stream  ← trả về file MP3
                       ▼
┌────────────────────────────────────────────────────┐
│              Spring Boot (REST API)                │
│                                                    │
│  Controller → Service → Repository → Entity        │
│                                                    │
│  ┌──────────┐  ┌───────────┐  ┌────────────────┐  │
│  │ Auth     │  │ Song      │  │ File Storage   │  │
│  │ JWT      │  │ CRUD      │  │ /uploads/*.mp3 │  │
│  └──────────┘  └───────────┘  └────────────────┘  │
└──────────────────────┬─────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
     ┌────────────┐      ┌──────────────┐
     │   MySQL 8  │      │  File System │
     │  metadata  │      │  *.mp3 files │
     └────────────┘      └──────────────┘
```

### 3.2 Các câu hỏi quan trọng

#### Khi nào thiết kế database?

**Ngay sau khi requirement rõ ràng, trước khi code backend.**

Với TvTmp3, các entity chính:
- User
- Song (metadata: title, artist, duration, genre, filePath, coverUrl)
- Genre / Category
- Playlist + PlaylistSong (quan hệ nhiều-nhiều)
- Favorite (User-Song quan hệ nhiều-nhiều)
- PlayHistory (bài đã nghe gần đây)

#### Khi nào thiết kế API?

**Ngay sau DB design.** Thứ tự: Requirement → Entity → ERD → API contract → Code.

Với TvTmp3, các nhóm API:
- Auth: register, login, me
- Songs: list, detail, stream (file), search, filter by genre, by chart
- Playlists: CRUD + add/remove song
- Favorites: add/remove/list
- Upload: upload file + metadata
- History: get recent, record play

#### Frontend và Backend thống nhất bằng cách nào?

**API Contract — viết thành file markdown.** Khóa contract trước mỗi Sprint.

Ví dụ cho TvTmp3:

```markdown
## GET /api/v1/songs
### Query params: ?genre={id}&sort=latest|popular&page=0&size=20
### Response 200:
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Ethereal Beats",
        "artist": "Aura & Nova",
        "duration": 225,
        "coverUrl": "/api/v1/songs/1/cover",
        "streamUrl": "/api/v1/songs/1/stream",
        "genre": { "id": 1, "name": "Electronic" },
        "playCount": 15420
      }
    ],
    "totalElements": 45,
    "totalPages": 3,
    "page": 0
  }
}
```

#### Ai thiết kế database?

Cả team cùng họp 1 buổi để brainstorm entity + relationship. Sau đó **1 người** (thường là backend mạnh nhất) chịu trách nhiệm viết SQL schema. Những người khác review.

Với team bạn (3 fullstack, bạn là manager + coder): **Bạn nên chủ trì buổi thiết kế DB**, nhưng giao cho người code backend chính viết schema.

#### Ai quyết định architecture?

**Bạn (PM + Tech Lead).** Đây là quyết định kỹ thuật quan trọng nhất — không nên ủy quyền. Với team 3 người fullstack, architecture phải đủ đơn giản để cả 3 đều hiểu.

---

## 4. THIẾT KẾ DATABASE

### 4.1 Entity → ERD cho TvTmp3

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │       │  PlayHistory  │       │   Song   │
├──────────┤       ├──────────────┤       ├──────────┤
│ id (PK)  │──┐    │ id (PK)      │    ┌──│ id (PK)  │
│ email    │  │    │ user_id (FK) │────┘  │ title    │
│ password │  │    │ song_id (FK) │───────│ artist   │
│ name     │  │    │ played_at    │       │ duration │
│ avatar   │  │    └──────────────┘       │ filePath │
│ role     │  │                           │ coverUrl │
│ created  │  │    ┌──────────────┐       │ genre_id │──┐
└──────────┘  │    │  Favorite    │       │ playCount│  │
              │    ├──────────────┤       │ created  │  │
              ├────│ user_id (FK) │─┐     └──────────┘  │
              │    │ song_id (FK) │─┼──┐                 │
              │    │ created_at   │ │  │    ┌─────────┐  │
              │    └──────────────┘ │  │    │  Genre  │  │
              │                     │  │    ├─────────┤  │
              │    ┌──────────────┐ │  │    │ id (PK) │◄─┘
              │    │  Playlist    │ │  │    │ name    │
              │    ├──────────────┤ │  │    │ color   │
              └────│ user_id (FK) │ │  │    └─────────┘
                   │ name         │ │  │
                   │ description  │ │  │
                   │ is_public    │ │  │
                   │ created_at   │ │  │
                   └──────┬───────┘ │  │
                          │         │  │
                   ┌──────┴───────┐ │  │
                   │ PlaylistSong │ │  │
                   ├──────────────┤ │  │
                   │ playlist_id  │ │  │
                   │ song_id ─────┼─┘  │
                   │ added_at     │    │
                   │ order_index  │    │
                   └──────────────┘    │
                                       │
                   ┌──────────────┐    │
                   │SongGenre (nếu │    │
                   │nhiều-nhiều)  │    │
                   ├──────────────┤    │
                   │ song_id ─────┼────┘
                   │ genre_id ────┼──── (cùng 1 bảng Genre)
                   └──────────────┘
```

**Lưu ý:** Tôi thiết kế Song-Genre là N-N (một bài có thể thuộc nhiều thể loại). Nếu team bạn thấy phức tạp, có thể đơn giản hóa thành 1-1 (mỗi bài 1 genre). Quyết định này nên được thảo luận trong buổi review DB.

### 4.2 SQL Schema

```sql
-- users: người dùng
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- genres: thể loại nhạc
CREATE TABLE genres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(30),  -- tailwind gradient class hoặc mã màu
    display_order INT DEFAULT 0
);

-- songs: bài hát (chỉ lưu metadata, file .mp3 lưu trên ổ đĩa)
CREATE TABLE songs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    duration INT NOT NULL COMMENT 'thời lượng tính bằng giây',
    file_path VARCHAR(500) NOT NULL COMMENT 'đường dẫn file mp3, VD: uploads/uuid.mp3',
    cover_url VARCHAR(500),
    play_count BIGINT DEFAULT 0,
    uploader_id BIGINT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploader_id) REFERENCES users(id),
    INDEX idx_songs_genre (genre_id),
    INDEX idx_songs_play_count (play_count DESC),
    INDEX idx_songs_created (created_at DESC)
);

-- songs_genres: quan hệ nhiều-nhiều giữa bài hát và thể loại
CREATE TABLE song_genres (
    song_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,
    PRIMARY KEY (song_id, genre_id),
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

-- favorites: bài hát yêu thích
CREATE TABLE favorites (
    user_id BIGINT NOT NULL,
    song_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, song_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- playlists
CREATE TABLE playlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- playlist_songs: bài hát trong playlist (có thứ tự)
CREATE TABLE playlist_songs (
    playlist_id BIGINT NOT NULL,
    song_id BIGINT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, song_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- play_history: lịch sử nghe
CREATE TABLE play_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    song_id BIGINT NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    INDEX idx_history_user_time (user_id, played_at DESC)
);
```

### 4.3 Checklist review database

```markdown
## DB Review Checklist — TvTmp3

### Cấu trúc
- [ ] Tất cả entity trong requirement đã có bảng chưa?
- [ ] Quan hệ nhiều-nhiều có bảng trung gian chưa? (song_genres, playlist_songs)
- [ ] Có bảng nào thừa không? (chưa dùng đến trong MVP)

### Ràng buộc
- [ ] Mỗi bảng có PRIMARY KEY chưa?
- [ ] FOREIGN KEY đã đúng chưa? CASCADE/SET NULL đã hợp lý?
- [ ] UNIQUE constraint cho các trường không được trùng (email, user_id+song_id)
- [ ] NOT NULL cho các trường bắt buộc

### Hiệu năng
- [ ] INDEX cho cột thường query: play_count, created_at, user_id, genre_id
- [ ] INDEX cho cột ORDER BY / GROUP BY

### Dữ liệu
- [ ] Kiểu dữ liệu phù hợp? (duration INT giây thay vì VARCHAR, TEXT cho mô tả dài)
- [ ] Có cột audit không? (created_at, updated_at)
- [ ] ENUM có giá trị hợp lý không?

### File storage
- [ ] file_path có đủ để backend đọc file không? (không lưu binary vào DB)
- [ ] Tên file có dùng UUID để tránh trùng không?
```

---

## 5. THIẾT KẾ API

### 5.1 API endpoints cho TvTmp3

```
# ─── Auth (không cần token) ───
POST   /api/v1/auth/register        # Đăng ký
POST   /api/v1/auth/login           # Đăng nhập

# ─── Auth (cần token) ───
GET    /api/v1/auth/me              # Thông tin user hiện tại
PUT    /api/v1/auth/me              # Cập nhật profile

# ─── Songs (public — không cần token) ───
GET    /api/v1/songs                # Danh sách bài hát (?genre=&sort=latest|popular&page=&size=)
GET    /api/v1/songs/{id}           # Chi tiết bài hát
GET    /api/v1/songs/{id}/stream    # Stream file MP3 (trả về binary)
GET    /api/v1/songs/{id}/cover     # Ảnh bìa (trả về binary)
GET    /api/v1/songs/search         # Tìm kiếm (?q=)
GET    /api/v1/songs/charts         # Bảng xếp hạng (?type=weekly|monthly|alltime)

# ─── Songs (cần token) ───
POST   /api/v1/songs/upload         # Upload bài hát mới (multipart/form-data)
DELETE /api/v1/songs/{id}           # Xóa bài hát (chỉ chủ sở hữu)

# ─── Genres (public) ───
GET    /api/v1/genres               # Danh sách thể loại

# ─── Favorites (cần token) ───
GET    /api/v1/favorites            # Danh sách yêu thích của user
POST   /api/v1/favorites            # Thêm bài hát vào yêu thích { songId }
DELETE /api/v1/favorites/{songId}   # Xóa khỏi yêu thích

# ─── Playlists (cần token) ───
GET    /api/v1/playlists            # Danh sách playlist của user
POST   /api/v1/playlists            # Tạo playlist mới
GET    /api/v1/playlists/{id}       # Chi tiết playlist (kèm danh sách bài hát)
PUT    /api/v1/playlists/{id}       # Sửa tên/mô tả
DELETE /api/v1/playlists/{id}       # Xóa playlist
POST   /api/v1/playlists/{id}/songs # Thêm bài hát vào playlist { songId }
DELETE /api/v1/playlists/{id}/songs/{songId}  # Xóa bài hát khỏi playlist

# ─── History (cần token) ───
GET    /api/v1/history              # Lịch sử nghe gần đây
POST   /api/v1/history              # Ghi nhận lượt nghe { songId }

# ─── Uploaded songs (cần token) ───
GET    /api/v1/songs/uploaded       # Danh sách bài hát user đã upload
```

### 5.2 API specification chi tiết — Ví dụ: Stream nhạc

```yaml
# GET /api/v1/songs/{id}/stream
# Trả về file MP3 để thẻ <audio> phát trực tiếp.
# Hỗ trợ Range request để user có thể tua bài hát.

Request:
  GET /api/v1/songs/42/stream
  Headers:
    Range: bytes=0-            # (tùy chọn, để seek)

Response 200 - OK:
  Headers:
    Content-Type: audio/mpeg
    Content-Length: 5123456
    Accept-Ranges: bytes
    Content-Range: bytes 0-5123455/5123456
  Body: <binary MP3 data>

Response 206 - Partial Content (khi có Range header):
  Headers:
    Content-Type: audio/mpeg
    Content-Range: bytes 1000000-2000000/5123456
  Body: <partial MP3 data>

Response 404:
  {
    "success": false,
    "error": {
      "code": "SONG_NOT_FOUND",
      "message": "Không tìm thấy bài hát"
    }
  }
```

### 5.3 API specification chi tiết — Ví dụ: Upload nhạc

```yaml
# POST /api/v1/songs/upload
# Yêu cầu đăng nhập. Upload file MP3 + metadata.

Request:
  POST /api/v1/songs/upload
  Headers:
    Authorization: Bearer <jwt_token>
    Content-Type: multipart/form-data
  Body (form-data):
    file: <file .mp3>                    # required, max 20MB
    title: "My Original Track"           # required
    artist: "Artist Name"                # required
    genreIds: [1, 3]                     # required, ít nhất 1
    cover: <file .jpg/.png>              # optional

Response 201 - Created:
  {
    "success": true,
    "data": {
      "id": 43,
      "title": "My Original Track",
      "artist": "Artist Name",
      "duration": 195,
      "coverUrl": "/api/v1/songs/43/cover",
      "streamUrl": "/api/v1/songs/43/stream",
      "genres": [
        { "id": 1, "name": "Electronic" },
        { "id": 3, "name": "Ambient" }
      ]
    }
  }

Response 400:
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Dữ liệu không hợp lệ",
      "details": [
        { "field": "file", "message": "File không được để trống" },
        { "field": "file", "message": "Chỉ chấp nhận file MP3" },
        { "field": "file", "message": "Dung lượng tối đa 20MB" }
      ]
    }
  }
```

### 5.4 Quy tắc response format thống nhất

```json
// THÀNH CÔNG
{
  "success": true,
  "data": { ... }  // hoặc [...] cho list
}

// CÓ PHÂN TRANG
{
  "success": true,
  "data": {
    "content": [...],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}

// LỖI
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",      // machine-readable
    "message": "Mô tả tiếng Việt"  // human-readable
  }
}
```

**Quy tắc vàng:** MỌI response từ backend phải tuân theo format này. Frontend có thể dựa vào `success: true/false` để phân biệt thành công/thất bại mà không cần parse lỗi từ HTTP status code.

---

## 6. THIẾT KẾ SOURCE CODE

### 6.1 Frontend Structure

```
frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js          # (nếu dùng Tailwind v4 thì có thể cấu hình trong CSS)
├── package.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.jsx                # Entry point: BrowserRouter + App
    ├── App.jsx                 # Router definition + AuthProvider
    ├── index.css               # Tailwind directives + global styles
    │
    ├── api/                    # HTTP calls — thin layer, chỉ gọi axios
    │   ├── client.js           # Axios instance: baseURL, headers, interceptor
    │   ├── auth.api.js         # login(), register(), getMe()
    │   ├── song.api.js         # getSongs(), getSongById(), uploadSong()
    │   ├── favorite.api.js     # getFavorites(), addFavorite(), removeFavorite()
    │   ├── playlist.api.js     # CRUD playlist + add/remove song
    │   ├── genre.api.js        # getGenres()
    │   └── history.api.js      # getHistory(), recordPlay()
    │
    ├── components/             # Reusable UI components
    │   ├── ui/                 # Generic components
    │   │   ├── Button.jsx
    │   │   ├── Input.jsx
    │   │   ├── Modal.jsx
    │   │   └── Spinner.jsx
    │   ├── layout/
    │   │   ├── AppLayout.jsx   # Sidebar + Main + RightPanel + Player
    │   │   ├── Sidebar.jsx     # Navigation: Discover, Charts, Genres, ...
    │   │   ├── RightPanel.jsx  # Queue hiện tại
    │   │   └── MusicPlayer.jsx # Bottom bar: <audio> controls
    │   └── music/              # Domain-specific
    │       ├── SongCard.jsx    # Card hiển thị 1 bài hát (ảnh, tên, artist)
    │       ├── SongList.jsx    # Danh sách bài hát (dạng bảng)
    │       ├── SongRow.jsx     # 1 dòng trong danh sách
    │       ├── GenreCard.jsx   # Card thể loại (màu gradient)
    │       └── PlaylistCard.jsx
    │
    ├── pages/                  # 1 file = 1 route
    │   ├── DiscoverPage.jsx    # Trang chủ: New Releases, Top Charts preview
    │   ├── ChartsPage.jsx      # Bảng xếp hạng đầy đủ
    │   ├── GenresPage.jsx      # Danh sách thể loại
    │   ├── GenreDetailPage.jsx # Bài hát trong 1 thể loại
    │   ├── FavoritesPage.jsx   # Bài hát yêu thích (cần login)
    │   ├── RecentlyPlayedPage.jsx
    │   ├── UploadedPage.jsx    # Bài hát đã upload (cần login)
    │   ├── PlaylistDetailPage.jsx
    │   ├── LoginPage.jsx
    │   ├── SignUpPage.jsx
    │   ├── ProfilePage.jsx
    │   └── NotFoundPage.jsx
    │
    ├── hooks/                  # Custom hooks — logic + state
    │   ├── useAuth.js          # Đăng nhập/đăng ký/logout, currentUser
    │   ├── useSongs.js         # Lấy danh sách bài hát, filter, search
    │   ├── usePlayer.js        # PHÁT NHẠC: currentSong, queue, play/pause/next/prev
    │   ├── useFavorites.js     # Yêu thích
    │   ├── usePlaylists.js     # Playlist CRUD
    │   └── useHistory.js       # Lịch sử nghe
    │
    ├── store/                  # Global state (React Context)
    │   ├── AuthContext.jsx     # User info, token, isAuthenticated
    │   └── PlayerContext.jsx   # currentSong, queue, isPlaying, volume
    │
    ├── mock/                   # Mock data + handlers
    │   ├── mockData.js         # Dữ liệu mẫu (đã có sẵn!)
    │   └── mockHandlers.js     # MSW handlers cho từng endpoint
    │
    └── utils/
        ├── formatTime.js       # 225 giây → "3:45"
        ├── formatNumber.js     # 15420 → "15.4K"
        └── constants.js        # GENRE_COLORS, MAX_FILE_SIZE, ...
```

### 6.2 Backend Structure

```
backend/
├── pom.xml
├── Dockerfile
└── src/
    ├── main/
    │   ├── java/com/tvtmp3/backend/
    │   │   ├── BackendApplication.java
    │   │   │
    │   │   ├── config/
    │   │   │   ├── SecurityConfig.java       # Spring Security + JWT filter
    │   │   │   ├── CorsConfig.java           # CORS cho frontend
    │   │   │   ├── WebConfig.java            # Static resource mapping
    │   │   │   └── FileUploadConfig.java     # Cấu hình thư mục upload
    │   │   │
    │   │   ├── controller/
    │   │   │   ├── AuthController.java
    │   │   │   ├── SongController.java
    │   │   │   ├── GenreController.java
    │   │   │   ├── FavoriteController.java
    │   │   │   ├── PlaylistController.java
    │   │   │   └── HistoryController.java
    │   │   │
    │   │   ├── dto/
    │   │   │   ├── request/
    │   │   │   │   ├── LoginRequest.java
    │   │   │   │   ├── RegisterRequest.java
    │   │   │   │   ├── SongUploadRequest.java
    │   │   │   │   └── PlaylistRequest.java
    │   │   │   └── response/
    │   │   │       ├── ApiResponse.java      # { success, data, error }
    │   │   │       ├── AuthResponse.java
    │   │   │       ├── SongResponse.java
    │   │   │       ├── PagedResponse.java
    │   │   │       └── ErrorResponse.java
    │   │   │
    │   │   ├── entity/
    │   │   │   ├── User.java
    │   │   │   ├── Song.java
    │   │   │   ├── Genre.java
    │   │   │   ├── SongGenre.java
    │   │   │   ├── Playlist.java
    │   │   │   ├── PlaylistSong.java
    │   │   │   ├── Favorite.java
    │   │   │   ├── FavoriteId.java           # Embedded ID
    │   │   │   └── PlayHistory.java
    │   │   │
    │   │   ├── repository/
    │   │   │   ├── UserRepository.java
    │   │   │   ├── SongRepository.java
    │   │   │   ├── GenreRepository.java
    │   │   │   ├── PlaylistRepository.java
    │   │   │   ├── FavoriteRepository.java
    │   │   │   └── PlayHistoryRepository.java
    │   │   │
    │   │   ├── service/
    │   │   │   ├── AuthService.java          # Register, login, JWT generate
    │   │   │   ├── SongService.java          # CRUD + search + filter
    │   │   │   ├── FileStorageService.java   # Lưu/đọc file MP3, ảnh bìa
    │   │   │   ├── FavoriteService.java
    │   │   │   ├── PlaylistService.java
    │   │   │   └── HistoryService.java
    │   │   │
    │   │   ├── security/
    │   │   │   ├── JwtTokenProvider.java     # Tạo + verify JWT
    │   │   │   ├── JwtAuthenticationFilter.java
    │   │   │   └── UserDetailsServiceImpl.java
    │   │   │
    │   │   ├── exception/
    │   │   │   ├── GlobalExceptionHandler.java  # @ControllerAdvice
    │   │   │   ├── ResourceNotFoundException.java
    │   │   │   ├── BadRequestException.java
    │   │   │   └── UnauthorizedException.java
    │   │   │
    │   │   └── mapper/
    │   │       └── SongMapper.java           # Entity ↔ DTO
    │   │
    │   └── resources/
    │       ├── application.yml
    │       ├── application-dev.yml
    │       └── db/migration/
    │           └── V1__init_schema.sql
    │
    └── test/
        └── java/com/tvtmp3/backend/
            ├── service/
            │   └── SongServiceTest.java
            └── controller/
                └── SongControllerTest.java
```

### 6.3 Data Flow — TvTmp3

**Flow chính: User bấm Play một bài hát**

```
DiscoverPage (user bấm nút Play trên SongCard)
  ↓ gọi onPlay(song)
SongCard (emit sự kiện)
  ↓
usePlayer hook (nhận sự kiện, cập nhật queue)
  ↓ set currentSong = song, isPlaying = true
PlayerContext (global state thay đổi)
  ↓ re-render
MusicPlayer component (nhận currentSong từ context)
  ↓ gán src = currentSong.streamUrl
<audio> element (trình duyệt tự gọi HTTP GET /api/v1/songs/{id}/stream)
  ↓
Backend SongController.getStream()
  ↓
FileStorageService.loadFile(song.filePath)
  ↓ đọc file từ ổ đĩa
Trả về binary MP3
  ↓
Trình duyệt decode + phát nhạc 🔊
```

### 6.4 Mock API Strategy

```
Môi trường development:
  VITE_USE_MOCK=true → MSW intercept toàn bộ request
  → Code service hook gọi apiClient.login(...)
  → MSW bắt request, trả mock data
  → Logic trong hook/service không cần đổi

Môi trường tích hợp:
  VITE_USE_MOCK=false → Request đi thẳng đến backend thật
  → Code frontend KHÔNG THAY ĐỔI
```

---

## 7. CHIA TEAM 3 NGƯỜI

### 7.1 Phương án cho team fullstack

Vì cả team đều fullstack, bạn là manager + coder, tôi đề xuất:

```
BẠN (Manager + Developer):
├── Quản lý project: task, board, deadline, meeting
├── Quyết định kiến trúc, API contract, DB schema
├── Code: Backend chính (auth, security, file storage, database)
├── Review PR của cả team
└── Integration: đảm bảo FE + BE khớp nhau

THÀNH VIÊN A (Frontend-leaning Fullstack):
├── Code: Frontend chính (layout, components, pages, hooks)
├── Mock data + MSW handlers
├── UI responsive, animation
└── Hỗ trợ backend: API đơn giản (genres, favorites)

THÀNH VIÊN B (Backend-leaning Fullstack):
├── Code: Backend chính (song CRUD, playlist, search)
├── Database migration, seed data
├── Testing (API test, integration test)
└── Hỗ trợ frontend: pages phức tạp (Discover, Charts)
```

**Tại sao chia thế này?**

- Bạn (manager) không thể code full-time vì còn quản lý. Nên giao cho bạn phần backend quan trọng nhất + review là hợp lý.
- Có 2 người chuyên sâu FE/BE để đảm bảo chất lượng mỗi mảng
- Nhưng cả 2 đều flexible — A có thể làm BE, B có thể làm FE khi cần

**Nguyên tắc:**
- Không ai làm việc trong "hộp đen". Mỗi người phải hiểu cả 2 phía.
- Mọi PR phải có ít nhất 1 người khác review.
- Bạn review code quan trọng (auth, payment logic nếu có, file storage).

### 7.2 Ưu điểm của cách chia này

| Ưu điểm | Giải thích |
|---------|-----------|
| Có người chuyên sâu | FE và BE đều có người giỏi, chất lượng code tốt hơn |
| Flexible | Khi 1 bên bị bottleneck, người kia có thể giúp |
| Bạn giữ được context | Làm backend chính + review, bạn hiểu toàn bộ hệ thống |
| Ít dependency | Fullstack nên ít bị "đợi A làm xong B mới làm được" |

---

## 8. CHIA PROJECT THÀNH EPIC → FEATURE → TASK → SUBTASK

### 8.1 Epic Breakdown cho TvTmp3

```
EPIC 1: Foundation (Sprint 1 — 1 tuần)
├── Setup project BE + DB migration
├── Setup project FE + Router + Layout
├── Auth API (register, login, JWT)
├── Auth UI (Login page, SignUp page)
└── Integration: Auth flow end-to-end

EPIC 2: Music Discovery (Sprint 2 — 1 tuần)
├── Song API (list, detail, search, filter by genre)
├── Genre API (list)
├── Seed data (nhạc mẫu, thể loại)
├── Discover page (New Releases, Top Charts preview)
├── Charts page
├── Genres page + Genre Detail page
└── Music Player (play/pause/next/prev/seek)

EPIC 3: Personal Library (Sprint 3 — 1 tuần)
├── Favorites API (add/remove/list)
├── History API (record/get)
├── Favorites page
├── Recently Played page
├── Auth gate (bắt login khi vào Favorites)
└── Profile page

EPIC 4: Playlists + Upload (Sprint 4 — 1 tuần)
├── Playlist API (CRUD + add/remove song)
├── Upload API (file MP3 + metadata)
├── Playlist UI (tạo, xem, thêm/xóa bài)
├── Upload page
├── Uploaded page
└── Right Panel (queue từ playlist/album)

EPIC 5: Polish + Deploy (Sprint 5 — 1 tuần)
├── Responsive mobile
├── Bug fixes
├── Performance (lazy loading, image optimization)
├── Deploy FE (Vercel)
├── Deploy BE + DB (Render)
└── Documentation
```

### 8.2 Quy tắc chia task

| Tiêu chí | Quá nhỏ | ĐÚNG | Quá lớn |
|----------|---------|------|---------|
| **Thời gian** | < 1h | 2-8h | > 2 ngày |
| **Ví dụ TvTmp3** | "Đổi màu nút Play" | "Tạo DiscoverPage với New Releases và Top Charts" | "Làm toàn bộ frontend" |
| **Có thể test độc lập?** | ❌ | ✅ | ❌ |

### 8.3 Ví dụ: Chia task cho EPIC 2 (Music Discovery)

```
EPIC 2: Music Discovery
│
├── FEATURE: Song API (BE)
│   ├── TASK: Tạo Song entity + repository + migration (2h)
│   ├── TASK: SongService — list, detail, search, filter (4h)
│   ├── TASK: SongController — REST endpoints (3h)
│   ├── TASK: FileStorageService — stream MP3, serve cover (3h)
│   └── TASK: Seed data — 20 bài hát mẫu + genre (2h)
│
├── FEATURE: Genre API (BE)
│   └── TASK: Genre CRUD + seed data (2h)
│
├── FEATURE: Discover Page (FE)
│   ├── TASK: SongCard component (2h)
│   ├── TASK: DiscoverPage — New Releases + Top Charts sections (3h)
│   └── TASK: Connect DiscoverPage to Song API (2h)
│
├── FEATURE: Charts Page (FE)
│   ├── TASK: ChartsPage — bảng xếp hạng đầy đủ + sort (3h)
│   └── TASK: SongRow component (dạng table) (2h)
│
├── FEATURE: Genres Page (FE)
│   ├── TASK: GenreCard component (1h)
│   ├── TASK: GenresPage — grid thể loại (2h)
│   └── TASK: GenreDetailPage — bài hát theo thể loại (3h)
│
└── FEATURE: Music Player (FE)
    ├── TASK: PlayerContext + usePlayer hook (4h)
    ├── TASK: MusicPlayer component — controls UI (3h)
    ├── TASK: Progress bar + seek (2h)
    ├── TASK: Volume control (1h)
    └── TASK: Queue management (3h)
```

---

## 9. CÁCH GIAO TASK CHO TEAM

### 9.1 Template GitHub Issue

```markdown
---
## Task: [FE] Tạo MusicPlayer component (Bottom Bar)

**Task ID:** #MUSIC-012
**Type:** Feature
**Epic:** Music Discovery
**Priority:** P0 - Critical
**Sprint:** Sprint 2
**Assignee:** @member-a
**Estimated:** 4 hours
**Deadline:** 2026-03-22
**Depends on:** #MUSIC-011 (PlayerContext)

---

### 📋 Description
Tạo component MusicPlayer cố định ở bottom của trang. Component sử dụng
thẻ `<audio>` để phát nhạc và custom controls cho play/pause/next/prev/seek/volume.

### 🎯 User Story
Là người nghe nhạc, tôi muốn có thanh điều khiển nhạc ở cuối màn hình
để kiểm soát việc phát nhạc khi đang duyệt nội dung khác.

### ✅ Acceptance Criteria
- [ ] Player hiển thị thông tin bài đang phát: ảnh bìa, tên bài, artist
- [ ] Nút Play/Pause hoạt động, icon thay đổi theo trạng thái
- [ ] Nút Next → phát bài tiếp theo trong queue
- [ ] Nút Previous → restart nếu > 3s, lùi bài nếu < 3s
- [ ] Progress bar hiển thị đúng thời gian, click để seek
- [ ] Volume slider hoạt động, có nút Mute
- [ ] Player hidden khi không có bài nào trong queue
- [ ] Player responsive trên mobile

### 🔌 API Dependencies
- `GET /api/v1/songs/{id}/stream` — stream file MP3 (dùng trực tiếp trong `<audio src>`)

### 📁 Files
- `src/components/layout/MusicPlayer.jsx` (implement)
- `src/hooks/usePlayer.js` (đã có từ task #MUSIC-011)

### 🧪 Testing
- [ ] Phát 1 bài → player hiển thị, nhạc phát
- [ ] Bấm Next → chuyển bài, nhạc không bị gián đoạn
- [ ] Seek đến giữa bài → tua đúng vị trí
- [ ] Mute → không còn âm thanh, icon đổi
- [ ] Refresh trang → volume được khôi phục từ localStorage

### 📝 Notes
- Dùng HTML5 `<audio>` element, không cần thư viện ngoài
- Ảnh bìa fallback nếu không có: dùng placeholder màu gradient
- Xem reference: Spotify Web Player bottom bar

---

**Status:** ⬜ Todo
```

### 9.2 Thông tin tối thiểu mỗi task

| Field | Bắt buộc | Mô tả |
|-------|----------|-------|
| Title | ✅ | `[FE]`, `[BE]`, `[DEV]` + mô tả ngắn |
| Description | ✅ | Làm gì, tại sao, kết quả |
| Acceptance Criteria | ✅ | Checklist check được |
| Priority | ✅ | P0 (blocker), P1 (quan trọng), P2 (nên có), P3 (nice-to-have) |
| Assignee | ✅ | Một người cụ thể |
| Dependencies | ✅ | Cần task nào xong trước? |
| API Contract link | ⚠️ | Nếu liên quan API |
| Files to change | ⚠️ | Để dev biết bắt đầu từ đâu |
| Estimate | ⚠️ | Số giờ dự kiến |

---

## 10. GIT WORKFLOW

### 10.1 Git Flow cho team 3 người

**Dùng Trunk-based đơn giản hóa — không cần `develop` branch:**

```
main ─────────────────────────────────────────────
  │
  ├── feature/player-controls ──► PR ──► Merge
  ├── feature/song-api ────────► PR ──► Merge
  ├── fix/seek-bug ────────────► PR ──► Merge
  └── hotfix/stream-error ─────► PR ──► Merge (gấp)
```

**Quy trình: Branch từ main → Code → PR → Review → Merge vào main.**

### 10.2 Quy tắc đặt tên branch

```
feature/<tên-tính-năng>    Tính năng mới
fix/<tên-bug>              Sửa lỗi thường
hotfix/<tên-lỗi-gấp>       Sửa lỗi production
chore/<tên-việc>           Config, docs, dependency

✅ feature/music-player
✅ feature/playlist-api
✅ fix/stream-range-request
✅ hotfix/audio-not-playing-ios
✅ chore/add-docker-compose

❌ nguyenvanA_branch
❌ fix
❌ feature/login_and_register_and_forgot_password_too_long
```

### 10.3 Conventional Commits

```
feat: add music player with seek and volume control
feat(song): add stream endpoint with Range support
fix(player): resolve audio not pausing on mobile
fix(api): fix 500 error when song file not found
refactor(player): extract usePlayer hook from MusicPlayer
docs: update API specification with stream endpoint
test(song): add unit test for SongService
chore: add Docker Compose for local development
```

---

## 11. PULL REQUEST VÀ CODE REVIEW

### 11.1 PR Template

```markdown
## 📝 Description
Thêm MusicPlayer component — thanh điều khiển nhạc cố định ở bottom.

## 🔗 Related Issue
Closes #MUSIC-012

## ✅ Self Checklist
- [ ] Code chạy được trên local (`npm run dev`)
- [ ] Đã test các Acceptance Criteria
- [ ] Không còn console.log / comment debug
- [ ] Đã format code (ESLint)
- [ ] UI responsive trên mobile (test Chrome DevTools)
- [ ] Đã xử lý loading state (hiển thị spinner khi đang load file nhạc)
- [ ] Đã xử lý error state (hiển thị lỗi khi file nhạc 404)
- [ ] Đã xử lý empty state (player hidden khi queue rỗng)

## 🧪 How to Test
1. Mở app → vào Discover page
2. Bấm Play trên một bài hát → Player hiện, nhạc phát
3. Bấm Pause → nhạc dừng
4. Kéo progress bar → tua đúng vị trí
5. Bấm Next → chuyển bài tiếp theo
6. Test trên mobile (Chrome DevTools iPhone 12)

## 📸 Screenshots
<!-- Chụp player ở các trạng thái: playing, paused, mobile -->

## ⚠️ Breaking Changes
Không
```

### 11.2 Code Review Checklist cho TvTmp3

```markdown
## Review Checklist — TvTmp3

### 🎵 Logic
- [ ] Logic phát nhạc có đúng không? (play/pause/next/prev/seek)
- [ ] Có xử lý trường hợp file nhạc lỗi không? (404, network error)
- [ ] Có xử lý queue rỗng không?
- [ ] Seek có hoạt động cả khi chưa load xong file không?

### 📐 Architecture
- [ ] Code có đúng folder structure không?
- [ ] Component có bị quá to không? (> 300 lines)
- [ ] Có tách hook riêng cho player logic không?

### 🔒 Security
- [ ] API có check auth cho favorite/playlist/upload không?
- [ ] Upload có giới hạn file size + type không?
- [ ] File path có bị traversal không? (../../etc/passwd)

### 🎨 Frontend
- [ ] UI có responsive không?
- [ ] Có xử lý loading/error/empty state không?
- [ ] <audio> element có preload="metadata" không?
- [ ] Ảnh bìa có lazy load không?

### ⚙️ Backend
- [ ] Stream API có hỗ trợ Range request không? (để seek được)
- [ ] Có set Content-Type: audio/mpeg không?
- [ ] Database query có N+1 không? (dùng @EntityGraph hoặc JOIN FETCH)

### 🧪 Testing
- [ ] Player: đã test manual các trường hợp?
- [ ] API: đã test bằng Postman/curl?
```

---

## 12. QUẢN LÝ DEPENDENCY GIỮA CÁC TASK

### 12.1 Dependency Map cho TvTmp3 (Sprint 2)

```
               ┌────────────────────┐
               │   API CONTRACT     │
               │   ĐÃ KÝ (Sprint 1) │
               └─────────┬──────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  SONG API    │  │  GENRE API   │  │  SEED DATA   │
│  (BE - B)    │  │  (BE - bạn)  │  │  (BE - B)    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ DISCOVER     │  │  GENRES      │  │  CHARTS      │
│ PAGE (FE - A)│  │  PAGE (FE-A) │  │  PAGE (FE-A) │
└──────┬───────┘  └──────────────┘  └──────┬───────┘
       │                                    │
       └────────────┬───────────────────────┘
                    ▼
          ┌─────────────────┐
          │ MUSIC PLAYER    │
          │ (FE - A + bạn)  │
          └─────────────────┘

← Mũi tên ngang = có thể làm song song nếu có contract
← Mũi tên dọc = cần cái trên xong trước
```

### 12.2 Chiến lược giảm dependency

```
SPRINT 2 (Music Discovery):

TUẦN NÀY:
├── Thứ 2 (cả team): Review API contract cho Song + Genre
├── Thứ 3-4:
│   ├── B: Code Song API + Genre API (backend)
│   ├── A: Code Discover Page UI với MOCK DATA (frontend)
│   └── Bạn: Setup seed data + stream endpoint
├── Thứ 5:
│   ├── A: Code Charts + Genres page
│   └── B: Xong API → A bắt đầu connect mock → thật
├── Thứ 6:
│   ├── Cả team: Music Player integration
│   └── Bạn: Review PR, merge
└── Thứ 7: Demo cuối Sprint
```

**Key insight:** Frontend (A) không đợi Backend (B) code xong API. A code UI với mock data TRƯỚC. Khi B xong API, A chỉ cần đổi config (tắt MSW) là xong.

---

## 13. CÁCH LÀM KHI BACKEND CHƯA XONG

### 13.1 Mock Strategy cho TvTmp3

Bạn đã có `mockData.js` với đầy đủ dữ liệu: albums, newReleases, topCharts, genres, favorites, playlists. Đây là lợi thế lớn.

**Bước tiếp theo: Tạo MSW handlers để mock toàn bộ API.**

```javascript
// mock/mockHandlers.js
import { http, HttpResponse } from 'msw';
import {
  newReleases, topCharts, genres, favoriteSongs,
  recentlyPlayed, rightPanelTracks, playlists,
} from './mockData';

export const handlers = [
  // ─── Songs ───
  http.get('/api/v1/songs', ({ request }) => {
    const url = new URL(request.url);
    const genre = url.searchParams.get('genre');
    const sort = url.searchParams.get('sort');

    let songs = [...newReleases, ...topCharts];
    if (sort === 'popular') {
      songs.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    }
    return HttpResponse.json({
      success: true,
      data: { content: songs, totalElements: songs.length },
    });
  }),

  http.get('/api/v1/songs/:id/stream', ({ params }) => {
    // Trả về file MP3 mẫu (có thể dùng 1 file tĩnh trong public/)
    // Hoặc redirect đến sample audio
    return HttpResponse.redirect('/sample-audio.mp3');
  }),

  // ─── Genres ───
  http.get('/api/v1/genres', () => {
    return HttpResponse.json({
      success: true,
      data: genres,
    });
  }),

  // ─── Charts ───
  http.get('/api/v1/songs/charts', () => {
    return HttpResponse.json({
      success: true,
      data: { content: topCharts, totalElements: topCharts.length },
    });
  }),

  // ─── Favorites (cần auth) ───
  http.get('/api/v1/favorites', () => {
    return HttpResponse.json({
      success: true,
      data: favoriteSongs,
    });
  }),

  // ─── Auth ───
  http.post('/api/v1/auth/login', async ({ request }) => {
    const { email } = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        token: 'mock-jwt-token-12345',
        user: { id: 1, email, name: 'Test User', role: 'USER' },
      },
    });
  }),

  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        token: 'mock-jwt-token-new',
        user: { id: 2, email: body.email, name: body.name, role: 'USER' },
      },
    });
  }),
];
```

### 13.2 Enable MSW trong development

```javascript
// main.jsx (cập nhật)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

async function bootstrap() {
  // Enable MSW only in dev mode
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false') {
    const { setupWorker } = await import('msw/browser');
    const { handlers } = await import('./mock/mockHandlers');
    await setupWorker(...handlers).start({ onUnhandledRequest: 'bypass' });
    console.log('[MSW] Mock API enabled');
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
}

bootstrap();
```

### 13.3 Khi backend sẵn sàng

```
1. Đảm bảo backend chạy tại localhost:8080
2. Set VITE_USE_MOCK=false trong .env
3. Restart frontend dev server
4. Tất cả request đi thẳng đến backend thật
5. KHÔNG THAY ĐỔI GÌ TRONG CODE SERVICE/HOOK/PAGE
```

**Đây là điểm quan trọng nhất:** Code frontend không được có `if (USE_MOCK) ... else ...`. MSW mock ở network level, code của bạn không cần biết.

---

## 14. PLANNING VÀ SPRINT

### 14.1 Sprint 1 tuần cho team 3 người

```
SPRINT CYCLE (7 ngày):

Monday (30 phút) — Sprint Planning
├── Review Sprint trước: cái gì xong, cái gì chưa?
├── Chọn task cho Sprint này
├── Verify dependency: không ai bị block
└── Sprint Goal: 1 câu mô tả kết quả cuối Sprint

Wednesday (10 phút) — Mid-week Check-in
├── Có ai bị block không?
├── Tiến độ có đúng estimate không?
└── Cần điều chỉnh gì không?

Friday (30 phút) — Sprint Review + Retro
├── Demo: cho cả team xem cái đã làm được
├── Review: so với Sprint Goal
└── Retro: 1 điều tốt, 1 điều cần cải thiện
```

### 14.2 Sprint Goals cho TvTmp3

```
SPRINT 1 GOAL: "User có thể đăng ký, đăng nhập và thấy giao diện chính của app."

SPRINT 2 GOAL: "User có thể xem danh sách nhạc, lọc theo thể loại,
               xem bảng xếp hạng và PHÁT NHẠC."

SPRINT 3 GOAL: "User đã đăng nhập có thể lưu bài hát yêu thích,
               xem lịch sử nghe và quản lý profile."

SPRINT 4 GOAL: "User có thể tạo playlist, upload nhạc của mình
               và quản lý nội dung cá nhân."

SPRINT 5 GOAL: "App được deploy lên production, hoạt động ổn định
               trên cả desktop và mobile."
```

---

## 15. ESTIMATION

### 15.1 Khuyến nghị: Ideal Hours × 2

Với team mới, công thức: **Estimate thực tế = Số giờ bạn nghĩ × 2 (ít nhất).**

### 15.2 Bảng reference cho TvTmp3

| Task | Estimate của newbie | Thực tế (×2) |
|------|--------------------|--------------|
| Setup Spring Boot + DB connection | 2h | 4h |
| Auth API (register + login + JWT) | 4h | 1-2 ngày |
| Song CRUD API | 3h | 1 ngày |
| Stream endpoint (có Range support) | 2h | 4-6h |
| Upload API (multipart + validation) | 3h | 1 ngày |
| Music Player component | 4h | 1-2 ngày |
| Discover Page | 3h | 1 ngày |
| Playlist CRUD (cả BE + FE) | 4h | 2-3 ngày |
| Responsive mobile toàn bộ app | 4h | 2 ngày |

---

## 16. PROJECT MANAGEMENT BOARD

### 16.1 Kanban cho TvTmp3

Dùng GitHub Projects, columns:

```
BACKLOG           TODO              IN PROGRESS       REVIEW            DONE
─────────         ─────             ───────────       ──────            ────
• Playlist        • Song API        • Music Player    • Auth API        • Setup
  sharing         • Discover Page     (A - 60%)         (Bạn review)      project
• Dark mode       • Stream API      • Favorites       • Discover Page   • DB schema
• Comments        • Login UI          (B - đang làm)    (A review)
• Equalizer       • Charts Page
```

### 16.2 WIP Limits (Work In Progress)

| Column | Limit | Lý do |
|--------|-------|-------|
| IN PROGRESS | 2 task/người | Không ai nên làm quá 2 thứ cùng lúc |
| REVIEW | 3 PRs | Tránh PR tồn đọng, review không kịp |

### 16.3 Definition of Done

```markdown
## Definition of Done — TvTmp3

### Mọi task:
- [ ] Code merged vào main (qua PR + review)
- [ ] Không có merge conflict
- [ ] Pass tất cả Acceptance Criteria
- [ ] Không còn console.log / TODO / debug code
- [ ] Code đã format (ESLint cho FE, Checkstyle cho BE)

### Frontend task:
- [ ] UI khớp với design (nếu có Figma)
- [ ] Responsive trên mobile (test iPhone 12 trong Chrome DevTools)
- [ ] Loading state: spinner/skeleton khi đang fetch
- [ ] Error state: message lỗi thân thiện, nút thử lại (nếu có thể)
- [ ] Empty state: hiển thị "Chưa có dữ liệu" thay vì trắng trơn

### Backend task:
- [ ] API trả đúng format: { success, data/error }
- [ ] Đúng HTTP status code
- [ ] Validation cho input
- [ ] Exception handling (không crash, trả error response)
- [ ] Đã test với Postman/curl

### Bug fix:
- [ ] Bug không còn tái hiện
- [ ] Không gây bug mới (test lại flow liên quan)
- [ ] Có mô tả root cause trong PR description
```

---

## 17. TESTING

### 17.1 Chiến lược test cho TvTmp3

```
P0 — PHẢI CÓ (mỗi Sprint):
├── Manual test từng feature theo AC checklist
├── API test bằng Postman (backend dev tự test)
├── Smoke test: 15 phút test flow chính cuối Sprint
└── Test trên mobile (Chrome DevTools responsive mode)

P1 — NÊN CÓ (Sprint cuối):
├── Unit test cho AuthService, SongService
├── Integration test: gọi API thật → check response
└── Test stream nhạc với file thật (không phải mock)

P2 — TỐT NHƯNG KHÔNG BẮT BUỘC:
├── E2E test (Cypress/Playwright)
├── React component test
└── Performance test (Lighthouse)

P3 — KHÔNG CẦN (team 3 người, project sinh viên):
├── Stress test (1000 concurrent users)
├── Security penetration test
└── Accessibility audit (screen reader)
```

### 17.2 Smoke Test Checklist cho TvTmp3

```markdown
## TvTmp3 Smoke Test (15 phút, trước mỗi lần merge/release)

### Không đăng nhập:
- [ ] Mở app → thấy Discover page với New Releases
- [ ] Chuyển qua Charts → thấy bảng xếp hạng
- [ ] Chuyển qua Genres → thấy danh sách thể loại
- [ ] Bấm vào 1 thể loại → thấy danh sách bài hát
- [ ] Bấm Play 1 bài → Music Player hiện, nhạc phát 🔊
- [ ] Bấm Next → chuyển bài
- [ ] Tua thanh progress → nhạc tua đúng
- [ ] Vào Favorites → bị redirect sang Login (vì chưa đăng nhập)

### Đăng nhập:
- [ ] Đăng ký tài khoản mới → thành công, tự động login
- [ ] Vào Favorites → thấy danh sách yêu thích (có thể rỗng)
- [ ] Thêm 1 bài vào yêu thích → xuất hiện trong Favorites
- [ ] Tạo playlist mới → playlist xuất hiện
- [ ] Upload 1 file MP3 → thành công, bài hát xuất hiện

### Mobile (iPhone 12, Chrome DevTools):
- [ ] Sidebar thu gọn thành hamburger menu
- [ ] Music Player hiển thị đầy đủ controls
- [ ] Không có element nào tràn ra ngoài màn hình
- [ ] Click vào bài hát → player response trong < 200ms
```

---

## 18. SECURITY

### 18.1 Security tối thiểu cho TvTmp3

| Vấn đề | Áp dụng ở đâu | Cách làm |
|--------|-------------|----------|
| **Password hashing** | Register API | BCrypt (Spring Security mặc định) |
| **JWT security** | Auth API | Token có expiry 24h, secret trong env var |
| **CORS** | Backend config | Chỉ allow `http://localhost:5173` (dev) + domain production |
| **Input validation** | Tất cả API | Bean Validation (`@Valid`, `@NotBlank`, `@Size`) |
| **File upload validation** | Upload API | Chỉ cho phép `audio/mpeg`, max 20MB, kiểm tra magic bytes |
| **Path traversal** | Stream API | Dùng `Paths.get().normalize()`, không nối string trực tiếp |
| **XSS** | Frontend | React tự escape, không dùng `dangerouslySetInnerHTML` |
| **SQL Injection** | Backend | JPA Parameterized Query (mặc định an toàn) |
| **Authorization** | Favorite/Playlist/Upload | Kiểm tra `userId == currentUser.id` |
| **Rate limiting** | Login API | Tối đa 10 lần/phút (có thể thêm sau MVP) |
| **Environment variables** | Cả project | `.env` trong `.gitignore`, không commit secret |

### 18.2 Lưu ý đặc thù cho app nhạc

```
1. FILE UPLOAD: Không tin tưởng extension file. Kiểm tra magic bytes:
   - MP3: bắt đầu bằng 0xFF 0xFB hoặc ID3 tag
   - Không cho upload .exe, .php, .jsp dù đã đổi tên thành .mp3

2. STREAM ENDPOINT: Không cho phép path traversal:
   ❌ GET /api/v1/songs/../../../etc/passwd/stream
   ✅ Chỉ đọc file trong thư mục uploads/, dùng UUID làm tên file

3. PUBLIC VS PRIVATE: Bài hát upload phải có flag is_public.
   Admin có thể duyệt trước khi public (có thể làm sau MVP).

4. RATE LIMIT STREAM: Không ai tải hàng GB nhạc miễn phí.
   Có thể giới hạn stream mỗi IP hoặc mỗi user.
```

---

## 19. DEPLOYMENT

### 19.1 Môi trường cho TvTmp3

**2 môi trường là đủ cho team 3 người:**

```
DEVELOPMENT                    PRODUCTION
───────────                    ──────────
Localhost mỗi dev              Người dùng thật
FE: localhost:5173             FE: vercel.app
BE: localhost:8080             BE: render.com
DB: localhost:3306             DB: render.com (managed MySQL)
File: backend/uploads/         File: render.com disk
```

### 19.2 Deployment cụ thể

```
┌─────────────────────────────────────────────┐
│  FRONTEND: Vercel                           │
│  - Repo: GitHub → Vercel connect            │
│  - Build: npm run build                     │
│  - Auto-deploy khi push lên main            │
│  - Config: VITE_API_BASE_URL = <BE URL>     │
│  - Free tier: 100GB bandwidth (đủ dùng)     │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  BACKEND: Render Web Service                │
│  - Dockerfile (Spring Boot)                 │
│  - Port: 8080                               │
│  - Env: DB_URL, JWT_SECRET, UPLOAD_DIR      │
│  - Disk: mount /uploads (persistent)        │
│  - Free tier: 512MB RAM, 0.5 CPU (tạm ổn)  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  DATABASE: Render Managed MySQL             │
│  - Free tier: 256MB RAM, 1GB storage        │
│  - Auto backup                              │
└─────────────────────────────────────────────┘
```

### 19.3 Docker Compose cho Local Dev

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: tvtmp3dev
      MYSQL_DATABASE: tvtmp3
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/tvtmp3
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: tvtmp3dev
      JWT_SECRET: dev-secret-change-in-production
      UPLOAD_DIR: /app/uploads
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      - mysql

volumes:
  mysql_data:
  uploads_data:
```

---

## 20. DOCUMENTATION

### 20.1 Tài liệu cho TvTmp3

| Tài liệu | Bắt buộc? | Format |
|----------|-----------|--------|
| **README.md** | 🔴 Bắt buộc | Đã có sẵn, cập nhật thêm |
| **API Specification** | 🔴 Bắt buộc | `doc/api-spec.md` |
| **Database ERD** | 🟡 Nên có | Link dbdiagram.io hoặc hình ảnh |
| **Setup Guide** | 🟡 Nên có | Trong README, hướng dẫn Docker Compose |
| **Git Convention** | 🟡 Nên có | Trong README |
| **Deployment Guide** | 🟢 Tốt | Làm sau khi deploy lần đầu |
| **Architecture Diagram** | 🟢 Tốt | Đã có trong README |

---

## 21. PROJECT MANAGEMENT HẰNG NGÀY

### 21.1 Checklist hằng ngày (dành cho bạn — PM + Dev)

```
SÁNG (15 phút):
├── Kiểm tra GitHub Projects board → ai đang làm gì?
├── Có PR nào đợi review > 4 tiếng không? → Review ngay
├── Có ai báo blocker không? → Giải quyết ngay
└── Hôm nay mình sẽ code gì? → Block 2-3 tiếng focus

CHIỀU (10 phút):
├── Review PRs của team
├── Kiểm tra tiến độ → task nào sắp tới deadline?
├── Có scope creep không? (ai đó đang làm thứ không có trong Sprint)
└── Update board

TỐI (5 phút):
├── Ghi chú nhanh: hôm nay xong gì, mai làm gì
└── DM team nếu có blocker cần giải quyết
```

### 21.2 Check-in meeting (10 phút, thứ 4)

Thay vì Daily Standup mỗi sáng (overkill cho 3 người), làm **1 check-in giữa tuần:**

```
1. Từ thứ 2 đến giờ làm được gì? (mỗi người 1 phút)
2. Có gì đang block không? (2 phút)
3. Cần điều chỉnh gì không? (estimate sai? dependency mới phát sinh?)
4. Còn task nào chưa assign không?
```

---

## 22. RISK MANAGEMENT

### 22.1 Risk Register cho TvTmp3

| Risk | Prob. | Impact | Mitigation | Contingency |
|------|-------|--------|-----------|-------------|
| **File upload/stream không hoạt động** | Cao | Cao | Test stream endpoint sớm, không để cuối Sprint | Fallback: dùng link nhạc mẫu online |
| **DB schema thay đổi giữa chừng** | Trung bình | Cao | Review kỹ trước Sprint, khóa schema | Dùng Flyway migration, rollback |
| **Auth + JWT bug** | Trung bình | Cao | Làm auth Sprint 1, test kỹ | Đơn giản hóa: bỏ JWT, dùng session nếu quá khó |
| **Nhạc stream bị giật/lag** | Trung bình | Trung bình | Dùng CDN hoặc nén MP3 chất lượng vừa phải | Giảm bitrate file mẫu |
| **UI không responsive** | Cao | Thấp | Test mobile liên tục trong Sprint | Mobile-first: làm mobile trước, desktop sau |
| **1 thành viên nghỉ** | Thấp | Cao | Mọi người đều fullstack, code review chéo | Người còn lại chia task, cắt scope |
| **Không kịp deadline** | Cao | Cao | Estimate × 2, buffer 20%, Sprint 1 tuần | Cắt feature: Upload và Playlist làm sau |
| **Chưa biết Spring Security** | Cao | Cao | Làm learning spike 1 buổi trước khi code auth | Dùng tutorial, copilot hỗ trợ |

---

## 23. QUY TRÌNH HOÀN CHỈNH

```
TUẦN 0: PREPARATION (HIỆN TẠI)
├── Xác định MVP scope + out-of-scope ✅ (đã rõ)
├── Thiết kế ERD + review
├── Thiết kế API contract (Auth + Song + Genre)
├── Setup Docker Compose
├── Setup GitHub Project Board
└── Sprint 1 Planning

TUẦN 1: SPRINT 1 — Foundation
├── Backend: Spring Boot setup, DB migration, Auth API
├── Frontend: Router, Layout (Sidebar + RightPanel + Player stub), Login/SignUp UI
├── Integration: Auth flow end-to-end
└── DEMO: Đăng ký, đăng nhập, thấy layout chính

TUẦN 2: SPRINT 2 — Music Discovery
├── Backend: Song CRUD API, Genre API, Stream endpoint, Seed data
├── Frontend: Discover page, Charts page, Genres page, MusicPlayer
├── Integration: Play nhạc từ Discover/Charts/Genres
└── DEMO: Duyệt nhạc, lọc thể loại, nghe nhạc 🎵

TUẦN 3: SPRINT 3 — Personal Library
├── Backend: Favorites API, History API, record play
├── Frontend: Favorites page, RecentlyPlayed page, Profile page
└── DEMO: Lưu yêu thích, xem lịch sử nghe

TUẦN 4: SPRINT 4 — Playlists + Upload
├── Backend: Playlist API, Upload API
├── Frontend: Playlist UI, Upload page, Uploaded page
└── DEMO: Tạo playlist, upload nhạc

TUẦN 5: SPRINT 5 — Polish + Deploy
├── Responsive mobile toàn bộ
├── Bug fixes (critical only)
├── Deploy FE → Vercel
├── Deploy BE + DB → Render
├── Production smoke test
├── README + docs hoàn thiện
└── 🎉 PROJECT LIVE

TUẦN 6 (optional): BUFFER
├── Fix bug production
├── Thêm tính năng nhỏ bị cắt
└── Retrospective
```

---

## 24. PROJECT EXECUTION PLAYBOOK

### 24.1 Checklist Trước Khi Code (Áp dụng ngay hôm nay)

```markdown
## PRE-CODE CHECKLIST — TvTmp3

### Business & Scope
- [ ] MVP scope: Discover, Charts, Genres, Player, Login, Favorites, History,
      Profile, Playlists, Upload
- [ ] Out of scope: comment, share, AI recommend, mobile app, payment
- [ ] Nghe tự do, login chỉ để favorite/playlist/upload

### Technical Decisions
- [x] Tech stack: React 19 + Vite + Tailwind | Spring Boot 4.1 | MySQL 8
- [x] File MP3 lưu local: backend/uploads/
- [x] Auth: JWT
- [ ] ERD đã vẽ + review? ← CẦN LÀM
- [ ] API contract đã viết? ← CẦN LÀM (ít nhất Auth + Song)
- [ ] Cấu trúc thư mục FE + BE đã thống nhất?

### Repository & Git
- [x] Git repo đã tạo
- [ ] Branch naming convention đã thống nhất? ← CẦN LÀM
- [ ] Commit message convention đã thống nhất? ← CẦN LÀM
- [ ] PR template đã tạo? (.github/PULL_REQUEST_TEMPLATE.md)
- [ ] Issue template đã tạo?

### Project Management
- [ ] GitHub Project Board đã setup? ← CẦN LÀM
- [ ] Sprint 1 backlog đã có task?
- [ ] Mỗi task có AC rõ ràng?
- [ ] Definition of Done đã thống nhất?

### Docker
- [ ] docker-compose.yml đã viết? ← CẦN LÀM
```

### 24.2 Checklist Trước Mỗi Sprint

```markdown
## SPRINT PLANNING CHECKLIST

- [ ] Sprint Goal rõ ràng (1 câu)
- [ ] Tất cả task đã có description + AC + estimate
- [ ] Đã check dependency: không ai bị block
- [ ] Mỗi người có lượng task vừa sức (không quá 80% thời gian)
- [ ] Buffer: 20% cuối Sprint để trống (bug, unexpected)
- [ ] API contract cho Sprint này đã được review + khóa
- [ ] Mock data đã có cho FE task
```

### 24.3 Cách Xử Lý Blocker

```
1. Bị kẹt > 1 giờ → báo ngay cho PM (bạn), không im lặng
2. Phân loại blocker:
   ├── Không biết làm → Pair program 30 phút
   ├── Đợi dependency → Làm task khác hoặc mock
   ├── Lỗi môi trường → Cả team giúp fix
   └── Requirement không rõ → PM clarify ngay
3. Nếu không resolve được trong 2 giờ → escalate, đổi task
```

### 24.4 Cách Xử Lý Thay Đổi Requirement

```
CÓ AI ĐÓ NÓI: "Hay mình thêm tính năng X đi!"

QUY TRÌNH:
1. Ghi nhận ý tưởng
2. Hỏi: "Có trong scope không?"
   ├── Có → OK, nhưng phải trade-off (bỏ cái gì?)
   └── Không → Ghi vào Backlog "Sprint sau"
3. KHÔNG BAO GIỜ thêm task vào Sprint đang chạy
4. Nguyên tắc: THÊM 1 → BỚT 1
```

### 24.5 Cách Quản Lý Deadline

```
1. Mỗi Sprint có deadline CỨNG (thứ 6 hàng tuần)
2. Mốc kiểm tra:
   ├── Thứ 4: 60% task phải xong → nếu không → báo động
   └── Thứ 5: 90% task phải xong → chỉ fix bug
3. Nếu trễ → CẮT SCOPE, không tăng giờ làm
4. Deadline đầu tiên (Sprint 1) cực kỳ quan trọng — 
   hoàn thành nó để team có confidence
```

### 24.6 Những Lỗi PM Mới Thường Mắc

| # | Lỗi | Hậu quả | Cách tránh |
|---|-----|---------|------------|
| 1 | **Không có API contract trước khi code** | FE và BE không khớp, integrate lỗi | Viết contract, khóa lại trước Sprint |
| 2 | **"Để mọi người tự chọn task"** | Ai cũng chọn task dễ/thú vị, task khó không ai làm | PM phân công dựa trên năng lực |
| 3 | **Không review code** | Code rối, 1 người biết 1 phần, lúc nghỉ thì chết | PR + review bắt buộc |
| 4 | **Không nói "KHÔNG" với scope creep** | Project không bao giờ xong | Có out-of-scope list, "thêm 1 bỏ 1" |
| 5 | **Không test stream nhạc sớm** | Đến Sprint cuối mới biết không stream được | Test tính năng quan trọng nhất NGAY KHI CÓ THỂ |
| 6 | **Bỏ qua loading/error/empty state** | App "xấu", user không biết chuyện gì đang xảy ra | Bắt buộc trong AC |
| 7 | **Dồn deploy cuối cùng** | Deploy lần đầu luôn có vấn đề | Deploy sớm (Sprint 2), dù chỉ là bản thô |
| 8 | **PM không code** | Mất context kỹ thuật, quyết định không thực tế | Bạn code ít nhất 30-40% thời gian |
| 9 | **Quá nhiều meeting** | Mất thời gian code | 2 meeting/tuần: Planning 30ph + Review 30ph |
| 10 | **So sánh với Spotify** | "Sao không có feature X như Spotify?" — Bạn có 3 người, họ có 3000 kỹ sư | Nhớ scope của mình |

### 24.7 Những Quyết Định BẠN PHẢI TỰ ĐƯA RA

Đây là những thứ **không được ủy quyền** cho team hoặc AI:

1. **Scope MVP:** Những page nào trong lần deploy đầu? Tôi khuyên: Discover + Charts + Genres + Player + Login. Còn lại làm Sprint 3-4.

2. **Khi nào đủ tốt để release:** Bạn là người bấm nút "Deploy". Không phải developer.

3. **Trade-off khi trễ deadline:** Bỏ Playlist hay Upload trước? Bạn quyết định.

4. **Kiến trúc:** Monolith backend (đừng microservices). REST API (đừng GraphQL). Local file storage (đừng S3 ngay). Bạn chốt.

5. **Ai review code của ai:** Setup rule rõ ràng. Đừng để "tự chọn reviewer".

6. **Khi nào cần họp khẩn:** Khi blocker kéo dài > 4 giờ, khi có conflict lớn, khi scope bị đe dọa.

---

## TỔNG KẾT

### Những gì bạn nên làm TIẾP THEO (ngay tuần này):

```
HÔM NAY:
1. [ ] Gửi playbook này cho 2 thành viên còn lại đọc
2. [ ] Họp 1 tiếng: thống nhất scope MVP, Git convention, role

NGÀY MAI:
3. [ ] Cả team vẽ ERD trên whiteboard/Miro/dbdiagram.io
4. [ ] Review ERD → khóa schema Sprint 1
5. [ ] Viết API contract (Auth + Song + Genre)

CUỐI TUẦN:
6. [ ] Setup GitHub Project Board với Sprint 1 backlog
7. [ ] Tạo PR template + Issue template
8. [ ] Setup Docker Compose
9. [ ] Code những dòng đầu tiên (setup project) ✨
```

### Nguyên tắc cuối cùng:

> **"The best project manager is the one who removes blockers, not the one who creates meetings."**

Đừng biến mình thành người chỉ họp và giao task. Bạn là developer đầu tiên và quan trọng nhất trong team. Code cùng họ, review code của họ, và bảo vệ họ khỏi scope creep.

Chúc team bạn triển khai TvTmp3 thành công! 🎵
