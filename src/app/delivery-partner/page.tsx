'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryAuth } from '@/context/DeliveryAuthContext';
import { Loader2 } from 'lucide-react';

export default function DeliveryPartnerPage() {
  const router = useRouter();
  const { partner, token, loading } = useDeliveryAuth();

  useEffect(() => {
    if (!loading) {
      if (partner && token) {
        router.push('/delivery-partner/dashboard');
      } else {
        router.push('/login?role=delivery');
      }
    }
  }, [partner, token, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">🚴</span>
        </div>
        <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
        <p className="text-white font-semibold mt-4">Redirecting...</p>
      </div>
    </div>
  );
}
