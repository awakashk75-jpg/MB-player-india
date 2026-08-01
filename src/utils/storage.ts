import { MediaItem, Playlist, EqualizerSettings, PlayerSettings } from '../types';

const DB_NAME = 'MBPlayerIndia_DB';
const DB_VERSION = 1;
const STORE_BLOBS = 'media_blobs';

const STORAGE_KEYS = {
  MEDIA_ITEMS: 'mb_player_media_items',
  PLAYLISTS: 'mb_player_playlists',
  EQUALIZER: 'mb_player_equalizer',
  SETTINGS: 'mb_player_settings',
  VAULT_PIN: 'mb_player_vault_pin',
  RECENT_SEARCHES: 'mb_player_recent_searches',
};

// Initialize IndexedDB for large media blob persistence
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaBlob(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BLOBS, 'readwrite');
      const store = tx.objectStore(STORE_BLOBS);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save media blob to IndexedDB:', err);
  }
}

export async function getMediaBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BLOBS, 'readonly');
      const store = tx.objectStore(STORE_BLOBS);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get media blob from IndexedDB:', err);
    return null;
  }
}

export async function deleteMediaBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BLOBS, 'readwrite');
      const store = tx.objectStore(STORE_BLOBS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete media blob:', err);
  }
}

// LocalStorage Helpers
export function loadSavedMediaItems(): MediaItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEDIA_ITEMS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMediaItems(items: MediaItem[]): void {
  try {
    // Strip blobls/urls generated dynamically before stringifying metadata
    const cleanItems = items.map((item) => {
      const copy = { ...item };
      delete copy.fileBlob;
      return copy;
    });
    localStorage.setItem(STORAGE_KEYS.MEDIA_ITEMS, JSON.stringify(cleanItems));
  } catch (err) {
    console.error('Error saving media items to LocalStorage:', err);
  }
}

export function loadSavedPlaylists(): Playlist[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePlaylists(playlists: Playlist[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  } catch (err) {
    console.error('Error saving playlists:', err);
  }
}

export const DEFAULT_EQUALIZER: EqualizerSettings = {
  enabled: true,
  preset: 'Normal',
  volumeBooster: 100,
  bands: {
    60: 0,
    230: 0,
    910: 0,
    3600: 0,
    14000: 0,
  },
};

export function loadEqualizerSettings(): EqualizerSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EQUALIZER);
    return data ? { ...DEFAULT_EQUALIZER, ...JSON.parse(data) } : DEFAULT_EQUALIZER;
  } catch {
    return DEFAULT_EQUALIZER;
  }
}

export function saveEqualizerSettings(settings: EqualizerSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EQUALIZER, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving equalizer settings:', err);
  }
}

export const DEFAULT_SETTINGS: PlayerSettings = {
  hardwareAcceleration: true,
  doubleTapSeekSeconds: 10,
  swipeGestures: true,
  autoPlayNext: true,
  backgroundPlay: true,
  aspectRatio: 'fit',
  subtitleFontSize: 'medium',
  subtitleColor: '#FFFFFF',
  subtitleBgOpacity: 0.6,
  subtitleDelaySeconds: 0,
  playbackSpeed: 1.0,
};

export function loadPlayerSettings(): PlayerSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function savePlayerSettings(settings: PlayerSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving player settings:', err);
  }
}

export function loadVaultPin(): string | null {
  return localStorage.getItem(STORAGE_KEYS.VAULT_PIN);
}

export function saveVaultPin(pin: string): void {
  localStorage.setItem(STORAGE_KEYS.VAULT_PIN, pin);
}
