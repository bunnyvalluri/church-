"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorBibleStudyGroupsPage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [searchQuery, setSearchQuery] = useState("");

  const groups = [
    { id: "1", name: t.group1Name, leader: t.group1Leader, day: t.group1Day, members: 34 },
    { id: "2", name: t.group2Name, leader: t.group2Leader, day: t.group2Day, members: 28 },
    { id: "3", name: t.group3Name, leader: t.group3Leader, day: t.group3Day, members: 42 }
  ];

  const filteredGroups = groups.filter((g) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.leader.toLowerCase().includes(q) || g.day.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.bibleStudyTitle}
        subtitle={t.bibleStudySubtitle}
        badge={`${groups.length} ${t.activeGroupsBadge}`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        primaryActionLabel={t.newGroupBtn}
        onPrimaryAction={() => alert("Create new study group")}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredGroups.map((g) => (
          <div key={g.id} className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">{g.name}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{t.leaderLabel}: {g.leader}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
              <span>{g.day}</span>
              <span className="font-bold text-slate-700 dark:text-gray-200">{g.members} {t.membersCountLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

