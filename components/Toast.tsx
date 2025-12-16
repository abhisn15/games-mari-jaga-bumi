'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const typeClasses = {
    success: 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white',
    error: 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white',
    info: 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white',
  };

  const emojis = {
    success: '🎉',
    error: '⚠️',
    info: 'ℹ️',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 sm:bottom-6 md:bottom-8 left-1/2 z-50 -translate-x-1/2 px-3 w-full max-w-sm sm:max-w-md"
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
        >
          <motion.div
            className={`rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 text-sm sm:text-base md:text-lg font-bold shadow-2xl border-3 border-white ${typeClasses[type]}`}
            style={{ fontFamily: 'var(--font-baloo)' }}
            animate={{
              boxShadow: type === 'success' ? [
                '0 10px 30px rgba(34, 197, 94, 0.5)',
                '0 15px 40px rgba(34, 197, 94, 0.7)',
                '0 10px 30px rgba(34, 197, 94, 0.5)',
              ] : [],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              <motion.span
                className="text-lg sm:text-xl md:text-2xl"
                animate={type === 'success' ? {
                  rotate: [0, 10, -10, 10, -10, 0],
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{
                  duration: 0.5,
                  repeat: type === 'success' ? Infinity : 0,
                  repeatDelay: 1,
                }}
              >
                {emojis[type]}
              </motion.span>
              <span>{message}</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
