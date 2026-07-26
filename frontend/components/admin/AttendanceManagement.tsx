"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  UserCheck, 
  Calendar, 
  BarChart2, 
  Plus, 
  Users, 
  Printer, 
  TrendingUp, 
  Sparkles, 
  Filter, 
  X, 
  Search, 
  Building2, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ChevronRight,
  Layers
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface AttendanceManagementProps {
  events: any[];
  users: any[];
  records: AttendanceRecord[];
  initialCheckins?: Record<string, string[]>;
  onAddAttendance?: (rec: any) => void;
  onOpenAddAttendance?: () => void;
  onRefresh?: () => void;
  activeSubTab?: "records" | "event-attendance" | "reports";
  isLoading?: boolean;
}

interface AttendanceRecord {
  id: string;
  date: string;
  serviceType: string;
  location: string;
  headcount: number;
  newVisitors: number;
  notes: string;
}

export default function AttendanceManagement({ 
  events, 
  users, 
  records = [],
  initialCheckins,
  onAddAttendance,
  onOpenAddAttendance,
  onRefresh,
  activeSubTab = "records",
  isLoading = false
}: AttendanceManagementProps) {
  const [subView, setSubView] = useState<"records" | "event-attendance" | "reports">(activeSubTab);
  React.useEffect(() => {
    setSubView(activeSubTab);
  }, [activeSubTab]);

  const { language } = useLanguage();
  const t = adminTranslations[language as keyof typeof adminTranslations] || adminTranslations.en;

  // Search & Filters State for Records
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [selectedServiceType, setSelectedServiceType] = useState("ALL");

  // Search & Filters State for Check-in Terminal
  const [checkinSearch, setCheckinSearch] = useState("");
  const [checkinFilter, setCheckinFilter] = useState<"ALL" | "CHECKED_IN" | "PENDING">("ALL");

  // Add Attendance Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    serviceType: "Sunday Worship Service",
    location: "Subhash Nagar Sanctuary",
    headcount: 0,
    newVisitors: 0,
    notes: "",
  });

  const handleOpenAddModal = () => {
    if (onOpenAddAttendance) {
      onOpenAddAttendance();
    } else {
      setIsAddModalOpen(true);
    }
  };

  const handleCreateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          headcount: Number(formData.headcount),
          newVisitors: Number(formData.newVisitors),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAddModalOpen(false);
        setFormData({
          date: new Date().toISOString().split("T")[0],
          serviceType: "Sunday Worship Service",
          location: "Subhash Nagar Sanctuary",
          headcount: 0,
          newVisitors: 0,
          notes: "",
        });
        if (onRefresh) onRefresh();
        if (onAddAttendance) onAddAttendance(data.record);
      } else {
        alert(data.error || "Failed to create attendance record");
      }
    } catch (err) {
      console.error("Error adding attendance record:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Translation helpers
  const getServiceTypeTranslation = (type: string) => {
    switch (type) {
      case "Sunday Worship Service": return t.attendance.sundayWorship || type;
      case "Sunday Afternoon Prayer": return t.attendance.sundayAfternoon || type;
      case "Friday Evening Prayer": return t.attendance.fridayEvening || type;
      case "Youth Special Fellowship": return t.attendance.youthSpecial || type;
      case "All Night Prayer Vigil": return t.attendance.allNightVigil || type;
      default: return type;
    }
  };

  const getLocationTranslation = (loc: string) => {
    switch (loc) {
      case "Subhash Nagar Sanctuary": return t.attendance.subhashNagar || loc;
      case "Shapur Location": return t.attendance.shapurLoc || loc;
      case "Bahadurpally Location": return t.attendance.bahadurpallyLoc || loc;
      default: return loc;
    }
  };

  const getMockNotesTranslation = (notes: string) => {
    if (!notes) return "";
    if (notes.includes("Main Sunday worship service")) {
      return language === "te" ? "ప్రధాన ఆదివారం ఆరాధన కూడిక, శక్తివంతమైన సమయం." :
             language === "hi" ? "मुख्य रविवार आराधना सेवा, शक्तिशाली सत्र।" : notes;
    }
    if (notes.includes("Afternoon service")) {
      return language === "te" ? "మధ్యాహ్న సేవ, యువకుల మంచి భాగస్వామ్యం." :
             language === "hi" ? "दोपहर की सेवा, युवाओं की अच्छी उपस्थिति।" : notes;
    }
    if (notes.includes("Weekly Friday evening")) {
      return language === "te" ? "వారాంతపు శుక్రవారం సాయంత్రం ప్రార్థన కూడిక." :
             language === "hi" ? "साप्ताहिक शुक्रवार शाम की मध्यस्थता प्रार्थना।" : notes;
    }
    return notes;
  };

  const getMonthTranslation = (month: string) => {
    switch (month) {
      case "Jan": return language === "te" ? "జన" : language === "hi" ? "जन" : "Jan";
      case "Feb": return language === "te" ? "ఫిబ్ర" : language === "hi" ? "फर" : "Feb";
      case "Mar": return language === "te" ? "మార్చి" : language === "hi" ? "మార్చ్" : "Mar";
      case "Apr": return language === "te" ? "ఏప్రి" : language === "hi" ? "अप्रैल" : "Apr";
      case "May": return language === "te" ? "మే" : language === "hi" ? "మఈ" : "May";
      case "Jun": return language === "te" ? "జూన్" : language === "hi" ? "जून" : "Jun";
      default: return month;
    }
  };

  // Event check-ins
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "evt_worship_sun");
  const [eventCheckins, setEventCheckins] = useState<Record<string, string[]>>(initialCheckins || {});

  const fetchCheckins = async () => {
    try {
      const res = await fetch('/api/admin/attendance/event-checkins');
      const data = await res.json();
      if (data.success) {
        setEventCheckins(data.checkins || {});
      }
    } catch (err) {
      console.error("Error fetching checkins:", err);
    }
  };

  useEffect(() => {
    if (initialCheckins !== undefined) {
      setEventCheckins(initialCheckins);
    }
  }, [initialCheckins]);

  useEffect(() => {
    if (events.length > 0 && !events.some(e => e.id === selectedEventId)) {
      setSelectedEventId(events[0].id);
    }
  }, [events]);

  const handleToggleCheckin = async (eventId: string, userId: string) => {
    setEventCheckins(prev => {
      const current = prev[eventId] || [];
      const updated = current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId];
      return { ...prev, [eventId]: updated };
    });

    try {
      const res = await fetch('/api/admin/attendance/event-checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId })
      });
      const data = await res.json();
      if (data.success) {
        setEventCheckins(prev => ({
          ...prev,
          [eventId]: data.checkedInUserIds
        }));
      }
    } catch (err) {
      console.error("Error toggling checkin:", err);
      fetchCheckins();
    }
  };

  const displayEvents = useMemo(() => {
    if (events && events.length > 0) return events;
    return [
      { id: "evt_worship_sun", title: "Sunday Worship Service", date: new Date().toISOString(), location: "Subhash Nagar Sanctuary" },
      { id: "evt_friday_prayer", title: "Friday Intercessory Prayer", date: new Date(Date.now() + 86400000 * 2).toISOString(), location: "Shapur Location" },
      { id: "evt_youth_meet", title: "Youth Special Fellowship", date: new Date(Date.now() + 86400000 * 4).toISOString(), location: "Bahadurpally Location" }
    ];
  }, [events]);

  const currentEvent = useMemo(() => {
    return displayEvents.find(e => e.id === selectedEventId) || displayEvents[0];
  }, [displayEvents, selectedEventId]);

  // Calculated Stats Overview
  const stats = useMemo(() => {
    const totalHeadcount = records.reduce((acc, r) => acc + (r.headcount || 0), 0);
    const totalVisitors = records.reduce((acc, r) => acc + (r.newVisitors || 0), 0);
    const avgHeadcount = records.length > 0 ? Math.round(totalHeadcount / records.length) : 0;
    const uniqueLocations = new Set(records.map(r => r.location)).size;

    return {
      totalHeadcount,
      totalVisitors,
      avgHeadcount,
      uniqueLocations: uniqueLocations || 1,
      recordsCount: records.length,
    };
  }, [records]);

  // Filtered Attendance Records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch = 
        !searchQuery ||
        rec.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.notes && rec.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLoc = selectedLocation === "ALL" || rec.location === selectedLocation;
      const matchesType = selectedServiceType === "ALL" || rec.serviceType === selectedServiceType;

      return matchesSearch && matchesLoc && matchesType;
    });
  }, [records, searchQuery, selectedLocation, selectedServiceType]);

  // Filtered Event Checkin Users
  const filteredUsers = useMemo(() => {
    const checkedInUserIds = eventCheckins[currentEvent.id] || [];
    return users.filter((u) => {
      const matchesSearch = 
        !checkinSearch ||
        (u.name && u.name.toLowerCase().includes(checkinSearch.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(checkinSearch.toLowerCase()));

      const isCheckedIn = checkedInUserIds.includes(u.id);
      const matchesFilter = 
        checkinFilter === "ALL" ||
        (checkinFilter === "CHECKED_IN" && isCheckedIn) ||
        (checkinFilter === "PENDING" && !isCheckedIn);

      return matchesSearch && matchesFilter;
    });
  }, [users, eventCheckins, currentEvent.id, checkinSearch, checkinFilter]);

  const activeCheckedInCount = (eventCheckins[currentEvent.id] || []).length;
  const checkinPercentage = users.length > 0 ? Math.round((activeCheckedInCount / users.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200/60 dark:bg-white/[0.05] rounded-2xl p-5 border border-slate-200/50 dark:border-white/5 flex flex-col justify-between" />
          ))}
        </div>
        <div className="h-12 bg-slate-200/60 dark:bg-white/[0.05] rounded-2xl w-full" />
        <div className="bg-slate-200/60 dark:bg-white/[0.05] border border-slate-200/50 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <div className="h-8 bg-slate-300/60 dark:bg-white/10 rounded-xl w-1/3" />
          <div className="space-y-3 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-300/40 dark:bg-white/5 rounded-xl w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ─── Top KPI Metric Overview Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-500/15 dark:via-purple-500/10 border border-indigo-200/50 dark:border-indigo-500/20 p-4 md:p-5 rounded-2xl shadow-sm backdrop-blur-xl transition-all hover:border-indigo-400/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-indigo-300 uppercase tracking-wider">Total Headcount</span>
            <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
          <p className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{stats.totalHeadcount.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <TrendingUp className="w-3 h-3" /> Across {stats.recordsCount} recorded services
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-500/15 dark:via-teal-500/10 border border-emerald-200/50 dark:border-emerald-500/20 p-4 md:p-5 rounded-2xl shadow-sm backdrop-blur-xl transition-all hover:border-emerald-400/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-emerald-300 uppercase tracking-wider">Avg Attendance</span>
            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
          <p className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{stats.avgHeadcount.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-gray-400 mt-1">
            <UserCheck className="w-3 h-3 text-emerald-500" /> Per Sunday worship session
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-500/15 dark:via-orange-500/10 border border-amber-200/50 dark:border-amber-500/20 p-4 md:p-5 rounded-2xl shadow-sm backdrop-blur-xl transition-all hover:border-amber-400/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-amber-300 uppercase tracking-wider">New Visitors</span>
            <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
              <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
          <p className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">+{stats.totalVisitors}</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1">
            <Sparkles className="w-3 h-3" /> First-time believers welcomed
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent dark:from-blue-500/15 dark:via-cyan-500/10 border border-blue-200/50 dark:border-blue-500/20 p-4 md:p-5 rounded-2xl shadow-sm backdrop-blur-xl transition-all hover:border-blue-400/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-blue-300 uppercase tracking-wider">Sanctuaries</span>
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
              <Building2 className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
          <p className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{stats.uniqueLocations}</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">
            <Building2 className="w-3 h-3" /> Active ministry branches
          </div>
        </div>
      </div>

      {/* ─── Sub Navigation Tabs ─── */}
      <div className="p-1.5 bg-slate-100/80 dark:bg-[#121324]/80 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl flex gap-1.5 items-center w-full overflow-x-auto scrollbar-none shadow-inner">
        {[
          { id: "records", label: t.attendance.attendanceTab || "Records Ledger", icon: UserCheck, count: records.length },
          { id: "event-attendance", label: t.attendance.terminalTab || "Terminal Check-In", icon: Calendar, count: events.length },
          { id: "reports", label: t.attendance.reportsTab || "Analytics Reports", icon: BarChart2 }
        ].map((tab) => {
          const isSelected = subView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`py-2.5 px-4 md:px-5 rounded-xl flex items-center gap-2.5 text-xs font-bold transition-all shrink-0 select-none ${
                isSelected
                  ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md shadow-indigo-500/10 border border-indigo-100 dark:border-indigo-500"
                  : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.04]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isSelected 
                    ? "bg-indigo-100 dark:bg-white/20 text-indigo-700 dark:text-white" 
                    : "bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-gray-400"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ────────────────── SUB-VIEW: RECORDS ────────────────── */}
      {subView === "records" && (
        <div className="space-y-5">
          {/* Action Header */}
          <div className="bg-white dark:bg-[#121324]/80 border border-slate-200/70 dark:border-white/[0.06] p-5 md:p-6 rounded-2xl shadow-sm backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-500" />
                {t.attendance.attendanceRecords}
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-semibold">
                {t.attendance.recordsSubtitle}
              </p>
            </div>
            <button 
              onClick={handleOpenAddModal} 
              className="py-3 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> {t.attendance.recordServiceAttendance}
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-[#121324]/60 border border-slate-200/70 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm backdrop-blur-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search location or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5 w-full sm:w-auto items-center">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-slate-50 dark:bg-[#191a32] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Sanctuaries</option>
                <option value="Subhash Nagar Sanctuary">Subhash Nagar</option>
                <option value="Shapur Location">Shapur</option>
                <option value="Bahadurpally Location">Bahadurpally</option>
              </select>

              <select
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value)}
                className="bg-slate-50 dark:bg-[#191a32] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Service Types</option>
                <option value="Sunday Worship Service">Sunday Worship</option>
                <option value="Sunday Afternoon Prayer">Afternoon Prayer</option>
                <option value="Friday Evening Prayer">Friday Prayer</option>
                <option value="Youth Special Fellowship">Youth Special</option>
                <option value="All Night Prayer Vigil">All Night Vigil</option>
              </select>

              {(searchQuery || selectedLocation !== "ALL" || selectedServiceType !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLocation("ALL");
                    setSelectedServiceType("ALL");
                  }}
                  className="px-3 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <X className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block border border-slate-200/70 dark:border-white/[0.06] bg-white dark:bg-[#121324]/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200/70 dark:border-white/[0.06] text-[11px] font-extrabold text-slate-500 dark:text-gray-400 uppercase tracking-wider bg-slate-50 dark:bg-white/[0.02]">
                    <th className="py-4 px-6">{t.attendance.serviceDate}</th>
                    <th className="py-4 px-6">{t.attendance.serviceProgram}</th>
                    <th className="py-4 px-6">{t.attendance.churchLocation}</th>
                    <th className="py-4 px-6">{t.attendance.totalBelievers}</th>
                    <th className="py-4 px-6">{t.attendance.newVisitors}</th>
                    <th className="py-4 px-6">{t.attendance.logDetails}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white whitespace-nowrap">{formatDate(rec.date)}</td>
                        <td className="py-4 px-6 text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">{getServiceTypeTranslation(rec.serviceType)}</td>
                        <td className="py-4 px-6 text-slate-700 dark:text-gray-300 font-bold whitespace-nowrap">{getLocationTranslation(rec.location)}</td>
                        <td className="py-4 px-6 text-sm font-black text-slate-900 dark:text-white">
                          <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-lg">
                            {rec.headcount}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-black">
                          {rec.newVisitors > 0 ? `+${rec.newVisitors}` : "0"}
                        </td>
                        <td className="py-4 px-6 text-slate-500 dark:text-gray-400 max-w-[220px] truncate" title={rec.notes}>
                          {getMockNotesTranslation(rec.notes) || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-gray-500 font-medium">
                        No service attendance records found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View (Visible on mobile screens) */}
          <div className="block md:hidden space-y-3">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((rec) => (
                <div key={rec.id} className="bg-white dark:bg-[#121324]/80 border border-slate-200/70 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {getLocationTranslation(rec.location)}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                        {getServiceTypeTranslation(rec.serviceType)}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                      {formatDate(rec.date)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                    <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">Headcount</span>
                      <p className="text-base font-black text-slate-900 dark:text-white">{rec.headcount}</p>
                    </div>
                    <div className="bg-emerald-50/50 dark:bg-emerald-500/10 p-2.5 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">New Visitors</span>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400">+{rec.newVisitors}</p>
                    </div>
                  </div>

                  {rec.notes && (
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium italic pt-1">
                      "{getMockNotesTranslation(rec.notes)}"
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-[#121324]/80 border border-slate-200/70 dark:border-white/[0.06] p-8 rounded-2xl text-center text-slate-400 dark:text-gray-500 text-xs font-medium">
                No attendance records match your search query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: EVENT ATTENDANCE TERMINAL ────────────────── */}
      {subView === "event-attendance" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of events */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-[#121324]/80 border border-slate-200/70 dark:border-white/[0.06] p-5 rounded-2xl shadow-sm backdrop-blur-xl space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" /> {t.attendance.chooseEvent}
              </h3>
              
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                {displayEvents.map(e => {
                  const checkinCount = (eventCheckins[e.id] || []).length;
                  const isSelected = currentEvent.id === e.id;
                  return (
                    <div 
                      key={e.id}
                      onClick={() => setSelectedEventId(e.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                        isSelected 
                          ? "bg-indigo-50/70 dark:bg-indigo-600/15 border-indigo-400/60 dark:border-indigo-500/50 shadow-sm" 
                          : "bg-slate-50/50 hover:bg-slate-100/70 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] border-slate-200/60 dark:border-white/[0.04]"
                      }`}
                    >
                      <div className="overflow-hidden pr-2">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{e.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-gray-400 font-semibold mt-0.5">{formatDate(e.date)}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300"
                      }`}>
                        {checkinCount} checkins
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Registrations check-ins list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#121324]/80 border border-slate-200/70 dark:border-white/[0.06] p-5 md:p-6 rounded-2xl shadow-sm backdrop-blur-xl space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {t.attendance.checkInTerminal}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 leading-tight">{currentEvent.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-semibold">
                    {t.dashboard.tableLocation}: {currentEvent.location} | {t.dashboard.tableDate}: {formatDate(currentEvent.date)}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06] min-w-[180px]">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-slate-600 dark:text-gray-300">Check-in Status</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">{activeCheckedInCount} / {users.length}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-300 rounded-full" style={{ width: `${checkinPercentage}%` }} />
                  </div>
                </div>
              </div>

              {/* Search & Filter Registrants */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search attendee by name..."
                    value={checkinSearch}
                    onChange={(e) => setCheckinSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="flex gap-1 bg-slate-100 dark:bg-white/[0.03] p-1 rounded-xl w-full sm:w-auto">
                  {(["ALL", "CHECKED_IN", "PENDING"] as const).map((filterOpt) => (
                    <button
                      key={filterOpt}
                      onClick={() => setCheckinFilter(filterOpt)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        checkinFilter === filterOpt
                          ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-gray-400 hover:text-slate-800"
                      }`}
                    >
                      {filterOpt === "ALL" ? "All" : filterOpt === "CHECKED_IN" ? "Checked In" : "Pending"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredUsers.map(user => {
                  const isCheckedIn = (eventCheckins[currentEvent.id] || []).includes(user.id);
                  return (
                    <div 
                      key={user.id}
                      onClick={() => handleToggleCheckin(currentEvent.id, user.id)}
                      className={`p-3.5 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isCheckedIn 
                          ? "border-emerald-300 dark:border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-500/10 shadow-sm" 
                          : "bg-slate-50/50 hover:bg-slate-100/70 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] border-slate-200/60 dark:border-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                          isCheckedIn ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300"
                        }`}>
                          {(user.name || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 font-semibold truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                        isCheckedIn 
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                          : "bg-white dark:bg-white/5 border-slate-300 dark:border-white/10"
                      }`}>
                        {isCheckedIn && (
                          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: REPORTS ────────────────── */}
      {subView === "reports" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121324]/80 border border-slate-200/70 dark:border-white/[0.06] p-5 md:p-6 rounded-2xl shadow-sm backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                {t.attendance.growthReports}
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-semibold">{t.attendance.analyticsSubtitle}</p>
            </div>
            <button 
              onClick={() => window.print()} 
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <Printer className="w-4 h-4" /> {language === "te" ? "నివేదికలను ప్రింట్ చేయి" : language === "hi" ? "रिपोर्ट प्रिंट करें" : "Print Reports"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#121324]/80 border border-slate-200/70 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm backdrop-blur-xl space-y-6">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-indigo-500" /> {t.attendance.monthlyHeadcountGrowth}
              </h3>

              {/* Bar Chart */}
              <div className="h-52 flex items-end justify-between gap-3 px-2 relative mb-6">
                {[
                  { month: "Jan", val: 510, height: "h-[50%]" },
                  { month: "Feb", val: 560, height: "h-[55%]" },
                  { month: "Mar", val: 620, height: "h-[62%]" },
                  { month: "Apr", val: 680, height: "h-[68%]" },
                  { month: "May", val: 780, height: "h-[78%]" },
                  { month: "Jun", val: 856, height: "h-[85%]" }
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <span className="absolute -top-7 text-[10px] font-black text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-500/30 shadow-sm z-10">{bar.val}</span>
                    <div className={`w-full bg-indigo-500/10 group-hover:bg-indigo-500/20 rounded-t-xl transition-colors flex items-end overflow-hidden ${bar.height} min-h-[8px]`}>
                      <div className="w-full bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t-xl" style={{ height: "100%" }} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400">{getMonthTranslation(bar.month)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#121324]/80 border border-slate-200/70 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm backdrop-blur-xl space-y-4">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" /> {t.attendance.executiveSummaryIndices}
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: t.attendance.attendanceRetentionRate, val: "92.4%", desc: t.attendance.retentionRateDesc },
                  { label: t.attendance.avgSundayAttendance, val: "680", desc: t.attendance.sundayAttendanceDesc },
                  { label: t.attendance.weeklyNewVisitorsAvg, val: "14", desc: t.attendance.newVisitorsAvgDesc },
                  { label: t.attendance.youthParticipationRate, val: "38.2%", desc: t.attendance.youthParticipationDesc }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4 text-xs font-semibold p-2.5 rounded-xl bg-slate-50/60 dark:bg-white/[0.02]">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.label}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-snug font-medium">{item.desc}</p>
                    </div>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-150 dark:border-indigo-500/20 shrink-0 shadow-sm">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD ATTENDANCE RECORD MODAL ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Record Service Attendance</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Enter attendance details for worship services or prayer meetings.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAttendance} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">Service Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">Service Program</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#191a32] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Sunday Worship Service">Sunday Worship Service</option>
                    <option value="Sunday Afternoon Prayer">Sunday Afternoon Prayer</option>
                    <option value="Friday Evening Prayer">Friday Evening Prayer</option>
                    <option value="Youth Special Fellowship">Youth Special Fellowship</option>
                    <option value="All Night Prayer Vigil">All Night Prayer Vigil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">Location</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#191a32] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Subhash Nagar Sanctuary">Subhash Nagar Sanctuary</option>
                    <option value="Shapur Location">Shapur Location</option>
                    <option value="Bahadurpally Location">Bahadurpally Location</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">Total Headcount</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.headcount}
                    onChange={(e) => setFormData({ ...formData, headcount: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">First-time Visitors</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.newVisitors}
                    onChange={(e) => setFormData({ ...formData, newVisitors: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">Notes / Highlights</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional service highlights..."
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-gray-300 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
