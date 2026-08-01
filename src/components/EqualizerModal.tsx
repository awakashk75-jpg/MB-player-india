import React from 'react';
import { EqualizerSettings } from '../types';
import { Sliders, Volume2, Sparkles, Zap, RotateCcw } from 'lucide-react';

interface EqualizerModalProps {
  settings: EqualizerSettings;
  onChangeSettings: (newSettings: EqualizerSettings) => void;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  settings,
  onChangeSettings,
  onClose,
}) => {
  const presets: EqualizerSettings['preset'][] = [
    'Normal',
    'Bollywood Beats',
    'Bass Boost',
    'Treble Boost',
    'Vocal',
    'Rock',
    'Custom',
  ];

  const applyPreset = (preset: EqualizerSettings['preset']) => {
    let bands = { ...settings.bands };

    switch (preset) {
      case 'Bass Boost':
        bands = { 60: 8, 230: 5, 910: 1, 3600: -2, 14000: -4 };
        break;
      case 'Treble Boost':
        bands = { 60: -3, 230: -1, 910: 2, 3600: 6, 14000: 9 };
        break;
      case 'Bollywood Beats':
        bands = { 60: 7, 230: 4, 910: 3, 3600: 5, 14000: 6 };
        break;
      case 'Vocal':
        bands = { 60: -2, 230: 2, 910: 7, 3600: 5, 14000: 1 };
        break;
      case 'Rock':
        bands = { 60: 5, 230: 3, 910: -1, 3600: 4, 14000: 6 };
        break;
      case 'Normal':
      default:
        bands = { 60: 0, 230: 0, 910: 0, 3600: 0, 14000: 0 };
        break;
    }

    onChangeSettings({
      ...settings,
      preset,
      bands,
    });
  };

  const handleBandChange = (freq: keyof EqualizerSettings['bands'], val: number) => {
    onChangeSettings({
      ...settings,
      preset: 'Custom',
      bands: {
        ...settings.bands,
        [freq]: val,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10141E] border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                MB Audio Engine <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase">200% Booster</span>
              </h2>
              <p className="text-xs text-gray-400">
                5-Band Equalizer & Hardware Speaker Booster
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold"
          >
            Done
          </button>
        </div>

        {/* Enable / Disable Toggle & Volume Booster */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-4 rounded-2xl border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Volume Amplifier Booster</span>
            </div>
            <span className="text-sm font-black font-mono text-amber-400">
              {settings.volumeBooster}%
            </span>
          </div>

          <input
            type="range"
            min={100}
            max={200}
            value={settings.volumeBooster}
            onChange={(e) =>
              onChangeSettings({
                ...settings,
                volumeBooster: parseInt(e.target.value),
              })
            }
            className="w-full accent-amber-400 bg-gray-900 h-2 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-gray-400 font-bold">
            <span>100% (Standard)</span>
            <span>150% (High)</span>
            <span className="text-amber-400">200% (Super Loud Boost)</span>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Equalizer Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  settings.preset === p
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-gray-900 text-gray-300 border border-gray-800 hover:border-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Band Sliders */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-[11px] font-mono text-gray-400">
            <span>+12 dB</span>
            <span>0 dB</span>
            <span>-12 dB</span>
          </div>

          <div className="grid grid-cols-5 gap-3 h-36 items-center">
            {[
              { freq: 60, label: '60Hz' },
              { freq: 230, label: '230Hz' },
              { freq: 910, label: '910Hz' },
              { freq: 3600, label: '3.6kHz' },
              { freq: 14000, label: '14kHz' },
            ].map(({ freq, label }) => {
              const val = settings.bands[freq as keyof EqualizerSettings['bands']];

              return (
                <div key={freq} className="flex flex-col items-center gap-2 h-full">
                  <span className="text-[10px] font-mono font-bold text-cyan-400">
                    {val > 0 ? `+${val}` : val}
                  </span>
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    value={val}
                    onChange={(e) =>
                      handleBandChange(
                        freq as keyof EqualizerSettings['bands'],
                        parseInt(e.target.value)
                      )
                    }
                    className="h-24 w-2 accent-cyan-400 [writing-mode:vertical-lr] [direction:rtl] cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-400 font-bold">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reset */}
        <div className="flex justify-end">
          <button
            onClick={() => applyPreset('Normal')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default Equalizer
          </button>
        </div>
      </div>
    </div>
  );
};
