# Auth — Gated Content Pattern

## Ý tưởng

Thay vì redirect người dùng chưa đăng nhập về `/login`, ta giữ nguyên URL và hiển thị một màn hình mời đăng nhập ngay trên trang cần bảo vệ. Các trang public (Discover, Charts, Genres…) vẫn truy cập bình thường với cả hai nhóm người dùng.

| Trang | Chưa đăng nhập | Đã đăng nhập |
|---|---|---|
| Discover, Charts, Genres, Recently Played | Hiển thị đầy đủ nội dung | Hiển thị đầy đủ nội dung |
| Favorites, Uploaded, Profile | Nút **Sign In** + **Create Account** | Hiển thị nội dung thật |

## Kiến trúc tổng quan

```
main.jsx
  └─ BrowserRouter
      └─ AuthProvider                  ← React Context: user, login(), logout(), isAuthenticated
          └─ App
              └─ Routes
                  ├─ /login            (public, không Layout)
                  ├─ /signup           (public, không Layout)
                  └─ Layout            (Sidebar + Outlet + RightPanel + MusicPlayer)
                      ├─ /discover         (public)
                      ├─ /recently-played  (public)
                      ├─ /charts           (public)
                      ├─ /genres           (public)
                      ├─ /favorites        (RequireAuth)
                      ├─ /uploaded         (RequireAuth)
                      └─ /profile          (RequireAuth)
```

## Các file cần tạo / sửa

### 1. Tạo `src/contexts/AuthContext.jsx`

```jsx
import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

**Điểm mở rộng sau này:**
- `login()` sẽ gọi `POST /api/auth/login` thay vì chỉ `setUser`
- Thêm `useEffect` kiểm tra token trong `localStorage` để tự động restore phiên

### 2. Tạo `src/components/RequireAuth.jsx`

```jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="flex-1 flex items-center justify-center overflow-y-auto">
      <div className="text-center px-8 py-16 max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <LogIn size={32} className="text-white/30" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          You need to log in to access this content. Sign in to your account to
          view your favorites, profile, and more.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-400/30"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-2.5 rounded-xl transition-all"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3. Sửa `src/main.jsx` — bọc `AuthProvider`

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
```

### 4. Sửa `src/App.jsx` — phân biệt route public / protected

```jsx
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import RequireAuth from '@/components/RequireAuth';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import DiscoverPage from '@/pages/DiscoverPage';
import RecentlyPlayedPage from '@/pages/RecentlyPlayedPage';
import FavoritesPage from '@/pages/FavoritesPage';
import UploadedPage from '@/pages/UploadedPage';
import ChartsPage from '@/pages/ChartsPage';
import GenresPage from '@/pages/GenresPage';
import ProfilePage from '@/pages/ProfilePage';
import { newReleases } from '@/data/mockData';

function App() {
  const [currentTrack, setCurrentTrack] = useState(newReleases[0]);

  const handlePlay = (track) => {
    setCurrentTrack(track);
  };

  return (
    <Routes>
      {/* Auth pages — không Layout, luôn public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* App pages — có Layout + Sidebar + MusicPlayer */}
      <Route element={<Layout currentTrack={currentTrack} onPlay={handlePlay} />}>

        {/* === PUBLIC: ai cũng vào được === */}
        <Route path="/discover" element={<DiscoverPage onPlay={handlePlay} />} />
        <Route path="/recently-played" element={<RecentlyPlayedPage onPlay={handlePlay} />} />
        <Route path="/charts" element={<ChartsPage onPlay={handlePlay} />} />
        <Route path="/genres" element={<GenresPage />} />

        {/* === PROTECTED: hiển thị nút login nếu chưa đăng nhập === */}
        <Route path="/favorites" element={
          <RequireAuth><FavoritesPage onPlay={handlePlay} /></RequireAuth>
        } />
        <Route path="/uploaded" element={
          <RequireAuth><UploadedPage onPlay={handlePlay} /></RequireAuth>
        } />
        <Route path="/profile" element={
          <RequireAuth><ProfilePage /></RequireAuth>
        } />
      </Route>

      <Route path="/" element={<Navigate to="/discover" replace />} />
    </Routes>
  );
}

