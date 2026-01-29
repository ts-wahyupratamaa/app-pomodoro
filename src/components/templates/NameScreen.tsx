'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import TransitionOverlay from '@/components/organisms/TransitionOverlay';
import { ROUTES } from '@/lib/routes';

const FRUIT_IMAGES = ['/anggur.png', '/apel.png', '/ceri.png', '/kelapa.png'];

const COLOR_OPTIONS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
];

export default function NameScreen() {
  const [name, setName] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [transitionText, setTransitionText] = useState('Memulai sesi fokus...');
  const [currentFruitIndex, setCurrentFruitIndex] = useState(0);
  const [bgColor, setBgColor] = useState('#6366f1');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const router = useRouter();

  const setNameCookie = (value: string) => {
    const encoded = encodeURIComponent(value);
    document.cookie = `pomodoro_name=${encoded}; path=/; max-age=31536000`;
  };

  useEffect(() => {
    const savedColor = localStorage.getItem('userBgColor');
    if (savedColor) {
      setBgColor(savedColor);
    }
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setNameCookie(savedName);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFruitIndex((prev) => (prev + 1) % FRUIT_IMAGES.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onLoadText = localStorage.getItem('transitionOnLoadText');
    if (onLoadText) {
      setTransitionText(onLoadText);
      localStorage.removeItem('transitionOnLoadText');
    } else {
      setTransitionText('Selamat Datang! 👋');
    }

    const timer = setTimeout(() => setIsTransitioning(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleColorChange = (color: string) => {
    setBgColor(color);
    localStorage.setItem('userBgColor', color);
    setShowColorPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('userName', name.trim());
      localStorage.setItem('userBgColor', bgColor);
      setNameCookie(name.trim());
      setTransitionText('Memulai sesi fokus... 🚀');
      setIsTransitioning(true);
      setTimeout(() => {
        router.push(ROUTES.content);
      }, 3500);
    }
  };

  return (
    <div
      className='min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans transition-colors duration-500 px-6 py-10 md:px-12'
      style={{ backgroundColor: bgColor }}
      suppressHydrationWarning
    >
      <div className='absolute top-6 right-8 z-30 flex flex-col items-end gap-2'>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className='flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-all text-white text-sm font-medium backdrop-blur-sm'
        >
          <div
            className='w-5 h-5 rounded-full border-2 border-white shadow-sm'
            style={{ backgroundColor: bgColor }}
          />
          🎨 Ubah Warna
        </button>

        {showColorPicker && (
          <div className='bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200'>
            <p className='text-gray-600 text-xs font-medium mb-3'>
              Pilih warna tema:
            </p>
            <div className='grid grid-cols-5 gap-2'>
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                    bgColor === color.value
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className={`absolute inset-0 overflow-hidden transition-all duration-1000 ease-out
        ${isTransitioning ? 'opacity-0 scale-150' : 'opacity-100 scale-100'}`}
      >
        <div className='absolute top-0 right-0 w-[200%] h-[200%] -translate-y-1/2 translate-x-1/4 rotate-[-20deg]'>
          <div className='absolute top-[20%] left-0 w-full h-8 bg-white/10' />
          <div className='absolute top-[35%] left-0 w-full h-6 bg-white/10' />
          <div className='absolute top-[80%] left-0 w-full h-10 bg-white/10' />
        </div>
      </div>

      <div
        className={`relative z-10 flex flex-col lg:flex-row items-center justify-center gap-10 md:gap-16 w-full max-w-6xl transition-all duration-1000 ease-out
        ${isTransitioning ? 'scale-50 opacity-0 blur-xl' : 'scale-100 opacity-100 blur-0'}`}
      >
        <div className='flex-1 flex flex-col items-center lg:items-start gap-6 text-center lg:text-left'>
          <div className='relative w-32 h-32'>
            {FRUIT_IMAGES.map((fruit, index) => (
              <img
                key={fruit}
                src={fruit}
                alt='fruit'
                className={`absolute inset-0 w-32 h-32 object-contain transition-all duration-500 drop-shadow-2xl
                  ${
                    index === currentFruitIndex
                      ? 'opacity-100 scale-100 rotate-0'
                      : 'opacity-0 scale-50 rotate-180'
                  }`}
                style={{
                  filter:
                    index === currentFruitIndex
                      ? 'drop-shadow(0 0 30px rgba(255,255,255,0.4))'
                      : 'none',
                }}
              />
            ))}
          </div>

          <div>
            <h1 className='text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight'>
              Pomodoro
            </h1>
            <h1 className='text-4xl sm:text-5xl md:text-7xl font-extrabold text-amber-300 leading-tight'>
              Timer
            </h1>
          </div>

          <p className='text-white/70 text-base md:text-lg max-w-md'>
            Tingkatkan produktivitasmu dengan teknik pomodoro. Fokus 25 menit,
            istirahat 5 menit.
          </p>
        </div>

        <div className='flex-1 flex justify-center w-full'>
          <div className='flex flex-col items-center gap-6 w-full max-w-md'>
            <h2 className='text-xl md:text-2xl font-bold text-white'>
              Siapa namamu?
            </h2>
            <p className='text-white/70 text-center text-sm md:text-base'>
              Masukkan namamu untuk memulai sesi fokus!
            </p>

            <form
              onSubmit={handleSubmit}
              className='flex flex-col items-center gap-4 w-full'
            >
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Masukkan nama kamu...'
                autoFocus
                className='w-full px-4 md:px-5 py-3 md:py-4 rounded-xl bg-white/90 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-amber-400 transition-all text-center text-base md:text-lg'
                suppressHydrationWarning
              />

              <p
                className={`text-xs md:text-sm transition-all duration-300 ${name.trim() ? 'text-amber-300' : 'text-white/50'}`}
              >
                {name.trim()
                  ? '⏎ Tekan Enter untuk mulai'
                  : 'Ketik namamu dulu ya...'}
              </p>
            </form>

            <div className='flex gap-3 mt-2'>
              {FRUIT_IMAGES.map((fruit, index) => (
                <img
                  key={fruit}
                  src={fruit}
                  alt='fruit'
                  className={`w-8 h-8 object-contain transition-all duration-300
                    ${index === currentFruitIndex ? 'scale-125 opacity-100' : 'scale-100 opacity-40'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <TransitionOverlay
        active={isTransitioning}
        bgColor={bgColor}
        text={transitionText}
        fruits={FRUIT_IMAGES}
        currentFruitIndex={currentFruitIndex}
      />

      <a
        href='https://www.linkedin.com/in/wahyupratamaa/'
        target='_blank'
        rel='noreferrer'
        className='absolute bottom-4 left-4 text-xs text-white/60 hover:text-white/90 transition-colors'
      >
        developer: wahyupratama
      </a>
    </div>
  );
}
