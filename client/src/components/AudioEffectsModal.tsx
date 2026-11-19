import React from 'react';
import { X, RotateCcw, Volume2, Sliders, Music } from 'lucide-react';
import { EqualizerSettings } from '../types';
import { EQ_FREQUENCIES, EQ_PRESETS } from '../utils/equalizerPresets';
import { AudioVisualizer } from './AudioVisualizer';

interface AudioEffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eqSettings: EqualizerSettings;
  preamp: number;
  onPreampChange: (db: number) => void;
  onBandGainChange: (freq: number, db: number) => void;
  onPresetChange: (presetName: string) => void;
  onToggleEqualizer: (enabled: boolean) => void;
  stereoPan: number;
  onStereoPanChange: (pan: number) => void;
  audioDelayMs: number;
  onAudioDelayChange: (delayMs: number) => void;
  getAnalyserNode: () => AnalyserNode | null;
  isPlaying: boolean;
}

export const AudioEffectsModal: React.FC<AudioEffectsModalProps> = ({
  isOpen,
  onClose,
  eqSettings,
  preamp,
  onPreampChange,
  onBandGainChange,
  onPresetChange,
  onToggleEqualizer,
  stereoPan,
  onStereoPanChange,
  audioDelayMs,
  onAudioDelayChange,
  getAnalyserNode,
  isPlaying,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#1f1f28] border border-[#3b3b4a] rounded-xl shadow-2xl w-full max-w-2xl text-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* VLC Dialog Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#282834] border-b border-[#3b3b4a]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-vlc-orange" />
            <h2 className="text-base font-semibold tracking-wide text-white">Adjustments and Effects - Audio Effects</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#383848] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs / Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Top Controls: Enable, Preset, Reset */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#181820] rounded-lg border border-[#2d2d3a]">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input
                  type="checkbox"
                  checked={eqSettings.enabled}
                  onChange={(e) => onToggleEqualizer(e.target.checked)}
                  className="w-4 h-4 accent-vlc-orange rounded cursor-pointer"
                />
                <span>Enable Equalizer</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Preset:</span>
              <select
                value={eqSettings.presetName}
                onChange={(e) => onPresetChange(e.target.value)}
                disabled={!eqSettings.enabled}
                className="bg-[#262634] text-white text-xs rounded border border-[#3c3c4e] px-2.5 py-1.5 focus:outline-none focus:border-vlc-orange disabled:opacity-50"
              >
                {Object.keys(EQ_PRESETS).map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
                {eqSettings.presetName === 'Custom' && (
                  <option value="Custom">Custom</option>
                )}
              </select>

              <button
                onClick={() => onPresetChange('Flat')}
                className="flex items-center gap-1 text-xs text-gray-300 hover:text-white bg-[#2e2e3e] hover:bg-[#38384c] px-2 py-1.5 rounded transition-colors"
                title="Reset Equalizer to Flat"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Equalizer Sliders Area */}
          <div className={`p-4 bg-[#181820] rounded-lg border border-[#2d2d3a] transition-opacity ${eqSettings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex justify-between">
              <span>Graphic Equalizer (10 Bands)</span>
              <span>+20 dB / -20 dB</span>
            </div>

            <div className="grid grid-cols-11 gap-2 items-end pt-2 pb-1">
              {/* Preamp Slider */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-vlc-orange font-mono mb-1">{preamp > 0 ? `+${preamp.toFixed(1)}` : preamp.toFixed(1)}</span>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.5"
                  value={preamp}
                  onChange={(e) => onPreampChange(parseFloat(e.target.value))}
                  className="vlc-vertical-slider h-36"
                  style={{ writingMode: 'vertical-lr', direction: 'rtl', width: '20px' }}
                />
                <span className="text-[10px] font-bold text-vlc-orange mt-2 tracking-tight">Preamp</span>
              </div>

              {/* 10 Frequency Band Sliders */}
              {EQ_FREQUENCIES.map((freq) => {
                const gain = eqSettings.bands[freq] ?? 0;
                const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
                return (
                  <div key={freq} className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-300 font-mono mb-1">
                      {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}
                    </span>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="0.5"
                      value={gain}
                      onChange={(e) => onBandGainChange(freq, parseFloat(e.target.value))}
                      className="vlc-vertical-slider h-36"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl', width: '20px' }}
                    />
                    <span className="text-[10px] text-gray-400 mt-2 font-mono">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio Synchronization & Spatial Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stereo Panning */}
            <div className="p-3 bg-[#181820] rounded-lg border border-[#2d2d3a]">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-gray-300 font-medium">Stereo Balance / Pan</span>
                <span className="font-mono text-vlc-orange">
                  {stereoPan === 0 ? 'Center' : stereoPan < 0 ? `L ${Math.abs(Math.round(stereoPan * 100))}%` : `R ${Math.round(stereoPan * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={stereoPan}
                onChange={(e) => onStereoPanChange(parseFloat(e.target.value))}
                className="w-full accent-vlc-orange cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>Left</span>
                <span className="cursor-pointer hover:text-white" onClick={() => onStereoPanChange(0)}>Center</span>
                <span>Right</span>
              </div>
            </div>

            {/* Audio Delay Offset */}
            <div className="p-3 bg-[#181820] rounded-lg border border-[#2d2d3a]">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-gray-300 font-medium">Audio Delay Synchronization</span>
                <span className="font-mono text-vlc-orange">{audioDelayMs} ms</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAudioDelayChange(Math.max(-2000, audioDelayMs - 50))}
                  className="px-2 py-1 bg-[#262634] hover:bg-[#343444] rounded text-xs"
                >
                  -50ms (J)
                </button>
                <input
                  type="range"
                  min="-1000"
                  max="2000"
                  step="25"
                  value={audioDelayMs}
                  onChange={(e) => onAudioDelayChange(parseInt(e.target.value, 10))}
                  className="w-full accent-vlc-orange cursor-pointer"
                />
                <button
                  onClick={() => onAudioDelayChange(Math.min(2000, audioDelayMs + 50))}
                  className="px-2 py-1 bg-[#262634] hover:bg-[#343444] rounded text-xs"
                >
                  +50ms (K)
                </button>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>Faster Audio</span>
                <span className="cursor-pointer hover:text-white" onClick={() => onAudioDelayChange(0)}>0 ms (Reset)</span>
                <span>Delayed Audio</span>
              </div>
            </div>
          </div>

          {/* Real-time Visualizer */}
          <AudioVisualizer getAnalyserNode={getAnalyserNode} isPlaying={isPlaying} />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-3 bg-[#242430] border-t border-[#3b3b4a]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-vlc-orange hover:bg-vlc-orange-hover text-white text-sm font-medium rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
