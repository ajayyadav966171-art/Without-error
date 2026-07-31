import React, { useState } from 'react';
import { ArrowLeft, Play, Shuffle, Heart, Download, MoreVertical, Search, Clock } from 'lucide-react';
import { Playlist, Track } from '../types';

interface PlaylistDetailViewProps {
  playlist: Playlist;
  onBack: () => void;
  onPlayTrack: (track: Track) => void;
  onPlayPlaylist: (playlist: Playlist, shuffle?: boolean) => void;
  onToggleLikeTrack: (trackId: string) => void;
  onOpenOptionSheet: (track: Track) => void;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlist,
  onBack,
  onPlayTrack,
  onPlayPlaylist,
  onToggleLikeTrack,
  onOpenOptionSheet
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [isDownloaded, setIsDownloaded] = useState(true);

  const displayedTracks = filterQuery.trim()
    ? playlist.tracks.filter(
        t =>
          t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(filterQuery.toLowerCase())
      )
    : playlist.tracks;

  const totalDurationSeconds = playlist.tracks.reduce((acc, t) => acc + t.duration, 0);
  const totalMins = Math.floor(totalDurationSeconds / 60);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-zinc-950 text-white">
      {/* Header Banner */}
      <div
        className="relative px-4 pt-4 pb-6 space-y-4 bg-gradient-to-b from-emerald-800/80 via-zinc-900 to-zinc-950"
        style={{
          background: playlist.color
            ? `linear-gradient(to bottom, rgba(16, 185, 129, 0.4), #09090b)`
            : undefined
        }}
      >
        {/* Top Back Row */}
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-black/20 text-white cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Cover & Meta */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-44 h-44 rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <img
              src={playlist.coverUrl}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {playlist.name}
            </h1>
            <p className="text-xs text-zinc-300 max-w-[280px]">
              {playlist.description}
            </p>
            <p className="text-[11px] font-semibold text-zinc-400 pt-1">
              {playlist.author} • {playlist.followers || '1.2M'} saves • {playlist.tracks.length} songs, {totalMins} min
            </p>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-zinc-300">
            <button
              onClick={() => setIsDownloaded(!isDownloaded)}
              className={`p-2 rounded-full ${
                isDownloaded ? 'text-emerald-400' : 'text-zinc-400'
              }`}
              title="Download Playlist"
            >
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 text-zinc-400 hover:text-white">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onPlayPlaylist(playlist, true)}
              className="p-2 text-zinc-300 hover:text-emerald-400 cursor-pointer"
              title="Shuffle Play"
            >
              <Shuffle className="w-6 h-6" />
            </button>
            <button
              onClick={() => onPlayPlaylist(playlist, false)}
              className="w-13 h-13 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform cursor-pointer"
            >
              <Play className="w-6 h-6 fill-black ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter / Search inside Playlist */}
      <div className="px-4 py-2 space-y-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Find in playlist..."
            className="w-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-white placeholder-zinc-500 pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Track Table List */}
        <div className="space-y-1">
          {displayedTracks.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track)}
              className="group flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <span className="text-xs font-semibold text-zinc-500 w-4 text-center flex-shrink-0">
                  {idx + 1}
                </span>
                <img
                  src={track.albumArt}
                  alt={track.title}
                  className="w-11 h-11 rounded-md object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {track.title}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onToggleLikeTrack(track.id)}
                  className="p-1"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      track.liked ? 'fill-emerald-400 text-emerald-400' : 'text-zinc-500 hover:text-white'
                    }`}
                  />
                </button>
                <button
                  onClick={() => onOpenOptionSheet(track)}
                  className="p-1 text-zinc-500 hover:text-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
