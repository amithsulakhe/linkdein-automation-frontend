import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem('accessToken');
        if (stored) setAccessToken(stored);
        const res = await api.get('/auth/me');
        setUser(res.data.data.user);
      } catch {
        setUser(null);
        localStorage.removeItem('accessToken');
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email, password) {
        const res = await api.post('/auth/login', { email, password });
        const token = res.data.data.accessToken;
        localStorage.setItem('accessToken', token);
        setAccessToken(token);
        setUser(res.data.data.user);
      },
      async register(email, password, displayName) {
        const res = await api.post('/auth/register', { email, password, displayName });
        const token = res.data.data.accessToken;
        localStorage.setItem('accessToken', token);
        setAccessToken(token);
        setUser(res.data.data.user);
      },
      async logout() {
        await api.post('/auth/logout');
        localStorage.removeItem('accessToken');
        setAccessToken(null);
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
