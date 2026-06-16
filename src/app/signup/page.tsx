'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, X, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tifficaapp-1.onrender.com/api';

export default function SignUpPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [googleSignupToken, setGoogleSignupToken] = useState('');
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');
  const [showLegal, setShowLegal] = useState(false);
  const [legalContent, setLegalContent] = useState<{ terms: string; privacy: string }>({ terms: '', privacy: '' });
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const pendingGoogleSignup = sessionStorage.getItem('googleSignup');
    if (!pendingGoogleSignup) return;

    try {
      const data = JSON.parse(pendingGoogleSignup);
      if (data.signupToken && data.profile) {
        setGoogleSignupToken(data.signupToken);
        setName(data.profile.name || '');
        setEmail(data.profile.email || '');
      }
    } catch {
      sessionStorage.removeItem('googleSignup');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const endpoint = googleSignupToken ? '/auth/google/complete' : '/auth/register';
      const body = googleSignupToken
        ? { signupToken: googleSignupToken, phone }
        : { name, email, phone, password };
      const res  = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.removeItem('googleSignup');
        await login(data.token);
        router.push('/onboarding');
      }
      else setError(data.msg || 'Registration failed. Please try again.');
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleGoogleLogin = async (credential: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        await login(data.token);
        if (data.role === 'delivery') router.push('/delivery-partner/dashboard');
        else if (data.role === 'admin' || data.role === 'kitchen-owner') router.push('/admin');
        else router.push('/home');
      } else if (res.ok && data.requiresPhone && data.signupToken) {
        sessionStorage.setItem('googleSignup', JSON.stringify({
          signupToken: data.signupToken,
          profile: data.profile,
        }));
        setGoogleSignupToken(data.signupToken);
        setName(data.profile.name || '');
        setEmail(data.profile.email || '');
      } else {
        setError(data.msg || 'Google sign-up failed. Please try again.');
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black font-sans">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transform-gpu blur-sm"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-orange-900/30 to-amber-900/30 mix-blend-multiply" />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 -right-40 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-10 w-full max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }}
          className="text-center mb-8"
        >
          <div className="inline-block p-1 bg-white/10 rounded-3xl backdrop-blur-xl mb-4 border border-white/5 shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-inner">
              <UtensilsCrossed className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create Account</h1>
          <p className="text-white/60 text-sm font-medium">Join thousands who love home-cooked meals</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] as any }}
          className="bg-gray-900/50 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0, marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, y: -10, marginBottom: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl px-4 py-3 flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                </div>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Full Name" required disabled={Boolean(googleSignupToken)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all disabled:opacity-60" />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email Address" required disabled={Boolean(googleSignupToken)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all disabled:opacity-60" />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                </div>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Phone Number" required
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all" />
              </div>

              {!googleSignupToken && <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                </div>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Create Password" required minLength={6}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all" />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || phone.length !== 10 || (!googleSignupToken && password.length < 6)}
              className="w-full py-4 mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold rounded-2xl shadow-[0_0_40px_-10px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{googleSignupToken ? 'Finish Google Sign Up' : 'Complete Sign Up'} <ArrowRight className="w-4 h-4 ml-1" /></>}
            </motion.button>
          </form>

          {!googleSignupToken && (
            <>
              <div className="relative flex items-center gap-4 my-6">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <GoogleSignInButton
                disabled={loading}
                onCredential={handleGoogleLogin}
                onUnavailable={() => setError('Google sign-in needs NEXT_PUBLIC_GOOGLE_CLIENT_ID to be configured.')}
              />
            </>
          )}

          <p className="text-center text-sm text-gray-400 mt-8 relative z-10">
            Already have an account?{' '}
            <Link href="/login" className="text-white font-semibold hover:text-orange-400 transition-colors">
              Log in
            </Link>
          </p>
        </motion.div>

        <p className="text-center text-xs text-gray-500 mt-8">
          By signing up, you agree to our{' '}
          <button onClick={() => setShowLegal(true)} className="text-gray-400 hover:text-white transition-colors underline underline-offset-2">
            Terms & Privacy Policy
          </button>
        </p>
      </div>

      {/* Legal Modal */}
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
