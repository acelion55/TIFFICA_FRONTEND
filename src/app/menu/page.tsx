'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Info, Star, Clock, Flame, ShieldCheck } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image?: string;
  description?: string;
  category?: string;
  mealType?: string;
  mealTypes?: string | string[];
  rating?: number;
}

export default function PublicMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/menu`);
        if (res.ok) {
          const data = await res.json();
          setMenuItems(data.items || []);
        }
      } catch (err) {
        console.error('Failed to fetch menu items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

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

        {/* Menu Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted">Loading menu...</p>
          </div>
        ) : menuItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-x-12 md:gap-y-20 mb-32">
            {menuItems.map(item => (
              <div key={item._id} className="group flex flex-col relative">
                <div className="aspect-square relative overflow-hidden rounded-2xl md:rounded-[56px] mb-4 md:mb-8 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop'} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-2 md:top-8 left-2 md:left-8 flex flex-col gap-1 md:gap-2">
                    {item.rating && (
                      <span className="bg-white/90 backdrop-blur-md px-2 md:px-4 py-1 md:py-2 rounded-pill text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 md:gap-1.5 shadow-lg">
                        <Star size={10} className="md:w-3 md:h-3 text-yellow-500 fill-current" /> {item.rating}
                      </span>
                    )}
                    {item.discount && item.discount > 0 && (
                      <span className="bg-primary text-white px-2 md:px-4 py-1 md:py-2 rounded-pill text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 md:gap-1.5 shadow-lg">
                        <Flame size={10} className="md:w-3 md:h-3" /> {item.discount}% OFF
                      </span>
                    )}
                  </div>
                </div>
                <div className="px-2 md:px-4">
                  <div className="flex justify-between items-start mb-2 md:mb-4">
                    <div>
                      <h3 className="text-sm md:text-3xl font-black tracking-tighter uppercase leading-tight">{item.name}</h3>
                    </div>
                    <div className="text-right">
                      {item.originalPrice && item.discount ? (
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-xs md:text-sm text-gray-400 line-through">₹{item.originalPrice}</p>
                          <p className="text-lg md:text-3xl font-black tracking-tighter text-foreground">₹{item.price}</p>
                        </div>
                      ) : (
                        <p className="text-lg md:text-3xl font-black tracking-tighter text-foreground">₹{item.price}</p>
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-muted font-medium text-xs md:text-sm mb-4 md:mb-8 leading-relaxed italic line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex gap-2 md:gap-4">
                    <Link href="/" className="flex-1 bg-black text-white py-2 md:py-4 rounded-full md:rounded-pill font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 hover:bg-primary transition-colors">
                      <ShoppingCart size={12} className="md:w-4 md:h-4" /> Buy Now
                    </Link>
                    <button className="w-8 md:w-14 h-8 md:h-14 border-2 border-gray-100 rounded-full flex items-center justify-center hover:border-primary transition-colors">
                      <Info size={12} className="md:w-4 md:h-4 text-muted" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted">No menu items available at the moment.</p>
          </div>
        )}

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
