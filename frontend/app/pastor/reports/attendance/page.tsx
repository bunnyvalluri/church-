"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { Activity, TrendingUp, Users, Download } from "lucide-react";

export default function PastorAttendanceReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Worship Attendance Analytics & Service Reports"
        subtitle="Weekly congregation headcount, first-time visitor stats, service breakdown, and growth trends"
        badge="Attendance Analytics"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={() => alert("Attendance report exported")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#0E0F24]/70 border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Average Sunday Attendance</span>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">845 Attendees</h3>
          <span className="text-[10px] font-bold text-emerald-500 block mt-1">▲ +8.2% compared to last month</span>
        </div>
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#0E0F24]/70 border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">First-Time Visitors</span>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">42 Visitors</h3>
          <span className="text-[10px] font-bold text-purple-500 block mt-1">Welcomed & assigned follow-ups</span>
        </div>
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#0E0F24]/70 border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Cell Group Headcount</span>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">310 Members</h3>
          <span className="text-[10px] font-bold text-emerald-500 block mt-1">Active in weekly small groups</span>
        </div>
      </div>
    </div>
  );
}
