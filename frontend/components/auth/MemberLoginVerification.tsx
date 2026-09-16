"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

export interface MemberLoginVerificationProps {
  /** Maximum duration in milliseconds before proceeding to login (default: 3000ms) */
  duration?: number;
  /** Callback fired exactly once when verification completes or times out */
  onComplete?: () => void;
}

/**
 * MemberLoginVerification
 *
 * Professional, accessible browser readiness loading screen for Kingdom of Christ Ministries.
 * Displays a clean white screen with the small KCM emblem, circular blue spinner,
 * cross divider, ministry tagline, and subtle bottom wave accents before the login UI.
 *
 * Guaranteed completion within 3000ms with robust error failsafe.
 */
export default function MemberLoginVerification({
  duration = 3000,
  onComplete,
}: MemberLoginVerificationProps) {
  const [status, setStatus] = useState<"checking" | "ready" | "complete">("checking");
  const completedRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    const finish = () => {
      if (completedRef.current || isCancelled) return;
      completedRef.current = true;
      setStatus("complete");
      if (onComplete) {
        onComplete();
      }
    };

    // Hard ceiling: Guaranteed failsafe timeout (max 3000ms)
    const hardTimeoutId = setTimeout(() => {
      finish();
    }, Math.max(500, duration));

    // Browser readiness inspection (non-invasive, secure)
    try {
      const isClientReady =
        typeof window !== "undefined" &&
        typeof document !== "undefined" &&
        document.readyState !== "loading" &&
        navigator.cookieEnabled !== false;

      // Fast, snappy verification window (~800ms for swift, professional UX)
      const inspectionDelay = Math.min(800, Math.max(300, duration - 300));
      const naturalTimerId = setTimeout(() => {
        if (!isCancelled && isClientReady) {
          setStatus("ready");
          const exitTimer = setTimeout(finish, 100);
          return () => clearTimeout(exitTimer);
        }
      }, inspectionDelay);

      return () => {
        isCancelled = true;
        clearTimeout(hardTimeoutId);
        clearTimeout(naturalTimerId);
      };
    } catch {
      // Failsafe: if any environment inspection errors, proceed immediately
      finish();
      return () => {
        isCancelled = true;
        clearTimeout(hardTimeoutId);
      };
    }
  }, [duration, onComplete]);

  return (
    <main
      className="relative min-h-screen w-full bg-white text-slate-900 flex flex-col justify-between items-center overflow-x-hidden select-none px-4 sm:px-6 transition-opacity duration-300"
      aria-busy={status !== "complete"}
      aria-live="polite"
    >
      {/* Invisible spacer for vertical balance */}
      <div className="w-full h-4 sm:h-8" aria-hidden="true" />

      {/* Center Container: Logo, Spinner, Typography, Divider, Tagline */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center text-center my-auto py-6 sm:py-8">
        {/* 1. Small KCM Church Emblem */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-[76px] h-[76px] sm:w-[92px] sm:h-[92px] md:w-[108px] md:h-[108px] transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Kingdom of Christ Ministries Emblem"
              fill
              priority
              sizes="(max-width: 640px) 76px, (max-width: 768px) 92px, 108px"
              className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
            />
          </div>
        </div>

        {/* 2. Circular Blue Loading Spinner */}
        <div
          className="mt-8 sm:mt-10 md:mt-11 flex flex-col items-center justify-center"
          role="status"
          aria-label="Checking your browser before accessing Member Login"
        >
          <svg
            className="w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] md:w-[64px] md:h-[64px] animate-[spin_0.75s_linear_infinite] motion-reduce:animate-none"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Subtle light blue track */}
            <circle
              cx="32"
              cy="32"
              r="27"
              stroke="#E2EEFD"
              strokeWidth="4.5"
            />
            {/* Vibrant KCM Royal Blue active arc */}
            <circle
              cx="32"
              cy="32"
              r="27"
              stroke="#0066FF"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray="169.6"
              strokeDashoffset="126"
            />
          </svg>
          <span className="sr-only">Please wait, verifying browser readiness...</span>
        </div>

        {/* 3. Main Headings */}
        <div className="mt-7 sm:mt-8 md:mt-9 space-y-1 sm:space-y-1.5 px-2">
          <h1 className="text-[clamp(1.2rem,3.2vw,1.75rem)] font-extrabold text-[#0F172A] tracking-tight leading-snug sm:leading-tight">
            Checking your browser before accessing
          </h1>
          <p className="text-[clamp(1.25rem,3.4vw,1.85rem)] font-bold text-[#0066FF] tracking-tight leading-snug sm:leading-tight">
            Member Login
          </p>
        </div>

        {/* 4. Supporting Text */}
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-[15px] font-normal text-[#64748B] tracking-normal">
          Please wait for up to 3 seconds...
        </p>

        {/* 5. Subtle Horizontal Divider with Latin Christian Cross */}
        <div className="w-full max-w-[320px] sm:max-w-[400px] flex items-center justify-center my-8 sm:my-10 md:my-12">
          <span className="flex-1 h-[1px] bg-slate-200/90" aria-hidden="true" />
          <div className="px-3.5 sm:px-4 flex items-center justify-center text-[#93C5FD]">
            <svg
              width="14"
              height="20"
              viewBox="0 0 14 20"
              fill="currentColor"
              aria-hidden="true"
              className="drop-shadow-xs"
            >
              {/* Proportional Latin Cross (crossbar in upper third) */}
              <path d="M5.75 1C5.75 0.45 6.2 0 6.75 0H7.25C7.8 0 8.25 0.45 8.25 1V5H12.75C13.3 5 13.75 5.45 13.75 6V6.5C13.75 7.05 13.3 7.5 12.75 7.5H8.25V18.75C8.25 19.3 7.8 19.75 7.25 19.75H6.75C6.2 19.75 5.75 19.3 5.75 18.75V7.5H1.25C0.7 7.5 0.25 7.05 0.25 6.5V6C0.25 5.45 0.7 5 1.25 5H5.75V1Z" />
            </svg>
          </div>
          <span className="flex-1 h-[1px] bg-slate-200/90" aria-hidden="true" />
        </div>

        {/* 6. Ministry Fellowship Core Values */}
        <p className="text-[11px] sm:text-xs md:text-sm font-medium text-[#475569] tracking-wide sm:tracking-wider">
          Connect &nbsp;|&nbsp; Serve &nbsp;|&nbsp; Grow &nbsp;|&nbsp; Share &nbsp;|&nbsp; For His Glory
        </p>

        {/* 7. Official Church Title */}
        <p className="mt-2 text-[9.5px] sm:text-[10.5px] md:text-xs font-bold text-[#94A3B8] uppercase tracking-[0.2em] sm:tracking-[0.28em]">
          KINGDOM OF CHRIST MINISTRIES
        </p>
      </div>

      {/* 8. Subtle Pale-Blue Waves at Bottom (SVG with zero horizontal overflow) */}
      <div
        className="w-full pointer-events-none relative z-0 overflow-hidden leading-none select-none h-20 sm:h-28 md:h-36"
        aria-hidden="true"
      >
        <svg
          className="absolute bottom-0 left-0 w-full h-full preserve-3d"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Back Wave (ultra-light blue tint) */}
          <path
            d="M0,70 C320,130 520,30 840,90 C1140,150 1320,80 1440,60 L1440,180 L0,180 Z"
            fill="#F0F7FF"
          />
          {/* Middle Wave (soft sky tint) */}
          <path
            d="M0,105 C260,60 480,140 760,85 C1080,30 1280,120 1440,95 L1440,180 L0,180 Z"
            fill="#E3F0FD"
            fillOpacity="0.75"
          />
          {/* Front Wave (gentle foreground gradient contour) */}
          <path
            d="M0,135 C360,95 620,155 960,125 C1240,100 1360,145 1440,130 L1440,180 L0,180 Z"
            fill="#EDF5FD"
            fillOpacity="0.85"
          />
        </svg>
      </div>
    </main>
  );
}
