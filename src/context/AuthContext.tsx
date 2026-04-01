'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setToken(t);
        setUser(data);
        startPing(t);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
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
