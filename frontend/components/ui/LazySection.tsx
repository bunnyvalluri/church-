"use client";

/**
 * LazySection — content-visibility wrapper with skeleton fallback
 *
 * Wraps a section in content-visibility:auto so the browser skips
 * layout+paint until the section enters the viewport.
 *
 * Also uses IntersectionObserver to delay mounting children until
 * they are near the viewport — saving memory and JS hydration cost
 * for below-fold content.
 *
 * @example
 * <LazySection estimatedHeight="600px" skeletonClassName="my-4">
 *   <HeavyComponent />
 * </LazySection>
 */

import { useRef, useState, useEffect, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** CSS value for skeleton height and contain-intrinsic-size (default: 600px) */
  estimatedHeight?: string;
  /** Extra class names on the outer wrapper */
  className?: string;
  /** Class names on the skeleton placeholder */
  skeletonClassName?: string;
  /** IntersectionObserver root margin — how early to start loading (default: 200px) */
  rootMargin?: string;
}

export default function LazySection({
  children,
  estimatedHeight = "600px",
  className = "",
  skeletonClassName = "",
  rootMargin = "200px",
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.unobserve(el);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={`cv-auto ${className}`}
      style={{ containIntrinsicSize: `0 ${estimatedHeight}` } as React.CSSProperties}
    >
      {shouldRender ? (
        children
      ) : (
        // Skeleton placeholder — reserves space, prevents CLS
        <div
          className={`w-full animate-pulse bg-slate-100 dark:bg-white/[0.02] rounded-lg ${skeletonClassName}`}
          style={{ minHeight: estimatedHeight }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
