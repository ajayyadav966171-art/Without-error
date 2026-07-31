import React, { useState, useEffect } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { BottomNav } from './components/BottomNav';
import { MiniPlayer } from './components/MiniPlayer';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { HomeScreen } from './components/HomeScreen';
import { SearchScreen } from './components/SearchScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { DownloadsScreen } from './components/DownloadsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { RadioDjScreen } from './components/RadioDjScreen';
import { TelegramStorageScreen } from './components/TelegramStorageScreen';
import { PlaylistDetailView } from './components/PlaylistDetailView';
import { ArtistDetailView } from './components/ArtistDetailView';
import { TrackOptionSheet } from './components/TrackOptionSheet';
import { DevicePickerSheet } from './components/DevicePickerSheet';
import { QueueDrawer } from './components/QueueDrawer';

import { TRACKS, PLAYLISTS, ARTISTS } from './data/musicData';
import { Track, Playlist, Artist, TabType, FilterChip, UserProfile, AppSettings, DownloadedTrack } from './types';
import { audioEngine } from './services/audioEngine';
import {
  getAllDownloadedTracks,
  deleteDownloadedTrack,
  clearAllDownloads,
  downloadTrackWithProgress
} from './services/offlineStorage';

export default function App() {
  // App Data State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>(PLAYLISTS);
  const [artists] = useState<Artist[]>(ARTISTS);

  // User & Settings State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr_ajay_1',
    name: 'Ajay',
    email: 'ajayyadav966171@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    authMode: 'guest',
    isLoggedIn: false
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    themeMode: 'amoled',
    accentColor: 'emerald',
    streamingQuality: '320',
    downloadQuality: '320',
    autoDownloadWifi: true,
    offlineMode: false,
    masterNotifications: true,
    newSongsAlert: true,
    downloadCompleteAlert: true,
    downloadFailedAlert: true,
    playlistUpdatesAlert: true,
    appUpdatesAlert: true
  });

  // Toast Notification Message State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  // Synchronize audioEngine offline mode setting
  useEffect(() => {
    audioEngine.setOfflineMode(appSettings.offlineMode);
  }, [appSettings.offlineMode]);

  // Subscribe to audio engine messages (e.g. offline warnings)
  useEffect(() => {
    const unsub = audioEngine.subscribeMessage((msg) => {
      showToast(msg);
    });
    return () => unsub();
  }, []);

  // Hydrate Downloads State from IndexedDB on Mount
  const [downloadedTracks, setDownloadedTracks] = useState<DownloadedTrack[]>([]);

  useEffect(() => {
    getAllDownloadedTracks()
      .then(items => {
        if (items) setDownloadedTracks(items);
      })
      .catch(err => console.error('Failed to load IndexedDB downloaded tracks:', err));
  }, []);

  // Loading & Error State for Telegram Backend API
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch Telegram Backend Tracks & Auto-Sync on Mount
  useEffect(() => {
    let isMounted = true;

    const fetchTelegramTracks = () => {
      fetch('/api/telegram/sync')
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: API Server error`);
          }
          return res.json();
        })
        .then(data => {
          if (!isMounted) return;
          setIsInitialLoading(false);

          if (data.error) {
            setApiError(data.error);
          } else {
            setApiError(null);
          }

          if (data.tracks && Array.isArray(data.tracks)) {
            const formattedTelegramTracks: Track[] = data.tracks.map((t: any) => ({
              id: t.id,
              title: t.title,
              artist: t.artist,
              album: t.album || 'Telegram Private Channel',
              albumArt: t.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
              duration: t.duration || 200,
              telegramFileId: t.telegramFileId,
              telegramMediaUrl: t.telegramMediaUrl,
              storageBackend: 'Telegram Private Channel',
              isVideoSource: Boolean(t.isVideoSource),
              liked: Boolean(t.liked)
            }));

            setTracks(formattedTelegramTracks);
            if (formattedTelegramTracks.length > 0) {
              setCurrentTrack(prev => {
                if (!prev) {
                  audioEngine.setTrack(formattedTelegramTracks[0], false);
                  return formattedTelegramTracks[0];
                }
                return prev;
              });
            }
          }
        })
        .catch(err => {
          if (!isMounted) return;
          console.error('Failed to sync Telegram tracks:', err);
          setIsInitialLoading(false);
          setApiError(err.message || 'Failed to sync with Telegram backend.');
        });
    };

    fetchTelegramTracks();
    const syncInterval = setInterval(fetchTelegramTracks, 15000);
    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, []);

  // Update default playlists when tracks change
  useEffect(() => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id === 'p1') {
          return { ...p, tracks: tracks.filter(t => t.liked) };
        }
        if (p.id === 'p2') {
          return { ...p, tracks };
        }
        return p;
      })
    );
  }, [tracks]);

  // Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [activeArtistId, setActiveArtistId] = useState<string | null>(null);
  const [activeFilterChip, setActiveFilterChip] = useState<FilterChip>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Overlays / Sheets
  const [isPlayerExpanded, setIsPlayerExpanded] = useState<boolean>(false);
  const [isOptionSheetOpen, setIsOptionSheetOpen] = useState<boolean>(false);
  const [selectedOptionTrack, setSelectedOptionTrack] = useState<Track | null>(null);
  const [isDevicePickerOpen, setIsDevicePickerOpen] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<string>('Google Pixel 8 Pro (This Phone)');
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);

  // Phone Frame mode
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(true);

  // Subscribe to audioEngine playback state updates
  useEffect(() => {
    const unsubState = audioEngine.subscribeState((playing) => {
      setIsPlaying(playing);
    });
    const unsubTrack = audioEngine.subscribeTrack((t) => {
      if (t) setCurrentTrack(t);
    });

    return () => {
      unsubState();
      unsubTrack();
    };
  }, []);

  // Handlers
  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    audioEngine.setTrack(track, true);
  };

  const handleNextTrack = () => {
    if (tracks.length === 0 || !currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    let nextIndex = 0;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }

    handlePlayTrack(tracks[nextIndex]);
  };

  const handlePrevTrack = () => {
    if (tracks.length === 0 || !currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    handlePlayTrack(tracks[prevIndex]);
  };

  const handleToggleLikeTrack = (trackId: string) => {
    setTracks(prev =>
      prev.map(t => (t.id === trackId ? { ...t, liked: !t.liked } : t))
    );
    if (currentTrack && currentTrack.id === trackId) {
      setCurrentTrack(prev => (prev ? { ...prev, liked: !prev.liked } : null));
    }
  };

  const handlePlayPlaylist = (playlist: Playlist, shuffleMode: boolean = false) => {
    if (playlist.tracks.length === 0) return;
    setIsShuffle(shuffleMode);
    const firstTrack = shuffleMode
      ? playlist.tracks[Math.floor(Math.random() * playlist.tracks.length)]
      : playlist.tracks[0];
    handlePlayTrack(firstTrack);
  };

  const handleCreatePlaylist = (name: string) => {
    const newPl: Playlist = {
      id: `p_${Date.now()}`,
      name,
      description: 'Custom user created playlist.',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      author: 'You',
      tracks: tracks.slice(0, 1),
      followers: '0',
      isPinned: false
    };
    setPlaylists(prev => [newPl, ...prev]);
  };

  const handleOpenOptionSheet = (track: Track) => {
    setSelectedOptionTrack(track);
    setIsOptionSheetOpen(true);
  };

  const handleDownloadTrack = async (track: Track) => {
    // Check if already downloaded
    const existing = downloadedTracks.find(dt => dt.track.id === track.id);
    if (existing && existing.isCompleted) {
      showToast(`"${track.title}" is already downloaded in IndexedDB.`);
      return;
    }

    showToast(`Downloading "${track.title}" for offline playback...`);

    // Add downloading item placeholder
    const downloadingItem: DownloadedTrack = {
      track,
      downloadedAt: 'Just now',
      fileSize: '0 MB',
      progress: 5,
      isCompleted: false,
    };

    setDownloadedTracks(prev => {
      const filtered = prev.filter(dt => dt.track.id !== track.id);
      return [downloadingItem, ...filtered];
    });

    try {
      const downloadedItem = await downloadTrackWithProgress(track, (percent) => {
        setDownloadedTracks(prev =>
          prev.map(dt => (dt.track.id === track.id ? { ...dt, progress: percent } : dt))
        );
      });

      setDownloadedTracks(prev =>
        prev.map(dt => (dt.track.id === track.id ? downloadedItem : dt))
      );
      showToast(`"${track.title}" saved to IndexedDB for offline playback!`);
    } catch (err: any) {
      console.error('Download error:', err);
      showToast(`Download failed: ${err.message || 'Network error'}`);
      setDownloadedTracks(prev => prev.filter(dt => dt.track.id !== track.id));
    }
  };

  const handleDeleteDownload = (trackId: string) => {
    deleteDownloadedTrack(trackId).catch(console.error);
    setDownloadedTracks(prev => prev.filter(dt => dt.track.id !== trackId));
    showToast('Download removed from offline storage.');
  };

  const handleClearAllDownloads = () => {
    clearAllDownloads().catch(console.error);
    setDownloadedTracks([]);
    showToast('Cleared all offline tracks from IndexedDB.');
  };

  const handleClearCache = () => {
    // Clear audio engine cache
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updated }));
  };

  const handleUpdateSettings = (updated: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...updated }));
  };

  // Find active Detail Object
  const activePlaylist = playlists.find(p => p.id === activePlaylistId);
  const activeArtist = artists.find(a => a.id === activeArtistId);

  // Tab switcher resets detailed subviews
  const handleTabSelect = (tab: TabType) => {
    setCurrentTab(tab);
    setActivePlaylistId(null);
    setActiveArtistId(null);
  };

  return (
    <PhoneFrame
      phoneFrameMode={phoneFrameMode}
      onToggleFrameMode={() => setPhoneFrameMode(!phoneFrameMode)}
    >
      {/* Main Screen Body View Switcher */}
      <div className={`relative flex-1 flex flex-col overflow-hidden text-white ${
        appSettings.themeMode === 'amoled' ? 'bg-black' : 'bg-zinc-950'
      }`}>
        {isInitialLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
            <p className="text-sm font-medium text-zinc-300">Connecting to Telegram Backend...</p>
            <p className="text-xs text-zinc-500">Syncing tracks from private channel</p>
          </div>
        ) : (
          <>
            {apiError && (
              <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-rose-300 z-10">
                <span className="truncate pr-2 font-medium">Telegram API: {apiError}</span>
                <button
                  onClick={() => {
                    setIsInitialLoading(true);
                    setApiError(null);
                    fetch('/api/telegram/sync')
                      .then(res => res.json())
                      .then(data => {
                        setIsInitialLoading(false);
                        if (data.error) setApiError(data.error);
                        if (data.tracks && Array.isArray(data.tracks)) {
                          const formatted: Track[] = data.tracks.map((t: any) => ({
                            id: t.id,
                            title: t.title,
                            artist: t.artist,
                            album: t.album || 'Telegram Private Channel',
                            albumArt: t.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
                            duration: t.duration || 200,
                            telegramFileId: t.telegramFileId,
                            telegramMediaUrl: t.telegramMediaUrl,
                            storageBackend: 'Telegram Private Channel',
                            isVideoSource: Boolean(t.isVideoSource),
                            liked: Boolean(t.liked)
                          }));
                          setTracks(formatted);
                        }
                      })
                      .catch(err => {
                        setIsInitialLoading(false);
                        setApiError(err.message || 'Failed to sync with Telegram backend.');
                      });
                  }}
                  className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 rounded text-rose-200 shrink-0 font-semibold"
                >
                  Retry
                </button>
              </div>
            )}
            {activePlaylist ? (
              <PlaylistDetailView
                playlist={activePlaylist}
                onBack={() => setActivePlaylistId(null)}
                onPlayTrack={handlePlayTrack}
                onPlayPlaylist={handlePlayPlaylist}
                onToggleLikeTrack={handleToggleLikeTrack}
                onOpenOptionSheet={handleOpenOptionSheet}
              />
            ) : activeArtist ? (
              <ArtistDetailView
                artist={activeArtist}
                onBack={() => setActiveArtistId(null)}
                onPlayTrack={handlePlayTrack}
                onOpenOptionSheet={handleOpenOptionSheet}
              />
            ) : (
              <>
                {currentTab === 'home' && (
                  <HomeScreen
                    tracks={tracks}
                    playlists={playlists}
                    artists={artists}
                    userProfile={userProfile}
                    activeFilterChip={activeFilterChip}
                    onSelectFilterChip={setActiveFilterChip}
                    onPlayTrack={handlePlayTrack}
                    onSelectPlaylist={setActivePlaylistId}
                    onSelectArtist={setActiveArtistId}
                    onOpenProfile={() => setCurrentTab('profile')}
                  />
                )}

                {currentTab === 'search' && (
                  <SearchScreen
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    tracks={tracks}
                    playlists={playlists}
                    artists={artists}
                    onPlayTrack={handlePlayTrack}
                    onSelectPlaylist={setActivePlaylistId}
                    onSelectArtist={setActiveArtistId}
                  />
                )}

                {currentTab === 'library' && (
                  <LibraryScreen
                    playlists={playlists}
                    artists={artists}
                    tracks={tracks}
                    onSelectPlaylist={setActivePlaylistId}
                    onSelectArtist={setActiveArtistId}
                    onCreatePlaylist={handleCreatePlaylist}
                  />
                )}

                {currentTab === 'downloads' && (
                  <DownloadsScreen
                    downloadedTracks={downloadedTracks}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    offlineMode={appSettings.offlineMode}
                    onToggleOfflineMode={(off) => setAppSettings(prev => ({ ...prev, offlineMode: off }))}
                    onPlayTrack={handlePlayTrack}
                    onDeleteDownload={handleDeleteDownload}
                    onClearAllDownloads={handleClearAllDownloads}
                  />
                )}

                {currentTab === 'profile' && (
                  <ProfileScreen
                    userProfile={userProfile}
                    appSettings={appSettings}
                    onUpdateProfile={handleUpdateProfile}
                    onUpdateSettings={handleUpdateSettings}
                    onClearCache={handleClearCache}
                    onNavigateTab={(tab) => setCurrentTab(tab)}
                  />
                )}

                {currentTab === 'dj' && (
                  <RadioDjScreen
                    tracks={tracks}
                    onPlayTrack={handlePlayTrack}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Persistent Mini Player Bar */}
      {currentTrack && (
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onExpandPlayer={() => setIsPlayerExpanded(true)}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onToggleLike={handleToggleLikeTrack}
          onOpenDevicePicker={() => setIsDevicePickerOpen(true)}
        />
      )}

      {/* Android Material 3 Glassmorphism Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabSelect={handleTabSelect}
      />

      {/* Full Screen Expandable Player Overlay */}
      {isPlayerExpanded && currentTrack && (
        <FullScreenPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onCollapse={() => setIsPlayerExpanded(false)}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onToggleLike={handleToggleLikeTrack}
          onOpenDevicePicker={() => setIsDevicePickerOpen(true)}
          onOpenOptionSheet={handleOpenOptionSheet}
          onOpenQueue={() => setIsQueueOpen(true)}
          onOpenEqualizer={() => {
            setIsPlayerExpanded(false);
            setCurrentTab('dj');
          }}
          isShuffle={isShuffle}
          onToggleShuffle={() => setIsShuffle(!isShuffle)}
          repeatMode={repeatMode}
          onToggleRepeat={() => {
            if (repeatMode === 'off') setRepeatMode('all');
            else if (repeatMode === 'all') setRepeatMode('one');
            else setRepeatMode('off');
          }}
          selectedDevice={selectedDevice}
        />
      )}

      {/* Track Options Sheet */}
      {isOptionSheetOpen && selectedOptionTrack && (
        <TrackOptionSheet
          track={selectedOptionTrack}
          onClose={() => setIsOptionSheetOpen(false)}
          onToggleLike={handleToggleLikeTrack}
          onDownloadTrack={handleDownloadTrack}
          onSelectArtist={(artistId) => {
            setActiveArtistId(artistId);
            setIsOptionSheetOpen(false);
            if (isPlayerExpanded) setIsPlayerExpanded(false);
          }}
        />
      )}

      {/* Floating Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-12 left-4 right-4 z-50 bg-emerald-900/90 text-emerald-100 border border-emerald-500/40 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-medium text-center animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Device Picker Sheet */}
      {isDevicePickerOpen && (
        <DevicePickerSheet
          selectedDevice={selectedDevice}
          onSelectDevice={setSelectedDevice}
          onClose={() => setIsDevicePickerOpen(false)}
        />
      )}

      {/* Queue Drawer */}
      {isQueueOpen && currentTrack && (
        <QueueDrawer
          currentTrack={currentTrack}
          queue={tracks.filter(t => t.id !== currentTrack.id)}
          onClose={() => setIsQueueOpen(false)}
          onSelectTrack={handlePlayTrack}
        />
      )}
    </PhoneFrame>
  );
}
