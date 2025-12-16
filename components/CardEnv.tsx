'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { EnvironmentId } from '@/lib/types';
import { getBadges } from '@/lib/storage';
import { useEffect, useState } from 'react';

interface CardEnvProps {
  id: EnvironmentId;
  title: string;
  badgeName: string;
  description?: string;
}

export default function CardEnv({ id, title, badgeName, description }: CardEnvProps) {
  const [badgeStatus, setBadgeStatus] = useState<'LOCK' | 'DONE'>(() => {
    if (typeof window !== 'undefined') {
      const badges = getBadges();
      return badges[id] ? 'DONE' : 'LOCK';
    }
    return 'LOCK';
  });

  useEffect(() => {
    const updateBadgeStatus = () => {
      const badges = getBadges();
      setBadgeStatus(badges[id] ? 'DONE' : 'LOCK');
    };

    updateBadgeStatus();

    // Listen for storage changes
    const handleStorageChange = () => {
      updateBadgeStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus (in case badge was updated in another tab)
    window.addEventListener('focus', updateBadgeStatus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', updateBadgeStatus);
    };
  }, [id]);

  const getBgImage = () => {
    switch (id) {
      case 'hutan':
        return '/assets/bg/hutan.png';
      case 'taman':
        return '/assets/bg/taman_kota.png';
      case 'pantai':
        return '/assets/bg/pantai.png';
      default:
        return '/assets/bg/hutan.png';
    }
  };

  return (
    <Link href={`/${id}`} className="block h-full w-full">
      <motion.div
        className="relative h-full w-full rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-white overflow-hidden flex flex-col"
        whileHover={{ scale: 1.05, y: -5, rotate: 1 }}
        whileTap={{ scale: 0.95, rotate: -1 }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: 1,
          opacity: 1,
          boxShadow: [
            '0 20px 40px rgba(0,0,0,0.3)',
            '0 25px 50px rgba(0,0,0,0.4)',
            '0 20px 40px rgba(0,0,0,0.3)',
          ],
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          boxShadow: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${getBgImage()}')` }}
        />
        {/* Overlay untuk kontras teks */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="relative z-10 flex-1 flex flex-col justify-end p-6 md:p-8">
          {/* Title */}
          <h3
            className="mb-2 text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg"
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            {title}
          </h3>
          
          {/* Badge Name */}
          <p
            className="mb-3 text-xl md:text-2xl text-white/95 font-semibold drop-shadow-md"
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            {badgeName}
          </p>
          
          {/* Description */}
          {description && (
            <p
              className="text-base md:text-lg text-white/90 leading-relaxed drop-shadow-md mb-4"
              style={{ fontFamily: 'var(--font-baloo)' }}
            >
              {description}
            </p>
          )}

          {/* Badge Button */}
          <motion.div
            className="flex justify-end"
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={`rounded-full px-5 py-2.5 md:px-6 md:py-3 text-base md:text-lg font-bold border-4 border-white shadow-lg ${
                badgeStatus === 'DONE'
                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 text-yellow-900'
                  : 'bg-gray-300 text-gray-700'
              }`}
              style={{ fontFamily: 'var(--font-baloo)' }}
              animate={badgeStatus === 'DONE' ? {
                boxShadow: [
                  '0 4px 15px rgba(250, 204, 21, 0.5)',
                  '0 6px 20px rgba(250, 204, 21, 0.7)',
                  '0 4px 15px rgba(250, 204, 21, 0.5)',
                ],
                scale: [1, 1.05, 1],
              } : {}}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              {badgeStatus === 'DONE' ? '✓ DONE 🏆' : '🔒 LOCK'}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

