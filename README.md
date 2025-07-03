# 🎵 Muziq - Music Making Toy

An experimental music generation experience that's fun, colorful, and easy to use! Create magical music with colors & sounds in your browser.

![Muziq Preview](https://user-images.githubusercontent.com/placeholder/preview.gif)

## ✨ Features

- **🌈 Colorful Music Grid**: Paint your music by clicking colorful cells in a 16-step sequencer
- **🎹 Interactive Piano**: Play piano keys with your mouse, touch, or computer keyboard
- **🎶 Multiple Instruments**: Choose between Piano, Synth, Drums, and Bells
- **✨ Audio Effects**: Add Reverb, Delay, and Distortion effects to your sounds
- **🔴 Recording**: Record your compositions and download them as audio files
- **🔗 Share**: Share your musical creations with others via URL
- **🎲 Pattern Presets**: Load pre-made patterns or generate random ones
- **📱 Mobile Friendly**: Works great on phones, tablets, and computers

## 🚀 Getting Started

1. **Open the app**: Simply open `index.html` in your web browser
2. **Click to enable audio**: Your browser will ask for permission to play audio
3. **Start creating**: 
   - Click on the colorful grid squares to create patterns
   - Tap piano keys to play melodies
   - Try different instruments and effects
   - Use the preset patterns or generate random ones

## 🎮 How to Use

### Music Grid (Sequencer)
- **Click squares** to activate/deactivate notes
- **Play button** to start the sequence
- **Different colors** represent different pitches
- **16 steps** per pattern loop

### Piano
- **Click keys** with your mouse or finger
- **Keyboard controls**:
  - White keys: `Z X C V B N M` (lower octave), `Q W E R T Y U` (higher octave)
  - Black keys: `S D`, `G H J`, `2 3`, `5 6 7`

### Controls
- **🎹 Instruments**: Piano, Synth, Drums, Bells
- **🕺 Tempo**: Adjust playback speed (60-180 BPM)
- **🔊 Volume**: Master volume control
- **✨ Effects**: Toggle Reverb, Delay, and Distortion
- **🔴 Record**: Capture your performance as audio
- **💾 Download**: Save recordings to your device
- **🔗 Share**: Create shareable URLs of your compositions

### Keyboard Shortcuts
- **Spacebar**: Play/Stop
- **Escape**: Stop playback
- **Delete/Backspace**: Clear all
- **Ctrl+R**: Toggle recording

### Pattern Presets
- **🥁 Kick**: Basic kick drum pattern
- **🎯 Snare**: Snare drum hits
- **🔥 Hi-hat**: Hi-hat rhythm
- **🎸 Bass**: Bass line pattern
- **🎼 Melody**: Simple melody
- **🎵 Chord**: Chord progression
- **🎲 Random**: Generate random musical pattern

### Magic Piano Buttons
- **🎹 C Major**: Play C major chord
- **🎭 C Minor**: Play C minor chord
- **🎼 C Scale**: Play C major scale
- **🌟 Blues Scale**: Play C blues scale

## 🛠️ Technical Details

- **Web Audio API**: Real-time audio synthesis and effects
- **No Dependencies**: Pure HTML, CSS, and JavaScript
- **Modern Web Standards**: Uses latest browser audio features
- **Responsive Design**: Works on all screen sizes
- **Progressive Enhancement**: Graceful fallbacks for older browsers

## 🎵 Music Theory Features

- **Real frequencies**: Accurate musical tuning (A4 = 440Hz)
- **Multiple octaves**: Piano spans 3 octaves (C3-B5)
- **Proper intervals**: Correct musical spacing between notes
- **Scale support**: Major, minor, pentatonic, and blues scales
- **Chord recognition**: Major and minor chord patterns

## 🌐 Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile browsers**: iOS Safari, Android Chrome
- **Audio support**: Web Audio API required
- **Features**: Recording requires MediaRecorder API

## 🎨 Customization

The app is designed to be easily customizable:
- **Colors**: Modify CSS custom properties for different color schemes
- **Instruments**: Add new sound synthesis in `audio-engine.js`
- **Effects**: Extend the effects chain with new audio processors
- **Grid size**: Adjust grid dimensions in `music-grid.js`
- **Scales**: Add new musical scales in `piano.js`

## 🔧 Development

To modify or extend Muziq:

1. **File structure**:
   - `index.html` - Main HTML structure
   - `styles.css` - All styling and animations
   - `audio-engine.js` - Audio synthesis and effects
   - `music-grid.js` - Sequencer functionality
   - `piano.js` - Piano keyboard implementation
   - `app.js` - Main application logic

2. **Key concepts**:
   - Web Audio API for sound generation
   - CSS Grid for responsive layout
   - Event-driven architecture
   - Modular JavaScript classes

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🎵 Credits

Created with 💜 for music lovers everywhere. Inspired by the joy of making music accessible to everyone.

---

**Have fun making music! 🎹✨** 