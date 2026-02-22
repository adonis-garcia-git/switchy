// ─── Web Audio API Keyboard Sound Synthesizer ─────────────────────────
// Generates realistic mechanical keyboard sounds using oscillators + noise
// No audio files needed — purely synthesized in real-time

export type SoundProfile = "linear" | "tactile" | "clicky" | "silent";

interface SoundParams {
  freq: number;
  attack: number;
  decay: number;
  noiseLevel: number;
  noiseFilterFreq: number;
  releaseFreq: number;
  releaseDecay: number;
}

const PROFILES: Record<Exclude<SoundProfile, "silent">, SoundParams> = {
  linear: {
    freq: 100,
    attack: 0.002,
    decay: 0.05,
    noiseLevel: 0.08,
    noiseFilterFreq: 2000,
    releaseFreq: 80,
    releaseDecay: 0.04,
  },
  tactile: {
    freq: 280,
    attack: 0.001,
    decay: 0.06,
    noiseLevel: 0.12,
    noiseFilterFreq: 3500,
    releaseFreq: 150,
    releaseDecay: 0.05,
  },
  clicky: {
    freq: 500,
    attack: 0.001,
    decay: 0.02,
    noiseLevel: 0.15,
    noiseFilterFreq: 6000,
    releaseFreq: 350,
    releaseDecay: 0.015,
  },
};

let audioContext: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;

  const bufferSize = ctx.sampleRate * 0.1; // 100ms of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return buffer;
}

export function playKeyDown(profile: SoundProfile): void {
  if (profile === "silent") return;

  const ctx = getAudioContext();
  const params = PROFILES[profile];
  const now = ctx.currentTime;

  // Oscillator — the tonal "thock" / "bump" / "click"
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(params.freq, now);
  osc.frequency.exponentialRampToValueAtTime(params.freq * 0.5, now + params.decay);
  oscGain.gain.setValueAtTime(0, now);
  oscGain.gain.linearRampToValueAtTime(0.15, now + params.attack);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + params.decay);
  osc.connect(oscGain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + params.decay + 0.01);

  // Noise burst — the physical impact sound
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = getNoiseBuffer(ctx);
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.setValueAtTime(params.noiseFilterFreq, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(200, now + params.decay);
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(params.noiseLevel, now + params.attack);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + params.decay);
  noiseSrc.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
  noiseSrc.start(now);
  noiseSrc.stop(now + params.decay + 0.01);

  // Tactile adds a secondary mid-frequency bump
  if (profile === "tactile") {
    const bump = ctx.createOscillator();
    const bumpGain = ctx.createGain();
    bump.type = "triangle";
    bump.frequency.setValueAtTime(350, now + 0.005);
    bump.frequency.exponentialRampToValueAtTime(120, now + 0.035);
    bumpGain.gain.setValueAtTime(0, now + 0.005);
    bumpGain.gain.linearRampToValueAtTime(0.08, now + 0.008);
    bumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    bump.connect(bumpGain).connect(ctx.destination);
    bump.start(now + 0.005);
    bump.stop(now + 0.04);
  }

  // Clicky adds a sharp secondary click
  if (profile === "clicky") {
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = "square";
    click.frequency.setValueAtTime(600, now);
    click.frequency.exponentialRampToValueAtTime(400, now + 0.008);
    clickGain.gain.setValueAtTime(0, now);
    clickGain.gain.linearRampToValueAtTime(0.06, now + 0.001);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
    click.connect(clickGain).connect(ctx.destination);
    click.start(now);
    click.stop(now + 0.015);
  }
}

export function playKeyUp(profile: SoundProfile): void {
  if (profile === "silent") return;

  const ctx = getAudioContext();
  const params = PROFILES[profile];
  const now = ctx.currentTime;

  // Softer release sound — the spring/housing return
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(params.releaseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(params.releaseFreq * 0.4, now + params.releaseDecay);
  oscGain.gain.setValueAtTime(0, now);
  oscGain.gain.linearRampToValueAtTime(0.06, now + 0.001);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + params.releaseDecay);
  osc.connect(oscGain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + params.releaseDecay + 0.01);

  // Light noise on release
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = getNoiseBuffer(ctx);
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.setValueAtTime(params.noiseFilterFreq * 0.6, now);
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(params.noiseLevel * 0.4, now + 0.001);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + params.releaseDecay);
  noiseSrc.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
  noiseSrc.start(now);
  noiseSrc.stop(now + params.releaseDecay + 0.01);
}
