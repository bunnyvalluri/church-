"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AdminFooter() {
  return (
    <footer className="w-full border-t border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0D0E1A]/90 backdrop-blur-md py-4 px-4 lg:px-6 select-none transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-gray-900 dark:text-white">
            Kingdom of Christ Ministries
          </span>
          <span>&copy; {new Date().getFullYear()} All Rights Reserved.</span>
          <span className="hidden md:inline text-indigo-600 dark:text-indigo-400 font-semibold">• Enterprise Portal v2.6</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span>Systems Normal</span>
          </div>
          <Link
            href="/admin/settings/security"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security Logs</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
