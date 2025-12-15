'use client';

import { useEffect, useRef, useState } from 'react';

interface SoundManagerProps {
  src: string;
  loop?: boolean;
  volume?: number;
  autoPlay?: boolean;
  playOnInteraction?: boolean; // Play setelah user interaction
}

export default function SoundManager({ 
  src, 
  loop = true, 
  volume = 0.5,
  autoPlay = true,
  playOnInteraction = true
}: SoundManagerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasTriedPlayRef = useRef(false);

  useEffect(() => {
    if (!src || typeof window === 'undefined') return;

    // Create audio element
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audioRef.current = audio;

    // Function untuk play audio
    const playAudio = () => {
      if (!audioRef.current) {
        console.log('SoundManager: Audio element not ready');
        return;
      }
      
      if (hasTriedPlayRef.current) {
        console.log('SoundManager: Already tried to play');
        return;
      }
      
      hasTriedPlayRef.current = true;
      console.log('SoundManager: Attempting to play', src);
      
      const playPromise = audioRef.current.play().catch((error) => {
        console.log('SoundManager: Audio play prevented:', error);
        hasTriedPlayRef.current = false; // Reset jika gagal
        return null;
      });
      
      if (playPromise) {
        playPromise.then(() => {
          console.log('SoundManager: Audio playing successfully');
          setIsPlaying(true);
        }).catch((err) => {
          console.log('SoundManager: Audio play error:', err);
          hasTriedPlayRef.current = false; // Reset jika error
        });
      }
    };

    // Auto play jika diizinkan
    if (autoPlay) {
      // Coba play langsung setelah sedikit delay untuk memastikan audio element siap
      const playTimer = setTimeout(() => {
        playAudio();
      }, 100);

      // Cleanup timer
      return () => {
        clearTimeout(playTimer);
      };
    }

    // Jika autoplay gagal atau playOnInteraction true, play setelah user interaction
    if (playOnInteraction) {
      const handleInteraction = () => {
        if (audioRef.current && !isPlaying && !hasTriedPlayRef.current) {
          playAudio();
        }
      };

      // Event listeners untuk user interaction
      document.addEventListener('click', handleInteraction, { once: true });
      document.addEventListener('touchstart', handleInteraction, { once: true });
      document.addEventListener('keydown', handleInteraction, { once: true });

      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      hasTriedPlayRef.current = false;
    };
  }, [src, loop, volume, autoPlay, playOnInteraction]);

  // Update volume saat berubah
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update loop saat berubah
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loop;
    }
  }, [loop]);

  return null; // Component tidak render apapun
}

