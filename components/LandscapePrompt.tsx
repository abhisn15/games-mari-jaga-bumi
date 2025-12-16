'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandscapePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if device is mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Check orientation
        const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        setIsLandscape(orientation === 'landscape');
        setShowPrompt(orientation === 'portrait');
        
        // Auto-lock orientation jika masih portrait
        if (orientation === 'portrait') {
          lockOrientation();
        }
      } else {
        // Desktop - always hide prompt
        setShowPrompt(false);
        setIsLandscape(true);
      }
    };

    const lockOrientation = async () => {
      try {
        // Try multiple methods untuk lock orientation
        if (screen.orientation && 'lock' in screen.orientation) {
          await (screen.orientation as any).lock('landscape');
        } else if ((window as any).DeviceOrientationEvent && (window as any).DeviceOrientationEvent.requestPermission) {
          // iOS 13+ permission
          const permission = await (window as any).DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            if (screen.orientation && 'lock' in screen.orientation) {
              await (screen.orientation as any).lock('landscape');
            }
          }
        }
      } catch (err) {
        // Ignore errors - user might need to rotate manually
        console.log('Orientation lock not supported or failed');
      }
    };

    // Check on mount
    checkOrientation();

    // Listen for orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Auto-lock on mount untuk mobile
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      setTimeout(() => {
        lockOrientation();
      }, 500);
    }

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleRotateClick = async () => {
    // Try to lock orientation (may not work on all browsers)
    try {
      if (screen.orientation && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('landscape');
      } else if ((window as any).DeviceOrientationEvent && (window as any).DeviceOrientationEvent.requestPermission) {
        // iOS 13+ permission
        const permission = await (window as any).DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          if (screen.orientation && 'lock' in screen.orientation) {
            await (screen.orientation as any).lock('landscape');
          }
        }
      }
    } catch (err) {
      console.log('Orientation lock not supported or failed');
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl p-6 md:p-8 mx-4 max-w-md shadow-2xl"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Icon Rotate */}
            <motion.div
              className="flex justify-center mb-4"
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="text-6xl">📱</div>
            </motion.div>

            <h2
              className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800"
              style={{ fontFamily: 'var(--font-baloo)' }}
            >
              Putar Perangkatmu! 🔄
            </h2>

            <p
              className="text-base md:text-lg text-center text-gray-600 mb-6"
              style={{ fontFamily: 'var(--font-baloo)' }}
            >
              Untuk pengalaman terbaik, putar perangkatmu ke mode landscape (miring) ya!
            </p>

            <div className="flex flex-col gap-3">
              <motion.button
                onClick={handleRotateClick}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg"
                style={{ fontFamily: 'var(--font-baloo)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Putar Otomatis
              </motion.button>

              <button
                onClick={() => setShowPrompt(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full text-base"
                style={{ fontFamily: 'var(--font-baloo)' }}
              >
                Tutup (Saya akan putar manual)
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p
                className="text-sm text-blue-800 text-center"
                style={{ fontFamily: 'var(--font-baloo)' }}
              >
                💡 <strong>Cara:</strong> Putar perangkatmu ke samping (90°)
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

