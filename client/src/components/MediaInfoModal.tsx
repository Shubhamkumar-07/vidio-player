import React, { useEffect, useState } from 'react';
import { X, Info, FileVideo, Music, Disc, Layers } from 'lucide-react';
import { MediaItem } from '../types';
import { formatTime } from '../utils/subtitleParser';

interface MediaInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMedia: MediaItem | null;
  videoElement: HTMLVideoElement | null;
}

export const MediaInfoModal: React.FC<MediaInfoModalProps> = ({
  isOpen,
  onClose,
  currentMedia,
  videoElement
}) => {
  const [serverMeta, setServerMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentMedia) {
      setLoading(true);
      fetch(`/api/media/${currentMedia.id}/metadata`)
        .then(res => res.json())
        .then(data => {
          setServerMeta(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setServerMeta(null);
    }
  }, [isOpen, currentMedia]);

  if (!isOpen) return null;

  const resolution = videoElement && videoElement.videoWidth > 0
    ? `${videoElement.videoWidth} x ${videoElement.videoHeight}`
    : 'N/A';

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#1f1f28] border border-[#3b3b4a] rounded-xl shadow-2xl w-full max-w-lg text-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#282834] border-b border-[#3b3b4a]">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-vlc-orange" />
            <h2 className="text-base font-semibold tracking-wide text-white">Current Media Information (Ctrl+I)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#383848] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {!currentMedia ? (
            <div className="text-center py-8 text-gray-400">No media is currently loaded.</div>
          ) : (
            <div className="space-y-4">
              {/* Media Title & Type banner */}
              <div className="flex items-center gap-3 p-3 bg-[#181822] rounded-lg border border-[#2e2e3e]">
                {currentMedia.type === 'video' || currentMedia.type === 'hls' ? (
                  <FileVideo className="w-8 h-8 text-vlc-orange shrink-0" />
                ) : (
                  <Music className="w-8 h-8 text-vlc-orange shrink-0" />
                )}
                <div className="overflow-hidden">
                  <h3 className="font-bold text-sm text-white truncate">{currentMedia.title}</h3>
                  <p className="text-gray-400 font-mono text-[11px] truncate">
                    {currentMedia.streamUrl || currentMedia.originalName || currentMedia.filename || 'Local Media'}
                  </p>
                </div>
              </div>

              {/* Technical Spec Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-[#181822] rounded border border-[#2d2d3c]">
                  <span className="text-gray-400 block text-[10px] uppercase">Format / Container</span>
                  <span className="font-semibold text-white font-mono">{currentMedia.mimeType}</span>
                </div>
                <div className="p-2.5 bg-[#181822] rounded border border-[#2d2d3c]">
                  <span className="text-gray-400 block text-[10px] uppercase">Stream Type</span>
                  <span className="font-semibold text-white uppercase font-mono">{currentMedia.type}</span>
                </div>
                <div className="p-2.5 bg-[#181822] rounded border border-[#2d2d3c]">
                  <span className="text-gray-400 block text-[10px] uppercase">Resolution</span>
                  <span className="font-semibold text-white font-mono">{resolution}</span>
                </div>
                <div className="p-2.5 bg-[#181822] rounded border border-[#2d2d3c]">
                  <span className="text-gray-400 block text-[10px] uppercase">Duration</span>
                  <span className="font-semibold text-white font-mono">
                    {currentMedia.duration ? formatTime(currentMedia.duration) : (videoElement?.duration ? formatTime(videoElement.duration) : 'Live Stream')}
                  </span>
                </div>
                <div className="p-2.5 bg-[#181822] rounded border border-[#2d2d3c]">
                  <span className="text-gray-400 block text-[10px] uppercase">File Size</span>
                  <span className="font-semibold text-white font-mono">{formatFileSize(currentMedia.size)}</span>
                </div>
                <div className="p-2.5 bg-[#181822] rounded border border-[#2d2d3c]">
                  <span className="text-gray-400 block text-[10px] uppercase">Subtitles Available</span>
                  <span className="font-semibold text-white font-mono">{currentMedia.subtitles?.length || 0} track(s)</span>
                </div>
              </div>

              {/* Server Audio / Probe Tags */}
              {serverMeta?.audio && (
                <div className="p-3 bg-[#181822] rounded-lg border border-[#2d2d3e] space-y-1.5">
                  <span className="font-semibold text-vlc-orange block text-[11px] uppercase tracking-wide">
                    Audio Codec & Stream Metadata
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                    <div>Codec: <span className="text-white font-mono">{serverMeta.audio.codec || 'AAC/MP3/PCM'}</span></div>
                    <div>Channels: <span className="text-white font-mono">{serverMeta.audio.numberOfChannels || 2} (Stereo)</span></div>
                    <div>Sample Rate: <span className="text-white font-mono">{serverMeta.audio.sampleRate ? `${serverMeta.audio.sampleRate} Hz` : '44.1 kHz'}</span></div>
                    <div>Bitrate: <span className="text-white font-mono">{serverMeta.audio.bitrate ? `${Math.round(serverMeta.audio.bitrate / 1000)} kbps` : 'Variable'}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
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
