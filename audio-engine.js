class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.activeOscillators = new Map();
        this.currentInstrument = 'piano';
        this.effects = {
            reverb: null,
            delay: null,
            distortion: null
        };
        this.effectStates = {
            reverb: false,
            delay: false,
            distortion: false
        };
        this.tempo = 120;
        this.isPlaying = false;
        this.playbackInterval = null;
        this.currentStep = 0;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordedBlob = null;
        
        this.initializeAudio();
    }

    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.audioContext.destination);
            
            await this.setupEffects();
            console.log('🎵 Audio engine initialized!');
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    }

    async setupEffects() {
        // Reverb
        this.effects.reverb = this.audioContext.createConvolver();
        this.effects.reverb.buffer = await this.createReverbImpulse(2, 2, false);
        
        // Delay
        this.effects.delay = this.audioContext.createDelay(1.0);
        this.effects.delay.delayTime.value = 0.3;
        const delayFeedback = this.audioContext.createGain();
        delayFeedback.gain.value = 0.3;
        this.effects.delay.connect(delayFeedback);
        delayFeedback.connect(this.effects.delay);
        
        // Distortion
        this.effects.distortion = this.audioContext.createWaveShaper();
        this.effects.distortion.curve = this.makeDistortionCurve(400);
        this.effects.distortion.oversample = '4x';
    }

    createReverbImpulse(duration, decay, reverse) {
        const length = this.audioContext.sampleRate * duration;
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const n = reverse ? length - i : i;
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
            }
        }
        return impulse;
    }

    makeDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        return curve;
    }

    async resumeAudioContext() {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    createInstrumentSound(frequency, instrument = this.currentInstrument) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Configure oscillator based on instrument
        switch (instrument) {
            case 'piano':
                oscillator.type = 'triangle';
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
                break;
                
            case 'synth':
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                break;
                
            case 'bell':
                oscillator.type = 'sine';
                // Add harmonics for bell sound
                const harmonic1 = this.audioContext.createOscillator();
                const harmonic2 = this.audioContext.createOscillator();
                harmonic1.frequency.value = frequency * 2;
                harmonic2.frequency.value = frequency * 3;
                harmonic1.type = 'sine';
                harmonic2.type = 'sine';
                
                const harmonicGain1 = this.audioContext.createGain();
                const harmonicGain2 = this.audioContext.createGain();
                harmonicGain1.gain.value = 0.1;
                harmonicGain2.gain.value = 0.05;
                
                harmonic1.connect(harmonicGain1);
                harmonic2.connect(harmonicGain2);
                harmonicGain1.connect(gainNode);
                harmonicGain2.connect(gainNode);
                
                harmonic1.start();
                harmonic2.start();
                
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
                break;
                
            case 'drum':
                // Create drum sound using noise
                const bufferSize = this.audioContext.sampleRate * 0.1;
                const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
                
                const noiseSource = this.audioContext.createBufferSource();
                noiseSource.buffer = noiseBuffer;
                
                const bandpass = this.audioContext.createBiquadFilter();
                bandpass.type = 'bandpass';
                bandpass.frequency.value = frequency;
                bandpass.Q.value = 1;
                
                noiseSource.connect(bandpass);
                bandpass.connect(gainNode);
                
                gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                
                noiseSource.start();
                return { oscillator: noiseSource, gainNode, stop: () => noiseSource.stop() };
        }
        
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        
        return { oscillator, gainNode, stop: () => oscillator.stop() };
    }

    connectEffects(source) {
        let current = source;
        
        // Connect active effects in chain
        if (this.effectStates.distortion) {
            current.connect(this.effects.distortion);
            current = this.effects.distortion;
        }
        
        if (this.effectStates.delay) {
            current.connect(this.effects.delay);
            this.effects.delay.connect(this.masterGain);
        }
        
        if (this.effectStates.reverb) {
            current.connect(this.effects.reverb);
            this.effects.reverb.connect(this.masterGain);
        }
        
        // Always connect to master for dry signal
        current.connect(this.masterGain);
    }

    playNote(frequency, duration = 1, instrument = this.currentInstrument) {
        if (!this.audioContext) return;
        
        const sound = this.createInstrumentSound(frequency, instrument);
        this.connectEffects(sound.gainNode);
        
        if (sound.oscillator.start) {
            sound.oscillator.start();
        }
        
        // Auto-stop after duration
        setTimeout(() => {
            try {
                sound.stop();
            } catch (e) {
                // Note already stopped
            }
        }, duration * 1000);
        
        return sound;
    }

    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = volume / 100;
        }
    }

    toggleEffect(effectName) {
        this.effectStates[effectName] = !this.effectStates[effectName];
        return this.effectStates[effectName];
    }

    setTempo(bpm) {
        this.tempo = bpm;
        if (this.isPlaying) {
            this.stopSequence();
            this.playSequence();
        }
    }

    playSequence() {
        if (!this.audioContext || this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentStep = 0;
        const stepDuration = (60 / this.tempo / 4) * 1000; // 16th notes
        
        this.playbackInterval = setInterval(() => {
            this.triggerStep(this.currentStep);
            this.currentStep = (this.currentStep + 1) % 16;
        }, stepDuration);
    }

    stopSequence() {
        this.isPlaying = false;
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }
        this.currentStep = 0;
    }

    triggerStep(step) {
        // This will be called by the music grid
        window.dispatchEvent(new CustomEvent('stepTriggered', { detail: { step } }));
    }

    // Recording functionality
    async startRecording() {
        if (!this.audioContext) return false;
        
        try {
            // Create a destination for recording
            const dest = this.audioContext.createMediaStreamDestination();
            this.masterGain.connect(dest);
            
            this.mediaRecorder = new MediaRecorder(dest.stream);
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.recordedBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            };
            
            this.mediaRecorder.start();
            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            return false;
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            return true;
        }
        return false;
    }

    downloadRecording() {
        if (!this.recordedBlob) return false;
        
        const url = URL.createObjectURL(this.recordedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `muziq-creation-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    }

    // Note frequency mapping
    static noteToFrequency(note, octave = 4) {
        const notes = {
            'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4,
            'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2
        };
        
        const semitone = notes[note];
        const frequency = 440 * Math.pow(2, (octave - 4) + semitone / 12);
        return frequency;
    }
}

// Export for use in other modules
window.AudioEngine = AudioEngine; 