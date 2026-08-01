import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, PlayerSettings, EqualizerSettings, SubtitleTrack } from '../types';
import { formatDuration, parseSRT, ParsedSubtitleCue, captureVideoFrame, getAspectRatioStyle } from '../utils/mediaUtils';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Sliders,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  Subtitles,
  Gauge,
  Camera,
  Layers,
  ArrowLeft,
  Tv,
  HelpCircle,
  Repeat,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';

interface MediaPlayerModalProps {
  media: MediaItem;
  mediaList: MediaItem[];
  settings: PlayerSettings;
  equalizerSettings: EqualizerSettings;
  onClose: () => void;
  onNextMedia: () => void;
  onPrevMedia: () => void;
  onOpenEqualizer: () => void;
  onUpdateProgress: (id: string, seconds: number) => void;
}

export const MediaPlayerModal: React.FC<MediaPlayerModalProps> = ({
  media,
  mediaList,
  settings,
  equalizerSettings,
  onClose,
  onNextMedia,
  onPrevMedia,
  onOpenEqualizer,
  onUpdateProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(media.progressSeconds || 0);
  const [duration, setDuration] = useState(media.duration || 0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [brightness, setBrightness] = useState(1.0); // 0.2 to 1.0
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<PlayerSettings['aspectRatio']>(settings.aspectRatio || 'fit');
  const [playbackSpeed, setPlaybackSpeed] = useState(settings.playbackSpeed || 1.0);

  // Gesture Feedback Overlays
  const [gestureType, setGestureType] = useState<'volume' | 'brightness' | 'seek' | null>(null);
  const [gestureValue, setGestureValue] = useState<number>(0);
  const [doubleTapRipple, setDoubleTapRipple] = useState<'left' | 'right' | null>(null);

  // Subtitle state
  const [activeSubtitle, setActiveSubtitle] = useState<SubtitleTrack | null>(media.subtitles?.[0] || null);
  const [subtitleCues, setSubtitleCues] = useState<ParsedSubtitleCue[]>([]);
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>('');
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  // Menus
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [abRepeat, setAbRepeat] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
  const [screenshotMsg, setScreenshotMsg] = useState(false);

  // Touch Gesture Drag Tracking
  const touchStartRef = useRef<{ x: number; y: number; vol: number; bright: number; time: number } | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse SRT content whenever activeSubtitle changes
  useEffect(() => {
    if (activeSubtitle?.content) {
      const cues = parseSRT(activeSubtitle.content);
      setSubtitleCues(cues);
    } else {
      setSubtitleCues([]);
      setCurrentSubtitleText('');
    }
  }, [activeSubtitle]);

  // Sync Subtitles during playback timeupdate
  useEffect(() => {
    if (subtitleCues.length === 0) {
      setCurrentSubtitleText('');
      return;
    }
    const adjustedTime = currentTime - subtitleDelay;
    const match = subtitleCues.find((cue) => adjustedTime >= cue.start && adjustedTime <= cue.end);
    setCurrentSubtitleText(match ? match.text : '');
  }, [currentTime, subtitleCues, subtitleDelay]);

  // Handle Initial Media Load
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = media.progressSeconds || 0;
      videoRef.current.playbackRate = playbackSpeed;
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      }
    }
  }, [media]);

  // Handle Auto-Hide Controls
  const resetControlsTimeout = () => {
    if (isLocked) return;
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 4000);
  };

  const togglePlayPause = () => {
    if (isLocked) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
    resetControlsTimeout();
  };

  // Double Tap Seek (±10 seconds)
  const handleDoubleTap = (side: 'left' | 'right') => {
    if (isLocked || !videoRef.current) return;
    const seekDelta = side === 'left' ? -settings.doubleTapSeekSeconds : settings.doubleTapSeekSeconds;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seekDelta));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);

    setDoubleTapRipple(side);
    setTimeout(() => setDoubleTapRipple(null), 600);
    resetControlsTimeout();
  };

  // Touch Gesture Handlers (Left side = Brightness, Right side = Volume)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLocked) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      vol: volume,
      bright: brightness,
      time: currentTime,
    };
    resetControlsTimeout();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isLocked || !touchStartRef.current || !containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const deltaY = touchStartRef.current.y - touch.clientY; // swipe up = positive
    const deltaX = touch.clientX - touchStartRef.current.x;

    const isLeftSide = touchStartRef.current.x < rect.width / 2;

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      // Vertical Swipe
      const percentChange = deltaY / (rect.height * 0.6);

      if (isLeftSide) {
        // Brightness control
        const newBright = Math.max(0.1, Math.min(1.0, touchStartRef.current.bright + percentChange));
        setBrightness(newBright);
        setGestureType('brightness');
        setGestureValue(Math.round(newBright * 100));
      } else {
        // Volume control
        const newVol = Math.max(0, Math.min(1.0, touchStartRef.current.vol + percentChange));
        setVolume(newVol);
        if (videoRef.current) videoRef.current.volume = newVol;
        setGestureType('volume');
        setGestureValue(Math.round(newVol * 100));
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    setTimeout(() => setGestureType(null), 800);
  };

  // Screenshot capture
  const handleScreenshot = () => {
    if (!videoRef.current) return;
    const dataUrl = captureVideoFrame(videoRef.current);
    if (dataUrl) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${media.title}-frame.jpg`;
      a.click();
      setScreenshotMsg(true);
      setTimeout(() => setScreenshotMsg(false), 2000);
    }
  };

  // Subtitle font size mapping
  const getSubFontSizeClass = () => {
    switch (settings.subtitleFontSize) {
      case 'small': return 'text-sm md:text-base';
      case 'large': return 'text-xl md:text-2xl';
      case 'huge': return 'text-2xl md:text-4xl';
      case 'medium':
      default: return 'text-lg md:text-xl';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* Video Canvas Element */}
      <video
        ref={videoRef}
        src={media.url}
        autoPlay
        playsInline
        style={getAspectRatioStyle(aspectRatio)}
        onTimeUpdate={() => {
          if (videoRef.current) {
            const cur = videoRef.current.currentTime;
            setCurrentTime(cur);
            onUpdateProgress(media.id, cur);

            // Check A-B repeat
            if (abRepeat.b && cur >= abRepeat.b && abRepeat.a !== null) {
              videoRef.current.currentTime = abRepeat.a;
            }
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            videoRef.current.volume = volume;
          }
        }}
        onEnded={() => {
          if (settings.autoPlayNext) {
            onNextMedia();
          } else {
            setIsPlaying(false);
          }
        }}
        onClick={togglePlayPause}
        className="w-full h-full cursor-pointer transition-all duration-300"
      />

      {/* Brightness Dimming Overlay */}
      <div
        className="absolute inset-0 bg-black pointer-events-none transition-opacity"
        style={{ opacity: 1 - brightness }}
      />

      {/* Gesture Feedback Floating Badge */}
      {gestureType && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md border border-cyan-500/40 px-6 py-4 rounded-2xl flex items-center gap-3 text-white shadow-2xl pointer-events-none animate-pulse z-40">
          {gestureType === 'brightness' ? (
            <Sparkles className="w-6 h-6 text-amber-400" />
          ) : (
            <Volume2 className="w-6 h-6 text-cyan-400" />
          )}
          <span className="text-xl font-bold font-mono">
            {gestureType.toUpperCase()}: {gestureValue}%
          </span>
        </div>
      )}

      {/* Double Tap Seek Ripples */}
      {doubleTapRipple && (
        <div
          className={`absolute top-0 bottom-0 w-1/3 flex items-center justify-center bg-cyan-500/10 pointer-events-none z-40 transition-all ${
            doubleTapRipple === 'left' ? 'left-0 rounded-r-full' : 'right-0 rounded-l-full'
          }`}
        >
          <div className="text-center text-cyan-300 font-bold text-lg animate-bounce">
            {doubleTapRipple === 'left' ? `-${settings.doubleTapSeekSeconds}s ↺` : `+${settings.doubleTapSeekSeconds}s ↻`}
          </div>
        </div>
      )}

      {/* On-Screen Subtitle Rendering */}
      {currentSubtitleText && (
        <div className="absolute bottom-20 left-6 right-6 text-center pointer-events-none z-30">
          <span
            className={`inline-block px-4 py-1.5 rounded-xl font-bold tracking-wide shadow-2xl ${getSubFontSizeClass()}`}
            style={{
              color: settings.subtitleColor || '#FFFFFF',
              backgroundColor: `rgba(0, 0, 0, ${settings.subtitleBgOpacity ?? 0.6})`,
            }}
          >
            {currentSubtitleText}
          </span>
        </div>
      )}

      {/* Screenshot Flash Notification */}
      {screenshotMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs z-50 shadow-xl flex items-center gap-2">
          <Camera className="w-4 h-4" /> Frame Saved to Downloads!
        </div>
      )}

      {/* Lock Screen Floating Unlock Button */}
      {isLocked && (
        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={() => setIsLocked(false)}
            className="p-3 bg-purple-600/90 text-white rounded-2xl font-bold shadow-2xl border border-purple-400 flex items-center gap-2"
          >
            <Lock className="w-5 h-5" /> Tap to Unlock Screen
          </button>
        </div>
      )}

      {/* Main Full Controls Overlay */}
      {showControls && !isLocked && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/80 flex flex-col justify-between p-4 md:p-6 z-40 transition-opacity">
          
          {/* Top Control Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-black/60 text-white hover:bg-gray-800 border border-white/10 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm md:text-base font-bold text-white line-clamp-1">
                    {media.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase border border-cyan-500/40">
                    {settings.hardwareAcceleration ? 'HW Accelerated' : 'SW Decoder'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">📁 {media.folderName} • {media.format}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleScreenshot}
                className="p-2.5 rounded-xl bg-black/60 text-gray-300 hover:text-white border border-white/10"
                title="Capture Screenshot Frame"
              >
                <Camera className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenEqualizer}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{equalizerSettings.volumeBooster}% Boost</span>
              </button>

              <button
                onClick={() => setIsLocked(true)}
                className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30"
                title="Lock Touch Controls"
              >
                <Unlock className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Big Play Controls */}
          <div className="flex items-center justify-center gap-6 my-auto">
            <button
              onClick={() => handleDoubleTap('left')}
              className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
              title="Seek -10s"
            >
              <RotateCcw className="w-7 h-7" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-5 rounded-full bg-cyan-400 text-slate-950 font-black shadow-2xl shadow-cyan-500/40 hover:scale-105 transition transform"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-slate-950 ml-0.5" />}
            </button>

            <button
              onClick={() => handleDoubleTap('right')}
              className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
              title="Seek +10s"
            >
              <RotateCw className="w-7 h-7" />
            </button>
          </div>

          {/* Bottom Controls Bar */}
          <div className="space-y-3">
            {/* Seek Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="w-full accent-cyan-400 bg-gray-800/80 h-2 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-300">
                <span>{formatDuration(currentTime)}</span>
                <div className="flex items-center gap-2">
                  {abRepeat.a !== null && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      A-B Loop: {formatDuration(abRepeat.a)} - {abRepeat.b ? formatDuration(abRepeat.b) : 'End'}
                    </span>
                  )}
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons Row */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
              <div className="flex items-center gap-2">
                {/* Speed Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-200 font-bold flex items-center gap-1 hover:border-cyan-500"
                  >
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{playbackSpeed}x</span>
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-32 bg-[#121824] border border-gray-700 rounded-xl p-1 shadow-2xl z-50">
                      {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setPlaybackSpeed(s);
                            if (videoRef.current) videoRef.current.playbackRate = s;
                            setShowSpeedMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg font-bold text-xs flex items-center justify-between ${
                            playbackSpeed === s ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          <span>{s}x</span>
                          {playbackSpeed === s && <Check className="w-3 h-3 text-cyan-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Aspect Ratio Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setShowAspectMenu(!showAspectMenu)}
                    className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-200 font-bold flex items-center gap-1 hover:border-cyan-500"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="uppercase">{aspectRatio}</span>
                  </button>

                  {showAspectMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-32 bg-[#121824] border border-gray-700 rounded-xl p-1 shadow-2xl z-50">
                      {['fit', '16:9', '4:3', 'fill', 'stretch', 'crop'].map((ar) => (
                        <button
                          key={ar}
                          onClick={() => {
                            setAspectRatio(ar as any);
                            setShowAspectMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg font-bold text-xs uppercase ${
                            aspectRatio === ar ? 'bg-amber-500/20 text-amber-300' : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          {ar}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtitle Chooser */}
                <div className="relative">
                  <button
                    onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                    className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1 ${
                      activeSubtitle
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-gray-900 border-gray-800 text-gray-400'
                    }`}
                  >
                    <Subtitles className="w-3.5 h-3.5" />
                    <span>{activeSubtitle ? activeSubtitle.label : 'Subtitles Off'}</span>
                  </button>

                  {showSubtitleMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#121824] border border-gray-700 rounded-xl p-2 shadow-2xl z-50 space-y-1">
                      <button
                        onClick={() => {
                          setActiveSubtitle(null);
                          setShowSubtitleMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 hover:bg-gray-800"
                      >
                        Off
                      </button>
                      {media.subtitles?.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setActiveSubtitle(sub);
                            setShowSubtitleMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold ${
                            activeSubtitle?.id === sub.id ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* A-B Segment Repeat Tool */}
                <button
                  onClick={() => {
                    if (abRepeat.a === null) {
                      setAbRepeat({ a: currentTime, b: null });
                    } else if (abRepeat.b === null) {
                      setAbRepeat({ ...abRepeat, b: currentTime });
                    } else {
                      setAbRepeat({ a: null, b: null });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1 ${
                    abRepeat.a !== null
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'bg-gray-900 border-gray-800 text-gray-400'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>{abRepeat.a === null ? 'A-B Loop' : abRepeat.b === null ? 'Set B Point' : 'Clear Loop'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPrevMedia()}
                  className="px-3 py-1.5 bg-gray-900 text-gray-200 border border-gray-800 rounded-xl font-bold"
                >
                  Prev
                </button>
                <button
                  onClick={() => onNextMedia()}
                  className="px-3 py-1.5 bg-cyan-500 text-slate-950 rounded-xl font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
