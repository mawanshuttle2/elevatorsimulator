import { useState, useEffect } from 'react';
import { GlobalState } from './types';
import { AnimatePresence } from 'framer-motion';
import { initAudio, playBGM, updateBGMVolume, resumeBGM } from './utils/audio';

import MainMenu from './components/MainMenu';
import StageSelect from './components/StageSelect';
import Shop from './components/Shop';
import Settings from './components/Settings';
import GameActive from './components/GameActive';
import GameOver from './components/GameOver';

const initialState: GlobalState = {
  screen: 'MAIN_MENU',
  xp: 0,
  unlockedModels: [1],
  equippedModel: 1,
  unlockedLevels: 1,
  difficulty: 'Medium',
  infinityMode: false,
  randomStageMode: false,
  settings: {
    musicVolume: 50,
    sfxVolume: 50,
    musicTrack: 0,
  },
  currentLevel: 1,
  lastScore: 0,
  lastXpEarned: 0,
  lastPassengersDelivered: 0,
};

const STORAGE_KEY = 'elevator-sim-save-v1';

export default function App() {
  const [state, setState] = useState<GlobalState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed, screen: 'MAIN_MENU' }; // Always start at menu
      } catch (e) {
        console.error('Failed to load save game', e);
      }
    }
    return initialState;
  });

  // Initialize audio on mount
  useEffect(() => {
    initAudio();
    playBGM(state.settings.musicVolume, state.settings.musicTrack);

    // Add interaction listener to bypass browser autoplay policy
    const handleInteraction = () => {
      resumeBGM();
      // We can remove the listener after first interaction
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Update BGM volume when settings change
  useEffect(() => {
    updateBGMVolume(state.settings.musicVolume);
  }, [state.settings.musicVolume]);

  // Update BGM track when settings change
  useEffect(() => {
    playBGM(state.settings.musicVolume, state.settings.musicTrack);
  }, [state.settings.musicTrack]);

  // Save to localStorage whenever relevant state changes
  useEffect(() => {
    const saveData = {
      xp: state.xp,
      unlockedModels: state.unlockedModels,
      equippedModel: state.equippedModel,
      unlockedLevels: state.unlockedLevels,
      difficulty: state.difficulty,
      settings: state.settings,
      currentLevel: state.currentLevel,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  }, [state.xp, state.unlockedModels, state.equippedModel, state.unlockedLevels, state.difficulty, state.settings, state.currentLevel]);

  return (
    <div 
      className="w-full h-screen bg-black overflow-hidden font-sans selection:bg-blue-500/30 bg-cover bg-center transition-all duration-700"
      style={{
        backgroundImage: state.screen === 'GAME_ACTIVE' 
          ? 'url(/assets/images/bg-game.jpg)' 
          : 'url(/assets/images/bg-menu.jpg)'
      }}
    >
      <AnimatePresence mode="wait">
        {state.screen === 'MAIN_MENU' && <MainMenu key="main" state={state} setState={setState} />}
        {state.screen === 'STAGE_SELECT' && <StageSelect key="stage" state={state} setState={setState} />}
        {state.screen === 'SHOP' && <Shop key="shop" state={state} setState={setState} />}
        {state.screen === 'SETTINGS' && <Settings key="settings" state={state} setState={setState} />}
        {state.screen === 'GAME_ACTIVE' && <GameActive key="game" state={state} setState={setState} />}
        {state.screen === 'GAME_OVER' && <GameOver key="gameover" state={state} setState={setState} />}
      </AnimatePresence>
    </div>
  );
}
