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
  title: {
    default: 'Pomodoro App',
    template: '%s | Pomodoro App',
  },
  description:
    'Pomodoro app dengan photobooth dan tema kustom untuk fokus yang lebih seru.',
  applicationName: 'Pomodoro App',
  keywords: [
    'pomodoro',
    'timer',
    'focus',
    'productivity',
    'photobooth',
    'study',
    'work',
  ],
  openGraph: {
    title: 'Pomodoro App',
    description:
      'Pomodoro app dengan photobooth dan tema kustom untuk fokus yang lebih seru.',
    url: siteUrl,
    siteName: 'Pomodoro App',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pomodoro App',
    description:
      'Pomodoro app dengan photobooth dan tema kustom untuk fokus yang lebih seru.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
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
