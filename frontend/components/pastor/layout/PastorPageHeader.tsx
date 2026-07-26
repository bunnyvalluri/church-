"use client";

import React from "react";
import { Search, Filter, Download, Plus, RefreshCw } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

interface PastorPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  children?: React.ReactNode;
}

export default function PastorPageHeader({
  title,
  subtitle,
  badge,
  badgeColor = "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20",
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onRefresh,
  onExport,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  children
}: PastorPageHeaderProps) {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);
  const effectivePlaceholder = searchPlaceholder || t.searchRecords;

  return (
    <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.06] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Badge */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug truncate">
              {title}
            </h1>
            {badge && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 sm:px-3 sm:py-2 text-slate-600 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.refreshData}</span>
            </button>
          )}

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="px-3 py-2 text-slate-700 dark:text-gray-200 hover:text-slate-950 dark:hover:text-white bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.exportData}</span>
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-3.5 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              {secondaryActionLabel}
            </button>
          )}

          {primaryActionLabel && onPrimaryAction && (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] hover:to-[#7C3AED] text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/15 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{primaryActionLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter / Search Row (if enabled) */}
      {(onSearchChange !== undefined || children) && (
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.03] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {onSearchChange !== undefined && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder={effectivePlaceholder}
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all"
              />
            </div>
          )}
          {children && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
