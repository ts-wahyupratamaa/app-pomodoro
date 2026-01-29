import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'PomoStudio',
  description:
    'PomoStudio - Pomodoro timer + Photobooth dalam satu tempat. Ambis belajar, self reward dengan foto!',
  applicationName: 'PomoStudio',
  keywords: [
    'pomodoro',
    'pomodoro timer',
    'pomodoro technique',
    'pomodoro online',
    'pomodoro app',
    'timer belajar',
    'timer fokus',
    'timer produktif',
    'focus timer',
    'study timer',
    'work timer',
    'productivity timer',
    'productivity app',
    'photobooth',
    'photobooth online',
    'photo booth',
    'selfie booth',
    'self reward',
    'study break',
    'belajar produktif',
    'teknik pomodoro',
    'aplikasi belajar',
    'aplikasi produktif',
    'time management',
    'manajemen waktu',
    'fokus belajar',
    'ambis',
    'mahasiswa',
    'pelajar',
    'kerja produktif',
    'istirahat belajar',
    'break timer',
    'pomostudio',
    'pomo studio',
  ],
  openGraph: {
    title: 'PomoStudio - Pomodoro Timer & Photobooth',
    description:
      '🍅 Ambis belajar, self reward dengan foto! Pomodoro timer + Photobooth dalam satu aplikasi.',
    url: siteUrl,
    siteName: 'PomoStudio',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/desain.png',
        width: 1200,
        height: 630,
        alt: 'PomoStudio - Pomodoro Timer & Photobooth',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PomoStudio - Pomodoro Timer & Photobooth',
    description:
      '🍅 Ambis belajar, self reward dengan foto! Pomodoro timer + Photobooth dalam satu aplikasi.',
    images: ['/desain.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/iconmeta.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='id'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
