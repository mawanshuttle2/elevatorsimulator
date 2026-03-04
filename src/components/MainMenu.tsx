import React from 'react';
import { GlobalState } from '../types';
import { motion } from 'framer-motion';
import { Play, ShoppingCart, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { playSound } from '../utils/audio';

interface Props {
  key?: string;
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
}

export default function MainMenu({ state, setState }: Props) {
  const handleNav = (screen: GlobalState['screen']) => {
    playSound('tap', state.settings.sfxVolume);
    setState(s => ({ ...s, screen }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full w-full bg-slate-950/60 backdrop-blur-md text-white"
    >
      <div className="text-center mb-12">
        <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-600 mb-4">
          ELEVATOR<br/>SIMULATOR
        </h1>
        <p className="text-slate-400 uppercase tracking-widest text-sm">Manage the vertical chaos</p>
      </div>

      <div className="flex flex-col gap-4 w-64">
        <button 
          onClick={() => handleNav('STAGE_SELECT')}
          className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-4 px-6 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
        >
          <Play size={20} /> Start Game
        </button>
        <button 
          onClick={() => handleNav('SHOP')}
          className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white py-4 px-6 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
        >
          <ShoppingCart size={20} /> Shop ({state.xp} XP)
        </button>
        <button 
          onClick={() => handleNav('SETTINGS')}
          className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white py-4 px-6 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
        >
          <SettingsIcon size={20} /> Settings
        </button>
      </div>
    </motion.div>
  );
}
