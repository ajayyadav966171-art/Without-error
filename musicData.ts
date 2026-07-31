import { Track, Playlist, Artist, EqualizerPreset } from '../types';

export const TRACKS: Track[] = [];

export const PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'Liked Songs',
    description: 'All your saved favorite tracks from Telegram in one spot.',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    author: 'You',
    tracks: [],
    followers: '1',
    isPinned: true,
    color: 'from-emerald-800 to-zinc-950'
  },
  {
    id: 'p2',
    name: 'Telegram Channel Vault',
    description: 'Tracks streamed dynamically from your private Telegram channel.',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
    author: 'Telegram Private Channel',
    tracks: [],
    followers: '1',
    isPinned: true,
    color: 'from-purple-900 to-zinc-950'
  }
];

export const ARTISTS: Artist[] = [
  {
    id: 'a1',
    name: 'Telegram Storage Backend',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&auto=format&fit=crop&q=80',
    monthlyListeners: 'Cloud Stored',
    verified: true,
    bio: 'Audio and video media files synced dynamically from your private Telegram Channel backend.',
    popularTracks: [],
    albums: []
  }
];

export const GENRES = [
  { id: 'g1', name: 'Pop', color: 'bg-pink-600', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80' },
  { id: 'g2', name: 'Hip-Hop', color: 'bg-orange-600', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80' },
  { id: 'g3', name: 'Synthwave', color: 'bg-purple-600', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80' },
  { id: 'g4', name: 'Chill & Lofi', color: 'bg-amber-600', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=80' },
  { id: 'g5', name: 'EDM & Dance', color: 'bg-rose-600', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80' },
  { id: 'g6', name: 'Indie Folk', color: 'bg-emerald-600', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80' },
  { id: 'g7', name: 'Jazz', color: 'bg-indigo-600', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80' },
  { id: 'g8', name: 'Ambient & Focus', color: 'bg-cyan-600', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80' }
];

export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  { name: 'Flat', bands: [0, 0, 0, 0, 0] },
  { name: 'Bass Boost', bands: [7, 5, 1, 0, 0] },
  { name: 'Vocal Vocalist', bands: [-2, 2, 6, 4, 1] },
  { name: 'Electronic', bands: [5, 3, 0, 3, 6] },
  { name: 'Rock', bands: [4, 2, -1, 3, 5] },
  { name: 'Acoustic', bands: [2, 1, 3, 4, 2] }
];
