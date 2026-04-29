'use client';

import Link from 'next/link';
import { Mail, Phone, Instagram, Twitter, Facebook, ArrowRight, ArrowUpRight, Globe, ShieldCheck, Download, Loader2 } from 'lucide-react';
import { useInstallApp } from '@/hooks/useInstallApp';

export default function SiteFooter() {
  const { handleInstall, isInstalling, isPWAMode } = useInstallApp();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hide footer in PWA mode
  if (isPWAMode) return null;

  return (
    <footer className="bg-black text-white selection:bg-primary selection:text-white pt-24 pb-12 overflow-hidden relative">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top CTA Section */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-32 border-b border-white/10 pb-12">
          <div className="max-w-2xl">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-6 animate-pulse">Hungry for better?</h2>
            <p className="text-6xl sm:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-0">
              JOIN THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">FLAVOR</span> <br />
              REVOLUTION.
            </p>
          </div>
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="group relative inline-flex items-center gap-4 bg-white text-black px-12 py-8 rounded-[32px] font-black text-xl hover:bg-primary hover:text-white transition-all duration-500 shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isInstalling ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                INSTALLING APP...
              </>
            ) : isPWAMode ? (
              <>
                ORDER YOUR FIRST TIFFIN <ArrowUpRight className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
              </>
            ) : (
              <>
                <Download size={24} />
                 ORDER YOUR FIRST TIFFIN  
              </>
            )}
          </button>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-32">
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-8 group">
              <div className="bg-primary rounded-[12px] w-12 h-12 flex items-center justify-center text-white text-2xl group-hover:rotate-12 transition-transform">🍱</div>
              <span className="text-3xl font-black tracking-tighter text-white">TIFFICA</span>
            </Link>
            <p className="text-white/60 font-medium text-lg leading-relaxed mb-10 max-w-sm">
              We're redefining the tiffin experience in Jaipur. No compromises on health, no shortcuts on taste. Pure home-cooked excellence.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Facebook, label: 'Facebook' }
              ].map((social, i) => (
                <button 
                  key={i} 
                  className="w-14 h-14 rounded-[20px] border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all group scale-100 hover:scale-110"
                >
                  <social.Icon size={24} />
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
                { name: 'Contact', href: '/contact' }
              ].map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-lg font-black uppercase tracking-tight text-white/50 hover:text-primary transition-colors flex items-center gap-2 group">
                    {link.name} <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="lg:col-span-3">
             <h5 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-primary italic">Get in Touch</h5>
             <div className="space-y-8">
                <div className="group cursor-pointer">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Email Support</p>
                  <p className="text-xl font-black tracking-tight text-white group-hover:text-primary transition-colors uppercase">hello@tiffica.com</p>
                </div>
                <div className="group cursor-pointer">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Customer Care</p>
                  <p className="text-xl font-black tracking-tight text-white group-hover:text-primary transition-colors uppercase">+91 98765 43210</p>
                </div>
                <div className="flex items-center gap-3 text-white/40">
                   <Globe size={16} />
                   <span className="text-xs font-black uppercase tracking-widest">Available across Jaipur</span>
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
        <div className="relative mb-24 select-none opacity-[0.03]">
          <h1 className="text-[25vw] font-black leading-none text-center tracking-tighter uppercase whitespace-nowrap">
            TIFFICA
          </h1>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">
            © 2024 TIFFICA® — THE NEW STANDARD OF TIFFIN SERVICES
          </p>
          <div className="flex items-center gap-12">
            <div className="flex gap-8">
               <Link href="/privacy" className="text-[10px] font-black text-white/40 tracking-widest uppercase hover:text-white transition-colors">Privacy</Link>
               <Link href="/terms" className="text-[10px] font-black text-white/40 tracking-widest uppercase hover:text-white transition-colors">Terms</Link>
            </div>
            <button 
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
            >
              <ArrowUpRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
