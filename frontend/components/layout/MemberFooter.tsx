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
    <footer className="w-full border-t border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0a0a12]/80 backdrop-blur-md py-3 sm:py-4 px-3 sm:px-6 mt-6 select-none transition-colors">
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left text-xs text-gray-500 dark:text-gray-400">
        
        {/* Copyright & Developer Info */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-2 text-center sm:text-left">
          <span className="font-semibold text-[11px] sm:text-xs text-gray-700 dark:text-gray-300" suppressHydrationWarning>
            © {mounted ? currentYear : 2026} Kingdom of Christ Ministries.
          </span>
          <a
            href="https://valluri-rahul-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[10px] sm:text-xs tracking-wide text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors inline-flex items-center gap-1"
          >
            ✦ Developed by VALLURI RAHUL ✦
          </a>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] font-medium text-gray-700 dark:text-gray-300">
            <IndiaFlag className="w-3 h-3" />
            <span>India</span>
          </span>
        </div>

        {/* Footer Links */}
        <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-medium justify-center">
          <Link
            href="/privacy"
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <Link
            href="/terms"
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            Terms of Service
          </Link>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
            <Shield className="w-3 h-3" /> Member Portal
          </span>
        </div>

      </div>
    </footer>
  );
}
