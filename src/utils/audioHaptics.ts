// Web Audio API & Vibration Haptics Utility

class SoundAndHapticEngine {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Play realistic organic wooden tasbeeh bead click
  playBeadClick() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Quick percussive pop imitating wooden/stone bead
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Audio not supported or blocked
    }
  }

  // Play a soft uplifting chime when milestone/target is reached (e.g. 33, 99)
  playTargetChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.52);
      });
    } catch {
      // Audio context error
    }
  }

  // Trigger haptic vibration on mobile
  triggerVibration(type: 'tap' | 'decrement' | 'target' | 'reset' = 'tap') {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    try {
      switch (type) {
        case 'tap':
          navigator.vibrate(25); // Soft tactile click
          break;
        case 'decrement':
          navigator.vibrate(40);
          break;
        case 'target':
          navigator.vibrate([40, 50, 40, 50, 90]); // Celebratory rhythm
          break;
        case 'reset':
          navigator.vibrate([30, 40, 30]);
          break;
      }
    } catch {
      // Vibration not permitted
    }
  }
}

export const soundHaptics = new SoundAndHapticEngine();
