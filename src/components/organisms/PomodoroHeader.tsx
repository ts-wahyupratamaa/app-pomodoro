'use client';

import Image from 'next/image';

type PomodoroHeaderProps = {
  userName: string;
  fruitCount: number;
  minFruits?: number;
  onGoPhotobooth: () => void;
  onGoHome: () => void;
};

export default function PomodoroHeader({
  userName,
  fruitCount,
  minFruits = 25,
  onGoPhotobooth,
  onGoHome,
}: PomodoroHeaderProps) {
  const canOpen = fruitCount >= minFruits;

  return (
    <>
      <div className='absolute top-4 sm:top-6 right-4 sm:right-8 z-30 flex flex-col items-end gap-3'>
        {userName && (
          <div className='text-white/90 text-sm sm:text-lg font-medium text-right'>
            halo ka,{' '}
            <span className='font-bold text-amber-300'>{userName}</span>! 👋
          </div>
        )}

        {!canOpen ? (
          <button className='flex items-center gap-2 py-2 rounded-xl backdrop-blur-sm text-white text-xs sm:text-sm font-medium'>
            Tunggu {minFruits} fruits untuk buka Photobooth!
          </button>
        ) : (
          <div className='flex flex-col items-center gap-2'>
            <button className='flex items-center gap-2 px-4 py-2 rounded-xl hover:scale-105 transition-all text-white text-xs sm:text-sm font-medium backdrop-blur-sm'>
              Photobooth Terbuka!
            </button>
            <div className='animate-wiggle hover:animate-shake cursor-pointer'>
              <Image
                src='/desain.png'
                alt='photobooth'
                width={130}
                height={130}
                className='drop-shadow-2xl hover:scale-110 transition-transform duration-300 w-[96px] h-[96px] sm:w-[130px] sm:h-[130px]'
                onClick={onGoPhotobooth}
              />
            </div>
          </div>
        )}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
          @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
          }
          .animate-wiggle {
            animation: wiggle 2s ease-in-out infinite;
          }
          .animate-shake {
            animation: shake 0.5s;
            animation-iteration-count: infinite;
          }
        `,
          }}
        />
      </div>

      <button
        onClick={onGoHome}
        className='absolute top-4 sm:top-6 left-4 sm:left-8 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-all text-white text-xs sm:text-sm font-medium backdrop-blur-sm'
      >
        ← Kembali
      </button>
    </>
  );
}
