import { NavStyles } from "./types";

/**
 * Per-route design tokens: color, bg, border, hover states.
 * Using semantic keys that match href values for O(1) lookup.
 */
export const NAV_STYLES: Record<string, NavStyles> = {
  "#home": {
    activeText: "text-violet-600 dark:text-violet-400",
    activeBg: "bg-violet-50/80 dark:bg-violet-500/10",
    activeBorder: "border-violet-200/60 dark:border-violet-500/20",
    hoverText: "hover:text-violet-600 dark:hover:text-violet-400",
    hoverBg: "hover:bg-violet-50/60 dark:hover:bg-violet-500/5",
    mobileActiveBorder: "border-l-violet-500",
    activeIndicator: "bg-violet-500",
  },
  "#about": {
    activeText: "text-blue-600 dark:text-blue-400",
    activeBg: "bg-blue-50/80 dark:bg-blue-500/10",
    activeBorder: "border-blue-200/60 dark:border-blue-500/20",
    hoverText: "hover:text-blue-600 dark:hover:text-blue-400",
    hoverBg: "hover:bg-blue-50/60 dark:hover:bg-blue-500/5",
    mobileActiveBorder: "border-l-blue-500",
    activeIndicator: "bg-blue-500",
  },
  "/ngo": {
    activeText: "text-emerald-600 dark:text-emerald-400",
    activeBg: "bg-emerald-50/80 dark:bg-emerald-500/10",
    activeBorder: "border-emerald-200/60 dark:border-emerald-500/20",
    hoverText: "hover:text-emerald-600 dark:hover:text-emerald-400",
    hoverBg: "hover:bg-emerald-50/60 dark:hover:bg-emerald-500/5",
    mobileActiveBorder: "border-l-emerald-500",
    activeIndicator: "bg-emerald-500",
  },
  "#services": {
    activeText: "text-rose-600 dark:text-rose-400",
    activeBg: "bg-rose-50/80 dark:bg-rose-500/10",
    activeBorder: "border-rose-200/60 dark:border-rose-500/20",
    hoverText: "hover:text-rose-600 dark:hover:text-rose-400",
    hoverBg: "hover:bg-rose-50/60 dark:hover:bg-rose-500/5",
    mobileActiveBorder: "border-l-rose-500",
    activeIndicator: "bg-rose-500",
  },
  "#events": {
    activeText: "text-amber-600 dark:text-amber-400",
    activeBg: "bg-amber-50/80 dark:bg-amber-500/10",
    activeBorder: "border-amber-200/60 dark:border-amber-500/20",
    hoverText: "hover:text-amber-600 dark:hover:text-amber-400",
    hoverBg: "hover:bg-amber-50/60 dark:hover:bg-amber-500/5",
    mobileActiveBorder: "border-l-amber-500",
    activeIndicator: "bg-amber-500",
  },
  "#sermons": {
    activeText: "text-red-600 dark:text-red-400",
    activeBg: "bg-red-50/80 dark:bg-red-500/10",
    activeBorder: "border-red-200/60 dark:border-red-500/20",
    hoverText: "hover:text-red-600 dark:hover:text-red-400",
    hoverBg: "hover:bg-red-50/60 dark:hover:bg-red-500/5",
    mobileActiveBorder: "border-l-red-500",
    activeIndicator: "bg-red-500",
  },
  "/gallery": {
    activeText: "text-sky-600 dark:text-sky-400",
    activeBg: "bg-sky-50/80 dark:bg-sky-500/10",
    activeBorder: "border-sky-200/60 dark:border-sky-500/20",
    hoverText: "hover:text-sky-600 dark:hover:text-sky-400",
    hoverBg: "hover:bg-sky-50/60 dark:hover:bg-sky-500/5",
    mobileActiveBorder: "border-l-sky-500",
    activeIndicator: "bg-sky-500",
  },
};

/** Primary nav items visible at tablet (≥768px). Rest go into "More" */
export const PRIMARY_NAV_KEYS = ["#home", "#about", "#events"];

/** Nav items that overflow into the "More" dropdown at tablet breakpoint */
export const OVERFLOW_NAV_KEYS = ["/ngo", "#services", "#sermons", "/gallery"];

/** Navbar heights per breakpoint — used for body padding-top to prevent CLS */
export const NAVBAR_HEIGHTS = {
  xs: 56,    // 320–375px
  sm: 60,    // 376–540px
  md: 64,    // 541–768px
  lg: 68,    // 769–1024px
  xl: 72,    // 1025–1440px
  "2xl": 76, // 1441px+
} as const;
