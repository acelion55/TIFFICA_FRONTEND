import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ScheduleClient from './schedule-client';

export default function SchedulePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F5]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    }>
      <ScheduleClient />
    </Suspense>
  );
}
