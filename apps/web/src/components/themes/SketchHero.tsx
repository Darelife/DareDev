'use client';
import dynamic from 'next/dynamic';
import { useTheme } from './ThemeProvider';
const SketchCanvas = dynamic(() => import('./SketchCanvas'), { ssr: false });

export default function SketchHero() {
  const { theme } = useTheme();
  return <div className="sketch-only sketch-hero">
    <div className="sketch-hero-copy">
      <p className="sketch-kicker"><span aria-hidden="true">✳</span> THE INTERNET CORNER OF</p>
      <h1>Prakhar<br /><span>Bhandari.</span><i aria-hidden="true">↗</i></h1>
      <p className="sketch-intro">I write code that ships,<br />compete for fun, and keep building.</p>
      <div className="sketch-hero-links"><a href="/#projects">Explore my work <span aria-hidden="true">↗</span></a><a href="mailto:prakharb2k6@gmail.com">Say hello <span aria-hidden="true">↗</span></a></div>
      <div className="sketch-socials"><a href="https://github.com/darelife" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/prakharbhandari13/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><span>@darelife</span></div>
    </div>
    <div className="sketch-art"><span className="sketch-sticker">WORK IN<br />PROGRESS. ALWAYS.</span>{theme === 'sketchbook' && <SketchCanvas />}<span className="sketch-art-note">a head full of ideas ↗</span></div>
    <div className="sketch-hero-bottom"><span>CODE / CURIOSITY / A LITTLE CHAOS</span><a href="/#projects">Keep wandering ↓</a></div>
  </div>;
}
