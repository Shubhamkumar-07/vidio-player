import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    category: 'Playback & Navigation',
    shortcuts: [
      { key: 'Space', desc: 'Play / Pause toggle' },
      { key: 'S', desc: 'Stop playback & return to start' },
      { key: 'N', desc: 'Next track in playlist' },
      { key: 'P', desc: 'Previous track in playlist' },
      { key: 'Left / Right', desc: 'Short jump (5 seconds)' },
      { key: 'Shift + Left/Right', desc: 'Very short jump (3 seconds)' },
      { key: 'Ctrl + Left/Right', desc: 'Medium jump (10 seconds)' },
      { key: 'Alt + Left/Right', desc: 'Long jump (60 seconds)' },
      { key: 'E', desc: 'Next frame (Frame by Frame)' },
      { key: 'T', desc: 'Toggle remaining / elapsed time' }
    ]
  },
  {
    category: 'Speed & Volume',
    shortcuts: [
      { key: 'Up / Down', desc: 'Increase / Decrease volume (boost to 200%)' },
      { key: 'M', desc: 'Mute / Unmute sound' },
      { key: '[', desc: 'Decrease playback speed (-0.1x)' },
      { key: ']', desc: 'Increase playback speed (+0.1x)' },
      { key: '=', desc: 'Reset speed to 1.0x normal' },
      { key: 'J / K', desc: 'Audio delay synchronization (-/+ 50ms)' }
    ]
  },
  {
    category: 'Video & Subtitles',
    shortcuts: [
      { key: 'F', desc: 'Toggle Fullscreen' },
      { key: 'A', desc: 'Cycle aspect ratio (16:9, 4:3, 1:1, etc.)' },
      { key: 'V', desc: 'Toggle subtitles on / off' },
      { key: 'G / H', desc: 'Subtitle delay offset (-/+ 50ms)' },
      { key: 'B', desc: 'Cycle Audio Visualizer' },
      { key: 'R', desc: 'Cycle repeat mode (Off / All / One)' }
    ]
  },
  {
    category: 'Dialogs & Tools',
    shortcuts: [
      { key: 'Ctrl + O', desc: 'Open file(s)' },
      { key: 'Ctrl + N', desc: 'Open Network Stream' },
      { key: 'Ctrl + E', desc: 'Open Audio Equalizer & Effects' },
      { key: 'Ctrl + V', desc: 'Open Video Adjustments & Effects' },
      { key: 'Ctrl + L', desc: 'Toggle Playlist manager panel' },
      { key: 'Ctrl + I', desc: 'Show Media Information' }
    ]
  }
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#1f1f28] border border-[#3b3b4a] rounded-xl shadow-2xl w-full max-w-2xl text-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#282834] border-b border-[#3b3b4a]">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-vlc-orange" />
            <h2 className="text-base font-semibold tracking-wide text-white">Vidio Player Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#383848] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.category} className="p-3 bg-[#181822] rounded-lg border border-[#2d2d3e]">
                <h3 className="text-xs font-bold text-vlc-orange uppercase tracking-wider mb-2.5 pb-1 border-b border-[#282838]">
                  {group.category}
                </h3>
                <div className="space-y-1.5">
                  {group.shortcuts.map((sc) => (
                    <div key={sc.key} className="flex items-center justify-between text-xs py-1">
                      <span className="text-gray-300">{sc.desc}</span>
                      <kbd className="px-2 py-0.5 bg-[#252533] border border-[#3c3c50] rounded text-white font-mono text-[11px] shadow-xs">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 bg-[#242430] border-t border-[#3b3b4a]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-vlc-orange hover:bg-vlc-orange-hover text-white text-xs font-medium rounded-md transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
