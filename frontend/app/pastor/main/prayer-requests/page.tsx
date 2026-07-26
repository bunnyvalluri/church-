"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { Heart, CheckCircle2, AlertCircle } from "lucide-react";

export default function PastorPrayerRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const prayers = [
    { id: "1", name: "Sister Mary", category: "HEALTH", title: "Prayers for Surgery Recovery", desc: "Please stand with my family in prayer for speedy recovery after knee surgery.", priority: "Urgent", status: "PENDING" },
    { id: "2", name: "Brother Joseph", category: "FINANCIAL", title: "Job Interview & Career Guidance", desc: "Praying for God's open door in upcoming senior software engineer interview.", priority: "Medium", status: "PRAYING" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Intercessory Prayer Wall"
        subtitle="Confidential prayer requests submitted by congregation members for intercessory team attention"
        badge="27 Active Prayers"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prayers.map((p) => (
          <div key={p.id} className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">{p.category}</span>
              <span className="text-[10px] font-bold text-amber-500">{p.priority} Priority</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{p.title}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">{p.desc}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
              <span>By: {p.name}</span>
              <button type="button" onClick={() => alert(`Praying for ${p.name}`)} className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> Mark Praying
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
