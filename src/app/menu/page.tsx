import { Suspense } from 'react';
import MenuClient from './menu-client';

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Loading menu…</p></div>}>
      <MenuClient />
    </Suspense>
  );
}
