'use client';

import { useEffect, useRef } from 'react';

interface SoundManagerProps {
  src: string;
  loop?: boolean;
  volume?: number;
  autoPlay?: boolean;
  playOnInteraction?: boolean;
  soundKey?: string; // Unique key untuk prevent duplicate instances (bukan 'key' karena itu prop khusus React)
}

// Global sound registry untuk mencegah multiple instances dan track semua sounds
const soundRegistry = new Map<string, HTMLAudioElement>();
let currentPlayingKey: string | null = null;

// Function untuk stop semua sounds kecuali yang diizinkan
export function stopAllSounds(exceptKey?: string) {
  soundRegistry.forEach((audio, key) => {
    if (key !== exceptKey) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        console.log('Error stopping sound:', error);
      }
    }
  });
  if (!exceptKey) {
    currentPlayingKey = null;
  }
}

export default function SoundManager({ 
  src, 
  loop = true, 
  volume = 0.5,
  autoPlay = true,
  playOnInteraction = true,
  soundKey
}: SoundManagerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasTriedPlayRef = useRef(false);
  const isMountedRef = useRef(true);
  const uniqueKey = soundKey || src;

  useEffect(() => {
    if (!src || typeof window === 'undefined') return;

    isMountedRef.current = true;

    // Stop semua sounds lain sebelum memulai yang baru
    stopAllSounds(uniqueKey);

    // Hapus instance lama jika ada dengan key yang sama
    const existingAudio = soundRegistry.get(uniqueKey);
    if (existingAudio) {
      try {
        existingAudio.pause();
        existingAudio.currentTime = 0;
        existingAudio.src = '';
        soundRegistry.delete(uniqueKey);
      } catch (error) {
        console.log('SoundManager: Error cleaning up existing audio:', error);
      }
    }

    // Create audio element
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.preload = 'auto';
    
    // Error handling - lebih graceful dan informatif
    audio.addEventListener('error', () => {
      // Dapatkan error details dari audio element
      const error = audio.error;
      if (error) {
        let errorMessage = 'Unknown error';
        // MediaError constants untuk kompatibilitas
        const MEDIA_ERR_ABORTED = 1;
        const MEDIA_ERR_NETWORK = 2;
        const MEDIA_ERR_DECODE = 3;
        const MEDIA_ERR_SRC_NOT_SUPPORTED = 4;
        
        switch (error.code) {
          case MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading aborted';
            break;
          case MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading audio';
            break;
          case MEDIA_ERR_DECODE:
            errorMessage = 'Audio decoding error';
            break;
          case MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported or file not found';
            break;
          default:
            errorMessage = `Audio error code: ${error.code}`;
        }
        // Hanya log warning, tidak error agar tidak mengganggu console
        console.warn(`SoundManager: Audio error for "${src}": ${errorMessage}`);
      } else {
        console.warn(`SoundManager: Audio error event for "${src}"`);
      }
      
      // Cleanup dengan aman
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        audioRef.current = null;
      }
      if (currentPlayingKey === uniqueKey) {
        currentPlayingKey = null;
      }
      // Hapus dari registry
      if (soundRegistry.get(uniqueKey) === audio) {
        soundRegistry.delete(uniqueKey);
      }
    });

    // Handle audio ended (untuk non-loop)
    audio.addEventListener('ended', () => {
      if (!loop && audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      if (currentPlayingKey === uniqueKey) {
        currentPlayingKey = null;
      }
    });

    audioRef.current = audio;
    soundRegistry.set(uniqueKey, audio);

    // Function untuk play audio
    const playAudio = async () => {
      if (!audioRef.current || !isMountedRef.current) {
        return;
      }
      
      // Pastikan tidak ada sound lain yang sedang play
      if (currentPlayingKey && currentPlayingKey !== uniqueKey) {
        stopAllSounds(uniqueKey);
      }
      
      if (hasTriedPlayRef.current) {
        return;
      }
      
      hasTriedPlayRef.current = true;
      
      try {
        // Cek apakah audio masih valid sebelum play
        if (!audioRef.current || audioRef.current.error) {
          console.warn('SoundManager: Audio not available or has error, skipping play');
          hasTriedPlayRef.current = false;
          return;
        }
        
        await audioRef.current.play();
        console.log('SoundManager: Audio playing successfully', src);
        currentPlayingKey = uniqueKey;
      } catch (error: any) {
        // Hanya log warning untuk autoplay prevention (bukan error sebenarnya)
        if (error?.name === 'NotAllowedError' || error?.name === 'NotSupportedError') {
          console.log('SoundManager: Audio play prevented (autoplay policy):', error?.message || 'User interaction required');
        } else if (error?.name !== 'AbortError') {
          console.warn('SoundManager: Audio play error:', error?.message || error);
        }
        hasTriedPlayRef.current = false; // Reset jika gagal
        
        // Jika autoplay gagal, coba lagi setelah user interaction
        if (playOnInteraction && error?.name !== 'AbortError') {
          const handleInteraction = () => {
            if (audioRef.current && isMountedRef.current && !hasTriedPlayRef.current && !audioRef.current.error) {
              playAudio();
            }
          };

          document.addEventListener('click', handleInteraction, { once: true });
          document.addEventListener('touchstart', handleInteraction, { once: true });
          document.addEventListener('keydown', handleInteraction, { once: true });
        }
      }
    };

    // Auto play jika diizinkan
    if (autoPlay) {
      // Delay sedikit untuk memastikan audio element siap dan stop sounds lain dulu
      const playTimer = setTimeout(() => {
        if (isMountedRef.current) {
          playAudio();
        }
      }, 300); // Delay lebih lama untuk memastikan sounds lain sudah stop

      return () => {
        clearTimeout(playTimer);
      };
    }

    // Jika playOnInteraction true tapi autoPlay false
    if (playOnInteraction && !autoPlay) {
      const handleInteraction = () => {
        if (audioRef.current && isMountedRef.current && !hasTriedPlayRef.current) {
          playAudio();
        }
      };

      document.addEventListener('click', handleInteraction, { once: true });
      document.addEventListener('touchstart', handleInteraction, { once: true });
      document.addEventListener('keydown', handleInteraction, { once: true });

      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };
    }

    // Cleanup function - PASTIKAN sound berhenti saat unmount
    return () => {
      isMountedRef.current = false;
      
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.src = '';
          audioRef.current.load(); // Reset audio element
        } catch (error) {
          console.log('SoundManager: Error during cleanup:', error);
        }
        
        // Hapus dari registry
        if (soundRegistry.get(uniqueKey) === audioRef.current) {
          soundRegistry.delete(uniqueKey);
        }
        
        if (currentPlayingKey === uniqueKey) {
          currentPlayingKey = null;
        }
        
        audioRef.current = null;
      }
      
      hasTriedPlayRef.current = false;
    };
  }, [src, loop, volume, autoPlay, playOnInteraction, uniqueKey]);

  // Update volume saat berubah
  useEffect(() => {
    if (audioRef.current && isMountedRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  // Update loop saat berubah
  useEffect(() => {
    if (audioRef.current && isMountedRef.current) {
      audioRef.current.loop = loop;
    }
  }, [loop]);

  return null; // Component tidak render apapun
}
