'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useOrderAction } from '@/hooks/useOrderAction';
import { AppDownloadModal } from './AppDownloadModal';

export default function AboutCTA() {
  const { isMobile, showModal, setShowModal, handleOrderClick, handleDownloadApp } = useOrderAction();

  return (
    <>
      <div className="bg-black rounded-[64px] p-20 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white mb-8 uppercase tracking-tighter">Support the Tiffin revolution.</h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={handleOrderClick}
              disabled={isMobile === null}
              className="bg-primary text-white px-10 py-5 rounded-pill font-black text-lg transition-transform hover:scale-105 inline-flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              ORDER NOW <ArrowRight />
            </button>
            <Link href="/contact" className="bg-white text-black px-10 py-5 rounded-pill font-black text-lg transition-transform hover:scale-105">
              CONTACT US
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-pill -translate-x-1/2 -translate-y-1/2 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/20 rounded-pill translate-x-1/2 translate-y-1/2 blur-[100px]" />
      </div>

      <AppDownloadModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onDownload={handleDownloadApp}
      />
    </>
  );
}
