'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isPWA } from '@/lib/pwaDetect';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, Shield, Star, MapPin, Play, Utensils, Award, Smile, Coffee, Download, Loader2 } from 'lucide-react';
import { useInstallApp } from '@/hooks/useInstallApp';
import { useOrderAction } from '@/hooks/useOrderAction';
import { AppDownloadModal } from '@/components/AppDownloadModal';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { token, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { handleInstall, isInstalling, isPWAMode } = useInstallApp();
  const { isMobile, showModal, setShowModal, handleOrderClick, handleDownloadApp } = useOrderAction();

  // Only redirect to dashboard if in PWA mode.
  // Browser users should stay on the landing page to browse marketing content.
  useEffect(() => {
    const isPWAMode = isPWA();
    if (!loading && token && isPWAMode) {
      if (user?.role === 'admin' || user?.role === 'kitchen-owner') {
        router.push('/admin');
      } else {
        router.push('/home');
      }
    }
  }, [loading, token, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-[6px] border-primary border-t-secondary rounded-pill animate-spin shadow-2xl" />
      </div>
    );
  }

  if (token) return null;

  // Show marketing content for all users (browser and PWA)
  return (
    <div className="bg-white selection:bg-primary selection:text-white pb-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[80%] bg-primary/20 blur-[120px] rounded-pill animate-pulse" />
          <div className="absolute top-[40%] -right-[10%] w-[50%] h-[70%] bg-secondary/30 blur-[150px] rounded-pill animate-pulse duration-700" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gray-100 rounded-pill px-4 py-2 mb-8"
          >
            <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-pill">NEW</span>
            <span className="text-xs font-bold text-muted uppercase tracking-widest">Premium Tiffin Experience in Jaipur</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-mega uppercase tracking-tighter mb-8"
          >
            Taste of <span className="text-primary italic">Home</span>,<br /> 
            Delivered <span className="text-secondary">Fresh</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-muted max-w-2xl mx-auto mb-12 font-medium"
          >
            Order the best affordable tiffin in Jaipur — Vaishali Nagar, Malviya Nagar, Jagatpura, Mahesh Nagar & Mansarovar. Healthy home-cooked meals for students and professionals.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button 
              onClick={handleOrderClick}
              disabled={isInstalling || isMobile === null}
              className="group bg-primary text-white px-10 py-5 rounded-pill font-black text-xl shadow-2xl shadow-primary/40 hover:scale-105 hover:bg-black transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isInstalling ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  INSTALLING APP...
                </>
              ) : (
                <>
                  <Download size={24} />
                  ORDER YOUR TIFFIN
                </>
              )}
            </button>
            <Link href="/menu" className="flex items-center gap-3 text-lg font-black hover:text-primary transition-colors">
              <div className="w-14 h-14 rounded-pill border-2 border-gray-200 flex items-center justify-center transition-colors">
                <Play className="fill-current" size={20} />
              </div>
              VIEW MENU
            </Link>
          </motion.div>
        </div>

        {/* Decorative Floating Elements */}
        <div className="absolute bottom-20 left-10 hidden lg:block animate-bounce duration-[3000ms]">
          <div className="bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">🥗</div>
            <div>
              <p className="font-black text-sm uppercase">Fresh Salads</p>
              <p className="text-xs text-muted">Included in every meal</p>
            </div>
          </div>
        </div>
        
        <div className="absolute top-40 right-20 hidden lg:block animate-bounce duration-[4000ms]">
          <div className="bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-2xl">🚚</div>
            <div>
              <p className="font-black text-sm uppercase">Quick Delivery</p>
              <p className="text-xs text-muted">Jaipur delivery zones</p>
            </div>
          </div>
        </div>
      </section>

    

      {/* How It Works Section */}
      <section className="py-32 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-24"
          >
            <h2 className="text-6xl font-black tracking-tighter uppercase mb-4">How it <span className="text-primary italic">Works</span>.</h2>
            <p className="text-sm font-black text-primary uppercase tracking-[0.3em]">Our Simple Process</p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden lg:block absolute top-[40%] left-[10%] right-[10%] h-[2px] bg-dashed border-t-2 border-dashed border-primary/20" />
            
            {[
              { step: '01', title: 'Pick a Plan', desc: 'Choose from Daily, Weekly, or Monthly subscriptions that suit your lifestyle.', icon: Coffee },
              { step: '02', title: 'Select Menu', desc: 'Customize your food preferences. We offer North Indian, Rajasthani, and Diet-specific meals.', icon: Utensils },
              { step: '03', title: 'We Cook', desc: 'Our expert home-chefs prepare your meal with fresh ingredients and maximum hygiene.', icon: Award },
              { step: '04', title: 'Doorstep Delivery', desc: 'Enjoy your hot, delicious, homemade meal delivered across Jaipur — Vaishali Nagar, Malviya Nagar, Jagatpura & more.', icon: Smile },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative z-10 bg-white p-10 rounded-[48px] shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-8 font-black text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <item.icon size={32} />
                </div>
                <p className="text-xs font-black text-primary mb-2 uppercase tracking-widest">{item.step}.</p>
                <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">{item.title}</h3>
                <p className="text-muted font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Chefs Section */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1 relative"
            >
              <div className="absolute -inset-4 bg-orange-yellow rounded-[64px] rotate-3 -z-10" />
              <img 
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop" 
                alt="Chef at Work" 
                className="rounded-[60px] shadow-2xl w-full aspect-[4/3] object-cover"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1"
            >
              <h2 className="text-6xl font-black tracking-tighter mb-8 uppercase leading-[0.9]">
                OUR OWN <span className="text-primary underline decoration-secondary underline-offset-8">CLOUD KITCHEN</span>. REAL TASTE.
              </h2>
              <p className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-6">Quality Guaranteed</p>
              <p className="text-xl text-muted font-medium leading-loose mb-10">
                At Tiffica, we operate our own state-of-the-art cloud kitchen in Jaipur. We understand that food is not just nutrition—it's an emotion. Every meal is prepared fresh with home-style recipes, maintaining the highest standards of cleanliness and hygiene.
              </p>
              <div className="grid grid-cols-2 gap-8 mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <p className="text-4xl font-black text-foreground">100%</p>
                  <p className="text-xs font-black text-primary uppercase tracking-widest mt-1">Clean Kitchen</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <p className="text-4xl font-black text-foreground">Fresh</p>
                  <p className="text-xs font-black text-primary uppercase tracking-widest mt-1">Daily Cooking</p>
                </motion.div>
              </div>
              <Link href="/about" className="inline-flex items-center gap-3 text-lg font-black hover:text-primary transition-colors">
                LEARN MORE ABOUT US <ArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="py-32 bg-black text-white rounded-[80px] mx-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-24"
          >
            <h2 className="text-6xl font-black tracking-tighter uppercase mb-4">What Our <span className="text-primary italic">Community</span> Says.</h2>
            <p className="text-sm font-black text-primary uppercase tracking-[0.3em]">Word on the Street</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { 
                name: 'Rahul Sharma', 
                role: 'IT Professional', 
                text: 'Moving to Jaipur for work was hard, but Tiffica made me feel at home. The Dal Baati on weekends is literal heaven!',
                avatar: 'https://i.pravatar.cc/150?u=1'
              },
              { 
                name: 'Aditi Verma', 
                role: 'Medical Student', 
                text: 'I was tired of eating oily outside food. Tiffica’s diet plans are perfect for my busy hospital shifts.',
                avatar: 'https://i.pravatar.cc/150?u=2'
              },
              { 
                name: 'Priya Gupta', 
                role: 'Work-from-home Mom', 
                text: 'Managing kids and work left no time for cooking. Tiffica is a lifesaver for our whole family.',
                avatar: 'https://i.pravatar.cc/150?u=3'
              },
            ].map((t, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-white/5 border border-white/10 p-12 rounded-[56px] backdrop-blur-sm group hover:bg-white/10 transition-all"
              >
                <div className="flex gap-1 mb-8">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="text-primary fill-current" />)}
                </div>
                <p className="text-xl font-medium leading-relaxed mb-10 italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} className="w-14 h-14 rounded-pill border-2 border-primary" alt={t.name} />
                  <div>
                    <p className="font-black text-lg uppercase leading-none mb-1">{t.name}</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Simple Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">FREQUENTLY ASKED</h2>
            <p className="text-sm font-black text-primary uppercase tracking-[0.3em]">Got Questions?</p>
          </motion.div>
          <div className="space-y-6">
            {[
              { q: 'Is the food spicy?', a: 'We offer customizable spice levels. You can choose Mild, Medium, or Spicy in your profile settings.' },
              { q: 'Can I cancel my subscription?', a: 'Yes, you can pause or cancel your subscription at any time directly through the Tiffica dashboard.' },
              { q: 'Where do you deliver?', a: 'We deliver across Jaipur including Vaishali Nagar, Malviya Nagar, Jagatpura, Mahesh Nagar, Mansarovar, and nearby localities.' },
              { q: 'Is the packaging eco-friendly?', a: 'We use high-quality, recyclable materials to ensure we minimize our environmental footprint.' },
            ].map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-gray-50 px-10 py-8 rounded-[32px] hover:bg-primary/5 transition-colors group cursor-pointer"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-black uppercase tracking-tight">{f.q}</h4>
                  <div className="w-8 h-8 rounded-pill border border-gray-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowRight size={16} />
                  </div>
                </div>
                <p className="text-muted font-medium hidden group-hover:block animate-in fade-in transition-all">
                  {f.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-slate-900 to-black rounded-[4rem] p-12 md:p-24 relative overflow-hidden text-center shadow-2xl"
          >
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[80%] bg-primary/20 blur-[100px] rounded-full" />
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase mb-6 relative z-10 leading-none"
            >
              READY TO TASTE <br /> <span className="text-primary italic"> AUTHENTICITY</span>?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium relative z-10 leading-relaxed"
            >
              Join thousands of happy customers in Jaipur. Experience the joy of healthy, homemade meals delivered right to your doorstep.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center relative z-10"
            >
              <button onClick={handleOrderClick} disabled={isMobile === null} className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-full font-black text-xl shadow-2xl shadow-primary/40 hover:scale-105 transition-all text-center disabled:opacity-70 disabled:cursor-not-allowed">
                GET STARTED NOW
              </button>
              <Link href="/login" className="w-full sm:w-auto backdrop-blur-md bg-black text-white border border-white/20 px-10 py-5 rounded-full font-black text-xl hover:bg-white hover:text-black transition-all text-center">
                MEMBER LOGIN
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* App Download Modal */}
      <AppDownloadModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onDownload={handleDownloadApp}
      />
    </div>
  );
}
