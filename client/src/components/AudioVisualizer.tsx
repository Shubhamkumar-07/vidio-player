import React, { useEffect, useRef, useState } from 'react';
import { Activity, BarChart2 } from 'lucide-react';

interface AudioVisualizerProps {
  getAnalyserNode: () => AnalyserNode | null;
  isPlaying: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ getAnalyserNode, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'bars' | 'wave'>('bars');

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const analyser = getAnalyserNode();

      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!analyser || !isPlaying) {
        // Draw resting idle line
        ctx.strokeStyle = '#444455';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animId = requestAnimationFrame(render);
        return;
      }

      if (mode === 'bars') {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barCount = 48;
        const barWidth = (width / barCount) - 2;
        const step = Math.floor(bufferLength / barCount);

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * step];
          const barHeight = (val / 255) * height * 0.95;

          // VLC Orange / Amber gradient
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#ff4400');
          gradient.addColorStop(0.7, '#ff8800');
          gradient.addColorStop(1, '#ffc04d');

          ctx.fillStyle = gradient;
          ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);

          // Top peak dot
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(i * (barWidth + 2), Math.max(0, height - barHeight - 2), barWidth, 1.5);
        }
      } else {
        // Waveform mode
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#ff8800';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [getAnalyserNode, isPlaying, mode]);

  return (
    <div className="flex flex-col items-center bg-[#181820] border border-[#2e2e3a] rounded-lg p-3 w-full shadow-inner">
      <div className="flex items-center justify-between w-full mb-2 text-xs text-gray-400">
        <span className="font-semibold text-vlc-orange flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> Audio Visualizer
        </span>
        <div className="flex items-center gap-1 bg-[#242430] p-0.5 rounded">
          <button
            onClick={() => setMode('bars')}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${mode === 'bars' ? 'bg-vlc-orange text-white' : 'text-gray-400 hover:text-white'}`}
            title="Frequency Spectrum Bars"
          >
            <BarChart2 className="w-3 h-3 inline mr-1" /> Bars
          </button>
          <button
            onClick={() => setMode('wave')}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${mode === 'wave' ? 'bg-vlc-orange text-white' : 'text-gray-400 hover:text-white'}`}
            title="Oscilloscope Waveform"
          >
            <Activity className="w-3 h-3 inline mr-1" /> Wave
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={480}
        height={100}
        className="w-full h-24 rounded bg-[#101015]"
      />
    </div>
  );
};
