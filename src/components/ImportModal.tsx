import React, { useState } from 'react';
import { MediaItem } from '../types';
import { saveMediaBlob } from '../utils/storage';
import { Upload, FileVideo, FileAudio, FolderPlus, X, CheckCircle2 } from 'lucide-react';

interface ImportModalProps {
  onImportComplete: (items: MediaItem[]) => void;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onImportComplete, onClose }) => {
  const [selectedFolder, setSelectedFolder] = useState('Custom Uploads');
  const [importedCount, setImportedCount] = useState(0);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isAudio = file.type.startsWith('audio/');
      const id = `user-media-${Date.now()}-${i}`;
      const url = URL.createObjectURL(file);

      // Save binary blob into IndexedDB for persistent offline playback across reloads!
      await saveMediaBlob(id, file);

      const ext = file.name.split('.').pop()?.toUpperCase() || (isAudio ? 'MP3' : 'MP4');

      const newItem: MediaItem = {
        id,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url,
        type: isAudio ? 'audio' : 'video',
        folderName: selectedFolder,
        duration: 180, // Default duration estimate until metadata loads
        size: file.size,
        format: ext,
        resolution: isAudio ? undefined : '1080p HD',
        addedAt: Date.now(),
        fileBlob: file,
      };

      newItems.push(newItem);
    }

    setImportedCount(newItems.length);
    setTimeout(() => {
      onImportComplete(newItems);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101420] border border-cyan-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-6 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-xl bg-gray-900"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
          <Upload className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-lg font-black text-white">Import Offline Media Files</h2>
          <p className="text-xs text-gray-400">
            Select videos or audio files from your device to play offline in MB Player India.
          </p>
        </div>

        {/* Destination Folder Selector */}
        <div className="text-left space-y-1">
          <label className="text-xs font-bold text-gray-400">Save to Folder Category</label>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="Custom Uploads">📁 Custom Uploads</option>
            <option value="Movies">🎬 Movies</option>
            <option value="Downloads">📥 Downloads</option>
            <option value="Camera">📷 Camera Recordings</option>
            <option value="Music & Podcasts">🎵 Music & Podcasts</option>
          </select>
        </div>

        {/* Dropzone Upload Box */}
        <label className="block p-8 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl bg-gray-900/50 hover:bg-cyan-500/5 cursor-pointer transition group">
          <input
            type="file"
            multiple
            accept="video/*,audio/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <div className="space-y-2">
            <FolderPlus className="w-8 h-8 text-cyan-400 mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-gray-200">
              Click to browse or drop videos & audio files
            </p>
            <p className="text-[10px] text-gray-500">
              Supports MP4, MKV, AVI, MOV, WEBM, MP3, M4A, WAV
            </p>
          </div>
        </label>

        {importedCount > 0 && (
          <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Successfully Imported {importedCount} Files!
          </div>
        )}
      </div>
    </div>
  );
};
