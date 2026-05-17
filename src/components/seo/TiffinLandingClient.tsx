'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Star, MapPin, ArrowRight, Download, Loader2 } from 'lucide-react';
import type { SeoPage } from '@/data/seo-pages';
import { useInstallApp } from '@/hooks/useInstallApp';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  description?: string;
  rating?: number;
}

export default function TiffinLandingClient({ page }: { page: SeoPage }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleInstall, isInstalling } = useInstallApp();

  useEffect(() => {
    fetch(`${API_URL}/menu`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const meals = useMemo(() => {
    if (!page.maxPrice) return items;
    return items.filter((i) => i.price <= page.maxPrice!);
  }, [items, page.maxPrice]);

  const displayMeals = meals.length > 0 ? meals : items;

  return (
    <div className="bg-white pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          {page.area && (
            <p className="inline-flex items-center gap-2 text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">
              <MapPin size={14} /> {page.area}, Jaipur
            </p>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.95]">
            {page.h1}
          </h1>
          <p className="text-xl text-muted font-medium max-w-3xl mb-6">{page.subtitle}</p>
          <p className="text-lg text-muted/90 font-medium leading-relaxed max-w-3xl mb-8">{page.intro}</p>
          <ul className="grid sm:grid-cols-2 gap-3 mb-10 max-w-2xl">
            {page.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                {b}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-pill font-black text-sm uppercase tracking-wide hover:bg-black transition-all disabled:opacity-70"
            >
              {isInstalling ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              Order Tiffin Now
            </button>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 border-2 border-gray-200 px-8 py-4 rounded-pill font-black text-sm uppercase tracking-wide hover:border-primary transition-all"
            >
              Full Menu <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-2">
            {page.maxPrice ? `Meals Under ₹${page.maxPrice}` : "Today's Meals"}
          </h2>
          <p className="text-muted font-medium mb-8">
            Fresh homemade tiffin — order for delivery in Jaipur
            {page.area ? ` (${page.area})` : ''}.
          </p>

          {loading ? (
            <p className="text-center py-16 text-muted font-medium">Loading meals...</p>
          ) : displayMeals.length === 0 ? (
            <p className="text-center py-16 text-muted font-medium">
              Menu updating soon.{' '}
              <Link href="/menu" className="text-primary font-black underline">
                View full menu
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {displayMeals.slice(0, 12).map((item) => (
                <article
                  key={item._id}
                  className="group flex flex-col bg-gray-50 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={item.image || FALLBACK_IMG}
                      alt={`${item.name} — tiffin Jaipur`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.rating && (
                      <span className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-pill text-[10px] font-black flex items-center gap-1">
                        <Star size={10} className="text-yellow-500 fill-current" /> {item.rating}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-black text-sm uppercase tracking-tight mb-1 line-clamp-2">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-muted line-clamp-2 mb-3 flex-1">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-black text-primary">₹{item.price}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-muted line-through">₹{item.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="bg-gray-50 rounded-[48px] p-10 md:p-16 text-center">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-4">
            Ready to order in {page.area || 'Jaipur'}?
          </h2>
          <p className="text-muted font-medium max-w-xl mx-auto mb-8">
            Install the Tiffica app for the fastest {page.primaryKeyword} experience — daily delivery, subscriptions, and secure payments.
          </p>
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="bg-black text-white px-10 py-5 rounded-pill font-black uppercase tracking-wide hover:bg-primary transition-all disabled:opacity-70"
          >
            Get Started
          </button>
        </section>
      </div>
    </div>
  );
}