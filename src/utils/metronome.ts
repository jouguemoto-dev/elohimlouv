// Lightweight Web Audio API Synthesizer Metronome

class AudioMetronome {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private bpm = 72;
  private timerId: number | null = null;
  private currentBeat = 0;
  private beatsPerBar = 4;
  private onBeatCallback: ((beat: number) => void) | null = null;

  public init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(30, Math.min(240, newBpm));
  }

  public getBpm(): number {
    return this.bpm;
  }

  public setBeatsPerBar(beats: number) {
    this.beatsPerBar = beats || 4;
  }

  public setOnBeat(cb: ((beat: number) => void) | null) {
    this.onBeatCallback = cb;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentBeat = 0;
    this.scheduleNextTick();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.currentBeat = 0;
    if (this.onBeatCallback) {
      this.onBeatCallback(0);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private scheduleNextTick() {
    if (!this.isPlaying) return;

    this.playClick(this.currentBeat === 0);
    this.currentBeat = (this.currentBeat + 1) % this.beatsPerBar;
    if (this.onBeatCallback) {
      this.onBeatCallback(this.currentBeat === 0 ? this.beatsPerBar : this.currentBeat);
    }

    const intervalMs = (60 / this.bpm) * 1000;
    this.timerId = window.setTimeout(() => {
      this.scheduleNextTick();
    }, intervalMs);
  }

  private playClick(isAccent: boolean) {
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      // High pitch for beat 1, lower for other beats
      osc.frequency.setValueAtTime(isAccent ? 1200 : 800, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(isAccent ? 0.35 : 0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch {
      // Audio context might need user gesture
    }
  }
}

export const metronomeService = new AudioMetronome();
