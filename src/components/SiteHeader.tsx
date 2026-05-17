'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isPWA } from '@/lib/pwaDetect';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: 'Menu', href: '/menu' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const HIDE_HEADER_ROUTES = ['/login', '/signup', '/forgot-password', '/onboarding'];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isPWAMode, setIsPWAMode] = useState(false);
  const pathname = usePathname();
  const { token } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsPWAMode(isPWA());
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsOpen(false), [pathname]);

  // Hide header in PWA mode or on auth pages
  const hideHeader = isPWAMode || HIDE_HEADER_ROUTES.some(route => pathname?.startsWith(route));
  if (hideHeader) return null;

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.jpeg" 
              alt="Tiffica Logo" 
              className="w-10 h-10 rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform"
            />
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
          <button 
            className="md:hidden text-foreground p-2 rounded-lg hover:bg-gray-100 transition-colors" 
            onClick={() => {
              console.log('Hamburger clicked, current state:', isOpen);
              setIsOpen(!isOpen);
            }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Mobile Menu Panel */}
          <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-2xl z-[1000] animate-in slide-in-from-top duration-300 border-b border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img 
                  src="/logo.jpeg" 
                  alt="Tiffica Logo" 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-lg font-black tracking-tighter text-foreground">
                  TIFFICA
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Menu Content */}
            <div className="flex flex-col p-4 gap-1 max-h-[80vh] overflow-y-auto">
              {/* Navigation Links */}
              <div className="space-y-1 mb-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-bold uppercase tracking-wide transition-all hover:bg-gray-50 ${
                      pathname === link.href 
                        ? 'text-primary bg-orange-50 border border-orange-100' 
                        : 'text-foreground hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              
              {/* Divider */}
              <hr className="border-gray-200 my-4" />
              
              {/* Auth Buttons */}
              {!token ? (
                <div className="space-y-3">
                  <Link 
                    href="/login" 
                    onClick={() => setIsOpen(false)}
                    className="block text-center font-bold text-gray-600 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    LOGIN TO ACCOUNT
                  </Link>
                  <Link 
                    href="/signup" 
                    onClick={() => setIsOpen(false)}
                    className="block bg-gradient-to-r from-primary to-secondary text-white text-center py-4 px-6 rounded-2xl font-black text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all"
                  >
                    🚀 GET STARTED NOW
                  </Link>
                </div>
              ) : (
                <Link 
                  href="/home" 
                  onClick={() => setIsOpen(false)}
                  className="block bg-gradient-to-r from-primary to-secondary text-white text-center py-4 px-6 rounded-2xl font-black text-base shadow-xl"
                >
                  📱 GOTO DASHBOARD
                </Link>
              )}
              
              {/* App Download Prompt */}
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-700 mb-2">📱 Better on Mobile App</p>
                  <p className="text-xs text-gray-500 mb-3">Install our app for faster ordering & offline access</p>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      // Trigger PWA install
                      if ('serviceWorker' in navigator) {
                        alert('Look for "Add to Home Screen" in your browser menu!');
                      }
                    }}
                    className="w-full bg-white text-orange-600 py-2 px-4 rounded-xl font-bold text-sm border border-orange-200 hover:bg-orange-50 transition-colors"
                  >
                    📲 Install App
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
