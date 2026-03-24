'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Download, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Mode = 'password' | 'otp';

export default function LoginPage() {
  const [mode, setMode]         = useState<Mode>('password');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp]           = useState('');
  const [otpSent, setOtpSent]   = useState(false);
  const [error, setError]       = useState('');
  const [info, setInfo]         = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { canInstall, install } = usePWAInstall();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await login(data.token);
        // Redirect admin to dashboard
        if (email === 'admin@gmail.com') router.push('/admin');
        else router.push('/home');
      }
      else setError(data.msg || 'Invalid email or password');
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    if (!otpEmail) { setError('Enter your email first'); return; }
    setError(''); setInfo(''); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/send-email-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (res.ok) { setOtpSent(true); setInfo('OTP sent to your email'); }
      else setError(data.msg || 'Could not send OTP');
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/login-email-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp }),
      });
      const data = await res.json();
      if (res.ok) { await login(data.token); router.push('/home'); }
      else setError(data.msg || 'Invalid or expired OTP');
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-950">

      {/* Background food image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop')` }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />

      {/* PWA install banner */}
      {canInstall && (
        <div className="relative z-10 mx-4 mt-12">
          <button onClick={install}
            className="w-full flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/20 text-white rounded-2xl px-4 py-3">
            <Download className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-bold flex-1 text-left">Install Tiffica App</span>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-xl font-bold">Install</span>
          </button>
        </div>
      )}

      {/* Top branding */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🍱</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Tiffica</h1>
          </div>
          <p className="text-white/60 text-sm font-medium">Fresh home-cooked meals, delivered daily</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">

          {/* Tab switcher */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-5">
            {(['password', 'otp'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setInfo(''); setOtpSent(false); setOtp(''); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  mode === m ? 'bg-white text-orange-600 shadow' : 'text-white/70'
                }`}>
                {m === 'password' ? '🔐 Password' : '📧 OTP'}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-200 text-xs rounded-2xl px-4 py-2.5 mb-4">{error}</div>
          )}
          {info && !error && (
            <div className="bg-green-500/20 border border-green-400/30 text-green-200 text-xs rounded-2xl px-4 py-2.5 mb-4">✅ {info}</div>
          )}

          {/* Password form */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-3">
              <div className="flex items-center gap-3 bg-white border border-white/20 rounded-2xl px-4 py-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email address" required
                  className="flex-1 bg-transparent text-black text-sm placeholder:text-gray-400 focus:outline-none" />
              </div>
              <div className="flex items-center gap-3 bg-white border border-white/20 rounded-2xl px-4 py-3">
                <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required
                  className="flex-1 bg-transparent text-black text-sm placeholder:text-gray-400 focus:outline-none" />
                <button type="button" onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff className="w-4 h-4 text-white/40" /> : <Eye className="w-4 h-4 text-white/40" />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs text-orange-300 font-semibold">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Login</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* OTP form */}
          {mode === 'otp' && (
            <form onSubmit={handleOtpLogin} className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-3 bg-white border border-white/20 rounded-2xl px-4 py-3">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input type="email" value={otpEmail} onChange={e => setOtpEmail(e.target.value)}
                    placeholder="Email address" required disabled={otpSent}
                    className="flex-1 bg-transparent text-black text-sm placeholder:text-gray-400 focus:outline-none disabled:opacity-60" />
                </div>
                <button type="button" onClick={handleSendOtp} disabled={otpSent || loading}
                  className="px-4 bg-orange-500 text-white text-xs font-extrabold rounded-2xl disabled:opacity-50 active:scale-95 transition whitespace-nowrap">
                  {loading && !otpSent ? <Loader2 className="w-4 h-4 animate-spin" /> : otpSent ? '✓' : 'Send'}
                </button>
              </div>

              {otpSent && (
                <div className="flex items-center gap-2">
                  {[0,1,2,3,4,5].map(i => (
                    <input key={i} type="text" maxLength={1}
                      value={otp[i] || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        const arr = otp.split('');
                        arr[i] = val;
                        setOtp(arr.join('').slice(0, 6));
                        if (val && e.target.nextElementSibling) (e.target.nextElementSibling as HTMLInputElement).focus();
                      }}
                      className="flex-1 h-12 bg-white border border-white/20 rounded-xl text-black text-center text-lg font-black focus:outline-none focus:border-orange-400 transition"
                    />
                  ))}
                </div>
              )}

              <button type="submit" disabled={!otpSent || otp.length < 6 || loading}
                className="w-full py-3.5 bg-orange-500 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Verify & Login</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-white/50 mt-5">
            No account?{' '}
            <Link href="/signup" className="text-orange-300 font-bold">Create one free →</Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/30 mt-4 pb-6">
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
