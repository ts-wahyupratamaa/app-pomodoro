'use client';

type PomodoroTimerRingProps = {
  mode: 'focus' | 'break';
  timeText: string;
  circleRadius: number;
  circumference: number;
  strokeDashoffset: number;
  className?: string;
};

export default function PomodoroTimerRing({
  mode,
  timeText,
  circleRadius,
  circumference,
  strokeDashoffset,
  className,
}: PomodoroTimerRingProps) {
  return (
    <div className={`relative mb-8 sm:mb-10 ${className ?? ''}`}>
      <svg width='300' height='300' className='transform -rotate-90'>
        <circle
          cx='150'
          cy='150'
          r={circleRadius}
          stroke='#171364ff'
          strokeWidth='14'
          fill='transparent'
        />
        <circle
          cx='150'
          cy='150'
          r={circleRadius}
          stroke='#fbbf24'
          strokeWidth='14'
          fill='transparent'
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className='transition-all duration-1000 ease-linear'
        />
      </svg>

      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='w-52 h-52 rounded-full bg-white shadow-xl flex flex-col items-center justify-center'>
          <span className='text-sm uppercase tracking-[0.3em] text-[#6366f1] font-extrabold mb-1'>
            {mode === 'focus' ? 'FOCUS' : 'BREAK'}
          </span>
          <span className='text-5xl font-light text-[#6366f1] tracking-wide'>
            {timeText}
          </span>
        </div>
      </div>
    </div>
  );
}
