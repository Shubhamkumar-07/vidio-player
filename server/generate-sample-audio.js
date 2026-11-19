// Generates a 15-second melodic stereo WAV file with bass, chords, and high frequency percussion
import fs from 'fs';
import path from 'path';

function createWav() {
  const sampleRate = 44100;
  const numChannels = 2;
  const bytesPerSample = 2; // 16-bit
  const duration = 16; // 16 seconds
  const totalSamples = sampleRate * duration;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = totalSamples * blockAlign;

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate pleasant synth chords + bassline + hi-hat pulses
  let offset = 44;
  const bpm = 120;
  const beatDuration = 60 / bpm;

  // Chord progression: Am - F - C - G
  const chordFreqs = [
    [220, 261.63, 329.63, 440], // Am
    [174.61, 220, 261.63, 349.23], // F
    [130.81, 164.81, 196.00, 261.63], // C
    [196.00, 246.94, 293.66, 392.00]  // G
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const currentChordIndex = Math.floor(t / (beatDuration * 2)) % chordFreqs.length;
    const chord = chordFreqs[currentChordIndex];

    // Bass note (around 55 - 110 Hz for sub-bass & bass EQ test)
    const bassFreq = chord[0] / 2;
    const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.45;

    // Chords (mid frequencies)
    let chordTone = 0;
    for (const f of chord) {
      chordTone += Math.sin(2 * Math.PI * f * t) * 0.15;
    }

    // Hi-hat / shimmer (high frequencies 8k-12kHz)
    const beatFraction = (t % (beatDuration / 2)) / (beatDuration / 2);
    const hiHatEnv = Math.exp(-beatFraction * 20);
    const noise = (Math.random() * 2 - 1) * hiHatEnv * 0.25;

    // Combine left and right with slight stereo spread
    let left = (bass + chordTone * 0.9 + noise * 0.8);
    let right = (bass + chordTone * 1.1 + noise * 1.2);

    // Fade in and out
    const fadeIn = Math.min(1, t / 1);
    const fadeOut = Math.min(1, (duration - t) / 1);
    const envelope = fadeIn * fadeOut;

    left = Math.max(-1, Math.min(1, left * envelope));
    right = Math.max(-1, Math.min(1, right * envelope));

    buffer.writeInt16LE(Math.floor(left * 32767), offset);
    buffer.writeInt16LE(Math.floor(right * 32767), offset + 2);
    offset += 4;
  }

  const outPath = path.resolve('server/public/sample/synth-groove-demo.wav');
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated demo WAV at: ${outPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
}

createWav();
