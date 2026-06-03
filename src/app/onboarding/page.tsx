'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, UtensilsCrossed, MapPin, Rocket, PartyPopper } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const slides: { Icon: LucideIcon; image: string; title: string; desc: string; bg: string }[] = [
  {
    Icon: UtensilsCrossed,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
    title: 'Fresh Home-Cooked Meals',
    desc: 'Enjoy authentic tiffin meals made fresh daily by local cloud kitchens near you.',
    bg: 'from-orange-400 to-amber-400',
  },
  {
    Icon: MapPin,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    title: 'Kitchens Near You',
    desc: 'We find the best cloud kitchens within 5km of your location and show their menus.',
    bg: 'from-amber-400 to-yellow-400',
  },
  {
    Icon: Rocket,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
    title: 'Order & Subscribe',
    desc: 'Order single meals or subscribe for weekly tiffin plans. Healthy eating made easy!',
    bg: 'from-orange-500 to-red-400',
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    router.push('/login');
  };

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      completeOnboarding();
    }
  };

  const skip = () => completeOnboarding();

  const slide = slides[current];
  const SlideIcon = slide.Icon;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className={`relative bg-gradient-to-br ${slide.bg} flex-shrink-0`} style={{ height: '55vh' }}>
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover mix-blend-overlay opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <SlideIcon className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={1.5} />
          </div>
        </div>

        {current < slides.length - 1 && (
          <button
            onClick={skip}
            className="absolute top-5 right-5 text-white/80 text-sm font-semibold bg-black/20 px-4 py-1.5 rounded-full"
          >
            Skip
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-between px-8 py-10">
        <div className="flex gap-2 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-orange-500' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="text-center flex-1 flex flex-col justify-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">{slide.title}</h2>
          <p className="text-gray-500 text-base leading-relaxed">{slide.desc}</p>
        </div>

        <button
          onClick={next}
          className={`w-full py-4 bg-gradient-to-r ${slide.bg} text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 text-base mt-6`}
        >
          {current < slides.length - 1 ? (
            <>Next <ChevronRight className="w-5 h-5" /></>
          ) : (
            <>
              Let&apos;s Get Started <PartyPopper className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
