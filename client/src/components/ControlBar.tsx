import React, { useState, useRef } from 'react';
import { 
  Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX, 
  Volume1, Maximize, Minimize, Sliders, MessageSquare, ListMusic, 
  Camera, PictureInPicture2, Repeat, FastForward, Rewind, Eye, Sparkles
} from 'lucide-react';
import { formatTime } from '../utils/subtitleParser';

interface ControlBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  playbackRate: number;
  onSetRate: (rate: number) => void;
  onStepFrame: () => void;
  abLoop: { a: number | null; b: number | null };
  onToggleABLoop: () => void;
  onTakeSnapshot: () => void;
  onTogglePiP: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenAudioEffects: () => void;
  onOpenVideoEffects: () => void;
  onOpenSubtitles: () => void;
  onTogglePlaylist: () => void;
  bufferedEnd: number;
  qualityMode?: string;
  onCycleQuality?: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying,
  onTogglePlay,
  onStop,
  onNext,
  onPrev,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  playbackRate,
  onSetRate,
  onStepFrame,
  abLoop,
  onToggleABLoop,
  onTakeSnapshot,
  onTogglePiP,
  isFullscreen,
  onToggleFullscreen,
  onOpenAudioEffects,
  onOpenVideoEffects,
  onOpenSubtitles,
  onTogglePlaylist,
  bufferedEnd,
  qualityMode,
  onCycleQuality,
}) => {
  const [showRemaining, setShowRemaining] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? Math.min(100, (bufferedEnd / duration) * 100) : 0;

  const handleProgressBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pos * duration);
  };

  const volumePercent = Math.round(volume * 100);

  return (
    <div className="bg-[#181822] border-t border-[#2e2e40] px-4 py-2.5 flex flex-col gap-2 select-none relative z-30 shadow-2xl">
      {/* 1. Precision Scrub / Progress Bar */}
      <div
        ref={progressBarRef}
        onMouseMove={handleProgressBarHover}
        onMouseLeave={() => setHoverTime(null)}
        onClick={handleProgressBarClick}
        className="relative w-full h-2.5 bg-[#262636] hover:h-3.5 rounded-full cursor-pointer transition-all flex items-center group"
      >
        {/* Buffered Range Bar */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-[#3f3f56] rounded-full transition-all"
          style={{ width: `${bufferedPercent}%` }}
        />

        {/* Played Range Bar (VLC Orange) */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#e65c00] via-vlc-orange to-[#ffb84d] rounded-full shadow-md"
          style={{ width: `${progressPercent}%` }}
        />

        {/* A-B Loop Markers */}
        {abLoop.a !== null && duration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-yellow-400 z-10 rounded shadow"
            style={{ left: `${(abLoop.a / duration) * 100}%` }}
            title={`Loop Point A: ${formatTime(abLoop.a)}`}
          />
        )}
        {abLoop.b !== null && duration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-green-400 z-10 rounded shadow"
            style={{ left: `${(abLoop.b / duration) * 100}%` }}
            title={`Loop Point B: ${formatTime(abLoop.b)}`}
          />
        )}

        {/* Scrubber Knob */}
        <div
          className="absolute w-3.5 h-3.5 bg-white border border-gray-400 rounded-full shadow-lg transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"
          style={{ left: `${progressPercent}%` }}
        />

        {/* Hover Time Tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute -top-7 transform -translate-x-1/2 bg-[#101018] border border-[#3c3c50] text-white text-[10px] px-1.5 py-0.5 rounded font-mono pointer-events-none shadow-lg z-30"
            style={{ left: `${hoverPosition}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* 2. Control Row: Transport Buttons, Time, Speed, Volume, Actions */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Left: Transport Buttons */}
        <div className="flex items-center gap-1">
          {/* Previous Track */}
          <button
            onClick={onPrev}
            className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-[#282838] transition-colors"
            title="Previous (P)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Stop Button */}
          <button
            onClick={onStop}
            className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-[#282838] transition-colors"
            title="Stop & Rewind (S)"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Big Iconic Play / Pause Button */}
          <button
            onClick={onTogglePlay}
            className="p-2.5 rounded-full bg-vlc-orange hover:bg-vlc-orange-hover text-white transition-transform active:scale-95 shadow-md flex items-center justify-center mx-1"
            title="Play/Pause (Space)"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={onNext}
            className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-[#282838] transition-colors"
            title="Next (N)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Step Frame (E) */}
          <button
            onClick={onStepFrame}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#282838] transition-colors font-mono text-[10px]"
            title="Frame by Frame Step (E)"
          >
            +1f
          </button>

          {/* A-B Loop Button */}
          <button
            onClick={onToggleABLoop}
            className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition-colors flex items-center gap-1 ${
              abLoop.b !== null
                ? 'bg-green-600 text-white'
                : abLoop.a !== null
                ? 'bg-yellow-600 text-white animate-pulse'
                : 'text-gray-400 hover:text-white hover:bg-[#282838]'
            }`}
            title="A-B Loop: Click 1 set A, Click 2 set B, Click 3 clear"
          >
            <span>A⇄B</span>
            {abLoop.b !== null ? (
              <span className="text-[9px]">ON</span>
            ) : abLoop.a !== null ? (
              <span className="text-[9px]">A: {formatTime(abLoop.a)}</span>
            ) : null}
          </button>

          {/* Time Display (Click to switch between total and remaining) */}
          <div
            onClick={() => setShowRemaining(!showRemaining)}
            className="px-2 py-1 text-gray-300 hover:text-white cursor-pointer rounded hover:bg-[#242434] font-mono text-xs select-none transition-colors ml-1"
            title="Click to toggle Total / Remaining time (T)"
          >
            <span>{formatTime(currentTime)}</span>
            <span className="text-gray-500 mx-1">/</span>
            <span>
              {duration > 0
                ? showRemaining
                  ? `-${formatTime(Math.max(0, duration - currentTime))}`
                  : formatTime(duration)
                : '00:00'}
            </span>
          </div>
        </div>

        {/* Center/Right: Speed, Volume Boost (up to 200%), Effects, Actions */}
        <div className="flex items-center gap-2.5">
          {/* Playback Speed selector */}
          <div className="flex items-center gap-1 bg-[#20202c] px-2 py-0.5 rounded border border-[#303042]">
            <button
              onClick={() => onSetRate(Math.max(0.25, playbackRate - 0.25))}
              className="text-gray-400 hover:text-white px-1 text-xs"
              title="Slower ([)"
            >
              -
            </button>
            <span
              onClick={() => onSetRate(1.0)}
              className="text-vlc-orange font-mono text-xs cursor-pointer hover:underline font-semibold"
              title="Click to reset to 1.0x (=)"
            >
              {playbackRate.toFixed(2)}x
            </span>
            <button
              onClick={() => onSetRate(Math.min(4.0, playbackRate + 0.25))}
              className="text-gray-400 hover:text-white px-1 text-xs"
              title="Faster (])"
            >
              +
            </button>
          </div>

          {/* VLC Volume Boost (0% - 200%) */}
          <div className="flex items-center gap-1.5 bg-[#20202c] px-2.5 py-1 rounded border border-[#303042]">
            <button
              onClick={onToggleMute}
              className="text-gray-300 hover:text-white transition-colors"
              title="Mute / Unmute (M)"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume > 1.25 ? (
                <Volume2 className="w-4 h-4 text-red-500 animate-pulse" />
              ) : volume > 0.5 ? (
                <Volume2 className="w-4 h-4 text-vlc-orange" />
              ) : (
                <Volume1 className="w-4 h-4 text-gray-300" />
              )}
            </button>

            {/* Custom Range Slider with 200% overboost */}
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 sm:w-24 accent-vlc-orange cursor-pointer"
              title={`Volume: ${volumePercent}% (Up to 200% Vidio Boost)`}
            />

            <span
              className={`font-mono text-[11px] w-9 text-right font-bold ${
                volumePercent > 125
                  ? 'text-red-400'
                  : volumePercent > 100
                  ? 'text-vlc-orange'
                  : 'text-gray-300'
              }`}
            >
              {isMuted ? '0%' : `${volumePercent}%`}
            </span>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1 text-gray-300">
            {/* Audio Effects / Equalizer */}
            <button
              onClick={onOpenAudioEffects}
              className="p-1.5 rounded hover:bg-[#282838] hover:text-vlc-orange transition-colors"
              title="Audio Effects & Equalizer (Ctrl+E)"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Video Viewing Quality Enhancer */}
            <button
              onClick={onCycleQuality}
              className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
                qualityMode && qualityMode !== 'standard'
                  ? 'text-vlc-orange bg-[#282218] border border-vlc-orange/50 hover:bg-[#342b1e]'
                  : 'text-gray-300 hover:bg-[#282838] hover:text-white'
              }`}
              title={`Video Quality Enhancer: ${qualityMode ? qualityMode.toUpperCase().replace('_', ' ') : 'Standard'} (Click to cycle HD/Vivid/HDR)`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold font-mono uppercase">
                {qualityMode === 'crisp_hd'
                  ? 'HD'
                  : qualityMode === 'vivid_cinema'
                  ? 'Vivid'
                  : qualityMode === 'hdr_sim'
                  ? 'HDR'
                  : qualityMode === 'anime_clear'
                  ? 'Anime'
                  : 'Std'}
              </span>
            </button>

            {/* Video Effects */}
            <button
              onClick={onOpenVideoEffects}
              className="p-1.5 rounded hover:bg-[#282838] hover:text-vlc-orange transition-colors"
              title="Video Effects & Adjustments (Ctrl+V)"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Subtitles */}
            <button
              onClick={onOpenSubtitles}
              className="p-1.5 rounded hover:bg-[#282838] hover:text-vlc-orange transition-colors"
              title="Subtitles Track & Style (V)"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Take Snapshot */}
            <button
              onClick={onTakeSnapshot}
              className="p-1.5 rounded hover:bg-[#282838] hover:text-vlc-orange transition-colors"
              title="Take Video Snapshot"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Picture in Picture */}
            <button
              onClick={onTogglePiP}
              className="p-1.5 rounded hover:bg-[#282838] hover:text-vlc-orange transition-colors"
              title="Picture-in-Picture"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Playlist Panel Toggle */}
            <button
              onClick={onTogglePlaylist}
              className="p-1.5 rounded hover:bg-[#282838] hover:text-vlc-orange transition-colors"
              title="Toggle Playlist (Ctrl+L)"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded hover:bg-[#282838] hover:text-vlc-orange transition-colors"
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
