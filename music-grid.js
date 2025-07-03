class MusicGrid {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.gridContainer = document.getElementById('musicGrid');
        this.gridData = [];
        this.notes = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
        this.steps = 16;
        this.currentPlayingStep = -1;
        
        this.setupGrid();
        this.setupEventListeners();
    }

    setupGrid() {
        // Clear existing grid
        this.gridContainer.innerHTML = '';
        
        // Initialize grid data
        this.gridData = [];
        for (let note = 0; note < this.notes.length; note++) {
            this.gridData[note] = [];
            for (let step = 0; step < this.steps; step++) {
                this.gridData[note][step] = false;
            }
        }
        
        // Create grid cells
        for (let note = 0; note < this.notes.length; note++) {
            for (let step = 0; step < this.steps; step++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.note = note;
                cell.dataset.step = step;
                cell.dataset.noteName = this.notes[note];
                
                // Add color coding based on note
                const hue = (note * 45) % 360;
                cell.style.setProperty('--note-hue', hue);
                
                // Click event for toggling cells
                cell.addEventListener('click', () => {
                    this.toggleCell(note, step);
                });
                
                // Add step numbers for first row
                if (note === 0) {
                    const stepNumber = document.createElement('div');
                    stepNumber.className = 'step-number';
                    stepNumber.textContent = step + 1;
                    stepNumber.style.position = 'absolute';
                    stepNumber.style.top = '-20px';
                    stepNumber.style.left = '50%';
                    stepNumber.style.transform = 'translateX(-50%)';
                    stepNumber.style.fontSize = '12px';
                    stepNumber.style.color = '#666';
                    cell.style.position = 'relative';
                    cell.appendChild(stepNumber);
                }
                
                // Add note names for first column
                if (step === 0) {
                    const noteName = document.createElement('div');
                    noteName.className = 'note-name';
                    noteName.textContent = this.notes[note];
                    noteName.style.position = 'absolute';
                    noteName.style.left = '-30px';
                    noteName.style.top = '50%';
                    noteName.style.transform = 'translateY(-50%)';
                    noteName.style.fontSize = '12px';
                    noteName.style.color = '#666';
                    noteName.style.fontWeight = 'bold';
                    cell.style.position = 'relative';
                    cell.appendChild(noteName);
                }
                
                this.gridContainer.appendChild(cell);
            }
        }
        
        // Add CSS custom properties for dynamic coloring
        const style = document.createElement('style');
        style.textContent = `
            .grid-cell.active {
                background: linear-gradient(135deg, 
                    hsl(var(--note-hue, 0), 80%, 60%), 
                    hsl(calc(var(--note-hue, 0) + 30), 80%, 70%)) !important;
            }
            .grid-cell:hover {
                background: linear-gradient(135deg, 
                    hsl(var(--note-hue, 0), 60%, 80%), 
                    hsl(calc(var(--note-hue, 0) + 30), 60%, 85%)) !important;
            }
        `;
        document.head.appendChild(style);
    }

    toggleCell(noteIndex, stepIndex) {
        this.gridData[noteIndex][stepIndex] = !this.gridData[noteIndex][stepIndex];
        const cell = this.getCellElement(noteIndex, stepIndex);
        
        if (this.gridData[noteIndex][stepIndex]) {
            cell.classList.add('active');
            // Play the note when activated
            const frequency = AudioEngine.noteToFrequency(
                this.notes[noteIndex].slice(0, -1), 
                parseInt(this.notes[noteIndex].slice(-1))
            );
            this.audioEngine.playNote(frequency, 0.2);
        } else {
            cell.classList.remove('active');
        }
    }

    getCellElement(noteIndex, stepIndex) {
        return this.gridContainer.querySelector(
            `[data-note="${noteIndex}"][data-step="${stepIndex}"]`
        );
    }

    clearGrid() {
        for (let note = 0; note < this.notes.length; note++) {
            for (let step = 0; step < this.steps; step++) {
                this.gridData[note][step] = false;
                const cell = this.getCellElement(note, step);
                cell.classList.remove('active');
            }
        }
    }

    playStep(stepIndex) {
        // Clear previous step highlighting
        if (this.currentPlayingStep >= 0) {
            for (let note = 0; note < this.notes.length; note++) {
                const prevCell = this.getCellElement(note, this.currentPlayingStep);
                prevCell.classList.remove('playing');
            }
        }
        
        // Highlight current step
        this.currentPlayingStep = stepIndex;
        for (let note = 0; note < this.notes.length; note++) {
            const cell = this.getCellElement(note, stepIndex);
            cell.classList.add('playing');
            
            // Play notes that are active on this step
            if (this.gridData[note][stepIndex]) {
                const frequency = AudioEngine.noteToFrequency(
                    this.notes[note].slice(0, -1), 
                    parseInt(this.notes[note].slice(-1))
                );
                this.audioEngine.playNote(frequency, 0.2);
            }
        }
        
        // Remove highlighting after a short delay
        setTimeout(() => {
            for (let note = 0; note < this.notes.length; note++) {
                const cell = this.getCellElement(note, stepIndex);
                cell.classList.remove('playing');
            }
        }, 100);
    }

    stopPlayback() {
        // Clear all playing highlights
        if (this.currentPlayingStep >= 0) {
            for (let note = 0; note < this.notes.length; note++) {
                const cell = this.getCellElement(note, this.currentPlayingStep);
                cell.classList.remove('playing');
            }
        }
        this.currentPlayingStep = -1;
    }

    setupEventListeners() {
        // Listen for step triggers from audio engine
        window.addEventListener('stepTriggered', (event) => {
            this.playStep(event.detail.step);
        });
    }

    // Pattern presets
    loadPattern(patternName) {
        this.clearGrid();
        
        const patterns = {
            'kick': {
                notes: [7], // C4 (bottom row)
                steps: [0, 4, 8, 12]
            },
            'snare': {
                notes: [5], // E4
                steps: [4, 12]
            },
            'hihat': {
                notes: [1], // B4
                steps: [2, 6, 10, 14]
            },
            'bass': {
                notes: [7, 6], // C4, D4
                steps: [0, 2, 4, 6, 8, 10, 12, 14]
            },
            'melody': {
                notes: [0, 1, 2, 3], // C5, B4, A4, G4
                steps: [0, 2, 4, 7, 8, 11, 12, 15]
            },
            'chord': {
                notes: [4, 2, 0], // F4, A4, C5
                steps: [0, 8]
            }
        };
        
        const pattern = patterns[patternName];
        if (pattern) {
            pattern.notes.forEach(noteIndex => {
                pattern.steps.forEach(stepIndex => {
                    this.toggleCell(noteIndex, stepIndex);
                });
            });
        }
    }

    // Generate random pattern
    generateRandomPattern() {
        this.clearGrid();
        
        // Add some randomness but keep it musical
        const density = 0.3; // 30% chance for each cell
        
        for (let note = 0; note < this.notes.length; note++) {
            for (let step = 0; step < this.steps; step++) {
                // Higher probability for certain steps (on the beat)
                let probability = density;
                if (step % 4 === 0) probability *= 1.5; // Downbeats
                if (step % 2 === 0) probability *= 1.2; // On beats
                
                if (Math.random() < probability) {
                    this.toggleCell(note, step);
                }
            }
        }
    }

    // Export pattern as data
    exportPattern() {
        return {
            gridData: this.gridData,
            notes: this.notes,
            tempo: this.audioEngine.tempo,
            instrument: this.audioEngine.currentInstrument
        };
    }

    // Import pattern from data
    importPattern(patternData) {
        this.clearGrid();
        
        if (patternData.gridData && patternData.notes) {
            this.gridData = patternData.gridData;
            
            // Update visual state
            for (let note = 0; note < this.notes.length; note++) {
                for (let step = 0; step < this.steps; step++) {
                    if (this.gridData[note] && this.gridData[note][step]) {
                        const cell = this.getCellElement(note, step);
                        cell.classList.add('active');
                    }
                }
            }
            
            // Update tempo and instrument if provided
            if (patternData.tempo) {
                this.audioEngine.setTempo(patternData.tempo);
            }
            if (patternData.instrument) {
                this.audioEngine.currentInstrument = patternData.instrument;
            }
        }
    }
}

// Export for use in other modules
window.MusicGrid = MusicGrid; 