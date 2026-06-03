'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function ScheduleMenuRedirect() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const date = params.get('date');
    const mealType = params.get('mealType');
    const q = new URLSearchParams();
    if (mealType) q.set('meal', mealType);
    if (date) q.set('date', date);
    const query = q.toString();
    router.replace(`/schedule${query ? `?${query}` : ''}`);
  }, [router, params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F5]">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  );
}

/** Redirect legacy /schedule/menu links to the main schedule page */
export default function ScheduleMenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F5]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    }>
      <ScheduleMenuRedirect />
    </Suspense>
  );
}
