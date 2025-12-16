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
    <div className="min-h-screen w-full overflow-y-auto relative">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/assets/bg/home.mp4" type="video/mp4" />
      </video>

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
      <div className="absolute inset-0 bg-black/5 pointer-events-none z-10"></div>
      
      <div className="relative z-20 min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-4 md:p-8">
        {/* Judul dengan gambar */}
        <motion.div
          className="mb-6 w-full max-w-4xl"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
        >
          <img
            src="/assets/judul/judul.png"
            alt="MARI JAGA BUMI!"
            className="w-full h-auto"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </motion.div>

        {/* Slogan - menggunakan gambar */}
        <motion.div
          className="mb-8 md:mb-12 w-full max-w-2xl px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <img
            src="/assets/judul/sub-judul.png"
            alt="Mari belajar alam sambil bermain!"
            className="w-full h-auto mx-auto"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </motion.div>

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
            className="relative overflow-hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src="/assets/tombol/petunjuk.png"
              alt="PETUNJUK"
              className="w-auto h-auto"
              style={{ 
                width: 'clamp(180px, 28vw, 280px)',
                height: 'auto',
                display: 'block'
              }}
            />
          </motion.button>

          {/* Tombol MULAI (Primary - Orange) - Lebih besar, tidak ada animasi looping */}
          <motion.button
            onClick={() => router.push('/menu')}
            className="relative overflow-hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src="/assets/tombol/start.png"
              alt="START"
              className="w-auto h-auto"
              style={{ 
                width: 'clamp(180px, 28vw, 280px)',
                height: 'auto',
                display: 'block'
              }}
            />
          </motion.button>

          {/* Tombol TENTANG */}
          <motion.button
            onClick={() => setShowTentang(true)}
            className="relative overflow-hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src="/assets/tombol/tentang.png"
              alt="TENTANG"
              className="w-auto h-auto"
              style={{ 
                width: 'clamp(180px, 28vw, 280px)',
                height: 'auto',
                display: 'block'
              }}
            />
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
