# Refactor: State-based Navigation → React Router

## Vấn đề ban đầu

App sử dụng `useState` để điều khiển hiển thị giữa các màn hình và trang. Hậu quả:

- **URL luôn là `/`** — dù người dùng đang ở trang Discover, Favorites hay Charts
- **Back/Forward trình duyệt không hoạt động** — không thể quay lại trang trước
- **Không bookmark được** — không thể lưu link `/favorites` hay `/charts`
- **Không share được link** — chỉ share được link gốc `/`

```jsx
// ❌ Cách cũ — state-based, URL không đổi
const [screen, setScreen] = useState('login');   // 'login' | 'signup' | 'app'
const [page, setPage] = useState('discover');     // 'discover' | 'favorites' | ...

if (screen === 'login') return <LoginPage onLogin={() => setScreen('app')} />
if (screen === 'signup') return <SignUpPage onSignUp={() => setScreen('app')} />
// ...
{page === 'discover' && <DiscoverPage />}
{page === 'favorites' && <FavoritesPage />}
```

## Giải pháp

Thay toàn bộ cơ chế điều hướng bằng **React Router** (thư viện `react-router-dom` v7 đã có sẵn trong `package.json`).

---

## Kiến trúc mới

```
BrowserRouter (main.jsx)
  └── Routes (App.jsx)
        ├── /login        → LoginPage
        ├── /signup       → SignUpPage
        ├── /             → Redirect → /discover
        └── Layout (wrapper route)
              ├── /discover        → DiscoverPage
              ├── /recently-played → RecentlyPlayedPage
              ├── /favorites       → FavoritesPage
              ├── /uploaded        → UploadedPage
              ├── /charts          → ChartsPage
              ├── /genres          → GenresPage
              └── /profile         → ProfilePage
```

---

## Chi tiết từng file

### 1. `src/main.jsx` — Bọc app trong BrowserRouter

Đây là bước nền tảng: `BrowserRouter` bọc toàn bộ app để React Router có thể kiểm soát URL trình duyệt.

```jsx
// ✅ Cách mới
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

**BrowserRouter làm gì?** Nó lắng nghe sự thay đổi URL của trình duyệt (thông qua History API) và thông báo cho tất cả component con bên trong biết URL hiện tại là gì, từ đó render đúng component tương ứng.

---

### 2. `src/App.jsx` — Thay state bằng Routes

Đây là file thay đổi nhiều nhất.

#### Trước — 2 lớp state + if/else lồng nhau

```jsx
const [screen, setScreen] = useState('login');  // lớp 1: auth gate
const [page, setPage] = useState('discover');    // lớp 2: navigation

// Lớp auth
if (screen === 'login') return <LoginPage onLogin={...} onSwitchToSignUp={...} />
if (screen === 'signup') return <SignUpPage onSignUp={...} onSwitchToLogin={...} />

