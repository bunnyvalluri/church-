"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorAttendanceReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.attendanceReportTitle}
        subtitle={t.attendanceReportSubtitle}
        badge={t.attendanceBadge}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={() => alert("Attendance report exported")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#0E0F24]/70 border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">{t.avgSundayAttendanceLabel}</span>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{t.avgSundayAttendanceValue}</h3>
          <span className="text-[10px] font-bold text-emerald-500 block mt-1">{t.avgSundayAttendanceTrend}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#0E0F24]/70 border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">{t.firstTimeVisitorsLabel}</span>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{t.firstTimeVisitorsValue}</h3>
          <span className="text-[10px] font-bold text-purple-500 block mt-1">{t.firstTimeVisitorsTrend}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#0E0F24]/70 border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">{t.cellGroupHeadcountLabel}</span>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{t.cellGroupHeadcountValue}</h3>
          <span className="text-[10px] font-bold text-emerald-500 block mt-1">{t.cellGroupHeadcountTrend}</span>
        </div>
      </div>
    </div>
  );
}
