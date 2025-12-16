'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import SoundManager from '@/components/SoundManager';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Simulasi progress loading
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Auto close setelah 1 detik
    const timer = setTimeout(() => {
      setLoadingProgress(100);
      setIsExiting(true);
      setTimeout(() => {
        onComplete();
      }, 300);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-green-400 via-blue-400 to-cyan-500"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: 'blur(10px)'
          }}
          transition={{ 
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {/* Sound untuk splash */}
          <SoundManager 
            soundKey="splash-sound" 
            src="/assets/sound/Opening.mp3" 
            loop={true} 
            volume={0.6} 
            autoPlay={true}
            playOnInteraction={true}
          />
          
          {/* Si Lala Character */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ 
              scale: 0.8, 
              opacity: 0,
              filter: 'blur(5px)'
            }}
            transition={{ 
              duration: 0.6, 
              type: "spring"
            }}
            className="relative mb-8"
          >
            <Image
              src="/assets/karakter/lala.png"
              alt="Si Lala"
              width={200}
              height={200}
              priority
              className="drop-shadow-2xl"
            />
          </motion.div>

          {/* Loading Bar */}
          <motion.div
            className="w-64 sm:w-80 md:w-96 h-2 bg-white/30 rounded-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </motion.div>

          {/* Loading Text */}
          <motion.p
            className="mt-4 text-white text-sm sm:text-base font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            Memuat aset...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
