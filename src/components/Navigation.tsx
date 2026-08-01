import React from 'react';
import { ActiveTab } from '../types';
import {
  Film,
  Music,
  Folder,
  ListMusic,
  Lock,
  Wrench,
  ChevronRight
} from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  counts: {
    videos: number;
    audio: number;
    folders: number;
    playlists: number;
    vault: number;
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; count?: number; accentColor: string }[] = [
    { id: 'videos', label: 'Videos', icon: Film, count: counts.videos, accentColor: 'cyan' },
    { id: 'audio', label: 'Music & Audio', icon: Music, count: counts.audio, accentColor: 'emerald' },
    { id: 'folders', label: 'Folders', icon: Folder, count: counts.folders, accentColor: 'amber' },
    { id: 'playlists', label: 'Playlists', icon: ListMusic, count: counts.playlists, accentColor: 'blue' },
    { id: 'vault', label: 'Secret Vault', icon: Lock, count: counts.vault, accentColor: 'purple' },
    { id: 'tools', label: 'Tools & Extractor', icon: Wrench, accentColor: 'rose' },
  ];

  return (
    <nav className="bg-[#0B0E14] border-b border-gray-800/60 sticky top-[65px] z-20 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar scroll-smooth py-2 gap-1 md:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
              <span>{item.label}</span>
              {typeof item.count === 'number' && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-cyan-500/30 text-cyan-200'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
