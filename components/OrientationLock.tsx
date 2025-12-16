'use client';

import { useEffect } from 'react';

export default function OrientationLock() {
  useEffect(() => {
    // Check if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isMobile) return;

    const lockOrientation = async () => {
      try {
        // Try multiple methods untuk lock orientation
        if (screen.orientation && 'lock' in screen.orientation) {
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
              if (screen.orientation && 'lock' in screen.orientation) {
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
    setTimeout(() => {
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
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return null;
}

