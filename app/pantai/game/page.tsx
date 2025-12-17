'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
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

// Fungsi untuk generate posisi random yang tidak overlap
function generateRandomPositions(count: number): Array<{ x: number; y: number; rotate: number }> {
  const positions: Array<{ x: number; y: number; rotate: number }> = [];
  const minDistance = 8; // Minimum jarak antar item dalam persen
  const maxAttempts = 100; // Maksimal percobaan untuk setiap item
  
  // Area yang valid untuk sampah (area pantai/laut, bukan langit)
  // X: 10-85% (hindari area keranjang di kanan bawah)
  // Y: 70-90% (area pantai/laut, tidak terlalu tinggi)
  const minX = 10;
  const maxX = 85;
  const minY = 70;
  const maxY = 90;

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let validPosition = false;
    let x = 0;
    let y = 0;

    while (!validPosition && attempts < maxAttempts) {
      x = Math.random() * (maxX - minX) + minX;
      y = Math.random() * (maxY - minY) + minY;
      
      // Cek apakah posisi ini tidak terlalu dekat dengan posisi lain
      validPosition = positions.every((pos) => {
        const distance = Math.sqrt(
          Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
        );
        return distance >= minDistance;
      });
      
      attempts++;
    }

    // Jika tidak menemukan posisi valid, gunakan posisi default yang tersebar
    if (!validPosition) {
      x = minX + (i * (maxX - minX) / count) + Math.random() * 5;
      y = minY + Math.random() * (maxY - minY);
    }

    const rotate = Math.random() * 60 - 30; // Rotasi antara -30 sampai 30 derajat
    positions.push({ x, y, rotate });
  }

  return positions;
}

