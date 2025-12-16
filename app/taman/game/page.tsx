'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import SiLala from '@/app/components/SiLala';
import LandscapePrompt from '@/components/LandscapePrompt';
import SoundManager from '@/components/SoundManager';
import { updateBadge } from '@/lib/storage';
import { playSoundEffect, playCelebrationSound } from '@/lib/soundEffects';

type WasteType = 'organik' | 'plastik' | 'kertas';

interface WasteItem {
  id: number;
  name: string;
  type: WasteType;
  image: string;
  x: number;
  y: number;
  rotate: number;
}

interface TrashBin {
  id: string;
  type: WasteType;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function TamanGamePage() {
  const router = useRouter();
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [sortedItems, setSortedItems] = useState<Set<number>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [gameComplete, setGameComplete] = useState(false);

  // Sampah tersebar realistis di lantai kayu - dari kiri ke kanan
  const wasteItems: WasteItem[] = [
    { id: 1, name: 'Daun Kering', type: 'organik', image: '/assets/items/sampah-daun.svg', x: 8, y: 72, rotate: 15 },
    { id: 2, name: 'Botol Plastik', type: 'plastik', image: '/assets/items/sampah-botol.svg', x: 48, y: 85, rotate: -25 },
    { id: 3, name: 'Kertas Bekas', type: 'kertas', image: '/assets/items/sampah-kertas.svg', x: 55, y: 55, rotate: 10 },
    { id: 4, name: 'Kulit Pisang', type: 'organik', image: '/assets/items/sampah-pisang.svg', x: 62, y: 78, rotate: -8 },
    { id: 5, name: 'Kaleng Bekas', type: 'plastik', image: '/assets/items/sampah-kaleng.svg', x: 78, y: 88, rotate: 35 },
    { id: 6, name: 'Kantong Plastik', type: 'plastik', image: '/assets/items/sampah-kantong.svg', x: 92, y: 75, rotate: -15 },
  ];

  // Drop zone - posisi sudah disesuaikan dengan tong sampah di gambar
  const trashBins: TrashBin[] = [
    { id: 'kertas', type: 'kertas', label: 'Kertas (Biru)', x: 11.5, y: 90, w: 7, h: 20 },
    { id: 'plastik', type: 'plastik', label: 'Plastik (Kuning)', x: 23.8, y: 90, w: 7, h: 20 },
    { id: 'organik', type: 'organik', label: 'Organik (Hijau)', x: 36.5, y: 90, w: 7, h: 20 },
  ];

  const handleDragStart = (e: React.DragEvent, itemId: number) => {
    if (sortedItems.has(itemId)) {
      e.preventDefault();
      return;
    }
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId.toString());
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, binType: WasteType) => {
    e.preventDefault();

    if (!draggedItem) return;

    const wasteItem = wasteItems.find((item) => item.id === draggedItem);
    if (!wasteItem) return;

    if (wasteItem.type === binType) {
      playSoundEffect('success');
      setSortedItems((prev) => new Set([...prev, draggedItem]));
      const newCount = sortedItems.size + 1;

      setToastMessage('Benar! Kamu pintar! 🎉');
      setToastType('success');
      setShowToast(true);

      if (newCount === wasteItems.length) {
        setGameComplete(true);
        setTimeout(() => {
          updateBadge('taman', true);
          playCelebrationSound();
          setToastMessage('Kamu berhasil memilah semua sampah! Taman jadi bersih! 🏆');
          setToastType('success');
          setShowToast(true);
        }, 1000);
      }
    } else {
      playSoundEffect('error');
      setToastMessage('Ups! Coba lagi ya! ❌');
      setToastType('error');
      setShowToast(true);
    }

    setDraggedItem(null);
  };

  const sortedCount = sortedItems.size;

