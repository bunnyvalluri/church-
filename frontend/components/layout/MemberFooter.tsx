"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { IndiaFlag } from "@/components/ui/IndiaFlag";

export default function MemberFooter() {
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer
      className="w-full border-t border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0a0a12]/80 backdrop-blur-md select-none transition-colors"
      style={{
        paddingTop: "0.75rem",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left, 0.75rem))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right, 0.75rem))",
      }}
    >
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2">

        {/* Copyright & Developer Info — stack vertically on mobile */}
        <div className="flex flex-col items-center sm:items-start gap-1 min-w-0 text-center sm:text-left">
          <span
            className="font-semibold text-[11px] sm:text-xs text-gray-700 dark:text-gray-300 break-words w-full"
            suppressHydrationWarning
          >
            © {mounted ? currentYear : 2026} Kingdom of Christ Ministries.
            <span className="hidden sm:inline"> All rights reserved.</span>
          </span>
          <span className="sm:hidden text-[11px] text-gray-600 dark:text-gray-400">All rights reserved.</span>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <a
              href="https://valluri-rahul-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[10px] sm:text-xs tracking-wide text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
            >
              ✦ Developed by VALLURI RAHUL ✦
            </a>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
              <IndiaFlag className="w-3 h-3 flex-shrink-0" />
              <span>India</span>
            </span>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-medium justify-center flex-shrink-0">
          <Link
            href="/privacy"
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-gray-500 dark:text-gray-400"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-300 dark:text-gray-700" aria-hidden="true">•</span>
          <Link
            href="/terms"
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-gray-500 dark:text-gray-400"
          >
            Terms of Service
          </Link>
          <span className="text-gray-300 dark:text-gray-700" aria-hidden="true">•</span>
          <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
            <Shield className="w-3 h-3" /> Member Portal
          </span>
        </div>

      </div>
    </footer>
  );
}
