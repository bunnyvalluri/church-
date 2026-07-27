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

  // Always render the same DOM structure — use opacity to hide until mounted
  // This prevents the server/client DOM mismatch (hydration error)
  return (
    <button
      type="button"
      onClick={() => mounted && setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-gray-100/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-white/10 transition-colors shrink-0"
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      <span suppressHydrationWarning className="flex items-center justify-center">
        {mounted && theme === "dark" ? (
          <Moon className="w-5 h-5 text-indigo-400" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500" />
        )}
      </span>
    </button>
  );
}
