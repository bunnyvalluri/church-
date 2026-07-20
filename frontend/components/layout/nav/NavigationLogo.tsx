"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

/**
 * NavigationLogo — Logo image + Church name + Tagline
 *
 * Desktop (≥lg): Logo + name + tagline
 * Tablet (sm–lg): Logo + name
 * Mobile (<sm):  Logo + name (truncated)
 *
 * Fixed image dimensions prevent CLS.
 * Hover glow uses transform+opacity only (GPU composited).
 */
const NavigationLogo = memo(function NavigationLogo() {
  const { t, language } = useLanguage();

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center flex-shrink-0 min-w-0",
        // Spacing between logo and text
        "gap-2 sm:gap-2.5",
        // Group for hover effects
        "group",
        // Focus ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl",
        // Min 44×44 touch target padding
        "p-1"
      )}
      aria-label="Kingdom of Christ Ministries — Home"
    >
      {/* ── Logo Image ── */}
      <div className="relative flex-shrink-0">
        {/* Glow ring — GPU: opacity only */}
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 via-purple-500 to-violet-600",
            "opacity-0 group-hover:opacity-100 blur-md scale-125",
            "transition-opacity duration-500 ease-out pointer-events-none"
          )}
          aria-hidden="true"
        />
        {/* Image container — fixed sizes prevent CLS */}
        <div className={cn(
          "relative rounded-full overflow-hidden bg-white",
          "border-2 border-purple-300/40 group-hover:border-purple-400/70",
          "shadow-md transition-[border-color,box-shadow] duration-300",
          // Responsive sizes
          "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11"
        )}>
          <Image
            src="/logo.png"
            alt="KCM Logo"
            fill
            sizes="(max-width: 640px) 32px, (max-width: 768px) 36px, (max-width: 1024px) 40px, 44px"
            className="object-contain p-0.5"
            priority
          />
        </div>
      </div>

      {/* ── Text Block ── */}
      <div className="flex flex-col min-w-0 leading-none">
        {/* Church name */}
        <span
          suppressHydrationWarning
          className={cn(
            "font-black text-gray-900 dark:text-white leading-tight whitespace-nowrap",
            // Responsive sizes
            "text-[10px] min-[360px]:text-[11px] sm:text-sm md:text-base lg:text-lg",
            language !== "en" ? "tracking-normal" : "tracking-tight",
            // GPU transition on hover
            "transition-colors duration-150"
          )}
        >
          {t.nav.churchName}
        </span>

        {/* Tagline / Ministries sub-label */}
        <span
          suppressHydrationWarning
          className={cn(
            "whitespace-nowrap leading-none mt-0.5",
            language !== "en"
              ? "text-[8px] min-[360px]:text-[9px] font-extrabold text-purple-600 dark:text-purple-400 tracking-normal"
              : "text-[0.45rem] min-[360px]:text-[0.5rem] sm:text-[0.58rem] font-bold uppercase tracking-[0.18em] bg-gradient-to-r from-purple-500 to-violet-400 dark:from-purple-300 dark:to-violet-200 bg-clip-text text-transparent"
          )}
        >
          {t.nav.ministries}
        </span>
      </div>
    </Link>
  );
});

export default NavigationLogo;
