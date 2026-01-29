import type { Metadata } from 'next';
import NameScreen from '@/components/templates/NameScreen';

export const metadata: Metadata = {
  title: 'Mulai',
  description: 'Mulai sesi pomodoro dan atur tema favoritmu.',
};

export default function Home() {
  return (
    <div>
      <NameScreen />
    </div>
  );
}
