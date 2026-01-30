'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Matter from 'matter-js';
import TransitionOverlay from '@/components/organisms/TransitionOverlay';
import PomodoroHeader from '@/components/organisms/PomodoroHeader';
import PomodoroTimerRing from '@/components/molecules/PomodoroTimerRing';
import PomodoroControls from '@/components/molecules/PomodoroControls';
import PomodoroModeSwitch from '@/components/molecules/PomodoroModeSwitch';
import SessionDots from '@/components/atoms/SessionDots';
import RewardsBadge from '@/components/atoms/RewardsBadge';
import { ROUTES } from '@/lib/routes';
import {
  requestNotificationPermission,
  onForegroundMessage,
} from '@/lib/firebase';

type TimerMode = 'focus' | 'break';

interface FruitBody {
  id: number;
  body: Matter.Body;
  image: string;
}

const FRUIT_IMAGES = ['/anggur.png', '/apel.png', '/ceri.png', '/kelapa.png'];

const Pomodorotimer = () => {
  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  const TOTAL_SESSIONS = 4;
  const FRUIT_DROP_INTERVAL = 2000;
  const FRUIT_SIZE = 65;

  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [currentSession, setCurrentSession] = useState(1);
  const [fruitBodies, setFruitBodies] = useState<FruitBody[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgColor, setBgColor] = useState('#6366f1');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState('');
  const [currentFruitIndex, setCurrentFruitIndex] = useState(0);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Initialize Firebase Cloud Messaging
  useEffect(() => {
    const initFCM = async () => {
      try {
        const token = await requestNotificationPermission();
        if (token) {
          setFcmToken(token);
          console.log('FCM initialized with token');
        }
      } catch (error) {
        console.error('Failed to initialize FCM:', error);
      }
    };

    initFCM();

    // Listen for foreground messages
    onForegroundMessage((payload) => {
      console.log('Received foreground message:', payload);
    });
  }, []);

  // Picture-in-Picture refs
  const pipWindowRef = useRef<Window | null>(null);
  const pipIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Open Picture-in-Picture window when user switches tab
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && isRunning) {
        // User switched away - open PiP
        if ('documentPictureInPicture' in window) {
          try {
            const docPip = (
              window as unknown as {
                documentPictureInPicture: {
                  requestWindow: (options: {
                    width: number;
                    height: number;
                  }) => Promise<Window>;
                };
              }
            ).documentPictureInPicture;
            const pipWindow = await docPip.requestWindow({
              width: 320,
              height: 180,
            });
            pipWindowRef.current = pipWindow;

            // Copy styles - MINIMAL CLEAN DESIGN
            const style = pipWindow.document.createElement('style');
            style.textContent = `
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #1a1a2e;
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                padding: 16px;
                position: relative;
                overflow: hidden;
              }
              .mode { 
                font-size: 10px; 
                font-weight: 500;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 6px;
                position: relative;
                z-index: 2;
              }
              .time { 
                font-size: 56px; 
                font-weight: 200;
                letter-spacing: -2px;
                font-variant-numeric: tabular-nums;
                position: relative;
                z-index: 2;
              }
              .status { 
                font-size: 9px; 
                font-weight: 500;
                letter-spacing: 4px;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.4); 
                margin-top: 10px;
                position: relative;
                z-index: 2;
              }
              .fruit {
                position: absolute;
                width: 40px;
                height: 40px;
                opacity: 0.3;
                z-index: 1;
              }
              .fruit-1 { bottom: 8px; left: 8px; }
              .fruit-2 { top: 8px; right: 8px; }
            `;
            pipWindow.document.head.appendChild(style);

            // Get current origin for image paths
            const origin = window.location.origin;

            // Create content
            const container = pipWindow.document.createElement('div');
            container.id = 'pip-content';
            container.innerHTML = `
              <img class="fruit fruit-1" src="${origin}/apel.png" alt="">
              <img class="fruit fruit-2" src="${origin}/ceri.png" alt="">
              <div class="mode">${mode === 'focus' ? 'Focus' : 'Break'}</div>
              <div class="time" id="pip-time">--:--</div>
              <div class="status">Pomostudio</div>
            `;
            pipWindow.document.body.appendChild(container);

            // Update timer in PiP window
            const updatePipTime = () => {
              const timeEl = pipWindow.document.getElementById('pip-time');
              if (timeEl) {
                const mins = Math.floor(timeLeft / 60);
                const secs = timeLeft % 60;
                timeEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
              }
            };
            updatePipTime();

            // Close PiP when user returns
            pipWindow.addEventListener('pagehide', () => {
              if (pipIntervalRef.current) {
                clearInterval(pipIntervalRef.current);
              }
              pipWindowRef.current = null;
            });
          } catch (error) {
            console.log('PiP not available:', error);
          }
        }
      } else if (document.visibilityState === 'visible') {
        // User returned - close PiP
        if (pipWindowRef.current) {
          pipWindowRef.current.close();
          pipWindowRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
      }
    };
  }, [mode, isRunning]);

  // Update PiP window time when timeLeft changes
  useEffect(() => {
    if (pipWindowRef.current) {
      const timeEl = pipWindowRef.current.document.getElementById('pip-time');
      if (timeEl) {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timeEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    }
  }, [timeLeft]);

  // Update document title with timer countdown
  useEffect(() => {
    const emoji = mode === 'focus' ? '🍅' : '☕';
    const modeText = mode === 'focus' ? 'Fokus' : 'Istirahat';
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (isRunning) {
      document.title = `${emoji} ${timeStr} - ${modeText} | PomoStudio`;
    } else {
      document.title = 'PomoStudio - Timer Pomodoro';
    }

    return () => {
      document.title = 'PomoStudio - Timer Pomodoro';
    };
  }, [timeLeft, mode, isRunning]);

  // Send notification via Service Worker (works even when tab is closed)
  const sendNotification = useCallback((title: string, body: string) => {
    // Use Service Worker for notifications (persistent)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'pomodoro-timer',
          requireInteraction: true,
          data: { url: '/pomodorotimer' },
        });
      });
    } else if (
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      // Fallback to regular notification
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'pomodoro-timer',
        requireInteraction: true,
      });

      setTimeout(() => notification.close(), 10000);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, []);

  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fruitDropIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circleRadius = 120;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedColor = localStorage.getItem('userBgColor');
    if (savedName) {
      // Parse admin name: "admin ganteng" becomes "admin"
      const isAdminUser = savedName.toLowerCase() === 'admin tampan';
      setIsAdmin(isAdminUser);
      const displayName = isAdminUser ? 'admin' : savedName;
      setUserName(displayName);
    }
    if (savedColor) {
      setBgColor(savedColor);
    }

    // Restore timer state from localStorage
    const savedTimerState = localStorage.getItem('timerState');
    if (savedTimerState) {
      try {
        const state = JSON.parse(savedTimerState);
        const savedAt = state.savedAt || 0;
        const wasRunning = state.isRunning || false;

        // Calculate elapsed time if timer was running
        if (wasRunning && savedAt) {
          const elapsedSeconds = Math.floor((Date.now() - savedAt) / 1000);
          const newTimeLeft = Math.max(0, state.timeLeft - elapsedSeconds);
          setTimeLeft(newTimeLeft);
        } else {
          setTimeLeft(state.timeLeft || FOCUS_TIME);
        }

        setMode(state.mode || 'focus');
        setIsRunning(wasRunning);
        setSessionsCompleted(state.sessionsCompleted || 0);
        setCurrentSession(state.currentSession || 1);
      } catch {
        // Invalid state, use defaults
      }
    }

    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  useEffect(() => {
    setIsTransitioning(true);

    const onLoadText = localStorage.getItem('transitionOnLoadText');
    if (onLoadText) {
      setTransitionText(onLoadText);
      localStorage.removeItem('transitionOnLoadText');
    } else {
      setTransitionText('Siap Fokus?');
    }

    const timer = setTimeout(() => setIsTransitioning(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFruitIndex((prev) => (prev + 1) % FRUIT_IMAGES.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const clearTimerState = () => {
    localStorage.removeItem('timerState');
  };

  const clearSession = () => {
    localStorage.removeItem('userName');
    document.cookie = 'pomodoro_name=; path=/; max-age=0';
    clearTimerState(); // Also clear timer when going home
  };

  const triggerTransition = (text: string, href: string) => {
    if (href === ROUTES.home) {
      localStorage.setItem('transitionOnLoadText', 'Sampai Jumpa! 👋');
      clearSession(); // Clear session saat kembali ke home
    } else if (href === ROUTES.photobooth) {
      localStorage.setItem(
        'transitionOnLoadText',
        'Siapkan Pose Terbaikmu! 📸',
      );
    }

    setTransitionText(text);
    setIsTransitioning(true);
    setTimeout(() => {
      router.push(href);
    }, 3500);
  };

  useEffect(() => {
    if (!containerRef.current || !canvasContainerRef.current) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } =
      Matter;
    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    if (width <= 0 || height <= 0) return;

    const engine = Engine.create();
    engine.world.gravity.y = 0.6;
    engineRef.current = engine;

    const render = Render.create({
      element: canvasContainerRef.current,
      engine,
      options: { width, height, background: 'transparent', wireframes: false },
    });
    renderRef.current = render;

    const boundaryOptions = {
      isStatic: true,
      render: { fillStyle: 'transparent' },
    };
    // Floor positioned so fruits rest with small gap from bottom
    const floor = Bodies.rectangle(
      width / 2,
      height - 10, // Fruits rest with small gap from bottom edge
      width * 3,
      FRUIT_SIZE,
      boundaryOptions,
    );
    // Left wall - thick enough to catch all fruits
    const leftWall = Bodies.rectangle(
      -FRUIT_SIZE,
      height / 2,
      FRUIT_SIZE * 2,
      height * 2,
      boundaryOptions,
    );
    // Right wall - positioned at right edge of visible screen
    const rightWall = Bodies.rectangle(
      width + FRUIT_SIZE / 2, // At right edge, accounting for fruit center
      height / 2,
      FRUIT_SIZE * 2,
      height * 3,
      boundaryOptions,
    );
    // No ceiling - fruits can be thrown up and will fall back down with gravity

    // Check if small mobile (phone only) - iPad and tablets should be desktop-like
    const isPhone = /iPhone|Android.*Mobile/i.test(navigator.userAgent);

    // Desktop and tablets can drag fruits, only phones disable mouse constraint
    if (!isPhone && containerRef.current) {
      const mouse = Mouse.create(containerRef.current);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      });
      render.mouse = mouse;
      World.add(engine.world, [floor, leftWall, rightWall, mouseConstraint]);
    } else {
      World.add(engine.world, [floor, leftWall, rightWall]);
    }

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);
    Render.run(render);

    const updateLoop = () => {
      setFruitBodies((prev) => [...prev]);
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };
    updateLoop();

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (fruitDropIntervalRef.current)
        clearInterval(fruitDropIntervalRef.current);
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas && canvasContainerRef.current) {
        canvasContainerRef.current.removeChild(render.canvas);
      }
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addFruit = useCallback(() => {
    if (!engineRef.current || !containerRef.current) return;

    const { Bodies, World, Body } = Matter;
    const containerRect = containerRef.current.getBoundingClientRect();
    const centerX = containerRect.width / 2;

    const randomImage =
      FRUIT_IMAGES[Math.floor(Math.random() * FRUIT_IMAGES.length)];
    const side = Math.random() > 0.5 ? 'left' : 'right';
    let x =
      side === 'left'
        ? Math.random() * (centerX - 200) + 50
        : centerX + 200 + Math.random() * (centerX - 250);
    x = Math.max(50, Math.min(x, containerRect.width - 50));

    const body = Bodies.circle(x, -50, FRUIT_SIZE / 2, {
      restitution: 0.5,
      frictionAir: 0.02,
      friction: 0.3,
      render: { fillStyle: 'transparent' },
    });

    Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: 2 });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);

    World.add(engineRef.current.world, body);
    setFruitBodies((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), body, image: randomImage },
    ]);
  }, []);

  useEffect(() => {
    if (isRunning) {
      addFruit();
      fruitDropIntervalRef.current = setInterval(addFruit, FRUIT_DROP_INTERVAL);
    } else {
      if (fruitDropIntervalRef.current) {
        clearInterval(fruitDropIntervalRef.current);
        fruitDropIntervalRef.current = null;
      }
    }
    return () => {
      if (fruitDropIntervalRef.current)
        clearInterval(fruitDropIntervalRef.current);
    };
  }, [isRunning, addFruit]);

  const playAlarm = useCallback(() => {
    if (audioRef.current)
      audioRef.current
        .play()
        .catch((e) => console.log('Audio play failed:', e));
  }, []);

  const handleTimerComplete = useCallback(() => {
    playAlarm();

    // Send notification based on completed mode
    if (mode === 'focus') {
      sendNotification(
        '🍅 Waktu Fokus Selesai!',
        'Kerja bagus! Saatnya istirahat sebentar. Kamu layak break! ☕',
      );
      setSessionsCompleted((prev) => prev + 1);
      setMode('break');
      setTimeLeft(BREAK_TIME);
    } else {
      sendNotification(
        '☕ Waktu Istirahat Selesai!',
        'Break time over! Ayo lanjut fokus lagi! 💪',
      );
      setMode('focus');
      setTimeLeft(FOCUS_TIME);
      if (currentSession < TOTAL_SESSIONS)
        setCurrentSession((prev) => prev + 1);
      else setCurrentSession(1);
    }
    setIsRunning(false);
  }, [
    mode,
    playAlarm,
    sendNotification,
    currentSession,
    BREAK_TIME,
    FOCUS_TIME,
  ]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    const timerState = {
      timeLeft,
      mode,
      isRunning,
      sessionsCompleted,
      currentSession,
      savedAt: Date.now(),
    };
    localStorage.setItem('timerState', JSON.stringify(timerState));
  }, [timeLeft, mode, isRunning, sessionsCompleted, currentSession]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, handleTimerComplete]);

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const toggleTimer = () => {
    stopAlarm();
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    stopAlarm();
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    setSessionsCompleted(0);
    setCurrentSession(1);
    clearTimerState(); // Clear saved state on manual reset
    if (engineRef.current) {
      fruitBodies.forEach((fruit) =>
        Matter.World.remove(engineRef.current!.world, fruit.body),
      );
      setFruitBodies([]);
    }
  };

  const switchMode = (newMode: TimerMode) => {
    stopAlarm();
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden font-sans transition-all duration-1000 ease-out px-4 sm:px-6
        ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
    >
      <div
        className='absolute inset-0 transition-colors duration-500'
        style={{ backgroundColor: bgColor }}
      />

      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-0 right-0 w-[200%] h-[200%] -translate-y-1/2 translate-x-1/4 rotate-[-20deg]'>
          <div className='absolute top-[20%] left-0 w-full h-8 bg-white/10' />
          <div className='absolute top-[35%] left-0 w-full h-6 bg-white/10' />
          <div className='absolute top-[80%] left-0 w-full h-10 bg-white/10' />
        </div>
      </div>

      <audio ref={audioRef} preload='auto' loop>
        <source src='/alarm.mp3' type='audio/mpeg' />
      </audio>

      <div
        ref={canvasContainerRef}
        className='absolute inset-0 z-0 pointer-events-none'
      />

      {fruitBodies.map((fruit) => (
        <img
          key={fruit.id}
          src={fruit.image}
          alt='fruit'
          className='absolute pointer-events-none select-none drop-shadow-lg'
          style={{
            width: `${FRUIT_SIZE}px`,
            height: `${FRUIT_SIZE}px`,
            left: `${fruit.body.position.x}px`,
            top: `${fruit.body.position.y}px`,
            transform: `translate(-50%, -50%) rotate(${fruit.body.angle}rad)`,
          }}
        />
      ))}

      <PomodoroHeader
        userName={userName}
        fruitCount={fruitBodies.length}
        minFruits={isAdmin ? 4 : 25}
        onGoPhotobooth={() =>
          triggerTransition('Masuk ke Photobooth...', ROUTES.photobooth)
        }
        onGoHome={() => triggerTransition('Kembali...', ROUTES.home)}
      />

      <div className='relative z-20 flex flex-col items-center'>
        <div className='px-5 py-2 rounded-full text-sm font-bold mb-6 border-1 border-white text-white shadow-lg'>
          {mode === 'focus' ? 'Focus Mode ON' : 'Break Mode'}
        </div>

        <PomodoroTimerRing
          mode={mode}
          timeText={formatTime(timeLeft)}
          circleRadius={circleRadius}
          circumference={circumference}
          strokeDashoffset={strokeDashoffset}
          className='scale-[0.85] sm:scale-100'
        />

        <PomodoroControls
          isRunning={isRunning}
          onToggle={toggleTimer}
          onReset={resetTimer}
        />

        <PomodoroModeSwitch mode={mode} onSwitch={switchMode} />

        <SessionDots
          total={TOTAL_SESSIONS}
          completed={sessionsCompleted}
          current={currentSession}
        />

        <RewardsBadge count={fruitBodies.length} />
      </div>

      <TransitionOverlay
        active={isTransitioning}
        bgColor={bgColor}
        text={transitionText}
        fruits={FRUIT_IMAGES}
        currentFruitIndex={currentFruitIndex}
      />
    </div>
  );
};

export default Pomodorotimer;
