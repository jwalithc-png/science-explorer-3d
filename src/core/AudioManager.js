/**
 * Procedural Web Audio API Sound Synthesizer & Speech Narration Manager
 * Synthesizes:
 * 1. Embryonic & Fetal Heartbeat (Authentic Doppler ultrasound Lub-Dub rhythm with variable BPM)
 * 2. Calcium Wave & Zinc Spark resonant chime
 * 3. Sperm motility fluidic swoosh
 * 4. Ambient maternal womb / fallopian tube acoustic drone
 * 5. Text-to-speech scientific narration
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.speechSynth = window.speechSynthesis || null;
    this.currentUtterance = null;

    // Heartbeat scheduler state
    this.heartbeatTimer = 0;
    this.bpm = 140;
    this.isHeartbeatActive = true;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic Lub-Dub Doppler Heartbeat pulse
  playHeartbeatBeat(isDub = false) {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freq = isDub ? 68 : 82; // Lub is slightly higher pitch than Dub
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.12);

    const amp = isDub ? 0.18 : 0.28;
    gain.gain.setValueAtTime(amp, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Calcium Wave & Zinc Spark Chime
  playCalciumSpark() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(528, this.ctx.currentTime); // DNA repair frequency 528Hz
    osc1.frequency.exponentialRampToValueAtTime(1056, this.ctx.currentTime + 0.3);

    osc2.frequency.setValueAtTime(792, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1584, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.35);
    osc2.stop(this.ctx.currentTime + 0.35);
  }

  // Sperm Motility Flagellar Swoosh
  playSpermSwoosh() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  updateHeartbeat(delta, stageIndex, currentBpm = 140) {
    if (!this.ctx || this.isMuted) return;
    this.bpm = currentBpm;

    // Heartbeat plays prominently on stages 4, 7, 8, 9
    if (stageIndex >= 3) {
      this.heartbeatTimer += delta;
      const interval = 60.0 / this.bpm;

      if (this.heartbeatTimer >= interval) {
        this.heartbeatTimer = 0;
        this.playHeartbeatBeat(false); // Lub

        // Schedule Dub 0.15s later
        setTimeout(() => {
          this.playHeartbeatBeat(true); // Dub
        }, 140);
      }
    }
  }

  speakNarration(text) {
    if (!this.speechSynth || this.isMuted) return;
    this.speechSynth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = this.speechSynth.getVoices();
    const engVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (engVoice) {
      utterance.voice = engVoice;
    }

    this.currentUtterance = utterance;
    this.speechSynth.speak(utterance);
  }

  stopNarration() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopNarration();
    }
    return this.isMuted;
  }
}
