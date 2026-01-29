import type { Metadata } from 'next';
import Pomodorotimer from '@/app/content/page';

export const metadata: Metadata = {
  title: 'Pomodoro',
  description: 'Fokus dan istirahat dengan timer pomodoro yang fun.',
};

export default function PomodoroPage() {
  return <Pomodorotimer />;
}
