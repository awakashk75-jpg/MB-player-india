import React, { useState, useEffect } from 'react';
import {
  MediaItem,
  ActiveTab,
  Playlist,
  EqualizerSettings,
  PlayerSettings
} from './types';
import { INITIAL_SAMPLE_MEDIA } from './data/sampleMedia';
import {
  loadSavedMediaItems,
  saveMediaItems,
  getMediaBlob,
  loadSavedPlaylists,
  savePlaylists,
  loadEqualizerSettings,
  saveEqualizerSettings,
  DEFAULT_EQUALIZER,
  loadPlayerSettings,
  savePlayerSettings,
  DEFAULT_SETTINGS,
  loadVaultPin,
  saveVaultPin
} from './utils/storage';

import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { VideoList } from './components/VideoList';
import { AudioPlayerView } from './components/AudioPlayerView';
import { FolderView } from './components/FolderView';
import { PlaylistView } from './components/PlaylistView';
import { PrivateVaultModal } from './components/PrivateVaultModal';
import { EqualizerModal } from './components/EqualizerModal';
import { MediaToolsModal } from './components/MediaToolsModal';
import { ImportModal } from './components/ImportModal';
import { SettingsModal } from './components/SettingsModal';
import { MediaPlayerModal } from './components/MediaPlayerModal';

import { Info, Film, Music, Wrench } from 'lucide-react';

