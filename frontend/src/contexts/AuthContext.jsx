import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as loginApi, register as registerApi, getMe, updateMe } from '@/api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);   // true để check token khi app load
  const [error, setError] = useState(null);

  // Khi app load, kiểm tra token → tự động lấy thông tin user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((userData) => setUser(userData))
        .catch(() => {
          // Token hết hạn hoặc không hợp lệ
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { user: userData, token } = await loginApi(email, password);
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ email, password, fullName, birth }) => {
    setLoading(true);
    setError(null);
    try {
      const { user: userData, token } = await registerApi({ email, password, fullName, birth });
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Đăng ký thất bại';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async ({ fullName, birth }) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await updateMe({ fullName, birth });
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Cập nhật thất bại';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, error, login, register, logout, updateProfile, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
