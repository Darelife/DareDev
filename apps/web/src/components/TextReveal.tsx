"use client";
import React, { useEffect, useRef, useState } from 'react';
import './TextReveal.css';

interface TextRevealProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  splitBy?: 'words' | 'letters' | 'none';
  delay?: number;
}

const TextReveal: React.FC<TextRevealProps> = ({ 
  text, 
  className, 
  style, 
  splitBy = 'none',
  delay = 0 
}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px',
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
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const renderText = () => {
    if (splitBy === 'words') {
      return text.split(' ').map((word, index) => (
        <span 
          key={index} 
          className="text-reveal-text"
          style={{ 
            display: 'inline-block', 
            marginRight: '0.5rem',
            transitionDelay: `${index * 0.1}s`
          }}
        >
          {word}
        </span>
      ));
    } else if (splitBy === 'letters') {
      return text.split('').map((char, index) => (
        <span 
          key={index} 
          className="text-reveal-text"
          style={{ 
            display: 'inline-block',
            transitionDelay: `${index * 0.05}s`
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    } else {
      return (
        <span className="text-reveal-text">
          {text}
        </span>
      );
    }
  };

  return (
    <div 
      ref={ref} 
      className={`text-reveal-container ${isInView ? 'in-view' : ''} ${className || ''}`}
      style={style}
    >
      {renderText()}
    </div>
  );
};

export default TextReveal;
