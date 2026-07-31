import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Headphones, Speaker, Tv, Check, X } from 'lucide-react';

interface DevicePickerSheetProps {
  selectedDevice: string;
  onSelectDevice: (device: string) => void;
  onClose: () => void;
}

export const DevicePickerSheet: React.FC<DevicePickerSheetProps> = ({
  selectedDevice,
  onSelectDevice,
  onClose
}) => {
  const devices = [
    { name: 'Google Pixel 8 Pro (This Phone)', icon: Smartphone },
    { name: 'Google Pixel Buds Pro', icon: Headphones },
    { name: 'Living Room Nest Speaker', icon: Speaker },
    { name: 'Bedroom Chromecast TV', icon: Tv }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-[440px] bg-zinc-900 rounded-t-3xl border-t border-zinc-800 p-5 space-y-5 text-white shadow-2xl"
      >
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto" />

        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-white">Connect to a device</h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {devices.map((dev) => {
            const Icon = dev.icon;
            const isSelected = selectedDevice === dev.name;

            return (
              <button
                key={dev.name}
                onClick={() => {
                  onSelectDevice(dev.name);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    : 'bg-zinc-800/40 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`} />
                  <span className="text-sm font-semibold">{dev.name}</span>
                </div>
                {isSelected && <Check className="w-5 h-5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
