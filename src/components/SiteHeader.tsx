'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: 'Menu', href: '/menu' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { token } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary rounded-pill w-10 h-10 flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
              🍱
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
              TIFFICA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors ${pathname === link.href ? 'text-primary' : 'text-foreground/70'}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTA / Login */}
          <div className="hidden md:flex items-center gap-4">
            {!token ? (
              <>
                <Link href="/login" className="text-sm font-bold hover:text-primary transition-colors px-4 py-2">
                  LOGIN
                </Link>
                <Link href="/signup" className="bg-primary text-white px-6 py-2.5 rounded-pill font-bold text-sm shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  GET STARTED <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <Link href="/home" className="bg-primary text-white px-6 py-2.5 rounded-pill font-bold text-sm shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all">
                DASHBOARD
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-6 gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-black uppercase tracking-widest text-foreground hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-gray-100" />
            {!token ? (
              <div className="flex flex-col gap-4">
                <Link href="/login" className="text-center font-bold text-gray-500 py-2">
                  LOGIN
                </Link>
                <Link href="/signup" className="bg-primary text-white text-center py-4 rounded-pill font-black text-lg shadow-xl shadow-primary/20">
                  GET STARTED NOW
                </Link>
              </div>
            ) : (
              <Link href="/home" className="bg-primary text-white text-center py-4 rounded-pill font-black text-lg">
                GOTO DASHBOARD
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
