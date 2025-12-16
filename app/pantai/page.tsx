'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import SiLala from '@/app/components/SiLala';
import LandscapePrompt from '@/components/LandscapePrompt';
import SoundManager from '@/components/SoundManager';
import { Hotspot } from '@/lib/types';

export default function PantaiPage() {
  const router = useRouter();
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Hotspot sesuai posisi objek di gambar pantai.png
  const hotspots: Hotspot[] = [
    {
      id: 'matahari',
      title: 'Matahari ☀️',
      body: 'Matahari memberikan cahaya dan kehangatan untuk semua makhluk di bumi.',
      x: 60,
      y: 0,
      w: 10,
      h: 12,
    },
    {
      id: 'pohon_kelapa',
      title: 'Pohon Kelapa 🌴',
      body: 'Pohon kelapa tumbuh di pantai dan buahnya sangat berguna untuk manusia.',
      x: 12,
      y: 50,
      w: 14,
      h: 35,
    },
    {
      id: 'penyu',
      title: 'Penyu 🐢',
      body: 'Penyu bisa salah makan plastik karena dikira ubur-ubur. Jangan buang sampah ke laut ya!',
      x: 37,
      y: 62,
      w: 10,
      h: 10,
    },
    {
      id: 'karang',
      title: 'Terumbu Karang 🪸',
      body: 'Karang adalah rumah ikan. Kita harus menjaganya dari polusi.',
      x: 56,
      y: 64,
      w: 12,
      h: 12,
    },
    {
      id: 'kepiting',
      title: 'Kepiting 🦀',
      body: 'Kepiting hidup di pasir dan mencari makan di tepi pantai.',
      x: 55,
      y: 90,
      w: 8,
      h: 10,
    },
    {
      id: 'bintang_laut',
      title: 'Bintang Laut ⭐',
      body: 'Bintang laut adalah hewan laut yang cantik. Mereka tinggal di dasar laut.',
      x: 33,
      y: 88,
      w: 8,
      h: 10,
    },
  ];

  const handleHotspotClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
  };

  return (
    <motion.div
      className="min-h-screen w-full overflow-y-auto"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Sound */}
      <SoundManager 
        soundKey="pantai-explore-sound" 
        src="/assets/sound/Modul pantai.mp3" 
        loop={true} 
        volume={0.4} 
        autoPlay={true}
        playOnInteraction={true}
      />

      {/* Landscape Prompt for Mobile */}
      <LandscapePrompt />

      {/* Single Full Screen Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/bg/pantai.png')",
        }}
      />

      {/* Overlay gradient untuk readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10 pointer-events-none" />

      {/* Content Layer - Bisa di-scroll di mobile */}
      <div className="relative z-10 h-screen w-full flex flex-col">
        {/* Header - Compact - Fixed di top */}
        <motion.div
          className="flex items-center justify-center gap-2 sm:gap-3 p-3 md:p-4 flex-shrink-0 bg-gradient-to-b from-black/20 to-transparent"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SiLala size={40} className="sm:w-12 sm:h-12" animate={false} />
          <div className="text-center">
            <h1
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg"
              style={{ fontFamily: 'var(--font-baloo)' }}
            >
              Pantai Biru yang Indah!
            </h1>
            <p
              className="text-[10px] sm:text-xs md:text-sm text-white/90 drop-shadow-md"
              style={{ fontFamily: 'var(--font-baloo)' }}
            >
              Ketuk objek untuk belajar! 👆
            </p>
          </div>
        </motion.div>

        {/* Hotspots - Fixed position agar tidak terpengaruh scroll */}
        {hotspots.map((hotspot, index) => (
          <motion.button
            key={hotspot.id}
            className="fixed rounded-full border-2 md:border-3 border-cyan-400 bg-cyan-400/30 transition-all hover:bg-cyan-400/50 cursor-pointer z-20"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              width: `${hotspot.w}%`,
              height: `${hotspot.h}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => handleHotspotClick(hotspot)}
            aria-label={hotspot.title}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.3 + index * 0.08,
              type: "spring",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Second pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-300"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </motion.button>
        ))}

        {/* Scrollable area untuk konten - hanya spacer */}
        <div className="flex-1 min-h-[60vh]" />

        {/* Buttons - Fixed di bottom dengan z-index tinggi */}
        <motion.div
          className="sticky bottom-0 right-0 flex flex-col gap-3 sm:gap-3 md:gap-2 z-[100] items-end p-3 sm:p-4 md:p-6 pointer-events-none bg-gradient-to-t from-black/30 to-transparent"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="pointer-events-auto">
            <Button
              onClick={() => router.push('/pantai/game')}
              variant="primary"
            >
              🎮 MAIN GAME
            </Button>
          </div>
          <div className="pointer-events-auto">
            <Button onClick={() => router.push('/menu')} variant="secondary">
              🏠 Menu
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      {selectedHotspot && (
        <Modal
          isOpen={!!selectedHotspot}
          onClose={() => setSelectedHotspot(null)}
          title={selectedHotspot.title}
        >
          <div className="flex items-center gap-4">
            <SiLala size={60} animate={false} />
            <p
              className="text-lg md:text-xl"
              style={{ fontFamily: 'var(--font-baloo)' }}
            >
              {selectedHotspot.body}
            </p>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
