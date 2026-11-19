import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { MediaItem, VideoAdjustments, SubtitleSettings } from '../types';
import { SubtitleCue } from '../utils/subtitleParser';
import { Music, Play, AlertCircle, FilePlus, Globe, Sparkles } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

interface VideoViewportProps {
  currentMedia: MediaItem | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  adjustments: VideoAdjustments;
  subtitleSettings: SubtitleSettings;
  subtitleCues: SubtitleCue[];
  currentTime: number;
  osdMessage: string | null;
  onOpenFile: () => void;
  onOpenNetworkStream: () => void;
  onLoadSample: () => void;
  onDropFiles: (files: FileList) => void;
  onTogglePlay: () => void;
  showVisualizer: boolean;
  getAnalyserNode: () => AnalyserNode | null;
  isPlaying: boolean;
  onFileMissing?: (id: string) => void;
}

export const VideoViewport: React.FC<VideoViewportProps> = ({
  currentMedia,
  videoRef,
  adjustments,
  subtitleSettings,
  subtitleCues,
  currentTime,
  osdMessage,
  onOpenFile,
  onOpenNetworkStream,
  onLoadSample,
  onDropFiles,
  onTogglePlay,
  showVisualizer,
  getAnalyserNode,
  isPlaying,
  onFileMissing,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hlsError, setHlsError] = useState<string | null>(null);

  // Setup Hls.js for HLS streams (.m3u8)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentMedia) return;

    let hlsInstance: Hls | null = null;
    const mediaSourceUrl = currentMedia.streamUrl || (currentMedia.path ? `/api/media/${currentMedia.id}/stream` : '');

    const isHls = currentMedia.type === 'hls' || (mediaSourceUrl && mediaSourceUrl.includes('.m3u8'));

    if (isHls) {
      if (Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          capLevelToPlayerSize: false, // Prevents downgrading stream quality
          maxBufferLength: 60,
          maxMaxBufferLength: 120,
          startLevel: -1 // Automatically ramp up to maximum resolution available
        });
        hlsInstance.loadSource(mediaSourceUrl);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.warn('HLS fatal error:', data.type);
            setHlsError(`HLS stream issue: ${data.details}`);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Safari HLS
        video.src = mediaSourceUrl;
      }
    } else {
      video.src = mediaSourceUrl;
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [currentMedia, videoRef]);

  // Compute Quality Enhancement variables
  let qualityBrightness = 1.0;
  let qualityContrast = 1.0;
  let qualitySaturation = 1.0;
  let svgFilter = '';

  if (adjustments.qualityMode === 'crisp_hd') {
    svgFilter = 'url(#vidio-sharpen-filter)';
    qualityContrast = 1.04;
  } else if (adjustments.qualityMode === 'vivid_cinema') {
    svgFilter = 'url(#vidio-sharpen-filter)';
    qualityContrast = 1.08;
    qualitySaturation = 1.15;
  } else if (adjustments.qualityMode === 'hdr_sim') {
    svgFilter = 'url(#vidio-hdr-filter)';
    qualityBrightness = 1.03;
    qualityContrast = 1.12;
    qualitySaturation = 1.18;
  } else if (adjustments.qualityMode === 'anime_clear') {
    svgFilter = 'url(#vidio-anime-filter)';
    qualityContrast = 1.10;
    qualitySaturation = 1.12;
  }

  // Compute CSS filter string
  const filterString = [
    svgFilter,
    `brightness(${adjustments.brightness * qualityBrightness}%)`,
    `contrast(${adjustments.contrast * qualityContrast}%)`,
    `saturate(${adjustments.saturation * qualitySaturation}%)`,
    `hue-rotate(${adjustments.hue}deg)`,
    adjustments.invert ? 'invert(100%)' : '',
    adjustments.sepia ? 'sepia(80%)' : '',
    adjustments.grayscale ? 'grayscale(100%)' : '',
    adjustments.blur > 0 ? `blur(${adjustments.blur}px)` : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Compute CSS transform string
  const transformString = [
    adjustments.rotation > 0 ? `rotate(${adjustments.rotation}deg)` : '',
    adjustments.flipH ? 'scaleX(-1)' : '',
    adjustments.flipV ? 'scaleY(-1)' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Compute Aspect Ratio & Object Fit Classes
  let objectFitClass = 'object-contain';
  let aspectStyle: React.CSSProperties = { width: '100%', height: '100%' };

  if (adjustments.aspectRatio === 'fill') {
    objectFitClass = 'object-cover';
  } else if (adjustments.aspectRatio === 'stretch') {
    objectFitClass = 'object-fill';
  }

  // Calculate current active subtitle cue
  const adjustedTime = currentTime + (subtitleSettings.delay / 1000);
  const activeCue = subtitleSettings.enabled
    ? subtitleCues.find(cue => adjustedTime >= cue.start && adjustedTime <= cue.end)
    : null;

  // Subtitle font size mapping
  const fontSizePx = {
    small: 'text-base sm:text-lg',
    medium: 'text-lg sm:text-2xl',
    large: 'text-xl sm:text-3xl',
    huge: 'text-2xl sm:text-4xl'
  }[subtitleSettings.fontSize] || 'text-xl';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFiles(e.dataTransfer.files);
    }
  };

  const isAudioOnly = currentMedia?.type === 'audio';

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onTogglePlay}
      className={`relative flex-1 bg-black overflow-hidden flex items-center justify-center select-none cursor-pointer ${
        isDragOver ? 'ring-4 ring-vlc-orange ring-inset bg-[#1c1812]' : ''
      }`}
    >
      {/* SVG GPU Convolution Filters for Video Quality Upscaling & Edge Sharpening */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* 1. Crisp HD Sharpening Convolution Filter */}
          <filter id="vidio-sharpen-filter" colorInterpolationFilters="sRGB">
            <feConvolveMatrix
              order="3"
              preserveAlpha="true"
              kernelMatrix="
                0    -0.25   0
               -0.25  2.0   -0.25
                0    -0.25   0"
            />
          </filter>

          {/* 2. HDR Dynamic Range Simulation Filter */}
          <filter id="vidio-hdr-filter" colorInterpolationFilters="sRGB">
            <feConvolveMatrix
              order="3"
              preserveAlpha="true"
              kernelMatrix="
                0    -0.2    0
               -0.2   1.8   -0.2
                0    -0.2    0"
            />
            <feColorMatrix
              type="matrix"
              values="
                1.04 0 0 0 -0.015
                0 1.04 0 0 -0.015
                0 0 1.04 0 -0.015
                0 0 0 1 0"
            />
          </filter>

          {/* 3. Anime / Clear Contour Filter */}
          <filter id="vidio-anime-filter" colorInterpolationFilters="sRGB">
            <feConvolveMatrix
              order="3"
              preserveAlpha="true"
              kernelMatrix="
                0   -0.35   0
               -0.35 2.4   -0.35
                0   -0.35   0"
            />
          </filter>
        </defs>
      </svg>

      {/* 1. Video Element with High-Quality Crisp Rendering */}
      <video
        ref={videoRef}
        playsInline
        crossOrigin="anonymous"
        onError={() => {
          if (currentMedia) {
            onFileMissing?.(currentMedia.id);
          }
        }}
        className={`max-w-full max-h-full transition-all duration-75 ${objectFitClass} ${isAudioOnly || !currentMedia ? 'hidden' : 'block'}`}
        style={{
          filter: filterString,
          transform: transformString,
          imageRendering: 'auto' as React.CSSProperties['imageRendering'],
          WebkitFontSmoothing: 'antialiased',
          willChange: 'transform, filter',
          backfaceVisibility: 'hidden',
          ...aspectStyle,
        }}
      />

      {/* 2. Audio Only Mode Viewport */}
      {isAudioOnly && (
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-md w-full animate-fadeIn">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-pink-500/20 rounded-2xl blur-2xl animate-pulse" />
            <img src="/logo.png" alt="Vidio Player Logo" className="w-28 h-28 relative z-10 rounded-2xl shadow-2xl object-contain" />
          </div>
          <div className="flex items-center gap-2 text-vlc-orange text-xs font-semibold uppercase tracking-widest mb-1">
            <Music className="w-4 h-4" /> Audio Track Playing
          </div>
          <h2 className="text-xl font-bold text-white mb-1 truncate w-full">{currentMedia.title}</h2>
          <p className="text-xs text-gray-400 font-mono mb-6">{currentMedia.artist || 'Unknown Artist'}</p>

          <div className="w-full">
            <AudioVisualizer getAnalyserNode={getAnalyserNode} isPlaying={isPlaying} />
          </div>
        </div>
      )}

      {/* 3. Empty State (No media loaded) */}
      {!currentMedia && (
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg animate-fadeIn">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-pink-500/15 rounded-3xl blur-xl" />
            <img src="/logo.png" alt="Vidio Player Logo" className="w-36 h-36 relative rounded-2xl shadow-2xl object-contain" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Vidio Player
          </h1>
          <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
            Drag & drop media files here, play local audio/video, stream HLS live streams, apply 10-band audio equalizer, and adjust video colors in real-time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onOpenFile}
              className="flex items-center gap-2 px-4 py-2 bg-vlc-orange hover:bg-vlc-orange-hover text-white text-xs font-medium rounded-lg shadow-lg shadow-orange-950/40 transition-all hover:scale-105"
            >
              <FilePlus className="w-4 h-4" /> Open File...
            </button>
            <button
              onClick={onOpenNetworkStream}
              className="flex items-center gap-2 px-4 py-2 bg-[#222230] hover:bg-[#2c2c3e] border border-[#3c3c50] text-gray-200 text-xs font-medium rounded-lg transition-all hover:scale-105"
            >
              <Globe className="w-4 h-4 text-vlc-orange" /> Open Network Stream
            </button>
            <button
              onClick={onLoadSample}
              className="flex items-center gap-2 px-4 py-2 bg-[#222230] hover:bg-[#2c2c3e] border border-vlc-orange/40 text-vlc-orange text-xs font-medium rounded-lg transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" /> Load Demo Media
            </button>
          </div>
        </div>
      )}

      {/* 4. Active Subtitle Overlay */}
      {activeCue && !isAudioOnly && (
        <div
          className={`absolute left-0 right-0 px-6 text-center pointer-events-none z-20 flex justify-center ${
            subtitleSettings.position === 'top' ? 'top-8' : 'bottom-12'
          }`}
        >
          <div
            className={`font-semibold tracking-wide rounded-md px-3 py-1 inline-block max-w-[85%] whitespace-pre-line leading-relaxed shadow-lg ${fontSizePx}`}
            style={{
              color: subtitleSettings.textColor,
              backgroundColor: `rgba(0, 0, 0, ${subtitleSettings.bgOpacity})`,
              textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 2px black',
            }}
          >
            {activeCue.text}
          </div>
        </div>
      )}

      {/* 5. Transient On-Screen Display (OSD) Notification */}
      {osdMessage && (
        <div className="absolute top-5 right-5 z-30 pointer-events-none animate-fadeIn">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-black/85 backdrop-blur-md border border-vlc-orange/50 rounded-lg text-white font-mono text-xs shadow-2xl">
            <img src="/logo.svg" alt="logo" className="w-4 h-4 rounded-xs" />
            <span className="font-semibold text-vlc-orange">{osdMessage}</span>
          </div>
        </div>
      )}

      {/* 6. Drag & Drop Overlay Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 bg-vlc-orange/20 backdrop-blur-xs flex flex-col items-center justify-center border-4 border-dashed border-vlc-orange z-40 pointer-events-none animate-fadeIn">
          <img src="/logo.png" alt="drop" className="w-24 h-24 mb-3 animate-bounce rounded-2xl shadow-xl object-contain" />
          <h3 className="text-xl font-bold text-white">Drop Media or Subtitle Files Here</h3>
          <p className="text-xs text-gray-200 mt-1">MP4, WebM, MKV, MP3, WAV, FLAC, SRT, VTT</p>
        </div>
      )}

      {/* 7. HLS Error Overlay */}
      {hlsError && (
        <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-auto">
          <div className="flex items-center justify-between p-3 bg-red-950/90 border border-red-700 rounded-lg text-xs text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{hlsError}</span>
            </div>
            <button
              onClick={() => setHlsError(null)}
              className="px-2 py-0.5 bg-red-800 hover:bg-red-700 text-white rounded text-[11px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 8. Dedicated Visualizer Floating Widget (when toggled on with B key) */}
      {showVisualizer && !isAudioOnly && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-6 right-6 z-20 w-80 shadow-2xl rounded-lg overflow-hidden border border-[#3e3e50] bg-[#121218]/90 backdrop-blur-md animate-fadeIn"
        >
          <AudioVisualizer getAnalyserNode={getAnalyserNode} isPlaying={isPlaying} />
        </div>
      )}
    </div>
  );
};
