import React, { useState } from 'react';
import { Play, Sparkles, Video, MoreVertical, Heart, History, ListMusic } from 'lucide-react';
import { Track, Playlist, Artist, FilterChip, UserProfile } from '../types';

interface HomeScreenProps {
  tracks: Track[];
  playlists: Playlist[];
  artists: Artist[];
  userProfile: UserProfile;
  activeFilterChip: FilterChip;
  onSelectFilterChip: (chip: FilterChip) => void;
  onPlayTrack: (track: Track) => void;
  onSelectPlaylist: (playlistId: string) => void;
  onSelectArtist: (artistId: string) => void;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  tracks,
  playlists,
  artists,
  userProfile,
  activeFilterChip,
  onSelectFilterChip,
  onPlayTrack,
  onSelectPlaylist,
  onSelectArtist,
  onOpenProfile
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return `Good Morning, ${userProfile.name}`;
    if (hour >= 12 && hour < 17) return `Good Afternoon, ${userProfile.name}`;
    if (hour >= 17 && hour < 22) return `Good Evening, ${userProfile.name}`;
    return `Good Night, ${userProfile.name}`;
  };

  const recentItems = playlists.slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-28 space-y-6 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
      {/* Top Header - Spotify Premium & Native Android Minimal Style */}
      <div className="flex items-center justify-between">
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-zinc-800 shadow-md group-hover:scale-105 transition-transform shrink-0">
            <img
              src={userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              {getGreeting()}
            </h1>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer transition-colors"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 text-xs text-white backdrop-blur-xl animate-fade-in">
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenProfile();
                }}
                className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center gap-2"
              >
                Profile & Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Material 3 Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {(['All', 'Music', 'Podcasts', 'Audiobooks'] as FilterChip[]).map((chip) => {
          const isActive = activeFilterChip === chip;
          return (
            <button
              key={chip}
              onClick={() => onSelectFilterChip(chip)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-black shadow-md scale-105'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* 2x3 Grid of Recent Playlists */}
      <div className="grid grid-cols-2 gap-2.5">
        {recentItems.map((pl) => (
          <div
            key={pl.id}
            onClick={() => onSelectPlaylist(pl.id)}
            className="group flex items-center bg-zinc-900/80 hover:bg-zinc-800/80 rounded-md overflow-hidden transition-all duration-200 cursor-pointer border border-zinc-800/40 shadow-sm"
          >
            <img
              src={pl.coverUrl}
              alt={pl.name}
              className="w-14 h-14 object-cover flex-shrink-0"
            />
            <span className="text-xs font-bold text-white px-2.5 line-clamp-2 leading-snug">
              {pl.name}
            </span>
          </div>
        ))}
      </div>

      {/* Made For You Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Made For You
          </h2>
          <span className="text-xs font-medium text-zinc-400 hover:text-white cursor-pointer">
            Show all
          </span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className="group flex-shrink-0 w-36 flex flex-col space-y-2 cursor-pointer"
            >
              <div className="relative w-36 h-36 rounded-lg overflow-hidden bg-zinc-800 shadow-md">
                <img
                  src={pl.coverUrl}
                  alt={pl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </button>
              </div>
              <h3 className="text-xs font-semibold text-white truncate">
                {pl.name}
              </h3>
              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-snug">
                {pl.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trending / Heavy Rotation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Your Heavy Rotation
          </h2>
          <span className="text-xs font-medium text-zinc-400 hover:text-white cursor-pointer">
            See all
          </span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          {tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track)}
              className="group flex-shrink-0 w-32 flex flex-col space-y-2 cursor-pointer"
            >
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-zinc-800 shadow-md">
                <img
                  src={track.albumArt}
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-xl">
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </div>
                </div>
              </div>
              <h3 className="text-xs font-semibold text-white truncate">
                {track.title}
              </h3>
              <p className="text-[11px] text-zinc-400 truncate">
                {track.artist}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Artists */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Popular Artists
        </h2>
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          {artists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => onSelectArtist(artist.id)}
              className="flex-shrink-0 w-28 flex flex-col items-center space-y-2 cursor-pointer group"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden bg-zinc-800 shadow-md border-2 border-transparent group-hover:border-emerald-500 transition-all">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-semibold text-white truncate text-center w-full">
                {artist.name}
              </span>
              <span className="text-[10px] text-zinc-400">Artist</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
