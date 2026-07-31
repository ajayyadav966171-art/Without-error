export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  albumArt: string;
  thumbnail?: string;
  duration: number; // in seconds
  audioUrl?: string; // synth audio or preview mp3
  synthType?: 'lofi' | 'ambient' | 'chillwave' | 'electronic' | 'acoustic' | 'jazz';
  lyrics?: LyricLine[];
  colorTheme?: string; // hex color for player dynamic background
  liked?: boolean;
  plays?: string;
  releaseYear?: number;
  genre?: string;
  telegramFileId?: string;
  telegramMediaUrl?: string;
  storageBackend?: string;
  isVideoSource?: boolean;
  fileSize?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
  author: string;
  followers?: string;
  isPinned?: boolean;
  isCustom?: boolean;
  color?: string;
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  monthlyListeners: string;
  verified: boolean;
  bio: string;
  popularTracks: Track[];
  albums: {
    id: string;
    title: string;
    year: number;
    coverUrl: string;
  }[];
}

export type TabType = 'home' | 'search' | 'library' | 'downloads' | 'profile' | 'dj';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  authMode: 'guest' | 'google' | 'email';
  isLoggedIn: boolean;
}

export interface AppSettings {
  themeMode: 'dark' | 'amoled';
  accentColor: 'emerald' | 'violet' | 'rose' | 'amber' | 'cyan' | 'gold';
  streamingQuality: '320' | '256' | '128';
  downloadQuality: '320' | '256';
  autoDownloadWifi: boolean;
  offlineMode: boolean;
  masterNotifications: boolean;
  newSongsAlert: boolean;
  downloadCompleteAlert: boolean;
  downloadFailedAlert: boolean;
  playlistUpdatesAlert: boolean;
  appUpdatesAlert: boolean;
}

export interface DownloadedTrack {
  track: Track;
  downloadedAt: string;
  fileSize: string;
  progress: number; // 0 to 100
  isCompleted: boolean;
}

export interface EqualizerPreset {
  name: string;
  bands: number[]; // 5 band gain values [-10 to +10 dB]
}

export type FilterChip = 'All' | 'Music' | 'Podcasts' | 'Audiobooks';

export interface ViewState {
  currentTab: TabType;
  activePlaylistId: string | null;
  activeArtistId: string | null;
  isPlayerExpanded: boolean;
  isQueueOpen: boolean;
  isLyricsOpen: boolean;
  isDevicePickerOpen: boolean;
  isOptionSheetOpen: boolean;
  selectedTrackForOption: Track | null;
  searchQuery: string;
  libraryFilter: 'All' | 'Playlists' | 'Artists' | 'Albums' | 'Downloaded';
  activeFilterChip: FilterChip;
  selectedDevice: string;
  phoneFrameMode: boolean; // toggle phone outer bezel vs full container
}
