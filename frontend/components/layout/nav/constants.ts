import { NavStyles } from "./types";

/**
 * Per-route design tokens: color, bg, border, hover states.
 * Using semantic keys that match href values for O(1) lookup.
 */
export const NAV_STYLES: Record<string, NavStyles> = {
  "#home": {
    activeText: "text-violet-600 dark:text-violet-300",
    activeBg: "bg-violet-500/15 dark:bg-violet-500/25 backdrop-blur-xl",
    activeBorder: "border-violet-400/40 dark:border-violet-400/40",
    hoverText: "hover:text-violet-600 dark:hover:text-violet-300",
    hoverBg: "hover:bg-violet-500/10 dark:hover:bg-violet-500/15",
    mobileActiveBorder: "border-l-violet-500",
    activeIndicator: "bg-violet-500 dark:bg-violet-400",
    glowColor: "rgba(139, 92, 246, 0.4)",
    liquidBlobGradient: "from-violet-500/30 via-purple-500/20 to-indigo-500/30",
    liquidBorderGlow: "border-violet-400/50 dark:border-violet-400/50 shadow-[0_0_24px_rgba(139,92,246,0.35)]",
    iconBg: "bg-violet-500/15 dark:bg-violet-500/30 text-violet-600 dark:text-violet-200 border-violet-200/60 dark:border-violet-400/40",
    activeIconText: "text-violet-600 dark:text-violet-200",
  },
  "#about": {
    activeText: "text-blue-600 dark:text-blue-300",
    activeBg: "bg-blue-500/15 dark:bg-blue-500/25 backdrop-blur-xl",
    activeBorder: "border-blue-400/40 dark:border-blue-400/40",
    hoverText: "hover:text-blue-600 dark:hover:text-blue-300",
    hoverBg: "hover:bg-blue-500/10 dark:hover:bg-blue-500/15",
    mobileActiveBorder: "border-l-blue-500",
    activeIndicator: "bg-blue-500 dark:bg-blue-400",
    glowColor: "rgba(59, 130, 246, 0.4)",
    liquidBlobGradient: "from-blue-500/30 via-cyan-500/20 to-sky-500/30",
    liquidBorderGlow: "border-blue-400/50 dark:border-blue-400/50 shadow-[0_0_24px_rgba(59,130,246,0.35)]",
    iconBg: "bg-blue-500/15 dark:bg-blue-500/30 text-blue-600 dark:text-blue-200 border-blue-200/60 dark:border-blue-400/40",
    activeIconText: "text-blue-600 dark:text-blue-200",
  },
  "/ngo": {
    activeText: "text-emerald-600 dark:text-emerald-300",
    activeBg: "bg-emerald-500/15 dark:bg-emerald-500/25 backdrop-blur-xl",
    activeBorder: "border-emerald-400/40 dark:border-emerald-400/40",
    hoverText: "hover:text-emerald-600 dark:hover:text-emerald-300",
    hoverBg: "hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15",
    mobileActiveBorder: "border-l-emerald-500",
    activeIndicator: "bg-emerald-500 dark:bg-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.4)",
    liquidBlobGradient: "from-emerald-500/30 via-teal-500/20 to-green-500/30",
    liquidBorderGlow: "border-emerald-400/50 dark:border-emerald-400/50 shadow-[0_0_24px_rgba(16,185,129,0.35)]",
    iconBg: "bg-emerald-500/15 dark:bg-emerald-500/30 text-emerald-600 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-400/40",
    activeIconText: "text-emerald-600 dark:text-emerald-200",
  },
  "#services": {
    activeText: "text-rose-600 dark:text-rose-300",
    activeBg: "bg-rose-500/15 dark:bg-rose-500/25 backdrop-blur-xl",
    activeBorder: "border-rose-400/40 dark:border-rose-400/40",
    hoverText: "hover:text-rose-600 dark:hover:text-rose-300",
    hoverBg: "hover:bg-rose-500/10 dark:hover:bg-rose-500/15",
    mobileActiveBorder: "border-l-rose-500",
    activeIndicator: "bg-rose-500 dark:bg-rose-400",
    glowColor: "rgba(244, 63, 94, 0.4)",
    liquidBlobGradient: "from-rose-500/30 via-pink-500/20 to-red-500/30",
    liquidBorderGlow: "border-rose-400/50 dark:border-rose-400/50 shadow-[0_0_24px_rgba(244,63,94,0.35)]",
    iconBg: "bg-rose-500/15 dark:bg-rose-500/30 text-rose-600 dark:text-rose-200 border-rose-200/60 dark:border-rose-400/40",
    activeIconText: "text-rose-600 dark:text-rose-200",
  },
  "#events": {
    activeText: "text-amber-600 dark:text-amber-300",
    activeBg: "bg-amber-500/15 dark:bg-amber-500/25 backdrop-blur-xl",
    activeBorder: "border-amber-400/40 dark:border-amber-400/40",
    hoverText: "hover:text-amber-600 dark:hover:text-amber-300",
    hoverBg: "hover:bg-amber-500/10 dark:hover:bg-amber-500/15",
    mobileActiveBorder: "border-l-amber-500",
    activeIndicator: "bg-amber-500 dark:bg-amber-400",
    glowColor: "rgba(245, 158, 11, 0.4)",
    liquidBlobGradient: "from-amber-500/30 via-yellow-500/20 to-orange-500/30",
    liquidBorderGlow: "border-amber-400/50 dark:border-amber-400/50 shadow-[0_0_24px_rgba(245,158,11,0.35)]",
    iconBg: "bg-amber-500/15 dark:bg-amber-500/30 text-amber-600 dark:text-amber-200 border-amber-200/60 dark:border-amber-400/40",
    activeIconText: "text-amber-600 dark:text-amber-200",
  },
  "#sermons": {
    activeText: "text-red-600 dark:text-red-300",
    activeBg: "bg-red-500/15 dark:bg-red-500/25 backdrop-blur-xl",
    activeBorder: "border-red-400/40 dark:border-red-400/40",
    hoverText: "hover:text-red-600 dark:hover:text-red-300",
    hoverBg: "hover:bg-red-500/10 dark:hover:bg-red-500/15",
    mobileActiveBorder: "border-l-red-500",
    activeIndicator: "bg-red-500 dark:bg-red-400",
    glowColor: "rgba(239, 68, 68, 0.4)",
    liquidBlobGradient: "from-red-500/30 via-rose-500/20 to-purple-500/30",
    liquidBorderGlow: "border-red-400/50 dark:border-red-400/50 shadow-[0_0_24px_rgba(239,68,68,0.35)]",
    iconBg: "bg-red-500/15 dark:bg-red-500/30 text-red-600 dark:text-red-200 border-red-200/60 dark:border-red-400/40",
    activeIconText: "text-red-600 dark:text-red-200",
  },
  "/gallery": {
    activeText: "text-sky-600 dark:text-sky-300",
    activeBg: "bg-sky-500/15 dark:bg-sky-500/25 backdrop-blur-xl",
    activeBorder: "border-sky-400/40 dark:border-sky-400/40",
    hoverText: "hover:text-sky-600 dark:hover:text-sky-300",
    hoverBg: "hover:bg-sky-500/10 dark:hover:bg-sky-500/15",
    mobileActiveBorder: "border-l-sky-500",
    activeIndicator: "bg-sky-500 dark:bg-sky-400",
    glowColor: "rgba(14, 165, 233, 0.4)",
    liquidBlobGradient: "from-sky-500/30 via-cyan-500/20 to-blue-500/30",
    liquidBorderGlow: "border-sky-400/50 dark:border-sky-400/50 shadow-[0_0_24px_rgba(14,165,233,0.35)]",
    iconBg: "bg-sky-500/15 dark:bg-sky-500/30 text-sky-600 dark:text-sky-200 border-sky-200/60 dark:border-sky-400/40",
    activeIconText: "text-sky-600 dark:text-sky-200",
  },
};

/** Primary nav items visible at tablet (≥768px). Rest go into "More" */
export const PRIMARY_NAV_KEYS = ["#home", "#about", "/ngo", "#events"];

/** Nav items that overflow into the "More" dropdown at tablet breakpoint */
export const OVERFLOW_NAV_KEYS = ["#services", "#sermons", "/gallery"];

/** Navbar heights per breakpoint — used for body padding-top to prevent CLS */
export const NAVBAR_HEIGHTS = {
  xs: 56,    // 320–375px
  sm: 60,    // 376–540px
  md: 64,    // 541–768px
  lg: 68,    // 769–1024px
  xl: 72,    // 1025–1440px
  "2xl": 76, // 1441px+
} as const;
