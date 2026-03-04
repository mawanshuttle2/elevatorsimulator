import React from 'react';
import { GlobalState } from '../types';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Users, Clock, Check, Lock } from 'lucide-react';
import { LIFT_MODELS } from '../constants';
import { playSound } from '../utils/audio';

interface Props {
  key?: string;
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
}

export default function Shop({ state, setState }: Props) {
  const handleUnlock = (id: number, cost: number) => {
    playSound('tap', state.settings.sfxVolume);
    if (state.xp >= cost && !state.unlockedModels.includes(id)) {
      setState(s => ({
        ...s,
        xp: s.xp - cost,
        unlockedModels: [...s.unlockedModels, id],
      }));
    }
  };

  const handleEquip = (id: number) => {
    playSound('tap', state.settings.sfxVolume);
    if (state.unlockedModels.includes(id)) {
      setState(s => ({ ...s, equippedModel: id }));
    }
  };

  const handleBack = () => {
    playSound('tap', state.settings.sfxVolume);
    setState(s => ({ ...s, screen: 'MAIN_MENU' }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col h-full w-full bg-slate-950/60 backdrop-blur-md text-white p-8 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={handleBack}
          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-black tracking-tight uppercase">Garage</h2>
        <div className="bg-blue-900/50 border border-blue-500/50 px-6 py-2 rounded-full font-mono text-xl text-blue-300">
          {state.xp} XP
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
        {LIFT_MODELS.map((model) => {
          const isUnlocked = state.unlockedModels.includes(model.id);
          const isEquipped = state.equippedModel === model.id;
          const canAfford = state.xp >= model.cost;

          return (
            <div 
              key={model.id}
              className={`relative flex flex-col bg-slate-900 rounded-3xl border-2 overflow-hidden transition-all ${
                isEquipped ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 
                isUnlocked ? 'border-slate-700 hover:border-slate-500' : 
                'border-slate-800 opacity-80'
              }`}
            >
              <div className="p-6 flex-grow">
                <h3 className="text-2xl font-black tracking-tighter mb-6">{model.name}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Zap size={16} /> <span className="text-sm uppercase tracking-wider">Speed</span>
                    </div>
                    <span className="font-mono font-bold">{model.speed}x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users size={16} /> <span className="text-sm uppercase tracking-wider">Capacity</span>
                    </div>
                    <span className="font-mono font-bold">{model.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={16} /> <span className="text-sm uppercase tracking-wider">Doors</span>
                    </div>
                    <span className="font-mono font-bold">{model.doors}s</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-950/50 border-t border-slate-800">
                {isEquipped ? (
                  <button disabled className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2">
                    <Check size={18} /> Equipped
                  </button>
                ) : isUnlocked ? (
                  <button 
                    onClick={() => handleEquip(model.id)}
                    className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
                  >
                    Equip
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUnlock(model.id, model.cost)}
                    disabled={!canAfford}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                      canAfford 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {!canAfford && <Lock size={16} />}
                    Unlock ({model.cost} XP)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