  return (
    <div className="min-h-screen w-full overflow-y-auto mobile-scrollable">
      {/* Sound */}
      {!gameComplete && (
        <SoundManager 
          soundKey="taman-game-sound" 
          src="/assets/sound/Game taman.mp3" 
          loop={true} 
          volume={0.4} 
          autoPlay={true}
          playOnInteraction={true}
        />
      )}

      {/* Landscape Prompt for Mobile */}
      <LandscapePrompt />

      {/* Full Screen Background with aspect ratio maintained */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/bg/taman_kota.png')",
          // Ensure background covers properly in landscape
          backgroundSize: 'cover',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full w-full">
        {/* Header - dipindahkan ke kiri atas agar tidak menutupi elemen penting */}
        <motion.div
          className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 z-30 max-w-xs sm:max-w-sm"
          initial={{ y: -30, opacity: 0, x: -50 }}
          animate={{ y: 0, opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1"
            style={{ fontFamily: 'var(--font-baloo)', textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
          >
            Ayo Pilah Sampah! 🗑️
          </h1>
          <p
            className="text-[10px] sm:text-xs md:text-sm text-white"
            style={{ fontFamily: 'var(--font-baloo)', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
          >
            Seret sampah ke tempat sampah yang sesuai!
          </p>
        </motion.div>

        {/* Progress - dipindahkan ke kiri bawah header */}
        <motion.div
          className="absolute top-16 sm:top-20 md:top-24 left-2 sm:left-3 md:left-4 z-30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-green-500 rounded-full px-3 sm:px-4 py-1 shadow-lg">
            <p
              className="text-xs sm:text-sm md:text-base font-bold text-white"
              style={{ fontFamily: 'var(--font-baloo)' }}
            >
              {sortedCount}/{wasteItems.length} Sampah Dipilah
            </p>
          </div>
        </motion.div>

        {/* Sampah - ukuran responsive menggunakan vw */}
        {wasteItems.map((item, index) => {
          const isSorted = sortedItems.has(item.id);
          const isDragging = draggedItem === item.id;

          if (isSorted) return null;

          return (
            <motion.div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, item.id)}
              onDragEnd={handleDragEnd}
              className={`absolute cursor-grab active:cursor-grabbing z-20 ${isDragging ? 'opacity-60 scale-110' : 'hover:scale-110'}`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotate}deg)`,
                // Ukuran responsive: lebih kecil di mobile portrait, lebih besar di landscape/desktop
                width: 'clamp(28px, 3.5vw, 55px)',
                height: 'clamp(28px, 3.5vw, 55px)',
              }}
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                rotate: 0,
                y: [0, -5, 0],
              }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3 + index * 0.1,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{ scale: 1.2, rotate: 5, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain drop-shadow-lg"
                style={{
                  filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.4))',
                }}
                draggable={false}
              />
            </motion.div>
          );
        })}

        {/* Drop Zones - responsive dengan vw/vh */}
        {trashBins.map((bin) => {
          const isCorrectBin = draggedItem
            ? wasteItems.find((w) => w.id === draggedItem)?.type === bin.type
            : false;

          return (
            <motion.div
              key={bin.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, bin.type)}
              className={`absolute rounded-lg transition-all z-10 ${
                draggedItem
                  ? isCorrectBin
                    ? 'bg-green-400/50 ring-4 ring-green-400'
                    : 'bg-white/20 ring-2 ring-white/40'
                  : ''
              }`}
              style={{
                left: `${bin.x}%`,
                top: `${bin.y}%`,
                width: `${bin.w}%`,
                height: `${bin.h}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            />
          );
        })}

        {/* Si Lala - responsive position */}
        <motion.div
          className="absolute z-30"
          style={{
            bottom: '22%',
            left: '1%',
          }}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
            <SiLala size={48} animate={false} />
          </div>
        </motion.div>

        {/* Legend - responsive */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 flex gap-2 sm:gap-3 z-30"
          style={{ bottom: '1%' }}
        >
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></span>
            <span className="text-white font-semibold text-[8px] sm:text-[10px] md:text-xs" style={{ fontFamily: 'var(--font-baloo)' }}>Organik</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></span>
            <span className="text-white font-semibold text-[8px] sm:text-[10px] md:text-xs" style={{ fontFamily: 'var(--font-baloo)' }}>Plastik</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></span>
            <span className="text-white font-semibold text-[8px] sm:text-[10px] md:text-xs" style={{ fontFamily: 'var(--font-baloo)' }}>Kertas</span>
          </span>
        </div>

        {/* Button - responsive position dengan spacing lebih longgar di mobile */}
        <motion.div
          className="absolute z-30"
          style={{
            bottom: 'clamp(8px, 1.5vh, 16px)',
            right: 'clamp(8px, 1.5vw, 16px)',
          }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {gameComplete ? (
            <Button onClick={() => router.push('/menu')} variant="primary">
              🏠 SELESAI
            </Button>
          ) : (
            <Button onClick={() => router.push('/taman')} variant="secondary">
              ← Kembali
            </Button>
          )}
        </motion.div>
      </div>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
      />
    </div>
  );
}
