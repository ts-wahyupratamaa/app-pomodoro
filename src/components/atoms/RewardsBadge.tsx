'use client';

type RewardsBadgeProps = {
  count: number;
};

export default function RewardsBadge({ count }: RewardsBadgeProps) {
  return (
    <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-white/10'>
      <span className='text-white/80 text-xs sm:text-sm'>🍇 Rewards:</span>
      <span className='text-white font-bold'>{count} fruits</span>
    </div>
  );
}
