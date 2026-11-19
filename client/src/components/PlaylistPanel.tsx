import React, { useState, useRef } from 'react';
import { 
  X, ListMusic, Plus, Trash2, Download, Upload, Search, 
  Play, Music, FileVideo, Globe, Shuffle, Repeat, ArrowUp, ArrowDown
} from 'lucide-react';
import { MediaItem, RepeatMode } from '../types';
import { formatTime } from '../utils/subtitleParser';

interface PlaylistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: MediaItem[];
  currentIndex: number;
  onSelectTrack: (index: number) => void;
  onRemoveTrack: (id: string) => void;
  onClearPlaylist: () => void;
  onMoveTrack: (from: number, to: number) => void;
  onAddFiles: (files: FileList) => void;
  onOpenNetworkStreamModal: () => void;
  repeatMode: RepeatMode;
  onToggleRepeat: () => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
}

export const PlaylistPanel: React.FC<PlaylistPanelProps> = ({
  isOpen,
  onClose,
  playlist,
  currentIndex,
  onSelectTrack,
  onRemoveTrack,
  onClearPlaylist,
  onMoveTrack,
  onAddFiles,
  onOpenNetworkStreamModal,
  repeatMode,
  onToggleRepeat,
  isShuffle,
  onToggleShuffle,
}) => {
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const filtered = playlist.map((item, originalIndex) => ({ item, originalIndex })).filter(({ item }) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    (item.artist && item.artist.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExportM3U = () => {
    let m3u = '#EXTM3U\n';
    playlist.forEach(item => {
      const dur = Math.round(item.duration || 0);
      m3u += `#EXTINF:${dur},${item.title}\n`;
      m3u += `${item.streamUrl || `/api/media/${item.id}/stream`}\n`;
    });

    const blob = new Blob([m3u], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VidioPlayer_Playlist_${Date.now()}.m3u`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-[#1b1b24] border-l border-[#303040] shadow-2xl flex flex-col text-gray-200 animate-slideLeft">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#242432] border-b border-[#303040]">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-vlc-orange" />
          <h2 className="text-sm font-semibold tracking-wide text-white">
            Playlist ({playlist.length})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#343446] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar: Search, Add, Clear, Export */}
      <div className="p-3 border-b border-[#282836] space-y-2.5 bg-[#171720]">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search playlist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#20202c] border border-[#333346] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-vlc-orange"
          />
        </div>

        <div className="flex items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-[#262636] hover:bg-[#333348] text-gray-300 hover:text-white rounded transition-colors flex items-center gap-1"
              title="Add Media Files"
            >
              <Plus className="w-3.5 h-3.5 text-vlc-orange" /> Add Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*,audio/*,.m3u8,.m3u"
              className="hidden"
              onChange={(e) => e.target.files && onAddFiles(e.target.files)}
            />

            <button
              onClick={onOpenNetworkStreamModal}
              className="p-1.5 bg-[#262636] hover:bg-[#333348] text-gray-300 hover:text-white rounded transition-colors flex items-center gap-1"
              title="Add Network Stream"
            >
              <Globe className="w-3.5 h-3.5 text-vlc-orange" /> Stream
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleShuffle}
              className={`p-1.5 rounded transition-colors ${isShuffle ? 'bg-vlc-orange text-white' : 'bg-[#262636] text-gray-400 hover:text-white'}`}
              title="Toggle Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onToggleRepeat}
              className={`p-1.5 rounded transition-colors flex items-center gap-0.5 ${repeatMode !== 'off' ? 'bg-vlc-orange text-white' : 'bg-[#262636] text-gray-400 hover:text-white'}`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-3.5 h-3.5" />
              {repeatMode === 'one' && <span className="text-[9px] font-bold">1</span>}
            </button>

            <button
              onClick={handleExportM3U}
              className="p-1.5 bg-[#262636] hover:bg-[#333348] text-gray-300 hover:text-white rounded transition-colors"
              title="Export as M3U Playlist"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClearPlaylist}
              disabled={playlist.length === 0}
              className="p-1.5 bg-[#262636] hover:bg-red-900/60 text-gray-400 hover:text-red-300 rounded transition-colors disabled:opacity-40"
              title="Clear Playlist"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {playlist.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <ListMusic className="w-12 h-12 text-[#353545] mb-2" />
            <p className="text-xs">Playlist is empty</p>
            <p className="text-[11px] text-gray-600 mt-1">Drop files here or add network stream</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500">No matching tracks found</div>
        ) : (
          filtered.map(({ item, originalIndex }) => {
            const isCurrent = originalIndex === currentIndex;
            return (
              <div
                key={item.id}
                className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${isCurrent ? 'bg-[#2c2618] border border-vlc-orange text-white' : 'bg-[#20202c] hover:bg-[#282838] border border-transparent text-gray-300'}`}
                onClick={() => onSelectTrack(originalIndex)}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="w-5 text-center text-[11px] text-gray-500 shrink-0 font-mono">
                    {isCurrent ? <Play className="w-3.5 h-3.5 text-vlc-orange fill-current mx-auto animate-pulse" /> : originalIndex + 1}
                  </span>

                  {item.type === 'video' || item.type === 'hls' ? (
                    <FileVideo className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-vlc-orange' : 'text-blue-400'}`} />
                  ) : (
                    <Music className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-vlc-orange' : 'text-green-400'}`} />
                  )}

                  <div className="min-w-0">
                    <span className={`block truncate font-medium ${isCurrent ? 'text-vlc-orange' : 'text-gray-200'}`}>
                      {item.title}
                    </span>
                    <span className="block text-[10px] text-gray-500 truncate">
                      {item.artist || (item.isStream ? 'Network Stream' : item.originalName || 'Local File')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-gray-500 font-mono">
                    {item.duration ? formatTime(item.duration) : (item.isStream ? 'LIVE' : '')}
                  </span>

                  {/* Move Up / Down Buttons */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (originalIndex > 0) onMoveTrack(originalIndex, originalIndex - 1);
                    }}
                    disabled={originalIndex === 0}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#343448] text-gray-400 hover:text-white transition-opacity disabled:opacity-0"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (originalIndex < playlist.length - 1) onMoveTrack(originalIndex, originalIndex + 1);
                    }}
                    disabled={originalIndex === playlist.length - 1}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#343448] text-gray-400 hover:text-white transition-opacity disabled:opacity-0"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>

                  {/* Remove Track */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTrack(item.id);
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-900/40 text-gray-400 hover:text-red-400 transition-opacity"
                    title="Remove from playlist"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-[#171720] border-t border-[#2a2a38] text-[11px] text-gray-400 flex justify-between">
        <span>Total: {playlist.length} track(s)</span>
        <span className="text-vlc-orange font-mono">
          {currentIndex >= 0 && currentIndex < playlist.length ? `Playing #${currentIndex + 1}` : 'Stopped'}
        </span>
      </div>
    </div>
  );
};
