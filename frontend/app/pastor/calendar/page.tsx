"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";

export default function PastorCalendarPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Master Pastoral Calendar"
        subtitle="Comprehensive view of Sunday services, midweek meetings, pastoral counseling appointments, and events"
        badge="Pastoral Schedule"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        primaryActionLabel="New Appointment"
        onPrimaryAction={() => alert("Schedule appointment")}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 p-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
        <p className="text-xs text-slate-500 dark:text-gray-400">Master pastoral calendar view.</p>
      </div>
    </div>
  );
}
