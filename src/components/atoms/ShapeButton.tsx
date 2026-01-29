'use client';

type ShapeButtonProps = {
  icon: string;
  active?: boolean;
  onClick: () => void;
};

export default function ShapeButton({
  icon,
  active = false,
  onClick,
}: ShapeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-lg text-lg transition-all ${
        active ? 'bg-white/40 scale-110' : 'bg-white/20 hover:bg-white/30'
      }`}
    >
      {icon}
    </button>
  );
}
