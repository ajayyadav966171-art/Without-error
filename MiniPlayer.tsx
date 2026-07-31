import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart, Monitor } from 'lucide-react';
import { motion, PanInfo } from 'motion/react';
import { Track } from '../types';
import { audioEngine } from '../services/audioEngine';

interface MiniPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  onExpandPlayer: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onToggleLike: (trackId: string) => void;
  onOpenDevicePicker: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  onExpandPlayer,
  onNextTrack,
  onPrevTrack,
  onToggleLike,
  onOpenDevicePicker
}) => {
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const unsubscribe = audioEngine.subscribeTime((time, duration) => {
      if (duration > 0) {
        setProgressPercent((time / duration) * 100);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -60) {
      onNextTrack();
    } else if (info.offset.x > 60) {
      onPrevTrack();
    }
  };

  return (
    <div className="relative z-20 px-2.5 pb-1 w-full pointer-events-auto">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onClick={onExpandPlayer}
        className="group relative flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl cursor-pointer overflow-hidden transition-all active:scale-[0.99]"
      >
        {/* Dynamic top progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-zinc-800/80">
          <div
            className="h-full bg-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Track Thumbnail & Title Info */}
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="relative flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden shadow-sm bg-zinc-800">
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-[13px] font-semibold text-white truncate leading-tight">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] text-zinc-400 truncate leading-tight mt-0.5">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Output Device */}
          <button
            onClick={onOpenDevicePicker}
            className="p-1.5 text-zinc-400 hover:text-emerald-400 transition-colors"
            title="Connect to Device"
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Like Heart */}
          <button
            onClick={() => onToggleLike(currentTrack.id)}
            className="p-1.5 transition-transform active:scale-125"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                currentTrack.liked
                  ? 'fill-emerald-400 text-emerald-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={() => audioEngine.togglePlayPause()}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md ml-0.5"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