export default function App() {
  // State initialization
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [equalizerSettings, setEqualizerSettings] = useState<EqualizerSettings>(DEFAULT_EQUALIZER);
  const [playerSettings, setPlayerSettings] = useState<PlayerSettings>(DEFAULT_SETTINGS);

  const [activeTab, setActiveTab] = useState<ActiveTab>('videos');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Currently playing media
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null);
  const [activeAudio, setActiveAudio] = useState<MediaItem | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEqualizerModal, setShowEqualizerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [selectedToolsItem, setSelectedToolsItem] = useState<MediaItem | null>(null);

  // Inspector Modal
  const [inspectedItem, setInspectedItem] = useState<MediaItem | null>(null);

  // Vault Security
  const [vaultPin, setVaultPin] = useState<string | null>(null);
  const [isVaultLocked, setIsVaultLocked] = useState(true);

  // Initial Data Loading Effect
  useEffect(() => {
    const savedItems = loadSavedMediaItems();
    if (savedItems && savedItems.length > 0) {
      // Re-hydrate blob ObjectURLs for user-uploaded offline files from IndexedDB
      Promise.all(
        savedItems.map(async (item) => {
          if (item.id.startsWith('user-media-')) {
            const blob = await getMediaBlob(item.id);
            if (blob) {
              return { ...item, url: URL.createObjectURL(blob), fileBlob: blob };
            }
          }
          return item;
        })
      ).then((hydrated) => {
        setMediaItems(hydrated);
      });
    } else {
      setMediaItems(INITIAL_SAMPLE_MEDIA);
      saveMediaItems(INITIAL_SAMPLE_MEDIA);
    }

    setPlaylists(loadSavedPlaylists());
    setEqualizerSettings(loadEqualizerSettings());
    setPlayerSettings(loadPlayerSettings());
    setVaultPin(loadVaultPin() || '1234');
  }, []);

  // Save Media Changes Helper
  const updateMediaList = (newList: MediaItem[]) => {
    setMediaItems(newList);
    saveMediaItems(newList);
  };

  // Handlers
  const handleToggleFavorite = (id: string) => {
    const updated = mediaItems.map((item) =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    updateMediaList(updated);
  };

  const handleMoveToVault = (item: MediaItem) => {
    const updated = mediaItems.map((m) =>
      m.id === item.id ? { ...m, isPrivate: true } : m
    );
    updateMediaList(updated);
    alert(`"${item.title}" moved to Secret Vault!`);
  };

  const handleRemoveFromVault = (item: MediaItem) => {
    const updated = mediaItems.map((m) =>
      m.id === item.id ? { ...m, isPrivate: false } : m
    );
    updateMediaList(updated);
  };

  const handleDeleteMedia = (id: string) => {
    const updated = mediaItems.filter((m) => m.id !== id);
    updateMediaList(updated);
  };

  const handleImportComplete = (newItems: MediaItem[]) => {
    const updated = [...newItems, ...mediaItems];
    updateMediaList(updated);
  };

  const handleCreatePlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      mediaIds: [],
      createdAt: Date.now(),
    };
    const updated = [newPlaylist, ...playlists];
    setPlaylists(updated);
    savePlaylists(updated);
  };

  const handleDeletePlaylist = (id: string) => {
    const updated = playlists.filter((p) => p.id !== id);
    setPlaylists(updated);
    savePlaylists(updated);
  };

  const handleAddToPlaylist = (item: MediaItem) => {
    if (playlists.length === 0) {
      handleCreatePlaylist('My Favorite Songs');
      alert('Created "My Favorite Songs" playlist and added item!');
      return;
    }
    const updated = playlists.map((p, idx) =>
      idx === 0 ? { ...p, mediaIds: Array.from(new Set([...p.mediaIds, item.id])) } : p
    );
    setPlaylists(updated);
    savePlaylists(updated);
    alert(`Added "${item.title}" to ${playlists[0].name}!`);
  };

  const handleUpdateWatchProgress = (id: string, seconds: number) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, progressSeconds: seconds } : item))
    );
  };

  // Filter lists based on tab & vault privacy
  const publicMedia = mediaItems.filter((m) => !m.isPrivate);
  const vaultMedia = mediaItems.filter((m) => m.isPrivate);

  const searchedMedia = publicMedia.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.folderName.toLowerCase().includes(q) ||
      item.format.toLowerCase().includes(q)
    );
  });

  const videos = searchedMedia.filter((m) => m.type === 'video');
  const audioTracks = searchedMedia.filter((m) => m.type === 'audio');

  // Next / Prev video navigation for Fullscreen Player
  const handleNextVideo = () => {
    if (!activeVideo) return;
    const idx = videos.findIndex((v) => v.id === activeVideo.id);
    const nextIdx = (idx + 1) % videos.length;
    setActiveVideo(videos[nextIdx] || activeVideo);
  };

  const handlePrevVideo = () => {
    if (!activeVideo) return;
    const idx = videos.findIndex((v) => v.id === activeVideo.id);
    const prevIdx = (idx - 1 + videos.length) % videos.length;
    setActiveVideo(videos[prevIdx] || activeVideo);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-gray-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      
      {/* Header Bar */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenImport={() => setShowImportModal(true)}
        onOpenVault={() => {
          setActiveTab('vault');
          setShowVaultModal(true);
        }}
        onOpenEqualizer={() => setShowEqualizerModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        isVaultLocked={isVaultLocked}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        totalMediaCount={publicMedia.length}
      />

      {/* Navigation Tab Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'vault') setShowVaultModal(true);
        }}
        counts={{
          videos: publicMedia.filter((m) => m.type === 'video').length,
          audio: publicMedia.filter((m) => m.type === 'audio').length,
          folders: new Set(publicMedia.map((m) => m.folderName)).size,
          playlists: playlists.length,
          vault: vaultMedia.length,
        }}
      />

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <VideoList
            items={videos}
            viewMode={viewMode}
            onPlayMedia={(item) => setActiveVideo(item)}
            onToggleFavorite={handleToggleFavorite}
            onMoveToVault={handleMoveToVault}
            onDeleteMedia={handleDeleteMedia}
            onAddToPlaylist={handleAddToPlaylist}
            onOpenInspector={(item) => setInspectedItem(item)}
            onOpenTrimmer={(item) => {
              setSelectedToolsItem(item);
              setShowToolsModal(true);
            }}
            onExtractAudio={(item) => {
              setSelectedToolsItem(item);
              setShowToolsModal(true);
            }}
          />
        )}

        {/* Audio / Music Tab */}
        {activeTab === 'audio' && (
          <AudioPlayerView
            audioItems={publicMedia.filter((m) => m.type === 'audio')}
            currentAudio={activeAudio}
            isPlaying={isAudioPlaying}
            onPlayAudio={(item) => {
              setActiveAudio(item);
              setIsAudioPlaying(true);
            }}
            onTogglePlayPause={() => setIsAudioPlaying(!isAudioPlaying)}
            onToggleFavorite={handleToggleFavorite}
            onOpenEqualizer={() => setShowEqualizerModal(true)}
            equalizerSettings={equalizerSettings}
          />
        )}

        {/* Folder Explorer Tab */}
        {activeTab === 'folders' && (
          <FolderView
            mediaItems={publicMedia}
            onPlayMedia={(item) => {
              if (item.type === 'video') setActiveVideo(item);
              else {
                setActiveAudio(item);
                setIsAudioPlaying(true);
                setActiveTab('audio');
              }
            }}
          />
        )}

        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <PlaylistView
            playlists={playlists}
            mediaItems={publicMedia}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onPlayMedia={(item) => {
              if (item.type === 'video') setActiveVideo(item);
              else {
                setActiveAudio(item);
                setIsAudioPlaying(true);
                setActiveTab('audio');
              }
            }}
          />
        )}

        {/* Tools & Utilities Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="bg-[#0F131C] border border-cyan-500/30 rounded-3xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <Wrench className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">MB Media Utilities Hub</h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Convert videos to MP3 audio, trim video clips, capture screenshots, and cast wirelessly to Smart TV.
              </p>
              <button
                onClick={() => setShowToolsModal(true)}
                className="px-6 py-3 bg-cyan-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg"
              >
                Launch Utilities
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Fullscreen Video Player Modal */}
      {activeVideo && (
        <MediaPlayerModal
          media={activeVideo}
          mediaList={videos}
          settings={playerSettings}
          equalizerSettings={equalizerSettings}
          onClose={() => setActiveVideo(null)}
          onNextMedia={handleNextVideo}
          onPrevMedia={handlePrevVideo}
          onOpenEqualizer={() => setShowEqualizerModal(true)}
          onUpdateProgress={handleUpdateWatchProgress}
        />
      )}

      {/* Secret Private Vault Modal */}
      {(showVaultModal || activeTab === 'vault') && (
        <PrivateVaultModal
          isLocked={isVaultLocked}
          vaultPin={vaultPin}
          vaultItems={vaultMedia}
          onUnlockVault={(entered) => {
            if (entered === vaultPin) {
              setIsVaultLocked(false);
              return true;
            }
            return false;
          }}
          onSetVaultPin={(newPin) => {
            setVaultPin(newPin);
            saveVaultPin(newPin);
          }}
          onLockVault={() => setIsVaultLocked(true)}
          onPlayMedia={(item) => {
            if (item.type === 'video') setActiveVideo(item);
            else {
              setActiveAudio(item);
              setIsAudioPlaying(true);
              setActiveTab('audio');
            }
          }}
          onRemoveFromVault={handleRemoveFromVault}
          onClose={() => {
            setShowVaultModal(false);
            if (activeTab === 'vault') setActiveTab('videos');
          }}
        />
      )}

      {/* Equalizer & Sound Booster Modal */}
      {showEqualizerModal && (
        <EqualizerModal
          settings={equalizerSettings}
          onChangeSettings={(newEq) => {
            setEqualizerSettings(newEq);
            saveEqualizerSettings(newEq);
          }}
          onClose={() => setShowEqualizerModal(false)}
        />
      )}

      {/* Media Tools / Extractor Modal */}
      {showToolsModal && (
        <MediaToolsModal
          items={publicMedia}
          selectedItem={selectedToolsItem}
          onClose={() => setShowToolsModal(false)}
          onAddExtractedAudio={(newAudio) => {
            const updated = [newAudio, ...mediaItems];
            updateMediaList(updated);
          }}
        />
      )}

      {/* Import Files Modal */}
      {showImportModal && (
        <ImportModal
          onImportComplete={handleImportComplete}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={playerSettings}
          onChangeSettings={(newSet) => {
            setPlayerSettings(newSet);
            savePlayerSettings(newSet);
          }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Media Inspector Modal */}
      {inspectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-gray-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3">
              <Info className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="font-bold text-white text-base">{inspectedItem.title}</h3>
                <p className="text-xs text-gray-400">Technical Media File Details</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono text-gray-300 bg-gray-900 p-4 rounded-2xl border border-gray-800">
              <div className="flex justify-between">
                <span className="text-gray-500">Format:</span>
                <span className="text-cyan-300 font-bold">{inspectedItem.format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Resolution:</span>
                <span className="text-amber-300 font-bold">{inspectedItem.resolution || 'Audio Track'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Storage Folder:</span>
                <span className="text-white">📁 {inspectedItem.folderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">File ID:</span>
                <span className="text-gray-400 text-[10px]">{inspectedItem.id}</span>
              </div>
            </div>

            <button
              onClick={() => setInspectedItem(null)}
              className="w-full py-2.5 bg-gray-800 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#090C12] border-t border-gray-800/60 py-4 px-6 text-center text-xs text-gray-500">
        <p className="font-medium">
          MB PLAYER INDIA © 2026 • Off-Line Smart Engine • Made with 🇮🇳 pride
        </p>
      </footer>
    </div>
  );
}
