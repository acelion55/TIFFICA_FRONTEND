'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useAppUpdate } from '@/hooks/useAppUpdate';

export function AppUpdateNotification() {
  const { updateAvailable, updateMessage, applyUpdate, dismissUpdate } = useAppUpdate();

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Download size={20} />
              </motion.div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{updateMessage}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={applyUpdate}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition active:scale-95"
              >
                Update Now
              </button>
              <button
                onClick={dismissUpdate}
                className="p-2 hover:bg-blue-500/50 rounded-lg transition"
                aria-label="Dismiss"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
