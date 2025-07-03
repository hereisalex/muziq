class MuziqApp {
    constructor() {
        this.audioEngine = null;
        this.musicGrid = null;
        this.piano = null;
        this.isRecording = false;
        this.currentInstrument = 'piano';
        
        this.initializeApp();
    }

    async initializeApp() {
        // Show audio context info if needed
        this.checkAudioContext();
        
        // Initialize components
        this.audioEngine = new AudioEngine();
        await this.waitForAudioContext();
        
        this.musicGrid = new MusicGrid(this.audioEngine);
        this.piano = new Piano(this.audioEngine);
        
        // Setup all event listeners
        this.setupEventListeners();
        
        // Initialize UI state
        this.updateUIState();
        
        console.log('🎵 Muziq app initialized successfully!');
        
        // Add welcome message
        this.showWelcomeMessage();
    }

    async waitForAudioContext() {
        // Wait for audio context to be properly initialized
        while (!this.audioEngine.audioContext) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    checkAudioContext() {
        const audioContextInfo = document.getElementById('audioContextInfo');
        
        // Show audio context warning if needed
        document.addEventListener('click', async () => {
            if (this.audioEngine && this.audioEngine.audioContext && this.audioEngine.audioContext.state === 'suspended') {
                await this.audioEngine.resumeAudioContext();
                audioContextInfo.style.display = 'none';
            }
        }, { once: true });
    }

    setupEventListeners() {
        // Instrument selection
        document.querySelectorAll('.instrument-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectInstrument(btn.dataset.instrument);
            });
        });

        // Playback controls
        document.getElementById('playBtn').addEventListener('click', () => {
            this.playSequence();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseSequence();
        });

        document.getElementById('stopBtn').addEventListener('click', () => {
            this.stopSequence();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAll();
        });

        // Recording controls
        document.getElementById('recordBtn').addEventListener('click', () => {
            this.toggleRecording();
        });

        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadRecording();
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareComposition();
        });

        // Tempo control
        document.getElementById('tempo-slider').addEventListener('input', (e) => {
            this.setTempo(e.target.value);
        });

        // Volume control
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });

        // Effects controls
        document.querySelectorAll('.effect-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleEffect(btn.dataset.effect);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Add pattern buttons
        this.addPatternButtons();
        
        // Add magic buttons for extra fun
        this.addMagicButtons();
    }

    selectInstrument(instrument) {
        this.currentInstrument = instrument;
        this.audioEngine.currentInstrument = instrument;
        
        // Update UI
        document.querySelectorAll('.instrument-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-instrument="${instrument}"]`).classList.add('active');
        
        // Show a fun message
        this.showMessage(`🎵 ${this.getInstrumentEmoji(instrument)} ${instrument.toUpperCase()} selected!`);
    }

    getInstrumentEmoji(instrument) {
        const emojis = {
            piano: '🎹',
            synth: '⚡',
            drum: '🥁',
            bell: '🔔'
        };
        return emojis[instrument] || '🎵';
    }

    playSequence() {
        this.audioEngine.playSequence();
        this.updatePlaybackButtons(true);
        this.showMessage('▶️ Playing your composition!');
    }

    pauseSequence() {
        this.audioEngine.stopSequence();
        this.updatePlaybackButtons(false);
        this.showMessage('⏸️ Paused');
    }

    stopSequence() {
        this.audioEngine.stopSequence();
        this.musicGrid.stopPlayback();
        this.updatePlaybackButtons(false);
        this.showMessage('⏹️ Stopped');
    }

    clearAll() {
        this.stopSequence();
        this.musicGrid.clearGrid();
        this.piano.stopAllNotes();
        this.showMessage('🧹 All cleared! Ready for a new creation!');
    }

    async toggleRecording() {
        if (!this.isRecording) {
            const success = await this.audioEngine.startRecording();
            if (success) {
                this.isRecording = true;
                document.getElementById('recordBtn').classList.add('recording');
                document.getElementById('recordBtn').textContent = '⏺️ Recording...';
                this.showMessage('🔴 Recording started! Play your music!');
            } else {
                this.showMessage('❌ Failed to start recording');
            }
        } else {
            this.audioEngine.stopRecording();
            this.isRecording = false;
            document.getElementById('recordBtn').classList.remove('recording');
            document.getElementById('recordBtn').textContent = '🔴 Record';
            document.getElementById('downloadBtn').disabled = false;
            document.getElementById('shareBtn').disabled = false;
            this.showMessage('⏹️ Recording stopped! Ready to download!');
        }
    }

    downloadRecording() {
        if (this.audioEngine.downloadRecording()) {
            this.showMessage('💾 Recording downloaded successfully!');
        } else {
            this.showMessage('❌ No recording to download');
        }
    }

    shareComposition() {
        const pattern = this.musicGrid.exportPattern();
        const compositionUrl = this.createShareableUrl(pattern);
        
        if (navigator.share) {
            navigator.share({
                title: 'Check out my Muziq creation!',
                text: 'I made this awesome music with Muziq! 🎵',
                url: compositionUrl
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(compositionUrl).then(() => {
                this.showMessage('🔗 Share URL copied to clipboard!');
            });
        }
    }

    createShareableUrl(pattern) {
        const compressed = btoa(JSON.stringify(pattern));
        return `${window.location.origin}${window.location.pathname}?pattern=${compressed}`;
    }

    setTempo(bpm) {
        this.audioEngine.setTempo(parseInt(bpm));
        document.getElementById('tempo-display').textContent = bpm;
    }

    setVolume(volume) {
        this.audioEngine.setVolume(parseInt(volume));
    }

    toggleEffect(effectName) {
        const isActive = this.audioEngine.toggleEffect(effectName);
        const btn = document.querySelector(`[data-effect="${effectName}"]`);
        
        if (isActive) {
            btn.classList.add('active');
            this.showMessage(`✨ ${effectName.toUpperCase()} effect ON!`);
        } else {
            btn.classList.remove('active');
            this.showMessage(`💫 ${effectName.toUpperCase()} effect OFF`);
        }
    }

    handleKeyboardShortcuts(e) {
        // Only handle shortcuts if not typing in an input
        if (e.target.tagName === 'INPUT') return;
        
        switch (e.key.toLowerCase()) {
            case ' ': // Spacebar
                e.preventDefault();
                if (this.audioEngine.isPlaying) {
                    this.stopSequence();
                } else {
                    this.playSequence();
                }
                break;
            case 'escape':
                this.stopSequence();
                break;
            case 'delete':
            case 'backspace':
                this.clearAll();
                break;
            case 'r':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleRecording();
                }
                break;
        }
    }

    updatePlaybackButtons(isPlaying) {
        document.getElementById('playBtn').disabled = isPlaying;
        document.getElementById('pauseBtn').disabled = !isPlaying;
        document.getElementById('stopBtn').disabled = !isPlaying;
    }

    updateUIState() {
        // Set initial tempo display
        document.getElementById('tempo-display').textContent = this.audioEngine.tempo;
        
        // Set initial volume
        document.getElementById('volumeSlider').value = 70;
        this.audioEngine.setVolume(70);
        
        // Update playback buttons
        this.updatePlaybackButtons(false);
    }

    showMessage(message) {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = 'toast-message';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(messageEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 3000);
    }

    showWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.className = 'welcome-message';
        welcome.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                padding: 30px;
                border-radius: 20px;
                text-align: center;
                z-index: 1000;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                max-width: 400px;
            ">
                <h2 style="color: #5a67d8; margin-bottom: 15px;">🎵 Welcome to Muziq!</h2>
                <p style="margin-bottom: 20px; color: #666;">
                    Click the colorful grid to paint your music!<br>
                    Tap piano keys or use your keyboard!<br>
                    Try different instruments and effects!
                </p>
                <button id="welcomeBtn" style="
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 20px;
                    font-weight: 600;
                    cursor: pointer;
                ">Let's Make Music! 🎹</button>
            </div>
        `;
        
        document.body.appendChild(welcome);
        
        document.getElementById('welcomeBtn').addEventListener('click', () => {
            document.body.removeChild(welcome);
            this.showMessage('🎵 Let your creativity flow!');
        });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(welcome)) {
                document.body.removeChild(welcome);
            }
        }, 10000);
    }

    addPatternButtons() {
        const gridContainer = document.querySelector('.music-grid-container');
        const patternButtons = document.createElement('div');
        patternButtons.className = 'pattern-buttons';
        patternButtons.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 15px;
            flex-wrap: wrap;
        `;
        
        const patterns = [
            { name: 'kick', label: '🥁 Kick' },
            { name: 'snare', label: '🎯 Snare' },
            { name: 'hihat', label: '🔥 Hi-hat' },
            { name: 'bass', label: '🎸 Bass' },
            { name: 'melody', label: '🎼 Melody' },
            { name: 'chord', label: '🎵 Chord' }
        ];
        
        patterns.forEach(pattern => {
            const btn = document.createElement('button');
            btn.textContent = pattern.label;
            btn.style.cssText = `
                padding: 8px 12px;
                background: linear-gradient(135deg, #a8edea, #fed6e3);
                border: none;
                border-radius: 15px;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            btn.addEventListener('click', () => {
                this.musicGrid.loadPattern(pattern.name);
                this.showMessage(`🎵 ${pattern.label} pattern loaded!`);
            });
            
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
            
            patternButtons.appendChild(btn);
        });
        
        // Add random pattern button
        const randomBtn = document.createElement('button');
        randomBtn.textContent = '🎲 Random';
        randomBtn.style.cssText = `
            padding: 8px 12px;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            border: none;
            border-radius: 15px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            color: white;
            font-weight: 600;
        `;
        
        randomBtn.addEventListener('click', () => {
            this.musicGrid.generateRandomPattern();
            this.showMessage('🎲 Random pattern generated!');
        });
        
        patternButtons.appendChild(randomBtn);
        gridContainer.appendChild(patternButtons);
    }

    addMagicButtons() {
        const pianoContainer = document.querySelector('.piano-container');
        const magicButtons = document.createElement('div');
        magicButtons.className = 'magic-buttons';
        magicButtons.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 15px;
            flex-wrap: wrap;
        `;
        
        const magicActions = [
            { 
                label: '🎹 C Major', 
                action: () => this.piano.playMajorChord('C', 4) 
            },
            { 
                label: '🎭 C Minor', 
                action: () => this.piano.playMinorChord('C', 4) 
            },
            { 
                label: '🎼 C Scale', 
                action: () => this.piano.playScale('C', 4, 'major') 
            },
            { 
                label: '🌟 Blues Scale', 
                action: () => this.piano.playScale('C', 4, 'blues') 
            }
        ];
        
        magicActions.forEach(magic => {
            const btn = document.createElement('button');
            btn.textContent = magic.label;
            btn.style.cssText = `
                padding: 8px 12px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border: none;
                border-radius: 15px;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
                color: white;
                font-weight: 600;
            `;
            
            btn.addEventListener('click', magic.action);
            
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            });
            
            magicButtons.appendChild(btn);
        });
        
        pianoContainer.appendChild(magicButtons);
    }

    // Load shared pattern from URL
    loadSharedPattern() {
        const urlParams = new URLSearchParams(window.location.search);
        const patternData = urlParams.get('pattern');
        
        if (patternData) {
            try {
                const pattern = JSON.parse(atob(patternData));
                this.musicGrid.importPattern(pattern);
                this.showMessage('🔗 Shared composition loaded!');
            } catch (e) {
                console.error('Failed to load shared pattern:', e);
            }
        }
    }
}

// Add CSS animations for messages
const messageStyle = document.createElement('style');
messageStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(messageStyle);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MuziqApp();
    
    // Load shared pattern if present
    window.addEventListener('load', () => {
        app.loadSharedPattern();
    });
    
    // Make app globally available for debugging
    window.muziqApp = app;
}); 