import React, { useState } from 'react';
import { GlobalState } from '../types';
import { motion } from 'framer-motion';
import { Heart, Clock, Zap, Users, ArrowUp, ArrowDown, Settings as SettingsIcon, X, Home, Volume2, Music } from 'lucide-react';
import { useGameEngine } from '../game/engine';
import { playSound } from '../utils/audio';

interface Props {
  key?: string;
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
}

export default function GameActive({ state, setState }: Props) {
  const [showSettings, setShowSettings] = useState(false);

  const {
    score,
    xpEarned,
    hearts,
    time,
    passengersDelivered,
    passengers,
    lifts,
    handleFloorClick,
    handleLiftClick,
    levelConfig,
    liftModel
  } = useGameEngine(state, setState, showSettings);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col h-full w-full bg-slate-950/40 backdrop-blur-sm text-white overflow-hidden"
    >
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-50 pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-4 shadow-lg">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Score</span>
              <span className="font-mono text-xl font-black text-white">{score}</span>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">XP</span>
              <span className="font-mono text-xl font-black text-blue-400">+{xpEarned}</span>
            </div>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
            <Clock size={16} className="text-slate-400" />
            <span className="font-mono text-lg font-bold">{formatTime(time)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                playSound('tap', state.settings.sfxVolume);
                setShowSettings(true);
              }}
              className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-2 rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
            >
              <SettingsIcon size={20} />
            </button>
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-1 shadow-lg">
              {state.infinityMode ? (
                <span className="font-bold text-orange-500 uppercase tracking-widest text-sm flex items-center gap-2">
                  <Zap size={16} /> Infinity
                </span>
              ) : (
                Array.from({ length: Math.min(10, hearts) }).map((_, i) => (
                  <Heart key={i} size={16} className="text-red-500 fill-red-500" />
                ))
              )}
            </div>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Model</span>
            <span className="font-bold text-sm">{liftModel.name}</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative flex items-center justify-center mt-16 mb-8 mx-4">
        <div className="relative w-full max-w-4xl h-full flex flex-col justify-end">
          
          {/* Floors Background */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {Array.from({ length: levelConfig.floors }).map((_, i) => {
              const floorNum = levelConfig.floors - 1 - i;
              return (
                <div 
                  key={i} 
                  className="relative w-full flex-1 border-b-4 border-slate-900 flex items-end bg-cover bg-center"
                  style={{ backgroundImage: `url(/assets/images/floors/floor-${floorNum}.jpg)` }}
                >
                  {/* Dark overlay to ensure text and game elements remain visible */}
                  <div className="absolute inset-0 bg-slate-950/10" />
                  
                  {/* Floor Label */}
                  <div className="absolute left-2 bottom-2 text-white font-black text-4xl opacity-60 select-none z-10 drop-shadow-lg">
                    {floorNum === 0 ? 'G' : floorNum}
                  </div>
                  <div className="absolute right-2 bottom-2 text-white font-black text-4xl opacity-60 select-none z-10 drop-shadow-lg">
                    {floorNum === 0 ? 'G' : floorNum}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shafts & Lifts */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
            {lifts.map((lift, i) => (
              <div key={lift.id} className="relative w-24 h-full bg-slate-950 border-x-2 border-slate-800 pointer-events-auto">
                {/* Clickable Floor Segments */}
                {Array.from({ length: levelConfig.floors }).map((_, floorIdx) => (
                  <div
                    key={`click-${floorIdx}`}
                    onClick={() => handleFloorClick(lift.id, floorIdx)}
                    className="absolute w-full cursor-pointer hover:bg-white/10 z-30 transition-colors"
                    style={{
                      height: `${100 / levelConfig.floors}%`,
                      bottom: `${(floorIdx / levelConfig.floors) * 100}%`
                    }}
                  />
                ))}

                {/* Lift Car */}
                <motion.div 
                  onClick={() => handleLiftClick(lift.id)}
                  className="absolute left-0 right-0 bg-slate-800 border-2 border-slate-600 transition-colors pointer-events-auto cursor-pointer z-40"
                  style={{
                    height: `${100 / levelConfig.floors}%`,
                    bottom: `${(lift.currentFloor / levelConfig.floors) * 100}%`,
                  }}
                  animate={{
                    bottom: `${(lift.currentFloor / levelConfig.floors) * 100}%`,
                  }}
                  transition={{ ease: "linear", duration: 0.1 }}
                >
                  {/* Passengers in Lift */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end gap-0.5 pb-1 px-1 z-0">
                    {lift.passengers.map((p) => (
                      <div key={p.id} className="relative w-3 h-5 bg-slate-300 rounded-t-full flex flex-col items-center justify-end">
                        <div className="absolute -top-4 text-[8px] font-bold text-emerald-400">{p.destFloor === 0 ? 'G' : p.destFloor}</div>
                      </div>
                    ))}
                  </div>

                  {/* Doors */}
                  <div className="absolute inset-0 flex z-10">
                    <motion.div 
                      className="h-full bg-slate-700 border-r border-slate-900"
                      animate={{ width: lift.state === 'DOORS_OPEN' || lift.state === 'DOORS_OPENING' ? '10%' : '50%' }}
                      transition={{ duration: liftModel.doors }}
                    />
                    <motion.div 
                      className="h-full bg-slate-700 border-l border-slate-900 ml-auto"
                      animate={{ width: lift.state === 'DOORS_OPEN' || lift.state === 'DOORS_OPENING' ? '10%' : '50%' }}
                      transition={{ duration: liftModel.doors }}
                    />
                  </div>
                  
                  {/* Capacity Indicator */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                    {Array.from({ length: liftModel.capacity }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1.5 h-1.5 rounded-full ${idx < lift.passengers.length ? 'bg-emerald-400' : 'bg-slate-900'}`}
                      />
                    ))}
                  </div>
                  
                  {/* State Indicator */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-slate-400">
                    {lift.state === 'MOVING' && lift.targetFloor! > lift.currentFloor && <ArrowUp size={12} />}
                    {lift.state === 'MOVING' && lift.targetFloor! < lift.currentFloor && <ArrowDown size={12} />}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Passengers */}
          <div className="absolute inset-0 pointer-events-none">
            {passengers.map(p => {
              if (p.state === 'IN_LIFT' || p.state === 'DROPPED_OFF') return null;
              
              const floorHeight = 100 / levelConfig.floors;
              const bottomPercent = p.spawnFloor * floorHeight;
              const patienceRatio = p.patience / p.maxPatience;
              
              let bubbleColor = 'border-emerald-500 text-emerald-500';
              if (!state.infinityMode) {
                if (patienceRatio < 0.3) bubbleColor = 'border-red-500 text-red-500 animate-pulse';
                else if (patienceRatio < 0.6) bubbleColor = 'border-yellow-500 text-yellow-500';
              }

              return (
                <div 
                  key={p.id}
                  className="absolute w-6 h-10 flex flex-col items-center justify-end"
                  style={{
                    bottom: `${bottomPercent}%`,
                    left: `${p.x * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {/* Patience Bubble */}
                  <div className={`absolute -top-8 bg-slate-900/90 border-2 rounded-full px-2 h-8 flex items-center justify-center text-xs font-bold whitespace-nowrap ${bubbleColor}`}>
                    To: {p.destFloor === 0 ? 'G' : p.destFloor}
                  </div>
                  
                  {/* Patience Bar */}
                  {!state.infinityMode && (
                    <div className="absolute -top-1 w-6 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${patienceRatio < 0.3 ? 'bg-red-500' : patienceRatio < 0.6 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                        style={{ width: `${patienceRatio * 100}%` }}
                      />
                    </div>
                  )}

                  {/* Passenger Body */}
                  <div className="w-4 h-6 bg-slate-300 rounded-t-full" />
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md relative">
            <button 
              onClick={() => {
                playSound('tap', state.settings.sfxVolume);
                setShowSettings(false);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-black tracking-tight uppercase mb-8">Paused</h2>
            
            <div className="space-y-8 mb-8">
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
                  onChange={(e) => setState(s => ({ ...s, settings: { ...s.settings, musicVolume: parseInt(e.target.value) } }))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
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
                  onChange={(e) => setState(s => ({ ...s, settings: { ...s.settings, sfxVolume: parseInt(e.target.value) } }))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  playSound('tap', state.settings.sfxVolume);
                  setShowSettings(false);
                }}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
              >
                Resume
              </button>
              <button 
                onClick={() => {
                  playSound('tap', state.settings.sfxVolume);
                  setState(s => ({ 
                    ...s, 
                    screen: 'GAME_OVER',
                    xp: s.xp + xpEarned,
                    lastScore: score,
                    lastXpEarned: xpEarned,
                    lastPassengersDelivered: passengersDelivered,
                    unlockedLevels: score > 100 ? Math.max(s.unlockedLevels, state.currentLevel + 1) : s.unlockedLevels
                  }));
                }}
                className="flex-1 py-4 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
              >
                <Home size={20} /> End Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
