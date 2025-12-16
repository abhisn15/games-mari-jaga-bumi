'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import SiLala from '@/app/components/SiLala';
import LandscapePrompt from '@/components/LandscapePrompt';
import SoundManager from '@/components/SoundManager';
import { updateBadge } from '@/lib/storage';
import { playSoundEffect, playCelebrationSound } from '@/lib/soundEffects';

interface TrashItem {
  id: number;
  name: string;
  image: string;
  x: number;
  y: number;
  rotate: number;
  size: number;
}

export default function PantaiGamePage() {
  const router = useRouter();
  const [cleanedItems, setCleanedItems] = useState<Set<number>>(new Set());
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [gameComplete, setGameComplete] = useState(false);
  const [showHappyFish, setShowHappyFish] = useState(false);

  // Sampah berserakan di pantai - posisi natural
  const trashItems: TrashItem[] = [
    { id: 1, name: 'Botol Plastik', image: '/assets/items/sampah-botol.svg', x: 30, y: 75, rotate: -20, size: 45 },
    { id: 2, name: 'Kantong Plastik', image: '/assets/items/sampah-kantong.svg', x: 55, y: 68, rotate: 15, size: 40 },
    { id: 3, name: 'Kaleng Bekas', image: '/assets/items/sampah-kaleng.svg', x: 75, y: 72, rotate: -10, size: 38 },
    { id: 4, name: 'Botol Plastik', image: '/assets/items/sampah-botol.svg', x: 45, y: 82, rotate: 25, size: 42 },
    { id: 5, name: 'Kantong Plastik', image: '/assets/items/sampah-kantong.svg', x: 65, y: 80, rotate: -30, size: 38 },
  ];

  // Posisi keranjang di pojok - kita pakai area invisible
  const basketPosition = { x: 88, y: 85, w: 12, h: 14 };

  const handleDragStart = (e: React.DragEvent, itemId: number) => {
    if (cleanedItems.has(itemId)) {
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const trashItem = trashItems.find((item) => item.id === draggedItem);
    if (!trashItem) return;

    playSoundEffect('success');
    setCleanedItems((prev) => new Set([...prev, draggedItem]));
    const newCount = cleanedItems.size + 1;
    
    setToastMessage(`Bagus! ${trashItem.name} sudah dibuang! 🎉`);
    setToastType('success');
    setShowToast(true);

    if (newCount === trashItems.length) {
      setGameComplete(true);
      setShowHappyFish(true);
      setTimeout(() => {
        updateBadge('pantai', true);
        playCelebrationSound();
        setToastMessage('Pantai bersih! Hewan laut senang! 🏆');
        setToastType('success');
        setShowToast(true);
      }, 1000);
    }

    setDraggedItem(null);
  };

  const cleanedCount = cleanedItems.size;

  return (
    <div className="min-h-screen w-full overflow-y-auto mobile-scrollable">
      {/* Sound */}
      {!gameComplete && (
        <SoundManager 
          soundKey="pantai-game-sound" 
          src="/assets/sound/Modul pantai.mp3" 
          loop={true} 
          volume={0.4} 
          autoPlay={true}
          playOnInteraction={true}
        />
      )}

      {/* Landscape Prompt for Mobile */}
      <LandscapePrompt />

      {/* Single Full Screen Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/bg/pantai.png')",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-3 md:p-4">
        {/* Header */}
        <motion.div
          className="text-center mb-2"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg"
            style={{ fontFamily: 'var(--font-baloo)', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            Ayo Bersihkan Pantai! 🏖️
          </h1>
          <p
            className="text-xs md:text-sm text-white drop-shadow-md"
            style={{ fontFamily: 'var(--font-baloo)', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
          >
            Geser sampah plastik ke keranjang!
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          className="flex justify-center mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-cyan-500 rounded-full px-4 py-1 shadow-lg">
            <p
              className="text-sm md:text-base font-bold text-white"
              style={{ fontFamily: 'var(--font-baloo)' }}
            >
              {cleanedCount}/{trashItems.length} Sampah Dibersihkan
            </p>
          </div>
        </motion.div>

        {/* Sampah berserakan di pantai - TANPA border dan bg */}
        {trashItems.map((item, index) => {
          const isCleaned = cleanedItems.has(item.id);
          const isDragging = draggedItem === item.id;

          if (isCleaned) return null;

          return (
            <motion.div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, item.id)}
              onDragEnd={handleDragEnd}
              className={`absolute cursor-grab active:cursor-grabbing z-20 ${
                isDragging ? 'opacity-60 scale-110' : 'hover:scale-110'
              }`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotate}deg)`,
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
                width={item.size}
                height={item.size}
                className="drop-shadow-lg"
                style={{ 
                  filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.4))',
                }}
                draggable={false}
              />
            </motion.div>
          );
        })}

        {/* Keranjang Drop Zone */}
        <motion.div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`absolute rounded-2xl transition-all z-30 ${
            draggedItem
              ? 'bg-green-400/40 ring-4 ring-green-400 scale-105'
              : ''
          }`}
          style={{
            right: '4%',
            bottom: '8%',
            width: '80px',
            height: '90px',
          }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Image
            src="/assets/items/keranjang.svg"
            alt="Keranjang"
            width={80}
            height={90}
            className="w-full h-full"
            style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.5))' }}
          />
          {cleanedCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg">
              {cleanedCount}
            </div>
          )}
        </motion.div>

        {/* Si Lala - pojok kiri bawah */}
        <motion.div
          className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-30"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <SiLala size={50} animate={false} />
        </motion.div>

        {/* Ikan berenang gembira */}
        <AnimatePresence>
          {showHappyFish && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-4xl md:text-5xl z-20"
                  initial={{ x: -100, rotate: 0 }}
                  animate={{ 
                    x: '120vw',
                    rotate: [0, 360],
                    y: [0, -20, 0, 20, 0],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.3,
                  }}
                  style={{ top: `${20 + i * 15}%` }}
                >
                  {['🐟', '🐠', '🐡', '🐬', '🦈'][i]}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Button - pojok kanan atas dengan spacing lebih longgar di mobile */}
        <motion.div
          className="absolute top-14 right-3 sm:top-16 sm:right-4 md:top-20 md:right-6 z-30"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {gameComplete ? (
            <Button onClick={() => router.push('/menu')} variant="primary">
              🏠 SELESAI
            </Button>
          ) : (
            <Button onClick={() => router.push('/pantai')} variant="secondary">
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
