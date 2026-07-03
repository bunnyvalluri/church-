"use client";

import { useEffect, useRef } from "react";

/**
 * SmoothScroll — CSS-only scroll progress bar
 *
 * Previous implementation used Framer Motion useScroll + useSpring which:
 * - Fires on every scroll event synchronously
 * - Was NOT passive — blocked the compositor thread
 * - Required Framer JS runtime just for a progress bar
 *
 * New implementation:
 * - Uses a passive scroll event listener (doesn't block browser scroll)
 * - Uses requestAnimationFrame for GPU-compositor-friendly updates
 * - Drives a CSS transform:scaleX() — painted on compositor thread only
 * - Zero JS framework overhead for progress tracking
 */
export default function SmoothScroll() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const updateProgress = () => {
      const el = barRef.current;
      if (!el) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      // transform: scaleX is GPU-accelerated — no layout, no paint
      el.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    // { passive: true } = scroll listener NEVER blocks the compositor thread
    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress(); // set initial value

    // Smooth anchor scrolling for hash links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", handleAnchorClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[9999] pointer-events-none"
      style={{
        background:
          "linear-gradient(to right, hsl(var(--primary-gradient-start)), hsl(var(--primary)), hsl(var(--primary-gradient-end)))",
        transform: "scaleX(0)",
        willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
}
