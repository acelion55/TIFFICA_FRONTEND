'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Info, Star, Clock, Flame, ShieldCheck } from 'lucide-react';

const MENU_CATEGORIES = ['All', 'North Indian', 'Rajasthani', 'Diet Plans', 'Breakfast', 'Snacks'];

const MOCK_MENU = [
  { id: 1, name: 'Executive Thali', category: 'North Indian', price: 99, rating: 4.8, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop', details: 'Paneer Sabzi, Dal Tadka, 3 Roti, Rice, Salad & Achar' },
  { id: 2, name: 'Dal Baati Churma', category: 'Rajasthani', price: 149, rating: 4.9, img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000&auto=format&fit=crop', details: '4 Baati, Panchmel Dal, Desi Ghee Churma, Garlic Chutney & Chaas' },
  { id: 3, name: 'Keto Power Bowl', category: 'Diet Plans', price: 129, rating: 4.7, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop', details: 'Grilled Paneer, Sautéed Broccoli, Zucchini Noodles & Nuts' },
  { id: 4, name: 'Stuffed Paratha', category: 'Breakfast', price: 79, rating: 4.9, img: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=1000&auto=format&fit=crop', details: '2 Aloo/Pyaz Paratha served with fresh Curd and Pickle' },
  { id: 5, name: 'Pindi Chole Bhature', category: 'North Indian', price: 119, rating: 4.6, img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000&auto=format&fit=crop', details: 'Authentic Amritsari Chole with 2 fluffy Bhature & Salad' },
  { id: 6, name: 'Bajra Roti & Gatte', category: 'Rajasthani', price: 109, rating: 4.8, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1000&auto=format&fit=crop', details: '2 Bajra Roti with Traditional Gatte ki Sabzi & Lehsun Chutney' },
  { id: 7, name: 'Paneer Butter Masala', category: 'North Indian', price: 139, rating: 4.9, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=1000&auto=format&fit=crop', details: 'Rich and creamy Paneer served with 2 Laccha Paratha' },
  { id: 8, name: 'Quinoa Salad', category: 'Diet Plans', price: 159, rating: 4.5, img: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=1000&auto=format&fit=crop', details: 'Quinoa, Chickpeas, Bell Peppers, and Lemon vinaigrette dressing' },
  { id: 9, name: 'Poha Jalebi', category: 'Breakfast', price: 59, rating: 4.8, img: 'https://images.unsplash.com/photo-1621348160394-b118fb5eddd6?q=80&w=1000&auto=format&fit=crop', details: 'Indori style Poha served with 2 hot Jalebis' },
  { id: 10, name: 'Mix Veg Pakora', category: 'Snacks', price: 69, rating: 4.7, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1000&auto=format&fit=crop', details: 'Crispy fried vegetable fritters with mint chutney' },
  { id: 11, name: 'Ker Sangri Special', category: 'Rajasthani', price: 169, rating: 5.0, img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000&auto=format&fit=crop', details: 'Authentic desert vegetable specialty served with 2 Missi Roti' },
  { id: 12, name: 'Brown Rice & Dal', category: 'Diet Plans', price: 99, rating: 4.6, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop', details: 'Organic Brown Rice served with protein-rich Moong Dal' },
];

export default function PublicMenu() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredMenu = activeTab === 'All' 
    ? MOCK_MENU 
    : MOCK_MENU.filter(m => m.category === activeTab);

  return (
    <div className="bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h1 className="text-mega uppercase tracking-tighter mb-6 italic">
            Pick Your <span className="text-primary italic">Flavor</span>.
          </h1>
          <p className="text-xl text-muted max-w-xl mx-auto font-medium leading-relaxed">
            Browse our curated daily menus. Each meal is balanced for taste and nutrition, prepared with zero artificial additives.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          {MENU_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-8 py-3 rounded-pill text-sm font-black uppercase tracking-widest transition-all ${activeTab === cat ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 'bg-gray-100 text-muted hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20 mb-32">
          {filteredMenu.map(item => (
            <div key={item.id} className="group flex flex-col relative">
              <div className="aspect-square relative overflow-hidden rounded-[56px] mb-8 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-8 left-8 flex flex-col gap-2">
                  <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-pill text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                    <Star size={12} className="text-yellow-500 fill-current" /> {item.rating}
                  </span>
                  {item.price > 120 && (
                    <span className="bg-primary text-white px-4 py-2 rounded-pill text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                      <Flame size={12} /> BESTSELLER
                    </span>
                  )}
                </div>
              </div>
              <div className="px-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1 italic">{item.category}</p>
                    <h3 className="text-3xl font-black tracking-tighter uppercase">{item.name}</h3>
                  </div>
                  <p className="text-3xl font-black tracking-tighter text-foreground">₹{item.price}</p>
                </div>
                <p className="text-muted font-medium text-sm mb-8 leading-relaxed italic">{item.details}</p>
                <div className="flex gap-4">
                   <Link href="/signup" className="flex-1 bg-black text-white py-4 rounded-pill font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-colors">
                     <ShoppingCart size={18} /> Add to Subscription
                   </Link>
                   <button className="w-14 h-14 border-2 border-gray-100 rounded-pill flex items-center justify-center hover:border-primary transition-colors">
                     <Info size={18} className="text-muted" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quality Promises */}
        <div className="grid md:grid-cols-3 gap-12 mb-32">
           {[
             { title: 'Always Fresh', icon: Clock, desc: 'Cooked less than 60 minutes before delivery.' },
             { title: 'Pure Ghee', icon: Flame, desc: 'Only authentic Desi Ghee used for premium meals.' },
             { title: 'Zero Plastics', icon: ShieldCheck, desc: 'Eco-friendly and microwave-safe packaging.' },
           ].map((p, i) => (
             <div key={i} className="flex gap-6 items-center">
               <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-primary">
                 <p.icon size={28} />
               </div>
               <div>
                  <h5 className="font-black uppercase text-sm tracking-widest">{p.title}</h5>
                  <p className="text-xs text-muted font-medium mt-1">{p.desc}</p>
               </div>
             </div>
           ))}
        </div>

        {/* Call to Menu */}
        <div className="bg-orange-yellow rounded-[64px] p-20 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
          <div className="flex-1 text-center lg:text-left relative z-10">
            <h2 className="text-5xl font-black tracking-tighter mb-6 uppercase text-white">Don't see your favorite?</h2>
            <p className="text-xl text-white/80 font-medium italic mb-0">Our menu changes every single day to keep your excitement alive. Sign up now to see tomorrow's specials!</p>
          </div>
          <Link href="/signup" className="bg-white text-black px-12 py-6 rounded-pill font-black text-xl shadow-2xl hover:scale-105 transition-transform flex items-center gap-4 uppercase whitespace-nowrap relative z-10">
            JOIN TIFFICA NOW <ArrowRight size={24} />
          </Link>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-pill translate-x-1/2 -translate-y-1/2 border border-white/20" />
        </div>
      </div>
    </div>
  );
}
