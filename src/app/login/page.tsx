'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Download, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Mode = 'mobile-password' | 'email-otp';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('mobile-password');
  const [mobile, setMobile] = useState('');
  const [mobilePass, setMobilePass] = useState('');
  const [showMobilePass, setShowMobilePass] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');
  const [showLegal, setShowLegal] = useState(false);
  const [legalContent, setLegalContent] = useState<{ terms: string; privacy: string }>({ terms: '', privacy: '' });
  const router = useRouter();
  const { login } = useAuth();
  const { canInstall, install } = usePWAInstall();

  const handleModeChange = (newMode: Mode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setError('');
    setInfo('');
    setOtpSent(false);
    setOtp('');
  };

  const handleSendOtp = async () => {
    if (!otpEmail) { setError('Enter your email first'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail)) {
      setError('Invalid email format');
      return;
    }
    setError(''); setInfo(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-email-otp`, {
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
    if (!/^\d{8}$/.test(otp)) {
      setError('OTP must be 8 digits');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/login-email-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp }),
      });
      const data = await res.json();
      if (res.ok) { 
        await login(data.token);
        // Role-based redirect
        if (data.role === 'delivery') {
          router.push('/delivery-partner/dashboard');
        } else if (data.role === 'admin') {
          router.push('/admin');
        } else if (data.role === 'kitchen-owner') {
          router.push('/admin');
        } else {
          router.push('/home');
        }
      }
      else setError(data.msg || 'Invalid or expired OTP');
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-950">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />

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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🍱</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Tiffica</h1>
          </div>
          <p className="text-white/60 text-sm font-medium">Fresh home-cooked meals, delivered daily</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex bg-white/10 rounded-2xl p-1 mb-5 relative overflow-hidden">
            <motion.div
              className="absolute inset-y-1 bg-white rounded-xl shadow"
              initial={false}
              animate={{
                left: mode === 'mobile-password' ? '4px' : '50%',
                right: mode === 'mobile-password' ? '50%' : '4px'
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
            />
            {(['mobile-password', 'email-otp'] as Mode[]).map(m => (
              <button key={m} onClick={() => handleModeChange(m)}
                className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors duration-200 ${
                  mode === m ? 'text-orange-600' : 'text-white/70'
                }`}>
                {m === 'mobile-password' ? '📱 Mobile' : '📧 Email OTP'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-red-500/20 border border-red-400/30 text-red-200 text-xs rounded-2xl px-4 py-2.5 overflow-hidden"
              >
                {error}
              </motion.div>
            )}
            {info && !error && (
              <motion.div 
                key="info"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-green-500/20 border border-green-400/30 text-green-200 text-xs rounded-2xl px-4 py-2.5 overflow-hidden"
              >
                ✅ {info}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            layout
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {mode === 'mobile-password' ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setError(''); setLoading(true);
                      if (!mobile || !mobilePass) { setError('Mobile and password required'); setLoading(false); return; }
                      if (!/^\d{10}$/.test(mobile)) { setError('Invalid mobile number'); setLoading(false); return; }
                      if (mobilePass.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
                      try {
                        const res = await fetch(`${API_URL}/auth/login-mobile`, {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone: mobile, password: mobilePass }),
                        });
                        const data = await res.json();
                        if (res.ok) { 
                          await login(data.token);
                          // Role-based redirect
                          if (data.role === 'delivery') {
                            router.push('/delivery-partner/dashboard');
                          } else if (data.role === 'admin') {
                            router.push('/admin');
                          } else if (data.role === 'kitchen-owner') {
                            router.push('/admin');
                          } else {
                            router.push('/home');
                          }
                        }
                        else setError(data.msg || 'Invalid credentials');
                      } catch { setError('Cannot connect to server.'); }
                      finally { setLoading(false); }
                    }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3 bg-white border border-white/20 rounded-2xl px-4 py-3">
                      <span className="text-gray-400 text-sm flex-shrink-0">📱</span>
                      <input type="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Mobile number" required
                        className="flex-1 bg-transparent text-black text-sm placeholder:text-gray-400 focus:outline-none" />
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-white/20 rounded-2xl px-4 py-3">
                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input type={showMobilePass ? 'text' : 'password'} value={mobilePass} onChange={e => setMobilePass(e.target.value)}
                        placeholder="Password" required
                        className="flex-1 bg-transparent text-black text-sm placeholder:text-gray-400 focus:outline-none" />
                      <button type="button" onClick={() => setShowMobilePass(v => !v)}>
                        {showMobilePass ? <EyeOff className="w-4 h-4 text-white/40" /> : <Eye className="w-4 h-4 text-white/40" />}
                      </button>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading || !mobile || !mobilePass || mobile.length !== 10 || mobilePass.length < 6}
                      className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Login</span><ArrowRight className="w-4 h-4" /></>}
                    </motion.button>
                    <div className="text-right">
                      <Link href="/forgot-password" className="text-xs text-orange-300 hover:text-orange-200 font-bold transition">
                        Forgot Password?
                      </Link>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={handleOtpLogin}
                    className="space-y-3"
                  >
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-3 bg-white border border-white/20 rounded-2xl px-4 py-3">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input type="email" value={otpEmail} onChange={e => setOtpEmail(e.target.value)}
                          placeholder="Email address" required disabled={otpSent}
                          className="flex-1 bg-transparent text-black text-sm placeholder:text-gray-400 focus:outline-none disabled:opacity-60" />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpSent || loading || !otpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail)}
                        className="px-4 bg-orange-500 text-white text-xs font-extrabold rounded-2xl disabled:opacity-50 transition whitespace-nowrap disabled:cursor-not-allowed"
                      >
                        {loading && !otpSent ? <Loader2 className="w-4 h-4 animate-spin" /> : otpSent ? '✓' : 'Send'}
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {otpSent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                          className="flex items-center gap-2 overflow-hidden"
                        >
                          {[0,1,2,3,4,5,6,7].map(i => (
                            <motion.input
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              type="text"
                              maxLength={1}
                              value={otp[i] || ''}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, '');
                                const arr = otp.split('');
                                arr[i] = val;
                                setOtp(arr.join('').slice(0, 8));
                                if (val && e.target.nextElementSibling) (e.target.nextElementSibling as HTMLInputElement).focus();
                              }}
                              className="flex-1 h-12 bg-white border border-white/20 rounded-xl text-black text-center text-lg font-black focus:outline-none focus:border-orange-400 transition"
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!otpSent || otp.length < 8 || loading}
                      className="w-full py-3.5 bg-orange-500 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Verify & Login</span><ArrowRight className="w-4 h-4" /></>}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <p className="text-center text-xs text-white/50 mt-5">
            No account?{' '}
            <Link href="/signup" className="text-orange-300 font-bold">Create one free →</Link>
          </p>
        </motion.div>

        <p className="text-center text-xs text-white/30 mt-4 pb-6">
          By continuing you agree to our{' '}
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
