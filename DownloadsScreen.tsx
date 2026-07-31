import React, { useState } from 'react';
import { 
  Download, 
  Trash2, 
  Play, 
  Pause, 
  WifiOff, 
  HardDrive, 
  CheckCircle, 
  ArrowDownCircle, 
  Video, 
  Music, 
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Track, DownloadedTrack } from '../types';

interface DownloadsScreenProps {
  downloadedTracks: DownloadedTrack[];
  currentTrack?: Track | null;
  isPlaying?: boolean;
  offlineMode: boolean;
  onToggleOfflineMode: (offline: boolean) => void;
  onPlayTrack: (track: Track) => void;
  onDeleteDownload: (trackId: string) => void;
  onClearAllDownloads: () => void;
}

export const DownloadsScreen: React.FC<DownloadsScreenProps> = ({
  downloadedTracks,
  currentTrack,
  isPlaying,
  offlineMode,
  onToggleOfflineMode,
  onPlayTrack,
  onDeleteDownload,
  onClearAllDownloads
}) => {
  const [filter, setFilter] = useState<'all' | 'audio' | 'video'>('all');

  // Calculate total storage
  const totalMb = downloadedTracks.reduce((acc, item) => {
    const val = parseFloat(item.fileSize.replace(/[^0-9.]/g, '')) || 6.5;
    return acc + val;
  }, 0);

  const filtered = downloadedTracks.filter(item => {
    if (filter === 'audio') return !item.track.isVideoSource;
    if (filter === 'video') return item.track.isVideoSource;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-black text-white p-4 pb-28">
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Downloads</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Offline Storage & Local Telegram Media Cache
          </p>
        </div>

        {/* Offline Mode Toggle Pill */}
        <button
          onClick={() => onToggleOfflineMode(!offlineMode)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
            offlineMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-zinc-900 text-zinc-400 border-white/10 hover:border-white/20'
          }`}
        >
          <WifiOff className={`w-3.5 h-3.5 ${offlineMode ? 'text-amber-400' : ''}`} />
          <span>{offlineMode ? 'Offline Mode ON' : 'Offline Mode'}</span>
        </button>
      </div>

      {/* Storage Used Card */}
      <div className="mb-5 p-4 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white">Storage Used</span>
          </div>
          <span className="text-xs font-medium text-emerald-400">
            {totalMb.toFixed(1)} MB / 10.0 GB
          </span>
        </div>

        {/* Storage Bar */}
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (totalMb / 1024) * 10)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>{downloadedTracks.length} Songs Downloaded</span>
          {downloadedTracks.length > 0 && (
            <button
              onClick={onClearAllDownloads}
              className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3 h-3" />
              Clear Storage
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'audio', 'video'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all cursor-pointer ${
              filter === f
                ? 'bg-emerald-500 text-black font-semibold shadow-md'
                : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:bg-zinc-800'
            }`}
          >
            {f === 'all' ? 'All Downloads' : f === 'audio' ? 'Audio Tracks' : 'Video Audio Extracted'}
          </button>
        ))}
      </div>

      {/* Download List */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 bg-zinc-900/40 rounded-2xl border border-white/5 p-6">
          <Download className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-300">No downloaded songs found</p>
          <p className="text-xs text-zinc-500 mt-1">
            Tap the download icon on any Telegram track to save it for offline playback.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(({ track, fileSize, downloadedAt, progress, isCompleted }) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className={`group flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer border ${
                  isCurrent
                    ? 'bg-emerald-950/40 border-emerald-500/50'
                    : 'bg-zinc-900/60 hover:bg-zinc-800/80 border-white/5'
                }`}
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                  <img
                    src={track.albumArt || track.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isCurrent && isPlaying ? (
                      <Pause className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                    ) : (
                      <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold truncate ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                      {track.title}
                    </h3>
                    {track.isVideoSource && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                        <Video className="w-2.5 h-2.5" />
                        Audio Extracted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {track.artist} • {track.album}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                    {isCompleted ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Downloaded ({fileSize})
                      </span>
                    ) : (
                      <div className="flex-1 flex items-center gap-2 pr-2">
                        <span className="text-amber-400 font-medium shrink-0">
                          Downloading ({progress || 0}%)...
                        </span>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {isCompleted && <span>• {downloadedAt}</span>}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDownload(track.id);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors shrink-0"
                  title="Remove Download"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
