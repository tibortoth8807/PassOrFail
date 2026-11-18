/** Synthesized sounds (Web Audio API) - no audio files. */
export type SoundName = 'click' | 'switch' | 'lift' | 'rollers' | 'rev' | 'stampOk' | 'stampFail' | 'right' | 'wrong' | 'win';

export class Sounds {
  muted = false;
  private ctx: AudioContext | null = null;

  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) this.ctx = new Ctor();
    }
    void this.ctx?.resume();
  }

  play(name: SoundName): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    switch (name) {
      case 'click':
        this.tone(700, now, 0.04, 'square', 0.05);
        break;
      case 'switch':
        this.noise(now, 0.03, 4000, 0.3, 'highpass');
        this.tone(1200, now, 0.03, 'square', 0.04);
        break;
      case 'lift':
        this.tone(90, now, 1.2, 'sawtooth', 0.06, 110);
        this.noise(now, 1.2, 600, 0.08, 'lowpass');
        break;
      case 'rollers':
        this.tone(60, now, 1.4, 'sawtooth', 0.08, 140);
        this.noise(now, 1.4, 900, 0.1, 'lowpass');
        break;
      case 'rev':
        this.tone(50, now, 1.6, 'sawtooth', 0.12, 160);
        this.tone(25, now, 1.6, 'square', 0.06, 80);
        break;
      case 'stampOk':
      case 'stampFail':
        this.noise(now, 0.12, 900, 0.5, 'lowpass');
        this.tone(name === 'stampOk' ? 220 : 140, now, 0.15, 'sine', 0.4, 80);
        break;
      case 'right':
        [660, 880].forEach((f, i) => this.tone(f, now + i * 0.1, 0.18, 'triangle', 0.12));
        break;
      case 'wrong':
        this.tone(220, now, 0.3, 'sawtooth', 0.08, 150);
        break;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, now + i * 0.11, 0.3, 'triangle', 0.14));
        break;
    }
  }

  private tone(freq: number, start: number, duration: number, type: OscillatorType, volume: number, endFreq?: number): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  private noise(start: number, duration: number, cutoff: number, volume: number, type: BiquadFilterType): void {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = cutoff;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(start);
  }
}
