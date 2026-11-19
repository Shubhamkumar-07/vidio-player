import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, SkipForward, SkipBack, FastForward, Rewind,
  Volume2, VolumeX, Video, Music, Sliders, Globe, ListMusic, 
  HelpCircle, Info, Camera, Maximize, Keyboard, Eye, ChevronRight
} from 'lucide-react';

interface MenuBarProps {
  onOpenFile: () => void;
  onOpenNetworkStream: () => void;
  onOpenAudioEffects: () => void;
  onOpenVideoEffects: () => void;
  onOpenShortcuts: () => void;
  onOpenMediaInfo: () => void;
  onOpenSubtitles: () => void;
  onTogglePlaylist: () => void;
  onToggleVisualizer: () => void;
  onTakeSnapshot: () => void;
  onToggleFullscreen: () => void;
  onTogglePiP: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  playbackRate: number;
  onSetRate: (rate: number) => void;
  onJump: (seconds: number) => void;
  aspectRatio: string;
  onSetAspectRatio: (ar: any) => void;
  uploadProgress?: number | null;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onOpenFile,
  onOpenNetworkStream,
  onOpenAudioEffects,
  onOpenVideoEffects,
  onOpenShortcuts,
  onOpenMediaInfo,
  onOpenSubtitles,
  onTogglePlaylist,
  onToggleVisualizer,
  onTakeSnapshot,
  onToggleFullscreen,
  onTogglePiP,
  isPlaying,
  onTogglePlay,
  onStop,
  onNext,
  onPrev,
  playbackRate,
  onSetRate,
  onJump,
  aspectRatio,
  onSetAspectRatio,
  uploadProgress,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (menuName: string) => {
    setActiveMenu(prev => prev === menuName ? null : menuName);
  };

  const closeMenu = () => setActiveMenu(null);

