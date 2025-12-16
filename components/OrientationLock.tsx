'use client';

import { useEffect, useState } from 'react';

export default function OrientationLock() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || typeof navigator === 'undefined') return;

    // Check if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isMobile) return;

    const lockOrientation = async () => {
      try {
        // Try multiple methods untuk lock orientation
        if (typeof screen !== 'undefined' && screen.orientation && 'lock' in screen.orientation) {
          // Check current orientation first
          const currentOrientation = screen.orientation.type || (screen as any).orientation;
          if (currentOrientation && !currentOrientation.includes('landscape')) {
            await (screen.orientation as any).lock('landscape');
          }
        } else if ((window as any).DeviceOrientationEvent && (window as any).DeviceOrientationEvent.requestPermission) {
          // iOS 13+ permission
          try {
            const permission = await (window as any).DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
              if (typeof screen !== 'undefined' && screen.orientation && 'lock' in screen.orientation) {
                await (screen.orientation as any).lock('landscape');
              }
            }
          } catch (err) {
            // Permission denied or not supported
            console.log('Orientation permission not granted');
          }
        }
      } catch (err) {
        // Ignore errors - user might need to rotate manually
        console.log('Orientation lock not supported or failed');
      }
    };

    // Try to lock on mount
    const lockTimer = setTimeout(() => {
      lockOrientation();
    }, 500);

    // Also try on orientation change
    const handleOrientationChange = () => {
      setTimeout(() => {
        lockOrientation();
      }, 300);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      clearTimeout(lockTimer);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [mounted]);

  return null;
}

