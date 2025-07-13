import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";
import "./ScrollVelocity.css";

/**
 * ScrollVelocity Component
 * 
 * This component creates an animated text banner that moves with scroll velocity and
 * decelerates naturally when scrolling stops.
 * 
 * Key animation parameters to adjust:
 * 
 * - decelerationFactor: Controls how quickly the animation slows down when scrolling stops
 *   - Range: 0.85 to 0.98
 *   - Lower values = faster stop (more abrupt)
 *   - Higher values = slower stop (more gradual)
 *   - Default: 0.92
 * 
 * - stopThreshold: When the animation speed falls below this value, it stops completely
 *   - Range: 0.01 to 0.1
 *   - Lower values = longer fade out
 *   - Higher values = shorter fade out
 *   - Default: 0.05
 * 
 * - scrollDebounceTime: How long (ms) to wait after scroll stops before starting deceleration
 *   - Range: 50 to 200
 *   - Lower values = more responsive to scroll stops
 *   - Higher values = maintains momentum longer
 *   - Default: 100
 */

interface VelocityMapping {
  input: [number, number];
  output: [number, number];
}

interface VelocityTextProps {
  children: React.ReactNode;
  baseVelocity: number;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
  decelerationFactor?: number;
  stopThreshold?: number;
  scrollDebounceTime?: number;
}

interface ScrollVelocityProps {
  scrollContainerRef?: React.RefObject<HTMLElement>;
  texts: string[];
  velocity?: number;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
  decelerationFactor?: number;
  stopThreshold?: number;
  scrollDebounceTime?: number;
}

function useElementWidth<T extends HTMLElement>(ref: React.RefObject<T | null>): number {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [ref]);

  return width;
}

function VelocityText({
  children,
  baseVelocity = 100,
  scrollContainerRef,
  className = "",
  damping,
  stiffness,
  numCopies,
  velocityMapping,
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
  decelerationFactor = 0.92, // Controls how quickly the animation slows down (0.9-0.95 is a good range)
  stopThreshold = 0.05,      // When to completely stop the animation
  scrollDebounceTime = 100,  // How long to wait before starting deceleration
}: VelocityTextProps) {
  const baseX = useMotionValue(0);
  const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};
  const { scrollY } = useScroll(scrollOptions);
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: damping ?? 50,
    stiffness: stiffness ?? 400,
  });
  const velocityFactor = useTransform(
    smoothVelocity,
    velocityMapping?.input || [0, 1000],
    velocityMapping?.output || [0, 5],
    { clamp: false }
  );
  
  // State to track if we're actively scrolling
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track the current animation speed to allow for natural deceleration
  const currentSpeedRef = useRef<number>(0);
  
  // Monitor scroll velocity to detect active scrolling
  useEffect(() => {
    const unsubscribe = smoothVelocity.onChange((value) => {
      // If there's meaningful velocity, we're scrolling
      if (Math.abs(value) > 15) {
        setIsScrolling(true);
        
        // Clear existing timeout if there is one
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
        
        // Set a timer to start deceleration after scrolling stops
        scrollTimerRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, scrollDebounceTime);
      }
    });
    
    return () => {
      unsubscribe();
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [smoothVelocity, scrollDebounceTime]);

  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidth = useElementWidth(copyRef);

  function wrap(min: number, max: number, v: number): number {
    const range = max - min;
    const mod = (((v - min) % range) + range) % range;
    return mod + min;
  }

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return "0px";
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    // Calculate the move factor
    let moveBy = 0;
    
    if (isScrolling) {
      // When actively scrolling, use the scroll velocity
      if (velocityFactor.get() < 0) {
        directionFactor.current = -1;
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1;
      }
      
      moveBy = directionFactor.current * baseVelocity * (delta / 1000);
      moveBy *= (1 + Math.abs(velocityFactor.get()));
      
      // Store the current speed for deceleration phase
      currentSpeedRef.current = moveBy;
    } else {
      // Not scrolling - apply deceleration
      if (Math.abs(currentSpeedRef.current) > stopThreshold) {
        // Apply deceleration factor to gradually slow down
        currentSpeedRef.current *= decelerationFactor;
        moveBy = currentSpeedRef.current;
      } else {
        // Below threshold - stop completely to avoid micro-movements
        currentSpeedRef.current = 0;
      }
    }
    
    // Apply the movement
    if (Math.abs(moveBy) > 0) {
      baseX.set(baseX.get() + moveBy);
    }
  });

  const spans = [];
  for (let i = 0; i < (numCopies ?? 6); i++) {
    spans.push(
      <span className={className} key={i} ref={i === 0 ? copyRef : null}>
        {children}
      </span>
    );
  }

  return (
    <div className={parallaxClassName} style={parallaxStyle}>
      <motion.div
        className={scrollerClassName}
        style={{ x, ...scrollerStyle }}
      >
        {spans}
      </motion.div>
    </div>
  );
}

const ScrollVelocity: React.FC<ScrollVelocityProps> = ({
  scrollContainerRef,
  texts = [],
  velocity = 100,
  className = "",
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName = "parallax",
  scrollerClassName = "scroller",
  parallaxStyle,
  scrollerStyle,
  decelerationFactor = 0.92,
  stopThreshold = 0.05,
  scrollDebounceTime = 100,
}) => {
  return (
    <section>
      {texts.map((text: string, index: number) => (
        <VelocityText
          key={index}
          className={className}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
          decelerationFactor={decelerationFactor}
          stopThreshold={stopThreshold}
          scrollDebounceTime={scrollDebounceTime}
        >
          {text}&nbsp;
        </VelocityText>
      ))}
    </section>
  );
};

export default ScrollVelocity;
