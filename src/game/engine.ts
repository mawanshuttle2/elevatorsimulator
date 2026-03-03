import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GlobalState, Passenger, Lift } from '../types';
import { LIFT_MODELS, DIFFICULTY_MULTIPLIERS, LEVEL_CONFIGS } from '../constants';
import { playSound } from '../utils/audio';

export function useGameEngine(state: GlobalState, setState: React.Dispatch<React.SetStateAction<GlobalState>>, isPaused: boolean) {
  const levelConfig = LEVEL_CONFIGS.find(l => l.level === state.currentLevel) || LEVEL_CONFIGS[0];
  const diffConfig = DIFFICULTY_MULTIPLIERS[state.difficulty];
  const liftModel = LIFT_MODELS.find(m => m.id === state.equippedModel) || LIFT_MODELS[0];

  const [gameState, setGameState] = useState({
    score: 0,
    xpEarned: 0,
    hearts: state.infinityMode ? 999 : 10,
    time: 0,
    passengersDelivered: 0,
    passengers: [] as Passenger[],
    lifts: Array.from({ length: levelConfig.shafts }).map((_, i) => ({
      id: i,
      currentFloor: 0,
      targetFloor: null as number | null,
      state: 'IDLE' as const,
      doorTimer: 0,
      passengers: [] as Passenger[]
    }))
  });
  
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const reqRef = useRef<number>(0);
  const isGameOverRef = useRef<boolean>(false);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const updateGame = useCallback((deltaTime: number) => {
    if (isGameOverRef.current || isPausedRef.current) return;

    setGameState(prev => {
      let { score, xpEarned, hearts, time, passengersDelivered, passengers, lifts } = prev;
      
      time += deltaTime;

      // Spawn logic
      spawnTimerRef.current += deltaTime;
      const currentSpawnRate = state.infinityMode 
        ? Math.max(0.5, diffConfig.spawnRate - (time / 60)) 
        : diffConfig.spawnRate;

      let newPassengers = [...passengers];
      if (spawnTimerRef.current >= currentSpawnRate) {
        spawnTimerRef.current = 0;
        
        const maxWaiters = state.infinityMode ? 999 : levelConfig.maxWaiters;
        if (newPassengers.filter(p => p.state === 'WAITING' || p.state === 'WALKING').length < maxWaiters) {
          const floor = Math.floor(Math.random() * levelConfig.floors);
          let destFloor = Math.floor(Math.random() * levelConfig.floors);
          while (destFloor === floor) {
            destFloor = Math.floor(Math.random() * levelConfig.floors);
          }
          
          const isLeft = Math.random() > 0.5;
          newPassengers.push({
            id: Math.random().toString(36).substring(7),
            spawnFloor: floor,
            destFloor,
            x: isLeft ? 0 : 1,
            direction: isLeft ? 1 : -1,
            state: 'WALKING',
            patience: diffConfig.patience,
            maxPatience: diffConfig.patience,
          });
        }
      }

      let lostHearts = 0;
      
      // Group by floor and side to prevent overlap
      const waitingByFloorAndSide: Record<string, Passenger[]> = {};
      newPassengers.forEach(p => {
        if (p.state === 'WAITING' || p.state === 'WALKING') {
          const side = p.direction === 1 ? 'left' : 'right';
          const key = `${p.spawnFloor}-${side}`;
          if (!waitingByFloorAndSide[key]) waitingByFloorAndSide[key] = [];
          waitingByFloorAndSide[key].push(p);
        }
      });

      newPassengers = newPassengers.map(p => {
        if (p.state === 'WALKING' || p.state === 'WAITING') {
          const side = p.direction === 1 ? 'left' : 'right';
          const key = `${p.spawnFloor}-${side}`;
          const queue = waitingByFloorAndSide[key];
          
          // Sort queue by proximity to center
          queue.sort((a, b) => side === 'left' ? b.x - a.x : a.x - b.x);
          const index = queue.findIndex(q => q.id === p.id);
          
          // Calculate target X based on queue position (0.5 is center)
          // Shafts take up space, so we start at 0.42 and 0.58
          const targetX = side === 'left' ? 0.42 - (index * 0.05) : 0.58 + (index * 0.05);
          
          if (p.state === 'WALKING') {
            const speed = 0.2 * deltaTime;
            let newX = p.x + (p.direction * speed);
            
            if ((side === 'left' && newX >= targetX) || (side === 'right' && newX <= targetX)) {
              return { ...p, x: targetX, state: 'WAITING' };
            }
            return { ...p, x: newX };
          } else if (p.state === 'WAITING') {
            const newPatience = state.infinityMode ? p.patience : p.patience - deltaTime;
            if (newPatience <= 0) {
              lostHearts++;
              return null;
            }
            
            // Move forward if space opens up
            let newX = p.x;
            if (side === 'left' && p.x < targetX) {
               newX = Math.min(targetX, p.x + 0.2 * deltaTime);
            } else if (side === 'right' && p.x > targetX) {
               newX = Math.max(targetX, p.x - 0.2 * deltaTime);
            } else {
               newX = targetX;
            }
            
            return { ...p, x: newX, patience: newPatience };
          }
        }
        return p;
      }).filter(Boolean) as Passenger[];

      if (lostHearts > 0 && !state.infinityMode) {
        hearts = Math.max(0, hearts - lostHearts);
        if (hearts === 0) {
          isGameOverRef.current = true;
        }
      }

      // Update lifts
      let newLifts = lifts.map(lift => {
        let newLift = { ...lift };

        if (lift.state === 'MOVING' && lift.targetFloor !== null) {
          const moveSpeed = liftModel.speed * deltaTime;
          const dist = lift.targetFloor - lift.currentFloor;
          
          if (Math.abs(dist) <= moveSpeed) {
            newLift.currentFloor = lift.targetFloor;
            newLift.state = 'ARRIVED';
            newLift.doorTimer = 0.5;
          } else {
            newLift.currentFloor += Math.sign(dist) * moveSpeed;
          }
        } else if (lift.state === 'ARRIVED') {
          newLift.doorTimer -= deltaTime;
          if (newLift.doorTimer <= 0) {
            newLift.state = 'DOORS_OPENING';
            newLift.doorTimer = liftModel.doors;
            playSound('ding', state.settings.sfxVolume);
          }
        } else if (lift.state === 'DOORS_OPENING') {
          newLift.doorTimer -= deltaTime;
          if (newLift.doorTimer <= 0) {
            newLift.state = 'DOORS_OPEN';
            newLift.doorTimer = 1.0; // Stay open for 1s
            
            // Drop off passengers
            const remainingPassengers = lift.passengers.filter(p => p.destFloor !== lift.currentFloor);
            const droppedOff = lift.passengers.length - remainingPassengers.length;
            
            if (droppedOff > 0) {
              score += droppedOff * 10;
              xpEarned += droppedOff;
              passengersDelivered += droppedOff;
            }
            newLift.passengers = remainingPassengers;

            // Pick up passengers
            const waitingHere = newPassengers.filter(p => p.state === 'WAITING' && p.spawnFloor === lift.currentFloor);
            const spaceLeft = liftModel.capacity - newLift.passengers.length;
            
            if (spaceLeft > 0 && waitingHere.length > 0) {
              const toBoard = waitingHere.slice(0, spaceLeft);
              const toBoardIds = new Set(toBoard.map(p => p.id));
              
              newLift.passengers = [...newLift.passengers, ...toBoard.map(p => ({ ...p, state: 'IN_LIFT' as const, liftId: lift.id }))];
              
              // Remove boarded passengers from newPassengers
              newPassengers = newPassengers.filter(p => !toBoardIds.has(p.id));
            }
          }
        } else if (lift.state === 'DOORS_OPEN') {
          newLift.doorTimer -= deltaTime;
          if (newLift.doorTimer <= 0) {
            newLift.state = 'DOORS_CLOSING';
            newLift.doorTimer = liftModel.doors;
          }
        } else if (lift.state === 'DOORS_CLOSING') {
          newLift.doorTimer -= deltaTime;
          if (newLift.doorTimer <= 0) {
            newLift.state = 'IDLE';
            newLift.targetFloor = null;
          }
        }

        return newLift;
      });

      return {
        score,
        xpEarned,
        hearts,
        time,
        passengersDelivered,
        passengers: newPassengers,
        lifts: newLifts
      };
    });

  }, [diffConfig, levelConfig, liftModel, state.infinityMode]);

  const loop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = (timestamp - lastTimeRef.current) / 1000; // in seconds
    lastTimeRef.current = timestamp;

    updateGame(deltaTime);

    if (isGameOverRef.current) {
      setGameState(s => {
        setState(globalState => ({
          ...globalState,
          screen: 'GAME_OVER',
          xp: globalState.xp + s.xpEarned,
          lastScore: s.score,
          lastXpEarned: s.xpEarned,
          lastPassengersDelivered: s.passengersDelivered,
          unlockedLevels: s.score > 100 ? Math.max(globalState.unlockedLevels, state.currentLevel + 1) : globalState.unlockedLevels
        }));
        return s;
      });
    } else {
      reqRef.current = requestAnimationFrame(loop);
    }
  }, [updateGame, setState, state.currentLevel]);

  useEffect(() => {
    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [loop]);

  const handleFloorClick = (liftId: number, floor: number) => {
    playSound('tap', state.settings.sfxVolume);
    setGameState(prev => ({
      ...prev,
      lifts: prev.lifts.map(l => {
        if (l.id === liftId && l.state === 'IDLE') {
          return { ...l, targetFloor: floor, state: 'MOVING' };
        }
        return l;
      })
    }));
  };

  const handleLiftClick = (liftId: number) => {
    playSound('tap', state.settings.sfxVolume);
    setGameState(prev => ({
      ...prev,
      lifts: prev.lifts.map(l => {
        if (l.id === liftId) {
          if (l.state === 'IDLE' || l.state === 'DOORS_CLOSING') {
            return { ...l, state: 'DOORS_OPENING', doorTimer: liftModel.doors };
          }
        }
        return l;
      })
    }));
  };

  return {
    ...gameState,
    handleFloorClick,
    handleLiftClick,
    levelConfig,
    liftModel
  };
}
