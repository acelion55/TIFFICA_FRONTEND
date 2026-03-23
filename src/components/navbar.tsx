'use client';

import Link from 'next/link';
import { Home, CreditCard, Calendar, History } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/schedule', label: 'Schedule', icon: Calendar },
    { href: '/reorder', label: 'Reorder', icon: History },
    { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t-md border-t border-gray-200 md:relative md:bottom-auto md:border-none md:shadow-none">
      <div className="max-w-4xl mx-auto flex justify-around md:justify-center md:space-x-8 p-2 md:p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors ${isActive ? 'text-orange-500 bg-orange-100' : 'text-gray-600 hover:bg-gray-100'}`}>
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
