import React, { useState } from 'react';
import { Plus, Search, Grid, List, Pin, Heart, ArrowUpDown, Music } from 'lucide-react';
import { Playlist, Artist, Track } from '../types';

interface LibraryScreenProps {
  playlists: Playlist[];
  artists: Artist[];
  tracks: Track[];
  onSelectPlaylist: (playlistId: string) => void;
  onSelectArtist: (artistId: string) => void;
  onCreatePlaylist: (name: string) => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  playlists,
  artists,
  tracks,
  onSelectPlaylist,
  onSelectArtist,
  onCreatePlaylist
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Songs' | 'Playlists' | 'Artists' | 'Albums' | 'Favorites' | 'Recently Played' | 'Folders'>('All');
  const [isGridView, setIsGridView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setIsModalOpen(false);
  };

  const likedTracksCount = tracks.filter(t => t.liked).length;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-28 space-y-4 bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Your Library</h1>

        <div className="flex items-center gap-3 text-zinc-300">
          <button className="p-1.5 hover:text-white cursor-pointer">
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 hover:text-white cursor-pointer"
            title="Create Playlist"
          >
            <Plus className="w-6 h-6 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {(['All', 'Songs', 'Playlists', 'Artists', 'Albums', 'Favorites', 'Recently Played', 'Folders'] as const).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-black font-bold scale-105 shadow-md'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-white/5'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Sorting & Layout Toggle Bar */}
      <div className="flex items-center justify-between text-xs font-medium text-zinc-400 py-1 border-b border-zinc-800/60">
        <div className="flex items-center gap-1 hover:text-white cursor-pointer">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Recents</span>
        </div>

        <button
          onClick={() => setIsGridView(!isGridView)}
          className="p-1 hover:text-white cursor-pointer"
        >
          {isGridView ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
        </button>
      </div>

      {/* Content List / Grid */}
      <div className={isGridView ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
        {/* Pinned Liked Songs Item */}
        {(activeFilter === 'All' || activeFilter === 'Playlists') && (
          <div
            onClick={() => onSelectPlaylist('p1')}
            className={`group cursor-pointer rounded-lg bg-zinc-900/50 hover:bg-zinc-900 p-2 transition-colors ${
              isGridView ? 'flex flex-col items-center text-center p-3' : 'flex items-center gap-3'
            }`}
          >
            <div className="relative w-14 h-14 rounded-md bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <Pin className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                <h3 className="text-sm font-bold text-white truncate">Liked Songs</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Playlist • {likedTracksCount} songs
              </p>
            </div>
          </div>
        )}

        {/* Playlists */}
        {(activeFilter === 'All' || activeFilter === 'Playlists') &&
          playlists
            .filter(p => p.id !== 'p1')
            .map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectPlaylist(p.id)}
                className={`group cursor-pointer rounded-lg hover:bg-zinc-900 p-2 transition-colors ${
                  isGridView ? 'flex flex-col items-center text-center p-3 bg-zinc-900/40' : 'flex items-center gap-3'
                }`}
              >
                <img
                  src={p.coverUrl}
                  alt={p.name}
                  className="w-14 h-14 rounded-md object-cover flex-shrink-0 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate">{p.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Playlist • {p.author}
                  </p>
                </div>
              </div>
            ))}

        {/* Artists */}
        {(activeFilter === 'All' || activeFilter === 'Artists') &&
          artists.map((a) => (
            <div
              key={a.id}
              onClick={() => onSelectArtist(a.id)}
              className={`group cursor-pointer rounded-lg hover:bg-zinc-900 p-2 transition-colors ${
                isGridView ? 'flex flex-col items-center text-center p-3 bg-zinc-900/40' : 'flex items-center gap-3'
              }`}
            >
              <img
                src={a.avatarUrl}
                alt={a.name}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0 shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white truncate">{a.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Artist</p>
              </div>
            </div>
          ))}
      </div>

      {/* Create Playlist Modal Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Give your playlist a name</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="My Playlist #1"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-center text-base font-semibold py-2.5 px-3 rounded-xl focus:outline-none focus:border-emerald-500"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
