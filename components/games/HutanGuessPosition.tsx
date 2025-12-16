'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import SiLala from '@/app/components/SiLala';
import LandscapePrompt from '@/components/LandscapePrompt';
import SoundManager from '@/components/SoundManager';
import { updateBadge } from '@/lib/storage';

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
const allAnimals: Animal[] = [
  { id: 'singa', name: 'Singa', emoji: '🦁', x: 12, y: 55, w: 16, h: 20 },
  { id: 'tukan', name: 'Burung Tukan', emoji: '🦜', x: 30, y: -10, w: 20, h: 20 },
  { id: 'badak', name: 'Badak', emoji: '🦏', x: 36, y: 40, w: 32, h: 32 },
  { id: 'gorilla', name: 'Gorilla', emoji: '🦍', x: 70, y: 58, w: 24, h: 24 },
  { id: 'parrot', name: 'Burung Beo', emoji: '🦜', x: 80, y: 14, w: 18, h: 18 },
];

export default function HutanGuessPosition() {
  const router = useRouter();
  const [currentRound, setCurrentRound] = useState(0);
  const [foundAnimals, setFoundAnimals] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [gameComplete, setGameComplete] = useState(false);
  const [clickedPosition, setClickedPosition] = useState<{ x: number; y: number } | null>(null);

  // Hewan yang harus dicari di round ini
  const currentAnimal = allAnimals[currentRound];
  const totalRounds = allAnimals.length;

  // Cek apakah klik berada dalam area kotak semak (SAMA PERSIS dengan ukuran kotak semak yang terlihat di game)
  const isClickInAnimalArea = (clickX: number, clickY: number, animal: Animal): boolean => {
    // Kotak semak berada di dalam motion.div dengan ukuran animal.w% x animal.h% dari background
    // Kotak semak menggunakan: width: `${Math.max(animal.w * 2, 200)}%` dari motion.div
    // Jadi ukuran sebenarnya dari background = (animal.w * Math.max(animal.w * 2, 200) / 100)%
    const bushWidthMultiplier = Math.max(animal.w * 2, 200) / 100; // Convert to multiplier
    const bushHeightMultiplier = Math.max(animal.h * 2, 200) / 100;
    
    // Ukuran kotak semak dalam persentase dari background
    const actualBushWidth = animal.w * bushWidthMultiplier;
    const actualBushHeight = animal.h * bushHeightMultiplier;
    
    // Area deteksi menggunakan ukuran yang SAMA PERSIS dengan kotak semak yang terlihat
    // Karena kotak semak menggunakan transform: translate(-50%, -50%), maka center di animal.x, animal.y
    const animalLeft = animal.x - actualBushWidth / 2;
    const animalRight = animal.x + actualBushWidth / 2;
    const animalTop = animal.y - actualBushHeight / 2;
    const animalBottom = animal.y + actualBushHeight / 2;

    // Tambahkan toleransi (5%) untuk memastikan klik di pinggir juga terdeteksi
    const tolerance = 5;
    return (
      clickX >= (animalLeft - tolerance) &&
      clickX <= (animalRight + tolerance) &&
      clickY >= (animalTop - tolerance) &&
      clickY <= (animalBottom + tolerance)
    );
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameComplete || foundAnimals.has(currentAnimal.id)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    setClickedPosition({ x: clickX, y: clickY });

    if (isClickInAnimalArea(clickX, clickY, currentAnimal)) {
      // Benar! Temukan hewan
      setFoundAnimals((prev) => new Set([...prev, currentAnimal.id]));
      setToastMessage(`Benar! Kamu menemukan ${currentAnimal.name}!`);
      setToastType('success');
      setShowToast(true);

      // Lanjut ke round berikutnya setelah 1.5 detik
      setTimeout(() => {
        if (currentRound < totalRounds - 1) {
          setCurrentRound((prev) => prev + 1);
          setClickedPosition(null);
        } else {
          // Game selesai
          setGameComplete(true);
          updateBadge('hutan', true);
          setTimeout(() => {
            setToastMessage('Hebat! Kamu sudah menyelesaikan semua round! 🏆');
            setToastType('success');
            setShowToast(true);
          }, 500);
        }
      }, 1500);
    } else {
      // Salah
      setToastMessage('Ups! Coba lagi ya! Cari dengan teliti! 👀');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => {
        setClickedPosition(null);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
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
      <div className="relative right-10 z-10 h-full flex flex-col p-3 md:p-4">
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

        {/* Question - Hewan yang harus dicari - z-index tinggi */}
        <motion.div
          className="bg-white/95 rounded-2xl p-3 md:p-4 mb-3 mx-auto max-w-md shadow-xl relative z-50"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p
            className="text-lg md:text-xl font-bold text-center text-gray-800"
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            Dimana letak <span className="text-green-600">{currentAnimal.name}</span> berada?
          </p>
          <p
            className="text-sm md:text-base text-center text-gray-600 mt-2"
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            Ketuk di hutan untuk menemukannya!
          </p>
        </motion.div>

        {/* Progress - Round indicator - z-index tinggi */}
        <motion.div
          className="flex justify-center gap-2 mb-2 relative z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {allAnimals.map((animal, index) => (
            <div
              key={animal.id}
              className={`rounded-full px-3 md:px-4 py-2 shadow-lg flex items-center justify-center ${
                index < currentRound || foundAnimals.has(animal.id)
                  ? 'bg-green-400 ring-2 ring-green-600'
                  : index === currentRound
                  ? 'bg-yellow-400 ring-2 ring-yellow-600'
                  : 'bg-gray-300'
              }`}
            >
              <span
                className={`text-sm md:text-base font-bold ${
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
          onClick={handleBackgroundClick}
        >
          {/* Semua hewan - sembunyikan yang belum ditemukan dengan semak */}
          {allAnimals.map((animal) => {
            const isFound = foundAnimals.has(animal.id);

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
                  minWidth: '60px',
                  minHeight: '60px',
                  zIndex: 5, // Z-index rendah agar tidak menutupi UI
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                {/* Semak sangat tebal untuk benar-benar menyembunyikan hewan - lebih besar dan lebih gelap */}
                <div
                  className="rounded-2xl flex items-center justify-center relative"
                  style={{
                    // Semak jauh lebih besar untuk menutupi seluruh hewan (200% dari ukuran)
                    width: `${Math.max(animal.w * 2, 200)}%`,
                    height: `${Math.max(animal.h * 2, 200)}%`,
                    // Background sangat gelap dan benar-benar opaque
                    background: 'linear-gradient(135deg, rgba(0, 30, 0, 1) 0%, rgba(0, 20, 0, 1) 25%, rgba(0, 40, 0, 1) 50%, rgba(0, 20, 0, 1) 75%, rgba(0, 30, 0, 1) 100%)',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.9), inset 0 5px 20px rgba(0, 0, 0, 0.7), inset 0 -5px 20px rgba(0, 0, 0, 0.5)',
                    border: '5px solid rgba(0, 60, 0, 1)',
                    opacity: 1,
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
                  
                  {/* Pulse animation hanya untuk hewan yang sedang dicari */}
                  {animal.id === currentAnimal.id && (
                    <motion.div
                      className="absolute rounded-2xl border-4 border-green-300"
                      style={{
                        width: `${Math.max(animal.w * 2, 200)}%`,
                        height: `${Math.max(animal.h * 2, 200)}%`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Click indicator */}
          <AnimatePresence>
            {clickedPosition && (
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: `${clickedPosition.x}%`,
                  top: `${clickedPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-4 h-4 bg-white rounded-full border-2 border-blue-500" />
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
