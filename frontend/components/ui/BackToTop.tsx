"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BackToTop() {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname?.startsWith("/admin/login") ||
    pathname?.startsWith("/admin/register");

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isAuthPage) return;
    setMounted(true);
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Visible whenever the page is scrollable (more than 200px overflow)
      setVisible(docHeight > 200);
      setProgress(docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isAuthPage]);

  if (isAuthPage) return null;

  const isNearTop = progress < 50;

  const handleScrollAction = () => {
    if (isNearTop) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
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
          initial={{ opacity: 0, scale: 0.4, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.4, y: 24 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          onClick={handleScrollAction}
          aria-label={isNearTop ? "Scroll to bottom" : "Scroll to top"}
          title={isNearTop ? "Scroll to bottom" : "Scroll to top"}
          className="fixed bottom-safe left-3 min-[360px]:left-4 sm:bottom-6 sm:left-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center group"
          style={{ filter: "drop-shadow(0 6px 20px rgba(139,92,246,0.4))" }}
        >
          {/* Glassmorphism base */}
          <span className="absolute inset-0 rounded-full bg-gray-950/80 dark:bg-gray-900/85 backdrop-blur-xl border border-white/[0.08]" />

          {/* Purple inner glow */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 via-transparent to-indigo-500/10 pointer-events-none" />

          {/* Scroll progress ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
          >
            {/* Track ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.06)"
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
              style={{ transition: "stroke-dashoffset 0.2s ease" }}
            />
            <defs>
              <linearGradient id="btt-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Animated Directional Icon */}
          <motion.div
            key={isNearTop ? "down" : "up"}
            initial={{ rotate: isNearTop ? -180 : 180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: isNearTop ? 180 : -180, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10"
          >
            {isNearTop ? (
              <ArrowDown
                className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] text-white"
                strokeWidth={2.8}
              />
            ) : (
              <ArrowUp
                className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] text-white"
                strokeWidth={2.8}
              />
            )}
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

