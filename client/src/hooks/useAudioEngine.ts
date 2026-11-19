import { useEffect, useRef, useState, useCallback } from 'react';
import { EQ_FREQUENCIES, getPresetBands } from '../utils/equalizerPresets';
import { EqualizerSettings } from '../types';

interface AudioNodes {
  audioCtx: AudioContext;
  sourceNode: MediaElementAudioSourceNode;
  preampNode: GainNode;
  eqFilters: Map<number, BiquadFilterNode>;
  delayNode: DelayNode;
  pannerNode: StereoPannerNode;
  masterGainNode: GainNode;
  analyserNode: AnalyserNode;
}

export function useAudioEngine(mediaElementRef: React.RefObject<HTMLMediaElement>) {
  const nodesRef = useRef<AudioNodes | null>(null);
  const [isAudioContextReady, setIsAudioContextReady] = useState(false);

  const [eqSettings, setEqSettings] = useState<EqualizerSettings>({
    enabled: true,
    preamp: 0,
    bands: getPresetBands('Flat'),
    presetName: 'Flat'
  });

  const [volume, setVolumeState] = useState<number>(1.0); // 0 to 2.0
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [pan, setPanState] = useState<number>(0); // -1 to 1
  const [audioDelayMs, setAudioDelayState] = useState<number>(0); // ms

  // Initialize Web Audio Graph once user interacts
  const initAudioGraph = useCallback(() => {
    if (nodesRef.current || !mediaElementRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();

      // Ensure media element doesn't restrict crossOrigin if needed
      const el = mediaElementRef.current;
      const sourceNode = audioCtx.createMediaElementSource(el);

      const preampNode = audioCtx.createGain();
      preampNode.gain.value = 1.0;

      // Create 10 EQ Filter Nodes
      const eqFilters = new Map<number, BiquadFilterNode>();
      let prevNode: AudioNode = preampNode;

      EQ_FREQUENCIES.forEach((freq) => {
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.4; // standard Q for 1-octave band
        filter.gain.value = 0;
        prevNode.connect(filter);
        prevNode = filter;
        eqFilters.set(freq, filter);
      });

      // Audio delay node (0 to 2s max)
      const delayNode = audioCtx.createDelay(2.0);
      delayNode.delayTime.value = 0;
      prevNode.connect(delayNode);

      // Stereo Panner
      const hasPanner = typeof audioCtx.createStereoPanner === 'function';
      const pannerNode = hasPanner ? audioCtx.createStereoPanner() : (audioCtx.createGain() as unknown as StereoPannerNode);
      if (hasPanner) {
        delayNode.connect(pannerNode);
      } else {
        delayNode.connect(audioCtx.destination);
      }

      // Master Gain for Volume Boost (up to 200%)
      const masterGainNode = audioCtx.createGain();
      masterGainNode.gain.value = volume;
      if (hasPanner) {
        pannerNode.connect(masterGainNode);
      } else {
        delayNode.connect(masterGainNode);
      }

      // Analyser Node for Visualizers
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      masterGainNode.connect(analyserNode);

      // Connect to output speakers
      analyserNode.connect(audioCtx.destination);

      sourceNode.connect(preampNode);

      nodesRef.current = {
        audioCtx,
        sourceNode,
        preampNode,
        eqFilters,
        delayNode,
        pannerNode,
        masterGainNode,
        analyserNode
      };

      setIsAudioContextReady(true);
    } catch (err) {
      console.warn('[AudioEngine] Web Audio graph setup error:', err);
    }
  }, [mediaElementRef, volume]);

  // Ensure AudioContext resumes if suspended
  const resumeAudioContext = useCallback(() => {
    if (nodesRef.current && nodesRef.current.audioCtx.state === 'suspended') {
      nodesRef.current.audioCtx.resume();
    }
  }, []);

  // Update Preamp Gain (-20dB to +20dB)
  const setPreamp = useCallback((dB: number) => {
    setEqSettings(prev => ({ ...prev, preamp: dB }));
    if (!nodesRef.current) return;
    const gainValue = Math.pow(10, dB / 20);
    nodesRef.current.preampNode.gain.setTargetAtTime(gainValue, nodesRef.current.audioCtx.currentTime, 0.05);
  }, []);

  // Update individual EQ Band
  const setBandGain = useCallback((freq: number, dB: number) => {
    setEqSettings(prev => ({
      ...prev,
      presetName: 'Custom',
      bands: { ...prev.bands, [freq]: dB }
    }));
    if (!nodesRef.current) return;
    const filter = nodesRef.current.eqFilters.get(freq);
    if (filter) {
      filter.gain.setTargetAtTime(dB, nodesRef.current.audioCtx.currentTime, 0.05);
    }
  }, []);

  // Apply Equalizer Preset
  const applyPreset = useCallback((presetName: string) => {
    const bands = getPresetBands(presetName);
    setEqSettings(prev => ({
      ...prev,
      presetName,
      bands
    }));

    if (!nodesRef.current) return;
    const ctx = nodesRef.current.audioCtx;
    EQ_FREQUENCIES.forEach(freq => {
      const filter = nodesRef.current?.eqFilters.get(freq);
      if (filter) {
        filter.gain.setTargetAtTime(bands[freq] || 0, ctx.currentTime, 0.05);
      }
    });
  }, []);

  // Toggle Equalizer Bypass / Enable
  const toggleEqualizer = useCallback((enabled: boolean) => {
    setEqSettings(prev => ({ ...prev, enabled }));
    if (!nodesRef.current) return;
    const ctx = nodesRef.current.audioCtx;
    EQ_FREQUENCIES.forEach(freq => {
      const filter = nodesRef.current?.eqFilters.get(freq);
      if (filter) {
        filter.gain.setTargetAtTime(enabled ? (eqSettings.bands[freq] || 0) : 0, ctx.currentTime, 0.05);
      }
    });
  }, [eqSettings.bands]);

  // Set Master Volume (0.0 to 2.0 / 200%)
  const setMasterVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(2.0, newVol));
    setVolumeState(clamped);
    if (isMuted) setIsMuted(false);

    if (!nodesRef.current) {
      // If Web Audio isn't attached yet, cap element volume to 1
      if (mediaElementRef.current) {
        mediaElementRef.current.volume = Math.min(1.0, clamped);
      }
      return;
    }

    const ctx = nodesRef.current.audioCtx;
    nodesRef.current.masterGainNode.gain.setTargetAtTime(clamped, ctx.currentTime, 0.02);
  }, [isMuted, mediaElementRef]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const nextMute = !prev;
      if (nodesRef.current) {
        const ctx = nodesRef.current.audioCtx;
        nodesRef.current.masterGainNode.gain.setTargetAtTime(nextMute ? 0 : volume, ctx.currentTime, 0.02);
      } else if (mediaElementRef.current) {
        mediaElementRef.current.muted = nextMute;
      }
      return nextMute;
    });
  }, [volume, mediaElementRef]);

  // Set Stereo Pan (-1.0 to 1.0)
  const setStereoPan = useCallback((panVal: number) => {
    const clamped = Math.max(-1, Math.min(1, panVal));
    setPanState(clamped);
    if (nodesRef.current && nodesRef.current.pannerNode && 'pan' in nodesRef.current.pannerNode) {
      nodesRef.current.pannerNode.pan.setTargetAtTime(clamped, nodesRef.current.audioCtx.currentTime, 0.05);
    }
  }, []);

  // Set Audio Delay in ms (-500ms to +2000ms)
  const setAudioDelay = useCallback((delayMs: number) => {
    setAudioDelayState(delayMs);
    if (!nodesRef.current) return;
    const seconds = Math.max(0, delayMs / 1000);
    nodesRef.current.delayNode.delayTime.setTargetAtTime(seconds, nodesRef.current.audioCtx.currentTime, 0.05);
  }, []);

  // Get Visualizer Analyser Node
  const getAnalyserNode = useCallback(() => {
    return nodesRef.current?.analyserNode || null;
  }, []);

  return {
    isAudioContextReady,
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
  };
}
