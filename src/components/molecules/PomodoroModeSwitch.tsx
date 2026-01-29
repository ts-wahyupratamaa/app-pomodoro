'use client';

type PomodoroModeSwitchProps = {
  mode: 'focus' | 'break';
  onSwitch: (mode: 'focus' | 'break') => void;
};

export default function PomodoroModeSwitch({
  mode,
  onSwitch,
}: PomodoroModeSwitchProps) {
  return (
    <div className='relative z-50 flex gap-3 mb-5 sm:mb-6'>
      <button
        onClick={() => onSwitch('focus')}
        className={`px-5 py-2 sm:px-6 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
          mode === 'focus'
            ? 'bg-white text-[#6366f1] shadow-lg'
            : 'bg-white/20 text-white hover:bg-white/30'
        }`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        Focus
      </button>
      <button
        onClick={() => onSwitch('break')}
        className={`px-5 py-2 sm:px-6 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
          mode === 'break'
            ? 'bg-white text-[#6366f1] shadow-lg'
            : 'bg-white/20 text-white hover:bg-white/30'
        }`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        Break
      </button>
    </div>
  );
}
