import React from 'react';
import { Home, Search, Library, Download, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onTabSelect: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabSelect
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'search' as TabType, label: 'Search', icon: Search },
    { id: 'library' as TabType, label: 'Library', icon: Library },
    { id: 'downloads' as TabType, label: 'Downloads', icon: Download },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <nav className="relative z-30 w-full bg-black/60 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-1 group cursor-pointer transition-transform active:scale-95"
          >
            {/* Material 3 / Glassmorphic active pill indicator */}
            <div
              className={`relative px-3.5 py-1 rounded-full flex items-center justify-center transition-all duration-250 ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                  : 'text-zinc-400 group-hover:text-zinc-200'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform duration-200 ${
                  isActive ? 'scale-110 text-emerald-400 stroke-[2.5]' : 'stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                isActive ? 'text-white font-semibold' : 'text-zinc-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

