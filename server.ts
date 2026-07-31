import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// 1. Ensure dotenv is configured before anything reads process.env
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Directory to store metadata database
const DATA_DIR = path.join(process.cwd(), 'server_data');
const METADATA_FILE = path.join(DATA_DIR, 'tracks.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed metadata if not exists
const DEFAULT_METADATA: any[] = [];

function getTrackDatabase() {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const data = fs.readFileSync(METADATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading tracks metadata:', err);
  }
  saveTrackDatabase(DEFAULT_METADATA);
  return DEFAULT_METADATA;
}

function saveTrackDatabase(tracks: any[]) {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(tracks, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving tracks metadata:', err);
  }
}

// State for Telegram Token Validity
let isBotTokenValid = true;

// Validate bot token on startup using Telegram getMe
async function validateTelegramBotToken(): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  const maskedToken = token
    ? (token.length > 10 ? `${token.substring(0, 10)}***` : `${token}***`)
    : 'Not Present';

  console.log('====================================================');
  console.log(`[Telegram Setup] TELEGRAM_BOT_TOKEN Present: ${token ? 'Yes' : 'No'} (${maskedToken})`);
  console.log(`[Telegram Setup] TELEGRAM_CHANNEL_ID: ${channelId || 'Not set'}`);
  console.log('====================================================');

  if (!token) {
    console.warn('[Telegram Auth] TELEGRAM_BOT_TOKEN is missing in environment variables.');
    isBotTokenValid = false;
    return false;
  }

  try {
    console.log('[Telegram Auth] Validating token with Telegram API getMe...');
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const json = await res.json() as any;

    if (json.ok && json.result) {
      console.log(`[Telegram Auth SUCCESS] Bot authenticated: @${json.result.username} (ID: ${json.result.id}, Name: "${json.result.first_name}")`);
      isBotTokenValid = true;
      return true;
    } else {
      isBotTokenValid = false;
      console.error(`[Telegram Auth ERROR] getMe failed: ${json.description || 'Unauthorized'}`);
      return false;
    }
  } catch (err: any) {
    console.error(`[Telegram Auth ERROR] Could not connect to Telegram API: ${err.message}`);
    return false;
  }
}

// ------------------------------------------------------------------
// Telegram Backend API Routes
// ------------------------------------------------------------------

// Check Telegram connection status
app.get('/api/telegram/status', (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  const tracks = getTrackDatabase();

  const maskedToken = token
    ? (token.length > 10 ? `${token.substring(0, 10)}***` : `${token}***`)
    : null;

  res.json({
    status: 'ok',
    isConfigured: Boolean(token),
    isValidToken: isBotTokenValid,
    hasChannelId: Boolean(channelId),
    botTokenMasked: maskedToken,
    channelIdConfigured: channelId || 'Not set',
    totalTracksStored: tracks.length,
    backendStorage: 'Private Telegram Channel Backend API'
  });
});

// Configure bot credentials dynamically
app.post('/api/telegram/config', async (req, res) => {
  const { botToken, channelId } = req.body;
  if (botToken !== undefined) process.env.TELEGRAM_BOT_TOKEN = botToken;
  if (channelId !== undefined) process.env.TELEGRAM_CHANNEL_ID = channelId;

  const valid = await validateTelegramBotToken();

  res.json({
    success: valid,
    message: valid ? 'Telegram credentials verified & updated successfully.' : 'Telegram token validation failed.',
    isConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    isValidToken: isBotTokenValid,
    hasChannelId: Boolean(process.env.TELEGRAM_CHANNEL_ID)
  });
});

// List all metadata tracks stored in database
app.get('/api/telegram/tracks', (req, res) => {
  const tracks = getTrackDatabase();
  res.json({ tracks });
});

