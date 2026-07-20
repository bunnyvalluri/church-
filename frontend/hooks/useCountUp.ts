/**
 * hooks/useCountUp.ts
 * Animated counter hook — smoothly counts up to a target number on viewport entry.
 * Handles suffixes like "1000+" or "25+".
 */
"use client";

import { useState, useEffect, useRef } from "react";

interface UseCountUpOptions {
  duration?: number;  // Animation duration in ms (default: 2000)
  delay?: number;     // Delay before start in ms (default: 0)
  easing?: "linear" | "easeOut" | "easeInOut";
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function parseValue(rawValue: string): { number: number; suffix: string; prefix: string } {
  // Extract prefix (e.g. "$")
  const prefixMatch = rawValue.match(/^([^0-9]*)/);
  const prefix = prefixMatch ? prefixMatch[1] : "";
  
  // Extract number
  const numMatch = rawValue.replace(prefix, "").match(/^([0-9,]+)/);
  const numberStr = numMatch ? numMatch[1].replace(/,/g, "") : "0";
  const number = parseInt(numberStr, 10) || 0;
  
  // Everything after the number is suffix
  const suffix = rawValue.slice(prefix.length + numMatch![1].length);

  return { number, suffix, prefix };
}

/**
 * Animates a number value using requestAnimationFrame.
 * @param rawValue - The target value string (e.g. "1000+", "$50K", "25+")
 * @param isInView - Whether the element is in the viewport (triggers animation)
 * @param options - Animation options
 * @returns The current display string
 */
export function useCountUp(
  rawValue: string,
  isInView: boolean,
  options: UseCountUpOptions = {}
): string {
  const { duration = 2000, delay = 0, easing = "easeOut" } = options;
  const { number: targetNumber, suffix, prefix } = parseValue(rawValue);

  const [displayValue, setDisplayValue] = useState<string>(prefix + "0" + suffix);
  const animationRef = useRef<number>(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current || targetNumber === 0) return;
    hasAnimated.current = true;

    const startTime = performance.now() + delay;

    const animate = (currentTime: number) => {
      const elapsed = Math.max(0, currentTime - startTime);
      const progress = Math.min(elapsed / duration, 1);

      let easedProgress: number;
      switch (easing) {
        case "easeInOut":
          easedProgress = easeInOutCubic(progress);
          break;
        case "linear":
          easedProgress = progress;
          break;
        default:
          easedProgress = easeOutCubic(progress);
      }

      const currentValue = Math.floor(easedProgress * targetNumber);
      setDisplayValue(`${prefix}${currentValue.toLocaleString()}${suffix}`);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(`${prefix}${targetNumber.toLocaleString()}${suffix}`);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInView, targetNumber, duration, delay, easing, suffix, prefix]);

  // Return raw value if no animation needed
  if (targetNumber === 0) return rawValue;

  return displayValue;
}

/**
 * Intersection Observer hook to detect when element enters viewport.
 */
export function useInView(options: IntersectionObserverInit = {}): {
  ref: React.RefObject<HTMLDivElement | null>;
  inView: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          // Unobserve after first trigger for performance
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: "-50px", ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}
