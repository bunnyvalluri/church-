"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { BookOpen, Users, Clock } from "lucide-react";

export default function PastorBibleStudyGroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const groups = [
    { id: "1", name: "Wednesday Evening Discipleship", leader: "Pastor Samuel", day: "Wednesdays 07:00 PM", members: 34 },
    { id: "2", name: "Women of Faith Bible Study", leader: "Sister Mary Grace", day: "Fridays 05:00 PM", members: 28 },
    { id: "3", name: "Youth Word & Life Foundations", leader: "Brother Timothy", day: "Saturdays 04:00 PM", members: 42 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Bible Study & Discipleship Groups"
        subtitle="Manage Bible study curriculum, leader assignments, group schedules, and weekly attendance logs"
        badge="3 Active Groups"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        primaryActionLabel="New Group"
        onPrimaryAction={() => alert("Create new study group")}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groups.map((g) => (
          <div key={g.id} className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">{g.name}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Leader: {g.leader}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
              <span>{g.day}</span>
              <span className="font-bold text-slate-700 dark:text-gray-200">{g.members} Members</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
