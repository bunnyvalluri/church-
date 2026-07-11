"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function NgoLoading() {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center space-y-4 py-12">
      <div className="relative flex items-center justify-center">
        {/* Decorative pulsating blur background */}
        <div className="absolute w-16 h-16 bg-purple-500/20 dark:bg-purple-500/30 rounded-full filter blur-md animate-ping" />
        <div className="relative p-4 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-xl backdrop-blur-md">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
        </div>
      </div>
      <div className="space-y-1 text-center">
        <p className="text-slate-800 dark:text-slate-200 text-sm font-extrabold tracking-wide animate-pulse">
          Loading Section...
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium font-mono">
          Please wait
        </p>
      </div>
    </div>
  );
}
