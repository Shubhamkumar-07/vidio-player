import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MediaItem, VideoAdjustments, SubtitleSettings, RepeatMode } from './types';
import { useAudioEngine } from './hooks/useAudioEngine';
import { parseSubtitles, SubtitleCue } from './utils/subtitleParser';
import { MenuBar } from './components/MenuBar';
import { VideoViewport } from './components/VideoViewport';
import { ControlBar } from './components/ControlBar';
import { AudioEffectsModal } from './components/AudioEffectsModal';
import { VideoEffectsModal } from './components/VideoEffectsModal';
import { NetworkStreamModal } from './components/NetworkStreamModal';
import { MediaInfoModal } from './components/MediaInfoModal';
import { SubtitleSettingsModal } from './components/SubtitleSettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { PlaylistPanel } from './components/PlaylistPanel';

const DEFAULT_VIDEO_ADJUSTMENTS: VideoAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  gamma: 1.0,
  invert: false,
  sepia: false,
  grayscale: false,
  blur: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
  aspectRatio: 'default',
  qualityMode: 'crisp_hd',
  sharpness: 35
};

const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  enabled: true,
  selectedTrackId: null,
  delay: 0,
  fontSize: 'medium',
  textColor: '#FFFFFF',
  bgColor: '#000000',
  bgOpacity: 0.75,
  position: 'bottom'
};

