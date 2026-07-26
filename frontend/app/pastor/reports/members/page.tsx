"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";

export default function PastorMemberReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Congregation Demographics & Member Growth"
        subtitle="Membership demographic distribution, baptism stats, family units, and engagement metrics"
        badge="Member Reports"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={() => alert("Member report exported")}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 p-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
        <p className="text-xs text-slate-500 dark:text-gray-400">Detailed congregation demographics and member growth reports.</p>
      </div>
    </div>
  );
}
