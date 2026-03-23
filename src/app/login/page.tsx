'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Mode = 'password' | 'emailOtp';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('password');

  // Password login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email OTP login
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) { await login(data.token); router.push('/home'); }
      else setError(data.msg || 'Invalid email or password');
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  const handleSendEmailOtp = async () => {
    if (!otpEmail) { setError('Enter your email first'); return; }
    setError(''); setInfo(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (res.ok) { setOtpSent(true); setInfo(`OTP sent to ${otpEmail}`); }
      else setError(data.msg || 'Could not send OTP');
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  const handleEmailOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp }),
      });
      const data = await res.json();
      if (res.ok) { await login(data.token); router.push('/home'); }
      else setError(data.msg || 'Invalid or expired OTP');
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  const switchMode = (m: Mode) => {
    setMode(m); setError(''); setInfo(''); setOtpSent(false); setOtp('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg mb-3">
            <span className="text-3xl">🍱</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Tiffica</h1>
          <p className="text-gray-400 text-sm mt-1">Fresh tiffin meals, delivered daily</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Welcome back 👋</h2>

          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => switchMode('password')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'password' ? 'bg-white shadow text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🔐 Password
            </button>
            <button
              onClick={() => switchMode('emailOtp')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'emailOtp' ? 'bg-white shadow text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📧 Email OTP
            </button>
          </div>

          {/* Error / Info */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}
          {info && !error && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
              ✅ {info}
            </div>
          )}

          {/* --- EMAIL + PASSWORD --- */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-orange-500 hover:underline">Forgot password?</Link>
                </div>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-60 mt-1"
              >
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </form>
          )}

          {/* --- EMAIL OTP --- */}
          {mode === 'emailOtp' && (
            <form onSubmit={handleEmailOtpLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="flex gap-2">
                  <input
                    type="email" value={otpEmail} onChange={e => setOtpEmail(e.target.value)}
                    placeholder="you@example.com" required
                    disabled={otpSent}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  <button
                    type="button" onClick={handleSendEmailOtp}
                    disabled={otpSent || loading}
                    className="px-4 py-3 rounded-xl text-sm font-bold bg-orange-100 text-orange-600 hover:bg-orange-200 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {loading && !otpSent ? '…' : otpSent ? '✓ Sent' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input
                    type="text" value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="6-digit OTP" required maxLength={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition text-center tracking-widest text-xl font-bold"
                    autoFocus
                  />
                </div>
              )}

              <button
                type="submit" disabled={!otpSent || loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-60 mt-1"
              >
                {loading && otpSent ? 'Verifying…' : 'Login with OTP'}
              </button>

              {otpSent && (
                <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setInfo(''); }}
                  className="w-full text-xs text-gray-400 hover:text-orange-500 py-1 transition">
                  ← Use a different email
                </button>
              )}
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-orange-500 font-semibold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
