class Piano {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.pianoContainer = document.getElementById('pianoKeys');
        this.activeNotes = new Map();
        this.keyboardMapping = {
            // White keys
            'z': 'C4', 'x': 'D4', 'c': 'E4', 'v': 'F4', 'b': 'G4', 'n': 'A4', 'm': 'B4',
            'q': 'C5', 'w': 'D5', 'e': 'E5', 'r': 'F5', 't': 'G5', 'y': 'A5', 'u': 'B5',
            
            // Black keys
            's': 'C#4', 'd': 'D#4', 'g': 'F#4', 'h': 'G#4', 'j': 'A#4',
            '2': 'C#5', '3': 'D#5', '5': 'F#5', '6': 'G#5', '7': 'A#5'
        };
        
        this.setupPiano();
        this.setupEventListeners();
    }

    setupPiano() {
        this.pianoContainer.innerHTML = '';
        
        // Create multiple octaves
        const octaves = [3, 4, 5];
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        octaves.forEach(octave => {
            const octaveContainer = document.createElement('div');
            octaveContainer.className = 'octave-container';
            octaveContainer.style.display = 'flex';
            octaveContainer.style.position = 'relative';
            
            // Create white keys first
            const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
            whiteNotes.forEach(note => {
                const key = this.createPianoKey(note, octave, 'white');
                octaveContainer.appendChild(key);
            });
            
            // Create black keys and position them
            const blackNotes = ['C#', 'D#', 'F#', 'G#', 'A#'];
            const blackKeyPositions = [0.7, 1.7, 3.7, 4.7, 5.7]; // Relative positions between white keys
            
            blackNotes.forEach((note, index) => {
                const key = this.createPianoKey(note, octave, 'black');
                key.style.position = 'absolute';
                key.style.left = `${blackKeyPositions[index] * 52 + 17.5}px`; // 52px white key width, centered
                octaveContainer.appendChild(key);
            });
            
            this.pianoContainer.appendChild(octaveContainer);
        });
        
        // Add octave labels
        const octaveLabels = document.createElement('div');
        octaveLabels.className = 'octave-labels';
        octaveLabels.style.display = 'flex';
        octaveLabels.style.justifyContent = 'center';
        octaveLabels.style.marginTop = '10px';
        octaveLabels.style.gap = '100px';
        
        octaves.forEach(octave => {
            const label = document.createElement('span');
            label.textContent = `Octave ${octave}`;
            label.style.fontSize = '12px';
            label.style.color = '#666';
            label.style.fontWeight = 'bold';
            octaveLabels.appendChild(label);
        });
        
        this.pianoContainer.appendChild(octaveLabels);
    }

    createPianoKey(note, octave, type) {
        const key = document.createElement('button');
        key.className = `piano-key ${type}`;
        key.dataset.note = `${note}${octave}`;
        key.textContent = type === 'white' ? note : note;
        
        // Add color coding
        const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(note);
        const hue = (noteIndex * 30) % 360;
        key.style.setProperty('--key-hue', hue);
        
        // Mouse events
        key.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.playNote(note, octave);
        });
        
        key.addEventListener('mouseup', () => {
            this.stopNote(note, octave);
        });
        
        key.addEventListener('mouseleave', () => {
            this.stopNote(note, octave);
        });
        
        // Touch events for mobile
        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.playNote(note, octave);
        });
        
        key.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopNote(note, octave);
        });
        
        return key;
    }

    playNote(note, octave) {
        const noteKey = `${note}${octave}`;
        
        // Don't play if already playing
        if (this.activeNotes.has(noteKey)) return;
        
        const frequency = AudioEngine.noteToFrequency(note, octave);
        const sound = this.audioEngine.playNote(frequency, 2); // Longer duration for piano
        
        this.activeNotes.set(noteKey, sound);
        
        // Visual feedback
        const keyElement = this.pianoContainer.querySelector(`[data-note="${noteKey}"]`);
        if (keyElement) {
            keyElement.classList.add('playing');
        }
    }

    stopNote(note, octave) {
        const noteKey = `${note}${octave}`;
        const sound = this.activeNotes.get(noteKey);
        
        if (sound) {
            try {
                sound.stop();
            } catch (e) {
                // Note already stopped
            }
            this.activeNotes.delete(noteKey);
        }
        
        // Remove visual feedback
        const keyElement = this.pianoContainer.querySelector(`[data-note="${noteKey}"]`);
        if (keyElement) {
            keyElement.classList.remove('playing');
        }
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            const note = this.keyboardMapping[e.key.toLowerCase()];
            if (note && !e.repeat) {
                const noteName = note.slice(0, -1);
                const octave = parseInt(note.slice(-1));
                this.playNote(noteName, octave);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const note = this.keyboardMapping[e.key.toLowerCase()];
            if (note) {
                const noteName = note.slice(0, -1);
                const octave = parseInt(note.slice(-1));
                this.stopNote(noteName, octave);
            }
        });
        
        // Stop all notes when window loses focus
        window.addEventListener('blur', () => {
            this.stopAllNotes();
        });
    }

    stopAllNotes() {
        this.activeNotes.forEach((sound, noteKey) => {
            try {
                sound.stop();
            } catch (e) {
                // Note already stopped
            }
            
            // Remove visual feedback
            const keyElement = this.pianoContainer.querySelector(`[data-note="${noteKey}"]`);
            if (keyElement) {
                keyElement.classList.remove('playing');
            }
        });
        this.activeNotes.clear();
    }

    // Play a chord (multiple notes at once)
    playChord(noteArray, duration = 2) {
        noteArray.forEach(noteData => {
            let note, octave;
            if (typeof noteData === 'string') {
                note = noteData.slice(0, -1);
                octave = parseInt(noteData.slice(-1));
            } else {
                note = noteData.note;
                octave = noteData.octave;
            }
            this.playNote(note, octave);
        });
        
        // Auto-stop chord after duration
        setTimeout(() => {
            noteArray.forEach(noteData => {
                let note, octave;
                if (typeof noteData === 'string') {
                    note = noteData.slice(0, -1);
                    octave = parseInt(noteData.slice(-1));
                } else {
                    note = noteData.note;
                    octave = noteData.octave;
                }
                this.stopNote(note, octave);
            });
        }, duration * 1000);
    }

    // Play some example chords
    playMajorChord(rootNote = 'C', octave = 4) {
        const notes = [
            `${rootNote}${octave}`,
            this.getInterval(rootNote, octave, 4), // Major third
            this.getInterval(rootNote, octave, 7)  // Perfect fifth
        ];
        this.playChord(notes);
    }

    playMinorChord(rootNote = 'C', octave = 4) {
        const notes = [
            `${rootNote}${octave}`,
            this.getInterval(rootNote, octave, 3), // Minor third
            this.getInterval(rootNote, octave, 7)  // Perfect fifth
        ];
        this.playChord(notes);
    }

    // Helper function to get interval notes
    getInterval(rootNote, octave, semitones) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const rootIndex = noteNames.indexOf(rootNote);
        const targetIndex = (rootIndex + semitones) % 12;
        const targetOctave = octave + Math.floor((rootIndex + semitones) / 12);
        
        return `${noteNames[targetIndex]}${targetOctave}`;
    }

    // Play a scale
    playScale(rootNote = 'C', octave = 4, scaleType = 'major') {
        const scales = {
            major: [0, 2, 4, 5, 7, 9, 11, 12],
            minor: [0, 2, 3, 5, 7, 8, 10, 12],
            pentatonic: [0, 2, 4, 7, 9, 12],
            blues: [0, 3, 5, 6, 7, 10, 12]
        };
        
        const intervals = scales[scaleType] || scales.major;
        
        intervals.forEach((interval, index) => {
            setTimeout(() => {
                const note = this.getInterval(rootNote, octave, interval);
                const noteName = note.slice(0, -1);
                const noteOctave = parseInt(note.slice(-1));
                this.playNote(noteName, noteOctave);
                
                setTimeout(() => {
                    this.stopNote(noteName, noteOctave);
                }, 300);
            }, index * 200);
        });
    }

    // Visual effects for fun
    addSparkleEffect(keyElement) {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'absolute';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = 'gold';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.animation = 'sparkle 1s ease-out forwards';
        
        const rect = keyElement.getBoundingClientRect();
        sparkle.style.left = `${rect.left + Math.random() * rect.width}px`;
        sparkle.style.top = `${rect.top + Math.random() * rect.height}px`;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            document.body.removeChild(sparkle);
        }, 1000);
    }
}

// Add sparkle animation CSS
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkle {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    .piano-key.white.playing {
        background: linear-gradient(180deg, 
            hsl(var(--key-hue, 200), 80%, 70%), 
            hsl(calc(var(--key-hue, 200) + 30), 80%, 60%)) !important;
        box-shadow: 0 0 20px hsl(var(--key-hue, 200), 80%, 70%);
    }
    
    .piano-key.black.playing {
        background: linear-gradient(180deg, 
            hsl(var(--key-hue, 200), 80%, 50%), 
            hsl(calc(var(--key-hue, 200) + 30), 80%, 40%)) !important;
        box-shadow: 0 0 20px hsl(var(--key-hue, 200), 80%, 50%);
    }
`;
document.head.appendChild(sparkleStyle);

// Export for use in other modules
window.Piano = Piano; 