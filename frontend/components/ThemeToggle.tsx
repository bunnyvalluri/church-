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
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700/90 transition-all shrink-0 shadow-sm"
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      <span suppressHydrationWarning className="flex items-center justify-center">
        {mounted && theme === "dark" ? (
          <Moon className="w-5 h-5 text-purple-600 dark:text-purple-300" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500 dark:text-amber-300" />
        )}
      </span>
    </button>
  );
}
