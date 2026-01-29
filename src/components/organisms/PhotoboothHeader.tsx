'use client';

import { IoArrowUndoOutline } from 'react-icons/io5';

type PhotoboothHeaderProps = {
  currentFruit: string;
  onBack: () => void;
};

export default function PhotoboothHeader({
  currentFruit,
  onBack,
}: PhotoboothHeaderProps) {
  return (
    <div className='relative z-10 w-full px-4 sm:px-6 md:px-10 py-4 flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <img
          src={currentFruit}
          alt='fruit'
          className='w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 drop-shadow-lg'
        />
        <div className='flex flex-col'>
          <h1 className='text-2xl md:text-4xl font-extrabold tracking-wide text-white drop-shadow-lg'>
            Photobooth
          </h1>
          <p className='text-white/60 text-xs sm:text-sm font-medium'>
            Selamat! Kamu layak foto dulu 🎉
          </p>
        </div>
      </div>
      <button
        onClick={onBack}
        className='flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-medium'
      >
        <IoArrowUndoOutline className='w-4 h-4' />
        Kembali
      </button>
    </div>
  );
}
