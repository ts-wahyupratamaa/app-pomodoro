'use client';

type ColorSwatchProps = {
  color: string;
  active?: boolean;
  onClick: () => void;
  size?: number;
};

export default function ColorSwatch({
  color,
  active = false,
  onClick,
  size = 32,
}: ColorSwatchProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border-2 transition-all hover:scale-110 ${
        active ? 'border-white scale-110' : 'border-white/30'
      }`}
      style={{ backgroundColor: color, width: size, height: size }}
    />
  );
}
