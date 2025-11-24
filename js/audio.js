// Audio manager for countdown and coin flip sounds
class AudioManager {
    constructor() {
        this.sounds = {
            flip: null
        };
        this.context = null;
        this.enabled = true;
        this.flipAudioElement = null;
    }

    // Initialize audio context (must be called after user interaction)
    init() {
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Load the coin flip sound file
        this.flipAudioElement = new Audio('assets/coin-flip-37787.mp3');
        this.flipAudioElement.volume = 0.7;
    }

    // Create simple beep sound programmatically for countdown
    playCountdownBeep(frequency = 800, duration = 200) {
        if (!this.enabled) return;
        
        this.init();
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration / 1000);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration / 1000);
    }

    // Play coin flip sound effect
    playFlipSound() {
        if (!this.enabled) return;
        
        // Use the loaded audio file
        if (this.flipAudioElement) {
            this.flipAudioElement.currentTime = 0;
            this.flipAudioElement.play().catch(err => console.log('Audio play failed:', err));
        }
    }

    // Play winner announcement sound
    playWinnerSound() {
        if (!this.enabled) return;
        
        this.init();
        // Victory fanfare
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        notes.forEach((freq, index) => {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const startTime = this.context.currentTime + (index * 0.15);
            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    }

    // Load external audio file (optional - for custom sounds)
    async loadSound(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            this.sounds[name] = audioBuffer;
        } catch (error) {
            console.error(`Failed to load sound ${name}:`, error);
        }
    }

    // Play loaded sound
    playSound(name) {
        if (!this.enabled || !this.sounds[name]) return;
        
        this.init();
        const source = this.context.createBufferSource();
        source.buffer = this.sounds[name];
        source.connect(this.context.destination);
        source.start();
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}
