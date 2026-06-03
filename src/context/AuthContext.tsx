'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '@/lib/config';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  walletBalance?: number;
  addresses?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (t: string) => {
    localStorage.setItem('token', t);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${t}` },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        setToken(t);
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        startPing(t);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
      // If backend is down, still set the token locally for offline mode
      if (e instanceof Error && (e.name === 'AbortError' || !navigator.onLine)) {
        // Keep token, allow offline mode
        setToken(t);
        setLoading(false);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (stored && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(stored);
        setUser(parsedUser);
        setLoading(false);
        startPing(stored);
        
        // Verify token in background with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        fetch(`${API_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${stored}` },
          signal: controller.signal,
        }).then(res => {
          clearTimeout(timeoutId);
          if (!res.ok) {
            // Token invalid, logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            stopPing();
          }
        }).catch((err) => {
          clearTimeout(timeoutId);
          // Network error or timeout - keep local state
          console.log('Profile verification failed:', err);
        });
      } catch {
        login(stored);
      }
    } else if (stored) {
      login(stored);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    stopPing();
  };

  // Ping every 60s so admin can see live users
  let pingInterval: ReturnType<typeof setInterval> | null = null;

  const startPing = (t: string) => {
    stopPing();
    fetch(`${API_URL}/admin/ping`, { method: 'POST', headers: { Authorization: `Bearer ${t}` } }).catch(() => {});
    pingInterval = setInterval(() => {
      fetch(`${API_URL}/admin/ping`, { method: 'POST', headers: { Authorization: `Bearer ${t}` } }).catch(() => {});
    }, 60000);
  };

  const stopPing = () => {
    if (pingInterval) { clearInterval(pingInterval); pingInterval = null; }
  };

  const updateUser = (u: User) => setUser(u);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
