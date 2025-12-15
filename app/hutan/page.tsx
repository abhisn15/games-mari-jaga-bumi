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

export default function HutanPage() {
  const router = useRouter();
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Hotspot sesuai posisi objek di gambar hutan.png (berdasarkan gambar)
  const hotspots: Hotspot[] = [
    {
      id: 'singa',
      title: 'Singa 🦁',
      body: 'Singa adalah raja hutan! Mereka berburu bersama dalam kelompok yang disebut pride.',
      x: 12,
      y: 55,
      w: 16,
      h: 20,
    },
    {
      id: 'toucan',
      title: 'Toucan 🦜',
      body: 'Toucan punya paruh besar yang berwarna-warni. Mereka suka makan buah!',
      x: 20,
      y: 25,
      w: 10,
      h: 12,
    },
    {
      id: 'badak',
      title: 'Badak 🦏',
      body: 'Badak adalah hewan besar dengan cula di hidungnya. Mereka sangat kuat!',
      x: 48,
      y: 58,
      w: 18,
      h: 22,
    },
    {
      id: 'gorilla',
      title: 'Gorilla 🦍',
      body: 'Gorilla adalah primata terbesar. Mereka sangat pintar dan suka makan buah!',
      x: 72,
      y: 66,
      w: 16,
      h: 20,
    },
    {
      id: 'parrot',
      title: 'Burung Beo 🦜',
      body: 'Burung beo bisa menirukan suara! Mereka punya bulu yang sangat indah dan berwarna-warni.',
      x: 75,
      y: 28,
      w: 12,
      h: 14,
    },
    {
      id: 'daun',
      title: 'Daun Hijau 🍃',
      body: 'Daun hijau membuat hutan menjadi sejuk dan memberikan oksigen untuk kita bernapas.',
      x: 70,
      y: 20,
      w: 10,
      h: 12,
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
      <SoundManager src="/assets/sound/Latar Hutan.mp3" loop={true} volume={0.4} />

      {/* Landscape Prompt for Mobile */}
      <LandscapePrompt />

      {/* Single Full Screen Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/bg/hutan.png')",
        }}
      />

      {/* Overlay gradient untuk readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10 pointer-events-none" />

      {/* Content Layer - Scrollable */}
      <div className="relative z-10 min-h-screen w-full flex flex-col overflow-y-auto">
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
              Hutan Hijau yang Indah!
            </h1>
            <p
              className="text-[10px] sm:text-xs md:text-sm text-white/90 drop-shadow-md"
              style={{ fontFamily: 'var(--font-baloo)' }}
            >
              Ketuk hewan dan tumbuhan untuk belajar! 👆
            </p>
          </div>
        </motion.div>

        {/* Hotspots - Fixed position agar tidak terpengaruh scroll */}
        {hotspots.map((hotspot, index) => (
          <motion.button
            key={hotspot.id}
            className="fixed rounded-full border-2 md:border-3 border-green-400 bg-green-400/30 transition-all hover:bg-green-400/50 cursor-pointer z-20"
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
              className="absolute inset-0 rounded-full border-2 border-green-400"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
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
              onClick={() => router.push('/hutan/game')}
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
