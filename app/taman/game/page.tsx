'use client';

import { useState, useMemo, useEffect } from 'react';
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

// Fungsi untuk generate posisi random yang tidak overlap untuk game taman
function generateRandomPositionsTaman(count: number, isDeck: boolean = true): Array<{ x: number; y: number; rotate: number }> {
  const positions: Array<{ x: number; y: number; rotate: number }> = [];
  const minDistance = 8; // Minimum jarak antar item dalam persen
  const maxAttempts = 100; // Maksimal percobaan untuk setiap item
  
  let minX, maxX, minY, maxY;
  
  if (isDeck) {
    // Area yang valid untuk sampah di deck taman (lantai kayu) - hanya di lantai, bukan di dinding
    // X: 50-85% (hindari area tong sampah di kiri 0-45% dan area tanaman di kanan)
    // Y: 96-98% (hanya di lantai kayu paling bawah, hindari dinding)
    minX = 50;
    maxX = 85;
    minY = 96;
    maxY = 98;
  } else {
    // Area yang valid untuk sampah di tengah taman hijau (park area)
    // X: 20-80% (area tengah taman)
    // Y: 45-65% (area tengah taman hijau, di atas deck tapi di bawah langit)
    minX = 20;
    maxX = 80;
    minY = 45;
    maxY = 65;
  }

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

export default function TamanGamePage() {
  const router = useRouter();
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [sortedItems, setSortedItems] = useState<Set<number>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [gameComplete, setGameComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sampah dengan posisi fixed (tidak random) - ditata letakkan dengan benar
  // Posisi disesuaikan agar realistis dan tidak aneh di 2D
  const wasteItems: WasteItem[] = [
    // Sampah di deck (lantai kayu) - posisi fixed di lantai
    { id: 1, name: 'Daun Kering', type: 'organik', image: '/assets/items/sampah-daun.svg', x: 55, y: 97, rotate: 15 },
    { id: 2, name: 'Botol Plastik', type: 'plastik', image: '/assets/items/sampah-botol.svg', x: 62, y: 97, rotate: -10 },
    { id: 3, name: 'Kertas Bekas', type: 'kertas', image: '/assets/items/sampah-kertas.svg', x: 70, y: 97, rotate: 20 },
    { id: 4, name: 'Kulit Pisang', type: 'organik', image: '/assets/items/sampah-pisang.svg', x: 77, y: 97, rotate: -15 },
    { id: 5, name: 'Kaleng Bekas', type: 'plastik', image: '/assets/items/sampah-kaleng.svg', x: 65, y: 96.5, rotate: 25 },
    { id: 6, name: 'Kantong Plastik', type: 'plastik', image: '/assets/items/sampah-kantong.svg', x: 72, y: 96.5, rotate: -20 },
    // Sampah di tengah taman hijau - posisi fixed di area rumput, hindari pagar
    { id: 7, name: 'Koran', type: 'kertas', image: '/assets/items/koran.svg', x: 35, y: 50, rotate: -12 },
    { id: 8, name: 'Kardus', type: 'kertas', image: '/assets/items/kardus.svg', x: 50, y: 58, rotate: 18 },
    { id: 9, name: 'Kertas', type: 'kertas', image: '/assets/items/kertas.svg', x: 65, y: 48, rotate: -8 },
    { id: 10, name: 'Daun', type: 'organik', image: '/assets/items/daun.svg', x: 45, y: 60, rotate: 10 },
  ];

  // Drop zone - posisi disesuaikan dengan tong sampah di gambar (di deck paling bawah)
  // Tong sampah berada di deck paling bawah, sekitar y: 95-97%
  const trashBins: TrashBin[] = [
    { id: 'kertas', type: 'kertas', label: 'Kertas (Biru)', x: 12, y: 96, w: 8, h: 12 },
    { id: 'plastik', type: 'plastik', label: 'Plastik (Kuning)', x: 24, y: 96, w: 8, h: 12 },
    { id: 'organik', type: 'organik', label: 'Organik (Hijau)', x: 37, y: 96, w: 8, h: 12 },
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
        setShowConfetti(true);
        updateBadge('taman', true);
        playCelebrationSound();
        
        // Tampilkan modal setelah 500ms
        setTimeout(() => {
          setShowSuccessModal(true);
          // Auto-close modal dan redirect setelah 3 detik
            setTimeout(() => {
              setShowSuccessModal(false);
              setTimeout(() => router.push('/'), 1000);
            }, 3000);
        }, 500);
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
    <div className="fixed inset-0 w-full h-full overflow-hidden">
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
      <div className="relative z-10 w-full h-full">
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

        {/* Sampah - menggunakan positioning sesuai lokasi (deck atau taman) */}
        {wasteItems.map((item, index) => {
          const isSorted = sortedItems.has(item.id);
          const isDragging = draggedItem === item.id;

          if (isSorted) return null;

          // Tentukan apakah sampah di deck (y > 90%) atau di taman (y < 90%)
          const isOnDeck = item.y > 90;
          
          // Untuk deck: gunakan bottom positioning
          // Untuk taman: gunakan top positioning
          const positioningStyle = isOnDeck
            ? {
                left: `${item.x}%`,
                bottom: `${100 - item.y}%`,
                transform: `translate(-50%, 0) rotate(${item.rotate}deg)`,
              }
            : {
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotate}deg)`,
              };

          return (
            <motion.div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, item.id)}
              onDragEnd={handleDragEnd}
              className={`absolute cursor-grab active:cursor-grabbing z-20 ${isDragging ? 'opacity-60 scale-110' : 'hover:scale-110'}`}
              style={{
                ...positioningStyle,
                // Ukuran responsive: lebih kecil di mobile portrait, lebih besar di landscape/desktop
                width: 'clamp(28px, 3.5vw, 55px)',
                height: 'clamp(28px, 3.5vw, 55px)',
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
                bottom: `${100 - bin.y}%`,
                width: `${bin.w}%`,
                height: `${bin.h}%`,
                transform: 'translate(-50%, 0)',
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
            <Button onClick={() => router.push('/taman')} variant="secondary">
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
                className="relative bg-gradient-to-br from-green-100 via-white to-green-50 rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-green-400 max-w-md w-full overflow-hidden"
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
                    className="text-2xl md:text-3xl font-bold text-green-700 mb-2"
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
                    Kamu berhasil memilah semua sampah! Taman jadi bersih! 🌟
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
