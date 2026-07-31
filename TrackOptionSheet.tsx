import React from 'react';
import { motion } from 'motion/react';
import { Heart, PlusCircle, Share2, Disc, User, Radio, Download, X } from 'lucide-react';
import { Track } from '../types';

interface TrackOptionSheetProps {
  track: Track;
  onClose: () => void;
  onToggleLike: (trackId: string) => void;
  onSelectArtist?: (artistId: string) => void;
  onDownloadTrack?: (track: Track) => void;
}

export const TrackOptionSheet: React.FC<TrackOptionSheetProps> = ({
  track,
  onClose,
  onToggleLike,
  onSelectArtist,
  onDownloadTrack
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-[440px] bg-zinc-900 rounded-t-3xl border-t border-zinc-800 p-5 space-y-5 text-white max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl"
      >
        {/* Top Drag Pill */}
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto" />

        {/* Track Thumbnail Header */}
        <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
          <img
            src={track.albumArt}
            alt={track.title}
            className="w-14 h-14 rounded-lg object-cover shadow-md"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white truncate">{track.title}</h3>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">{track.artist} • {track.album}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option Actions List */}
        <div className="space-y-1">
          <button
            onClick={() => {
              onToggleLike(track.id);
              onClose();
            }}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-left"
          >
            <Heart
              className={`w-5 h-5 ${
                track.liked ? 'fill-emerald-400 text-emerald-400' : 'text-zinc-300'
              }`}
            />
            <span className="text-sm font-semibold">
              {track.liked ? 'Remove from Liked Songs' : 'Like'}
            </span>
          </button>

          <button
            onClick={onClose}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-left"
          >
            <PlusCircle className="w-5 h-5 text-zinc-300" />
            <span className="text-sm font-semibold">Add to Playlist</span>
          </button>

          <button
            onClick={() => {
              if (track.artistId && onSelectArtist) {
                onSelectArtist(track.artistId);
              }
              onClose();
            }}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-left"
          >
            <User className="w-5 h-5 text-zinc-300" />
            <span className="text-sm font-semibold">View Artist Profile</span>
          </button>

          <button
            onClick={onClose}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-left"
          >
            <Radio className="w-5 h-5 text-zinc-300" />
            <span className="text-sm font-semibold">Go to Track Radio</span>
          </button>

          <button
            onClick={() => {
              if (onDownloadTrack) {
                onDownloadTrack(track);
              }
              onClose();
            }}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-left"
          >
            <Download className="w-5 h-5 text-zinc-300" />
            <span className="text-sm font-semibold">Download for Offline</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText?.(`Check out ${track.title} by ${track.artist}!`);
              onClose();
            }}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-left"
          >
            <Share2 className="w-5 h-5 text-zinc-300" />
            <span className="text-sm font-semibold">Share Track</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
