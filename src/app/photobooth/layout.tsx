import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photobooth',
  description: 'Ambil foto, tambahkan stiker, dan download hasilnya.',
};

export default function PhotoboothLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
