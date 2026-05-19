import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const STORAGE_ACCESS  = 'accessToken';
const STORAGE_REFRESH = 'refreshToken';
const STORAGE_USER    = 'luxestay_user';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(response) {
  localStorage.setItem(STORAGE_ACCESS,  response.accessToken);
  localStorage.setItem(STORAGE_REFRESH, response.refreshToken);
  localStorage.setItem(STORAGE_USER, JSON.stringify({
    email:    response.email,
    fullName: response.fullName,
    role:     response.role,
  }));
}

function clearStorage() {
  localStorage.removeItem(STORAGE_ACCESS);
  localStorage.removeItem(STORAGE_REFRESH);
  localStorage.removeItem(STORAGE_USER);
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(readStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);
      persistSession(res);
      setUser({ email: res.email, fullName: res.fullName, role: res.role });
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(data);
      persistSession(res);
      setUser({ email: res.email, fullName: res.fullName, role: res.role });
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(STORAGE_REFRESH);
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch (_) {
    } finally {
      clearStorage();
      setUser(null);
    }
  }, []);

  const loginWithTokens = useCallback(({ accessToken, refreshToken, email, fullName, role }) => {
    persistSession({ accessToken, refreshToken, email, fullName, role });
    setUser({ email, fullName, role });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      loading,
      error,
      login,
      register,
      logout,
      loginWithTokens,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
