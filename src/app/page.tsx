import type { Metadata } from 'next';
import NameScreen from '@/components/templates/NameScreen';

export const metadata: Metadata = {
  title: 'PomoStudio App',
  description: 'Mulai sesi PomoStudio - pomodoro dan photobooth favoritmu.',
};

export default function Home() {
  return (
    <div>
      <NameScreen />
    </div>
  );
}
