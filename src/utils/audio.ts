import { Howl } from 'howler';

// Sound file paths - assuming they are in public/assets/sounds/
const SOUND_PATHS = {
  ding: '/assets/sounds/ding.mp3',
  tap: '/assets/sounds/tap.mp3',
  bgm1: '/assets/sounds/bgm.mp3',
  bgm2: '/assets/sounds/bgm2.mp3',
  bgm3: '/assets/sounds/bgm3.mp3',
};

let bgms: Howl[] = [];
let currentTrackIndex = 0;
let lastVolume = 50;
let sfx: Record<string, Howl> = {};
let isInitialized = false;

const playNextTrack = () => {
  const nextIndex = (currentTrackIndex + 1) % bgms.length;
  playBGM(lastVolume, nextIndex);
};

export const initAudio = () => {
  if (isInitialized) return;

  sfx = {
    ding: new Howl({ src: [SOUND_PATHS.ding] }),
    tap: new Howl({ src: [SOUND_PATHS.tap] }),
  };

  bgms = [
    new Howl({ 
      src: [SOUND_PATHS.bgm1], 
      loop: false, 
      autoplay: false,
      onend: playNextTrack
    }),
    new Howl({ 
      src: [SOUND_PATHS.bgm2], 
      loop: false, 
      autoplay: false,
      onend: playNextTrack
    }),
    new Howl({ 
      src: [SOUND_PATHS.bgm3], 
      loop: false, 
      autoplay: false,
      onend: playNextTrack
    }),
  ];

  isInitialized = true;
};

export const playSound = (sound: 'ding' | 'tap', volume: number) => {
  if (!sfx[sound]) return;
  sfx[sound].volume(volume / 100);
  sfx[sound].play();
};

export const playBGM = (volume: number, trackIndex: number = 0) => {
  if (bgms.length === 0) return;
  
  lastVolume = volume;

  // Stop other tracks if playing
  bgms.forEach((bgm, index) => {
    if (index !== trackIndex && bgm.playing()) {
      bgm.stop();
    }
  });

  const targetBGM = bgms[trackIndex];
  if (targetBGM) {
    targetBGM.volume(volume / 100);
    if (!targetBGM.playing()) {
      targetBGM.play();
    }
    currentTrackIndex = trackIndex;
  }
};

export const resumeBGM = () => {
  const targetBGM = bgms[currentTrackIndex];
  if (targetBGM && !targetBGM.playing()) {
    targetBGM.play();
  }
};

export const stopBGM = () => {
  bgms.forEach(bgm => bgm.stop());
};

export const updateBGMVolume = (volume: number) => {
  lastVolume = volume;
  bgms.forEach(bgm => bgm.volume(volume / 100));
};
