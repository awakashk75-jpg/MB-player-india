import React, { useState } from 'react';
import { MediaItem, Playlist } from '../types';
import { formatDuration, formatBytes } from '../utils/mediaUtils';
import {
  Play,
  MoreVertical,
  Star,
  Lock,
  Clock,
  HardDrive,
  Film,
  ListMusic,
  Trash2,
  Scissors,
  Music,
  Info,
  CheckCircle2,
  Shuffle
} from 'lucide-react';

interface VideoListProps {
  items: MediaItem[];
  viewMode: 'grid' | 'list';
  onPlayMedia: (item: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
  onMoveToVault: (item: MediaItem) => void;
  onDeleteMedia: (id: string) => void;
  onAddToPlaylist: (item: MediaItem) => void;
  onOpenInspector: (item: MediaItem) => void;
  onOpenTrimmer: (item: MediaItem) => void;
  onExtractAudio: (item: MediaItem) => void;
}

export const VideoList: React.FC<VideoListProps> = ({
  items,
  viewMode,
  onPlayMedia,
  onToggleFavorite,
  onMoveToVault,
  onDeleteMedia,
  onAddToPlaylist,
  onOpenInspector,
  onOpenTrimmer,
  onExtractAudio,
}) => {
  const [filterFormat, setFilterFormat] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'duration'>('date');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter items
  const filtered = items.filter((item) => {
    if (filterFormat === 'ALL') return true;
    if (filterFormat === 'FAVORITES') return item.isFavorite;
    if (filterFormat === '4K') return item.resolution?.includes('4K');
    if (filterFormat === 'HD') return item.resolution?.includes('1080p') || item.resolution?.includes('720p');
    return item.format.toUpperCase() === filterFormat;
  });

  // Sort items
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    if (sortBy === 'size') return b.size - a.size;
    if (sortBy === 'duration') return b.duration - a.duration;
    return b.addedAt - a.addedAt; // default date
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
          <Film className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No Videos Found</h3>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          Import videos from your device or check other folders to get started with offline playback.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters & Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F131C] p-3 rounded-2xl border border-gray-800/80">
        {/* Quick Format Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {['ALL', 'FAVORITES', '4K', 'HD', 'MP4', 'MKV', 'WEBM'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFilterFormat(fmt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterFormat === fmt
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              {fmt === 'FAVORITES' ? '⭐ Favorites' : fmt}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-900 border border-gray-800 text-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="date">Recently Added</option>
            <option value="name">Name (A-Z)</option>
            <option value="size">File Size</option>
            <option value="duration">Duration</option>
          </select>
        </div>
      </div>

      {/* Grid View Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((item) => {
            const hasProgress = item.progressSeconds && item.progressSeconds > 0;
            const progressPercent = hasProgress
              ? Math.min(100, Math.round((item.progressSeconds! / item.duration) * 100))
              : 0;

            return (
              <div
                key={item.id}
                className="group relative bg-[#0F131C] border border-gray-800/80 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col"
              >
                {/* Thumbnail Header */}
                <div
                  onClick={() => onPlayMedia(item)}
                  className="relative aspect-video bg-gray-950 overflow-hidden cursor-pointer group"
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-950 text-gray-700">
                      <Film className="w-12 h-12" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Play Button Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-cyan-300">
                        {item.format}
                      </span>
                      {item.resolution && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/80 backdrop-blur-md text-[10px] font-black text-slate-950">
                          {item.resolution}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                      className="pointer-events-auto p-1.5 rounded-full bg-black/60 backdrop-blur-md text-gray-300 hover:text-amber-400 transition"
                      title={item.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          item.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Bottom Duration Badge */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-mono font-bold text-white tracking-wider">
                    {formatDuration(item.duration)}
                  </div>

                  {/* Progress Bar overlay */}
                  {hasProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-amber-400"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => onPlayMedia(item)}
                        className="font-bold text-sm text-gray-100 line-clamp-2 hover:text-cyan-400 transition cursor-pointer leading-snug"
                        title={item.title}
                      >
                        {item.title}
                      </h4>

                      {/* Item Menu Toggle */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === item.id ? null : item.id)
                          }
                          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === item.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-[#141A26] border border-gray-700/80 rounded-xl shadow-2xl z-20 py-1 text-xs text-gray-200">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onPlayMedia(item);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-cyan-500/10 hover:text-cyan-400 transition"
                              >
                                <Play className="w-3.5 h-3.5" /> Play Video
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onAddToPlaylist(item);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 transition"
                              >
                                <ListMusic className="w-3.5 h-3.5" /> Add to Playlist
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onExtractAudio(item);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 text-emerald-400 transition"
                              >
                                <Music className="w-3.5 h-3.5" /> Extract Audio (MP3)
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onOpenTrimmer(item);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 text-amber-400 transition"
                              >
                                <Scissors className="w-3.5 h-3.5" /> Trim / Crop Video
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onMoveToVault(item);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-purple-500/10 text-purple-300 transition"
                              >
                                <Lock className="w-3.5 h-3.5 text-purple-400" /> Move to Vault
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onOpenInspector(item);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 transition"
                              >
                                <Info className="w-3.5 h-3.5" /> Media Info
                              </button>
                              <div className="my-1 border-t border-gray-800" />
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onDeleteMedia(item.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-500/10 text-rose-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete File
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-800/60 pt-2">
                    <span className="truncate max-w-[110px] text-gray-400 font-medium">
                      📁 {item.folderName}
                    </span>
                    <span>{formatBytes(item.size)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View Mode */
        <div className="space-y-2">
          {sorted.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2.5 bg-[#0F131C] border border-gray-800/80 hover:border-cyan-500/40 rounded-xl transition group"
            >
              <div
                onClick={() => onPlayMedia(item)}
                className="relative w-24 aspect-video bg-gray-900 rounded-lg overflow-hidden shrink-0 cursor-pointer"
              >
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <Film className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/50 transition">
                  <Play className="w-5 h-5 text-cyan-400 fill-cyan-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition" />
                </div>
                <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono font-bold text-white">
                  {formatDuration(item.duration)}
                </span>
              </div>

              <div className="flex-1 min-w-0" onClick={() => onPlayMedia(item)}>
                <h4 className="font-bold text-sm text-gray-100 truncate hover:text-cyan-400 cursor-pointer">
                  {item.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span>📁 {item.folderName}</span>
                  <span>•</span>
                  <span>{item.format}</span>
                  <span>•</span>
                  <span>{formatBytes(item.size)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-amber-400 transition"
                >
                  <Star
                    className={`w-4 h-4 ${
                      item.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                    }`}
                  />
                </button>
                <button
                  onClick={() => onPlayMedia(item)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold border border-cyan-500/30 transition"
                >
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
