// Simple AudioContext synthesizer for UI sounds so we don't need external assets
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export const playSound = (type: 'start' | 'stop' | 'success' | 'hazard') => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  switch (type) {
    case 'start':
      // Rising tone (Power up)
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, now);
      oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.3);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      break;

    case 'stop':
      // Falling tone (Power down)
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.3);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      break;

    case 'success':
      // Gentle ping
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(1200, now);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
      break;

    case 'hazard':
      // Urgent double buzz
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, now);
      
      // First buzz
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      
      // Second buzz
      const now2 = now + 0.15;
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sawtooth';
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.frequency.setValueAtTime(150, now2);
      gain2.gain.setValueAtTime(0.2, now2);
      gain2.gain.linearRampToValueAtTime(0, now2 + 0.1);
      
      oscillator.start(now);
      oscillator.stop(now + 0.1);
      osc2.start(now2);
      osc2.stop(now2 + 0.1);
      break;
  }
};

export const triggerHaptic = (pattern: 'success' | 'warning' | 'error') => {
  if (!navigator.vibrate) return;

  switch (pattern) {
    case 'success':
      navigator.vibrate(50); // Short tick
      break;
    case 'warning':
      navigator.vibrate([100, 50, 100]); // Double buzz
      break;
    case 'error':
      navigator.vibrate([300]); // Long buzz
      break;
  }
};