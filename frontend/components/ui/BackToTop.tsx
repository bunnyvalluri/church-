"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BackToTop() {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname?.startsWith("/admin/login") ||
    pathname?.startsWith("/admin/register");

  const isExcludedPage =
    isAuthPage ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/pastor") ||
    pathname?.startsWith("/member") ||
    pathname?.startsWith("/event-manager");

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isExcludedPage) return;
    setMounted(true);

    let ticking = false;
    const updateScrollMetrics = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Senior UX Principle: Floating Action Button should only appear after the user has scrolled down into content (scrollY > 350)
      // Never show at the top of the page, avoiding cognitive clutter and visual collision with hero/cards.
      setVisible(scrollY > 350 && docHeight > 400);
      setProgress(docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollMetrics);
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isExcludedPage]);

  if (isExcludedPage) return null;

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!mounted) return null;

  // SVG progress ring dimensions
  const size = 44;
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleScrollToTop}
          aria-label="Scroll to top of page"
          title="Back to top"
          className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center group cursor-pointer select-none"
          style={{ filter: "drop-shadow(0 6px 20px rgba(139,92,246,0.45))" }}
        >
          {/* Glassmorphism high-contrast base */}
          <span className="absolute inset-0 rounded-full bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl border border-white/15 dark:border-purple-500/30" />

          {/* Purple inner accent glow */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/25 via-transparent to-indigo-500/15 pointer-events-none" />

          {/* Scroll progress ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
          >
            {/* Track ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="2.5"
            />
            {/* Progress arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#btt-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.15s ease" }}
            />
            <defs>
              <linearGradient id="btt-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Icon */}
          <div className="relative z-10">
            <ArrowUp
              className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:-translate-y-0.5 transition-transform duration-200"
              strokeWidth={2.75}
            />
          </div>

          {/* Desktop Hover Tooltip (Positioned to the right of the button) */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900/95 text-white text-[11px] font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 hidden sm:block font-outfit">
            Back to top ↑
            <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[4px] border-r-slate-900/95" />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

