# Vidio Player - Full Stack Web Edition

A modern, feature-rich web media player built with **React 18, TypeScript, Vite, Tailwind CSS, Web Audio API, Hls.js, Node.js, and Express**.

![Vidio Player Logo](client/public/logo.png)

---

## 🚀 Quick Start

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Start both Frontend & Backend in Development Mode
```bash
npm run dev
```
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **API & Streaming Server**: [http://localhost:5050](http://localhost:5050)

### 3. Build & Run Production Server
```bash
npm run start
```
Starts the production server on [http://localhost:5050](http://localhost:5050) which serves both the API and optimized static frontend bundle.

---

## 🎛️ VLC Functions Integrated

### 1. Core Playback & Transport Controls
- **Play / Pause / Stop**: Large responsive transport controls with stop & rewind to 0:00.
- **Fast Scrubbing & Seeking**: Sub-frame scrub bar with buffered range indicators, hover timestamp tooltip, and keyboard-guided jumping.
- **Variable Playback Speed**: Control speed from **0.25x to 4.00x** with `[` and `]` shortcuts or fine-stepper buttons.
- **Frame-by-Frame Stepping**: Step forward single video frames (`E` key).
- **A-B Repeat Looping**: Set Point A, set Point B, and loop a precise section continuously.
- **Time Display Toggle**: Click time to toggle between **Elapsed / Total** and **Elapsed / -Remaining** (`T` key).

### 2. Audio Effects & 10-Band Graphic Equalizer (`Ctrl+E`)
- **VLC Volume Overboost (Up to 200%)**: GainNode-powered volume slider boosting beyond standard 100% with amber/red safety threshold indicators.
- **10-Band Graphic Equalizer**:
  - `31 Hz`, `63 Hz`, `125 Hz`, `250 Hz`, `500 Hz`, `1 kHz`, `2 kHz`, `4 kHz`, `8 kHz`, `16 kHz`.
  - Gain range: `-20 dB` to `+20 dB`.
- **Preamp Control**: `-20 dB` to `+20 dB` master pre-amplification.
- **18 Authentic VLC Presets**:
  - *Flat, Classical, Club, Dance, Full Bass, Full Bass & Treble, Full Treble, Headphones, Large Hall, Live, Party, Pop, Reggae, Rock, Ska, Soft, Soft Rock, Techno, Vocal Booster*.
- **Stereo Panning**: Left <-> Center <-> Right audio balance.
- **Audio Delay Synchronization**: Shift audio playback by `-500ms` to `+2000ms` (`J` and `K` keys) to fix out-of-sync audio.
- **Audio Visualizer**: Real-time 60fps Frequency Spectrum Analyzer bars and Oscilloscope Waveform (`B` key).

### 3. Video Adjustments & Geometry (`Ctrl+V`)
- **Color Adjustments**:
  - Brightness (0% - 200%)
  - Contrast (0% - 200%)
  - Saturation (0% - 300%)
  - Hue Rotate (0° - 360°)
  - Gamma Correction (0.5 - 2.5)
  - Blur Filter (0 - 15px)
  - Color filters: Invert, Sepia, Grayscale.
- **Geometry & Transformations**:
  - Rotation: 0°, 90°, 180°, 270°.
  - Horizontal Flip (Mirror) & Vertical Flip.
- **Aspect Ratio Control**:
  - `Default (Auto)`, `16:9`, `4:3`, `1:1`, `16:10`, `21:9` (Cinematic Ultrawide), `Fit`, `Fill (Crop)`, and `Stretch`.
- **Video Snapshot**: Instant high-resolution frame capture downloaded as PNG (`Snap` button).
- **Picture-in-Picture (PiP)**: Native browser float window.
- **Fullscreen**: Responsive fullscreen viewing (`F` key).

### 4. Subtitles & Closed Captions (`V`)
- Multi-track subtitle selector.
- Ingest `.srt` and `.vtt` subtitles (auto-parsed on client and server).
- **Subtitle Delay Synchronization**: Adjust subtitle delay offset +/- 50ms (`G` and `H` keys).
- **Customizable Appearance**:
  - Font size (Small 16px, Medium 22px, Large 30px, Huge 40px).
  - Text color (White, Yellow, Cyan, Green).
  - Background opacity (None, 40%, 75%, 100% Solid Black).
  - Subtitle vertical position (Bottom / Top).

### 5. Network Stream & HLS Engine (`Ctrl+N`)
- **Open Network Stream**: Stream HTTP, HTTPS, and HLS (`.m3u8`) URLs.
- **Hls.js Integration**: Multi-bitrate adaptive live/VOD streaming.
- **Backend CORS Proxy**: `/api/proxy?url=...` allows playing streams from servers that block browser CORS.
- **Built-in Presets**:
  - Big Buck Bunny Multi-Bitrate Adaptive HLS
  - View From A Blue Moon (Surf film 720p MP4 + Subtitles)
  - Sintel Open Movie HLS
  - Tears of Steel 1080p HLS

### 6. Playlist & Media Library (`Ctrl+L`)
- Drag & Drop media file ingestion.
- Multi-file queue management.
- Reorder items up/down, remove tracks, clear queue.
- Search filter.
- Playback modes: **Sequential**, **Shuffle**, **Repeat All**, **Repeat One**.
- **M3U Export & Import**: Save playlists as `.m3u` files compatible with VLC desktop.

### 7. Media Information (`Ctrl+I`)
- Inspect file size, format, resolution, audio codec, channels, sample rate, bitrate, and duration.

---

## ⌨️ VLC Keyboard Shortcuts Cheatsheet

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause toggle |
| `S` | Stop playback and rewind to start |
| `N` / `P` | Next / Previous track |
| `Left` / `Right` | Short jump (5 seconds) |
| `Shift + Left/Right` | Very short jump (3 seconds) |
| `Ctrl + Left/Right` | Medium jump (10 seconds) |
| `Alt + Left/Right` | Long jump (60 seconds) |
| `Up` / `Down` | Volume up / down (Boosts up to 200%) |
| `M` | Mute / Unmute sound |
| `[` / `]` | Slower / Faster playback speed (-0.1x / +0.1x) |
| `=` | Reset playback speed to 1.0x normal |
| `E` | Frame by Frame advance (Step +1 frame) |
| `G` / `H` | Subtitle delay offset (-/+ 50ms) |
| `J` / `K` | Audio delay offset (-/+ 50ms) |
| `A` | Cycle aspect ratio (16:9, 4:3, 1:1, 21:9, etc.) |
| `V` | Toggle subtitles on / off |
| `T` | Toggle time display (Elapsed / Remaining) |
| `B` | Toggle Audio Visualizer widget |
| `R` | Cycle repeat mode (Off / All / One) |
| `F` | Toggle Fullscreen |
| `Ctrl + O` | Open local file(s) |
| `Ctrl + N` | Open Network Stream dialog |
| `Ctrl + E` | Open Audio Equalizer & Effects dialog |
| `Ctrl + V` | Open Video Effects dialog |
| `Ctrl + L` | Toggle Playlist panel |
| `Ctrl + I` | Show Media Information dialog |
| `?` or `F1` | Show Keyboard Shortcuts help |

---

## 🏗️ Architecture

```
Vidio Player/
├── server/
│   ├── index.js               # Express API, HTTP 206 partial streaming, CORS proxy, M3U parser
│   ├── generate-sample-audio.js # 16-sec synth test WAV with chords & bass
│   ├── public/sample/         # Offline demo clips (video, WAV, SRT, VTT)
│   ├── uploads/               # User-uploaded media
│   └── data/                  # Persisted media and playlist databases
├── client/
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useAudioEngine.ts    # Web Audio API (10-band EQ, 200% Gain, Panner, Delay, Analyser)
│   │   ├── components/
│   │   │   ├── MenuBar.tsx          # Authentic VLC Top Menu (Media, Playback, Audio, Video, etc.)
│   │   │   ├── VideoViewport.tsx    # Video stage, CSS shader filters, subtitles, OSD toasts
│   │   │   ├── ControlBar.tsx       # Scrub bar, transport buttons, 200% volume gauge, time
│   │   │   ├── AudioEffectsModal.tsx # 10-band Equalizer, preamp, 18 presets, pan, delay
│   │   │   ├── VideoEffectsModal.tsx # Color adjustments, rotate, flip, aspect ratio override
│   │   │   ├── NetworkStreamModal.tsx# HLS and direct stream opener
│   │   │   ├── SubtitleSettingsModal.tsx # Font size, color, background opacity, delay sync
│   │   │   ├── MediaInfoModal.tsx   # Codec, resolution, bitrate, channels inspector
│   │   │   ├── ShortcutsModal.tsx   # Hotkeys reference dialog
│   │   │   ├── PlaylistPanel.tsx    # Playlist queue, M3U export/import, search
│   │   │   └── AudioVisualizer.tsx  # 60fps Frequency Spectrum & Oscilloscope canvas
│   │   ├── utils/
│   │   │   ├── equalizerPresets.ts  # VLC 10-band frequencies & 18 presets
│   │   │   └── subtitleParser.ts    # SRT / WebVTT timestamped parser
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── App.tsx                  # Root state orchestration & global keyboard listeners
│   │   ├── index.css                # VLC styling & animations
│   │   └── main.tsx                 # React entry point
│   ├── vite.config.ts               # Vite proxy to backend API & static builds
│   └── public/vlc-cone.svg          # VLC traffic cone vector asset
└── package.json                     # Root orchestrator scripts
```
