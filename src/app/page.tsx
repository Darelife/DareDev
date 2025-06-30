'use client';
import { useState, useEffect } from 'react';
import { Ubuntu_Mono } from 'next/font/google';

const ubuntuMono = Ubuntu_Mono({
  subsets: ['latin'],
  weight: '400',
});

export default function Home() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [pacmanFrame, setPacmanFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const texts = [
    "Prakhar <Darelife/>",
    "Prakhar Bhandari",
  ];

  const pacmanFrames = [
    `
          @@@@@@@@@@@@@@@@
      @@@@@@@@@@@@@@@@@@@@@@@@
    @@@@@@@@          @@@@@@@@
  @@@@@@@@              @@@@@@@@
@@@@@@@@                  @@@@@@@@
@@@@@@@@                  @@@@@@@@
  @@@@@@@@              @@@@@@@@
    @@@@@@@@          @@@@@@@@
      @@@@@@@@@@@@@@@@@@@@@@@@
          @@@@@@@@@@@@@@@@
`,
    `
          @@@@@@@@@@@@@@@@
      @@@@@@@@@@@@@@@@@@@@@@@@
    @@@@@@@@@@@@    @@@@@@@@@@@@
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @@@@@@@@@@@@    @@@@@@@@@@@@
      @@@@@@@@@@@@@@@@@@@@@@@@
          @@@@@@@@@@@@@@@@
`,
    `
          @@@@@@@@@@@@@@@@
      @@@@@@@@@@@@@@@@@@@@@@@@
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@
      @@@@@@@@@@@@@@@@@@@@@@@@
          @@@@@@@@@@@@@@@@
`,
    `
          @@@@@@@@@@@@@@@@
      @@@@@@@@@@@@@@@@@@@@@@@@
    @@@@@@@@@@@@    @@@@@@@@@@@@
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @@@@@@@@@@@@    @@@@@@@@@@@@
      @@@@@@@@@@@@@@@@@@@@@@@@
          @@@@@@@@@@@@@@@@
`,
  ];

  useEffect(() => {
    if (!isAnimating) return;

    const pacmanInterval = setInterval(() => {
      setPacmanFrame(prev => (prev + 1) % pacmanFrames.length);
    }, 150);

    return () => clearInterval(pacmanInterval);
  }, [isAnimating, pacmanFrames.length]);

  useEffect(() => {
    setIsAnimating(true);
    const targetText = texts[currentTextIndex];
    const randomChars = '█▓▒░█▓▒░<>!@#$%^&*()_+-=[]{}|;:,./?01';
    let animationTimeout: NodeJS.Timeout;
    let revealTimeout: NodeJS.Timeout;

    const scrambleInterval = setInterval(() => {
      setDisplayText(
        targetText
          .split('')
          .map(char => {
            if (char === ' ' || char === '>') return char;
            return randomChars[Math.floor(Math.random() * randomChars.length)];
          })
          .join('')
      );
    }, 50);

    animationTimeout = setTimeout(() => {
      clearInterval(scrambleInterval);
      setDisplayText(targetText);
      setIsAnimating(false);

      revealTimeout = setTimeout(() => {
        setCurrentTextIndex(prev => (prev + 1) % texts.length);
      }, 2500);

    }, 3000);

    return () => {
      clearInterval(scrambleInterval);
      clearTimeout(animationTimeout);
      clearTimeout(revealTimeout);
    };
  }, [currentTextIndex, texts.length]);

  return (
    <div className={`min-h-screen bg-black flex flex-col md:flex-row items-center justify-center p-4 md:p-8 gap-8 md:gap-16 ${ubuntuMono.className}`}>
      <div className="text-red-500 leading-tight whitespace-pre-wrap text-center text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(255,0,0,0.7)]">
        {pacmanFrames[pacmanFrame]}
      </div>
      <h1 className="text-red-500 text-2xl md:text-4xl transition-all duration-200 text-center drop-shadow-[0_0_8px_rgba(255,0,0,0.7)]">
        {displayText}
      </h1>
    </div>
  );
}
