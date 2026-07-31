import React, { useState } from 'react';
import { Search, X, Camera, Mic, Play, TrendingUp, History, Volume2 } from 'lucide-react';
import { Track, Playlist, Artist } from '../types';
import { GENRES } from '../data/musicData';

interface SearchScreenProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tracks: Track[];
  playlists: Playlist[];
  artists: Artist[];
  onPlayTrack: (track: Track) => void;
  onSelectPlaylist: (playlistId: string) => void;
  onSelectArtist: (artistId: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  searchQuery,
  onSearchChange,
  tracks,
  playlists,
  artists,
  onPlayTrack,
  onSelectPlaylist,
  onSelectArtist
}) => {
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [voiceText, setVoiceText] = useState('Listening to your voice...');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Aetheria', 'Synthwave', 'Midnight Resonance', 'Telegram Vault'
  ]);

  const trendingSearches = [
    'Subtle Horizons', 'Neon Skyline', 'Telegram Audio Extracted', 'Lofi Study'
  ];

  const handleVoiceSearchStart = () => {
    setIsVoiceSearchOpen(true);
    setVoiceText('Listening for song title or artist...');
    
    // Simulate voice recognition result after 2 seconds
    setTimeout(() => {
      const sample = 'Midnight Resonance';
      setVoiceText(`Detected: "${sample}"`);
      setTimeout(() => {
        onSearchChange(sample);
        setIsVoiceSearchOpen(false);
      }, 1000);
    }, 2200);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
  };

  const filteredTracks = searchQuery.trim()
    ? tracks.filter(
        t =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.album.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredArtists = searchQuery.trim()
    ? artists.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredPlaylists = searchQuery.trim()
    ? playlists.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const topTrack = filteredTracks[0];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-28 space-y-5 bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <button 
          onClick={handleVoiceSearchStart}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <Mic className="w-4 h-4" />
          <span>Voice Search</span>
        </button>
      </div>

      {/* Material 3 Search Bar Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search songs, artists, albums or Telegram files..."
          className="w-full bg-zinc-900 border border-white/10 text-white placeholder-zinc-400 text-sm font-medium pl-11 pr-10 py-3 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors shadow-lg"
        />
        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 p-1 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={handleVoiceSearchStart}
            className="absolute right-3 p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recent & Trending Searches if search query is empty */}
      {!searchQuery.trim() && (
        <div className="space-y-4">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> Recent Searches
                </span>
                <button 
                  onClick={handleClearRecent}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => onSearchChange(s)}
                    className="px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/5 hover:border-emerald-500/30 text-xs font-medium text-zinc-300 hover:text-white transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Trending Hits
            </span>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => onSearchChange(s)}
                  className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-medium text-emerald-300 transition-all"
                >
                  🔥 {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Render Genre Browse Grid if search is empty */}
      {!searchQuery.trim() ? (
        <div className="space-y-4 pt-1">
          <h2 className="text-base font-bold tracking-tight text-white">
            Explore your genres
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {GENRES.map((genre) => (
              <div
                key={genre.id}
                onClick={() => onSearchChange(genre.name)}
                className={`relative h-24 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between cursor-pointer ${genre.color} shadow-md hover:scale-[1.02] transition-transform border border-white/10`}
              >
                <span className="text-sm font-bold text-white z-10 leading-tight">
                  {genre.name}
                </span>
                <img
                  src={genre.image}
                  alt={genre.name}
                  className="absolute bottom-[-10px] right-[-10px] w-16 h-16 object-cover rounded-md transform rotate-[25deg] shadow-lg opacity-90"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Render Search Results */
        <div className="space-y-6 pt-2">
          {/* Top Result Card */}
          {topTrack && (
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                Top Result
              </h2>
              <div
                onClick={() => onPlayTrack(topTrack)}
                className="group relative p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between cursor-pointer hover:bg-zinc-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={topTrack.albumArt}
                    alt={topTrack.title}
                    className="w-16 h-16 rounded-lg object-cover shadow-md"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {topTrack.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Song • {topTrack.artist}
                    </p>
                  </div>
                </div>

                <button className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
                  <Play className="w-6 h-6 fill-black ml-0.5" />
                </button>
              </div>
            </div>
          )}

          {/* Songs List */}
          {filteredTracks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                Songs
              </h2>
              <div className="space-y-1">
                {filteredTracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => onPlayTrack(track)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artists List */}
          {filteredArtists.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                Artists
              </h2>
              <div className="space-y-2">
                {filteredArtists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => onSelectArtist(artist.id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {artist.name}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">Artist</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Playlists List */}
          {filteredPlaylists.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                Playlists
              </h2>
              <div className="space-y-2">
                {filteredPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => onSelectPlaylist(pl.id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <img
                      src={pl.coverUrl}
                      alt={pl.name}
                      className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {pl.name}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Playlist • {pl.author}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredTracks.length === 0 &&
            filteredArtists.length === 0 &&
            filteredPlaylists.length === 0 && (
              <div className="py-12 text-center text-zinc-400">
                <p className="text-base font-semibold">No results found</p>
                <p className="text-xs mt-1">
                  Check spelling or try searching for another song, artist, or playlist.
                </p>
              </div>
            )}
        </div>
      )}

      {/* Voice Search Modal */}
      {isVoiceSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <button
            onClick={() => setIsVoiceSearchOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative mb-8">
            {/* Animated Pulse Waves */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping scale-150" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-black flex items-center justify-center shadow-2xl">
              <Mic className="w-10 h-10 stroke-[2.5]" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{voiceText}</h3>
          <p className="text-xs text-zinc-400 max-w-xs mb-6">
            Say a song name, artist, album or Telegram file title clearly...
          </p>

          <div className="flex items-center gap-1 h-8">
            <span className="w-1 bg-emerald-400 h-4 rounded-full animate-pulse" />
            <span className="w-1 bg-emerald-400 h-8 rounded-full animate-pulse delay-100" />
            <span className="w-1 bg-emerald-400 h-6 rounded-full animate-pulse delay-200" />
            <span className="w-1 bg-emerald-400 h-10 rounded-full animate-pulse delay-300" />
            <span className="w-1 bg-emerald-400 h-5 rounded-full animate-pulse delay-150" />
          </div>
        </div>
      )}
    </div>
  );
};
