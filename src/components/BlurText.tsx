"use client";

import { motion, Transition } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
};

const buildKeyframes = (
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> => {
  const keys = new Set<string>([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);

  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
};

const BlurText: React.FC<BlurTextProps> = ({
  text = '',
  delay = 200,
  className = '',
  style = {},
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (t) => t,
  onAnimationComplete,
  stepDuration = 0.35,
}) => {
  // Split text into words or individual characters
  const elements = useMemo(() => 
    animateBy === 'words' ? text.split(' ') : text.split(''),
    [text, animateBy]
  );
  
  // Track if animation has been shown
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Track if component is in viewport
  const [inView, setInView] = useState(false);
  
  // Reference to the paragraph element
  const ref = useRef<HTMLParagraphElement>(null);
  
  // Calculate total animation duration
  const totalAnimTime = useMemo(() => {
    return (elements.length * delay / 1000) + (stepDuration * 2) + 0.3;
  }, [elements.length, delay, stepDuration]);

  // Effect to handle animation triggering once
  useEffect(() => {
    if (!ref.current) return;
    
    // Use multiple threshold points to improve detection reliability
    const thresholds = [0.05, 0.1, 0.2, 0.3, 0.4];
    
    // Create a more generous rootMargin to trigger animation earlier
    const enhancedRootMargin = rootMargin || "0px 0px -100px 0px";
    
    // Track animation completion timeout
    let timeoutId: NodeJS.Timeout | null = null;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger animation if it hasn't been shown yet
        if (entry.isIntersecting && !hasAnimated) {
          setInView(true);
          
          // Mark as animated after the animation completes
          timeoutId = setTimeout(() => {
            setHasAnimated(true);
          }, totalAnimTime * 1000);
        }
      },
      { threshold: thresholds, rootMargin: enhancedRootMargin }
    );
    
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [threshold, rootMargin, totalAnimTime, hasAnimated]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -50 }
        : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5,
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  return (
    <p
      ref={ref}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', ...style }}
    >
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

        const spanTransition: Transition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
        };
        (spanTransition as any).ease = easing;

        return (
          <motion.span
            key={`${segment}-${index}`}
            initial={hasAnimated ? { filter: 'blur(0px)', opacity: 1, y: 0 } : fromSnapshot}
            animate={inView && !hasAnimated ? animateKeyframes : 
                   hasAnimated ? { filter: 'blur(0px)', opacity: 1, y: 0 } : 
                   fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={
              index === elements.length - 1 ? () => {
                // Call the provided animation complete callback
                if (onAnimationComplete) onAnimationComplete();
              } : undefined
            }
            style={{
              display: 'inline-block',
              willChange: hasAnimated ? 'auto' : 'transform, filter, opacity',
            }}
          >
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </p>
  );
};

export default BlurText;
