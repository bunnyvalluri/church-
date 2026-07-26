"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorFinanceReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.financeReportTitle}
        subtitle={t.financeReportSubtitle}
        badge={t.auditLedgerBadge}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={() => alert("Finance report exported")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#0E0F24]/70 border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">{t.monthlyTithesLabel}</span>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{t.monthlyTithesValue}</h3>
          <span className="text-[10px] font-bold text-emerald-500 block mt-1">{t.monthlyTithesTrend}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#0E0F24]/70 border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">{t.buildingFundLabel}</span>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{t.buildingFundValue}</h3>
          <span className="text-[10px] font-bold text-indigo-500 block mt-1">{t.buildingFundTrend}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#0E0F24]/70 border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">{t.totalExpensesLabel}</span>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{t.totalExpensesValue}</h3>
          <span className="text-[10px] font-bold text-amber-500 block mt-1">{t.totalExpensesTrend}</span>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 p-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
        <p className="text-xs text-slate-500 dark:text-gray-400">{t.financeReportContent}</p>
      </div>
    </div>
  );
}
