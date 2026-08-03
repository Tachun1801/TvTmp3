# TvTmp3

Nghe nhạc lành mạnh.

## Tổng quan

TvTmp3 là web app nghe nhạc MP3. Frontend React + Vite gọi REST API tới Spring Boot backend, backend lưu metadata vào MySQL và file nhạc vào ổ đĩa.

```
┌───────────────┐
│    React      │
│     Vite      │
└───────┬───────┘
        │ REST API
        ↓
┌───────────────┐
│  Spring Boot  │
│  Controller   │
│  Service      │
│  Repository   │
└───────┬───────┘
        │
 ┌──────┴──────┐
 ↓             ↓
┌────────┐  ┌──────────┐
│ MySQL  │  │  MP3     │
│metadata│  │ storage  │
└────────┘  └──────────┘
```

## Công nghệ

### Backend

| Công cụ | Vai trò | Tại sao dùng |
|---|---|---|
| **Java 21** | Ngôn ngữ | Bản LTS mới nhất, virtual thread, pattern matching |
| **Spring Boot 4.1** | Framework | Tự cấu hình, khởi tạo nhanh, ecosystem lớn |
| **Spring Web MVC** | REST API | Xây dựng controller, xử lý HTTP request |
| **Spring Data JPA** | ORM | Giảm boilerplate SQL, tự sinh query từ method name |
| **MySQL** | Database | Lưu metadata bài hát, phổ biến, dễ vận hành |
| **Lombok** | Code gen | Bỏ getter/setter/constructor thủ công, code sạch hơn |
| **Validation** | Validate input | Kiểm tra dữ liệu đầu vào ngay tầng controller |
| **DevTools** | Hot reload | Tự restart server khi code thay đổi, tăng tốc dev |

### Frontend

| Công cụ | Vai trò | Tại sao dùng |
|---|---|---|
| **React 19** | UI framework | Component-based, cộng đồng lớn, hệ sinh thái phong phú |
| **Vite** | Build tool | Dev server nhanh, HMR tức thì, build nhẹ |
| **React Router** | Điều hướng | Client-side routing, chuyển trang không reload |
| **Axios** | HTTP client | Gọi REST API gọn hơn fetch, tự động parse JSON, intercept request/response |
| **Tailwind CSS** | CSS utility | Viết style ngay trong class, không cần file CSS riêng, build tự xóa CSS thừa |
| **ESLint** | Linter | Bắt lỗi JS/JSX, thống nhất coding style — có sẵn khi scaffold Vite, không cần cài thêm |

## Cài đặt & Chạy

### Yêu cầu

- Java 21
- Maven 3.9+
- MySQL 8+
- Node.js 22+

### Backend

```bash
cd backend

# Cấu hình MySQL trong src/main/resources/application.properties
# spring.datasource.url=jdbc:mysql://localhost:3306/tvtmp3
# spring.datasource.username=...
# spring.datasource.password=...

# Chạy
./mvnw spring-boot:run
```

Server chạy tại `http://localhost:8080`.

### Frontend

```bash
# Khởi tạo dự án React + Vite
npm create vite@latest frontend -- --template react
cd frontend

# Cài dependency
npm install
npm install react-router-dom axios
npm install -D tailwindcss @tailwindcss/vite

# Chạy dev server
npm run dev
```

Dev server chạy tại `http://localhost:5173`.

## Cấu trúc dự án

```
TvTmp3/
├── backend/              # Spring Boot (Java 21, Maven)
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/tvtmp3/
│       └── main/resources/
└── frontend/             # React + Vite
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```
