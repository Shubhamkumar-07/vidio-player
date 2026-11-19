import React from 'react';
import { X, RotateCcw, Video, Compass, Sliders, RefreshCw, FlipHorizontal, FlipVertical, Sparkles } from 'lucide-react';
import { VideoAdjustments, VideoQualityMode } from '../types';

interface VideoEffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjustments: VideoAdjustments;
  onChange: (updated: Partial<VideoAdjustments>) => void;
  onReset: () => void;
}

export const VideoEffectsModal: React.FC<VideoEffectsModalProps> = ({
  isOpen,
  onClose,
  adjustments,
  onChange,
  onReset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#1f1f28] border border-[#3b3b4a] rounded-xl shadow-2xl w-full max-w-2xl text-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#282834] border-b border-[#3b3b4a]">
          <div className="flex items-center gap-2.5">
            <Video className="w-5 h-5 text-vlc-orange" />
            <h2 className="text-base font-semibold tracking-wide text-white">Adjustments and Effects - Video Effects</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#383848] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Section 0: Video Viewing Quality Enhancer */}
          <div className="p-4 bg-[#181820] rounded-lg border border-[#2d2d3a] space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-[#2a2a38]">
              <span className="text-xs font-semibold text-vlc-orange uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-vlc-orange" /> Video Quality Enhancer & Clarity
              </span>
              <span className="text-[11px] text-gray-400 font-mono">
                Mode: <span className="text-white font-bold uppercase">{adjustments.qualityMode.replace('_', ' ')}</span>
              </span>
            </div>

            {/* Quality Presets */}
            <div>
              <span className="text-xs text-gray-300 block mb-2">Enhancement Mode</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { id: 'crisp_hd', label: 'Crisp HD', desc: 'Edge Sharpening' },
                  { id: 'vivid_cinema', label: 'Vivid Cinema', desc: 'Vibrant Colors' },
                  { id: 'hdr_sim', label: 'HDR Sim', desc: 'Dynamic Range' },
                  { id: 'anime_clear', label: 'Anime Clear', desc: 'Contour Boost' },
                  { id: 'standard', label: 'Standard', desc: 'Natural Source' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => onChange({ qualityMode: mode.id as VideoQualityMode })}
                    className={`p-2 rounded-lg text-left transition-all flex flex-col justify-between border ${
                      adjustments.qualityMode === mode.id
                        ? 'bg-[#2a261a] border-vlc-orange text-white shadow-md'
                        : 'bg-[#22222e] border-[#323244] text-gray-400 hover:text-white hover:bg-[#282838]'
                    }`}
                  >
                    <span className={`font-bold text-[11px] block ${adjustments.qualityMode === mode.id ? 'text-vlc-orange' : 'text-gray-200'}`}>
                      {mode.label}
                    </span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sharpness Fine-Tuning */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Edge Sharpening Strength</span>
                <span className="font-mono text-vlc-orange">{adjustments.sharpness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.sharpness}
                onChange={(e) => onChange({ sharpness: parseInt(e.target.value) })}
                className="w-full accent-vlc-orange"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                <span>0% (Soft)</span>
                <span className="cursor-pointer hover:text-white" onClick={() => onChange({ sharpness: 35 })}>35% (Optimal HD)</span>
                <span>100% (Ultra Sharp)</span>
              </div>
            </div>
          </div>

          {/* Section 1: Color Adjustments */}
          <div className="p-4 bg-[#181820] rounded-lg border border-[#2d2d3a] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#2a2a38]">
              <span className="text-xs font-semibold text-vlc-orange uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> Color Adjustments
              </span>
              <button
                onClick={onReset}
                className="flex items-center gap-1 text-xs text-gray-300 hover:text-white bg-[#262634] hover:bg-[#323242] px-2.5 py-1 rounded transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brightness */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Brightness</span>
                  <span className="font-mono text-vlc-orange">{adjustments.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.brightness}
                  onChange={(e) => onChange({ brightness: parseInt(e.target.value) })}
                  className="w-full accent-vlc-orange"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Contrast</span>
                  <span className="font-mono text-vlc-orange">{adjustments.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.contrast}
                  onChange={(e) => onChange({ contrast: parseInt(e.target.value) })}
                  className="w-full accent-vlc-orange"
                />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Saturation</span>
                  <span className="font-mono text-vlc-orange">{adjustments.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={adjustments.saturation}
                  onChange={(e) => onChange({ saturation: parseInt(e.target.value) })}
                  className="w-full accent-vlc-orange"
                />
              </div>

              {/* Hue */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Hue Rotate</span>
                  <span className="font-mono text-vlc-orange">{adjustments.hue}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={adjustments.hue}
                  onChange={(e) => onChange({ hue: parseInt(e.target.value) })}
                  className="w-full accent-vlc-orange"
                />
              </div>

              {/* Gamma */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Gamma Correction</span>
                  <span className="font-mono text-vlc-orange">{adjustments.gamma.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={adjustments.gamma}
                  onChange={(e) => onChange({ gamma: parseFloat(e.target.value) })}
                  className="w-full accent-vlc-orange"
                />
              </div>

              {/* Blur */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Blur Filter</span>
                  <span className="font-mono text-vlc-orange">{adjustments.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={adjustments.blur}
                  onChange={(e) => onChange({ blur: parseInt(e.target.value) })}
                  className="w-full accent-vlc-orange"
                />
              </div>
            </div>

            {/* Quick Effects Toggles */}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-[#2a2a38] text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adjustments.invert}
                  onChange={(e) => onChange({ invert: e.target.checked })}
                  className="accent-vlc-orange"
                />
                <span>Invert Colors</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adjustments.sepia}
                  onChange={(e) => onChange({ sepia: e.target.checked })}
                  className="accent-vlc-orange"
                />
                <span>Sepia Nostalgia</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adjustments.grayscale}
                  onChange={(e) => onChange({ grayscale: e.target.checked })}
                  className="accent-vlc-orange"
                />
                <span>Grayscale (B&W)</span>
              </label>
            </div>
          </div>

          {/* Section 2: Geometry & Transform */}
          <div className="p-4 bg-[#181820] rounded-lg border border-[#2d2d3a] space-y-4">
            <span className="text-xs font-semibold text-vlc-orange uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#2a2a38]">
              <Compass className="w-4 h-4" /> Geometry & Transform
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rotation */}
              <div>
                <span className="text-xs text-gray-300 block mb-2">Rotate Angle</span>
                <div className="grid grid-cols-4 gap-2">
                  {([0, 90, 180, 270] as const).map((angle) => (
                    <button
                      key={angle}
                      onClick={() => onChange({ rotation: angle })}
                      className={`py-1.5 rounded text-xs font-mono transition-colors flex items-center justify-center gap-1 ${adjustments.rotation === angle ? 'bg-vlc-orange text-white font-semibold' : 'bg-[#262634] text-gray-300 hover:bg-[#323242]'}`}
                    >
                      <RefreshCw className="w-3 h-3" /> {angle}°
                    </button>
                  ))}
                </div>
              </div>

              {/* Flips */}
              <div>
                <span className="text-xs text-gray-300 block mb-2">Mirror / Flip</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onChange({ flipH: !adjustments.flipH })}
                    className={`py-1.5 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1.5 ${adjustments.flipH ? 'bg-vlc-orange text-white' : 'bg-[#262634] text-gray-300 hover:bg-[#323242]'}`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" /> Flip Horizontal
                  </button>
                  <button
                    onClick={() => onChange({ flipV: !adjustments.flipV })}
                    className={`py-1.5 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1.5 ${adjustments.flipV ? 'bg-vlc-orange text-white' : 'bg-[#262634] text-gray-300 hover:bg-[#323242]'}`}
                  >
                    <FlipVertical className="w-3.5 h-3.5" /> Flip Vertical
                  </button>
                </div>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="pt-2 border-t border-[#2a2a38]">
              <span className="text-xs text-gray-300 block mb-2">Aspect Ratio Override</span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-xs">
                {(['default', '16:9', '4:3', '1:1', '16:10', '21:9', 'fill', 'stretch'] as const).map((ar) => (
                  <button
                    key={ar}
                    onClick={() => onChange({ aspectRatio: ar })}
                    className={`py-1.5 rounded font-mono capitalize transition-colors ${adjustments.aspectRatio === ar ? 'bg-vlc-orange text-white font-bold' : 'bg-[#262634] text-gray-300 hover:bg-[#323242]'}`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>
          </div>
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