export function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Media & Playlist State
  const [playlist, setPlaylist] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  // A-B Loop State
  const [abLoop, setAbLoop] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });

  // On-Screen Display (OSD) feedback
  const [osdMessage, setOsdMessage] = useState<string | null>(null);
  const osdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showOsd = useCallback((msg: string) => {
    if (osdTimeoutRef.current) clearTimeout(osdTimeoutRef.current);
    setOsdMessage(msg);
    osdTimeoutRef.current = setTimeout(() => setOsdMessage(null), 1800);
  }, []);

  // Video & Subtitle Adjustments
  const [adjustments, setAdjustments] = useState<VideoAdjustments>(DEFAULT_VIDEO_ADJUSTMENTS);
  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleSettings>(DEFAULT_SUBTITLE_SETTINGS);
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [showVisualizer, setShowVisualizer] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modals Visibility
  const [audioEffectsOpen, setAudioEffectsOpen] = useState(false);
  const [videoEffectsOpen, setVideoEffectsOpen] = useState(false);
  const [networkStreamOpen, setNetworkStreamOpen] = useState(false);
  const [mediaInfoOpen, setMediaInfoOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [subtitleSettingsOpen, setSubtitleSettingsOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Web Audio Graph Engine Hook
  const {
    initAudioGraph,
    resumeAudioContext,
    volume,
    isMuted,
    pan,
    audioDelayMs,
    eqSettings,
    setPreamp,
    setBandGain,
    applyPreset,
    toggleEqualizer,
    setMasterVolume,
    toggleMute,
    setStereoPan,
    setAudioDelay,
    getAnalyserNode
  } = useAudioEngine(videoRef);

  const currentMedia = currentIndex >= 0 && currentIndex < playlist.length ? playlist[currentIndex] : null;

  // 1. Fetch Initial Media from Backend
  useEffect(() => {
    fetch('/api/media')
      .then(res => res.json())
      .then((data: MediaItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlaylist(data);
          setCurrentIndex(0); // Select first media
        }
      })
      .catch(err => console.error('Failed to load initial media:', err));
  }, []);

  // 2. Load Subtitles when Current Media or Track Changes
  useEffect(() => {
    if (!currentMedia) {
      setSubtitleCues([]);
      return;
    }

    if (currentMedia.subtitles && currentMedia.subtitles.length > 0) {
      const track = subtitleSettings.selectedTrackId
        ? currentMedia.subtitles.find(s => s.id === subtitleSettings.selectedTrackId) || currentMedia.subtitles[0]
        : currentMedia.subtitles[0];

      if (track && track.url) {
        setSubtitleSettings(prev => ({ ...prev, selectedTrackId: track.id, enabled: true }));
        fetch(track.url)
          .then(res => res.text())
          .then(text => {
            const cues = parseSubtitles(text);
            setSubtitleCues(cues);
          })
          .catch(e => console.warn('Subtitle fetch error:', e));
      }
    } else {
      setSubtitleCues([]);
      setSubtitleSettings(prev => ({ ...prev, selectedTrackId: null }));
    }
  }, [currentMedia, subtitleSettings.selectedTrackId]);

  // 3. Media Element Event Handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      resumeAudioContext();
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      // Check A-B loop
      if (abLoop.a !== null && abLoop.b !== null) {
        if (video.currentTime >= abLoop.b) {
          video.currentTime = abLoop.a;
        }
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      video.playbackRate = playbackRate;
    };

    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBufferedEnd(video.buffered.end(video.buffered.length - 1));
      }
    };

    const onEnded = () => {
      if (repeatMode === 'one') {
        video.currentTime = 0;
        video.play();
      } else if (repeatMode === 'all' || currentIndex < playlist.length - 1) {
        handleNextTrack();
      } else {
        setIsPlaying(false);
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('progress', onProgress);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('ended', onEnded);
    };
  }, [abLoop, repeatMode, currentIndex, playlist.length, playbackRate, resumeAudioContext]);

  // 4. Playback Actions
  const handleTogglePlay = useCallback(() => {
    initAudioGraph();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(e => console.warn('Play interrupted:', e));
      showOsd('Play');
    } else {
      video.pause();
      showOsd('Pause');
    }
  }, [initAudioGraph, showOsd]);

  const handleStop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
    showOsd('Stop');
  }, [showOsd]);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
  }, []);

  const handleJump = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    video.currentTime = newTime;
    showOsd(`${seconds > 0 ? `+${seconds}s` : `${seconds}s`}`);
  }, [showOsd]);

  const handleStepFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = Math.min(video.duration || 0, video.currentTime + (1 / 30));
    showOsd('Next Frame');
  }, [showOsd]);

  const handleSetRate = useCallback((rate: number) => {
    const clamped = Math.max(0.25, Math.min(4.0, parseFloat(rate.toFixed(2))));
    setPlaybackRate(clamped);
    if (videoRef.current) {
      videoRef.current.playbackRate = clamped;
    }
    showOsd(`Speed: ${clamped.toFixed(2)}x`);
  }, [showOsd]);

  const handleNextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    let nextIdx = currentIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * playlist.length);
    } else if (nextIdx >= playlist.length) {
      nextIdx = 0;
    }
    setCurrentIndex(nextIdx);
    setAbLoop({ a: null, b: null });
    showOsd(`Track: ${nextIdx + 1}/${playlist.length}`);
  }, [playlist.length, currentIndex, isShuffle, showOsd]);

  const handlePrevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = playlist.length - 1;
    setCurrentIndex(prevIdx);
    setAbLoop({ a: null, b: null });
    showOsd(`Track: ${prevIdx + 1}/${playlist.length}`);
  }, [playlist.length, currentIndex, showOsd]);

  // A-B Looping Controller
  const handleToggleABLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (abLoop.a === null) {
      setAbLoop({ a: video.currentTime, b: null });
      showOsd(`Loop Point A Set: ${video.currentTime.toFixed(1)}s`);
    } else if (abLoop.b === null) {
      if (video.currentTime > abLoop.a) {
        setAbLoop(prev => ({ ...prev, b: video.currentTime }));
        showOsd(`Loop A-B Active`);
      } else {
        setAbLoop({ a: null, b: null });
        showOsd('Loop Cleared');
      }
    } else {
      setAbLoop({ a: null, b: null });
      showOsd('Loop Cleared');
    }
  }, [abLoop, showOsd]);

  // Snapshot Capture
  const handleTakeSnapshot = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    const timeLabel = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `VidioPlayer_Snapshot_${timeLabel}.png`;
    a.click();
    showOsd('Snapshot Taken');
  }, [showOsd]);

  // Fullscreen
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // PiP
  const handleTogglePiP = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else if (video.requestPictureInPicture) {
      video.requestPictureInPicture().catch(() => {});
    }
  }, []);

  // Aspect Ratio Cycling
  const handleCycleAspectRatio = useCallback(() => {
    const list: VideoAdjustments['aspectRatio'][] = ['default', '16:9', '4:3', '1:1', '21:9', 'fill', 'stretch'];
    const curIdx = list.indexOf(adjustments.aspectRatio);
    const nextAr = list[(curIdx + 1) % list.length];
    setAdjustments(prev => ({ ...prev, aspectRatio: nextAr }));
    showOsd(`Aspect Ratio: ${nextAr.toUpperCase()}`);
  }, [adjustments.aspectRatio, showOsd]);

  // Quality Mode Cycling
  const handleCycleQuality = useCallback(() => {
    const modes: VideoAdjustments['qualityMode'][] = ['crisp_hd', 'vivid_cinema', 'hdr_sim', 'anime_clear', 'standard'];
    const curIdx = modes.indexOf(adjustments.qualityMode);
    const nextMode = modes[(curIdx + 1) % modes.length];
    setAdjustments(prev => ({ ...prev, qualityMode: nextMode }));
    showOsd(`Quality: ${nextMode.replace(/_/g, ' ').toUpperCase()}`);
  }, [adjustments.qualityMode, showOsd]);

  // Auto-delete: remove from playlist when file is missing
  const handleFileMissing = useCallback((id: string) => {
    setPlaylist(prev => {
      const newList = prev.filter(p => p.id !== id);
      return newList;
    });
    setCurrentIndex(prev => Math.max(0, prev - 1));
    showOsd('⚠️ File deleted from device — removed from library');
  }, [showOsd]);

  // Polling to sync deleted files from server (every 10s)
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/media')
        .then(res => res.json())
        .then((serverList: MediaItem[]) => {
          const serverIds = new Set(serverList.map((m: MediaItem) => m.id));
          setPlaylist(prev => prev.filter(p => p.id.startsWith('local-') || serverIds.has(p.id)));
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 5. Global VLC Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleStop();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleNextTrack();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handlePrevTrack();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
        showOsd(isMuted ? 'Unmute' : 'Mute');
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) handleJump(3);
        else if (e.ctrlKey || e.metaKey) handleJump(10);
        else if (e.altKey) handleJump(60);
        else handleJump(5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) handleJump(-3);
        else if (e.ctrlKey || e.metaKey) handleJump(-10);
        else if (e.altKey) handleJump(-60);
        else handleJump(-5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        const nextVol = Math.min(2.0, volume + 0.05);
        setMasterVolume(nextVol);
        showOsd(`Volume: ${Math.round(nextVol * 100)}%`);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        const nextVol = Math.max(0, volume - 0.05);
        setMasterVolume(nextVol);
        showOsd(`Volume: ${Math.round(nextVol * 100)}%`);
      } else if (e.key === '[') {
        e.preventDefault();
        handleSetRate(playbackRate - 0.1);
      } else if (e.key === ']') {
        e.preventDefault();
        handleSetRate(playbackRate + 0.1);
      } else if (e.key === '=') {
        e.preventDefault();
        handleSetRate(1.0);
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleStepFrame();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        const newDelay = subtitleSettings.delay - 50;
        setSubtitleSettings(prev => ({ ...prev, delay: newDelay }));
        showOsd(`Subtitle Delay: ${newDelay} ms`);
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        const newDelay = subtitleSettings.delay + 50;
        setSubtitleSettings(prev => ({ ...prev, delay: newDelay }));
        showOsd(`Subtitle Delay: ${newDelay} ms`);
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        const newDelay = audioDelayMs - 50;
        setAudioDelay(newDelay);
        showOsd(`Audio Delay: ${newDelay} ms`);
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        const newDelay = audioDelayMs + 50;
        setAudioDelay(newDelay);
        showOsd(`Audio Delay: ${newDelay} ms`);
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleCycleAspectRatio();
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setSubtitleSettings(prev => {
          const nextVal = !prev.enabled;
          showOsd(`Subtitles: ${nextVal ? 'ON' : 'OFF'}`);
          return { ...prev, enabled: nextVal };
        });
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setShowVisualizer(prev => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setRepeatMode(prev => {
          const nextMode: RepeatMode = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
          showOsd(`Repeat: ${nextMode.toUpperCase()}`);
          return nextMode;
        });
      } else if (e.key === '?' || e.key === 'F1') {
        e.preventDefault();
        setShortcutsOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        fileInputRef.current?.click();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setNetworkStreamOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        setAudioEffectsOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        setVideoEffectsOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        setPlaylistOpen(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        setMediaInfoOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleTogglePlay,
    handleToggleFullscreen,
    handleStop,
    handleNextTrack,
    handlePrevTrack,
    toggleMute,
    isMuted,
    handleJump,
    volume,
    setMasterVolume,
    playbackRate,
    handleSetRate,
    handleStepFrame,
    subtitleSettings.delay,
    audioDelayMs,
    setAudioDelay,
    handleCycleAspectRatio,
    showOsd
  ]);

  // 6. Instant Local File Loading + Asynchronous Background Library Sync
  const handleFilesUpload = async (files: FileList) => {
    const fileList = Array.from(files);
    const mediaFiles: File[] = [];
    const subFiles: File[] = [];

    fileList.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'srt' || ext === 'vtt') {
        subFiles.push(file);
      } else {
        mediaFiles.push(file);
      }
    });

    // 1. Immediately parse and attach subtitles in milliseconds
    if (subFiles.length > 0) {
      for (const subFile of subFiles) {
        try {
          const text = await subFile.text();
          const cues = parseSubtitles(text);
          setSubtitleCues(cues);
          setSubtitleSettings(prev => ({ ...prev, enabled: true }));
          showOsd(`Loaded Subtitle: ${subFile.name}`);
        } catch (e) {
          console.warn('Subtitle parse error:', e);
        }
      }
    }

    // 2. Instantly start playing local media files (0 seconds wait time!)
    if (mediaFiles.length > 0) {
      const localItems: MediaItem[] = mediaFiles.map(file => {
        const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file.name);
        const blobUrl = URL.createObjectURL(file);
        return {
          id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          title: file.name.replace(/\.[^/.]+$/, ''),
          originalName: file.name,
          streamUrl: blobUrl,
          mimeType: file.type || (isAudio ? 'audio/mp4' : 'video/mp4'),
          type: isAudio ? 'audio' : 'video',
          size: file.size,
          isStream: false,
          createdAt: new Date().toISOString()
        };
      });

      // Instantly prepend to playlist and switch current index to play right away
      setPlaylist(prev => [...localItems, ...prev]);
      setCurrentIndex(0);
      initAudioGraph();
      showOsd(`Playing: ${localItems[0].title}`);

      // Smooth auto-play start
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }, 50);

      // 3. Asynchronously upload in background to persist to server library (non-blocking)
      const formData = new FormData();
      mediaFiles.forEach(f => formData.append('media', f));
      subFiles.forEach(s => formData.append('subtitles', s));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/media/upload');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent < 100 ? percent : null);
        }
      };

      xhr.onload = () => {
        setUploadProgress(null);
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.items && data.items.length > 0) {
              setPlaylist(prev =>
                prev.map(item => {
                  const match = data.items.find((srv: MediaItem) => srv.originalName === item.originalName);
                  if (match && item.id.startsWith('local-')) {
                    return {
                      ...item,
                      id: match.id,
                      path: match.path,
                      filename: match.filename,
                    };
                  }
                  return item;
                })
              );
            }
          } catch (e) {}
        }
      };

      xhr.onerror = () => {
        setUploadProgress(null);
      };

      xhr.send(formData);
    }
  };

  // 7. Add Network Stream URL
  const handleAddNetworkStream = async (url: string, title?: string, playImmediately?: boolean) => {
    showOsd('Adding Network Stream...');
    try {
      const res = await fetch('/api/media/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title })
      });
      const data = await res.json();
      if (data.item) {
        setPlaylist(prev => [data.item, ...prev]);
        if (playImmediately) {
          setCurrentIndex(0);
        }
        showOsd('Stream Added');
      }
    } catch (e) {
      showOsd('Failed to add stream');
    }
  };

  // Reset Video Adjustments
  const handleResetVideo = () => {
    setAdjustments(DEFAULT_VIDEO_ADJUSTMENTS);
    showOsd('Video Effects Reset');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#14141c] text-gray-100 font-sans overflow-hidden">
      {/* Hidden File Input for Ctrl+O / Menu File Open */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,.m3u8,.m3u,.srt,.vtt"
        className="hidden"
        onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
      />

      {/* 1. VLC Menubar */}
      <MenuBar
        onOpenFile={() => fileInputRef.current?.click()}
        onOpenNetworkStream={() => setNetworkStreamOpen(true)}
        onOpenAudioEffects={() => setAudioEffectsOpen(true)}
        onOpenVideoEffects={() => setVideoEffectsOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenMediaInfo={() => setMediaInfoOpen(true)}
        onOpenSubtitles={() => setSubtitleSettingsOpen(true)}
        onTogglePlaylist={() => setPlaylistOpen(prev => !prev)}
        onToggleVisualizer={() => setShowVisualizer(prev => !prev)}
        onTakeSnapshot={handleTakeSnapshot}
        onToggleFullscreen={handleToggleFullscreen}
        onTogglePiP={handleTogglePiP}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onStop={handleStop}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        playbackRate={playbackRate}
        onSetRate={handleSetRate}
        onJump={handleJump}
        aspectRatio={adjustments.aspectRatio}
        onSetAspectRatio={(ar) => setAdjustments(prev => ({ ...prev, aspectRatio: ar }))}
        uploadProgress={uploadProgress}
      />

      {/* 2. Main Viewport & Video Player Stage */}
      <div className="flex-1 relative flex overflow-hidden">
        <VideoViewport
          currentMedia={currentMedia}
          videoRef={videoRef}
          adjustments={adjustments}
          subtitleSettings={subtitleSettings}
          subtitleCues={subtitleCues}
          currentTime={currentTime}
          osdMessage={osdMessage}
          onOpenFile={() => fileInputRef.current?.click()}
          onOpenNetworkStream={() => setNetworkStreamOpen(true)}
          onLoadSample={() => {
            fetch('/api/media')
              .then(res => res.json())
              .then(data => {
                setPlaylist(data);
                setCurrentIndex(0);
                showOsd('Loaded Demo Media');
              });
          }}
          onDropFiles={handleFilesUpload}
          onTogglePlay={handleTogglePlay}
          showVisualizer={showVisualizer}
          getAnalyserNode={getAnalyserNode}
          isPlaying={isPlaying}
          onFileMissing={handleFileMissing}
        />

        {/* 3. Playlist Slide-in Panel */}
        <PlaylistPanel
          isOpen={playlistOpen}
          onClose={() => setPlaylistOpen(false)}
          playlist={playlist}
          currentIndex={currentIndex}
          onSelectTrack={(idx) => {
            setCurrentIndex(idx);
            setAbLoop({ a: null, b: null });
          }}
          onRemoveTrack={(id) => {
            setPlaylist(prev => prev.filter(p => p.id !== id));
            fetch(`/api/media/${id}`, { method: 'DELETE' }).catch(() => {});
          }}
          onClearPlaylist={() => {
            setPlaylist([]);
            setCurrentIndex(-1);
          }}
          onMoveTrack={(from, to) => {
            setPlaylist(prev => {
              const copy = [...prev];
              const [moved] = copy.splice(from, 1);
              copy.splice(to, 0, moved);
              return copy;
            });
          }}
          onAddFiles={handleFilesUpload}
          onOpenNetworkStreamModal={() => setNetworkStreamOpen(true)}
          repeatMode={repeatMode}
          onToggleRepeat={() => {
            setRepeatMode(prev => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
          }}
          isShuffle={isShuffle}
          onToggleShuffle={() => setIsShuffle(prev => !prev)}
        />
      </div>

      {/* 4. VLC Control Bar */}
      <ControlBar
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onStop={handleStop}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={setMasterVolume}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        playbackRate={playbackRate}
        onSetRate={handleSetRate}
        onStepFrame={handleStepFrame}
        abLoop={abLoop}
        onToggleABLoop={handleToggleABLoop}
        onTakeSnapshot={handleTakeSnapshot}
        onTogglePiP={handleTogglePiP}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenAudioEffects={() => setAudioEffectsOpen(true)}
        onOpenVideoEffects={() => setVideoEffectsOpen(true)}
        onOpenSubtitles={() => setSubtitleSettingsOpen(true)}
        onTogglePlaylist={() => setPlaylistOpen(prev => !prev)}
        bufferedEnd={bufferedEnd}
        qualityMode={adjustments.qualityMode}
        onCycleQuality={handleCycleQuality}
      />

      {/* 5. VLC Modals & Dialogs */}
      <AudioEffectsModal
        isOpen={audioEffectsOpen}
        onClose={() => setAudioEffectsOpen(false)}
        eqSettings={eqSettings}
        preamp={eqSettings.preamp}
        onPreampChange={setPreamp}
        onBandGainChange={setBandGain}
        onPresetChange={applyPreset}
        onToggleEqualizer={toggleEqualizer}
        stereoPan={pan}
        onStereoPanChange={setStereoPan}
        audioDelayMs={audioDelayMs}
        onAudioDelayChange={setAudioDelay}
        getAnalyserNode={getAnalyserNode}
        isPlaying={isPlaying}
      />

      <VideoEffectsModal
        isOpen={videoEffectsOpen}
        onClose={() => setVideoEffectsOpen(false)}
        adjustments={adjustments}
        onChange={(upd) => setAdjustments(prev => ({ ...prev, ...upd }))}
        onReset={handleResetVideo}
      />

      <NetworkStreamModal
        isOpen={networkStreamOpen}
        onClose={() => setNetworkStreamOpen(false)}
        onOpenStream={handleAddNetworkStream}
      />

      <MediaInfoModal
        isOpen={mediaInfoOpen}
        onClose={() => setMediaInfoOpen(false)}
        currentMedia={currentMedia}
        videoElement={videoRef.current}
      />

      <SubtitleSettingsModal
        isOpen={subtitleSettingsOpen}
        onClose={() => setSubtitleSettingsOpen(false)}
        tracks={currentMedia?.subtitles || []}
        settings={subtitleSettings}
        onSettingsChange={(upd) => setSubtitleSettings(prev => ({ ...prev, ...upd }))}
        onUploadSubtitle={async (file) => {
          const text = await file.text();
          const cues = parseSubtitles(text);
          setSubtitleCues(cues);
          setSubtitleSettings(prev => ({ ...prev, enabled: true }));
          showOsd(`Loaded Subtitle: ${file.name}`);
        }}
      />

      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;
