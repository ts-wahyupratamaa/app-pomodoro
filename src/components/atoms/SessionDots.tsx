'use client';

type SessionDotsProps = {
  total: number;
  completed: number;
  current: number;
};

export default function SessionDots({
  total,
  completed,
  current,
}: SessionDotsProps) {
  return (
    <div className='flex gap-2 sm:gap-3 mb-3 sm:mb-4'>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
            i < completed
              ? 'bg-amber-400'
              : i === current - 1
                ? 'bg-white ring-2 ring-amber-400'
                : 'bg-white/40'
          }`}
        />
      ))}
    </div>
  );
}
