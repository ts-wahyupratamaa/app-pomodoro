import type { PhotoShape } from '@/types/photobooth';

export const FRAME_BACKGROUNDS = [
  {
    name: 'Blue Stripes',
    url: 'https://photobooth-io.cc/assets/frame-backgrounds/blue-stripes.jpg',
  },
  {
    name: 'Brown Knitted',
    url: 'https://photobooth-io.cc/assets/frame-backgrounds/brown-knitted.jpg',
  },
  {
    name: 'Hot Pink Knitted',
    url: 'https://photobooth-io.cc/assets/frame-backgrounds/hot-pink-knitted.jpg',
  },
  {
    name: 'Red Stripes',
    url: 'https://photobooth-io.cc/assets/frame-backgrounds/red-stripes.jpg',
  },
  {
    name: 'Blue White Squares',
    url: 'https://photobooth-io.cc/assets/frame-backgrounds/blue-white-squares.jpg',
  },
];

export const FRAME_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#000000',
  '#ffffff',
  '#6b7280',
];

export const FRUIT_STICKERS = [
  '/anggur.png',
  '/apel.png',
  '/ceri.png',
  '/kelapa.png',
];

export const PHOTO_SHAPES: { name: PhotoShape; icon: string }[] = [
  { name: 'square', icon: '⬜' },
  { name: 'rounded', icon: '▢' },
  { name: 'circle', icon: '⭕' },
  { name: 'heart', icon: '💗' },
];
