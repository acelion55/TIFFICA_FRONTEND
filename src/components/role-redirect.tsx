'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RoleRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    
    // Skip redirect for login/signup pages
    if (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/onboarding') {
      return;
    }

    if (user) {
      const isAdmin = user.role === 'admin' || user.role === 'kitchen-owner';
      const isOnAdminPage = pathname?.startsWith('/admin');
      const isOnUserPage = !isOnAdminPage && pathname !== '/login' && pathname !== '/signup';

      // Admin trying to access user pages -> redirect to admin
      if (isAdmin && isOnUserPage) {
        router.replace('/admin');
      }
      
      // Regular user trying to access admin pages -> redirect to home
      if (!isAdmin && isOnAdminPage) {
        router.replace('/home');
      }
    }
  }, [user, loading, pathname, router]);

  return null;
}
