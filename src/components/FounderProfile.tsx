'use client';

import { useState } from 'react';

export interface FounderProfileProps {
  name: string;
  role: string;
  initials: string;
  imageSrc: string;
  imageAlt: string;
  description: string;
  highlights: string[];
  imagePosition: 'left' | 'right';
}

export default function FounderProfile({
  name,
  role,
  initials,
  imageSrc,
  imageAlt,
  description,
  highlights,
  imagePosition,
}: FounderProfileProps) {
  const [imgError, setImgError] = useState(false);

  const imageBlock = (
    <div className="relative aspect-[4/4] w-full max-w-md mx-auto lg:max-w-none overflow-hidden rounded-[48px] shadow-2xl group bg-gray-100">
      {!imgError ? (
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
          <span className="text-7xl font-black text-white tracking-tighter">{initials}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-8 left-8 right-8 z-10">
        <p className="text-white text-2xl font-black uppercase tracking-tight">{name}</p>
        <p className="text-orange-300 text-xs font-black uppercase tracking-[0.25em] mt-1">{role}</p>
      </div>
    </div>
  );

  const textBlock = (
    <div className={imagePosition === 'left' ? 'lg:pl-4' : 'lg:pr-4'}>
      <p className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">{role}</p>
      <h4 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-[0.95]">
        {name}
      </h4>
      <p className="text-xl text-muted font-medium leading-relaxed mb-8">{description}</p>
      <ul className="space-y-4">
        {highlights.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
            <span className="text-foreground/80 font-semibold leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <article className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      <div className={imagePosition === 'right' ? 'lg:order-2' : 'lg:order-1'}>{imageBlock}</div>
      <div className={imagePosition === 'right' ? 'lg:order-1' : 'lg:order-2'}>{textBlock}</div>
    </article>
  );
}