  return (
    <div ref={menuRef} className="bg-[#1e1e28] border-b border-[#2e2e3e] select-none text-xs text-gray-300 relative z-30">
      <div className="flex items-center px-2 py-1">
        {/* Vidio Player Logo */}
        <div className="flex items-center gap-2 px-2 mr-1">
          <img src="/logo.svg" alt="Vidio Player Logo" className="w-5 h-5 rounded" />
          <span className="font-bold text-white text-xs tracking-tight">Vidio Player</span>
        </div>

        {/* Media Menu */}
        <div className="relative">
          <button
            onClick={() => toggle('media')}
            className={`px-2.5 py-1 rounded hover:bg-[#2c2c3c] hover:text-white transition-colors ${activeMenu === 'media' ? 'bg-[#2c2c3c] text-white' : ''}`}
          >
            Media
          </button>
          {activeMenu === 'media' && (
            <div className="absolute left-0 mt-1 w-56 bg-[#222230] border border-[#3c3c50] rounded-md shadow-xl py-1 text-xs">
              <button
                onClick={() => { onOpenFile(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Open File...</span>
                <span className="text-gray-400 text-[10px]">Ctrl+O</span>
              </button>
              <button
                onClick={() => { onOpenNetworkStream(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Open Network Stream...</span>
                <span className="text-gray-400 text-[10px]">Ctrl+N</span>
              </button>
              <div className="my-1 border-t border-[#343446]" />
              <button
                onClick={() => { onTogglePlaylist(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Save / Export Playlist...</span>
                <span className="text-gray-400 text-[10px]">Ctrl+L</span>
              </button>
            </div>
          )}
        </div>

        {/* Playback Menu */}
        <div className="relative">
          <button
            onClick={() => toggle('playback')}
            className={`px-2.5 py-1 rounded hover:bg-[#2c2c3c] hover:text-white transition-colors ${activeMenu === 'playback' ? 'bg-[#2c2c3c] text-white' : ''}`}
          >
            Playback
          </button>
          {activeMenu === 'playback' && (
            <div className="absolute left-0 mt-1 w-56 bg-[#222230] border border-[#3c3c50] rounded-md shadow-xl py-1 text-xs">
              <button
                onClick={() => { onTogglePlay(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
                <span className="text-gray-400 text-[10px]">Space</span>
              </button>
              <button
                onClick={() => { onStop(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Stop</span>
                <span className="text-gray-400 text-[10px]">S</span>
              </button>
              <button
                onClick={() => { onPrev(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Previous Track</span>
                <span className="text-gray-400 text-[10px]">P</span>
              </button>
              <button
                onClick={() => { onNext(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Next Track</span>
                <span className="text-gray-400 text-[10px]">N</span>
              </button>
              <div className="my-1 border-t border-[#343446]" />
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400">Speed Control</div>
              <button
                onClick={() => { onSetRate(Math.min(4.0, playbackRate + 0.25)); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Faster (+0.25x)</span>
                <span className="text-gray-400 text-[10px]">]</span>
              </button>
              <button
                onClick={() => { onSetRate(Math.max(0.25, playbackRate - 0.25)); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Slower (-0.25x)</span>
                <span className="text-gray-400 text-[10px]">[</span>
              </button>
              <button
                onClick={() => { onSetRate(1.0); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Normal Speed (1.0x)</span>
                <span className="text-gray-400 text-[10px]">=</span>
              </button>
              <div className="my-1 border-t border-[#343446]" />
              <button
                onClick={() => { onJump(10); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Jump Forward 10s</span>
                <span className="text-gray-400 text-[10px]">Ctrl+Right</span>
              </button>
              <button
                onClick={() => { onJump(-10); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Jump Backward 10s</span>
                <span className="text-gray-400 text-[10px]">Ctrl+Left</span>
              </button>
            </div>
          )}
        </div>

        {/* Audio Menu */}
        <div className="relative">
          <button
            onClick={() => toggle('audio')}
            className={`px-2.5 py-1 rounded hover:bg-[#2c2c3c] hover:text-white transition-colors ${activeMenu === 'audio' ? 'bg-[#2c2c3c] text-white' : ''}`}
          >
            Audio
          </button>
          {activeMenu === 'audio' && (
            <div className="absolute left-0 mt-1 w-56 bg-[#222230] border border-[#3c3c50] rounded-md shadow-xl py-1 text-xs">
              <button
                onClick={() => { onOpenAudioEffects(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center font-semibold"
              >
                <span>Audio Effects (Equalizer)</span>
                <span className="text-gray-400 text-[10px]">Ctrl+E</span>
              </button>
              <button
                onClick={() => { onToggleVisualizer(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Toggle Audio Visualizer</span>
                <span className="text-gray-400 text-[10px]">B</span>
              </button>
              <div className="my-1 border-t border-[#343446]" />
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400">Audio Sync Delay</div>
              <button
                onClick={() => { onJump(0); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Audio Delay -50ms</span>
                <span className="text-gray-400 text-[10px]">J</span>
              </button>
              <button
                onClick={() => { onJump(0); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Audio Delay +50ms</span>
                <span className="text-gray-400 text-[10px]">K</span>
              </button>
            </div>
          )}
        </div>

        {/* Video Menu */}
        <div className="relative">
          <button
            onClick={() => toggle('video')}
            className={`px-2.5 py-1 rounded hover:bg-[#2c2c3c] hover:text-white transition-colors ${activeMenu === 'video' ? 'bg-[#2c2c3c] text-white' : ''}`}
          >
            Video
          </button>
          {activeMenu === 'video' && (
            <div className="absolute left-0 mt-1 w-56 bg-[#222230] border border-[#3c3c50] rounded-md shadow-xl py-1 text-xs">
              <button
                onClick={() => { onOpenVideoEffects(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center font-semibold"
              >
                <span>Video Effects & Filters</span>
                <span className="text-gray-400 text-[10px]">Ctrl+V</span>
              </button>
              <button
                onClick={() => { onTakeSnapshot(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Take Snapshot (Screenshot)</span>
                <span className="text-gray-400 text-[10px]">Snap</span>
              </button>
              <button
                onClick={() => { onTogglePiP(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Picture-in-Picture</span>
                <span className="text-gray-400 text-[10px]">PiP</span>
              </button>
              <button
                onClick={() => { onToggleFullscreen(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Fullscreen</span>
                <span className="text-gray-400 text-[10px]">F</span>
              </button>
              <div className="my-1 border-t border-[#343446]" />
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400">Aspect Ratio</div>
              {(['default', '16:9', '4:3', '1:1', '21:9', 'fill', 'stretch'] as const).map(ar => (
                <button
                  key={ar}
                  onClick={() => { onSetAspectRatio(ar); closeMenu(); }}
                  className={`w-full text-left px-3 py-1 hover:bg-vlc-orange hover:text-white flex justify-between items-center ${aspectRatio === ar ? 'text-vlc-orange font-bold' : ''}`}
                >
                  <span className="capitalize">{ar}</span>
                  {aspectRatio === ar && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subtitle Menu */}
        <div className="relative">
          <button
            onClick={() => toggle('subtitle')}
            className={`px-2.5 py-1 rounded hover:bg-[#2c2c3c] hover:text-white transition-colors ${activeMenu === 'subtitle' ? 'bg-[#2c2c3c] text-white' : ''}`}
          >
            Subtitle
          </button>
          {activeMenu === 'subtitle' && (
            <div className="absolute left-0 mt-1 w-56 bg-[#222230] border border-[#3c3c50] rounded-md shadow-xl py-1 text-xs">
              <button
                onClick={() => { onOpenSubtitles(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center font-semibold"
              >
                <span>Subtitle Tracks & Settings</span>
                <span className="text-gray-400 text-[10px]">V</span>
              </button>
              <div className="my-1 border-t border-[#343446]" />
              <button
                onClick={() => { onOpenSubtitles(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Add Subtitle File...</span>
              </button>
              <button
                onClick={() => { onOpenSubtitles(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Subtitle Delay Sync (-/+50ms)</span>
                <span className="text-gray-400 text-[10px]">G / H</span>
              </button>
            </div>
          )}
        </div>

        {/* Tools Menu */}
        <div className="relative">
          <button
            onClick={() => toggle('tools')}
            className={`px-2.5 py-1 rounded hover:bg-[#2c2c3c] hover:text-white transition-colors ${activeMenu === 'tools' ? 'bg-[#2c2c3c] text-white' : ''}`}
          >
            Tools
          </button>
          {activeMenu === 'tools' && (
            <div className="absolute left-0 mt-1 w-56 bg-[#222230] border border-[#3c3c50] rounded-md shadow-xl py-1 text-xs">
              <button
                onClick={() => { onOpenAudioEffects(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Effects and Filters</span>
                <span className="text-gray-400 text-[10px]">Ctrl+E</span>
              </button>
              <button
                onClick={() => { onOpenMediaInfo(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Current Media Information</span>
                <span className="text-gray-400 text-[10px]">Ctrl+I</span>
              </button>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            onClick={() => toggle('view')}
            className={`px-2.5 py-1 rounded hover:bg-[#2c2c3c] hover:text-white transition-colors ${activeMenu === 'view' ? 'bg-[#2c2c3c] text-white' : ''}`}
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div className="absolute left-0 mt-1 w-56 bg-[#222230] border border-[#3c3c50] rounded-md shadow-xl py-1 text-xs">
              <button
                onClick={() => { onTogglePlaylist(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Playlist Panel</span>
                <span className="text-gray-400 text-[10px]">Ctrl+L</span>
              </button>
              <button
                onClick={() => { onToggleVisualizer(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>Audio Visualizer Panel</span>
                <span className="text-gray-400 text-[10px]">B</span>
              </button>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div className="relative">
          <button
            onClick={() => toggle('help')}
            className={`px-2.5 py-1 rounded hover:bg-[#2c2c3c] hover:text-white transition-colors ${activeMenu === 'help' ? 'bg-[#2c2c3c] text-white' : ''}`}
          >
            Help
          </button>
          {activeMenu === 'help' && (
            <div className="absolute left-0 mt-1 w-56 bg-[#222230] border border-[#3c3c50] rounded-md shadow-xl py-1 text-xs">
              <button
                onClick={() => { onOpenShortcuts(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center font-semibold"
              >
                <span>Keyboard Shortcuts Cheatsheet</span>
                <span className="text-gray-400 text-[10px]">? / F1</span>
              </button>
              <button
                onClick={() => { onOpenMediaInfo(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-vlc-orange hover:text-white flex justify-between items-center"
              >
                <span>About Vidio Player</span>
              </button>
            </div>
          )}
        </div>

        {/* Upload / Save Progress Indicator */}
        {uploadProgress !== null && uploadProgress !== undefined && (
          <div className="ml-auto flex items-center gap-2 px-2.5 py-0.5 bg-[#161622] border border-vlc-orange/50 rounded-full text-[10px] text-gray-300 animate-fadeIn mr-2 shadow-xs">
            <div className="w-16 bg-[#2a2a3c] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-vlc-orange h-full transition-all duration-150 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="font-mono text-vlc-orange font-bold">{uploadProgress}%</span>
            <span className="text-gray-400">Saving to library...</span>
          </div>
        )}
      </div>
    </div>
  );
};
