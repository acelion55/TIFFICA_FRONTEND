'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import ProfileFlyout from '@/components/profile-flyout';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some(r => pathname?.startsWith(r));

  return (
    <>
      {!isAuthRoute && <ProfileFlyout />}
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">{children}</main>
        {!isAuthRoute && <Navbar />}
      </div>
    </>
  );
}
