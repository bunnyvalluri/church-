"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { Users, MapPin, Activity } from "lucide-react";

export default function PastorSmallGroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const smallGroups = [
    { id: "1", name: "Jeedimetla Cell Fellowship", leader: "Brother Luke", location: "Sector 3, Jeedimetla", avgAttendance: 18 },
    { id: "2", name: "Kukatpally Grace Fellowship", leader: "Sister Sarah", location: "KPHB Colony", avgAttendance: 24 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Small Groups & Cell Fellowships"
        subtitle="Track neighborhood cell groups, house fellowships, location coverage, and attendance performance"
        badge="Community Groups"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        primaryActionLabel="Add Cell Group"
        onPrimaryAction={() => alert("Add small group")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {smallGroups.map((g) => (
          <div key={g.id} className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">{g.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">Avg {g.avgAttendance} Attendees</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">Leader: {g.leader}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {g.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