export default function PantaiGamePage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cleanedItems, setCleanedItems] = useState<Set<number>>(new Set());
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [gameComplete, setGameComplete] = useState(false);
  const [showHappyFish, setShowHappyFish] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate posisi random sekali saat component mount
  const randomPositions = useMemo(() => generateRandomPositions(8), []);

  // Sampah berserakan di pantai/laut - posisi random yang tidak overlap
  // Menggunakan berbagai item yang ada di folder items
  const trashItems: TrashItem[] = useMemo(() => [
    { id: 1, name: 'Koran', image: '/assets/items/koran.svg', ...randomPositions[0], size: 45 },
    { id: 2, name: 'Kardus', image: '/assets/items/kardus.svg', ...randomPositions[1], size: 40 },
    { id: 3, name: 'Kertas', image: '/assets/items/kertas.svg', ...randomPositions[2], size: 38 },
    { id: 4, name: 'Botol Plastik', image: '/assets/items/botol-plastik.svg', ...randomPositions[3], size: 42 },
    { id: 5, name: 'Kaleng', image: '/assets/items/kaleng.svg', ...randomPositions[4], size: 38 },
    { id: 6, name: 'Kantong Plastik', image: '/assets/items/kantong-plastik.svg', ...randomPositions[5], size: 40 },
    { id: 7, name: 'Daun', image: '/assets/items/daun.svg', ...randomPositions[6], size: 35 },
    { id: 8, name: 'Kulit Pisang', image: '/assets/items/kulit-pisang.svg', ...randomPositions[7], size: 36 },
  ], [randomPositions]);

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
      setShowConfetti(true);
      updateBadge('pantai', true);
      playCelebrationSound();
      
      // Tampilkan modal setelah 500ms
      setTimeout(() => {
        setShowSuccessModal(true);
        // Auto-close modal dan redirect setelah 3 detik
        setTimeout(() => {
          setShowSuccessModal(false);
          setTimeout(() => router.push('/menu'), 1000);
        }, 3000);
      }, 500);
    }

    setDraggedItem(null);
  };

  // Helper: drop menggunakan koordinat (untuk touch)
  const handleDropByPosition = (itemId: number, xPercent: number, yPercent: number) => {
    const trashItem = trashItems.find((item) => item.id === itemId);
    if (!trashItem) return;

    const inBasket =
      xPercent >= basketPosition.x &&
      xPercent <= basketPosition.x + basketPosition.w &&
      yPercent >= basketPosition.y &&
      yPercent <= basketPosition.y + basketPosition.h;

    if (!inBasket) {
      setDraggedItem(null);
      return;
    }

    playSoundEffect('success');
    setCleanedItems((prev) => new Set([...prev, itemId]));
    const newCount = cleanedItems.size + 1;

    setToastMessage(`Bagus! ${trashItem.name} sudah dibuang! 🎉`);
    setToastType('success');
    setShowToast(true);

    if (newCount === trashItems.length) {
      setGameComplete(true);
      setShowHappyFish(true);
      setShowConfetti(true);
      updateBadge('pantai', true);
      playCelebrationSound();
      
      setTimeout(() => {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setTimeout(() => router.push('/'), 1000);
        }, 3000);
      }, 500);
    }

    setDraggedItem(null);
  };

  const handleTouchStartItem = (itemId: number) => {
    if (cleanedItems.has(itemId)) return;
    setDraggedItem(itemId);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggedItem || !containerRef.current) {
      setDraggedItem(null);
      return;
    }
    const touch = e.changedTouches[0];
    if (!touch) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPercent = ((touch.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((touch.clientY - rect.top) / rect.height) * 100;
    handleDropByPosition(draggedItem, xPercent, yPercent);
  };

  const cleanedCount = cleanedItems.size;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden"
      onTouchEnd={handleTouchEnd}
    >
      {/* Confetti Effect */}
      {showConfetti && windowSize.width > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          gravity={0.3}
          recycle={false}
          tweenDuration={4000}
        />
      )}

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
      <div className="relative z-10 w-full h-full p-3 md:p-4">
        {/* Header - dipindahkan ke kiri atas agar tidak menutupi matahari dan elemen penting */}
        <motion.div
          className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 z-30 max-w-xs sm:max-w-sm"
          initial={{ y: -30, opacity: 0, x: -50 }}
          animate={{ y: 0, opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-lg mb-1"
            style={{ fontFamily: 'var(--font-baloo)', textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
          >
            Ayo Bersihkan Pantai! 🏖️
          </h1>
          <p
            className="text-[10px] sm:text-xs md:text-sm text-white drop-shadow-md"
            style={{ fontFamily: 'var(--font-baloo)', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
          >
            Geser sampah plastik ke keranjang!
          </p>
        </motion.div>

        {/* Progress - dipindahkan ke kiri bawah header */}
        <motion.div
          className="absolute top-16 sm:top-20 md:top-24 left-2 sm:left-3 md:left-4 z-30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-cyan-500 rounded-full px-3 sm:px-4 py-1 shadow-lg">
            <p
              className="text-xs sm:text-sm md:text-base font-bold text-white"
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
              onTouchStart={() => handleTouchStartItem(item.id)}
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
              }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3 + index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15,
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
                  initial={{ x: -100, rotate: 0, y: 0 }}
                  animate={{ 
                    x: '120vw',
                    rotate: [0, 360],
                    y: [0, -20],
                  }}
                  transition={{
                    x: {
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.3,
                    },
                    rotate: {
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.3,
                    },
                    y: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    },
                  }}
                  style={{ top: `${20 + i * 15}%` }}
                >
                  {['🐟', '🐠', '🐡', '🐬', '🦈'][i]}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Button - dipindahkan ke kanan atas agar lebih terlihat */}
        <motion.div
          className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-50"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
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

      {/* Success Modal dengan Confetti */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            {/* Confetti di dalam modal */}
            {windowSize.width > 0 && (
              <Confetti
                width={windowSize.width}
                height={windowSize.height}
                numberOfPieces={300}
                gravity={0.3}
                recycle={false}
                tweenDuration={5000}
              />
            )}
            <motion.div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0, y: 100, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                exit={{ scale: 0.3, opacity: 0, y: 100, rotate: 20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25,
                  duration: 0.6
                }}
                className="relative bg-gradient-to-br from-cyan-100 via-white to-blue-50 rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-cyan-400 max-w-md w-full overflow-hidden"
              >
                {/* Background shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="text-center relative z-10"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <motion.div
                    className="text-6xl md:text-7xl mb-4"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.3],
                    }}
                    transition={{ 
                      duration: 0.8,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                  >
                    🎉
                  </motion.div>
                  <motion.h3
                    className="text-2xl md:text-3xl font-bold text-cyan-700 mb-2"
                    style={{ fontFamily: 'var(--font-baloo)' }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Selamat! 🏆
                  </motion.h3>
                  <motion.p
                    className="text-lg md:text-xl text-gray-700 mb-4"
                    style={{ fontFamily: 'var(--font-baloo)' }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Pantai bersih! Hewan laut senang! 🌟
                  </motion.p>
                  <motion.p
                    className="text-sm md:text-base text-gray-500"
                    style={{ fontFamily: 'var(--font-baloo)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Mengalihkan ke menu...
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
        position="top"
      />
    </div>
  );
}
