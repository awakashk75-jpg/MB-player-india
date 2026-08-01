import React, { useState } from 'react';
import { MediaItem } from '../types';
import { formatBytes, formatDuration } from '../utils/mediaUtils';
import {
  Folder,
  ChevronRight,
  Play,
  Film,
  Music,
  ArrowLeft,
  HardDrive
} from 'lucide-react';

interface FolderGroup {
  name: string;
  items: MediaItem[];
  totalSize: number;
}

interface FolderViewProps {
  mediaItems: MediaItem[];
  onPlayMedia: (item: MediaItem) => void;
}

export const FolderView: React.FC<FolderViewProps> = ({ mediaItems, onPlayMedia }) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Group items by folderName
  const folderGroups: Record<string, FolderGroup> = {};
  for (const item of mediaItems) {
    const name = item.folderName || 'Uncategorized';
    if (!folderGroups[name]) {
      folderGroups[name] = { name, items: [], totalSize: 0 };
    }
    folderGroups[name].items.push(item);
    folderGroups[name].totalSize += item.size;
  }

  const folderList = Object.values(folderGroups);

  if (selectedFolder) {
    const currentGroup = folderGroups[selectedFolder];
    if (!currentGroup) {
      setSelectedFolder(null);
      return null;
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-[#0F131C] p-3 rounded-2xl border border-gray-800">
          <button
            onClick={() => setSelectedFolder(null)}
            className="p-2 rounded-xl bg-gray-900 text-cyan-400 hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" /> {currentGroup.name}
            </h3>
            <p className="text-xs text-gray-400">
              {currentGroup.items.length} Files • {formatBytes(currentGroup.totalSize)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentGroup.items.map((item) => (
            <div
              key={item.id}
              onClick={() => onPlayMedia(item)}
              className="flex items-center gap-3 p-3 bg-[#0F131C] border border-gray-800 hover:border-cyan-500/50 rounded-xl transition cursor-pointer group"
            >
              <div className="w-14 aspect-video bg-gray-900 rounded-lg overflow-hidden shrink-0 relative">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    {item.type === 'video' ? <Film className="w-5 h-5" /> : <Music className="w-5 h-5" />}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition">
                  <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-gray-200 truncate group-hover:text-cyan-400">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {formatDuration(item.duration)} • {formatBytes(item.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Storage Directory Folders ({folderList.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {folderList.map((folder) => (
          <div
            key={folder.name}
            onClick={() => setSelectedFolder(folder.name)}
            className="flex items-center justify-between p-4 bg-[#0F131C] border border-gray-800/80 hover:border-amber-500/50 rounded-2xl transition cursor-pointer group hover:shadow-lg hover:shadow-amber-500/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Folder className="w-6 h-6 fill-amber-500/20" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-100 group-hover:text-amber-300 transition">
                  {folder.name}
                </h4>
                <p className="text-xs text-gray-400">
                  {folder.items.length} files • {formatBytes(folder.totalSize)}
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-amber-400 transition" />
          </div>
        ))}
      </div>
    </div>
  );
};
