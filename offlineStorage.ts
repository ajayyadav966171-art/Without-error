import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Track, DownloadedTrack } from '../types';

interface RemixAudioDBSchema extends DBSchema {
  downloaded_tracks: {
    key: string;
    value: DownloadedTrack;
  };
  audio_blobs: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      mimeType: string;
    };
  };
}

const DB_NAME = 'remix_music_offline_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RemixAudioDBSchema>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<RemixAudioDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('downloaded_tracks')) {
          db.createObjectStore('downloaded_tracks', { keyPath: 'track.id' });
        }
        if (!db.objectStoreNames.contains('audio_blobs')) {
          db.createObjectStore('audio_blobs', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveDownloadedTrack(
  track: Track,
  blob: Blob,
  fileSize: string,
  downloadedAt: string
): Promise<DownloadedTrack> {
  const db = await getDB();
  const downloadedTrack: DownloadedTrack = {
    track,
    downloadedAt,
    fileSize,
    progress: 100,
    isCompleted: true,
  };

  const tx = db.transaction(['downloaded_tracks', 'audio_blobs'], 'readwrite');
  await tx.objectStore('downloaded_tracks').put(downloadedTrack);
  await tx.objectStore('audio_blobs').put({
    id: track.id,
    blob,
    mimeType: blob.type || 'audio/mpeg',
  });
  await tx.done;

  return downloadedTrack;
}

export async function getDownloadedTrack(trackId: string): Promise<DownloadedTrack | undefined> {
  const db = await getDB();
  return db.get('downloaded_tracks', trackId);
}

export async function getAudioBlob(trackId: string): Promise<Blob | undefined> {
  const db = await getDB();
  const record = await db.get('audio_blobs', trackId);
  return record?.blob;
}

export async function getAllDownloadedTracks(): Promise<DownloadedTrack[]> {
  const db = await getDB();
  return db.getAll('downloaded_tracks');
}

export async function deleteDownloadedTrack(trackId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['downloaded_tracks', 'audio_blobs'], 'readwrite');
  await tx.objectStore('downloaded_tracks').delete(trackId);
  await tx.objectStore('audio_blobs').delete(trackId);
  await tx.done;
}

export async function clearAllDownloads(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['downloaded_tracks', 'audio_blobs'], 'readwrite');
  await tx.objectStore('downloaded_tracks').clear();
  await tx.objectStore('audio_blobs').clear();
  await tx.done;
}

export async function downloadTrackWithProgress(
  track: Track,
  onProgress: (progressPercent: number) => void
): Promise<DownloadedTrack> {
  const streamUrl = track.telegramFileId || track.id.startsWith('tg_')
    ? `/api/telegram/stream/${track.id}`
    : (track.audioUrl || `/api/telegram/stream/${track.id}`);

  onProgress(5);

  const response = await fetch(streamUrl);
  if (!response.ok) {
    throw new Error(`Failed to stream track for offline download (HTTP ${response.status})`);
  }

  const contentLength = response.headers.get('content-length');
  const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

  let audioBlob: Blob;

  if (response.body && typeof response.body.getReader === 'function') {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        receivedBytes += value.length;
        if (totalBytes > 0) {
          const percent = Math.min(98, Math.round((receivedBytes / totalBytes) * 100));
          onProgress(percent);
        } else {
          const approx = Math.min(95, 10 + Math.round(receivedBytes / 50000));
          onProgress(approx);
        }
      }
    }
    audioBlob = new Blob(chunks, { type: response.headers.get('content-type') || 'audio/mpeg' });
  } else {
    onProgress(50);
    audioBlob = await response.blob();
  }

  onProgress(99);

  const sizeInMB = (audioBlob.size / (1024 * 1024)).toFixed(1) + ' MB';
  const downloadedAt = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const downloadedItem = await saveDownloadedTrack(track, audioBlob, sizeInMB, downloadedAt);
  onProgress(100);

  return downloadedItem;
}
