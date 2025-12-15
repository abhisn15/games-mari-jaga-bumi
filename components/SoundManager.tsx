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
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    if (!src || typeof window === 'undefined') return;

    // Create audio element
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audioRef.current = audio;

    // Function untuk play audio
    const playAudio = () => {
      if (!audioRef.current || hasInteractedRef.current) return;
      
      const playPromise = audioRef.current.play().catch((error) => {
        console.log('Audio play prevented:', error);
      });
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          hasInteractedRef.current = true;
        }).catch(() => {
          // Autoplay blocked, akan diputar setelah user interaction
        });
      }
    };

    // Auto play jika diizinkan
    if (autoPlay) {
      // Coba play langsung
      playAudio();
    }

    // Jika autoplay gagal, play setelah user interaction
    if (playOnInteraction && !hasInteractedRef.current) {
      const handleInteraction = () => {
        if (!hasInteractedRef.current && audioRef.current) {
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

