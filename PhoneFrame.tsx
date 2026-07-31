import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  phoneFrameMode: boolean;
  onToggleFrameMode: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  phoneFrameMode,
  onToggleFrameMode
}) => {
  const [timeString, setTimeString] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setTimeString(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-0 md:p-4 text-zinc-100 select-none overflow-hidden">
      {/* Top frame switcher bar for developer/preview ease */}
      <div className="hidden md:flex items-center justify-between w-full max-w-[420px] px-3 py-1.5 mb-2 text-xs text-zinc-400 bg-zinc-900/80 rounded-lg border border-zinc-800/80 backdrop-blur-md">
        <div className="flex items-center gap-1.5 font-medium text-emerald-400">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android Mobile View (390×844)</span>
        </div>
        <button
          onClick={onToggleFrameMode}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] transition-colors cursor-pointer"
        >
          {phoneFrameMode ? (
            <>
              <Maximize2 className="w-3 h-3" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3 h-3" />
              <span>Framed Phone</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`relative flex flex-col bg-zinc-950 text-white overflow-hidden transition-all duration-300 ${
          phoneFrameMode
            ? 'w-[390px] h-[844px] rounded-[48px] border-[10px] border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-zinc-900'
            : 'w-full h-screen max-w-[440px] md:rounded-[36px] border-0 md:border-[6px] md:border-zinc-800 md:shadow-2xl'
        }`}
      >
        {/* Android Camera Punchhole */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 w-3.5 h-3.5 rounded-full bg-black ring-2 ring-zinc-900/80 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-zinc-800/60"></div>
        </div>

        {/* Android Status Bar */}
        <div className="relative z-40 flex items-center justify-between px-6 pt-3 pb-1 text-[13px] font-semibold text-zinc-300 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
          {/* Time */}
          <span className="tracking-tight">{timeString}</span>

          {/* Android System Icons */}
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-[10px] font-bold tracking-widest text-emerald-400">5G</span>
            <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
            <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-medium text-zinc-400">98%</span>
              <Battery className="w-4 h-4 fill-zinc-300 stroke-[1.5]" />
            </div>
          </div>
        </div>

        {/* App Content viewport */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          {children}
        </div>

        {/* Android Navigation Bar Pill Indicator */}
        <div className="relative z-40 w-full h-5 bg-black/90 flex items-center justify-center pointer-events-none pb-1">
          <div className="w-32 h-1 bg-zinc-400/80 rounded-full shadow-sm"></div>
        </div>
      </div>
    </div>
  );
};
