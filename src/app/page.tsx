'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function PWAEntryPage() {
  const { token, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (token) {
        if (user?.role === 'admin' || user?.role === 'kitchen-owner') {
          router.push('/admin');
        } else {
          router.push('/home');
        }
      } else {
        // Check if onboarding is completed
        const onboardingDone = localStorage.getItem('onboarding_completed');
        if (onboardingDone) {
          router.push('/login');
        } else {
          router.push('/onboarding');
        }
      }
    }
  }, [loading, token, user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] p-6 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
      <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">
        Loading Tiffica App...
      </h1>
      <p className="text-gray-500 font-medium">Please wait a moment.</p>
    </div>
  );
}

