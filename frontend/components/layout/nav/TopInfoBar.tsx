"use client";

import React, { memo } from "react";
import { Phone, ChevronRight, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopInfoBarProps {
  isScrolled: boolean;
}

/**
 * TopInfoBar — Contact numbers + service times + social links.
 *
 * Only visible at xl+ (≥1280px).
 * Collapses via max-h transition on scroll (180ms).
 * Uses `will-change: max-height` to GPU-hint the browser.
 */
const TopInfoBar = memo(function TopInfoBar({ isScrolled }: TopInfoBarProps) {
  const phones = [
    { number: "+91 97040 90069", label: "+91 97040 90069 (Senior Pastor)" },
    { number: "+91 96409 43777", label: "+91 96409 43777" },
    { number: "+91 73964 33856", label: "+91 73964 33856" },
  ];

  return (
    <div
      aria-hidden={isScrolled}
      className={cn(
        "hidden xl:block relative overflow-hidden",
        "bg-gradient-to-r from-violet-700/90 via-purple-700/90 to-violet-700/90",
        "text-purple-100 text-xs",
        // Collapse transition — 180ms
        "transition-[max-height,opacity] duration-[180ms] ease-in-out",
        isScrolled ? "max-h-0 opacity-0 pointer-events-none" : "max-h-9 opacity-100"
      )}
    >
      {/* Shimmer animation — GPU layer */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-screen-xl mx-auto px-6 relative z-10">
        <div className="flex items-center justify-between h-9">

          {/* Phone numbers */}
          <div className="flex items-center gap-3">
            {phones.map((phone, i) => (
              <React.Fragment key={phone.number}>
                <a
                  href={`tel:${phone.number.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-white rounded-md px-1"
                >
                  <Phone className="w-3 h-3" aria-hidden="true" />
                  <span className="font-medium">{phone.label}</span>
                </a>
                {i < phones.length - 1 && (
                  <span className="text-purple-400/50" aria-hidden="true">|</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Service times */}
          <div className="flex items-center gap-2 text-purple-200/80">
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="tracking-wide">Sunday Services: 5:45 AM | 8:30 AM | 10:30 AM</span>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
          </div>

          {/* Social */}
          <div className="flex items-center gap-1">
            <span className="mr-1.5 text-purple-300/70 text-[10px] uppercase tracking-wider">
              Follow
            </span>
            <a
              href="https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/15 transition-colors duration-150 hover:text-[#FF0000] focus-visible:ring-2 focus-visible:ring-white"
            >
              <Youtube className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
});

export default TopInfoBar;
