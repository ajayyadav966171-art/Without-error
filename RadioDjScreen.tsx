import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Sliders, Volume2, Disc, Play, Radio, RefreshCw } from 'lucide-react';
import { Track } from '../types';
import { EQUALIZER_PRESETS } from '../data/musicData';
import { audioEngine } from '../services/audioEngine';

interface RadioDjScreenProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
}

export const RadioDjScreen: React.FC<RadioDjScreenProps> = ({
  tracks,
  onPlayTrack
}) => {
  const [selectedPreset, setSelectedPreset] = useState('Flat');
  const [bandValues, setBandValues] = useState<number[]>([0, 0, 0, 0, 0]);
  const [activeMood, setActiveMood] = useState('Chill');
  const [isAiDjGenerating, setIsAiDjGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Equalizer Band change handler
  const handleBandChange = (index: number, val: number) => {
    const newValues = [...bandValues];
    newValues[index] = val;
    setBandValues(newValues);
    setSelectedPreset('Custom');
    audioEngine.setEQBands(newValues);
  };

  const handleSelectPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = EQUALIZER_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setBandValues(preset.bands);
      audioEngine.setEQBands(preset.bands);
    }
  };

  const handleTriggerAiDj = () => {
    setIsAiDjGenerating(true);
    setTimeout(() => {
      setIsAiDjGenerating(false);
      // pick a random track based on mood
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      onPlayTrack(randomTrack);
    }, 1200);
  };

  // Live Canvas Visualizer loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const data = audioEngine.getVisualizerData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / data.length) * 2;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#10b981'); // emerald
        gradient.addColorStop(1, '#a855f7'); // purple

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const moods = ['Chill', 'Workout', 'Late Night', 'Focus', 'Party'];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-24 space-y-6 bg-zinc-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 p-0.5 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AI DJ & Audio FX</h1>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          PRO SOUND
        </span>
      </div>

      {/* AI DJ Pulse Box */}
      <div className="relative rounded-2xl bg-gradient-to-br from-indigo-950 via-zinc-900 to-emerald-950 p-5 border border-indigo-500/30 shadow-2xl overflow-hidden flex flex-col items-center text-center space-y-4">
        {/* Animated Glow Circle */}
        <div
          className={`w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-transform duration-700 ${
            isAiDjGenerating ? 'animate-spin scale-110' : 'animate-pulse'
          }`}
        >
          <Radio className="w-10 h-10 text-black" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">Xavier AI DJ</h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-[240px]">
            AI curate your personalized stream based on your current vibe.
          </p>
        </div>

        {/* Mood Selector Chips */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center py-1">
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMood(m)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeMood === m
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Start Stream Button */}
        <button
          onClick={handleTriggerAiDj}
          disabled={isAiDjGenerating}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-sm shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isAiDjGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Mixing track for {activeMood}...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-black" />
              <span>Play AI {activeMood} Radio</span>
            </>
          )}
        </button>
      </div>

      {/* Live Audio Visualizer Canvas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-400" /> Live Visualizer Spectrum
          </span>
        </div>
        <div className="h-16 w-full rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden p-1 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={340}
            height={56}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* 5-Band Equalizer Controls */}
      <div className="space-y-4 rounded-xl bg-zinc-900 border border-zinc-800/80 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-400" /> 5-Band Equalizer
          </span>
          <span className="text-xs font-semibold text-emerald-400">
            {selectedPreset}
          </span>
        </div>

        {/* Preset Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {EQUALIZER_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleSelectPreset(p.name)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedPreset === p.name
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Bands Vertical Sliders */}
        <div className="grid grid-cols-5 gap-2 pt-2 text-center">
          {['60Hz', '230Hz', '910Hz', '3.6kHz', '14kHz'].map((label, i) => (
            <div key={label} className="flex flex-col items-center space-y-2">
              <span className="text-[10px] font-medium text-zinc-400">
                {bandValues[i] > 0 ? `+${bandValues[i]}` : bandValues[i]}dB
              </span>
              <input
                type="range"
                min={-10}
                max={10}
                value={bandValues[i]}
                onChange={(e) => handleBandChange(i, parseInt(e.target.value))}
                className="h-24 appearance-none bg-zinc-800 rounded-lg focus:outline-none cursor-pointer"
                style={{ writingMode: 'vertical-lr' as any, direction: 'rtl' }}
              />
              <span className="text-[10px] font-bold text-zinc-300">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
