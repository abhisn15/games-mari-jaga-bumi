'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Modal from '@/components/Modal';
import SplashScreen from '@/components/SplashScreen';
import SoundManager from '@/components/SoundManager';
import { petunjukText, tentangText } from '@/lib/content';

export default function Home() {
  const router = useRouter();
  const [showPetunjuk, setShowPetunjuk] = useState(false);
  const [showTentang, setShowTentang] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setSplashComplete(true);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div
      className="min-h-screen w-full overflow-y-auto"
      style={{
        backgroundImage: "url('/assets/bg/home.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Sound Opening - Background Music - Lanjutkan dari splash screen */}
      <SoundManager 
        soundKey="home-sound" 
        src="/assets/sound/Opening.mp3" 
        loop={true} 
        volume={0.6} 
        autoPlay={splashComplete}
        playOnInteraction={true}
      />

      {/* Overlay untuk kontras */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
      
      <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-4 md:p-8">
        {/* Judul dengan efek 3D seperti gambar */}
        <motion.h1
          className="mb-6 text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
          style={{
            textShadow: `
              -2px -2px 0 #22c55e,
              -4px -4px 0 #22c55e,
              -6px -6px 0 #22c55e,
              -8px -8px 0 #f97316,
              -10px -10px 0 #f97316,
              -12px -12px 0 #f97316,
              0 4px 8px rgba(0,0,0,0.4)
            `,
            fontFamily: 'var(--font-baloo)',
            letterSpacing: '3px',
            lineHeight: '1.1',
          }}
        >
          <div>PETUALANGAN</div>
          <div>LINGKUNGAN SI LALA</div>
        </motion.h1>

        {/* Slogan */}
        <motion.p
          className="mb-8 md:mb-12 text-lg md:text-xl lg:text-2xl font-semibold text-green-400 text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(34,197,94,0.6)',
            fontFamily: 'var(--font-baloo)',
          }}
        >
          Mari belajar alam sambil bermain!
        </motion.p>

        {/* Tombol Horizontal */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 md:gap-6 items-center justify-center w-full max-w-4xl px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Tombol PETUNJUK */}
          <motion.button
            onClick={() => setShowPetunjuk(true)}
            className="px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-full bg-gray-700 text-white text-base sm:text-lg md:text-xl font-bold border-3 sm:border-4 border-white shadow-lg hover:shadow-2xl transition-all duration-300 min-w-[140px] sm:min-w-[160px]"
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            PETUNJUK
          </motion.button>

          {/* Tombol MULAI (Primary - Orange) */}
          <motion.button
            onClick={() => router.push('/menu')}
            className="px-8 py-4 sm:px-10 sm:py-5 md:px-14 md:py-6 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white text-lg sm:text-xl md:text-2xl font-bold border-3 sm:border-4 border-white shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[160px] sm:min-w-[180px]"
            whileHover={{ scale: 1.2, y: -8, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              boxShadow: [
                '0 10px 30px rgba(249, 115, 22, 0.5)',
                '0 15px 40px rgba(249, 115, 22, 0.7)',
                '0 10px 30px rgba(249, 115, 22, 0.5)',
              ],
              scale: [1, 1.05, 1],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            MULAI
          </motion.button>

          {/* Tombol TENTANG */}
          <motion.button
            onClick={() => setShowTentang(true)}
            className="px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-full bg-gray-700 text-white text-base sm:text-lg md:text-xl font-bold border-3 sm:border-4 border-white shadow-lg hover:shadow-2xl transition-all duration-300 min-w-[140px] sm:min-w-[160px]"
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            TENTANG
          </motion.button>
        </motion.div>
      </div>

      <Modal
        isOpen={showPetunjuk}
        onClose={() => setShowPetunjuk(false)}
        title="Petunjuk"
      >
        <p style={{ fontFamily: 'var(--font-baloo)' }}>{petunjukText}</p>
      </Modal>

      <Modal
        isOpen={showTentang}
        onClose={() => setShowTentang(false)}
        title="Tentang"
      >
        <p style={{ fontFamily: 'var(--font-baloo)' }}>{tentangText}</p>
      </Modal>
    </div>
  );
}
