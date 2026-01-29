'use client';

import React from 'react';
import type { PhotoShape, Sticker, FrameSticker } from '@/types/photobooth';

type PhotoboothFrameProps = {
  photos: string[];
  photoShape: PhotoShape;
  stickers: Sticker[];
  frameStickers: FrameSticker[];
  frameBackground: string | null;
  frameColor: string;
  frameTextColor: string;
  userName: string;
  getClipPath: (shape: PhotoShape) => string;
  onAddStickerToFrame: (e: React.MouseEvent<HTMLDivElement>) => void;
  onAddStickerToPhoto: (
    index: number,
    e: React.MouseEvent<HTMLDivElement>,
  ) => void;
  onRemoveSticker: (id: number) => void;
  onRemoveFrameSticker: (id: number) => void;
  getFirstName: (name: string) => string;
};

export default function PhotoboothFrame({
  photos,
  photoShape,
  stickers,
  frameStickers,
  frameBackground,
  frameColor,
  frameTextColor,
  userName,
  getClipPath,
  onAddStickerToFrame,
  onAddStickerToPhoto,
  onRemoveSticker,
  onRemoveFrameSticker,
  getFirstName,
}: PhotoboothFrameProps) {
  return (
    <div className='flex flex-col items-center gap-4 scale-90 sm:scale-100'>
      <div
        className='relative overflow-hidden shadow-2xl cursor-pointer'
        style={{
          width: 204,
          backgroundColor: frameBackground ? 'transparent' : frameColor,
          backgroundImage: frameBackground ? `url(${frameBackground})` : 'none',
          backgroundSize: 'cover',
          padding: 12,
        }}
        onClick={onAddStickerToFrame}
      >
        <div className='flex flex-col gap-2'>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              data-photo={index}
              className='relative bg-gray-900/80 overflow-hidden cursor-pointer hover:brightness-110'
              style={{
                width: 180,
                height: 135,
                clipPath: getClipPath(photoShape),
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (photos[index]) onAddStickerToPhoto(index, e);
              }}
            >
              {photos[index] ? (
                <>
                  <img
                    src={photos[index]}
                    alt={`Photo ${index + 1}`}
                    className='w-full h-full object-cover'
                  />
                  {stickers
                    .filter((s) => s.photoIndex === index)
                    .map((sticker) => (
                      <img
                        key={sticker.id}
                        src={sticker.image}
                        alt='sticker'
                        className='absolute w-8 h-8 cursor-pointer hover:scale-125 transition-transform'
                        style={{
                          left: sticker.x - 16,
                          top: sticker.y - 16,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSticker(sticker.id);
                        }}
                      />
                    ))}
                </>
              ) : (
                <div className='w-full h-full flex items-center justify-center text-white/30 text-2xl font-bold'>
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
        {frameStickers.map((sticker) => (
          <img
            key={sticker.id}
            src={sticker.image}
            alt='sticker'
            className='absolute w-10 h-10 cursor-pointer hover:scale-125 transition-transform z-20'
            style={{ left: sticker.x - 20, top: sticker.y - 20 }}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFrameSticker(sticker.id);
            }}
          />
        ))}
        <p
          className='text-center text-sm font-medium mt-3 drop-shadow-lg'
          style={{ color: frameTextColor }}
        >
          pomodoro by {getFirstName(userName) || 'you'}
        </p>
      </div>
    </div>
  );
}
