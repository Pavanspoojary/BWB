/**
 * ElevatorAudio — procedural doodle jazz for the elevator.
 * Pure WebAudio (no assets, $0 hosting): mellow one-note loop for the
 * 5th floor hold, plucky walking bass, hat rides and brushed drums,
 * plus a bell ding and a 4-note up-motif fanfare for the Penthouse.
 * Transport rides scheduled ahead via AudioContext.currentTime, so it
 * self-paces without CPU burn.
 */

interface ElevatorVoice {
  t: OscillatorType;
  f: number;
  a: number;
  dec: number;
  att: number;
  pan?: number;
  wit?: number;
}

export class ElevatorAudioDrone {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private playing = false;
  private stepId = 0;
  private nextChordAt = 0;
  private chordIdx = 0;
  private beat = 0;
  private nextBeatAt = 0;
  private readonly tempo = 0.62; // sleepy 97bpm-ish feel

  // vintage elevator chords: I - IV - I - V over a warm 2-bar cycle
  private readonly chords: [number, number, number][] = [
    [130.8, 164.8, 196.0], // Cmaj / G bass floats
    [138.6, 174.6, 196.0],
    [130.8, 164.8, 196.0],
    [146.8, 196.0, 233.1],
  ];

  /** Paranoid-media click start + loop. Assume muted=false to start audio. */
  public start() {
    if (this.playing) return;
    this.playing = true;
    this.muted = false;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.0;
      this.master.connect(this.ctx.destination);
      this.master.gain.linearRampToValueAtTime(0.16, this.ctx.currentTime + 0.8);
    }
    this.ctx.resume();
    this.nextChordAt = this.ctx.currentTime + 0.1;
    this.nextBeatAt = this.ctx.currentTime + 0.05;
  }

  public toggle(): boolean {
    if (!this.ctx || !this.master) return true;
    this.muted = !this.muted;
    this.master.gain.setTargetAtTime(this.muted ? 0 : 0.16, this.ctx.currentTime, 0.1);
    return this.muted;
  }

  public stop() {
    this.playing = false;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
    }
  }

  /** Arrival ding. */
  public ding() {
    this.ping(587.3, 0.9, 0.5);
    setTimeout(() => this.ping(440.0, 0.8, 0.6), 180);
  }

  /** Up-motif fanfare when taking the penthouse. */
  public fanfare() {
    const seq = [330, 415, 494, 659, 880];
    seq.forEach((f, i) => setTimeout(() => this.ping(f, 0.7, 0.4), i * 130));
    setTimeout(() => this.ding(), seq.length * 130 + 100);
  }

  /** Bell-like ping voice. */
  private ping(freq: number, amp: number, len: number, pan = 0) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(amp, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.5);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + len + 0.6);
  }

  private chordTone(freq: number, when: number) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.055, when + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 2.8);
    osc.connect(g);
    g.connect(this.master);
    osc.start(when);
    osc.stop(when + 3.2);
  }

  private hat(when: number) {
    if (!this.ctx || !this.master) return;
    const len = 0.05;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // filtered noise squirt (hat-ish)
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2) * 0.25;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.value = 0.12;
    src.connect(g);
    g.connect(this.master);
    src.start(when);
  }

  private brush(when: number) {
    if (!this.ctx) return;
    const g = this.ctx.createGain();
    g.gain.value = 0.05;
    let node: AudioNode = g;
    if (this.ctx.createBiquadFilter) {
      const f = this.ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 700;
      f.Q.value = 1.2;
      f.connect(g);
      node = f;
    }
    // low thump toward the brush
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, when);
    osc.frequency.exponentialRampToValueAtTime(65, when + 0.11);
    osc.connect(node);
    g.connect(this.master!);
    osc.start(when);
    osc.stop(when + 0.2);
  }

  /** Scheduler tick — call every ~200ms from the page loop. */
  public tick() {
    if (!this.ctx || !this.master || !this.playing || this.muted) return;
    const now = this.ctx.currentTime;
    if (now + 0.4 >= this.nextChordAt) {
      for (const f of this.chords[this.chordIdx % this.chords.length]) {
        this.chordTone(f, this.nextChordAt);
      }
      this.chordIdx += 1;
      this.nextChordAt += this.tempo * 2.4;
    }
    if (now + 0.1 >= this.nextBeatAt) {
      const beatInBar = this.beat % 4;
      this.hat(this.nextBeatAt);
      if (beatInBar === 0 || beatInBar === 2) this.brush(this.nextBeatAt);
      this.beat += 1;
      this.nextBeatAt += this.tempo;
    }
  }
}
