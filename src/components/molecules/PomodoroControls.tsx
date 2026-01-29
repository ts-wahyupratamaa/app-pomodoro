'use client';

type PomodoroControlsProps = {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
};

export default function PomodoroControls({
  isRunning,
  onToggle,
  onReset,
}: PomodoroControlsProps) {
  return (
    <div className='relative z-50 flex items-center gap-4 mb-6 sm:mb-8'>
      <button
        onClick={onToggle}
        className='w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer touch-manipulation'
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {isRunning ? (
          <div className='flex gap-1'>
            <div className='w-1.5 h-5 sm:h-6 bg-[#6366f1] rounded-full' />
            <div className='w-1.5 h-5 sm:h-6 bg-[#6366f1] rounded-full' />
          </div>
        ) : (
          <div className='w-0 h-0 border-t-[9px] border-t-transparent border-l-[14px] border-l-[#6366f1] border-b-[9px] border-b-transparent ml-1 sm:border-t-[10px] sm:border-l-[16px] sm:border-b-[10px]' />
        )}
      </button>

      <button
        onClick={onReset}
        className='w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer touch-manipulation'
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className='w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-sm' />
      </button>
    </div>
  );
}
