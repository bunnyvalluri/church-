"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface BackToHomeProps {
  className?: string;
  variant?: "default" | "glass";
  href?: string;
  label?: string;
}

export default function BackToHome({
  className,
  variant = "glass",
  href = "/",
  label,
}: BackToHomeProps) {
  const { language } = useLanguage();

  const defaultLabel =
    language === "te"
      ? "హోమ్‌కు తిరిగి వెళ్ళండి"
      : language === "hi"
      ? "होम पर वापस जाएं"
      : "Back to Home";

  const displayLabel = label || defaultLabel;
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 select-none group min-h-[44px] min-w-[44px]",
        // Adaptive Glassmorphism Variant (works seamlessly in both Light & Dark modes)
        variant === "glass" && [
          "text-slate-900 dark:text-white",
          "bg-white/90 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20",
          "border border-slate-300/80 dark:border-white/20 hover:border-purple-500/50 dark:hover:border-white/40",
          "backdrop-blur-md shadow-sm hover:shadow-md",
          "hover:-translate-x-0.5 hover:scale-[1.02]",
          "active:scale-95 active:translate-x-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
        ],
        // Default Variant (for standard light/dark backgrounds)
        variant === "default" && [
          "text-slate-900 dark:text-slate-100",
          "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700",
          "border border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500/50",
          "shadow-sm hover:shadow-md",
          "hover:-translate-x-0.5 hover:scale-[1.02]",
          "active:scale-95 active:translate-x-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2",
        ],
        className
      )}
      aria-label={displayLabel}
    >
      <ChevronLeft className="w-4 h-4 text-purple-600 dark:text-purple-300 transition-transform duration-200 group-hover:-translate-x-1" />
      <span className="font-bold tracking-tight">{displayLabel}</span>
    </Link>
  );
}
