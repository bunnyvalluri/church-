"use client";

/**
 * components/admin/skeletons/DashboardSkeleton.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Animated skeleton loaders for the admin dashboard panels.
 * Matches the exact layout of the real components for a smooth transition.
 */

import React from "react";

// ── Generic pulse animation class ─────────────────────────────────────────────
const pulse = "animate-pulse bg-slate-200 dark:bg-white/[0.06] rounded-lg";

// ── KPI Card Skeleton (5 top cards) ──────────────────────────────────────────
export function KPICardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      {/* Icon + label row */}
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl ${pulse}`} />
        <div className={`w-16 h-5 ${pulse}`} />
      </div>
      {/* Value */}
      <div className={`w-24 h-8 ${pulse}`} />
      {/* Sub-stats */}
      <div className="flex gap-2">
        <div className={`flex-1 h-4 ${pulse}`} />
        <div className={`flex-1 h-4 ${pulse}`} />
      </div>
    </div>
  );
}

// ── Table Row Skeleton ─────────────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-100 dark:border-white/[0.03]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3.5 px-5">
          <div
            className={`h-3.5 ${pulse}`}
            style={{ width: `${60 + (i % 3) * 15}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── Member List Skeleton ───────────────────────────────────────────────────────
export function MemberListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <div className={`w-9 h-9 rounded-full ${pulse} shrink-0`} />
          <div className="flex-1 space-y-1.5">
            <div className={`h-3.5 w-32 ${pulse}`} />
            <div className={`h-3 w-48 ${pulse}`} />
          </div>
          <div className={`h-5 w-16 ${pulse}`} />
        </div>
      ))}
    </div>
  );
}

// ── Chart Skeleton ─────────────────────────────────────────────────────────────
export function ChartSkeleton({ height = 120 }: { height?: number }) {
  return (
    <div className="p-4 flex flex-col gap-3">
      {/* Bars */}
      <div className={`w-full ${pulse}`} style={{ height }} />
      {/* X-axis labels */}
      <div className="flex justify-between gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`flex-1 h-3 ${pulse}`} />
        ))}
      </div>
    </div>
  );
}

// ── Stat Row Skeleton (for sidepanel stat lists) ───────────────────────────────
export function StatRowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className={`h-3.5 w-28 ${pulse}`} />
          <div className={`h-3.5 w-16 ${pulse}`} />
        </div>
      ))}
    </div>
  );
}

// ── Sidebar Counter Skeleton ───────────────────────────────────────────────────
export function SidebarCountSkeleton() {
  return <div className={`w-8 h-4 ${pulse}`} />;
}

// ── Full Panel Skeleton (wraps header + body) ─────────────────────────────────
export function PanelSkeleton({
  title = true,
  children,
}: {
  title?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] rounded-2xl overflow-hidden shadow-sm">
      {title && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
          <div className={`h-4 w-32 ${pulse}`} />
          <div className={`h-7 w-20 ${pulse}`} />
        </div>
      )}
      {children}
    </div>
  );
}
