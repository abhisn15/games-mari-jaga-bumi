'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import SiLala from '@/app/components/SiLala';
import LandscapePrompt from '@/components/LandscapePrompt';
import SoundManager from '@/components/SoundManager';
import { updateBadge } from '@/lib/storage';
import { playSoundEffect, playCelebrationSound } from '@/lib/soundEffects';

interface Animal {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// 5 hewan yang akan dicari (sesuai dengan hotspot di hutan)
// Posisi disesuaikan agar semak tidak overlap dan sesuai dengan posisi hewan di gambar
// Posisi x, y adalah center point dari hewan, w dan h adalah ukuran area hewan
const allAnimals: Animal[] = [
  // Singa - kiri bawah, hewan besar
  { id: 'singa', name: 'Singa', emoji: '🦁', x: 5, y: 65, w: 32, h: 25 },
  // Toucan - kiri atas, burung di cabang pohon
  { id: 'tukan', name: 'Burung Tukan', emoji: '🦜', x: 26, y: 16, w: 20, h: 16 },
  // Badak - tengah, hewan besar
  { id: 'badak', name: 'Badak', emoji: '🦏', x: 40, y: 55, w: 28, h: 30 },
  // Gorilla - kanan, hewan besar
  { id: 'gorilla', name: 'Gorilla', emoji: '🦍', x: 70, y: 65, w: 22, h: 26 },
  // Parrot - kanan atas, burung di cabang pohon
  { id: 'parrot', name: 'Burung Beo', emoji: '🦜', x: 80, y: 20, w: 16, h: 16 },
];

const markModuleDone = (key: string) => {
  if (typeof window === 'undefined') return;
  try {
    const data = JSON.parse(localStorage.getItem('moduleStatus') || '{}');
    if (!data[key]) {
      data[key] = true;
      localStorage.setItem('moduleStatus', JSON.stringify(data));
    }
  } catch {
    // ignore
  }
};

export default function HutanGuessPosition() {
  const router = useRouter();
  const [currentRound, setCurrentRound] = useState(0);
  const [foundAnimals, setFoundAnimals] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [gameComplete, setGameComplete] = useState(false);
  const [clickedPosition, setClickedPosition] = useState<{ x: number; y: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [removingBush, setRemovingBush] = useState<string | null>(null);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hewan yang harus dicari di round ini
  const totalRounds = allAnimals.length;
  const currentAnimal = currentRound < totalRounds ? allAnimals[currentRound] : allAnimals[0];

  // Helper function untuk mendapatkan ukuran kotak semak yang sebenarnya
  const getBushSize = (animal: Animal) => {
    const bushWidthPercent = Math.max(animal.w * 2.5, animal.w < 20 ? 250 : 200);
    const bushHeightPercent = Math.max(animal.h * 2.5, animal.h < 20 ? 250 : 200);
    const actualBushWidth = (animal.w * bushWidthPercent) / 100;
    const actualBushHeight = (animal.h * bushHeightPercent) / 100;
    return { width: actualBushWidth, height: actualBushHeight };
  };

  // Cek apakah klik berada dalam area kotak semak (SAMA PERSIS dengan ukuran kotak semak yang terlihat di game)
  // Perhitungan ini berlaku untuk SEMUA hewan (singa, tukan, badak, gorilla, parrot)
  const isClickInAnimalArea = (clickX: number, clickY: number, animal: Animal): boolean => {
    // Gunakan helper function untuk mendapatkan ukuran kotak semak
    const { width: actualBushWidth, height: actualBushHeight } = getBushSize(animal);
    
    // Area deteksi menggunakan ukuran yang SAMA PERSIS dengan kotak semak yang terlihat
    // Karena kotak semak menggunakan transform: translate(-50%, -50%), maka center di animal.x, animal.y
    const animalLeft = animal.x - actualBushWidth / 2;
    const animalRight = animal.x + actualBushWidth / 2;
    const animalTop = animal.y - actualBushHeight / 2;
    const animalBottom = animal.y + actualBushHeight / 2;

    // Tambahkan toleransi (5%) untuk memastikan klik di pinggir juga terdeteksi
    const tolerance = 5;
    const isInArea = (
      clickX >= (animalLeft - tolerance) &&
      clickX <= (animalRight + tolerance) &&
      clickY >= (animalTop - tolerance) &&
      clickY <= (animalBottom + tolerance)
    );
    
    return isInArea;
  };

  // Handle klik langsung pada kotak semak
  const handleBushClick = (e: React.MouseEvent<HTMLDivElement>, animal: Animal) => {
    e.stopPropagation(); // Mencegah event bubbling ke background
    
    if (gameComplete || foundAnimals.has(animal.id) || !currentAnimal) return;

    // Cek apakah ini hewan yang benar atau salah
    if (animal.id === currentAnimal.id) {
      // Benar! Temukan hewan - efek tada dan hilang kotaknya
      playSoundEffect('success');
      setRemovingBush(animal.id);
      setClickedPosition(null);

      // Setelah animasi tada selesai, tambahkan ke found animals
      setTimeout(() => {
        setFoundAnimals((prev) => new Set([...prev, animal.id]));
        setRemovingBush(null);
        setToastMessage(`Benar! Kamu menemukan ${animal.name}! 🎉`);
        setToastType('success');
        setShowToast(true);

        // Lanjut ke round berikutnya setelah 1.5 detik
        setTimeout(() => {
          if (currentRound < totalRounds - 1) {
            setCurrentRound((prev) => prev + 1);
          } else {
            // Game selesai - tampilkan modal dengan confetti
            setGameComplete(true);
            setShowConfetti(true);
            updateBadge('hutan', true);
            markModuleDone('hutan');
            
            // Play celebration sound
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
        }, 1500);
      }, 600); // Delay untuk animasi tada
    } else {
      // Salah - tampilkan pesan error
      playSoundEffect('error');
      setToastMessage(`Ups! Itu bukan ${currentAnimal?.name || 'hewan yang dicari'}. Coba lagi ya! 👀`);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameComplete || !currentAnimal || foundAnimals.has(currentAnimal.id)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    setClickedPosition({ x: clickX, y: clickY });

    if (isClickInAnimalArea(clickX, clickY, currentAnimal)) {
      // Benar! Temukan hewan - efek tada dan hilang kotaknya
      playSoundEffect('success');
      setRemovingBush(currentAnimal.id);
      setClickedPosition(null);

      // Setelah animasi tada selesai, tambahkan ke found animals
      setTimeout(() => {
        setFoundAnimals((prev) => new Set([...prev, currentAnimal.id]));
        setRemovingBush(null);
        setToastMessage(`Benar! Kamu menemukan ${currentAnimal.name}! 🎉`);
        setToastType('success');
        setShowToast(true);

        // Lanjut ke round berikutnya setelah 1.5 detik
        setTimeout(() => {
          if (currentRound < totalRounds - 1) {
            setCurrentRound((prev) => prev + 1);
          } else {
            // Game selesai - tampilkan modal dengan confetti
            setGameComplete(true);
            setShowConfetti(true);
            updateBadge('hutan', true);
            
            // Play celebration sound
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
        }, 1500);
      }, 600); // Delay untuk animasi tada
    } else {
      // Salah
      playSoundEffect('error');
      setToastMessage('Ups! Coba lagi ya! Cari dengan teliti! 👀');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => {
        setClickedPosition(null);
      }, 1000);
    }
  };

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
          soundKey="hutan-game-sound" 
          src="/assets/sound/Game hutan.mp3" 
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
          backgroundImage: "url('/assets/bg/hutan.png')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-3 md:p-4">
        {/* Header - z-index tinggi agar tidak tertutup semak */}
        <motion.div
          className="text-center mb-2 relative z-50"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg"
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            Temukan Hewan Tersembunyi! 🔍
          </h1>
          <p
            className="text-xs md:text-sm text-white drop-shadow-md"
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            Round {currentRound + 1} dari {totalRounds}
          </p>
        </motion.div>

        {/* Question - Hewan yang harus dicari - dipindahkan ke kiri atas agar tidak menutupi hewan */}
        <motion.div
          className="absolute top-14 sm:top-16 md:top-20 left-2 sm:left-3 md:left-4 bg-white/95 rounded-2xl p-3 md:p-4 max-w-xs sm:max-w-sm shadow-xl z-50"
          initial={{ scale: 0.8, opacity: 0, x: -50 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p
            className="text-base sm:text-lg md:text-xl font-bold text-left text-gray-800"
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            {currentAnimal ? (
              <>Dimana letak <span className="text-green-600">{currentAnimal.name}</span> berada?</>
            ) : (
              'Memuat...'
            )}
          </p>
          <p
            className="text-xs sm:text-sm md:text-base text-left text-gray-600 mt-2"
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            Ketuk di hutan untuk menemukannya!
          </p>
        </motion.div>

        {/* Progress - Round indicator - di pojok kanan atas */}
        <motion.div
          className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 flex gap-1.5 sm:gap-2 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {allAnimals.map((animal, index) => (
            <div
              key={animal.id}
              className={`rounded-full px-2 py-1.5 sm:px-2.5 sm:py-2 md:px-3 md:py-2 shadow-lg flex items-center justify-center ${
                index < currentRound || foundAnimals.has(animal.id)
                  ? 'bg-green-400 ring-2 ring-green-600'
                  : index === currentRound
                  ? 'bg-yellow-400 ring-2 ring-yellow-600'
                  : 'bg-gray-300'
              }`}
            >
              <span
                className={`text-xs sm:text-sm md:text-base font-bold ${
                  index < currentRound || foundAnimals.has(animal.id)
                    ? 'text-green-800'
                    : index === currentRound
                    ? 'text-yellow-800'
                    : 'text-gray-500'
                }`}
                style={{ fontFamily: 'var(--font-baloo)' }}
              >
                {index < currentRound || foundAnimals.has(animal.id) ? '✓' : index === currentRound ? '?' : '○'}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Clickable Background Area */}
        <div
          className="flex-1 relative cursor-crosshair"
          style={{ 
            minHeight: 0,
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}
          onClick={handleBackgroundClick}
        >
          {/* Semua hewan - sembunyikan yang belum ditemukan dengan semak */}
          {allAnimals.map((animal) => {
            const isFound = foundAnimals.has(animal.id);
            const isRemoving = removingBush === animal.id;

            // Jika sudah ditemukan, tidak perlu render apa-apa (biarkan hewan di background terlihat)
            if (isFound) return null;

            return (
              <motion.div
                key={animal.id}
                className="absolute flex items-center justify-center overflow-visible"
                style={{
                  left: `${animal.x}%`,
                  top: `${animal.y}%`,
                  width: `${animal.w}%`,
                  height: `${animal.h}%`,
                  transform: 'translate(-50%, -50%)',
                  minWidth: '80px',
                  minHeight: '80px',
                  zIndex: 20,
                  cursor: 'pointer', // Semua kotak bisa diklik
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={isRemoving ? {
                  scale: [1, 1.3, 1.5, 0],
                  rotate: [0, 15, -15, 180, 360],
                  opacity: [1, 0.8, 0.5, 0.2, 0],
                  y: [0, -10, -20, -15, 0],
                  x: [0, 5, -5, 0],
                } : {
                  scale: 1,
                  rotate: 0,
                  opacity: 1,
                }}
                transition={isRemoving ? {
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1],
                } : {
                  type: "spring",
                  stiffness: 100,
                }}
              >
                {/* Semak sangat tebal untuk benar-benar menyembunyikan hewan - ukuran disesuaikan dengan hewan */}
                <div
                  className="rounded-2xl flex items-center justify-center relative"
                  onClick={(e) => handleBushClick(e, animal)}
                  style={{
                    // Ukuran semak: 250% dari ukuran hewan untuk menutupi dengan baik, minimum 200%
                    // Untuk hewan kecil (burung), gunakan minimum yang lebih besar
                    width: `${Math.max(animal.w * 2.5, animal.w < 20 ? 250 : 200)}%`,
                    height: `${Math.max(animal.h * 2.5, animal.h < 20 ? 250 : 200)}%`,
                    // Background sangat gelap dan benar-benar opaque
                    background: 'linear-gradient(135deg, rgba(0, 30, 0, 1) 0%, rgba(0, 20, 0, 1) 25%, rgba(0, 40, 0, 1) 50%, rgba(0, 20, 0, 1) 75%, rgba(0, 30, 0, 1) 100%)',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.9), inset 0 5px 20px rgba(0, 0, 0, 0.7), inset 0 -5px 20px rgba(0, 0, 0, 0.5)',
                    border: '5px solid rgba(0, 60, 0, 1)',
                    opacity: 1,
                    pointerEvents: 'auto', // Kotak bisa diklik
                    cursor: 'pointer', // Semua kotak bisa diklik
                  }}
                >
                  {/* Lapisan semak tambahan untuk efek lebih tebal - multiple layers */}
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'radial-gradient(circle at 20% 20%, rgba(0, 80, 0, 0.8) 0%, transparent 35%), radial-gradient(circle at 80% 80%, rgba(0, 60, 0, 0.9) 0%, transparent 35%), radial-gradient(circle at 50% 50%, rgba(0, 40, 0, 0.7) 0%, transparent 50%)',
                    }}
                  />
                  {/* Lapisan gelap tambahan untuk benar-benar menutupi */}
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'rgba(0, 15, 0, 0.6)',
                    }}
                  />
                  {/* Lapisan gelap lagi untuk extra coverage */}
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(45deg, rgba(0, 25, 0, 0.5) 0%, rgba(0, 15, 0, 0.7) 100%)',
                    }}
                  />
                  {/* Ikon daun di tengah - lebih banyak untuk menutupi */}
                  <span className="text-5xl md:text-6xl relative z-10 opacity-95">🌿</span>
                  {/* Daun tambahan untuk efek lebih natural dan menutupi lebih banyak area */}
                  <span className="absolute text-4xl md:text-5xl z-10" style={{ top: '0%', left: '10%', opacity: 0.9 }}>🌿</span>
                  <span className="absolute text-4xl md:text-5xl z-10" style={{ bottom: '5%', right: '15%', opacity: 0.9 }}>🌿</span>
                  <span className="absolute text-3xl md:text-4xl z-10" style={{ top: '20%', right: '5%', opacity: 0.8 }}>🍃</span>
                  <span className="absolute text-3xl md:text-4xl z-10" style={{ bottom: '20%', left: '5%', opacity: 0.8 }}>🍃</span>
                  <span className="absolute text-3xl md:text-4xl z-10" style={{ top: '50%', left: '0%', opacity: 0.75 }}>🌿</span>
                  <span className="absolute text-3xl md:text-4xl z-10" style={{ top: '50%', right: '0%', opacity: 0.75 }}>🌿</span>
                </div>
              </motion.div>
            );
          })}


          {/* Click indicator */}
          <AnimatePresence>
            {clickedPosition && (
              <motion.div
                className="absolute pointer-events-none z-40"
                style={{
                  left: `${clickedPosition.x}%`,
                  top: `${clickedPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 0, opacity: 1, rotate: 0 }}
                animate={{ 
                  scale: [0, 1.5, 2.5, 0],
                  opacity: [1, 1, 0.5, 0],
                  rotate: 360,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.div 
                  className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full border-3 border-white shadow-lg"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(59, 130, 246, 0.7)',
                      '0 0 0 10px rgba(59, 130, 246, 0)',
                    ],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Si Lala - pojok kiri bawah */}
        <motion.div
          className="absolute bottom-20 left-4 md:bottom-24 md:left-8 z-30"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <SiLala size={60} animate={false} />
        </motion.div>

        {/* Button */}
        <motion.div
          className="flex justify-center z-30 px-3 sm:px-4 mt-2"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {gameComplete ? (
            <Button onClick={() => router.push('/menu')} variant="primary">
              🏠 LANJUT
            </Button>
          ) : (
            <Button onClick={() => router.push('/hutan')} variant="secondary">
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
                      rotate: [0, 15, -15, 15, -15, 0],
                      scale: [1, 1.3, 1.1, 1.3, 1],
                      y: [0, -10, 0],
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
                    Kamu berhasil menemukan semua hewan! Kamu luar biasa! 🌟
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
      />
    </div>
  );
}
