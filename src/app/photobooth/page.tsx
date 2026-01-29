'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import TransitionOverlay from '@/components/organisms/TransitionOverlay';
import PhotoboothHeader from '@/components/organisms/PhotoboothHeader';
import PhotoboothCameraStage from '@/components/organisms/PhotoboothCameraStage';
import PhotoboothFrame from '@/components/organisms/PhotoboothFrame';
import PhotoboothControls from '@/components/organisms/PhotoboothControls';
import PhotoboothActions from '@/components/organisms/PhotoboothActions';
import {
  FRAME_BACKGROUNDS,
  FRAME_COLORS,
  FRUIT_STICKERS,
  PHOTO_SHAPES,
} from '@/lib/photobooth';
import type {
  PhotoShape,
  Sticker,
  FrameSticker,
  PageState,
} from '@/types/photobooth';
import { ROUTES } from '@/lib/routes';

export default function PhotoboothPage() {
  const [bgColor, setBgColor] = useState('#6366f1');
  const [userName, setUserName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pageState, setPageState] = useState<PageState>('idle');
  const [frameBackground, setFrameBackground] = useState<string | null>(null);
  const [frameColor, setFrameColor] = useState('#ffffffff');
  const [frameTextColor, setFrameTextColor] = useState('#000000');
  const [photoShape, setPhotoShape] = useState<PhotoShape>('square');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [frameStickers, setFrameStickers] = useState<FrameSticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [currentFruitIndex, setCurrentFruitIndex] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [transitionText, setTransitionText] = useState('Memuat photobooth...');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stickerIdRef = useRef(0);
  const photosRef = useRef<string[]>([]);
  const TOTAL_PHOTOS = 4;

  const getFirstName = (name: string) => name.split(' ')[0] || name;

  useEffect(() => {
    const savedColor = localStorage.getItem('userBgColor');
    const savedName = localStorage.getItem('userName');
    if (savedColor) setBgColor(savedColor);
    if (savedName) setUserName(savedName);
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentFruitIndex((p) => (p + 1) % FRUIT_STICKERS.length),
      800,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pageState === 'idle') {
      startCamera();
    }
  }, [pageState]);

  useEffect(() => {
    setIsTransitioning(true);

    const onLoadText = localStorage.getItem('transitionOnLoadText');
    if (onLoadText) {
      setTransitionText(onLoadText);
      localStorage.removeItem('transitionOnLoadText');
    } else {
      setTransitionText('Memuat Photobooth...');
    }

    const timer = setTimeout(() => setIsTransitioning(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const navigateBack = () => {
    setTransitionText('Kembali ke Pomodoro...');
    setIsTransitioning(true);
    localStorage.setItem('transitionOnLoadText', 'Memulai sesi fokus...');
    setTimeout(() => {
      stopCamera();
      window.location.href = ROUTES.content;
    }, 3500);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Browser ini tidak mendukung akses kamera.');
        return;
      }
      if (!window.isSecureContext) {
        setCameraError('Kamera hanya bisa diakses via HTTPS (atau localhost).');
        return;
      }

      const preferredConstraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      let mediaStream: MediaStream;
      try {
        mediaStream =
          await navigator.mediaDevices.getUserMedia(preferredConstraints);
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setPageState('camera');
      setPhotos([]);
      photosRef.current = [];

      setStream(mediaStream);
    } catch (error) {
      if (typeof error === 'object' && error && 'name' in error) {
        const errName = (error as { name: string }).name;
        if (errName === 'NotAllowedError') {
          setCameraError('Akses kamera ditolak. Izinkan di setting browser.');
          return;
        }
        if (errName === 'NotFoundError') {
          setCameraError('Kamera tidak ditemukan di perangkat ini.');
          return;
        }
        if (errName === 'NotReadableError') {
          setCameraError('Kamera sedang dipakai aplikasi lain.');
          return;
        }
        if (errName === 'OverconstrainedError') {
          setCameraError('Resolusi kamera tidak tersedia.');
          return;
        }
      }
      console.error('Camera error:', error);
      setCameraError('Gagal akses kamera. Coba refresh halaman.');
    }
  };

  useEffect(() => {
    if (
      stream &&
      videoRef.current &&
      (pageState === 'camera' || pageState === 'capturing')
    ) {
      const videoEl = videoRef.current;
      videoEl.srcObject = stream;

      const playVideo = async () => {
        try {
          await videoEl.play();
        } catch (e) {
          console.error('Video play error:', e);
          setTimeout(async () => {
            try {
              await videoEl.play();
            } catch {
              setCameraError('Gagal memutar video. Klik tombol lagi.');
            }
          }, 500);
        }
      };

      if (videoEl.readyState >= 1) {
        playVideo();
      } else {
        videoEl.onloadedmetadata = () => playVideo();
      }
    }
  }, [stream, pageState]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [stream]);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0);
        ctx.restore();
        const imageData = canvas.toDataURL('image/png');
        photosRef.current = [...photosRef.current, imageData];
        setPhotos([...photosRef.current]);
        return true;
      }
    }
    return false;
  }, []);

  const captureNextPhoto = useCallback(() => {
    if (photosRef.current.length >= TOTAL_PHOTOS) {
      stopCamera();
      setPageState('customize');
      return;
    }
    setCountdown(3);
  }, [stopCamera]);

  const startCaptureSequence = () => {
    if (pageState === 'camera') {
      setPageState('capturing');
      photosRef.current = [];
      setPhotos([]);
      captureNextPhoto();
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const success = takePhoto();
      setCountdown(null);
      if (success) {
        if (photosRef.current.length < TOTAL_PHOTOS) {
          setTimeout(() => captureNextPhoto(), 800);
        } else {
          stopCamera();
          setPageState('customize');
        }
      }
    }
  }, [countdown, takePhoto, captureNextPhoto, stopCamera]);

  const addStickerToPhoto = (
    photoIndex: number,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (!selectedSticker || pageState !== 'customize') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setStickers([
      ...stickers,
      {
        id: stickerIdRef.current++,
        image: selectedSticker,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        photoIndex,
      },
    ]);
  };

  const addStickerToFrame = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedSticker || pageState !== 'customize') return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-photo]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setFrameStickers([
      ...frameStickers,
      {
        id: stickerIdRef.current++,
        image: selectedSticker,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    ]);
  };

  const removeSticker = (id: number) =>
    setStickers(stickers.filter((s) => s.id !== id));
  const removeFrameSticker = (id: number) =>
    setFrameStickers(frameStickers.filter((s) => s.id !== id));
  const retakePhotos = () => {
    setPhotos([]);
    photosRef.current = [];
    setStickers([]);
    setFrameStickers([]);
    setPageState('idle');
  };

  const getClipPath = (shape: PhotoShape) => {
    if (shape === 'circle') return 'ellipse(50% 50% at 50% 50%)';
    if (shape === 'rounded') return 'inset(0 round 12px)';
    if (shape === 'heart')
      return 'polygon(50% 100%, 0% 35%, 15% 0%, 50% 15%, 85% 0%, 100% 35%)';
    return 'none';
  };

  const loadImageAsync = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  };

  const isSafeCanvasImage = (src: string) => {
    if (
      src.startsWith('data:') ||
      src.startsWith('blob:') ||
      src.startsWith('/')
    )
      return true;
    try {
      const url = new URL(src, window.location.href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  };

  const generateFinalImage = async (): Promise<string | null> => {
    if (!frameCanvasRef.current || photos.length !== TOTAL_PHOTOS) return null;

    const canvas = frameCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const photoWidth = 180;
    const photoHeight = 135;
    const padding = 12;
    const gap = 8;

    canvas.width = photoWidth + padding * 2;
    canvas.height =
      photoHeight * TOTAL_PHOTOS + gap * (TOTAL_PHOTOS - 1) + padding * 2 + 25;

    ctx.fillStyle = frameColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (frameBackground && isSafeCanvasImage(frameBackground)) {
      try {
        const bgImg = await loadImageAsync(frameBackground);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      } catch (e) {
        console.error('Background load error:', e);
      }
    }

    for (let i = 0; i < photos.length; i++) {
      try {
        const img = await loadImageAsync(photos[i]);
        const y = padding + i * (photoHeight + gap);

        ctx.save();
        if (photoShape === 'circle') {
          ctx.beginPath();
          ctx.ellipse(
            padding + photoWidth / 2,
            y + photoHeight / 2,
            photoWidth / 2,
            photoHeight / 2,
            0,
            0,
            Math.PI * 2,
          );
          ctx.clip();
        } else if (photoShape === 'rounded') {
          const r = 8;
          ctx.beginPath();
          ctx.moveTo(padding + r, y);
          ctx.lineTo(padding + photoWidth - r, y);
          ctx.quadraticCurveTo(
            padding + photoWidth,
            y,
            padding + photoWidth,
            y + r,
          );
          ctx.lineTo(padding + photoWidth, y + photoHeight - r);
          ctx.quadraticCurveTo(
            padding + photoWidth,
            y + photoHeight,
            padding + photoWidth - r,
            y + photoHeight,
          );
          ctx.lineTo(padding + r, y + photoHeight);
          ctx.quadraticCurveTo(
            padding,
            y + photoHeight,
            padding,
            y + photoHeight - r,
          );
          ctx.lineTo(padding, y + r);
          ctx.quadraticCurveTo(padding, y, padding + r, y);
          ctx.clip();
        } else if (photoShape === 'heart') {
          ctx.beginPath();
          ctx.moveTo(padding + photoWidth * 0.5, y + photoHeight);
          ctx.lineTo(padding, y + photoHeight * 0.35);
          ctx.lineTo(padding + photoWidth * 0.15, y);
          ctx.lineTo(padding + photoWidth * 0.5, y + photoHeight * 0.15);
          ctx.lineTo(padding + photoWidth * 0.85, y);
          ctx.lineTo(padding + photoWidth, y + photoHeight * 0.35);
          ctx.closePath();
          ctx.clip();
        }
        ctx.drawImage(img, padding, y, photoWidth, photoHeight);
        ctx.restore();

        for (const s of stickers.filter((st) => st.photoIndex === i)) {
          try {
            const sImg = await loadImageAsync(s.image);
            ctx.drawImage(sImg, padding + s.x - 15, y + s.y - 15, 30, 30);
          } catch (e) {
            console.error('Sticker load error:', e);
          }
        }
      } catch (e) {
        console.error('Photo load error:', e);
      }
    }

    for (const s of frameStickers) {
      try {
        const sImg = await loadImageAsync(s.image);
        ctx.drawImage(sImg, s.x - 20, s.y - 20, 40, 40);
      } catch (e) {
        console.error('Frame sticker error:', e);
      }
    }

    ctx.fillStyle = frameTextColor;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 2;
    ctx.fillText(
      `pomodoro by ${getFirstName(userName) || 'you'}`,
      canvas.width / 2,
      canvas.height - 8,
    );

    try {
      return canvas.toDataURL('image/png');
    } catch (e) {
      console.error('Canvas error (likely tainted):', e);
      return null;
    }
  };

  const downloadPhoto = async () => {
    if (photos.length !== TOTAL_PHOTOS || isDownloading) return;
    setIsDownloading(true);

    try {
      const dataUrl = await generateFinalImage();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `photobooth-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(
          'Gagal membuat gambar. Coba ganti pattern frame ke warna solid saja.',
        );
      }
    } catch (e) {
      console.error('Download error:', e);
      alert('Gagal download. Coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col relative overflow-hidden font-sans transition-all duration-700 ease-out ${isLoaded && !isExiting ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
      style={{ backgroundColor: bgColor }}
      suppressHydrationWarning
    >
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-0 w-[200%] h-[200%] -translate-y-1/2 translate-x-1/4 rotate-[-20deg]'>
          <div className='absolute top-[20%] left-0 w-full h-8 bg-white/10' />
          <div className='absolute top-[35%] left-0 w-full h-6 bg-white/10' />
          <div className='absolute top-[80%] left-0 w-full h-10 bg-white/10' />
        </div>
      </div>

      <PhotoboothHeader
        currentFruit={FRUIT_STICKERS[currentFruitIndex]}
        onBack={navigateBack}
      />

      <div className='relative z-10 flex-1 flex items-center justify-center'>
        <div className='flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 px-4 py-4 w-full'>
          <PhotoboothCameraStage
            pageState={pageState}
            countdown={countdown}
            cameraError={cameraError}
            videoRef={videoRef}
            onCapture={startCaptureSequence}
          />

          <div className='flex flex-col md:flex-row items-center gap-4 lg:gap-6'>
            <PhotoboothFrame
              photos={photos}
              photoShape={photoShape}
              stickers={stickers}
              frameStickers={frameStickers}
              frameBackground={frameBackground}
              frameColor={frameColor}
              frameTextColor={frameTextColor}
              userName={userName}
              getClipPath={getClipPath}
              onAddStickerToFrame={addStickerToFrame}
              onAddStickerToPhoto={addStickerToPhoto}
              onRemoveSticker={removeSticker}
              onRemoveFrameSticker={removeFrameSticker}
              getFirstName={getFirstName}
            />

            {pageState === 'customize' && (
              <PhotoboothControls
                frameColors={FRAME_COLORS}
                frameBackgrounds={FRAME_BACKGROUNDS}
                photoShapes={PHOTO_SHAPES}
                stickers={FRUIT_STICKERS}
                frameColor={frameColor}
                frameTextColor={frameTextColor}
                frameBackground={frameBackground}
                photoShape={photoShape}
                selectedSticker={selectedSticker}
                setFrameColor={setFrameColor}
                setFrameTextColor={setFrameTextColor}
                setFrameBackground={setFrameBackground}
                setPhotoShape={setPhotoShape}
                setSelectedSticker={setSelectedSticker}
              />
            )}
          </div>
        </div>
      </div>

      {pageState === 'customize' && (
        <PhotoboothActions
          onRetake={retakePhotos}
          onDownload={downloadPhoto}
          isDownloading={isDownloading}
        />
      )}

      {/* Decorative fruit icons - spread across screen */}
      {/* Top area - 4 icons */}
      <div className='hidden lg:block absolute left-[25%] top-2 z-0 opacity-35'>
        <img
          src={FRUIT_STICKERS[currentFruitIndex]}
          alt='fruit'
          className='w-24 h-24 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.1s' }}
        />
      </div>
      <div className='hidden lg:block absolute left-[40%] top-4 z-0 opacity-30'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 1) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-20 h-20 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.4s' }}
        />
      </div>
      <div className='hidden lg:block absolute right-[25%] top-2 z-0 opacity-35'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 2) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-24 h-24 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.2s' }}
        />
      </div>
      <div className='hidden lg:block absolute right-[40%] top-4 z-0 opacity-30'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 3) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-20 h-20 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.5s' }}
        />
      </div>

      {/* Left side - 7 icons */}
      <div className='hidden lg:block absolute left-2 top-[12%] z-0 opacity-40'>
        <img
          src={FRUIT_STICKERS[currentFruitIndex]}
          alt='fruit'
          className='w-32 h-32 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0s' }}
        />
      </div>
      <div className='hidden lg:block absolute left-16 top-[28%] z-0 opacity-45'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 1) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-28 h-28 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.2s' }}
        />
      </div>
      <div className='hidden lg:block absolute left-4 top-[45%] z-0 opacity-40'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 2) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-36 h-36 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.4s' }}
        />
      </div>
      <div className='hidden lg:block absolute left-20 top-[58%] z-0 opacity-45'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 3) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-24 h-24 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.6s' }}
        />
      </div>
      <div className='hidden lg:block absolute left-6 top-[72%] z-0 opacity-40'>
        <img
          src={FRUIT_STICKERS[currentFruitIndex]}
          alt='fruit'
          className='w-32 h-32 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.8s' }}
        />
      </div>
      <div className='hidden lg:block absolute left-14 top-[85%] z-0 opacity-45'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 1) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-28 h-28 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '1s' }}
        />
      </div>
      <div className='hidden lg:block absolute left-24 top-[38%] z-0 opacity-35'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 2) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-20 h-20 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.3s' }}
        />
      </div>

      {/* Right side - 7 icons */}
      <div className='hidden lg:block absolute right-2 top-[15%] z-0 opacity-40'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 3) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-32 h-32 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.1s' }}
        />
      </div>
      <div className='hidden lg:block absolute right-16 top-[30%] z-0 opacity-45'>
        <img
          src={FRUIT_STICKERS[currentFruitIndex]}
          alt='fruit'
          className='w-28 h-28 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.3s' }}
        />
      </div>
      <div className='hidden lg:block absolute right-4 top-[48%] z-0 opacity-40'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 1) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-36 h-36 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.5s' }}
        />
      </div>
      <div className='hidden lg:block absolute right-20 top-[62%] z-0 opacity-45'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 2) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-24 h-24 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.7s' }}
        />
      </div>
      <div className='hidden lg:block absolute right-6 top-[75%] z-0 opacity-40'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 3) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-32 h-32 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.9s' }}
        />
      </div>
      <div className='hidden lg:block absolute right-14 top-[88%] z-0 opacity-45'>
        <img
          src={FRUIT_STICKERS[currentFruitIndex]}
          alt='fruit'
          className='w-28 h-28 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '1.1s' }}
        />
      </div>
      <div className='hidden lg:block absolute right-24 top-[40%] z-0 opacity-35'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 1) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-20 h-20 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.4s' }}
        />
      </div>

      {/* Bottom area - 6 icons */}
      <div className='hidden lg:block absolute left-[20%] bottom-4 z-0 opacity-40'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 2) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-28 h-28 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.2s' }}
        />
      </div>
      <div className='hidden lg:block absolute left-[35%] bottom-8 z-0 opacity-35'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 3) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-24 h-24 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.5s' }}
        />
      </div>
      <div className='hidden lg:block absolute right-[20%] bottom-4 z-0 opacity-40'>
        <img
          src={FRUIT_STICKERS[currentFruitIndex]}
          alt='fruit'
          className='w-28 h-28 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.3s' }}
        />
      </div>
      <div className='hidden lg:block absolute right-[35%] bottom-8 z-0 opacity-35'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 1) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-24 h-24 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.6s' }}
        />
      </div>
      <div className='hidden lg:block absolute left-[50%] bottom-2 z-0 opacity-30'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 2) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-20 h-20 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.8s' }}
        />
      </div>
      <div className='hidden lg:block absolute left-[10%] bottom-16 z-0 opacity-35'>
        <img
          src={FRUIT_STICKERS[(currentFruitIndex + 3) % FRUIT_STICKERS.length]}
          alt='fruit'
          className='w-20 h-20 animate-bounce drop-shadow-lg'
          style={{ animationDelay: '0.7s' }}
        />
      </div>

      <TransitionOverlay
        active={isTransitioning}
        bgColor={bgColor}
        text={transitionText}
        fruits={FRUIT_STICKERS}
        currentFruitIndex={currentFruitIndex}
      />

      <canvas ref={canvasRef} className='hidden' />
      <canvas ref={frameCanvasRef} className='hidden' />
    </div>
  );
}
