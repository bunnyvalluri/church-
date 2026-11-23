"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

/**
 * NavigationLogo — Floating Pill Logo matching modern portfolio & radiant gradient aesthetic
 *
 * Left: Avatar inside a radiant gradient ring (purple/pink/indigo)
 * Right: Two-tone Title ("Kingdom" bold dark + "of Christ" bold purple) + Subtitle ("MINISTRIES • CHURCH PORTAL")
 */
const NavigationLogo = memo(function NavigationLogo() {
  const { t, language } = useLanguage();

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center flex-shrink-0 min-w-0 z-10 relative",
        // Spacing between avatar ring and text
        "gap-2.5 sm:gap-3",
        // Group for hover effects
        "group",
        // Focus ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-full",
        "py-0.5"
      )}
      aria-label="Kingdom of Christ Ministries — Home"
    >
      {/* ── Radiant Gradient Avatar Ring (Pink-to-Purple Gradient Ring from reference) ── */}
      <div className="relative flex-shrink-0 p-[2px] rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 shadow-xs group-hover:scale-105 transition-transform duration-200">
        <div className="p-[1.5px] rounded-full bg-white dark:bg-slate-900">
          <div className={cn(
            "relative rounded-full overflow-hidden bg-white",
            "w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10"
          )}>
            <Image
              src="/logo.png"
              alt="KCM Logo"
              fill
              unoptimized
              sizes="(max-width: 640px) 36px, 40px"
              className="object-contain p-0.5"
              priority
            />
          </div>
        </div>
      </div>

      {/* ── Typography Block (Two-Tone Title + Subtitle) ── */}
      <div className="flex flex-col min-w-0 leading-none">
        {/* Church Name — Two Tone: "Kingdom" (dark) + "of Christ" (purple) */}
        <span
          suppressHydrationWarning
          className={cn(
            "font-black leading-tight truncate max-w-[130px] min-[360px]:max-w-[155px] sm:max-w-none font-outfit",
            "text-xs min-[360px]:text-[13px] sm:text-sm md:text-sm lg:text-base 2xl:text-lg",
            "transition-colors duration-150"
          )}
        >
          {language === "en" ? (
            <>
              <span className="text-slate-900 dark:text-white">Kingdom </span>
              <span className="text-purple-600 dark:text-purple-400">of Christ</span>
            </>
          ) : (
            <span className="text-slate-900 dark:text-white">{t.nav.churchName}</span>
          )}
        </span>

        {/* Subtitle / Department — Bold Uppercase Sub-Label */}
        <span
          suppressHydrationWarning
          className="text-[8.5px] min-[360px]:text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none mt-0.5 truncate"
        >
          {language === "en" ? "Ministries • Church Portal" : t.nav.ministries}
        </span>
      </div>
    </Link>
  );
});

export default NavigationLogo;
