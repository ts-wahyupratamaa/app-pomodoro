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
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgColor, setBgColor] = useState('#6366f1');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState('');
  const [currentFruitIndex, setCurrentFruitIndex] = useState(0);

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
      setUserName(savedName);
    }
    if (savedColor) {
      setBgColor(savedColor);
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

  const triggerTransition = (text: string, href: string) => {
    if (href === ROUTES.home) {
      localStorage.setItem('transitionOnLoadText', 'Sampai Jumpa! 👋');
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
    const floor = Bodies.rectangle(
      width / 2,
      height - FRUIT_SIZE / 2,
      width,
      20,
      boundaryOptions,
    );
    const leftWall = Bodies.rectangle(
      -25,
      height / 2,
      50,
      height,
      boundaryOptions,
    );
    const rightWall = Bodies.rectangle(
      width + 25,
      height / 2,
      50,
      height,
      boundaryOptions,
    );

    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    render.mouse = mouse;

    World.add(engine.world, [floor, leftWall, rightWall, mouseConstraint]);

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
    if (mode === 'focus') {
      setSessionsCompleted((prev) => prev + 1);
      setMode('break');
      setTimeLeft(BREAK_TIME);
    } else {
      setMode('focus');
      setTimeLeft(FOCUS_TIME);
      if (currentSession < TOTAL_SESSIONS)
        setCurrentSession((prev) => prev + 1);
      else setCurrentSession(1);
    }
    setIsRunning(false);
  }, [mode, playAlarm, currentSession, BREAK_TIME, FOCUS_TIME]);

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

  const toggleTimer = () => setIsRunning((prev) => !prev);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    if (engineRef.current) {
      fruitBodies.forEach((fruit) =>
        Matter.World.remove(engineRef.current!.world, fruit.body),
      );
      setFruitBodies([]);
    }
  };

  const switchMode = (newMode: TimerMode) => {
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

      <audio ref={audioRef} preload='auto'>
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
        onGoPhotobooth={() =>
          triggerTransition('Masuk ke Photobooth...', ROUTES.photobooth)
        }
        onGoHome={() => triggerTransition('Kembali ke Nama...', ROUTES.home)}
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
