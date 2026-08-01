import React, { useState } from 'react';
import { MediaItem } from '../types';
import { formatDuration, formatBytes, captureVideoFrame } from '../utils/mediaUtils';
import {
  Wrench,
  Music,
  Scissors,
  Tv,
  Info,
  Download,
  Play,
  CheckCircle2,
  Sparkles,
  Camera,
  Layers
} from 'lucide-react';

interface MediaToolsModalProps {
  items: MediaItem[];
  selectedItem: MediaItem | null;
  onClose: () => void;
  onAddExtractedAudio: (audioItem: MediaItem) => void;
}

export const MediaToolsModal: React.FC<MediaToolsModalProps> = ({
  items,
  selectedItem,
  onClose,
  onAddExtractedAudio,
}) => {
  const [activeTool, setActiveTool] = useState<'extractor' | 'trimmer' | 'cast' | 'inspector'>('extractor');
  const [targetMedia, setTargetMedia] = useState<MediaItem | null>(selectedItem || items[0] || null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);

  // Cast state
  const [castConnected, setCastConnected] = useState(false);
  const [selectedTv, setSelectedTv] = useState('Samsung Smart TV 55" (Living Room)');

  // Trimmer state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(targetMedia ? Math.floor(targetMedia.duration / 2) : 10);
  const [capturedFrameUrl, setCapturedFrameUrl] = useState<string | null>(null);

  const handleExtractAudio = () => {
    if (!targetMedia) return;
    setIsExtracting(true);

    setTimeout(() => {
      setIsExtracting(false);
      setExtractedSuccess(true);

      const newAudio: MediaItem = {
        id: `extracted-${Date.now()}`,
        title: `${targetMedia.title} (Audio MP3)`,
        url: targetMedia.url,
        type: 'audio',
        folderName: 'Music & Podcasts',
        duration: targetMedia.duration,
        size: Math.floor(targetMedia.size * 0.15), // ~15% size of video
        format: 'MP3',
        addedAt: Date.now(),
        artist: 'Extracted Track',
        album: 'MB Extractor India',
        thumbnailUrl: targetMedia.thumbnailUrl,
      };

      onAddExtractedAudio(newAudio);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101420] border border-cyan-500/30 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                MB Media Utilities <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">Offline Tools</span>
              </h2>
              <p className="text-xs text-gray-400">
                Audio Extractor, Trimmer, Screen Saver & TV Cast
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold"
          >
            Close
          </button>
        </div>

        {/* Tool Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'extractor', label: 'Video to MP3', icon: Music },
            { id: 'trimmer', label: 'Trimmer & Capture', icon: Scissors },
            { id: 'cast', label: 'Cast to TV', icon: Tv },
            { id: 'inspector', label: 'Media Inspector', icon: Info },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTool === t.id;

            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTool(t.id as any);
                  setExtractedSuccess(false);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition border ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Media Selector Dropdown */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Select Source File
          </label>
          <select
            value={targetMedia?.id || ''}
            onChange={(e) => {
              const item = items.find((i) => i.id === e.target.value);
              if (item) {
                setTargetMedia(item);
                setTrimEnd(Math.floor(item.duration / 2));
                setExtractedSuccess(false);
              }
            }}
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} ({item.format} • {formatDuration(item.duration)})
              </option>
            ))}
          </select>
        </div>

        {/* Tool Content Panels */}
        {activeTool === 'extractor' && (
          <div className="bg-gradient-to-br from-[#131A29] to-[#0A0D15] p-6 rounded-2xl border border-cyan-500/30 text-center space-y-4">
            <Music className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-white">Extract High-Quality Audio Track</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Converts video stream into offline MP3 audio stored directly in your Music library.
            </p>

            {extractedSuccess ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> MP3 Audio Extracted & Saved to Music Library!
              </div>
            ) : (
              <button
                onClick={handleExtractAudio}
                disabled={isExtracting}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:brightness-110 disabled:opacity-50"
              >
                {isExtracting ? 'Extracting Audio Track...' : 'Extract MP3 Audio Now'}
              </button>
            )}
          </div>
        )}

        {activeTool === 'trimmer' && targetMedia && (
          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" /> Video Trimmer & Screen Frame Capture
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono text-gray-300">
                <span>Start: {formatDuration(trimStart)}</span>
                <span>End: {formatDuration(trimEnd)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-gray-400">Start Time (sec)</label>
                  <input
                    type="range"
                    min={0}
                    max={targetMedia.duration}
                    value={trimStart}
                    onChange={(e) => setTrimStart(parseInt(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400">End Time (sec)</label>
                  <input
                    type="range"
                    min={trimStart + 1}
                    max={targetMedia.duration}
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(parseInt(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => alert(`Clip trimmed from ${formatDuration(trimStart)} to ${formatDuration(trimEnd)}!`)}
                  className="flex-1 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Save Trimmed Clip
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTool === 'cast' && (
          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-4 text-center">
            <Tv className="w-12 h-12 text-blue-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Cast to Smart TV / Chromecast</h3>
            <p className="text-xs text-gray-400">
              Stream offline video files wirelessly to your home TV over Wi-Fi.
            </p>

            <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl max-w-sm mx-auto text-left text-xs space-y-2">
              <span className="font-bold text-gray-400">Available Devices:</span>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900 border border-gray-800">
                <span className="text-white font-medium">{selectedTv}</span>
                <button
                  onClick={() => setCastConnected(!castConnected)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    castConnected ? 'bg-emerald-500 text-slate-950' : 'bg-blue-600 text-white'
                  }`}
                >
                  {castConnected ? 'Connected' : 'Cast Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTool === 'inspector' && targetMedia && (
          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" /> Media Codec & Metadata Inspector
            </h3>

            <div className="grid grid-cols-2 gap-2 text-gray-300 font-mono">
              <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                <span className="text-gray-500 block">Format</span>
                <span className="font-bold text-cyan-300">{targetMedia.format}</span>
              </div>
              <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                <span className="text-gray-500 block">Resolution</span>
                <span className="font-bold text-amber-300">{targetMedia.resolution || 'N/A'}</span>
              </div>
              <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                <span className="text-gray-500 block">Duration</span>
                <span className="font-bold text-white">{formatDuration(targetMedia.duration)}</span>
              </div>
              <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                <span className="text-gray-500 block">File Size</span>
                <span className="font-bold text-white">{formatBytes(targetMedia.size)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
