'use client';

import React from 'react';
import type { PageState } from '@/types/photobooth';

type PhotoboothCameraStageProps = {
  pageState: PageState;
  countdown: number | null;
  cameraError: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCapture: () => void;
};

export default function PhotoboothCameraStage({
  pageState,
  countdown,
  cameraError,
  videoRef,
  onCapture,
}: PhotoboothCameraStageProps) {
  return (
    <div className='flex flex-col items-center gap-4 w-full lg:w-auto lg:flex-shrink-0'>
      <div
        className='relative bg-black rounded-2xl overflow-hidden shadow-2xl'
        style={{ width: 'min(560px, 94vw)', height: 'min(420px, 72vw)' }}
      >
        {pageState === 'idle' && (
          <div className='w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white'>
            <p className='text-white/70'>Meminta izin kamera...</p>
            {cameraError && (
              <p className='text-red-400 text-sm mt-3 px-4 text-center'>
                {cameraError}
              </p>
            )}
          </div>
        )}
        {(pageState === 'camera' || pageState === 'capturing') && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className='w-full h-full object-cover'
              style={{ transform: 'scaleX(-1)' }}
            />
            {countdown !== null && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                <span className='text-[120px] font-black text-white drop-shadow-2xl'>
                  {countdown}
                </span>
              </div>
            )}
          </>
        )}
        {pageState === 'customize' && (
          <div className='w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white'>
            <span className='text-4xl mb-3'>✨</span>
            <p className='text-white/80 font-medium'>Foto siap!</p>
            <p className='text-white/50 text-sm mt-1'>
              Pilih sticker lalu klik foto/frame
            </p>
          </div>
        )}
      </div>

      <div className='flex gap-3 flex-wrap justify-center'>
        {pageState === 'camera' && (
          <button
            onClick={onCapture}
            className='px-6 py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold rounded-xl shadow-lg'
          >
            📸 Ambil 4 Foto
          </button>
        )}
        {pageState === 'capturing' && (
          <button
            disabled
            className='px-6 py-3 bg-gray-400 text-white font-bold rounded-xl opacity-70 cursor-not-allowed'
          >
            📸 Capturing...
          </button>
        )}
      </div>
    </div>
  );
}