// Save or add new track metadata linked to Telegram File ID or URL
app.post('/api/telegram/tracks', (req, res) => {
  const { title, artist, album, thumbnail, duration, telegramFileId, telegramMediaUrl, isVideoSource } = req.body;

  if (!title || (!telegramFileId && !telegramMediaUrl)) {
    return res.status(400).json({ error: 'Title and Telegram File ID or Media URL are required.' });
  }

  const tracks = getTrackDatabase();
  const newTrack = {
    id: `tg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: title || 'Untitled Telegram Track',
    artist: artist || 'Unknown Artist',
    album: album || 'Telegram Imports',
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: Number(duration) || 180,
    telegramFileId: telegramFileId || '',
    telegramMediaUrl: telegramMediaUrl || '',
    storageBackend: 'Telegram Channel',
    isVideoSource: Boolean(isVideoSource),
    createdAt: new Date().toISOString(),
    liked: false
  };

  tracks.unshift(newTrack);
  saveTrackDatabase(tracks);

  res.json({ success: true, track: newTrack });
});

// Auto-sync channel messages & updates from Telegram
let lastUpdateId = 0;

async function syncTelegramChannelUpdates() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelIdEnv = process.env.TELEGRAM_CHANNEL_ID;

  if (!token) {
    return { synced: 0, total: 0, error: 'TELEGRAM_BOT_TOKEN is missing in .env configuration.', isConfigured: false };
  }

  if (!isBotTokenValid) {
    return { synced: 0, total: 0, error: 'TELEGRAM_BOT_TOKEN is invalid or returned 401 Unauthorized.', isConfigured: true };
  }

  try {
    const tracks = getTrackDatabase();

    // If tracks database is empty, reset offset so Telegram API returns all available updates
    if (tracks.length === 0) {
      lastUpdateId = 0;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&limit=100&allowed_updates=["message","channel_post","edited_channel_post"]`);
    const json = await res.json() as any;

    if (!json.ok) {
      console.error(`[Telegram Sync ERROR] getUpdates failed: ${json.description}`);
      if (json.error_code === 401 || res.status === 401) {
        isBotTokenValid = false;
      }
      return { synced: 0, total: tracks.length, error: `Telegram API error: ${json.description || 'Unauthorized'}`, isConfigured: true };
    }

    if (!json.result || !Array.isArray(json.result)) {
      saveTrackDatabase(tracks);
      return { synced: 0, total: tracks.length, error: null, isConfigured: true };
    }

    let syncedCount = 0;
    let deletedCount = 0;

    for (const update of json.result) {
      lastUpdateId = Math.max(lastUpdateId, update.update_id);
      const msg = update.channel_post || update.message || update.edited_channel_post;
      if (!msg) continue;

      // Ensure post belongs to targeted channel if TELEGRAM_CHANNEL_ID is set
      if (channelIdEnv) {
        const msgChatId = String(msg.chat?.id || '');
        if (msgChatId && msgChatId !== channelIdEnv && !msgChatId.includes(channelIdEnv.replace('-100', ''))) {
          // ignore posts from other chats
          continue;
        }
      }

      const audio = msg.audio || msg.voice;
      const video = msg.video || msg.animation;
      const doc = msg.document;

      if (audio || video || (doc && (doc.mime_type?.includes('audio') || doc.mime_type?.includes('video')))) {
        const mediaObj = audio || video || doc;
        const fileId = mediaObj.file_id;

        // Check if fileId already stored in database
        const existingIndex = tracks.findIndex((t: any) => t.telegramFileId === fileId || t.messageId === msg.message_id);
        
        const isVid = Boolean(video || doc?.mime_type?.includes('video'));
        const caption = msg.caption || mediaObj.file_name || 'Telegram Track';
        
        let title = 'Telegram Track';
        let artist = 'Telegram Private Channel';

        if (caption.includes('-')) {
          const parts = caption.split('-');
          title = parts[0].replace(/^[🎵🎥\s]+/, '').trim();
          artist = parts[1].trim();
        } else {
          title = caption.replace(/^[🎵🎥\s]+/, '').trim() || mediaObj.file_name || 'Telegram File';
          artist = msg.chat?.title || 'Private Vault';
        }

        const trackData = {
          id: existingIndex >= 0 ? tracks[existingIndex].id : `tg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title,
          artist,
          album: isVid ? 'Video Audio Extracted' : 'Telegram Private Vault',
          thumbnail: isVid
            ? 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
          duration: mediaObj.duration || audio?.duration || video?.duration || 210,
          telegramFileId: fileId,
          telegramMediaUrl: '',
          messageId: msg.message_id,
          storageBackend: 'Telegram Private Channel',
          isVideoSource: isVid,
          fileSize: mediaObj.file_size ? `${(mediaObj.file_size / (1024 * 1024)).toFixed(1)} MB` : '6.5 MB',
          createdAt: new Date(msg.date * 1000).toISOString(),
          liked: existingIndex >= 0 ? tracks[existingIndex].liked : false
        };

        if (existingIndex >= 0) {
          tracks[existingIndex] = { ...tracks[existingIndex], ...trackData };
        } else {
          tracks.unshift(trackData);
          syncedCount++;
        }
      }
    }

    // Always save all tracks to tracks.json after every successful sync
    saveTrackDatabase(tracks);

    return { synced: syncedCount, deleted: deletedCount, total: tracks.length, isConfigured: true, error: null };
  } catch (err: any) {
    console.error('[Telegram Sync Connection ERROR]:', err.message);
    const tracks = getTrackDatabase();
    return { synced: 0, total: tracks.length, error: `Connection failed: ${err.message}`, isConfigured: true };
  }
}

// Auto-sync endpoint called silently by frontend
app.get('/api/telegram/sync', async (req, res) => {
  const result = await syncTelegramChannelUpdates();
  const tracks = getTrackDatabase();
  res.json({ success: true, ...result, tracks });
});

app.delete('/api/telegram/tracks/:id', (req, res) => {
  const { id } = req.params;
  let tracks = getTrackDatabase();
  tracks = tracks.filter((t: any) => t.id !== id);
  saveTrackDatabase(tracks);
  res.json({ success: true, message: 'Track metadata removed.' });
});

// Stream Media from Telegram or Media Proxy
// Handles HTTP Range Requests (`bytes=start-end`) for streaming without downloading entire file first
app.get('/api/telegram/stream/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tracks = getTrackDatabase();
    const track = tracks.find((t: any) => t.id === id);

    let streamUrl = '';

    // If Telegram File ID is present and bot token is configured, resolve path via Telegram API
    if (track && track.telegramFileId && process.env.TELEGRAM_BOT_TOKEN && isBotTokenValid) {
      try {
        const fileRes = await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${track.telegramFileId}`
        );
        const fileJson = await fileRes.json() as any;

        if (fileJson.ok && fileJson.result && fileJson.result.file_path) {
          streamUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileJson.result.file_path}`;
        } else {
          console.error(`[Telegram Stream ERROR] getFile failed: ${fileJson.description || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Failed to fetch Telegram file_path:', err);
      }
    }

    // Fallback to media URL
    if (!streamUrl) {
      streamUrl = track?.telegramMediaUrl || '';
    }

    if (!streamUrl) {
      return res.status(404).json({ error: 'Audio stream not available or Telegram credentials missing.' });
    }

    // Fetch original media headers
    const headRes = await fetch(streamUrl, { method: 'HEAD' });
    const contentLength = headRes.headers.get('content-length') || '10485760';
    const originalType = headRes.headers.get('content-type') || 'audio/mpeg';

    const range = req.headers.range;

    // Standard headers for HTML5 Audio playback (Audio-only delivery)
    const mimeType = originalType.includes('video') ? 'audio/mp4' : (originalType.startsWith('audio/') ? originalType : 'audio/mpeg');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const total = parseInt(contentLength, 10);
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 1024 * 1024 - 1, total - 1);
      const chunkSize = (end - start) + 1;

      const mediaStream = await fetch(streamUrl, {
        headers: { Range: `bytes=${start}-${end}` }
      });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache'
      });

      if (mediaStream.body) {
        // Stream chunk bytes
        const reader = (mediaStream.body as any).getReader();
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) return res.end();
          res.write(value);
          await pump();
        };
        await pump();
      } else {
        res.end();
      }
    } else {
      res.writeHead(200, {
        'Content-Length': contentLength,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes'
      });

      const mediaStream = await fetch(streamUrl);
      if (mediaStream.body) {
        const reader = (mediaStream.body as any).getReader();
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) return res.end();
          res.write(value);
          await pump();
        };
        await pump();
      } else {
        res.end();
      }
    }
  } catch (err) {
    console.error('Stream error:', err);
    res.status(500).json({ error: 'Failed to stream audio file.' });
  }
});