export default App;
```

### 5. Sửa `src/pages/LoginPage.jsx` — gọi `login()`

```jsx
import { useAuth } from '@/contexts/AuthContext';

// Trong component:
const { login } = useAuth();

const handleSubmit = (e) => {
  e.preventDefault();
  // TODO: gọi API login thật, nhận về user + token
  login({
    name: 'John Doe',
    email: email,
    token: 'fake-jwt-token',
  });
  navigate('/discover');
};
```

### 6. Sửa `src/pages/SignUpPage.jsx` — gọi `login()` sau khi đăng ký

Làm tương tự LoginPage: gọi `login(...)` với dữ liệu trả về từ API đăng ký.

### 7. Sửa `src/pages/ProfilePage.jsx` — gọi `logout()` khi Sign Out

```jsx
import { useAuth } from '@/contexts/AuthContext';

// Trong component:
const { logout } = useAuth();

// Nút Sign Out:
<button onClick={() => { logout(); navigate('/login'); }}>
  Sign Out
</button>
```

## Flow hoạt động

```
Người dùng chưa login vào /favorites
  → URL vẫn là /favorites
  → Sidebar vẫn hiện, MusicPlayer vẫn chạy
  → Vùng nội dung chính hiện: icon khoá + "Login Required" + 2 nút Sign In / Create Account
  → Bấm Sign In → chuyển qua /login
  → Đăng nhập xong → có thể navigate về /favorites (hoặc trang trước đó)
  → Lần này RequireAuth thấy isAuthenticated = true → hiển thị FavoritesPage thật
```

## So sánh với pattern Redirect

| | Gated Content (pattern này) | Redirect `/login` |
|---|---|---|
| URL khi chưa login | Giữ nguyên (`/favorites`) | Chuyển thành `/login` |
| Trải nghiệm | Không mất vị trí, thân thiện | Phải navigate lại sau login |
| Sidebar / Player | Vẫn hiện, vẫn chơi nhạc | Biến mất hoàn toàn |
| Phù hợp | Music app, content app | Admin dashboard, bank app |

Pattern Gated Content phù hợp với app nghe nhạc vì người dùng có thể vừa nghe nhạc vừa quyết định có login hay không, không bị gián đoạn trải nghiệm.

## Lộ trình tích hợp backend sau này

```
Hiện tại (mock)                        Tương lai (có Spring Boot)
─────────────────────────────────────  ─────────────────────────────────────
login(email, pw) → setUser(mockData)   login(email, pw) → POST /api/auth/login
                                       → nhận JWT → lưu localStorage
                                       → setUser(userFromApi)

logout() → setUser(null)               logout() → POST /api/auth/logout
                                       → xoá localStorage
                                       → setUser(null)

Khởi tạo: user = null                  Khởi tạo: useEffect kiểm tra token
                                       trong localStorage → gọi GET /api/users/me
                                       → setUser hoặc setNull

RequireAuth: kiểm tra isAuthenticated  RequireAuth: kiểm tra isAuthenticated
                                       (có thể thêm loading spinner khi đang
                                       gọi /api/users/me)
```

## Cấu trúc thư mục sau khi hoàn thiện

```
src/
├── contexts/
│   └── AuthContext.jsx          ← MỚI
├── components/
│   ├── Layout.jsx
│   ├── Sidebar.jsx
│   ├── MusicPlayer.jsx
│   ├── RightPanel.jsx
│   └── RequireAuth.jsx          ← MỚI
├── pages/
│   ├── LoginPage.jsx            ← SỬA: gọi login()
│   ├── SignUpPage.jsx           ← SỬA: gọi login()
│   ├── ProfilePage.jsx          ← SỬA: gọi logout()
│   ├── DiscoverPage.jsx
│   ├── RecentlyPlayedPage.jsx
│   ├── FavoritesPage.jsx
│   ├── UploadedPage.jsx
│   ├── ChartsPage.jsx
│   └── GenresPage.jsx
├── data/
│   └── mockData.js
├── main.jsx                     ← SỬA: bọc AuthProvider
├── App.jsx                      ← SỬA: bọc RequireAuth
└── index.css
```
