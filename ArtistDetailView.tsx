import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Play, Shuffle, UserPlus, UserCheck, MoreVertical } from 'lucide-react';
import { Artist, Track } from '../types';

interface ArtistDetailViewProps {
  artist: Artist;
  onBack: () => void;
  onPlayTrack: (track: Track) => void;
  onOpenOptionSheet: (track: Track) => void;
}

export const ArtistDetailView: React.FC<ArtistDetailViewProps> = ({
  artist,
  onBack,
  onPlayTrack,
  onOpenOptionSheet
}) => {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-zinc-950 text-white">
      {/* Banner */}
      <div className="relative h-60 w-full overflow-hidden">
        <img
          src={artist.bannerUrl}
          alt={artist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/30" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Name & Listener Count */}
        <div className="absolute bottom-4 left-4 right-4 space-y-1">
          {artist.verified && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
              <CheckCircle2 className="w-4 h-4 fill-sky-400 text-black" />
              <span>Verified Artist</span>
            </div>
          )}
          <h1 className="text-3xl font-black tracking-tight text-white">
            {artist.name}
          </h1>
          <p className="text-xs font-medium text-zinc-300">
            {artist.monthlyListeners} monthly listeners
          </p>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isFollowing
                ? 'border border-zinc-700 bg-transparent text-white'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Follow</span>
              </>
            )}
          </button>

          <button className="p-2 text-zinc-400 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => artist.popularTracks[0] && onPlayTrack(artist.popularTracks[0])}
            className="p-2 text-zinc-300 hover:text-emerald-400"
          >
            <Shuffle className="w-6 h-6" />
          </button>
          <button
            onClick={() => artist.popularTracks[0] && onPlayTrack(artist.popularTracks[0])}
            className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
          >
            <Play className="w-6 h-6 fill-black ml-0.5" />
          </button>
        </div>
      </div>

      {/* Popular Songs */}
      <div className="px-4 py-3 space-y-3">
        <h2 className="text-base font-bold text-white tracking-tight">Popular</h2>
        <div className="space-y-1">
          {artist.popularTracks.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <span className="text-xs font-semibold text-zinc-500 w-4 text-center">
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
                    {track.plays} plays
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenOptionSheet(track);
                }}
                className="p-1 text-zinc-500 hover:text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Discography / Albums */}
      <div className="px-4 py-3 space-y-3">
        <h2 className="text-base font-bold text-white tracking-tight">Discography</h2>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          {artist.albums.map((album) => (
            <div key={album.id} className="w-32 flex-shrink-0 space-y-1">
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-32 h-32 rounded-lg object-cover shadow-md"
              />
              <h4 className="text-xs font-bold text-white truncate">{album.title}</h4>
              <p className="text-[10px] text-zinc-400">{album.year} • Album</p>
            </div>
          ))}
        </div>
      </div>

      {/* Artist Bio */}
      <div className="px-4 py-3 space-y-2">
        <h2 className="text-base font-bold text-white tracking-tight">About</h2>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-2">
          <p className="text-xs text-zinc-300 leading-relaxed">{artist.bio}</p>
        </div>
      </div>
    </div>
  );
};
