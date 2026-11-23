"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function SmoothScroll() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    let ticking = false;
    const updateProgress = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setProgress(window.scrollY / totalScroll);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll for all anchor links (non-blocking for instant INP / Paint)
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Fast early return in <0.01ms if clicked element is not an anchor link
      const anchor = target.tagName === "A" ? (target as HTMLAnchorElement) : target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      try {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          // Never block synchronous click execution — dispatch scroll to next animation frame
          window.requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
      } catch {
        // Safe guard for invalid CSS selector
      }
    };
    document.addEventListener("click", handleAnchorClick, { passive: false });
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[9999] pointer-events-none transform-gpu transition-transform duration-75"
      style={{
        transform: `scaleX(${progress})`,
        background: "linear-gradient(to right, hsl(var(--primary-gradient-start)), hsl(var(--primary)), hsl(var(--primary-gradient-end)))"
      }}
    />
  );
}
