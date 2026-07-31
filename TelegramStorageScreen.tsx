import React, { useState, useEffect } from 'react';
import { 
  Send, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Music, 
  Video, 
  Key, 
  Download, 
  Trash2, 
  Play, 
  Plus, 
  ShieldCheck, 
  HardDrive,
  RefreshCw,
  FileAudio,
  Radio,
  ExternalLink
} from 'lucide-react';
import { Track } from '../types';

interface TelegramStorageScreenProps {
  onPlayTrack: (track: Track) => void;
  currentTrack?: Track | null;
  isPlaying?: boolean;
}

export function TelegramStorageScreen({ onPlayTrack, currentTrack, isPlaying }: TelegramStorageScreenProps) {
  const [status, setStatus] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'tracks' | 'upload' | 'fileId' | 'config'>('tracks');

  // Config Form
  const [botToken, setBotToken] = useState<string>('');
  const [channelId, setChannelId] = useState<string>('');
  const [configMsg, setConfigMsg] = useState<string>('');

  // Upload Form
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadArtist, setUploadArtist] = useState<string>('');
  const [uploadAlbum, setUploadAlbum] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>('');

  // File ID Form
  const [fileIdInput, setFileIdInput] = useState<string>('');
  const [mediaUrlInput, setMediaUrlInput] = useState<string>('');
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualArtist, setManualArtist] = useState<string>('');
  const [manualAlbum, setManualAlbum] = useState<string>('');
  const [manualThumb, setManualThumb] = useState<string>('');
  const [manualDuration, setManualDuration] = useState<number>(210);
  const [isVideoSource, setIsVideoSource] = useState<boolean>(false);

  useEffect(() => {
    fetchStatusAndTracks();
  }, []);

  const fetchStatusAndTracks = async () => {
    setLoading(true);
    try {
      const [statusRes, tracksRes] = await Promise.all([
        fetch('/api/telegram/status'),
        fetch('/api/telegram/tracks')
      ]);

      const statusData = await statusRes.json();
      const tracksData = await tracksRes.json();

      setStatus(statusData);
      setTracks(tracksData.tracks || []);
    } catch (err) {
      console.error('Failed to fetch Telegram backend state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigMsg('');
    try {
      const res = await fetch('/api/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, channelId })
      });
      const data = await res.json();
      if (data.success) {
        setConfigMsg('Telegram credentials updated successfully!');
        fetchStatusAndTracks();
      }
    } catch (err) {
      setConfigMsg('Failed to update config.');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile && !uploadTitle) return;

    setIsUploading(true);
    setUploadSuccessMsg('');

    try {
      let base64Data = '';
      if (uploadFile) {
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(uploadFile);
        });
      }

      const res = await fetch('/api/telegram/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle || uploadFile?.name.replace(/\.[^/.]+$/, ''),
          artist: uploadArtist || 'Telegram Artist',
          album: uploadAlbum || 'Telegram Private Channel Vault',
          duration: 210,
          fileName: uploadFile?.name,
          mimeType: uploadFile?.type,
          base64Data
        })
      });

      const data = await res.json();
      if (data.success) {
        setUploadSuccessMsg('Track uploaded to Telegram Channel backend & metadata stored!');
        setUploadFile(null);
        setUploadTitle('');
        setUploadArtist('');
        setUploadAlbum('');
        fetchStatusAndTracks();
        setActiveTab('tracks');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddManualTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle) return;

    try {
      const res = await fetch('/api/telegram/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualTitle,
          artist: manualArtist || 'Unknown Artist',
          album: manualAlbum || 'Telegram Imports',
          thumbnail: manualThumb || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
          duration: manualDuration,
          telegramFileId: fileIdInput,
          telegramMediaUrl: mediaUrlInput,
          isVideoSource
        })
      });

      const data = await res.json();
      if (data.success) {
        fetchStatusAndTracks();
        setManualTitle('');
        setFileIdInput('');
        setMediaUrlInput('');
        setActiveTab('tracks');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTrack = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/telegram/tracks/${id}`, { method: 'DELETE' });
      fetchStatusAndTracks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#050505] text-white p-4 pb-28">
      {/* Header Title Banner */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Telegram Storage Backend</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Private Channel → Backend API Stream Proxy → Clean Music Player
          </p>
        </div>
        <button 
          onClick={fetchStatusAndTracks}
          className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Backend Status Card */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-zinc-900/90 to-zinc-950 border border-emerald-500/20 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Security Architecture
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            Bot Token Hidden Server-Side
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
          <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
            <span className="text-zinc-500 block text-[10px]">Telegram Bot Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {status?.isConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-zinc-200 font-medium">Connected ({status?.botTokenMasked})</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-200 font-medium">Token Needed (Fallback Active)</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
            <span className="text-zinc-500 block text-[10px]">Storage Backend</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-200 font-medium">{tracks.length} Tracks Stored</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Zero music binary files stored in database. Metadata stores only track details & Telegram File ID. Audio & Video media are proxied server-side via HTTP Range chunk streaming.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'tracks'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          Stored Tracks ({tracks.length})
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'upload'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Upload Audio/Video
        </button>

        <button
          onClick={() => setActiveTab('fileId')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'fileId'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Telegram File ID
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'config'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Bot Credentials
        </button>
      </div>

      {/* Tab 1: Stored Tracks */}
      {activeTab === 'tracks' && (
        <div className="space-y-3">
          {tracks.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-white/5 p-6">
              <Send className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-zinc-300">No tracks in Telegram storage</p>
              <p className="text-xs text-zinc-500 mt-1">Upload audio/video or add a Telegram File ID to get started.</p>
            </div>
          ) : (
            tracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className={`group relative flex items-center gap-3.5 p-3 rounded-2xl transition-all cursor-pointer border ${
                    isCurrent
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                      : 'bg-zinc-900/60 hover:bg-zinc-800/80 border-white/5 text-zinc-200'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                    <img
                      src={track.thumbnail || track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold truncate ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                        {track.title}
                      </h3>
                      {track.isVideoSource && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <Video className="w-2.5 h-2.5" />
                          Audio Extracted
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {track.artist} • {track.album}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Send className="w-2.5 h-2.5 text-emerald-400" />
                        {track.telegramFileId ? `File ID: ${track.telegramFileId.substring(0, 8)}...` : 'Telegram Media Proxy'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`/api/telegram/stream/${track.id}`}
                      download={`${track.title}.mp3`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                      title="Download Audio File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={(e) => handleDeleteTrack(track.id, e)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Delete Metadata"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Upload Media */}
      {activeTab === 'upload' && (
        <form onSubmit={handleFileUpload} className="space-y-4 bg-zinc-900/60 p-5 rounded-2xl border border-white/5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            Upload File to Telegram Channel Backend
          </h2>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Select Audio or Video File (MP3, MP4, MKV, WebM, FLAC)</label>
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setUploadFile(e.target.files[0]);
                  if (!uploadTitle) setUploadTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                }
              }}
              className="block w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-black hover:file:bg-emerald-400 cursor-pointer"
            />
          </div>

          {uploadFile?.type.includes('video') && (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs flex items-center gap-2">
              <Video className="w-4 h-4 shrink-0 text-purple-400" />
              <span>Video file detected! The backend will extract and stream ONLY the audio track. No video will ever be rendered.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Song Title</label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. Midnight Horizon"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Artist</label>
              <input
                type="text"
                value={uploadArtist}
                onChange={(e) => setUploadArtist(e.target.value)}
                placeholder="Artist name"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Album</label>
              <input
                type="text"
                value={uploadAlbum}
                onChange={(e) => setUploadAlbum(e.target.value)}
                placeholder="Album name"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isUploading ? 'Uploading to Telegram Channel...' : 'Post Media to Telegram & Save Metadata'}
          </button>

          {uploadSuccessMsg && (
            <p className="text-xs text-emerald-400 text-center font-medium">{uploadSuccessMsg}</p>
          )}
        </form>
      )}

      {/* Tab 3: Manual File ID */}
      {activeTab === 'fileId' && (
        <form onSubmit={handleAddManualTrack} className="space-y-4 bg-zinc-900/60 p-5 rounded-2xl border border-white/5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Store Metadata for Existing Telegram Media
          </h2>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Telegram File ID (or Post URL)</label>
            <input
              type="text"
              value={fileIdInput}
              onChange={(e) => setFileIdInput(e.target.value)}
              placeholder="e.g. BQACAgIAAxkBAAIB_G... or https://t.me/c/1234/56"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Direct Media URL (Optional Proxy Fallback)</label>
            <input
              type="text"
              value={mediaUrlInput}
              onChange={(e) => setMediaUrlInput(e.target.value)}
              placeholder="https://example.com/song.mp3 or video.mp4"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Title *</label>
              <input
                type="text"
                required
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Song title"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Artist</label>
              <input
                type="text"
                value={manualArtist}
                onChange={(e) => setManualArtist(e.target.value)}
                placeholder="Artist name"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isVideo"
              checked={isVideoSource}
              onChange={(e) => setIsVideoSource(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <label htmlFor="isVideo" className="text-xs text-zinc-300">
              This Telegram file is a VIDEO format (MP4/MKV) — Extract audio stream only
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Save Telegram Track Metadata
          </button>
        </form>
      )}

      {/* Tab 4: Bot Config */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="space-y-4 bg-zinc-900/60 p-5 rounded-2xl border border-white/5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            Telegram Bot & Private Channel Setup
          </h2>

          <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 text-xs text-zinc-300 space-y-1.5">
            <p className="font-semibold text-emerald-400">Step-by-Step Telegram Channel Guide:</p>
            <ol className="list-decimal list-inside text-zinc-400 space-y-1">
              <li>Open Telegram and search for <span className="text-white font-mono">@BotFather</span> to create a bot.</li>
              <li>Copy the HTTP API Bot Token from @BotFather.</li>
              <li>Create a Private Channel in Telegram and add your bot as an <span className="text-white">Admin</span>.</li>
              <li>Get your Channel Chat ID (e.g., <span className="text-white font-mono">-100123456789</span>).</li>
            </ol>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Telegram Bot Token (`TELEGRAM_BOT_TOKEN`)</label>
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Private Channel ID (`TELEGRAM_CHANNEL_ID`)</label>
            <input
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="e.g. -1001987654321 or @my_private_channel"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all"
          >
            Update Credentials Server-Side
          </button>

          {configMsg && (
            <p className="text-xs text-emerald-400 text-center font-medium">{configMsg}</p>
          )}
        </form>
      )}
    </div>
  );
}