// Lớp navigation
return (
  <Layout activePage={page} onNavigate={setPage} ...>
    {page === 'discover' && <DiscoverPage />}
    {page === 'favorites' && <FavoritesPage />}
    // ... 7 cái if nữa
  </Layout>
);
```

#### Sau — Routes phẳng, rõ ràng

```jsx
function App() {
  const [currentTrack, setCurrentTrack] = useState(newReleases[0]);
  const handlePlay = (track) => setCurrentTrack(track);

  return (
    <Routes>
      {/* Auth pages — standalone, không có Layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Layout route — bọc các trang chính bên trong */}
      <Route element={<Layout currentTrack={currentTrack} onPlay={handlePlay} />}>
        <Route path="/discover" element={<DiscoverPage onPlay={handlePlay} />} />
        <Route path="/recently-played" element={<RecentlyPlayedPage onPlay={handlePlay} />} />
        <Route path="/favorites" element={<FavoritesPage onPlay={handlePlay} />} />
        <Route path="/uploaded" element={<UploadedPage onPlay={handlePlay} />} />
        <Route path="/charts" element={<ChartsPage onPlay={handlePlay} />} />
        <Route path="/genres" element={<GenresPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Redirect gốc */}
      <Route path="/" element={<Navigate to="/discover" replace />} />
    </Routes>
  );
}
```

#### Các khái niệm quan trọng

| Khái niệm | Giải thích |
|---|---|
| `<Routes>` | Container chứa tất cả route, đảm bảo chỉ 1 route được render tại 1 thời điểm |
| `<Route path="/login" element={...} />` | Map URL `/login` → component `LoginPage` |
| **Layout Route** `<Route element={<Layout />}>` | Route không có `path` — nó bọc các route con, render `<Outlet />` thay cho children |
| `<Navigate to="/discover" replace />` | Redirect tức thì. `replace` nghĩa là không lưu vào lịch sử trình duyệt |

**Auth gate cũ biến mất** — login/signup giờ là route riêng, không cần `if (screen === 'login')` nữa.

---

### 3. `src/components/Layout.jsx` — Outlet thay children

#### Trước

```jsx
export default function Layout({ activePage, onNavigate, currentTrack, onPlay, children }) {
  return (
    <div>
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main>{children}</main>
      <RightPanel onPlay={onPlay} />
      <MusicPlayer currentTrack={currentTrack} />
    </div>
  );
}
```

#### Sau

```jsx
import { Outlet } from 'react-router-dom';

export default function Layout({ currentTrack, onPlay }) {
  return (
    <div>
      <Sidebar />                                    {/* ← không còn props */}
      <main><Outlet /></main>                         {/* ← thay cho children */}
      <RightPanel onPlay={onPlay} />
      <MusicPlayer currentTrack={currentTrack} />
    </div>
  );
}
```

**`<Outlet />` là gì?** Đây là "placeholder" của React Router. Khi Layout được dùng làm **layout route** trong `App.jsx`, `<Outlet />` sẽ tự động render component của route con đang active.

```
Người dùng vào /favorites:
  Layout render:
    ├── <Sidebar />          ← luôn hiển thị
    ├── <Outlet />           ← React Router đặt <FavoritesPage /> vào đây
    ├── <RightPanel />       ← luôn hiển thị
    └── <MusicPlayer />      ← luôn hiển thị

Người dùng vào /charts:
  Layout render:
    ├── <Sidebar />          ← vẫn hiển thị
    ├── <Outlet />           ← React Router đặt <ChartsPage /> vào đây
    ├── <RightPanel />       ← vẫn hiển thị
    └── <MusicPlayer />      ← vẫn hiển thị
