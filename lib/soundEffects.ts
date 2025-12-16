// Sound effects utility untuk feedback interaksi

export const playSoundEffect = (type: 'click' | 'success' | 'error' | 'celebration' | 'pop') => {
  if (typeof window === 'undefined') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    let frequency = 440;
    let duration = 0.1;
    
    switch (type) {
      case 'click':
        frequency = 800;
        duration = 0.05;
        break;
      case 'success':
        frequency = 600;
        duration = 0.2;
        break;
      case 'error':
        frequency = 300;
        duration = 0.15;
        break;
      case 'celebration':
        frequency = 880;
        duration = 0.3;
        break;
      case 'pop':
        frequency = 1000;
        duration = 0.08;
        break;
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type === 'error' ? 'sawtooth' : 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    // Fallback: use Web Audio API beep
    console.log('Sound effect not available');
  }
};

// Celebration sound sequence
export const playCelebrationSound = () => {
  if (typeof window === 'undefined') return;
  
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (C major chord)
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  notes.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }, index * 100);
  });
};

// Play reward sound from MP3 file
export const playRewardSound = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio('/assets/sound/reward.mp3');
    audio.volume = 0.6;
    audio.play().catch((error) => {
      console.log('Reward sound play failed:', error);
    });
  } catch (error) {
    console.log('Reward sound not available:', error);
  }
};

