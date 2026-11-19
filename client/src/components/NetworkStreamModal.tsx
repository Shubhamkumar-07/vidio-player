import React, { useState } from 'react';
import { X, Globe, Play, Plus, Radio, Check } from 'lucide-react';

interface NetworkStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStream: (url: string, title?: string, playImmediately?: boolean) => void;
}

const STREAM_PRESETS = [
  {
    name: 'Big Buck Bunny (HLS Multi-Bitrate Adaptive)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    type: 'HLS Live/VOD'
  },
  {
    name: 'View From A Blue Moon (Surf 720p MP4 + Subtitles)',
    url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
    type: 'MP4 Video'
  },
  {
    name: 'Akamai Live Sintel HLS Stream',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    type: 'HLS Adaptive'
  },
  {
    name: 'Tears of Steel (Blender Open Movie Stream)',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    type: 'HLS 1080p'
  }
];

export const NetworkStreamModal: React.FC<NetworkStreamModalProps> = ({
  isOpen,
  onClose,
  onOpenStream
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (playImmediately: boolean) => {
    if (!url.trim()) return;
    onOpenStream(url.trim(), title.trim() || undefined, playImmediately);
    setUrl('');
    setTitle('');
    onClose();
  };

  const handleSelectPreset = (presetUrl: string, presetName: string) => {
    setUrl(presetUrl);
    setTitle(presetName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#1f1f28] border border-[#3b3b4a] rounded-xl shadow-2xl w-full max-w-xl text-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#282834] border-b border-[#3b3b4a]">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-vlc-orange" />
            <h2 className="text-base font-semibold tracking-wide text-white">Open Media - Network Stream (Ctrl+N)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#383848] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Enter Network URL (HTTP, HTTPS, HLS .m3u8, MP4, MP3):
            </label>
            <input
              type="url"
              placeholder="https://example.com/stream/index.m3u8"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#16161e] border border-[#3a3a4c] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-vlc-orange font-mono"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Stream Title (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. My Favorite Live Stream"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#16161e] border border-[#3a3a4c] rounded-lg px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-vlc-orange"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-xs font-semibold text-vlc-orange uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" /> Tested Network Stream Presets
            </span>
            <div className="space-y-2">
              {STREAM_PRESETS.map((preset) => (
                <div
                  key={preset.url}
                  onClick={() => handleSelectPreset(preset.url, preset.name)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between ${url === preset.url ? 'bg-[#2a2618] border-vlc-orange text-white' : 'bg-[#181822] border-[#2e2e3e] hover:bg-[#22222e] text-gray-300'}`}
                >
                  <div className="truncate pr-2">
                    <span className="font-medium text-white block">{preset.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono truncate block">{preset.url}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#2e2e40] text-vlc-orange shrink-0">
                    {preset.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-5 py-3.5 bg-[#242430] border-t border-[#3b3b4a]">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-gray-300 hover:text-white bg-[#2e2e3e] hover:bg-[#38384c] rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={!url.trim()}
            className="px-3.5 py-1.5 text-xs text-white bg-[#333344] hover:bg-[#404055] rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Enqueue
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={!url.trim()}
            className="px-4 py-1.5 text-xs font-medium text-white bg-vlc-orange hover:bg-vlc-orange-hover rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Play Now
          </button>
        </div>
      </div>
    </div>
  );
};
