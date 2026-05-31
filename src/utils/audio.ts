export class AudioSystem {
  context: AudioContext | null = null;
  isMuted: boolean = false;
  
  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  playClick() {
    if (!this.context || this.isMuted) return;
    try {
      const osc = this.context.createOscillator();
      const gainNode = this.context.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.context.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0, this.context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
      
      osc.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      osc.start();
      osc.stop(this.context.currentTime + 0.1);
    } catch (e) {
      console.error("Audio error", e);
    }
  }

  playHover() {
    if (!this.context || this.isMuted) return;
    try {
      const osc = this.context.createOscillator();
      const gainNode = this.context.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.context.currentTime); // softer pitch for hover
      osc.frequency.exponentialRampToValueAtTime(500, this.context.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, this.context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, this.context.currentTime + 0.05); // low volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      osc.start();
      osc.stop(this.context.currentTime + 0.15);
    } catch (e) {
      console.error("Audio error", e);
    }
  }

  playCorrect() {
    if (!this.context || this.isMuted) return;
    try {
      const osc = this.context.createOscillator();
      const gainNode = this.context.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.context.currentTime);
      osc.frequency.setValueAtTime(554.37, this.context.currentTime + 0.08); // C#
      osc.frequency.setValueAtTime(659.25, this.context.currentTime + 0.16); // E
      osc.frequency.setValueAtTime(880, this.context.currentTime + 0.24); // A
      
      gainNode.gain.setValueAtTime(0, this.context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.context.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.1, this.context.currentTime + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.6);
      
      osc.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      osc.start();
      osc.stop(this.context.currentTime + 0.6);
    } catch (e) {
      console.error("Audio error", e);
    }
  }

  playWrong() {
    if (!this.context || this.isMuted) return;
    try {
      const osc = this.context.createOscillator();
      const gainNode = this.context.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0, this.context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.context.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
      
      osc.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      osc.start();
      osc.stop(this.context.currentTime + 0.3);
    } catch (e) {
      console.error("Audio error", e);
    }
  }

  playTick() {
    if (!this.context || this.isMuted) return;
    try {
      const osc = this.context.createOscillator();
      const gainNode = this.context.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.context.currentTime); // A5 high beep
      
      gainNode.gain.setValueAtTime(0, this.context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, this.context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      osc.start();
      osc.stop(this.context.currentTime + 0.15);
    } catch (e) {
      console.error("Audio error", e);
    }
  }

  playGameOver() {
    if (!this.context || this.isMuted) return;
    try {
      const osc = this.context.createOscillator();
      const gainNode = this.context.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, this.context.currentTime); // D
      osc.frequency.setValueAtTime(280, this.context.currentTime + 0.3); // C#
      osc.frequency.setValueAtTime(260, this.context.currentTime + 0.6); // C
      osc.frequency.linearRampToValueAtTime(200, this.context.currentTime + 1.2); // Sliding down
      
      gainNode.gain.setValueAtTime(0, this.context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, this.context.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15, this.context.currentTime + 0.8);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 2.0);
      
      osc.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      osc.start();
      osc.stop(this.context.currentTime + 2.0);
    } catch (e) {
      console.error("Audio error", e);
    }
  }

  playCountdownBeep() {
    if (!this.context || this.isMuted) return;
    try {
      const osc = this.context.createOscillator();
      const gainNode = this.context.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, this.context.currentTime); // beep
      
      gainNode.gain.setValueAtTime(0, this.context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.context.currentTime + 0.01);
      gainNode.gain.setValueAtTime(0.1, this.context.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.001, this.context.currentTime + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      osc.start();
      osc.stop(this.context.currentTime + 0.15);
    } catch (e) {
      console.error("Audio error", e);
    }
  }

  playCountdownGo() {
    if (!this.context || this.isMuted) return;
    try {
      const osc = this.context.createOscillator();
      const gainNode = this.context.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, this.context.currentTime); // GO
      
      gainNode.gain.setValueAtTime(0, this.context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, this.context.currentTime + 0.01);
      gainNode.gain.setValueAtTime(0.15, this.context.currentTime + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.7);
      
      osc.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      osc.start();
      osc.stop(this.context.currentTime + 0.7);
    } catch (e) {
      console.error("Audio error", e);
    }
  }
}

export const audio = new AudioSystem();
