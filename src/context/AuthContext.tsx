'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '@/lib/config';

// Compute effective API URL at runtime. When running on localhost,
// prefer a local backend fallback so dev works without requiring .env files.
const getEffectiveApiUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    if (isLocalhost) {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || API_URL;
};
const EFFECTIVE_API_URL = getEffectiveApiUrl();

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  walletBalance?: number;
  addresses?: any[];
  kitchenId?: string;
  assignedKitchen?: string;
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

      const res = await fetch(`${EFFECTIVE_API_URL}/auth/profile`, {
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

        fetch(`${EFFECTIVE_API_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${stored}` },
          signal: controller.signal,
        }).then(async res => {
          clearTimeout(timeoutId);
          // Only treat 401/403 as definitive invalid token — other errors may be transient
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            stopPing();
          } else if (res.ok) {
            try {
              const fresh = await res.json();
              // update stored user with fresh profile
              setUser(fresh);
              localStorage.setItem('user', JSON.stringify(fresh));
            } catch (e) {
              console.warn('Failed to parse profile response', e);
            }
          } else {
            // Server error or other non-auth response — keep local state
            console.warn('Profile verification returned non-auth status', res.status);
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
    fetch(`${EFFECTIVE_API_URL}/admin/ping`, { method: 'POST', headers: { Authorization: `Bearer ${t}` } }).catch(() => {});
    pingInterval = setInterval(() => {
      fetch(`${EFFECTIVE_API_URL}/admin/ping`, { method: 'POST', headers: { Authorization: `Bearer ${t}` } }).catch(() => {});
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
