import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mode Ambis',
  description: 'Fokus dan istirahat dengan PomoStudio timer yang fun.',
};

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