// Upload media file to Telegram Channel via Telegram Bot API
app.post('/api/telegram/upload', async (req, res) => {
  try {
    const { title, artist, album, duration, base64Data, fileName, mimeType } = req.body;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    let telegramFileId = '';
    let isVideoSource = mimeType?.includes('video');

    if (token && channelId && base64Data && isBotTokenValid) {
      // Buffer conversion
      const buffer = Buffer.from(base64Data.split(',')[1] || base64Data, 'base64');
      const blob = new Blob([buffer], { type: mimeType || 'audio/mpeg' });

      const formData = new FormData();
      formData.append('chat_id', channelId);
      formData.append(isVideoSource ? 'video' : 'audio', blob, fileName || 'upload_track');
      formData.append('caption', `🎵 ${title || 'Track'} - ${artist || 'Artist'} (Stored in Telegram Channel)`);

      const tgEndpoint = isVideoSource
        ? `https://api.telegram.org/bot${token}/sendVideo`
        : `https://api.telegram.org/bot${token}/sendAudio`;

      const tgRes = await fetch(tgEndpoint, {
        method: 'POST',
        body: formData
      });

      const tgJson = await tgRes.json() as any;
      if (tgJson.ok && tgJson.result) {
        const mediaObj = tgJson.result.audio || tgJson.result.video || tgJson.result.document;
        telegramFileId = mediaObj?.file_id || '';
      } else {
        console.error(`[Telegram Upload ERROR] Send failed: ${tgJson.description}`);
      }
    }

    // Save metadata
    const tracks = getTrackDatabase();
    const newTrack = {
      id: `tg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title || fileName || 'Uploaded Telegram Track',
      artist: artist || 'Telegram Cloud',
      album: album || 'Telegram Channel Vault',
      thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      duration: Number(duration) || 200,
      telegramFileId: telegramFileId || `simulated_file_id_${Date.now()}`,
      telegramMediaUrl: '',
      storageBackend: 'Telegram Private Channel',
      isVideoSource,
      createdAt: new Date().toISOString(),
      liked: true
    };

    tracks.unshift(newTrack);
    saveTrackDatabase(tracks);

    res.json({
      success: true,
      message: telegramFileId ? 'Uploaded to Telegram Channel & saved metadata!' : 'Saved metadata to database (Bot Token required for actual Channel posting).',
      track: newTrack
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed.' });
  }
});

// ------------------------------------------------------------------
// Vite / Static Middleware Setup & Server Boot
// ------------------------------------------------------------------
async function startServer() {
  // Validate token on boot
  await validateTelegramBotToken();

  // On server startup, automatically call syncTelegramChannelUpdates()
  try {
    console.log('[Telegram Backend] Performing startup channel sync...');
    const syncRes = await syncTelegramChannelUpdates();
    console.log(`[Telegram Backend] Startup sync finished: ${syncRes.synced} new tracks, ${syncRes.total || 0} total saved to tracks.json.`);
  } catch (err: any) {
    console.error('[Telegram Backend] Startup sync failed:', err.message);
  }

  // Repeat sync every 30 seconds
  setInterval(() => {
    if (process.env.TELEGRAM_BOT_TOKEN && isBotTokenValid) {
      syncTelegramChannelUpdates().catch((err) => {
        console.error('[Telegram Interval Sync Error]:', err);
      });
    }
  }, 30000);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();


