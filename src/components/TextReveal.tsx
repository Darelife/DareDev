"use client";
import React, { useEffect, useRef, useState } from 'react';
import './TextReveal.css';

interface TextRevealProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const TextReveal: React.FC<TextRevealProps> = ({ text, className, style }) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div ref={ref} className={`text-reveal-container ${isInView ? 'in-view' : ''}`}>
      <div className="text-reveal-cover"></div>
      <div className={`text-reveal-text ${className}`} style={style}>
        {text}
      </div>
    </div>
  );
};

export default TextReveal;
