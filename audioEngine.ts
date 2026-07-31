import { Track } from '../types';
import { getAudioBlob } from './offlineStorage';

class AudioEngine {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private masterGain: GainNode | null = null;
  private mediaSourceConnected: boolean = false;
  private activeObjectUrl: string | null = null;

  private isPlaying: boolean = false;
  private currentTrack: Track | null = null;
  private currentTime: number = 0;
  private duration: number = 0;
  private volume: number = 0.8;
  private isOfflineMode: boolean = false;

  private synthInterval: any = null;
  private timeSubscribers: Array<(time: number, duration: number) => void> = [];
  private stateSubscribers: Array<(isPlaying: boolean) => void> = [];
  private trackSubscribers: Array<(track: Track | null) => void> = [];
  private messageSubscribers: Array<(msg: string) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  public setOfflineMode(offline: boolean) {
    this.isOfflineMode = offline;
  }

  private initAudioElement() {
    if (this.audioElement) return;
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement && !isNaN(this.audioElement.currentTime)) {
        this.currentTime = this.audioElement.currentTime;
        this.duration = this.audioElement.duration || this.duration;
        this.notifyTimeSubscribers(this.currentTime, this.duration);
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.notifyStateSubscribers(false);
      this.notifyTimeSubscribers(this.duration, this.duration);
    });

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.notifyStateSubscribers(true);
      this.updateMediaSessionState();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notifyStateSubscribers(false);
      this.updateMediaSessionState();
    });

    this.setupMediaSession();
  }

  private initAudioContext() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    this.audioCtx = new AudioContextClass();

    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 64;

    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = this.volume;

    const frequencies = [60, 230, 910, 3600, 14000];
    this.eqFilters = frequencies.map(freq => {
      const filter = this.audioCtx!.createBiquadFilter();
      filter.type = freq <= 230 ? 'lowshelf' : freq >= 3600 ? 'highshelf' : 'peaking';
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    for (let i = 0; i < this.eqFilters.length - 1; i++) {
      this.eqFilters[i].connect(this.eqFilters[i + 1]);
    }

    if (this.eqFilters.length > 0) {
      this.eqFilters[this.eqFilters.length - 1].connect(this.masterGain);
    }
    this.masterGain.connect(this.analyserNode);
    this.analyserNode.connect(this.audioCtx.destination);

    // Connect HTML5 Audio Element to Web Audio graph if possible
    if (this.audioElement && !this.mediaSourceConnected) {
      try {
        const source = this.audioCtx.createMediaElementSource(this.audioElement);
        if (this.eqFilters.length > 0) {
          source.connect(this.eqFilters[0]);
        } else {
          source.connect(this.masterGain);
        }
        this.mediaSourceConnected = true;
      } catch (err) {
        // Cross-origin fallback or re-use existing
      }
    }
  }

  private setupMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
    }
  }

  private updateMediaSessionState() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
    }
  }

  private updateMediaSessionMetadata(track: Track) {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: [
          { src: track.albumArt || track.thumbnail || '', sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    }
  }

  public setEQBands(bandGains: number[]) {
    if (!this.eqFilters || this.eqFilters.length === 0) return;
    bandGains.forEach((gain, index) => {
      if (this.eqFilters[index]) {
        this.eqFilters[index].gain.value = gain;
      }
    });
  }

  public async setTrack(track: Track, autoPlay: boolean = true) {
    this.currentTrack = track;
    this.currentTime = 0;
    this.duration = track.duration || 180;
    this.notifyTrackSubscribers(track);
    this.notifyTimeSubscribers(0, this.duration);
    this.updateMediaSessionMetadata(track);

    // Revoke previous blob URL if exists
    if (this.activeObjectUrl) {
      URL.revokeObjectURL(this.activeObjectUrl);
      this.activeObjectUrl = null;
    }

    // Check IndexedDB for offline downloaded blob first
    let localBlob: Blob | undefined;
    try {
      localBlob = await getAudioBlob(track.id);
    } catch (err) {
      console.warn('Could not query IndexedDB for downloaded track:', err);
    }

    const isDeviceOffline = typeof navigator !== 'undefined' && (!navigator.onLine || this.isOfflineMode);

    if (localBlob) {
      // Offline file is stored in IndexedDB! Play from local Blob
      this.activeObjectUrl = URL.createObjectURL(localBlob);
      if (this.audioElement) {
        this.audioElement.src = this.activeObjectUrl;
        this.audioElement.load();
      }
      this.notifyMessageSubscribers(`Playing "${track.title}" from offline storage (IndexedDB).`);
    } else if (isDeviceOffline) {
      // Device is offline and track is NOT downloaded!
      if (this.audioElement) {
        this.audioElement.src = '';
      }
      this.pause();
      this.notifyMessageSubscribers(`Device is offline. Internet connection required to stream "${track.title}".`);
      return;
    } else {
      // Online streaming from Telegram Backend Proxy
      const streamUrl = track.telegramFileId || track.id.startsWith('tg_')
        ? `/api/telegram/stream/${track.id}`
        : (track.audioUrl || `/api/telegram/stream/${track.id}`);

      if (this.audioElement) {
        this.audioElement.src = streamUrl;
        this.audioElement.load();
      }
    }

    if (autoPlay) {
      this.play();
    } else {
      this.pause();
    }
  }

  public play() {
    this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.synthInterval) clearInterval(this.synthInterval);

    if (this.audioElement && this.audioElement.src) {
      this.audioElement.play().catch(() => {
        // Fallback to synth audio generator if audio file loading fails
        this.startSynthFallback();
      });
    } else {
      this.startSynthFallback();
    }

    this.isPlaying = true;
    this.notifyStateSubscribers(true);
  }

  private startSynthFallback() {
    this.playToneForTrack();
    this.synthInterval = setInterval(() => {
      if (!this.isPlaying) return;
      this.currentTime += 1;

      if (this.currentTime % 4 === 0) {
        this.playToneForTrack();
      }

      if (this.currentTime >= this.duration) {
        this.currentTime = 0;
        this.notifyTimeSubscribers(this.duration, this.duration);
      } else {
        this.notifyTimeSubscribers(this.currentTime, this.duration);
      }
    }, 1000);
  }

  private playToneForTrack() {
    if (!this.audioCtx || !this.masterGain) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const toneGain = this.audioCtx.createGain();

      const synthType = this.currentTrack?.synthType || 'lofi';
      let baseFreq = 220;
      if (synthType === 'electronic') baseFreq = 110 + (this.currentTime % 8) * 20;
      else if (synthType === 'lofi') baseFreq = 146.83 + (this.currentTime % 6) * 15;
      else baseFreq = 174.61 + (this.currentTime % 7) * 18;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);

      toneGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      toneGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.8);

      if (this.eqFilters.length > 0) {
        osc.connect(toneGain);
        toneGain.connect(this.eqFilters[0]);
      } else {
        osc.connect(toneGain);
        toneGain.connect(this.masterGain);
      }

      osc.start();
      osc.stop(this.audioCtx.currentTime + 1.8);
    } catch (e) {
      // Ignore
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.notifyStateSubscribers(false);
  }

  public togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.audioElement && !isNaN(this.audioElement.duration)) {
      this.audioElement.currentTime = this.currentTime;
    }
    this.notifyTimeSubscribers(this.currentTime, this.duration);
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array(32);
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public subscribeTime(cb: (time: number, duration: number) => void) {
    this.timeSubscribers.push(cb);
    return () => {
      this.timeSubscribers = this.timeSubscribers.filter(s => s !== cb);
    };
  }

  public subscribeState(cb: (isPlaying: boolean) => void) {
    this.stateSubscribers.push(cb);
    return () => {
      this.stateSubscribers = this.stateSubscribers.filter(s => s !== cb);
    };
  }

  public subscribeTrack(cb: (track: Track | null) => void) {
    this.trackSubscribers.push(cb);
    return () => {
      this.trackSubscribers = this.trackSubscribers.filter(s => s !== cb);
    };
  }

  public subscribeMessage(cb: (msg: string) => void) {
    this.messageSubscribers.push(cb);
    return () => {
      this.messageSubscribers = this.messageSubscribers.filter(s => s !== cb);
    };
  }

  private notifyTimeSubscribers(t: number, d: number) {
    this.timeSubscribers.forEach(cb => cb(t, d));
  }

  private notifyStateSubscribers(state: boolean) {
    this.stateSubscribers.forEach(cb => cb(state));
  }

  private notifyTrackSubscribers(t: Track | null) {
    this.trackSubscribers.forEach(cb => cb(t));
  }

  private notifyMessageSubscribers(msg: string) {
    this.messageSubscribers.forEach(cb => cb(msg));
  }

  public getCurrentTrack() { return this.currentTrack; }
  public getIsPlaying() { return this.isPlaying; }
  public getCurrentTime() { return this.currentTime; }
  public getDuration() { return this.duration; }
}

export const audioEngine = new AudioEngine();
