"use client";

import React from "react";
import AdminBreadcrumb from "./AdminBreadcrumb";
import { Search, Filter, RefreshCw } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface AdminPageTemplateProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function AdminPageTemplate({
  title,
  description,
  icon: Icon,
  actions,
  filters,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onRefresh,
  isLoading = false,
  children,
}: AdminPageTemplateProps) {
  const { language } = useLanguage();
  const t = adminTranslations[language || "en"] as any;

  const displayTitle = t?.pageTitles?.[title] || title;
  const displayDescription = description ? (t?.pageDescriptions?.[description] || description) : undefined;
  const refreshLabel = t?.common?.refreshData || "Refresh Data";

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-900 dark:text-white">
      {/* ── Top Bar: Breadcrumb + Refresh ── */}
      <div className="flex items-center justify-between gap-4">
        <AdminBreadcrumb />
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-600 dark:text-indigo-400" : ""}`} />
            <span className="hidden sm:inline">{refreshLabel}</span>
          </button>
        )}
      </div>

      {/* ── Page Title Header & Actions Row ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0F1021]/80 backdrop-blur-md border border-gray-200/80 dark:border-white/10 p-5 rounded-2xl shadow-sm dark:shadow-xl">
        <div className="flex items-start sm:items-center gap-3.5">
          {Icon && (
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {displayTitle}
            </h1>
            {displayDescription && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                {displayDescription}
              </p>
            )}
          </div>
        </div>

        {/* Primary Action Buttons */}
        {actions && (
          <div className="flex items-center flex-wrap gap-2.5 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* ── Optional Filters Bar & Search ── */}
      {(onSearchChange || filters) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0F1021]/60 p-3 rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm dark:shadow-lg backdrop-blur-md">
          {/* Search Input */}
          {onSearchChange && (
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder || "Search..."}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>
          )}

          {/* Quick Filters */}
          {filters && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </div>
              {filters}
            </div>
          )}
        </div>
      )}

      {/* ── Main Content Responsive Container ── */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
