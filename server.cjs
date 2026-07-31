var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "100mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "100mb" }));
var DATA_DIR = import_path.default.join(process.cwd(), "server_data");
var METADATA_FILE = import_path.default.join(DATA_DIR, "tracks.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
var DEFAULT_METADATA = [];
function getTrackDatabase() {
  try {
    if (import_fs.default.existsSync(METADATA_FILE)) {
      const data = import_fs.default.readFileSync(METADATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading tracks metadata:", err);
  }
  saveTrackDatabase(DEFAULT_METADATA);
  return DEFAULT_METADATA;
}
function saveTrackDatabase(tracks) {
  try {
    import_fs.default.writeFileSync(METADATA_FILE, JSON.stringify(tracks, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving tracks metadata:", err);
  }
}
var isBotTokenValid = true;
async function validateTelegramBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  const maskedToken = token ? token.length > 10 ? `${token.substring(0, 10)}***` : `${token}***` : "Not Present";
  console.log("====================================================");
  console.log(`[Telegram Setup] TELEGRAM_BOT_TOKEN Present: ${token ? "Yes" : "No"} (${maskedToken})`);
  console.log(`[Telegram Setup] TELEGRAM_CHANNEL_ID: ${channelId || "Not set"}`);
  console.log("====================================================");
  if (!token) {
    console.warn("[Telegram Auth] TELEGRAM_BOT_TOKEN is missing in environment variables.");
    isBotTokenValid = false;
    return false;
  }
  try {
    console.log("[Telegram Auth] Validating token with Telegram API getMe...");
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const json = await res.json();
    if (json.ok && json.result) {
      console.log(`[Telegram Auth SUCCESS] Bot authenticated: @${json.result.username} (ID: ${json.result.id}, Name: "${json.result.first_name}")`);
      isBotTokenValid = true;
      return true;
    } else {
      isBotTokenValid = false;
      console.error(`[Telegram Auth ERROR] getMe failed: ${json.description || "Unauthorized"}`);
      return false;
    }
  } catch (err) {
    console.error(`[Telegram Auth ERROR] Could not connect to Telegram API: ${err.message}`);
    return false;
  }
}
app.get("/api/telegram/status", (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  const tracks = getTrackDatabase();
  const maskedToken = token ? token.length > 10 ? `${token.substring(0, 10)}***` : `${token}***` : null;
  res.json({
    status: "ok",
    isConfigured: Boolean(token),
    isValidToken: isBotTokenValid,
    hasChannelId: Boolean(channelId),
    botTokenMasked: maskedToken,
    channelIdConfigured: channelId || "Not set",
    totalTracksStored: tracks.length,
    backendStorage: "Private Telegram Channel Backend API"
  });
});
app.post("/api/telegram/config", async (req, res) => {
  const { botToken, channelId } = req.body;
  if (botToken !== void 0) process.env.TELEGRAM_BOT_TOKEN = botToken;
  if (channelId !== void 0) process.env.TELEGRAM_CHANNEL_ID = channelId;
  const valid = await validateTelegramBotToken();
  res.json({
    success: valid,
    message: valid ? "Telegram credentials verified & updated successfully." : "Telegram token validation failed.",
    isConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    isValidToken: isBotTokenValid,
    hasChannelId: Boolean(process.env.TELEGRAM_CHANNEL_ID)
  });
});
app.get("/api/telegram/tracks", (req, res) => {
  const tracks = getTrackDatabase();
  res.json({ tracks });
});
app.post("/api/telegram/tracks", (req, res) => {
  const { title, artist, album, thumbnail, duration, telegramFileId, telegramMediaUrl, isVideoSource } = req.body;
  if (!title || !telegramFileId && !telegramMediaUrl) {
    return res.status(400).json({ error: "Title and Telegram File ID or Media URL are required." });
  }
  const tracks = getTrackDatabase();
  const newTrack = {
    id: `tg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: title || "Untitled Telegram Track",
    artist: artist || "Unknown Artist",
    album: album || "Telegram Imports",
    thumbnail: thumbnail || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    duration: Number(duration) || 180,
    telegramFileId: telegramFileId || "",
    telegramMediaUrl: telegramMediaUrl || "",
    storageBackend: "Telegram Channel",
    isVideoSource: Boolean(isVideoSource),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    liked: false
  };
  tracks.unshift(newTrack);
  saveTrackDatabase(tracks);
  res.json({ success: true, track: newTrack });
});
var lastUpdateId = 0;
async function syncTelegramChannelUpdates() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelIdEnv = process.env.TELEGRAM_CHANNEL_ID;
  if (!token) {
    return { synced: 0, error: "TELEGRAM_BOT_TOKEN is missing in .env configuration.", isConfigured: false };
  }
  if (!isBotTokenValid) {
    return { synced: 0, error: "TELEGRAM_BOT_TOKEN is invalid or returned 401 Unauthorized.", isConfigured: true };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&limit=50&allowed_updates=["message","channel_post","edited_channel_post"]`);
    const json = await res.json();
    if (!json.ok) {
      console.error(`[Telegram Sync ERROR] getUpdates failed: ${json.description}`);
      if (json.error_code === 401 || res.status === 401) {
        isBotTokenValid = false;
      }
      return { synced: 0, error: `Telegram API error: ${json.description || "Unauthorized"}`, isConfigured: true };
    }
    if (!json.result || !Array.isArray(json.result)) {
      return { synced: 0, error: null, isConfigured: true };
    }
    let syncedCount = 0;
    let deletedCount = 0;
    const tracks = getTrackDatabase();
    for (const update of json.result) {
      lastUpdateId = Math.max(lastUpdateId, update.update_id);
      const msg = update.channel_post || update.message || update.edited_channel_post;
      if (!msg) continue;
      if (channelIdEnv) {
        const msgChatId = String(msg.chat?.id || "");
        if (msgChatId && msgChatId !== channelIdEnv && !msgChatId.includes(channelIdEnv.replace("-100", ""))) {
          continue;
        }
      }
      const audio = msg.audio || msg.voice;
      const video = msg.video || msg.animation;
      const doc = msg.document;
      if (audio || video || doc && (doc.mime_type?.includes("audio") || doc.mime_type?.includes("video"))) {
        const mediaObj = audio || video || doc;
        const fileId = mediaObj.file_id;
        const existingIndex = tracks.findIndex((t) => t.telegramFileId === fileId || t.messageId === msg.message_id);
        const isVid = Boolean(video || doc?.mime_type?.includes("video"));
        const caption = msg.caption || mediaObj.file_name || "Telegram Track";
        let title = "Telegram Track";
        let artist = "Telegram Private Channel";
        if (caption.includes("-")) {
          const parts = caption.split("-");
          title = parts[0].replace(/^[🎵🎥\s]+/, "").trim();
          artist = parts[1].trim();
        } else {
          title = caption.replace(/^[🎵🎥\s]+/, "").trim() || mediaObj.file_name || "Telegram File";
          artist = msg.chat?.title || "Private Vault";
        }
        const trackData = {
          id: existingIndex >= 0 ? tracks[existingIndex].id : `tg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title,
          artist,
          album: isVid ? "Video Audio Extracted" : "Telegram Private Vault",
          thumbnail: isVid ? "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
          duration: mediaObj.duration || audio?.duration || video?.duration || 210,
          telegramFileId: fileId,
          telegramMediaUrl: "",
          messageId: msg.message_id,
          storageBackend: "Telegram Private Channel",
          isVideoSource: isVid,
          fileSize: mediaObj.file_size ? `${(mediaObj.file_size / (1024 * 1024)).toFixed(1)} MB` : "6.5 MB",
          createdAt: new Date(msg.date * 1e3).toISOString(),
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
    if (syncedCount > 0 || deletedCount > 0) {
      saveTrackDatabase(tracks);
    }
    return { synced: syncedCount, deleted: deletedCount, total: tracks.length, isConfigured: true, error: null };
  } catch (err) {
    console.error("[Telegram Sync Connection ERROR]:", err.message);
    return { synced: 0, error: `Connection failed: ${err.message}`, isConfigured: true };
  }
}
app.get("/api/telegram/sync", async (req, res) => {
  const result = await syncTelegramChannelUpdates();
  const tracks = getTrackDatabase();
  res.json({ success: true, ...result, tracks });
});
setInterval(() => {
  if (process.env.TELEGRAM_BOT_TOKEN && isBotTokenValid) {
    syncTelegramChannelUpdates().catch(() => {
    });
  }
}, 8e3);
app.delete("/api/telegram/tracks/:id", (req, res) => {
  const { id } = req.params;
  let tracks = getTrackDatabase();
  tracks = tracks.filter((t) => t.id !== id);
  saveTrackDatabase(tracks);
  res.json({ success: true, message: "Track metadata removed." });
});
app.get("/api/telegram/stream/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tracks = getTrackDatabase();
    const track = tracks.find((t) => t.id === id);
    let streamUrl = "";
    if (track && track.telegramFileId && process.env.TELEGRAM_BOT_TOKEN && isBotTokenValid) {
      try {
        const fileRes = await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${track.telegramFileId}`
        );
        const fileJson = await fileRes.json();
        if (fileJson.ok && fileJson.result && fileJson.result.file_path) {
          streamUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileJson.result.file_path}`;
        } else {
          console.error(`[Telegram Stream ERROR] getFile failed: ${fileJson.description || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Failed to fetch Telegram file_path:", err);
      }
    }
    if (!streamUrl) {
      streamUrl = track?.telegramMediaUrl || "";
    }
    if (!streamUrl) {
      return res.status(404).json({ error: "Audio stream not available or Telegram credentials missing." });
    }
    const headRes = await fetch(streamUrl, { method: "HEAD" });
    const contentLength = headRes.headers.get("content-length") || "10485760";
    const originalType = headRes.headers.get("content-type") || "audio/mpeg";
    const range = req.headers.range;
    const mimeType = originalType.includes("video") ? "audio/mp4" : originalType.startsWith("audio/") ? originalType : "audio/mpeg";
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const total = parseInt(contentLength, 10);
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 1024 * 1024 - 1, total - 1);
      const chunkSize = end - start + 1;
      const mediaStream = await fetch(streamUrl, {
        headers: { Range: `bytes=${start}-${end}` }
      });
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": mimeType,
        "Cache-Control": "no-cache"
      });
      if (mediaStream.body) {
        const reader = mediaStream.body.getReader();
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
        "Content-Length": contentLength,
        "Content-Type": mimeType,
        "Accept-Ranges": "bytes"
      });
      const mediaStream = await fetch(streamUrl);
      if (mediaStream.body) {
        const reader = mediaStream.body.getReader();
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
    console.error("Stream error:", err);
    res.status(500).json({ error: "Failed to stream audio file." });
  }
});
app.post("/api/telegram/upload", async (req, res) => {
  try {
    const { title, artist, album, duration, base64Data, fileName, mimeType } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    let telegramFileId = "";
    let isVideoSource = mimeType?.includes("video");
    if (token && channelId && base64Data && isBotTokenValid) {
      const buffer = Buffer.from(base64Data.split(",")[1] || base64Data, "base64");
      const blob = new Blob([buffer], { type: mimeType || "audio/mpeg" });
      const formData = new FormData();
      formData.append("chat_id", channelId);
      formData.append(isVideoSource ? "video" : "audio", blob, fileName || "upload_track");
      formData.append("caption", `\u{1F3B5} ${title || "Track"} - ${artist || "Artist"} (Stored in Telegram Channel)`);
      const tgEndpoint = isVideoSource ? `https://api.telegram.org/bot${token}/sendVideo` : `https://api.telegram.org/bot${token}/sendAudio`;
      const tgRes = await fetch(tgEndpoint, {
        method: "POST",
        body: formData
      });
      const tgJson = await tgRes.json();
      if (tgJson.ok && tgJson.result) {
        const mediaObj = tgJson.result.audio || tgJson.result.video || tgJson.result.document;
        telegramFileId = mediaObj?.file_id || "";
      } else {
        console.error(`[Telegram Upload ERROR] Send failed: ${tgJson.description}`);
      }
    }
    const tracks = getTrackDatabase();
    const newTrack = {
      id: `tg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title || fileName || "Uploaded Telegram Track",
      artist: artist || "Telegram Cloud",
      album: album || "Telegram Channel Vault",
      thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
      duration: Number(duration) || 200,
      telegramFileId: telegramFileId || `simulated_file_id_${Date.now()}`,
      telegramMediaUrl: "",
      storageBackend: "Telegram Private Channel",
      isVideoSource,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      liked: true
    };
    tracks.unshift(newTrack);
    saveTrackDatabase(tracks);
    res.json({
      success: true,
      message: telegramFileId ? "Uploaded to Telegram Channel & saved metadata!" : "Saved metadata to database (Bot Token required for actual Channel posting).",
      track: newTrack
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message || "Upload failed." });
  }
});
async function startServer() {
  await validateTelegramBotToken();
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
