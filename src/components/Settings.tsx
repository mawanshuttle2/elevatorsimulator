import React from 'react';
import { GlobalState } from '../types';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, Music } from 'lucide-react';
import { playSound } from '../utils/audio';

interface Props {
  key?: string;
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
}

export default function Settings({ state, setState }: Props) {
  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(s => ({ ...s, settings: { ...s.settings, musicVolume: parseInt(e.target.value) } }));
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(s => ({ ...s, settings: { ...s.settings, sfxVolume: parseInt(e.target.value) } }));
  };

  const handleBack = () => {
    playSound('tap', state.settings.sfxVolume);
    setState(s => ({ ...s, screen: 'MAIN_MENU' }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full w-full bg-slate-950/60 backdrop-blur-md text-white p-8"
    >
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={handleBack}
          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-black tracking-tight uppercase">Settings</h2>
        <div className="w-12" /> {/* Spacer */}
      </div>

      <div className="max-w-md mx-auto w-full space-y-8 bg-slate-900 p-8 rounded-3xl border border-slate-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-300">
              <Music size={20} />
              <span className="font-bold uppercase tracking-wider text-sm">Music Volume</span>
            </div>
            <span className="font-mono text-slate-400">{state.settings.musicVolume}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={state.settings.musicVolume} 
            onChange={handleMusicChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-300 mb-2">
            <Music size={20} />
            <span className="font-bold uppercase tracking-wider text-sm">Music Track</span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((track) => (
              <button
                key={track}
                onClick={() => {
                  playSound('tap', state.settings.sfxVolume);
                  setState(s => ({ ...s, settings: { ...s.settings, musicTrack: track } }));
                }}
                className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                  (state.settings.musicTrack || 0) === track 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Track {track + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-300">
              <Volume2 size={20} />
              <span className="font-bold uppercase tracking-wider text-sm">SFX Volume</span>
            </div>
            <span className="font-mono text-slate-400">{state.settings.sfxVolume}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={state.settings.sfxVolume} 
            onChange={handleSfxChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        <button 
          onClick={handleBack}
          className="w-full py-4 mt-8 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
        >
          Save & Return
        </button>
      </div>
    </motion.div>
  );
}
