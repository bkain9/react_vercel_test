class SoundManager {
    constructor() {
        this.ctx = null;
        this.spinOsc = null;
        this.spinGain = null;
        this.fanfareInterval = null;
        this.fanfareOscillators = [];
        this.isMuted = false;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Helper: Simple beep
    playTone(freq, duration, type = 'sine', vol = 0.1) {
        if (this.isMuted || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playClick() {
        this.init();
        // High stick sound
        this.playTone(800, 0.05, 'square', 0.05);
    }

    playCount() {
        this.init();
        // Sharp beep for credit counting
        this.playTone(1200, 0.04, 'sine', 0.1);
    }

    playStop() {
        this.init();
        // Heavy but Crisp "Clack/Thud" (Triangle Wave)
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle'; // Clickier than sine for audibility
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.15); // Fast drop

        gain.gain.setValueAtTime(0.4, now); // Louder
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.15);
    }

    startSpinSound() {
        this.stopFanfare(); // Ensure bonus sound stops on new spin
        this.init();
        if (this.spinOsc) return; // Already spinng

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // "Pachinko/Roulette" Whir - High pitched flutter
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

        // LFO for "Flutter" effect
        const lfo = this.ctx.createOscillator();
        lfo.type = 'square';
        lfo.frequency.setValueAtTime(20, this.ctx.currentTime); // 20Hz flutter
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 50; // Pitch modulation depth

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();

        this.spinOsc = osc;
        this.spinGain = gain;
        this.spinLfo = lfo; // Track to stop later
    }

    stopSpinSound() {
        if (this.spinOsc) {
            try {
                this.spinOsc.stop();
                if (this.spinLfo) this.spinLfo.stop(); // Stop LFO too
                this.spinOsc.disconnect();
                this.spinGain.disconnect();
            } catch (e) { }
            this.spinOsc = null;
            this.spinGain = null;
            this.spinLfo = null;
        }
    }

    playWin() {
        this.init();
        // Longer, Exciting "Jackpot" Fanfare (Double Octave Arpeggio)
        // C5, E5, G5, C6, E6, G6, C7, C7 (Sustain)
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00, 2093.00];
        const now = this.ctx.currentTime;

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle'; // Clear game sound

            // Timing: 0.1s overlap for longer melody (approx 0.8s total)
            const startTime = now + (i * 0.1);
            const duration = i === notes.length - 1 ? 0.6 : 0.2; // Last note sustains

            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }

    // Metallic Coin Insert Sound
    playInsertCoin() {
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Heavy Thud (Low Square Wave)
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.15);
    }

    // Coin Drop / Overflow Sound
    playCoinDrop() {
        this.init();
        const count = 5; // Simluate 5 coins clinking
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine'; // Metal ring
                // Random high pitch 2000-4000Hz
                osc.frequency.setValueAtTime(2000 + Math.random() * 2000, now);

                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1); // Short ting

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(now + 0.15);
            }, i * 80); // Stagger by 80ms
        }
    }

    // Simple melody sequencer
    playFanfare(type) {
        this.stopFanfare();
        this.init();

        const root = type === 'BB' ? 261.63 : 392.00; // C4 vs G4
        const majorScale = [1, 1.25, 1.5, 2, 1.5, 1.25]; // Major Arpeggio pattern
        let noteIdx = 0;

        const playNext = () => {
            const freq = root * majorScale[noteIdx % majorScale.length];
            // Play a little staccato saw wave
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2); // envelope

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);

            this.fanfareOscillators.push({ osc, gain });
            noteIdx++;
        };

        playNext();
        this.fanfareInterval = setInterval(playNext, 150); // Speed
    }

    stopFanfare() {
        if (this.fanfareInterval) {
            clearInterval(this.fanfareInterval);
            this.fanfareInterval = null;
        }
        // Cleanup active notes? They stop themselves mostly.
    }
}

export const soundManager = new SoundManager();
