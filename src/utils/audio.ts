import { Howl } from 'howler';

// Sound file paths - assuming they are in public/assets/sounds/
const SOUND_PATHS = {
  ding: '/assets/sounds/ding.mp3',
  tap: '/assets/sounds/tap.mp3',
  bgm: '/assets/sounds/bgm.mp3',
};

let bgm: Howl | null = null;
let sfx: Record<string, Howl> = {};
let isInitialized = false;

export const initAudio = () => {
  if (isInitialized) return;

  sfx = {
    ding: new Howl({ src: [SOUND_PATHS.ding] }),
    tap: new Howl({ src: [SOUND_PATHS.tap] }),
  };

  bgm = new Howl({
    src: [SOUND_PATHS.bgm],
    loop: true,
    html5: true, // Use HTML5 Audio for large files like music
    autoplay: false,
  });

  isInitialized = true;
};

export const playSound = (sound: 'ding' | 'tap', volume: number) => {
  if (!sfx[sound]) return;
  sfx[sound].volume(volume / 100);
  sfx[sound].play();
};

export const playBGM = (volume: number) => {
  if (!bgm) return;
  bgm.volume(volume / 100);
  if (!bgm.playing()) {
    bgm.play();
  }
};

export const resumeBGM = () => {
  if (!bgm) return;
  if (!bgm.playing()) {
    bgm.play();
  }
};

export const stopBGM = () => {
  if (!bgm) return;
  bgm.stop();
};

export const updateBGMVolume = (volume: number) => {
  if (!bgm) return;
  bgm.volume(volume / 100);
};
