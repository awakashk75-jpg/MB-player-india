import React from 'react';
import {
  Play,
  Search,
  Upload,
  Lock,
  Sliders,
  Settings as SettingsIcon,
  Grid,
  List as ListIcon,
  FolderOpen,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenImport: () => void;
  onOpenVault: () => void;
  onOpenEqualizer: () => void;
  onOpenSettings: () => void;
  isVaultLocked: boolean;
  viewMode: 'grid' | 'list';
  onToggleViewMode: () => void;
  totalMediaCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenImport,
  onOpenVault,
  onOpenEqualizer,
  onOpenSettings,
  isVaultLocked,
  viewMode,
  onToggleViewMode,
  totalMediaCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0F131C]/90 backdrop-blur-md border-b border-gray-800/80 px-4 py-3 text-white transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand & Made in India Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-amber-500 p-[2px] shadow-lg shadow-cyan-500/20 group cursor-pointer">
              <div className="w-full h-full bg-[#0F131C] rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <Play className="w-5 h-5 text-cyan-400 fill-cyan-400 group-hover:text-white group-hover:fill-white transition-colors" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  MB PLAYER <span className="text-amber-400 font-extrabold">INDIA</span>
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 via-white/10 to-green-500/20 border border-orange-500/30 text-amber-300">
                  <span>🇮🇳</span> Off-Line Engine
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                {totalMediaCount} Media Files • HW Acceleration
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onOpenImport}
              className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition"
              title="Import Local Files"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenEqualizer}
              className="p-2 rounded-lg bg-gray-800 text-amber-400 hover:bg-gray-700 transition"
              title="Sound Booster / Equalizer"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenVault}
              className={`p-2 rounded-lg transition border ${
                isVaultLocked
                  ? 'bg-gray-800/80 text-gray-400 border-gray-700'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
              title="Secret Private Vault"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar & Primary Actions */}
        <div className="flex items-center gap-2 flex-1 md:max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search videos, music, format, folder..."
              className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Desktop Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onToggleViewMode}
              className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition"
              title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
            >
              {viewMode === 'grid' ? <ListIcon className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenEqualizer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>EQ & Boost</span>
            </button>

            <button
              onClick={onOpenVault}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold transition"
            >
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Vault</span>
            </button>

            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-md shadow-cyan-500/20 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Import Media</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition"
              title="Player Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
