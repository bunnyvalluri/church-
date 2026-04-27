"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-16 h-8 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/10 animate-pulse" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-16 h-8 flex items-center bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-full p-1 transition-all duration-500 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 group overflow-hidden"
      aria-label="Toggle theme"
    >
      {/* Background Track Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-black/40 dark:text-white/40 z-0">
        <Sun className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-45" />
        <Moon className="w-3.5 h-3.5 transition-transform duration-500 group-hover:-rotate-12" />
      </div>

      {/* Toggle Thumb */}
      <div
        className={`relative z-10 w-6 h-6 bg-white dark:bg-[#0a0a0f] rounded-full shadow-sm border border-black/10 dark:border-white/20 flex items-center justify-center transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
          theme === "dark" ? "translate-x-8" : "translate-x-0"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="w-3.5 h-3.5 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        )}
      </div>
    </button>
  );
}

