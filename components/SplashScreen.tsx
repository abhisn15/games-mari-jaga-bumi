'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import SoundManager from '@/components/SoundManager';

interface SplashScreenProps {
  onComplete: () => void;
}

// Preload assets penting untuk halaman awal
const preloadAssets = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  const assets = [
    // Video background home
    { type: 'video', src: '/assets/bg/home.mp4' },
    // Images untuk home page
    { type: 'image', src: '/assets/judul/judul.png' },
    { type: 'image', src: '/assets/judul/sub-judul.png' },
    { type: 'image', src: '/assets/judul/judul_menu.png' },
    { type: 'image', src: '/assets/tombol/petunjuk.png' },
    { type: 'image', src: '/assets/tombol/start.png' },
    { type: 'image', src: '/assets/tombol/tentang.png' },
    // Background images untuk menu
    { type: 'image', src: '/assets/bg/hutan.png' },
    { type: 'image', src: '/assets/bg/taman_kota.png' },
    { type: 'image', src: '/assets/bg/pantai.png' },
    // Karakter
    { type: 'image', src: '/assets/karakter/lala.png' },
    // Audio files - semua sound yang digunakan di aplikasi
    { type: 'audio', src: '/assets/sound/Opening.mp3' },
    { type: 'audio', src: '/assets/sound/Game hutan.mp3' },
    { type: 'audio', src: '/assets/sound/Game taman.mp3' },
    { type: 'audio', src: '/assets/sound/Latar Hutan.mp3' },
    { type: 'audio', src: '/assets/sound/Modul pantai.mp3' },
    { type: 'audio', src: '/assets/sound/modul taman.mp3' },
    { type: 'audio', src: '/assets/sound/reward.mp3' },
  ];

  const loadAsset = (asset: { type: string; src: string }): Promise<void> => {
    return new Promise((resolve) => {
      if (asset.type === 'video') {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.oncanplaythrough = () => resolve();
        video.onerror = () => resolve(); // Continue even if fails
        video.src = asset.src;
      } else if (asset.type === 'audio') {
        const audio = document.createElement('audio');
        audio.preload = 'auto';
        // Audio bisa dianggap loaded setelah metadata loaded atau canplay
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('loadeddata', () => resolve(), { once: true });
        audio.onerror = () => resolve(); // Continue even if fails
        audio.src = asset.src;
        // Trigger load
        audio.load();
      } else {
        const img = document.createElement('img');
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if fails
        img.src = asset.src;
      }
    });
  };

  // Load dengan timeout maksimal 3.5 detik (ditambah untuk audio)
  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 3500);
  });

  await Promise.race([
    Promise.all(assets.map(loadAsset)),
    timeoutPromise,
  ]);
};

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let mounted = true;

    const startLoading = async () => {
      // Simulasi progress awal
      let progress = 0;
      progressInterval = setInterval(() => {
        if (!mounted) return;
        progress += 5;
        if (progress > 90) {
          progress = 90; // Hold at 90% until assets loaded
        }
        setLoadingProgress(progress);
      }, 50);

      // Preload assets
      await preloadAssets();

      if (!mounted) return;

      // Complete loading
      clearInterval(progressInterval);
      setLoadingProgress(100);

      // Exit setelah progress 100%
      setTimeout(() => {
        if (!mounted) return;
        setIsExiting(true);
        setTimeout(() => {
          if (mounted) {
            onComplete();
          }
        }, 300);
      }, 200);
    };

    startLoading();

    // Fallback timeout maksimal 4 detik (ditambah untuk audio)
    const fallbackTimer = setTimeout(() => {
      if (mounted && loadingProgress < 100) {
        clearInterval(progressInterval);
        setLoadingProgress(100);
        setIsExiting(true);
        setTimeout(() => {
          if (mounted) {
            onComplete();
          }
        }, 300);
      }
    }, 4000);

    return () => {
      mounted = false;
      clearInterval(progressInterval);
      clearTimeout(fallbackTimer);
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
