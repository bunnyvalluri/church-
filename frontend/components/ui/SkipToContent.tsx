"use client";

import React from "react";

/**
 * WCAG 2.2 AA Accessible Skip Link
 * Allows screen reader and keyboard users to bypass header navigation and jump directly to main content.
 */
export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2.5 focus:bg-primary focus:text-primary-foreground focus:font-bold focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-200"
    >
      Skip to main content
    </a>
  );
}
