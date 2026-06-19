'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Eye, EyeOff, Lock, ArrowRight, Download, Loader2, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tifficaapp-1.onrender.com/api';

export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');
  const [showLegal, setShowLegal] = useState(false);
  const [legalContent, setLegalContent] = useState<{ terms: string; privacy: string }>({ terms: '', privacy: '' });
  
  const router = useRouter();
  const { login, user, token, loading: authLoading } = useAuth();
  const { canInstall, install } = usePWAInstall();

  // If auth state is rehydrating, don't render the login form (avoids flash)
  useEffect(() => {
    if (!authLoading && token && user) {
      if (user.role === 'delivery') router.replace('/delivery-partner/dashboard');
      else if (user.role === 'admin' || user.role === 'kitchen-owner') router.replace('/admin');
      else router.replace('/home');
    }
  }, [user, token, authLoading, router]);

  if (authLoading) return null;

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (!loginId || !password) { setError('ID and password required'); setLoading(false); return; }
    try {
      // Normalize phone-like identifiers: strip non-digits and use last 10 digits
      let identifierToSend = loginId;
      const looksLikePhone = /^[+\d\s()-]+$/.test(loginId) && !loginId.includes('@');
      if (looksLikePhone) {
        const digits = loginId.replace(/\D/g, '');
        identifierToSend = digits.length > 10 ? digits.slice(-10) : digits;
      }

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifierToSend, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await login(data.token);
        if (data.role === 'delivery') router.push('/delivery-partner/dashboard');
        else if (data.role === 'admin' || data.role === 'kitchen-owner') router.push('/admin');
        else router.push('/home');
      } else {
        setError(data.msg || 'Invalid credentials');
      }
    } catch (err) {
      setError('Cannot connect to server.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black font-sans">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transform-gpu blur-sm"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/30 to-rose-900/30 mix-blend-multiply" />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-orange-600/30 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-40 -left-20 w-80 h-80 bg-rose-600/20 rounded-full blur-[100px]"
        />
      </div>

      {canInstall && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-20 mx-4 mt-8"
        >
          <button onClick={install}
            className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/10 text-white rounded-3xl px-5 py-3.5 transition-all shadow-xl">
            <div className="p-2 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl">
              <Download className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold flex-1 text-left tracking-wide">Install Tiffica App</span>
            <span className="text-xs bg-white/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">Get App</span>
          </button>
        </motion.div>
      )}

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-10 w-full max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }}
          className="text-center mb-8"
        >
          <div className="inline-block p-1 bg-white/10 rounded-3xl backdrop-blur-xl mb-4 border border-white/5 shadow-2xl">
            <img 
              src="/logo.jpeg" 
              alt="Tiffica Logo" 
              className="w-16 h-16 rounded-2xl object-cover shadow-inner"
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-white/60 text-sm font-medium">Log in to get fresh, home-cooked meals</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] as any }}
          className="bg-gray-900/50 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
          
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                </div>
                <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)}
                  placeholder="Phone, Email or Name" required
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all" />
              </div>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                </div>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all" />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pb-2">
              <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !loginId || password.length < 6}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-bold rounded-2xl shadow-[0_0_40px_-10px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Login to Account <ArrowRight className="w-4 h-4 ml-1" /></>}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8 relative z-10">
            Don't have an account?{' '}
            <Link href="/signup" className="text-white font-semibold hover:text-orange-400 transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>

        <p className="text-center text-xs text-gray-500 mt-8">
          By logging in, you agree to our{' '}
          <button 
            disabled={loading}
            onClick={async () => {
              if (!legalContent.terms) {
                setLoading(true);
                try {
                  const res = await fetch(`${API_URL}/legalpages`).catch(() => null);
                  const d = res?.ok ? await res.json() : null;
                  if (d?.success) {
                    const t = d.data.find((p: any) => p.pageType === 'terms');
                    const pr = d.data.find((p: any) => p.pageType === 'privacy');
                    setLegalContent({ terms: t?.content || '', privacy: pr?.content || '' });
                  }
                } finally {
                  setLoading(false);
                }
              }
              setShowLegal(true);
            }} 
            className="text-gray-400 hover:text-white transition-colors underline underline-offset-2 disabled:opacity-50"
          >
            Terms & Privacy Policy
          </button>
        </p>
      </div>

      <AnimatePresence>
        {showLegal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLegal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex bg-black/40 rounded-xl p-1 gap-1 border border-white/5">
                  {(['terms', 'privacy'] as const).map(t => (
                    <button key={t} onClick={() => setLegalTab(t)}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        legalTab === t ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
                      }`}>
                      {t === 'terms' ? 'Terms' : 'Privacy'}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowLegal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition">
                  <X size={18} className="text-gray-400 hover:text-white" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {legalTab === 'terms'
                    ? (legalContent.terms || `By using Tiffica, you agree to these terms. We provide home-cooked meal delivery services. Orders once placed cannot be cancelled after preparation begins. Payments are non-refundable except in case of delivery failure.`)
                    : (legalContent.privacy || `We collect your name, email, phone, and location to deliver meals. Your data is never sold to third parties. You may request deletion of your account at any time.`)
                  }
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
