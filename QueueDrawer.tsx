import React from 'react';
import { motion } from 'motion/react';
import { X, Play, Music } from 'lucide-react';
import { Track } from '../types';

interface QueueDrawerProps {
  currentTrack: Track;
  queue: Track[];
  onClose: () => void;
  onSelectTrack: (track: Track) => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  currentTrack,
  queue,
  onClose,
  onSelectTrack
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-[440px] bg-zinc-900 rounded-t-3xl border-t border-zinc-800 p-5 space-y-4 text-white max-h-[80vh] overflow-y-auto no-scrollbar shadow-2xl"
      >
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto" />

        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-white">Play Queue</h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Now Playing */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Now Playing
          </h4>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h5 className="text-sm font-bold text-white truncate">{currentTrack.title}</h5>
              <p className="text-xs text-zinc-300 truncate mt-0.5">{currentTrack.artist}</p>
            </div>
          </div>
        </div>

        {/* Up Next List */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Next In Queue
          </h4>
          <div className="space-y-1">
            {queue.map((track) => (
              <div
                key={track.id}
                onClick={() => {
                  onSelectTrack(track);
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={track.albumArt}
                    alt={track.title}
                    className="w-11 h-11 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-sm font-semibold text-white truncate">{track.title}</h5>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>
                <Play className="w-4 h-4 text-zinc-500 group-hover:text-white" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
