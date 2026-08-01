import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, EqualizerSettings } from '../types';
import { formatDuration, formatBytes } from '../utils/mediaUtils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Sliders,
  Clock,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Disc,
  Heart,
  Plus
} from 'lucide-react';

interface AudioPlayerViewProps {
  audioItems: MediaItem[];
  currentAudio: MediaItem | null;
  isPlaying: boolean;
  onPlayAudio: (item: MediaItem) => void;
  onTogglePlayPause: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenEqualizer: () => void;
  equalizerSettings: EqualizerSettings;
}

export const AudioPlayerView: React.FC<AudioPlayerViewProps> = ({
  audioItems,
  currentAudio,
  isPlaying,
  onPlayAudio,
  onTogglePlayPause,
  onToggleFavorite,
  onOpenEqualizer,
  equalizerSettings,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync audio element source when currentAudio changes
  useEffect(() => {
    if (audioRef.current && currentAudio) {
      audioRef.current.src = currentAudio.url;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentAudio]);

  // Sync play/pause state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle Sleep Timer
  useEffect(() => {
    if (!sleepTimerMinutes) {
      setSleepTimerRemaining(null);
      return;
    }
    const totalSecs = sleepTimerMinutes * 60;
    setSleepTimerRemaining(totalSecs);

    const interval = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (audioRef.current) audioRef.current.pause();
          onTogglePlayPause(); // Pause
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  const activeSong = currentAudio || audioItems[0] || null;

  const handleNext = () => {
    if (!activeSong) return;
    const currentIndex = audioItems.findIndex((a) => a.id === activeSong.id);
    const nextIndex = (currentIndex + 1) % audioItems.length;
    onPlayAudio(audioItems[nextIndex]);
  };

  const handlePrev = () => {
    if (!activeSong) return;
    const currentIndex = audioItems.findIndex((a) => a.id === activeSong.id);
    const prevIndex = (currentIndex - 1 + audioItems.length) % audioItems.length;
    onPlayAudio(audioItems[prevIndex]);
  };

  return (
    <div className="space-y-6">
      {/* Hidden HTML5 Audio tag */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={handleNext}
      />

      {/* Featured Audio Player Hero Box */}
      {activeSong && (
        <div className="relative bg-gradient-to-br from-[#121A2B] via-[#0F1420] to-[#0A0D14] border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Vinyl Record / Cover Art Spinning Animation */}
            <div className="relative group shrink-0">
              <div
                className={`w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-cyan-500/30 relative transition-transform duration-500 ${
                  isPlaying ? 'rotate-1' : ''
                }`}
              >
                {activeSong.thumbnailUrl ? (
                  <img
                    src={activeSong.thumbnailUrl}
                    alt={activeSong.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-cyan-900 to-emerald-950 flex items-center justify-center text-cyan-400">
                    <Disc className={`w-20 h-20 ${isPlaying ? 'animate-spin' : ''}`} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </div>

            {/* Song Meta & Interactive Controls */}
            <div className="flex-1 text-center md:text-left w-full space-y-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
                  🎵 Now Playing Audio
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white line-clamp-1">
                  {activeSong.title}
                </h2>
                <p className="text-sm text-gray-400 font-medium">
                  {activeSong.artist || 'Unknown Artist'} • {activeSong.album || 'MB Music India'}
                </p>
              </div>

              {/* Animated Waveform Visualizer Simulation */}
              <div className="flex items-center justify-center md:justify-start gap-1 h-8 px-2">
                {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 35, 75, 85, 40, 65, 90, 50, 70].map(
                  (height, idx) => (
                    <div
                      key={idx}
                      className={`w-1 bg-cyan-400 rounded-full transition-all duration-300 ${
                        isPlaying ? 'animate-pulse' : 'opacity-40'
                      }`}
                      style={{
                        height: isPlaying ? `${Math.max(15, (height * (idx % 3 + 1)) % 100)}%` : '20%',
                      }}
                    />
                  )
                )}
              </div>

              {/* Progress Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = parseFloat(e.target.value);
                    setCurrentTime(newTime);
                    if (audioRef.current) audioRef.current.currentTime = newTime;
                  }}
                  className="w-full accent-cyan-400 bg-gray-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration || activeSong.duration)}</span>
                </div>
              </div>

              {/* Controls Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onOpenEqualizer}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Boost: {equalizerSettings.volumeBooster}%</span>
                  </button>

                  <button
                    onClick={() => setShowSleepTimerModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700 transition"
                  >
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {sleepTimerRemaining
                        ? `${Math.ceil(sleepTimerRemaining / 60)}m`
                        : 'Sleep Timer'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrev}
                    className="p-2.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white transition"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={onTogglePlayPause}
                    className="p-4 rounded-full bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/30 hover:scale-105 transition transform"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-slate-950 ml-0.5" />}
                  </button>

                  <button
                    onClick={handleNext}
                    className="p-2.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white transition"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Track List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          All Audio Tracks ({audioItems.length})
        </h3>

        <div className="space-y-2">
          {audioItems.map((item) => {
            const isThisActive = activeSong?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onPlayAudio(item)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                  isThisActive
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300'
                    : 'bg-[#0F131C] border-gray-800/80 hover:border-gray-700 text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-gray-500 truncate">
                      {item.artist || 'Indian Music'} • {formatBytes(item.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-gray-400">
                    {formatDuration(item.duration)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="p-1.5 text-gray-500 hover:text-amber-400"
                  >
                    <Heart className={`w-4 h-4 ${item.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sleep Timer Modal */}
      {showSleepTimerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-gray-800 rounded-2xl p-6 max-w-xs w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" /> Sleep Timer
            </h3>
            <p className="text-xs text-gray-400">
              Music will automatically stop playing after the chosen duration.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setSleepTimerMinutes(mins);
                    setShowSleepTimerModal(false);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-cyan-500 text-sm font-semibold text-gray-200 transition"
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setSleepTimerMinutes(null);
                setShowSleepTimerModal(false);
              }}
              className="w-full py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl"
            >
              Turn Off Timer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
