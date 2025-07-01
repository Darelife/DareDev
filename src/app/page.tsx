'use client';
import { useState, useEffect } from 'react';
import { Ubuntu_Mono } from 'next/font/google';
import Navbar from '@/components/navbar';

const ubuntuMono = Ubuntu_Mono({
  subsets: ['latin'],
  weight: '400',
});

export default function Home() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [pacmanFrame, setPacmanFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isRocketMode, setIsRocketMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const texts = [
    "Prakhar <Darelife/>",
    "Prakhar Bhandari",
  ];
  const rocketFrames = [
    `
          /\\
         /  \\
        /    \\
       /      \\
      |   /\\   |
      |  /  \\  |
      | /    \\ |
      |/      \\|
      |        |
      |   <>   |
      |        |
      |________|
      |████████|
      |████████|
      |████████|
      |████████|
       \\______/
         ||
        /  \\
       /____\\
       ~~~~~~
      ~~~~~~~~
      ~~~~~~~~
  `,
    `
          /\\
         /  \\
        /    \\
       /      \\
      |   /\\   |
      |  /  \\  |
      | /    \\ |
      |/      \\|
      |        |
      |   <>   |
      |        |
      |________|
      |████████|
      |████████|
      |████████|
      |████████|
       \\______/
        /||\\
       / || \\
      /______\\
        ~~~~~~
       ~~~~~~~~~~
      ~~~~~~~~~~~~
      ~~~~~~~~~~~~
  `,
    `
          /\\
         /  \\
        /    \\
       /      \\
      |   /\\   |
      |  /  \\  |
      | /    \\ |
      |/      \\|
      |        |
      |   <>   |
      |        |
      |________|
      |████████|
      |████████|
      |████████|
      |████████|
       \\______/
       \\    /
        \\||/
         \\/
         ^^
         ^^
        /////
        /////
        /////
  `,
    `
          /\\
         /  \\
        /    \\
       /      \\
      |   /\\   |
      |  /  \\  |
      | /    \\ |
      |/      \\|
      |        |
      |   <>   |
      |        |
      |________|
      |████████|
      |████████|
      |████████|
      |████████|
       \\______/
        /||\\
       / || \\
      /______\\
       //////
      ////////
      ////////
  `,
  ];

  const pacmanDefaultFrames = [
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

  const currentFrames = (isRocketMode && !isMobile) ? rocketFrames : pacmanDefaultFrames;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && isRocketMode) {
      setIsRocketMode(false);
      setPacmanFrame(0);
    }
  }, [isMobile, isRocketMode]);

  const handleFrameClick = () => {
    if (isMobile) {
      // On mobile, just restart animations without toggling rocket mode
      setPacmanFrame(0);
      setCurrentTextIndex(prev => (prev + 1) % texts.length);
      return;
    }
    
    setIsRocketMode(prev => !prev);
    setPacmanFrame(0);
    setCurrentTextIndex(prev => (prev + 1) % texts.length);
  };

  useEffect(() => {
    if (!isAnimating) return;

    const pacmanInterval = setInterval(() => {
      setPacmanFrame(prev => (prev + 1) % currentFrames.length);
    }, 150);

    return () => clearInterval(pacmanInterval);
  }, [isAnimating, currentFrames.length]);

  useEffect(() => {
    setIsAnimating(true);
    const targetText = texts[currentTextIndex];
    const randomChars = '█▓<>!@#$%^&*()_+-=[]{}|;:,./?01';
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
      }, 9000);

    }, 2500);

    return () => {
      clearInterval(scrambleInterval);
      clearTimeout(animationTimeout);
      clearTimeout(revealTimeout);
    };
  }, [currentTextIndex, texts.length]);

  return (
  <div className="min-h-screen bg-black ">
    <Navbar />
    <div className={`mt-20 flex flex-col md:flex-row items-center justify-center p-4 md:p-8 gap-8 md:gap-16 ${ubuntuMono.className}`}>
    <div 
      className={`text-red-500 leading-tight whitespace-pre-wrap text-center text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(255,0,0,0.7)] transition-transform select-none ${
      !isMobile ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={handleFrameClick}
    >
      {currentFrames[pacmanFrame]}
    </div>
    <div className="flex flex-col items-center">
      <h1 className="text-[#e3e3e3] text-2xl md:text-4xl transition-all duration-200 text-center drop-shadow-[0_0_8px_rgba(255,0,0,0.7)] selection:bg-red-500 selection:text-black">
      {displayText}
      </h1>
      <div className="flex gap-6 mt-4 justify-center">
      {/* GitHub */}
      <a
        href="https://github.com/darelife"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className="hover:scale-110 transition-transform"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
        </svg>
      </a>
      {/* LinkedIn */}
      <a
        href="https://www.linkedin.com/in/prakhar-bhandari13/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className="hover:scale-110 transition-transform"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.845-1.563 3.045 0 3.607 2.005 3.607 4.614v5.582z"/>
        </svg>
      </a>
      {/* Mail */}
      <a
        href="mailto:prakharb2k6@gmail.com"
        aria-label="Email"
        className="hover:scale-110 transition-transform"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zm0 12H4V8.99l8 6.99 8-6.99V18z"/>
        </svg>
      </a>
      </div>
    </div>
    </div> 
  </div>
  );
}
