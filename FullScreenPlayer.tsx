import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  MoreVertical,
  Heart,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Mic2,
  ListMusic,
  Monitor,
  Share2,
  Sliders,
  Check
} from 'lucide-react';
import { motion, PanInfo } from 'motion/react';
import { Track } from '../types';
import { audioEngine } from '../services/audioEngine';

interface FullScreenPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  onCollapse: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onToggleLike: (trackId: string) => void;
  onOpenDevicePicker: () => void;
  onOpenOptionSheet: (track: Track) => void;
  onOpenQueue: () => void;
  onOpenEqualizer: () => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: 'off' | 'all' | 'one';
  onToggleRepeat: () => void;
  selectedDevice: string;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  currentTrack,
  isPlaying,
  onCollapse,
  onNextTrack,
  onPrevTrack,
  onToggleLike,
  onOpenDevicePicker,
  onOpenOptionSheet,
  onOpenQueue,
  onOpenEqualizer,
  isShuffle,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  selectedDevice
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentTrack.duration);
  const [isLyricsMode, setIsLyricsMode] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    setCurrentTime(audioEngine.getCurrentTime());
    setDuration(currentTrack.duration);

    const unsubscribe = audioEngine.subscribeTime((t, d) => {
      setCurrentTime(t);
      if (d > 0) setDuration(d);
    });
    return () => unsubscribe();
  }, [currentTrack]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    audioEngine.seek(newTime);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Swipe down gesture to minimize
    if (info.offset.y > 100) {
      onCollapse();
    }
  };

  const handleAlbumArtSwipe = (_: any, info: PanInfo) => {
    if (info.offset.x < -60) {
      onNextTrack();
    } else if (info.offset.x > 60) {
      onPrevTrack();
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(`Listening to ${currentTrack.title} by ${currentTrack.artist} on Spotify Mobile!`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const currentLyricIndex = currentTrack.lyrics?.findLastIndex(l => currentTime >= l.time) ?? 0;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.8 }}
      onDragEnd={handleDragEnd}
      style={{
        background: `linear-gradient(to bottom, ${currentTrack.colorTheme || '#3f3f46'} 0%, #121212 60%, #09090b 100%)`
      }}
      className="fixed inset-0 z-50 flex flex-col justify-between px-6 pt-10 pb-6 text-white overflow-hidden backdrop-blur-3xl"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between text-zinc-300">
        <button
          onClick={onCollapse}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
        >
          <ChevronDown className="w-7 h-7 text-white" />
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-300/80">
            Playing from Playlist
          </span>
          <span className="text-xs font-semibold text-white truncate max-w-[180px]">
            {currentTrack.album}
          </span>
        </div>

        <button
          onClick={() => onOpenOptionSheet(currentTrack)}
          className="p-2 -mr-2 rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
        >
          <MoreVertical className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Center Area: Album Art / Lyrics View Toggle */}
      {!isLyricsMode ? (
        <div className="my-auto py-2 flex flex-col items-center justify-center">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleAlbumArtSwipe}
            className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group cursor-grab active:cursor-grabbing"
          >
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.title}
              className="w-full h-full object-cover transition-transform duration-700 select-none"
            />
            {/* Ambient inner shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>
      ) : (
        /* Lyrics Screen */
        <div className="my-auto h-[320px] w-full flex flex-col overflow-y-auto no-scrollbar space-y-6 px-2 py-4">
          <div className="text-xs uppercase tracking-widest font-bold text-emerald-400 mb-2 flex items-center justify-between">
            <span>Live Synced Lyrics</span>
            <Mic2 className="w-4 h-4" />
          </div>

          {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
            currentTrack.lyrics.map((line, idx) => {
              const isCurrent = idx === currentLyricIndex;
              return (
                <button
                  key={idx}
                  onClick={() => audioEngine.seek(line.time)}
                  className={`text-left text-xl font-bold transition-all duration-300 leading-relaxed cursor-pointer ${
                    isCurrent
                      ? 'text-white scale-105 opacity-100'
                      : 'text-zinc-400 opacity-50 hover:opacity-80'
                  }`}
                >
                  {line.text}
                </button>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-400 text-sm italic">
              Lyrics unavailable for this track
            </div>
          )}
        </div>
      )}

      {/* Track Info & Action Header */}
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h2 className="text-2xl font-bold tracking-tight text-white truncate">
              {currentTrack.title}
            </h2>
            <p className="text-base text-zinc-300/90 font-medium truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-zinc-300 hover:text-white transition-colors relative"
            >
              {copiedShare ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => onToggleLike(currentTrack.id)}
              className="p-2 transition-transform active:scale-125"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  currentTrack.liked
                    ? 'fill-emerald-400 text-emerald-400'
                    : 'text-zinc-300 hover:text-white'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Scrubbing Slider Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full h-1 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer focus:outline-none"
          />
          <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls Row */}
        <div className="flex items-center justify-between py-2">
          {/* Shuffle */}
          <button
            onClick={onToggleShuffle}
            className={`p-2 transition-colors ${
              isShuffle ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous Track */}
          <button
            onClick={onPrevTrack}
            className="p-3 text-white hover:text-emerald-400 active:scale-90 transition-all cursor-pointer"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          {/* Play / Pause Large Center Button */}
          <button
            onClick={() => audioEngine.togglePlayPause()}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black ml-1" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={onNextTrack}
            className="p-3 text-white hover:text-emerald-400 active:scale-90 transition-all cursor-pointer"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          {/* Repeat Mode */}
          <button
            onClick={onToggleRepeat}
            className={`p-2 transition-colors ${
              repeatMode !== 'off' ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Utility Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-medium text-zinc-300">
          {/* Output Device */}
          <button
            onClick={onOpenDevicePicker}
            className="flex items-center gap-1.5 text-emerald-400 hover:underline cursor-pointer"
          >
            <Monitor className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{selectedDevice}</span>
          </button>

          {/* Utilities: Equalizer, Lyrics Toggle, Queue */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenEqualizer}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Audio Equalizer"
            >
              <Sliders className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsLyricsMode(!isLyricsMode)}
              className={`p-1.5 transition-colors ${
                isLyricsMode ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
              }`}
              title="Lyrics"
            >
              <Mic2 className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenQueue}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Up Next Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
