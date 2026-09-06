// 8-bit WebAudio SFX engine. Zero assets, all synthesized.

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean): void {
  muted = m;
}

export function isMuted(): boolean {
  return muted;
}

function ac(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    return ctx;
  } catch {
    return null;
  }
}

export function unlockAudio(): void {
  try {
    void ac()?.resume();
  } catch {
    /* no audio — no problem */
  }
}

function beep(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.04): void {
  if (muted) return;
  try {
    const a = ac();
    if (!a) return;
    if (a.state === 'suspended') void a.resume();
    const o = a.createOscillator();
    const g = a.createGain();
    const t = a.currentTime;
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(Math.max(0.0001, vol), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + dur);
  } catch {
    /* ignore */
  }
}

export type SfxKind = 'save' | 'kill' | 'deny';

export function sfx(kind: SfxKind): void {
  if (kind === 'save') {
    beep(520, 0.07, 'square', 0.035);
    setTimeout(() => beep(680, 0.09, 'square', 0.035), 70);
  } else if (kind === 'kill') {
    beep(210, 0.11, 'sawtooth', 0.045);
    setTimeout(() => beep(140, 0.13, 'sawtooth', 0.05), 90);
  } else {
    beep(95, 0.18, 'square', 0.05);
  }
}

export function sfxDeath(): void {
  if (muted) return;
  try {
    const a = ac();
    if (!a) return;
    if (a.state === 'suspended') void a.resume();
    const o = a.createOscillator();
    const g = a.createGain();
    const t = a.currentTime;
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(260, t);
    o.frequency.exponentialRampToValueAtTime(32, t + 0.55);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + 0.6);
  } catch {
    /* ignore */
  }
}

export function sfxCull(): void {
  beep(65, 0.45, 'sawtooth', 0.08);
  setTimeout(() => beep(50, 0.7, 'square', 0.09), 240);
}

export function sfxRankUp(): void {
  beep(440, 0.1, 'square', 0.04);
  setTimeout(() => beep(554, 0.1, 'square', 0.04), 100);
  setTimeout(() => beep(659, 0.12, 'square', 0.04), 200);
  setTimeout(() => beep(880, 0.3, 'square', 0.05), 300);
}

export function sfxChallenger(): void {
  beep(330, 0.12, 'sine', 0.04);
  setTimeout(() => beep(494, 0.14, 'sine', 0.04), 110);
  setTimeout(() => beep(659, 0.25, 'square', 0.045), 230);
}

export function sfxPowerup(): void {
  [220, 330, 440, 660, 880].forEach((f, i) => {
    setTimeout(() => beep(f, 0.08, 'square', 0.04), i * 50);
  });
}
