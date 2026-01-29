'use client';

type TransitionOverlayProps = {
  active: boolean;
  bgColor: string;
  text: string;
  fruits: string[];
  currentFruitIndex: number;
};

export default function TransitionOverlay({
  active,
  bgColor,
  text,
  fruits,
  currentFruitIndex,
}: TransitionOverlayProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-1000 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`absolute inset-0 transition-all duration-1000 ${
            active ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundColor: bgColor }}
        />

        <div
          className={`relative transition-all duration-1000 ease-out ${
            active ? 'scale-100 rotate-0' : 'scale-75 rotate-45'
          }`}
        >
          {fruits.map((fruit, index) => (
            <img
              key={fruit}
              src={fruit}
              alt='fruit'
              className='absolute w-20 h-20 object-contain'
              style={{
                animation: active
                  ? `orbit ${1.5 + index * 0.2}s linear infinite`
                  : 'none',
                transformOrigin: 'center',
                left: '50%',
                top: '50%',
                marginLeft: '-40px',
                marginTop: '-40px',
              }}
            />
          ))}

          <div className='relative'>
            <img
              src={fruits[currentFruitIndex]}
              alt='fruit'
              className={`w-32 h-32 object-contain transition-all duration-300 ${
                active ? 'animate-bounce' : ''
              }`}
              style={{
                filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.6))',
              }}
            />
          </div>
        </div>

        <div
          className={`absolute bottom-1/3 text-white text-2xl font-bold tracking-wider transition-all duration-700 delay-300 ${
            active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className='animate-pulse'>{text}</span>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes orbit {
            0% { transform: rotate(0deg) translateX(100px) rotate(0deg); }
            100% { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
          }
        `,
        }}
      />
    </>
  );
}
