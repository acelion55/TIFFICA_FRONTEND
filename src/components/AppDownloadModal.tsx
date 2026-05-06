'use client';

import { X, Download, Smartphone } from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function AppDownloadModal({ isOpen, onClose, onDownload }: AppDownloadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[48px] max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative p-8 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-pill border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-3xl font-black tracking-tight uppercase pr-12">
            Download the App
          </h2>
          <p className="text-sm text-muted font-medium mt-2">
            Get the best experience on mobile
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-[32px] p-8 text-center">
            <Smartphone className="w-16 h-16 mx-auto text-primary mb-4" />
            <p className="font-black text-lg uppercase tracking-tight mb-2">
              Order on the Go
            </p>
            <p className="text-sm text-muted font-medium">
              Download Tiffica app to place orders, track deliveries, and manage subscriptions seamlessly.
            </p>
          </div>

          {/* Download Button */}
          <button
            onClick={onDownload}
            className="w-full bg-primary text-white px-6 py-4 rounded-[24px] font-black text-lg uppercase flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-primary/30"
          >
            <Download size={24} />
            DOWNLOAD APP
          </button>

          {/* Continue on Web */}
          <button
            onClick={onClose}
            className="w-full border-2 border-gray-200 text-foreground px-6 py-4 rounded-[24px] font-black text-lg uppercase hover:bg-gray-50 transition-colors"
          >
            Continue on Web
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 rounded-b-[48px] text-center">
          <p className="text-xs text-muted font-medium uppercase tracking-widest">
            Available on iOS & Android
          </p>
        </div>
      </div>
    </div>
  );
}
