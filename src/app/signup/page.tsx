'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Download, Loader2, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

export default function SignUpPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');
  const [showLegal, setShowLegal] = useState(false);
  const [legalContent, setLegalContent] = useState<{ terms: string; privacy: string }>({ terms: '', privacy: '' });
  const router = useRouter();
  const { login } = useAuth();
  const { canInstall, install } = usePWAInstall();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (res.ok) { await login(data.token); router.push('/onboarding'); }
      else setError(data.msg || 'Something went wrong');
    } catch { setError('Connection error. Is the server running?'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-950">

      {/* Background food image — different from login */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/85" />

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

      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 py-8">

        {/* Branding */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🍱</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Tiffica</h1>
          </div>
          <p className="text-white/60 text-sm font-medium">Join thousands who love home-cooked meals</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">

          <h2 className="text-lg font-extrabold text-white mb-4">Create your account ✨</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-200 text-xs rounded-2xl px-4 py-2.5 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Name */}
            <div className="flex items-center gap-3 bg-white border border-white/20 rounded-2xl px-4 py-3">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Full name" required
                className="flex-1 bg-transparent text-black text-sm placeholder:text-gray-400 focus:outline-none" />
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 bg-white border border-white/20 rounded-2xl px-4 py-3">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" required
                className="flex-1 bg-transparent text-black text-sm placeholder:text-gray-400 focus:outline-none" />
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 bg-white border border-white/20 rounded-2xl px-4 py-3">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Phone number" required
                className="flex-1 bg-transparent text-black text-sm placeholder:text-gray-400 focus:outline-none" />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 bg-white border border-white/20 rounded-2xl px-4 py-3">
              <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Create password" required minLength={6}
                className="flex-1 bg-transparent text-black text-sm placeholder:text-gray-400 focus:outline-none" />
              <button type="button" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60 mt-1">
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs text-white/50 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-300 font-bold">Login →</Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/30 mt-4 pb-6">
          By signing up you agree to our{' '}
          <button onClick={async () => {
            if (!legalContent.terms) {
              const res = await fetch(`${API_URL}/legalpages`).catch(() => null);
              const d = res?.ok ? await res.json() : null;
              if (d?.success) {
                const t = d.data.find((p: any) => p.pageType === 'terms');
                const pr = d.data.find((p: any) => p.pageType === 'privacy');
                setLegalContent({ terms: t?.content || '', privacy: pr?.content || '' });
              }
            }
            setShowLegal(true);
          }} className="text-white/50 underline">Terms &amp; Privacy Policy</button>
        </p>
      </div>

      {/* Legal Modal */}
      {showLegal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" onClick={() => setShowLegal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-2xl max-h-[75vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex bg-white/10 rounded-2xl p-1 gap-1">
                {(['terms', 'privacy'] as const).map(t => (
                  <button key={t} onClick={() => setLegalTab(t)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      legalTab === t ? 'bg-white text-orange-600 shadow' : 'text-white/70'
                    }`}>
                    {t === 'terms' ? 'Terms' : 'Privacy'}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowLegal(false)} className="p-1.5 bg-white/10 rounded-xl">
                <X size={16} className="text-white" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 pr-1">
              <p className="text-white/80 text-xs leading-relaxed whitespace-pre-wrap">
                {legalTab === 'terms'
                  ? (legalContent.terms || `By using Tiffica, you agree to these terms. We provide home-cooked meal delivery services. Orders once placed cannot be cancelled after preparation begins. Payments are non-refundable except in case of delivery failure.`)
                  : (legalContent.privacy || `We collect your name, email, phone, and location to deliver meals. Your data is never sold to third parties. You may request deletion of your account at any time.`)
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
