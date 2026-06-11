'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, UtensilsCrossed } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tifficaapp-1.onrender.com/api';

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    
    const body: any = {};
    if (method === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        setError('Invalid email format');
        setLoading(false);
        return;
      }
      body.email = identifier;
    } else {
      if (!/^\d{10}$/.test(identifier)) {
        setError('Invalid phone number (10 digits)');
        setLoading(false);
        return;
      }
      body.phone = identifier;
    }

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) setStep('otp');
      else setError(data.msg || 'Could not send OTP');
    } catch { setError('Connection error'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be 6 digits');
      setLoading(false);
      return;
    }

    const body: any = { otp };
    if (method === 'email') body.email = identifier;
    else body.phone = identifier;

    try {
      const res = await fetch(`${API_URL}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) setStep('reset');
      else setError(data.msg || 'Invalid OTP');
    } catch { setError('Connection error'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);

    const body: any = { otp, password };
    if (method === 'email') body.email = identifier;
    else body.phone = identifier;

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) router.push('/login');
      else setError(data.msg || 'Could not reset password');
    } catch { setError('Connection error'); }
    finally { setLoading(false); }
  };

  const steps = ['Email', 'OTP', 'New Password'];
  const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg mb-4">
            <UtensilsCrossed className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Tiffica</h1>
          <p className="text-gray-500 mt-1 text-sm">Reset your password</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= stepIndex ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < stepIndex ? 'bg-orange-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${method === 'email' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('phone')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${method === 'phone' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                >
                  Phone
                </button>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Enter your {method === 'email' ? 'email' : 'phone number'}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                We'll send you a 6-digit code to reset your password.
              </p>
              <input
                type={method === 'email' ? 'email' : 'tel'}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={method === 'email' ? 'you@example.com' : '10-digit mobile number'}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
              />
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all disabled:opacity-60">
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Enter OTP</h2>
              <p className="text-sm text-gray-500 mb-4">Enter the 6-digit code sent to <strong>{identifier}</strong></p>
              <input
                type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit OTP" required maxLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 tracking-widest text-center text-lg"
              />
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all disabled:opacity-60">
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
              <button type="button" onClick={() => setStep('email')} className="w-full text-sm text-gray-400 hover:text-orange-500 py-1">← Change {method}</button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Set new password</h2>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="New password" required minLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
              />
              <input
                type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password" required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
              />
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all disabled:opacity-60">
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link href="/login" className="text-orange-500 font-semibold hover:underline">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

