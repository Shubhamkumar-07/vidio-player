export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  url?: string;
  content?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  originalName?: string;
  filename?: string;
  streamUrl?: string;
  path?: string;
  mimeType: string;
  type: 'video' | 'audio' | 'hls';
  size?: number;
  duration?: number;
  artist?: string;
  album?: string;
  isStream?: boolean;
  subtitles?: SubtitleTrack[];
  createdAt?: string;
}

export type VideoQualityMode = 'standard' | 'crisp_hd' | 'vivid_cinema' | 'hdr_sim' | 'anime_clear';

export interface VideoAdjustments {
  brightness: number;  // 0 to 200, default 100
  contrast: number;    // 0 to 200, default 100
  saturation: number;  // 0 to 300, default 100
  hue: number;         // 0 to 360, default 0
  gamma: number;       // 0.5 to 2.5, default 1
  invert: boolean;     // default false
  sepia: boolean;      // default false
  grayscale: boolean;  // default false
  blur: number;        // 0 to 20px, default 0
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
  aspectRatio: 'default' | '16:9' | '4:3' | '1:1' | '16:10' | '21:9' | 'fill' | 'stretch';
  qualityMode: VideoQualityMode;
  sharpness: number;   // 0 to 100, default 0
}

export interface EqualizerSettings {
  enabled: boolean;
  preamp: number; // -20 dB to +20 dB
  bands: { [freq: number]: number }; // frequency -> gain in dB (-20 to +20)
  presetName: string;
}

export interface AudioSettings {
  volume: number;       // 0 to 2.0 (0% to 200%)
  muted: boolean;
  pan: number;          // -1 (Left) to +1 (Right)
  delay: number;        // in milliseconds, default 0
  equalizer: EqualizerSettings;
}

export interface SubtitleSettings {
  enabled: boolean;
  selectedTrackId: string | null;
  delay: number;        // in milliseconds, default 0
  fontSize: 'small' | 'medium' | 'large' | 'huge';
  textColor: string;
  bgColor: string;
  bgOpacity: number;
  position: 'bottom' | 'top';
}

export type RepeatMode = 'off' | 'all' | 'one';
