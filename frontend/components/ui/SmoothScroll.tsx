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

  // Smooth scroll for all anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
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
