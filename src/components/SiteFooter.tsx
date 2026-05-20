'use client';

import Link from 'next/link';
import { Mail, Phone, Instagram, Twitter, Facebook, ArrowRight, ArrowUpRight, Globe, ShieldCheck, Download, Loader2 } from 'lucide-react';
import { useInstallApp } from '@/hooks/useInstallApp';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

import { SEO_PAGES } from '@/data/seo-pages';

// Routes where footer should be shown (web pages only)
const FOOTER_ROUTES = ['/', '/about', '/contact', '/blog', '/menu', '/terms', '/privacy', '/faq', '/jaipur-tiffin'];

const FOOTER_AREA_LINKS = SEO_PAGES.filter((p) => p.category === 'area' || p.category === 'near');
const FOOTER_SERVICE_LINKS = SEO_PAGES.filter((p) => p.category === 'service').slice(0, 8);
const FOOTER_BUDGET_LINKS = SEO_PAGES.filter((p) => p.category === 'budget');

export default function SiteFooter() {
  const { handleInstall, isInstalling, isPWAMode } = useInstallApp();
  const pathname = usePathname();
  const { token } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hide footer in PWA mode
  if (isPWAMode) return null;
  
  // Hide footer in user portal (when logged in)
  if (token) return null;
  
  // Only show footer on specific web pages
  const shouldShowFooter = FOOTER_ROUTES.some(route => 
    pathname === route || (route !== '/' && pathname?.startsWith(route))
  );
  
  if (!shouldShowFooter) return null;

  return (
    <footer className="bg-black text-white selection:bg-primary selection:text-white pt-24 pb-12 overflow-hidden relative">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top CTA Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-12 mb-20 lg:mb-32 border-b border-white/10 pb-8 lg:pb-12">
          <div className="max-w-2xl w-full">
            <h2 className="text-xs sm:text-sm font-black text-primary uppercase tracking-[0.4em] mb-4 lg:mb-6 animate-pulse">Hungry for better?</h2>
            <p className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] lg:leading-[0.8] mb-0">
              JOIN THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">FLAVOR</span> <br />
              REVOLUTION.
            </p>
          </div>
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="group relative inline-flex items-center justify-center gap-3 lg:gap-4 bg-white text-black px-8 py-5 lg:px-12 lg:py-8 rounded-[24px] lg:rounded-[32px] font-black text-base lg:text-xl hover:bg-primary hover:text-white transition-all duration-500 shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed w-full lg:w-auto"
          >
            {isInstalling ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm lg:text-xl">INSTALLING APP...</span>
              </>
            ) : isPWAMode ? (
              <>
                <span className="text-sm lg:text-xl">ORDER YOUR FIRST TIFFIN</span>
                <ArrowUpRight className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" size={20} />
              </>
            ) : (
              <>
                <Download size={20} />
                <span className="text-sm lg:text-xl">ORDER YOUR FIRST TIFFIN</span>
              </>
            )}
          </button>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-20 lg:mb-32">
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-6 lg:mb-8 group">
              <div className="bg-primary rounded-[12px] w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-white text-xl lg:text-2xl group-hover:rotate-12 transition-transform">🍱</div>
              <span className="text-2xl lg:text-3xl font-black tracking-tighter text-white">TIFFICA</span>
            </Link>
            <p className="text-white/60 font-medium text-base lg:text-lg leading-relaxed mb-8 lg:mb-10 max-w-sm">
              We're redefining the tiffin experience in Jaipur. No compromises on health, no shortcuts on taste. Pure home-cooked excellence.
            </p>
            <div className="flex gap-3 lg:gap-4">
              {[
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Facebook, label: 'Facebook' }
              ].map((social, i) => (
                <button
                  key={i}
                  className="w-12 h-12 lg:w-14 lg:h-14 rounded-[16px] lg:rounded-[20px] border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all group scale-100 hover:scale-110"
                >
                  <social.Icon size={20} className="lg:w-6 lg:h-6" />
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="lg:col-span-2">
            <h5 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-primary italic">Explore</h5>
            <ul className="space-y-6">
              {[
                { name: 'Our Story', href: '/about' },
                { name: 'Daily Menu', href: '/menu' },
                { name: 'Food Blog', href: '/blog' },
                { name: 'Contact', href: '/contact' },
                { name: 'All Jaipur Pages', href: '/jaipur-tiffin' },
              ].map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-lg font-black uppercase tracking-tight text-white/50 hover:text-primary transition-colors flex items-center gap-2 group">
                    {link.name} <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Jaipur areas */}
          <div className="lg:col-span-2">
            <h5 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-primary italic">Jaipur Areas</h5>
            <ul className="space-y-4">
              {FOOTER_AREA_LINKS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/jaipur-tiffin/${p.slug}`}
                    className="text-[11px] font-black uppercase tracking-tight text-white/40 hover:text-primary transition-colors leading-snug block"
                  >
                    {p.area ? `${p.area}` : p.h1.replace('Tiffin Service Near ', '').replace(', Jaipur', '')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Services & budget */}
          <div className="lg:col-span-2">
            <h5 className="font-black text-xs uppercase tracking-[0.3em] mb-6 text-primary italic">Tiffin Plans</h5>
            <ul className="space-y-3 mb-8">
              {FOOTER_SERVICE_LINKS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/jaipur-tiffin/${p.slug}`}
                    className="text-[11px] font-black uppercase tracking-tight text-white/40 hover:text-primary transition-colors leading-snug block"
                  >
                    {p.h1.length > 42 ? `${p.h1.slice(0, 40)}…` : p.h1}
                  </Link>
                </li>
              ))}
            </ul>
            <h5 className="font-black text-xs uppercase tracking-[0.3em] mb-4 text-primary italic">Under ₹100</h5>
            <ul className="space-y-3">
              {FOOTER_BUDGET_LINKS.slice(0, 5).map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/jaipur-tiffin/${p.slug}`}
                    className="text-[11px] font-black uppercase tracking-tight text-white/40 hover:text-primary transition-colors leading-snug block"
                  >
                    {p.area || 'Jaipur'}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="lg:col-span-2">
            <h5 className="font-black text-xs uppercase tracking-[0.3em] mb-8 lg:mb-10 text-primary italic">Get in Touch</h5>
            <div className="space-y-6 lg:space-y-8">
              <div className="group cursor-pointer">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Email Support</p>
                <p className="text-base lg:text-xl font-black tracking-tight text-white group-hover:text-primary transition-colors uppercase break-words">supporttiffica@gmail.com</p>
              </div>
              <div className="group cursor-pointer">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Customer Care</p>
                <p className="text-base lg:text-xl font-black tracking-tight text-white group-hover:text-primary transition-colors uppercase">+91 82394 56238</p>
              </div>
              <div className="flex items-start lg:items-center gap-3 text-white/40">
                <Globe size={16} className="flex-shrink-0 mt-0.5 lg:mt-0" />
                <span className="text-xs font-black uppercase tracking-widest leading-relaxed">Jaipur — Vaishali Nagar, Malviya Nagar & more</span>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter or Badges */}
          <div className="lg:col-span-3">
            <h5 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-primary italic">Certifications</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-[24px] border border-white/10 text-center flex flex-col items-center justify-center group hover:bg-white/10 transition-colors">
                <ShieldCheck className="text-primary mb-2" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest">FSSAI Certified</p>
              </div>
              <div className="bg-white/5 p-6 rounded-[24px] border border-white/10 text-center flex flex-col items-center justify-center group hover:bg-white/10 transition-colors">
                <div className="text-2xl mb-2">🌾</div>
                <p className="text-[10px] font-black uppercase tracking-widest">100% Organic</p>
              </div>
            </div>
          </div>
        </div>

        {/* Massive Logo Background Text */}
        <div className="relative mb-16 lg:mb-24 select-none opacity-[0.05]">
          <h1 className="text-[20vw] sm:text-[25vw] font-black leading-none text-center tracking-tighter uppercase whitespace-nowrap overflow-hidden">
            {['T', 'I', 'F', 'F', 'I', 'C', 'A'].map((letter, index) => (
              <motion.span
                key={index}
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
          </h1>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 lg:pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 lg:gap-8">
          <p className="text-[9px] lg:text-[10px] font-black text-white/40 tracking-[0.3em] lg:tracking-[0.4em] uppercase text-center md:text-left">
            © 2024 TIFFICA® — THE NEW STANDARD OF TIFFIN SERVICES
          </p>
          <div className="flex items-center gap-8 lg:gap-12">
            <div className="flex gap-6 lg:gap-8">
              <Link href="/privacy" className="text-[9px] lg:text-[10px] font-black text-white/40 tracking-widest uppercase hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-[9px] lg:text-[10px] font-black text-white/40 tracking-widest uppercase hover:text-white transition-colors">Terms</Link>
            </div>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all flex-shrink-0"
            >
              <ArrowUpRight size={18} className="lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
