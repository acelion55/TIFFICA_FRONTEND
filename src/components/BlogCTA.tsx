'use client';

import { ArrowRight } from 'lucide-react';
import { useOrderAction } from '@/hooks/useOrderAction';
import { AppDownloadModal } from './AppDownloadModal';

export default function BlogCTA() {
  const { isMobile, showModal, setShowModal, handleOrderClick, handleDownloadApp } = useOrderAction();

  return (
    <>
      <div className="mt-32 p-12 bg-orange-50 rounded-[48px] text-center border-2 border-primary/10">
        <h3 className="text-3xl font-black tracking-tight mb-4 uppercase italic">Loved this story?</h3>
        <p className="text-muted font-medium mb-8">Wait till you taste our food. Experience the best tiffin service in Jaipur.</p>
        <button 
          onClick={handleOrderClick}
          disabled={isMobile === null}
          className="bg-primary text-white px-10 py-4 rounded-pill font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-transform inline-flex items-center gap-3 uppercase disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Order Your Tiffin <ArrowRight />
        </button>
      </div>

      <AppDownloadModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onDownload={handleDownloadApp}
      />
    </>
  );
}