```

**Lợi ích:** Sidebar, RightPanel, MusicPlayer chỉ render 1 lần trong Layout, không bị unmount/remount mỗi khi chuyển trang. Chỉ có `<Outlet />` thay đổi nội dung.

---

### 4. `src/components/Sidebar.jsx` — NavLink + isActive

Đây là file thay đổi cách hoạt động rõ nhất.

#### Trước — onClick + prop

```jsx
export default function Sidebar({ activePage, onNavigate }) {
  return navItems.map(({ id, label }) => {
    const active = activePage === id;           // ← so sánh thủ công
    return (
      <button onClick={() => onNavigate(id)}     // ← callback cha truyền xuống
              className={active ? 'active' : ''}>
        {label}
      </button>
    );
  });
}
```

#### Sau — NavLink + tự động so khớp URL

```jsx
export default function Sidebar() {
  return navItems.map(({ id, to, label }) => (
    <NavLink
      to={to}                                    // ← URL đích
      end                                        // ← chỉ active khi khớp chính xác
      className={({ isActive }) =>               // ← callback từ router
        isActive ? 'bg-white/10 text-white' : 'text-white/60'
      }
    >
      {({ isActive }) => (
        <Icon className={isActive ? 'text-purple-400' : 'text-white/40'} />
        {label}
      )}
    </NavLink>
  ));
}
```

#### So sánh NavLink vs button

| | `button` + `onClick` (cũ) | `NavLink` (mới) |
|---|---|---|
| URL thay đổi? | ❌ Không | ✅ Có, lên `/favorites` |
| Back/Forward? | ❌ Không | ✅ Có |
| Active state | So sánh thủ công `activePage === id` | Tự động từ router qua `isActive` |
| Cần props? | Cần `onNavigate` + `activePage` | Không cần gì |
| Bookmark được? | ❌ | ✅ |

**`end` prop:** Đảm bảo `/discover` chỉ active khi URL chính xác là `/discover`, không active cho `/discover/something-else`.

---

### 5. `LoginPage.jsx` & `SignUpPage.jsx` — useNavigate + Link

#### Trước — callback props

```jsx
export default function LoginPage({ onLogin, onSwitchToSignUp }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();                    // ← gọi callback props từ App
  };
  // ...
  <button onClick={onSwitchToSignUp}>Sign up</button>   // ← callback props
}
```

#### Sau — hook + Link

```jsx
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/discover');        // ← điều hướng trực tiếp bằng URL
  };
  // ...
  <Link to="/signup">Sign up</Link>   // ← thẻ <a> chuẩn, trình duyệt hiểu được
}
```

**`useNavigate()` vs callback:**
- Callback `onLogin()` chỉ set state → không đổi URL
- `navigate('/discover')` thay đổi URL thật → trình duyệt ghi nhận vào history

**`<Link>` vs `<button onClick={...}>`:**
- `<Link to="/signup">` render ra thẻ `<a href="/signup">` thật
- Trình duyệt hiểu đây là link → chuột phải "Open in new tab" hoạt động
- `<button onClick={onSwitchToSignUp}>` chỉ là button → không có URL

---

### 6. `ProfilePage.jsx` — useNavigate cho Sign Out

#### Trước

```jsx
export default function ProfilePage({ onLogout }) {
  // ...
  <button onClick={onLogout}>Sign Out</button>
}
```

#### Sau

```jsx
export default function ProfilePage() {
  const navigate = useNavigate();
  // ...
  <button onClick={() => navigate('/login')}>Sign Out</button>
}
```

---

## Tổng kết: props đã bị loại bỏ

| Props | Xuất hiện ở đâu | Thay bằng |
|---|---|---|
| `screen` + `setScreen` | `App.jsx` useState | Không cần, route `/login` và `/signup` thay thế |
| `page` + `setPage` | `App.jsx` useState | Không cần, mỗi route có path riêng |
| `activePage` | `Layout` → `Sidebar` | `isActive` từ `<NavLink>` |
| `onNavigate` | `Layout` → `Sidebar` | Thuộc tính `to` của `<NavLink>` |
| `onLogin` | `App` → `LoginPage` | `useNavigate()` trong LoginPage |
| `onSwitchToSignUp` | `App` → `LoginPage` | `<Link to="/signup">` |
| `onSignUp` | `App` → `SignUpPage` | `useNavigate()` trong SignUpPage |
| `onSwitchToLogin` | `App` → `SignUpPage` | `<Link to="/login">` |
| `onLogout` | `App` → `ProfilePage` | `useNavigate()` trong ProfilePage |
| `children` | `App` → `Layout` | `<Outlet />` từ react-router |

---

## Lợi ích sau refactor

1. **URL có ý nghĩa** — `/discover`, `/favorites`, `/charts`... thay vì chỉ `/`
2. **Back/Forward hoạt động** — người dùng có thể dùng nút điều hướng của trình duyệt
3. **Bookmark được** — lưu trực tiếp `/favorites` vào bookmark
4. **Share được link** — gửi link `/charts` cho bạn bè
5. **Open in new tab** — chuột phải vào link sidebar mở tab mới được
6. **Code sạch hơn** — không còn state lồng state, không còn truyền callback qua nhiều tầng component
7. **Tách biệt trách nhiệm** — mỗi page component tự xử lý điều hướng của nó, không phụ thuộc vào component cha
