import React from 'react';
import { GlobalState } from '../types';
import { motion } from 'framer-motion';
import { RotateCcw, Home, Trophy, Star, Users } from 'lucide-react';
import { playSound } from '../utils/audio';

interface Props {
  key?: string;
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
}

export default function GameOver({ state, setState }: Props) {
  const handleRestart = () => {
    playSound('tap', state.settings.sfxVolume);
    setState(s => ({ ...s, screen: 'GAME_ACTIVE' }));
  };

  const handleMenu = () => {
    playSound('tap', state.settings.sfxVolume);
    setState(s => ({ ...s, screen: 'MAIN_MENU' }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex flex-col items-center justify-center h-full w-full bg-slate-950/90 backdrop-blur-sm text-white p-8 absolute inset-0 z-50"
    >
      <div className="text-center mb-12">
        <h1 className="text-6xl font-black tracking-tighter text-red-500 mb-4 uppercase">
          Game Over
        </h1>
        <p className="text-slate-400 uppercase tracking-widest text-sm">Shift Ended</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md space-y-6 mb-12 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3 text-slate-300">
            <Trophy className="text-yellow-500" size={24} />
            <span className="font-bold uppercase tracking-wider">Final Score</span>
          </div>
          <span className="text-3xl font-black font-mono text-white">{state.lastScore}</span>
        </div>

        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3 text-slate-300">
            <Star className="text-blue-400" size={24} />
            <span className="font-bold uppercase tracking-wider">XP Earned</span>
          </div>
          <span className="text-2xl font-bold font-mono text-blue-400">+{state.lastXpEarned}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-300">
            <Users className="text-emerald-400" size={24} />
            <span className="font-bold uppercase tracking-wider text-sm">Passengers Delivered</span>
          </div>
          <span className="text-xl font-bold font-mono text-emerald-400">{state.lastPassengersDelivered}</span>
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-md">
        <button 
          onClick={handleRestart}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw size={20} /> Restart
        </button>
        <button 
          onClick={handleMenu}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
        >
          <Home size={20} /> Menu
        </button>
      </div>
    </motion.div>
  );
}
