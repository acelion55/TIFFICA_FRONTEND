'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ProfileClient from '@/app/profile/profile-client';
import { useAuth } from '@/context/AuthContext';

export default function ProfileFlyout() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full shadow-md flex items-center justify-center hover:shadow-orange-200 hover:shadow-lg transition-all"
      >
        <span className="text-white text-sm font-extrabold">{initials}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="flex justify-end p-4 border-b border-gray-100">
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <ProfileClient />
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" />
      )}
    </>
  );
}
