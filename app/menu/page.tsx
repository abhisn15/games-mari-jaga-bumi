'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import CardEnv from '@/components/CardEnv';
import Button from '@/components/Button';
import SiLala from '@/app/components/SiLala';
import SoundManager from '@/components/SoundManager';
import { resetBadges } from '@/lib/storage';
import Toast from '@/components/Toast';

export default function MenuPage() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleReset = () => {
    if (
      confirm(
        'Yakin ingin mereset semua progress? Semua lencana yang sudah didapat akan hilang!'
      )
    ) {
      resetBadges();
      setToastMessage('Progress berhasil direset! 🔄');
      setShowToast(true);
      // Reload page untuk update badge status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 overflow-y-auto">
      {/* Sound Opening - Background Music di Menu */}
      <SoundManager 
        soundKey="menu-sound" 
        src="/assets/sound/Opening.mp3" 
        loop={true} 
        volume={0.5} 
        autoPlay={true}
        playOnInteraction={true}
      />

      <div className="mx-auto max-w-7xl min-h-screen flex flex-col p-3 sm:p-4 md:p-6">
        {/* Si Lala Welcome - Compact */}
        <motion.div
          className="flex flex-col items-center mb-3 sm:mb-4 md:mb-6 flex-shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 0.6, 
              delay: 0.2, 
              type: "spring",
              y: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            whileHover={{ scale: 1.15, rotate: 10, y: -5 }}
          >
            <SiLala size={60} className="sm:w-16 sm:h-16 md:w-20 md:h-20" />
          </motion.div>
          <motion.h1
            className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-800 px-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            Pilih Lingkungan yang Ingin Kamu Jelajahi! 🌍
          </motion.h1>
        </motion.div>

        {/* Cards Grid - Scrollable */}
        <motion.div
          className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 flex-1 mb-4 sm:mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.div
            className="h-[280px] sm:h-[320px] md:h-[400px] lg:h-full"
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 200 }}
          >
            <CardEnv 
              id="hutan" 
              title="Hutan" 
              badgeName="Pahlawan Hutan"
              description="Kenalan dengan tumbuhan dan hewan yang tinggal di hutan."
            />
          </motion.div>
          <motion.div
            className="h-[280px] sm:h-[320px] md:h-[400px] lg:h-full"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7, type: "spring", stiffness: 200 }}
          >
            <CardEnv 
              id="taman" 
              title="Taman Kota" 
              badgeName="Penjaga Taman"
              description="Belajar memilah sampah dan menjaga kebersihan."
            />
          </motion.div>
          <motion.div
            className="h-[280px] sm:h-[320px] md:h-[400px] lg:h-full"
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 200 }}
          >
            <CardEnv 
              id="pantai" 
              title="Pantai" 
              badgeName="Sahabat Laut"
              description="Menjaga laut agar tetap bersih dan aman untuk hewan laut."
            />
          </motion.div>
        </motion.div>

        {/* Buttons - Fixed at bottom */}
        <motion.div
          className="flex flex-col gap-2 sm:gap-3 text-center sm:flex-row sm:justify-center flex-shrink-0 pb-2 sm:pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Button href="/reward" variant="secondary">
            🏆 Lihat Reward
          </Button>
          <Button onClick={handleReset} variant="danger">
            🔄 Reset Progress
          </Button>
        </motion.div>
      </div>

      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
      />
    </div>
  );
}
