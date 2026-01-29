'use client';

type PhotoboothActionsProps = {
  onRetake: () => void;
  onDownload: () => void;
  isDownloading: boolean;
};

export default function PhotoboothActions({
  onRetake,
  onDownload,
  isDownloading,
}: PhotoboothActionsProps) {
  return (
    <div className='relative z-10 w-full px-6 py-5 flex justify-center gap-3 flex-wrap'>
      <button
        onClick={onRetake}
        className='px-5 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl border border-white/20'
      >
        🔄 Retake
      </button>
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className='px-5 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50'
      >
        {isDownloading ? '⏳ Loading...' : '⬇ Download'}
      </button>
    </div>
  );
}
