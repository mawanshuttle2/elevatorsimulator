import React from 'react';
import { GlobalState, Difficulty } from '../types';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Lock, Shuffle, Infinity as InfinityIcon } from 'lucide-react';
import { LIFT_MODELS, LEVEL_CONFIGS } from '../constants';
import { playSound } from '../utils/audio';

interface Props {
  key?: string;
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
}

export default function StageSelect({ state, setState }: Props) {
  const handleStart = (level: number) => {
    if (level <= state.unlockedLevels) {
      playSound('tap', state.settings.sfxVolume);
      setState(s => ({ ...s, currentLevel: level, screen: 'GAME_ACTIVE' }));
    }
  };

  const handleBack = () => {
    playSound('tap', state.settings.sfxVolume);
    setState(s => ({ ...s, screen: 'MAIN_MENU' }));
  };

  const handleDifficulty = (diff: Difficulty) => {
    playSound('tap', state.settings.sfxVolume);
    setState(s => ({ ...s, difficulty: diff }));
  };

  const handleMode = (mode: 'random' | 'infinity') => {
    playSound('tap', state.settings.sfxVolume);
    if (mode === 'random') {
      setState(s => ({ ...s, randomStageMode: !s.randomStageMode }));
    } else {
      setState(s => ({ ...s, infinityMode: !s.infinityMode }));
    }
  };

  const equippedModelData = LIFT_MODELS.find(m => m.id === state.equippedModel);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-full w-full bg-slate-950/60 backdrop-blur-md text-white p-8 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={handleBack}
          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-black tracking-tight uppercase">Select Stage</h2>
        <div className="w-12" /> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-slate-400 uppercase tracking-wider mb-4">Levels</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {LEVEL_CONFIGS.map((config) => {
              const isUnlocked = config.level <= state.unlockedLevels;
              return (
                <button
                  key={config.level}
                  onClick={() => handleStart(config.level)}
                  disabled={!isUnlocked}
                  className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2
                    ${isUnlocked 
                      ? 'border-blue-500 bg-blue-900/20 hover:bg-blue-800/40 hover:scale-105 active:scale-95 cursor-pointer' 
                      : 'border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed'}`}
                >
                  {!isUnlocked && <Lock className="absolute top-3 right-3 text-slate-500" size={16} />}
                  <span className="text-3xl font-black text-white">{config.level}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-widest">
                    {config.floors} Flr • {config.shafts} Lft
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Difficulty</h3>
            <div className="flex flex-col gap-2">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => handleDifficulty(diff)}
                  className={`p-3 rounded-xl font-bold text-sm transition-colors ${
                    state.difficulty === diff 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Equipped Lift</h3>
            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl">
              <span className="font-bold">{equippedModelData?.name}</span>
              <button 
                onClick={() => {
                  playSound('tap', state.settings.sfxVolume);
                  setState(s => ({ ...s, screen: 'SHOP' }));
                }}
                className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg transition-colors"
              >
                Change
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Modes</h3>
            
            <button
              onClick={() => handleMode('random')}
              disabled={state.unlockedLevels < 10}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                state.unlockedLevels < 10 ? 'opacity-50 cursor-not-allowed bg-slate-800' :
                state.randomStageMode ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shuffle size={18} />
                <span className="font-bold text-sm">Random Stage</span>
              </div>
              {state.unlockedLevels < 10 && <Lock size={14} />}
            </button>

            <button
              onClick={() => handleMode('infinity')}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                state.infinityMode ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <InfinityIcon size={18} />
                <span className="font-bold text-sm">Infinity Mode</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
