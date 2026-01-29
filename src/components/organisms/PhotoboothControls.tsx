'use client';

import ShapeButton from '@/components/atoms/ShapeButton';
import StickerButton from '@/components/atoms/StickerButton';
import ColorSwatch from '@/components/atoms/ColorSwatch';
import type { PhotoShape } from '@/types/photobooth';

type PhotoboothControlsProps = {
  frameColors: string[];
  frameBackgrounds: { name: string; url: string }[];
  photoShapes: { name: PhotoShape; icon: string }[];
  stickers: string[];
  frameColor: string;
  frameTextColor: string;
  frameBackground: string | null;
  photoShape: PhotoShape;
  selectedSticker: string | null;
  setFrameColor: (color: string) => void;
  setFrameTextColor: (color: string) => void;
  setFrameBackground: (url: string | null) => void;
  setPhotoShape: (shape: PhotoShape) => void;
  setSelectedSticker: (sticker: string | null) => void;
};

export default function PhotoboothControls({
  frameColors,
  frameBackgrounds,
  photoShapes,
  stickers,
  frameColor,
  frameTextColor,
  frameBackground,
  photoShape,
  selectedSticker,
  setFrameColor,
  setFrameTextColor,
  setFrameBackground,
  setPhotoShape,
  setSelectedSticker,
}: PhotoboothControlsProps) {
  const isFrameCustom = !frameColors.includes(frameColor);
  const isTextCustom = !frameColors.includes(frameTextColor);

  return (
    <div className='bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 w-full sm:w-64'>
      <div className='mb-5'>
        <p className='text-white/80 text-sm font-medium mb-2'>Frame Color</p>
        <div className='flex flex-wrap gap-2'>
          <label
            className={`relative rounded-full border-2 transition-all hover:scale-110 ${
              isFrameCustom ? 'border-white scale-110' : 'border-white/30'
            }`}
            style={{ width: 32, height: 32, backgroundColor: frameColor }}
            title='Custom color'
          >
            <input
              type='color'
              value={frameColor}
              onChange={(e) => {
                setFrameColor(e.target.value);
                setFrameBackground(null);
              }}
              className='absolute inset-0 opacity-0 cursor-pointer'
              aria-label='Custom frame color'
            />
          </label>
          {frameColors.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              active={frameColor === color && !frameBackground}
              onClick={() => {
                setFrameColor(color);
                setFrameBackground(null);
              }}
            />
          ))}
        </div>
      </div>
      <div className='mb-5'>
        <p className='text-white/80 text-sm font-medium mb-2'>Text Color</p>
        <div className='flex flex-wrap gap-2'>
          <label
            className={`relative rounded-full border-2 transition-all hover:scale-110 ${
              isTextCustom ? 'border-white scale-110' : 'border-white/30'
            }`}
            style={{ width: 32, height: 32, backgroundColor: frameTextColor }}
            title='Custom color'
          >
            <input
              type='color'
              value={frameTextColor}
              onChange={(e) => setFrameTextColor(e.target.value)}
              className='absolute inset-0 opacity-0 cursor-pointer'
              aria-label='Custom text color'
            />
          </label>
          {frameColors.map((color) => (
            <ColorSwatch
              key={`text-${color}`}
              color={color}
              active={frameTextColor === color}
              onClick={() => setFrameTextColor(color)}
            />
          ))}
        </div>
      </div>
      <div className='mb-5'>
        <p className='text-white/80 text-sm font-medium mb-2'>Patterns</p>
        <div className='flex flex-wrap gap-2'>
          {frameBackgrounds.map((bg) => (
            <button
              key={bg.name}
              onClick={() => setFrameBackground(bg.url)}
              className={`w-11 h-11 rounded-lg border-2 overflow-hidden ${
                frameBackground === bg.url
                  ? 'border-white scale-110'
                  : 'border-white/30'
              }`}
            >
              <img src={bg.url} alt={bg.name} className='w-full h-full object-cover' />
            </button>
          ))}
        </div>
      </div>
      <div className='mb-5'>
        <p className='text-white/80 text-sm font-medium mb-2'>Photo Shape</p>
        <div className='flex gap-2'>
          {photoShapes.map((shape) => (
            <ShapeButton
              key={shape.name}
              icon={shape.icon}
              active={photoShape === shape.name}
              onClick={() => setPhotoShape(shape.name)}
            />
          ))}
        </div>
      </div>
      <div>
        <p className='text-white/80 text-sm font-medium mb-2'>Stickers</p>
        <div className='flex gap-2'>
          {stickers.map((sticker) => (
            <StickerButton
              key={sticker}
              src={sticker}
              selected={selectedSticker === sticker}
              onClick={() =>
                setSelectedSticker(selectedSticker === sticker ? null : sticker)
              }
            />
          ))}
        </div>
        {selectedSticker && (
          <p className='text-green-200 text-xs mt-2'>
            ✓ Sticker dipilih! Klik di foto/frame
          </p>
        )}
      </div>
    </div>
  );
}
