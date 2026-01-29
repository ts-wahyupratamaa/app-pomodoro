export type PhotoShape = 'square' | 'rounded' | 'circle' | 'heart';

export type Sticker = {
  id: number;
  image: string;
  x: number;
  y: number;
  photoIndex: number;
};

export type FrameSticker = {
  id: number;
  image: string;
  x: number;
  y: number;
};

export type PageState = 'idle' | 'camera' | 'capturing' | 'customize';
