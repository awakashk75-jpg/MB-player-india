export type MediaType = 'video' | 'audio';

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  url?: string;
  content?: string; // VTT or SRT string content
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: MediaType;
  folderName: string;
  duration: number; // in seconds
  size: number; // in bytes
  format: string; // mp4, mkv, webm, mp3, m4a, etc.
  resolution?: string; // e.g. "1080p", "4K"
  addedAt: number;
  lastPlayedAt?: number;
  progressSeconds?: number;
  isFavorite?: boolean;
  isPrivate?: boolean;
  thumbnailUrl?: string;
  artist?: string;
  album?: string;
  subtitles?: SubtitleTrack[];
  fileBlob?: Blob; // For user uploaded files stored in IndexedDB
}

export interface FolderGroup {
  name: string;
  itemCount: number;
  totalSize: number;
  thumbnailUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  mediaIds: string[];
  createdAt: number;
  coverUrl?: string;
}

export interface EqualizerSettings {
  enabled: boolean;
  preset: 'Normal' | 'Bass Boost' | 'Treble Boost' | 'Vocal' | 'Bollywood Beats' | 'Rock' | 'Custom';
  volumeBooster: number; // 100% to 200%
  bands: {
    60: number;   // dB (-12 to 12)
    230: number;
    910: number;
    3600: number;
    14000: number;
  };
}

export interface PlayerSettings {
  hardwareAcceleration: boolean;
  doubleTapSeekSeconds: number; // e.g. 10
  swipeGestures: boolean;
  autoPlayNext: boolean;
  backgroundPlay: boolean;
  aspectRatio: 'fit' | '16:9' | '4:3' | 'fill' | 'stretch' | 'crop';
  subtitleFontSize: 'small' | 'medium' | 'large' | 'huge';
  subtitleColor: string; // hex
  subtitleBgOpacity: number; // 0 to 1
  subtitleDelaySeconds: number; // e.g. -2.0 to +2.0
  playbackSpeed: number; // 0.25 to 3.0
}

export type ActiveTab = 'videos' | 'audio' | 'folders' | 'playlists' | 'vault' | 'tools';
