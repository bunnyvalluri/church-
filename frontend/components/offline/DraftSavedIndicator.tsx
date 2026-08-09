"use client";

import React from "react";
import { Save, Check } from "lucide-react";

interface DraftSavedIndicatorProps {
  lastSavedTime: string | null;
  isDraftRestored?: boolean;
}

export default function DraftSavedIndicator({ lastSavedTime, isDraftRestored }: DraftSavedIndicatorProps) {
  if (!lastSavedTime && !isDraftRestored) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 py-1">
      <Save className="w-3.5 h-3.5 text-emerald-500" />
      <span>
        {isDraftRestored ? "Draft restored from local storage" : "Draft saved locally"}
      </span>
      {lastSavedTime && (
        <span className="text-[10px] opacity-75">
          ({new Date(lastSavedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
        </span>
      )}
    </div>
  );
}
