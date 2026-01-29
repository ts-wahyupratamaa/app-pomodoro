import type { Metadata } from 'next';
import Pomodorotimer from '@/app/content/page';

export const metadata: Metadata = {
  title: 'Timer',
  description: 'Fokus dan istirahat dengan PomoStudio timer yang fun.',
};

export default function PomodoroPage() {
  return <Pomodorotimer />;
}
