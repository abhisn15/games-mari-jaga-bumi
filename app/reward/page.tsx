'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import Confetti from 'react-confetti';
import Button from '@/components/Button';
import SiLala from '@/app/components/SiLala';
import { getBadges } from '@/lib/storage';
import { Badges } from '@/lib/types';
import { playRewardSound } from '@/lib/soundEffects';

interface Badge {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export default function RewardPage() {
  const router = useRouter();
  const [badges, setBadges] = useState<Badges>({ hutan: false, taman: false, pantai: false });
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allBadges: Badge[] = [
    { id: 'hutan', name: 'Pahlawan Hutan', emoji: '🌳', color: 'from-green-400 to-green-600' },
    { id: 'taman', name: 'Penjaga Taman', emoji: '🌺', color: 'from-yellow-400 to-orange-500' },
    { id: 'pantai', name: 'Sahabat Laut', emoji: '🌊', color: 'from-cyan-400 to-blue-600' },
  ];

  useEffect(() => {
    setMounted(true);
    setBadges(getBadges());
    // Play reward sound saat halaman reward dibuka
    playRewardSound();
  }, []);

  // GSAP animation untuk glassmorphism effect dan transisi masuk
  useEffect(() => {
    if (!mounted) return;

    // Animate page entrance dengan GSAP
    gsap.fromTo('.reward-page-container',
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }
    );

    // Animate badge cards dengan glassmorphism effect
    badgeRefs.current.forEach((ref, index) => {
      if (ref) {
        const isEarned = badges[allBadges[index].id as keyof Badges];
        if (isEarned) {
          // Glassmorphism effect dengan GSAP
          gsap.fromTo(ref,
            {
              opacity: 0,
              scale: 0.8,
              y: 50,
              rotation: -180,
            },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              rotation: 0,
              duration: 0.8,
              delay: 0.5 + index * 0.15,
              ease: 'back.out(1.7)',
            }
          );

          // Continuous glassmorphism shimmer effect
          gsap.to(ref, {
            boxShadow: '0 8px 32px rgba(255, 255, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
            delay: 1 + index * 0.15,
          });
        }
      }
    });
  }, [mounted, badges]);

  const earnedBadges = allBadges.filter(badge => badges[badge.id as keyof Badges]);
  const allComplete = earnedBadges.length === allBadges.length;

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
        <div className="text-6xl animate-bounce">🏆</div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Confetti effect dengan react-confetti */}
      {allComplete && windowSize.width > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={300}
          gravity={0.3}
          recycle={false}
          tweenDuration={5000}
        />
      )}

      <div className="reward-page-container relative z-10 mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          >
            <SiLala size={120} animate={false} />
          </motion.div>
          
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            {allComplete ? 'Kamu Luar Biasa! 🎉' : 'Lencana Kamu'}
          </motion.h1>

          {allComplete && (
            <motion.p
              className="text-xl md:text-2xl text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ fontFamily: 'var(--font-baloo)' }}
            >
              Kamu sudah menyelesaikan semua petualangan dan menjaga lingkungan!
            </motion.p>
          )}
        </motion.div>

        {/* Badges Grid */}
        <motion.div
          className="grid gap-6 md:grid-cols-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {allBadges.map((badge, index) => {
            const isEarned = badges[badge.id as keyof Badges];
            
            return (
              <motion.div
                key={badge.id}
                ref={(el) => { badgeRefs.current[index] = el; }}
                className={`relative rounded-3xl p-6 text-center overflow-hidden ${
                  isEarned
                    ? `bg-gradient-to-br ${badge.color} shadow-2xl`
                    : 'bg-gray-400/50 grayscale'
                }`}
                style={isEarned ? {
                  backdropFilter: 'blur(20px)',
                  background: `linear-gradient(135deg, ${badge.color.includes('green') ? 'rgba(34, 197, 94, 0.3)' : badge.color.includes('yellow') ? 'rgba(250, 204, 21, 0.3)' : 'rgba(59, 130, 246, 0.3)'}, rgba(255, 255, 255, 0.1))`,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(255, 255, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                } : {}}
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.6 + index * 0.2,
                  type: "spring",
                }}
                whileHover={isEarned ? { 
                  scale: 1.05, 
                  rotate: 5,
                  boxShadow: '0 12px 40px rgba(255, 255, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                } : {}}
              >
                {/* Badge emoji */}
                <motion.div
                  className="text-7xl md:text-8xl mb-4"
                  animate={isEarned ? { y: [0, -10, 0] } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {badge.emoji}
                </motion.div>

                {/* Badge name */}
                <h3
                  className="text-xl md:text-2xl font-bold text-white drop-shadow-md mb-2"
                  style={{ fontFamily: 'var(--font-baloo)' }}
                >
                  {badge.name}
                </h3>

                {/* Status */}
                <div
                  className={`inline-block rounded-full px-4 py-2 ${
                    isEarned
                      ? 'bg-white/90 text-green-600'
                      : 'bg-black/30 text-white/70'
                  } font-bold`}
                  style={{ fontFamily: 'var(--font-baloo)' }}
                >
                  {isEarned ? '✓ Didapat!' : '🔒 Belum'}
                </div>

                {/* Shine effect for earned badges */}
                {isEarned && (
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Progress */}
        <motion.div
          className="bg-white/90 rounded-2xl p-6 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3
            className="text-xl font-bold text-gray-800 mb-4 text-center"
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            Progress Petualangan
          </h3>
          
          {/* Progress bar */}
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${(earnedBadges.length / allBadges.length) * 100}%` }}
              transition={{ duration: 1, delay: 1 }}
            />
          </div>
          
          <p
            className="text-center text-gray-600 font-semibold"
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            {earnedBadges.length} dari {allBadges.length} lencana didapat
          </p>
        </motion.div>

        {/* Button */}
        <motion.div
          className="text-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Button onClick={() => router.push('/menu')} variant="primary">
            🏠 KEMBALI KE MENU
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
