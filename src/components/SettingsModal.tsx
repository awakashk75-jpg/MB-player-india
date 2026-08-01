import React from 'react';
import { PlayerSettings } from '../types';
import { Settings as SettingsIcon, Cpu, Smartphone, PlayCircle, Subtitles, Volume2 } from 'lucide-react';

interface SettingsModalProps {
  settings: PlayerSettings;
  onChangeSettings: (newSettings: PlayerSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onChangeSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101420] border border-gray-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">MB Player Settings</h2>
              <p className="text-xs text-gray-400">Hardware & Gesture Preferences</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold">
            Done
          </button>
        </div>

        <div className="space-y-4 text-xs text-gray-300">
          {/* HW Acceleration */}
          <div className="flex items-center justify-between p-3 bg-gray-900 rounded-2xl border border-gray-800">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-bold text-white block">HW Hardware Decoder</span>
                <span className="text-[10px] text-gray-500">Accelerated GPU rendering</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.hardwareAcceleration}
              onChange={(e) => onChangeSettings({ ...settings, hardwareAcceleration: e.target.checked })}
              className="w-4 h-4 accent-cyan-400"
            />
          </div>

          {/* Touch Gestures */}
          <div className="flex items-center justify-between p-3 bg-gray-900 rounded-2xl border border-gray-800">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-white block">Swipe Gestures</span>
                <span className="text-[10px] text-gray-500">Swipe for Volume & Brightness</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.swipeGestures}
              onChange={(e) => onChangeSettings({ ...settings, swipeGestures: e.target.checked })}
              className="w-4 h-4 accent-amber-400"
            />
          </div>

          {/* Double Tap Seek Seconds */}
          <div className="space-y-1 p-3 bg-gray-900 rounded-2xl border border-gray-800">
            <label className="font-bold text-white block">Double Tap Seek Jump</label>
            <div className="flex gap-2 pt-1">
              {[5, 10, 15, 30].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onChangeSettings({ ...settings, doubleTapSeekSeconds: sec })}
                  className={`flex-1 py-1.5 rounded-xl font-bold border transition ${
                    settings.doubleTapSeekSeconds === sec
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-gray-950 text-gray-400 border-gray-800'
                  }`}
                >
                  ±{sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Subtitle Customizer */}
          <div className="p-3 bg-gray-900 rounded-2xl border border-gray-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Subtitles className="w-4 h-4 text-emerald-400" /> Subtitle Font Size
            </div>
            <div className="flex gap-2">
              {(['small', 'medium', 'large', 'huge'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => onChangeSettings({ ...settings, subtitleFontSize: sz })}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase border transition ${
                    settings.subtitleFontSize === sz
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-gray-950 text-gray-400 border-gray-800'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
