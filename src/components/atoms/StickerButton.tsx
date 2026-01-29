'use client';

type StickerButtonProps = {
  src: string;
  selected?: boolean;
  onClick: () => void;
  size?: number;
};

export default function StickerButton({
  src,
  selected = false,
  onClick,
  size = 40,
}: StickerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg transition-all flex items-center justify-center ${
        selected ? 'bg-white/40 scale-110 ring-2 ring-white' : 'bg-white/20 hover:bg-white/30'
      }`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt='sticker'
        className='w-7 h-7'
        style={{ width: size * 0.7, height: size * 0.7 }}
      />
    </button>
  );
}
