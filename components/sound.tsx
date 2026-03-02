'use client';

import { useEffect } from 'react';

export function SoundCue() {
  useEffect(() => {
    const click = () => {
      if (localStorage.getItem('sound') !== '1') return;
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.frequency.value = 180;
      oscillator.type = 'square';
      gain.gain.value = 0.005;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.045);
    };
    window.addEventListener('pointerdown', click);
    return () => window.removeEventListener('pointerdown', click);
  }, []);

  return null;
}
