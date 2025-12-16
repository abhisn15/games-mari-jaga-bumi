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

export default function TamanPage() {
  const router = useRouter();
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Hotspot sesuai posisi objek di gambar taman_kota.png - disesuaikan ulang
  const hotspots: Hotspot[] = [
    {
      id: 'sampah_biru',
      title: 'Tempat Sampah Kertas (Biru) 🔵',
      body: 'Kertas bisa didaur ulang menjadi kertas baru. Jangan dibuang sembarangan!',
      x: 7.6,
      y: 83,
      w: 7,
      h: 12,
    },
    {
      id: 'sampah_kuning',
      title: 'Tempat Sampah Plastik (Kuning) 🟡',
      body: 'Plastik butuh waktu lama untuk terurai. Jadi harus didaur ulang.',
      x: 20,
      y: 83,
      w: 7,
      h: 12,
    },
    {
      id: 'sampah_hijau',
      title: 'Tempat Sampah Organik (Hijau) 🟢',
      body: 'Sampah organik berasal dari sisa makhluk hidup, seperti daun dan sisa makanan.',
      x: 33,
      y: 83,
      w: 7,
      h: 12,
    },
    {
      id: 'bunga_ungu',
      title: 'Bunga Lavender 💜',
      body: 'Bunga lavender wangi dan cantik. Jangan dipetik sembarangan ya!',
      x: 8,
      y: 64,
      w: 6,
      h: 8,
    },
    {
      id: 'tanaman_pot',
      title: 'Tanaman Hias 🌿',
      body: 'Tanaman hias membuat taman lebih indah dan udara lebih segar.',
      x: 63.6,
      y: 72,
      w: 6,
      h: 12,
    },
    {
      id: 'bunga_kanan',
      title: 'Bunga Taman 🌸',
      body: 'Bunga-bunga ini membuat taman lebih indah. Rawat dan jaga ya!',
      x: 90,
      y: 68,
      w: 8,
      h: 10,
    },
    {
      id: 'pohon_kiri',
      title: 'Pohon Rindang 🌳',
      body: 'Pohon memberikan udara segar dan tempat teduh untuk bermain.',
      x: 0,
      y: 18,
      w: 14,
      h: 22,
    },
    {
      id: 'pohon_kanan',
      title: 'Pohon Besar 🌲',
      body: 'Pohon besar adalah rumah bagi burung dan serangga.',
      x: 90,
      y: 30,
      w: 14,
      h: 22,
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
        soundKey="taman-explore-sound" 
        src="/assets/sound/modul taman.mp3" 
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
          backgroundImage: "url('/assets/bg/taman_kota.png')",
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
              Taman Kota yang Bersih!
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
            className="fixed rounded-full border-2 md:border-3 border-emerald-400 bg-emerald-400/30 transition-all hover:bg-emerald-400/50 cursor-pointer z-20"
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
              className="absolute inset-0 rounded-full border-2 border-emerald-400"
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
              className="absolute inset-0 rounded-full border-2 border-emerald-300"
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
              onClick={() => router.push('/taman/game')}
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
