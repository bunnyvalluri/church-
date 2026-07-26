"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { Calendar, MapPin, Clock, Users, Plus } from "lucide-react";

export default function PastorEventsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const events = [
    { id: "1", title: "Grand Sunday Worship Service", date: "Sunday, Jul 27", time: "10:00 AM", location: "KCM Main Sanctuary", attending: 450, category: "WORSHIP" },
    { id: "2", title: "Midweek Fasting & Prayer", date: "Wednesday, Jul 30", time: "06:30 PM", location: "Prayer Tower Hall", attending: 120, category: "PRAYER" },
    { id: "3", title: "Youth Discipleship & Music Night", date: "Saturday, Aug 02", time: "05:00 PM", location: "KCM Youth Center", attending: 180, category: "YOUTH" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Church Event Calendar & Scheduling"
        subtitle="Manage upcoming worship services, prayer conventions, youth retreats, and ministry gatherings"
        badge="6 Upcoming"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        primaryActionLabel="Schedule Event"
        onPrimaryAction={() => alert("Schedule event modal")}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {events.map((e) => (
          <div key={e.id} className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-3">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">{e.category}</span>
            <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">{e.title}</h3>
            <div className="space-y-1 text-xs text-slate-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> {e.date} at {e.time}</div>
              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {e.location}</div>
              <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-500" /> {e.attending} Attending</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
