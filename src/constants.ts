import { LiftModel } from './types';

export const LIFT_MODELS: LiftModel[] = [
  { id: 1, name: 'Default', speed: 1.0, capacity: 3, doors: 1.5, cost: 0 },
  { id: 2, name: 'Standard', speed: 1.2, capacity: 4, doors: 1.3, cost: 200 },
  { id: 3, name: 'Express', speed: 1.4, capacity: 5, doors: 1.1, cost: 400 },
  { id: 4, name: 'Bullet', speed: 1.6, capacity: 6, doors: 0.9, cost: 600 },
];

export const DIFFICULTY_MULTIPLIERS = {
  Easy: { spawnRate: 8, patience: 30 },
  Medium: { spawnRate: 5, patience: 25 },
  Hard: { spawnRate: 2.5, patience: 20 },
};

export const LEVEL_CONFIGS = [
  { level: 1, floors: 3, shafts: 1, maxWaiters: 4, bg: 'bg-slate-900' },
  { level: 2, floors: 4, shafts: 1, maxWaiters: 5, bg: 'bg-slate-800' },
  { level: 3, floors: 4, shafts: 2, maxWaiters: 6, bg: 'bg-slate-900' },
  { level: 4, floors: 5, shafts: 2, maxWaiters: 7, bg: 'bg-blue-950' },
  { level: 5, floors: 6, shafts: 2, maxWaiters: 8, bg: 'bg-blue-900' },
  { level: 6, floors: 7, shafts: 3, maxWaiters: 9, bg: 'bg-blue-950' },
  { level: 7, floors: 8, shafts: 3, maxWaiters: 10, bg: 'bg-indigo-950' },
  { level: 8, floors: 9, shafts: 3, maxWaiters: 12, bg: 'bg-indigo-900' },
  { level: 9, floors: 10, shafts: 3, maxWaiters: 15, bg: 'bg-indigo-950' },
];
