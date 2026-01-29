import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pomodoro',
  description: 'Fokus dan istirahat dengan timer pomodoro yang fun.',
};

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
