/**
 * useIntersectionObserver — Reusable visibility detection hook
 *
 * Wraps IntersectionObserver with proper cleanup and a stable API.
 * Replaces manual scroll event listeners for "is element visible?" checks.
 *
 * Features:
 * - Single observer instance per component (no multiple observers)
 * - Automatic disconnect on unmount
 * - Optional one-shot mode (stop observing once visible)
 *
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2, once: true });
 * return <div ref={ref} className={isVisible ? 'animate-in' : 'opacity-0'} />
 */

import { useEffect, useRef, useState, RefObject } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  /** If true, stops observing after first intersection (fire once) */
  once?: boolean;
  /** Initial state before observation starts */
  initialIsIntersecting?: boolean;
}

export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, boolean] {
  const {
    threshold = 0,
    rootMargin = "0px",
    once = false,
    initialIsIntersecting = false,
  } = options;

  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);

        if (isVisible && once && observerRef.current) {
          observerRef.current.unobserve(el);
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [threshold, rootMargin, once]);

  return [ref, isIntersecting];
}
