"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorSmallGroupsPage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [searchQuery, setSearchQuery] = useState("");

  const smallGroups = [
    { id: "1", name: t.smallGroup1Name, leader: t.smallGroup1Leader, location: t.smallGroup1Loc, avgAttendance: 18 },
    { id: "2", name: t.smallGroup2Name, leader: t.smallGroup2Leader, location: t.smallGroup2Loc, avgAttendance: 24 }
  ];

  const filteredGroups = smallGroups.filter((g) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.leader.toLowerCase().includes(q) || g.location.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.smallGroupsTitle}
        subtitle={t.smallGroupsSubtitle}
        badge={t.communityGroupsBadge}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        primaryActionLabel={t.addCellGroupBtn}
        onPrimaryAction={() => alert("Add small group")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGroups.map((g) => (
          <div key={g.id} className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">{g.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                {t.avgAttendeesLabel.replace("{count}", g.avgAttendance.toString())}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">{t.leaderLabel}: {g.leader}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {g.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

