import React, { useState } from 'react';
import { Playlist, MediaItem } from '../types';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  Film,
  Music,
  ChevronRight
} from 'lucide-react';

interface PlaylistViewProps {
  playlists: Playlist[];
  mediaItems: MediaItem[];
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: string) => void;
  onPlayMedia: (item: MediaItem) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlists,
  mediaItems,
  onCreatePlaylist,
  onDeletePlaylist,
  onPlayMedia,
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const playlistItems = selectedPlaylist
    ? mediaItems.filter((item) => selectedPlaylist.mediaIds.includes(item.id))
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Custom Playlists ({playlists.length})
        </h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-bold transition"
        >
          <Plus className="w-4 h-4" /> Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="bg-[#0F131C] border border-gray-800 rounded-2xl p-8 text-center space-y-3">
          <ListMusic className="w-10 h-10 text-cyan-400 mx-auto" />
          <h4 className="font-bold text-white text-base">No Playlists Created Yet</h4>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Organize your favorite videos, movie clips, and audio tracks into custom playlists.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
          >
            Create First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => {
            const count = playlist.mediaIds.length;
            const isSelected = playlist.id === selectedPlaylistId;

            return (
              <div
                key={playlist.id}
                className={`p-4 rounded-2xl border transition ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-[#0F131C] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                      <ListMusic className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{playlist.name}</h4>
                      <p className="text-xs text-gray-400">{count} Media Items</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeletePlaylist(playlist.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 transition"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedPlaylistId(isSelected ? null : playlist.id)}
                  className="w-full py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-1"
                >
                  {isSelected ? 'Hide Items' : 'View Playlist Items'} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded Playlist Content */}
      {selectedPlaylist && (
        <div className="mt-6 space-y-3 bg-[#0F131C] border border-cyan-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h4 className="font-bold text-base text-white">
              Playlist: <span className="text-cyan-400">{selectedPlaylist.name}</span>
            </h4>
            {playlistItems.length > 0 && (
              <button
                onClick={() => onPlayMedia(playlistItems[0])}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                <Play className="w-4 h-4 fill-slate-950" /> Play All
              </button>
            )}
          </div>

          {playlistItems.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">
              No videos added to this playlist yet. Add videos from the Videos list context menu.
            </p>
          ) : (
            <div className="space-y-2">
              {playlistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onPlayMedia(item)}
                  className="flex items-center justify-between p-2.5 bg-gray-900/80 rounded-xl hover:bg-gray-800 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.type === 'video' ? <Film className="w-4 h-4 text-cyan-400" /> : <Music className="w-4 h-4 text-emerald-400" />}
                    <span className="text-xs font-bold text-gray-200 truncate">{item.title}</span>
                  </div>
                  <Play className="w-4 h-4 text-cyan-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal for Creating Playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-[#121824] border border-gray-800 rounded-2xl p-6 max-w-sm w-full space-y-4"
          >
            <h3 className="text-base font-bold text-white">Create New Playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="e.g. South Indian Blockbusters"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
