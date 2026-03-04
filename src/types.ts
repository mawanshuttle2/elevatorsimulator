export type Screen = 'MAIN_MENU' | 'STAGE_SELECT' | 'SHOP' | 'GAME_ACTIVE' | 'SETTINGS' | 'GAME_OVER';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface LiftModel {
  id: number;
  name: string;
  speed: number; // floors per second
  capacity: number;
  doors: number; // seconds
  cost: number;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  musicTrack: number; // 0, 1, or 2 for BGM 1, 2, 3
}

export interface GlobalState {
  screen: Screen;
  xp: number;
  unlockedModels: number[];
  equippedModel: number;
  unlockedLevels: number;
  difficulty: Difficulty;
  infinityMode: boolean;
  randomStageMode: boolean;
  settings: GameSettings;
  currentLevel: number;
  
  // Last game results
  lastScore: number;
  lastXpEarned: number;
  lastPassengersDelivered: number;
}

export interface Passenger {
  id: string;
  spawnFloor: number;
  destFloor: number;
  x: number; // 0 to 1 (0 is left edge, 1 is right edge)
  direction: 1 | -1; // 1 moving right, -1 moving left
  state: 'WALKING' | 'WAITING' | 'IN_LIFT' | 'DROPPED_OFF';
  patience: number; // seconds remaining
  maxPatience: number;
  liftId?: number;
}

export interface Lift {
  id: number;
  currentFloor: number;
  targetFloor: number | null;
  state: 'IDLE' | 'MOVING' | 'ARRIVED' | 'DOORS_OPENING' | 'DOORS_OPEN' | 'DOORS_CLOSING';
  doorTimer: number;
  passengers: Passenger[];
}
