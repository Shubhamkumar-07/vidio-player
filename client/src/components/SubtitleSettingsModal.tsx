import React, { useRef } from 'react';
import { X, MessageSquare, Upload, Sliders, Type } from 'lucide-react';
import { SubtitleSettings, SubtitleTrack } from '../types';

interface SubtitleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: SubtitleTrack[];
  settings: SubtitleSettings;
  onSettingsChange: (updated: Partial<SubtitleSettings>) => void;
  onUploadSubtitle: (file: File) => void;
}

export const SubtitleSettingsModal: React.FC<SubtitleSettingsModalProps> = ({
  isOpen,
  onClose,
  tracks,
  settings,
  onSettingsChange,
  onUploadSubtitle
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadSubtitle(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#1f1f28] border border-[#3b3b4a] rounded-xl shadow-2xl w-full max-w-lg text-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#282834] border-b border-[#3b3b4a]">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-vlc-orange" />
            <h2 className="text-base font-semibold tracking-wide text-white">Subtitle Track & Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#383848] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs">
          {/* Subtitle Track Selector */}
          <div className="p-3.5 bg-[#181822] rounded-lg border border-[#2d2d3e] space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">Subtitle Track:</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-vlc-orange/20 text-vlc-orange hover:bg-vlc-orange hover:text-white rounded transition-colors text-xs"
              >
                <Upload className="w-3.5 h-3.5" /> Add Subtitle (.srt / .vtt)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".srt,.vtt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <select
              value={settings.selectedTrackId || 'disabled'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'disabled') {
                  onSettingsChange({ enabled: false, selectedTrackId: null });
                } else {
                  onSettingsChange({ enabled: true, selectedTrackId: val });
                }
              }}
              className="w-full bg-[#242432] text-white border border-[#3c3c50] rounded px-3 py-2 focus:outline-none focus:border-vlc-orange"
            >
              <option value="disabled">Disable Subtitles (Off)</option>
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.label} ({track.language})
                </option>
              ))}
            </select>
          </div>

          {/* Subtitle Synchronization Delay */}
          <div className="p-3.5 bg-[#181822] rounded-lg border border-[#2d2d3e] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-vlc-orange" /> Subtitle Delay Synchronization
              </span>
              <span className="font-mono text-vlc-orange font-bold">{settings.delay} ms</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSettingsChange({ delay: settings.delay - 50 })}
                className="px-2.5 py-1 bg-[#262634] hover:bg-[#343444] rounded text-xs font-mono"
              >
                -50ms (G)
              </button>
              <input
                type="range"
                min="-3000"
                max="3000"
                step="50"
                value={settings.delay}
                onChange={(e) => onSettingsChange({ delay: parseInt(e.target.value, 10) })}
                className="w-full accent-vlc-orange cursor-pointer"
              />
              <button
                onClick={() => onSettingsChange({ delay: settings.delay + 50 })}
                className="px-2.5 py-1 bg-[#262634] hover:bg-[#343444] rounded text-xs font-mono"
              >
                +50ms (H)
              </button>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>Appears earlier</span>
              <span className="cursor-pointer hover:text-white" onClick={() => onSettingsChange({ delay: 0 })}>Reset 0ms</span>
              <span>Appears later</span>
            </div>
          </div>

          {/* Subtitle Appearance Settings */}
          <div className="p-3.5 bg-[#181822] rounded-lg border border-[#2d2d3e] space-y-3">
            <span className="font-semibold text-white block flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-vlc-orange" /> Typography & Appearance
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* Size */}
              <div>
                <span className="text-gray-400 block mb-1">Font Size</span>
                <select
                  value={settings.fontSize}
                  onChange={(e) => onSettingsChange({ fontSize: e.target.value as any })}
                  className="w-full bg-[#242432] text-white border border-[#3c3c50] rounded px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="small">Small (16px)</option>
                  <option value="medium">Normal (22px)</option>
                  <option value="large">Large (30px)</option>
                  <option value="huge">Extra Large (38px)</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <span className="text-gray-400 block mb-1">Font Color</span>
                <select
                  value={settings.textColor}
                  onChange={(e) => onSettingsChange({ textColor: e.target.value })}
                  className="w-full bg-[#242432] text-white border border-[#3c3c50] rounded px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="#FFFFFF">White</option>
                  <option value="#FFFF00">Yellow</option>
                  <option value="#00FFFF">Cyan</option>
                  <option value="#00FF66">Light Green</option>
                </select>
              </div>

              {/* Background Opacity */}
              <div>
                <span className="text-gray-400 block mb-1">Box Background</span>
                <select
                  value={settings.bgOpacity}
                  onChange={(e) => onSettingsChange({ bgOpacity: parseFloat(e.target.value) })}
                  className="w-full bg-[#242432] text-white border border-[#3c3c50] rounded px-2.5 py-1.5 focus:outline-none"
                >
                  <option value={0}>None (Text Only)</option>
                  <option value={0.4}>Subtle (40%)</option>
                  <option value={0.75}>Standard (75%)</option>
                  <option value={1.0}>Solid Black (100%)</option>
                </select>
              </div>

              {/* Position */}
              <div>
                <span className="text-gray-400 block mb-1">Position</span>
                <select
                  value={settings.position}
                  onChange={(e) => onSettingsChange({ position: e.target.value as any })}
                  className="w-full bg-[#242432] text-white border border-[#3c3c50] rounded px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="bottom">Bottom of Video</option>
                  <option value="top">Top of Video</option>
                </select>
              </div>
            </div>

            {/* Subtitle Preview */}
            <div className="mt-3 p-3 bg-black/60 rounded flex items-center justify-center min-h-[50px] border border-dashed border-[#3a3a4c]">
              <span
                style={{
                  color: settings.textColor,
                  fontSize: settings.fontSize === 'small' ? '14px' : settings.fontSize === 'medium' ? '18px' : settings.fontSize === 'large' ? '24px' : '30px',
                  backgroundColor: `rgba(0,0,0,${settings.bgOpacity})`,
                  textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 2px black',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}
              >
                Sample Subtitle Preview (Vidio Player Engine)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 bg-[#242430] border-t border-[#3b3b4a]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-vlc-orange hover:bg-vlc-orange-hover text-white text-xs font-medium rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
