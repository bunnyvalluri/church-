"use client";

import React, { useState } from "react";
import { 
  Users, 
  DollarSign, 
  UserCheck, 
  Calendar, 
  UserPlus, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ChevronDown, 
  Sparkles,
  Megaphone,
  FileText,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface DashboardOverviewProps {
  onNavigate: (view: string) => void;
  searchTerm: string;
  users: any[];
  donations: any[];
  sermons: any[];
  events: any[];
  announcements: any[];
  attendanceRecords?: any[];
  onAddMember: (member: any) => void;
  onDeleteMember: (id: string | number) => void;
  onAddSermon: (sermon: any) => void;
  onDeleteSermon: (id: string) => void;
  onOpenAddMember?: () => void;
  onOpenAddSermon?: () => void;
  onOpenAddDonation?: () => void;
  onOpenAddEvent?: () => void;
  onOpenAddAnnouncement?: () => void;
  onOpenAddAttendance?: () => void;
}

export default function DashboardOverview({
  onNavigate,
  searchTerm,
  users,
  donations,
  sermons,
  events,
  announcements,
  attendanceRecords = [],
  onAddMember,
  onDeleteMember,
  onAddSermon,
  onDeleteSermon,
  onOpenAddMember,
  onOpenAddSermon,
  onOpenAddDonation,
  onOpenAddEvent,
  onOpenAddAnnouncement,
  onOpenAddAttendance
}: DashboardOverviewProps) {
  const { language } = useLanguage();
  const t = adminTranslations[language || "en"].dashboard;
  const [activeContentTab, setActiveContentTab] = useState<"Sermons" | "Events" | "Announcements">("Sermons");
  
  const completedDonations = donations.filter(d => d.status === "COMPLETED");

  const totalMembers = users.length;
  const totalDonations = completedDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  // Dynamic Attendance Calculations
  // Sum all headcounts for the "total attendance" KPI (represents all recorded services)
  const totalHeadcount = attendanceRecords.reduce((sum, r) => sum + (r.headcount || 0), 0);
  const latestAttendance = totalHeadcount;
  const latestNewVisitors = attendanceRecords.reduce((sum, r) => sum + (r.newVisitors || 0), 0);
  const avgAttendance = attendanceRecords.length > 0
    ? Math.round(attendanceRecords.reduce((sum, r) => sum + r.headcount, 0) / attendanceRecords.length)
    : 0;

  const maxRecord = attendanceRecords.length > 0
    ? attendanceRecords.reduce((max, r) => r.headcount > max.headcount ? r : max, attendanceRecords[0])
    : null;
  const highestDayName = maxRecord
    ? new Date(maxRecord.date).toLocaleDateString(language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-US", { weekday: 'long' })
    : "-";

  const latestReturningVisitors = latestNewVisitors > 0
    ? Math.max(0, totalHeadcount - latestNewVisitors)
    : attendanceRecords[0]
    ? Math.max(0, attendanceRecords[0].headcount - (attendanceRecords[0].newVisitors || 0))
    : 0;

  const newUsersCount = users.filter(u => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(u.createdAt) > oneWeekAgo;
  }).length;

  // Weekly growth / change calculations
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

  // Donation percentage change this week vs previous week (for KPI card 2)
  const thisWeekDonations = completedDonations
    .filter(d => new Date(d.createdAt).getTime() >= sevenDaysAgo)
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const prevWeekDonations = completedDonations
    .filter(d => {
      const time = new Date(d.createdAt).getTime();
      return time >= fourteenDaysAgo && time < sevenDaysAgo;
    })
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  let donWeeklyPercentChange = 0;
  if (prevWeekDonations > 0) {
    donWeeklyPercentChange = Math.round(((thisWeekDonations - prevWeekDonations) / prevWeekDonations) * 100);
  } else if (thisWeekDonations > 0) {
    donWeeklyPercentChange = 100;
  }

  // Donation Overview monthly percentage change (for Donation Overview panel)
  const currentMonthDonations = completedDonations
    .filter(d => new Date(d.createdAt).getTime() >= thirtyDaysAgo)
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const previousMonthDonations = completedDonations
    .filter(d => {
      const time = new Date(d.createdAt).getTime();
      return time >= sixtyDaysAgo && time < thirtyDaysAgo;
    })
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  let donPercentChange = 0;
  if (previousMonthDonations > 0) {
    donPercentChange = Math.round(((currentMonthDonations - previousMonthDonations) / previousMonthDonations) * 100);
  } else if (currentMonthDonations > 0) {
    donPercentChange = 100;
  }

  // Weekly Attendance percentage change (latest week vs previous week)
  const latestAtt = attendanceRecords[0]?.headcount || 0;
  const prevAtt = attendanceRecords[1]?.headcount || 0;
  let attPercentChange = 0;
  if (prevAtt > 0) {
    attPercentChange = Math.round(((latestAtt - prevAtt) / prevAtt) * 100);
  } else if (latestAtt > 0) {
    attPercentChange = 100;
  }

  // Donation Chart SVG Coordinates Calculation
  const sortedDonations = [...completedDonations].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const chartDonations = sortedDonations.slice(-10);
  const N = chartDonations.length;

  let linePath = "M 0 90 L 300 90"; 
  let areaPath = "M 0 90 L 300 90 L 300 100 L 0 100 Z";
  let lastX = 300;
  let lastY = 90;

  if (N > 0) {
    const maxAmount = Math.max(...chartDonations.map(d => Number(d.amount) || 0), 100);
    const points = chartDonations.map((d, idx) => {
      const x = N > 1 ? (idx / (N - 1)) * 300 : 150;
      const val = Number(d.amount) || 0;
      const y = 90 - (val / maxAmount) * 75; 
      return { x, y };
    });

    lastX = points[points.length - 1].x;
    lastY = points[points.length - 1].y;

    if (N === 1) {
      linePath = `M 0 ${points[0].y} L 300 ${points[0].y}`;
      areaPath = `M 0 ${points[0].y} L 300 ${points[0].y} L 300 100 L 0 100 Z`;
    } else {
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
      areaPath = linePath + ` L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;
    }
  }

  const startLabel = N > 0 
    ? new Date(chartDonations[0].createdAt).toLocaleDateString(language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-US", { month: "short", day: "numeric" })
    : "";
  const endLabel = N > 0 
    ? new Date(chartDonations[N - 1].createdAt).toLocaleDateString(language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-US", { month: "short", day: "numeric" })
    : "";
  const midLabel = N > 2 
    ? new Date(chartDonations[Math.floor(N / 2)].createdAt).toLocaleDateString(language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-US", { month: "short", day: "numeric" })
    : "";


  // Filter lists based on global search term
  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSermons = sermons.filter(s => 
    (s.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.speaker || s.pastor || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to generate avatar gradient based on initials/role
  const getAvatarGradient = (name: string, role: string) => {
    if (role === "SUPER_ADMIN") return "from-violet-500 to-indigo-600";
    if (role === "ADMIN") return "from-indigo-400 to-indigo-600";
    if (role === "PASTOR") return "from-blue-500 to-indigo-500";
    
    // Fallback based on name initials
    const charCode = name.charCodeAt(0) || 0;
    if (charCode % 3 === 0) return "from-emerald-400 to-teal-650";
    if (charCode % 3 === 1) return "from-sky-400 to-blue-550";
    return "from-purple-400 to-indigo-500";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* ─── KPI Metric Cards Grid ─── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        
        {/* Card 1: Members */}
        <div className="group bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-lg dark:shadow-black/20 backdrop-blur-xl p-6 rounded-2xl flex items-center justify-between gap-4 hover:-translate-y-1 hover:border-emerald-300/60 dark:hover:border-emerald-500/30 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-black/40 transition-all duration-300 cursor-pointer" onClick={() => onNavigate("members")}>
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-gray-550 uppercase tracking-wider">{t.totalMembers}</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{totalMembers.toLocaleString()}</h3>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
              <ArrowUp className="w-3 h-3 stroke-[2.5]" />
              <span>+{newUsersCount} {t.thisWeek}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:scale-110">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Donations */}
        <div className="group bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-lg dark:shadow-black/20 backdrop-blur-xl p-6 rounded-2xl flex items-center justify-between gap-4 hover:-translate-y-1 hover:border-amber-300/60 dark:hover:border-amber-500/30 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-black/40 transition-all duration-300 cursor-pointer" onClick={() => onNavigate("donations")}>
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{t.totalDonations}</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{formatCurrency(totalDonations)}</h3>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              donWeeklyPercentChange >= 0 
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20" 
                : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-100 dark:border-rose-500/20"
            }`}>
              {donWeeklyPercentChange >= 0 ? <ArrowUp className="w-3 h-3 stroke-[2.5]" /> : <ArrowDown className="w-3 h-3 stroke-[2.5]" />}
              <span>{donWeeklyPercentChange >= 0 ? `+${donWeeklyPercentChange}` : donWeeklyPercentChange}% {t.thisWeek}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:scale-110">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Attendance */}
        <div className="group bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-lg dark:shadow-black/20 backdrop-blur-xl p-6 rounded-2xl flex items-center justify-between gap-4 hover:-translate-y-1 hover:border-blue-300/60 dark:hover:border-blue-500/30 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-black/40 transition-all duration-300 cursor-pointer" onClick={() => onNavigate("reports")}>
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-gray-555 uppercase tracking-wider">{t.attendanceWeek}</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{latestAttendance.toLocaleString()}</h3>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              attPercentChange >= 0 
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20" 
                : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-100 dark:border-rose-500/20"
            }`}>
              {attPercentChange >= 0 ? <ArrowUp className="w-3 h-3 stroke-[2.5]" /> : <ArrowDown className="w-3 h-3 stroke-[2.5]" />}
              <span>{attPercentChange >= 0 ? `+${attPercentChange}` : attPercentChange}% {t.thisWeek}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:scale-110">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Events */}
        <div className="group bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-lg dark:shadow-black/20 backdrop-blur-xl p-6 rounded-2xl flex items-center justify-between gap-4 hover:-translate-y-1 hover:border-pink-300/60 dark:hover:border-pink-500/30 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-black/40 transition-all duration-300 cursor-pointer" onClick={() => onNavigate("events")}>
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-gray-555 uppercase tracking-wider">{t.activeEvents}</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{events.length}</h3>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border border-slate-150 dark:border-white/[0.08] uppercase tracking-wider">
              <span>{t.upcomingEvents}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:scale-110">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Card 5: New Members */}
        <div className="group bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-lg dark:shadow-black/20 backdrop-blur-xl p-6 rounded-2xl flex items-center justify-between gap-4 hover:-translate-y-1 hover:border-teal-300/60 dark:hover:border-teal-500/30 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-black/40 transition-all duration-300 cursor-pointer" onClick={() => onNavigate("members")}>
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{t.newMembers}</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{newUsersCount}</h3>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
              <ArrowUp className="w-3 h-3 stroke-[2.5]" />
              <span>+{newUsersCount} {t.thisWeek}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:scale-110">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
      </section>
      {/* ─── Middle Section Grid ─── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* 1. Member Management Panel */}
        <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.015)] dark:shadow-xl dark:shadow-black/30 backdrop-blur-xl rounded-2xl flex flex-col justify-between overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-500/10 transition-all duration-300">
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{t.memberManagement}</h3>
              <h2 className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">{t.recentMembers}</h2>
            </div>
            <button onClick={() => onNavigate("members")} className="text-xs font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 hover:underline transition-colors">{t.viewAll}</button>
          </div>
          
          <div className="p-6 py-4 space-y-4 flex-1">
            {filteredUsers.slice(0, 5).map(member => (
              <div key={member.id} className="flex items-center justify-between gap-3 border-b border-slate-50 dark:border-white/[0.02] pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(member.name || "Believer", member.role)} text-white flex items-center justify-center font-bold text-sm shrink-0 uppercase shadow-md border border-white/10 hover:scale-105 transition-transform`}>
                    {(member.name || "M").substring(0, 2)}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{member.name || (language === "te" ? "సభ్యుడు" : language === "hi" ? "सदस्य" : "Believer")}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-gray-400 truncate mt-0.5">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${
                    member.role === "SUPER_ADMIN" || member.role === "ADMIN"
                      ? "bg-violet-50 dark:bg-violet-500/10 text-violet-750 dark:text-violet-400 border-violet-100 dark:border-violet-500/20" 
                      : member.role === "PASTOR" 
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-7.5 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
                      : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-750 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                  }`}>
                    {member.role === "SUPER_ADMIN" ? "S.Admin" : member.role}
                  </span>
                  <button onClick={() => onDeleteMember(member.id)} className="w-7 h-7 rounded-lg text-slate-450 dark:text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/15 flex items-center justify-center transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-center text-xs text-slate-400 dark:text-gray-500 py-6">{t.noMatchingMembers}</p>
            )}
          </div>
          
          <div className="p-6 pt-0">
            <button onClick={onOpenAddMember} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]">
              <Plus className="w-4 h-4" /> {t.addNewMember}
            </button>
          </div>
        </div>

        {/* 2. Donation Tracking Panel */}
        <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.015)] dark:shadow-xl dark:shadow-black/30 backdrop-blur-xl rounded-2xl flex flex-col justify-between overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-500/10 transition-all duration-300">
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-gray-550 uppercase tracking-wider">{t.donationTracking}</h3>
              <h2 className="text-base font-extrabold text-slate-955 dark:text-white mt-0.5">{t.donationOverview}</h2>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 dark:bg-[#16172D]/60 border border-slate-100 dark:border-white/[0.08] rounded-xl text-[10px] font-bold text-slate-700 dark:text-gray-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1e203e] transition-colors">
              <span>{t.thisMonth}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>
          </div>
          
          <div className="p-6 py-4 flex-1 flex flex-col justify-between">
            <div className="flex items-baseline gap-2 mb-3">
              <span className={`text-[10px] font-bold inline-flex items-center ${donPercentChange >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {donPercentChange >= 0 ? `▲ +${donPercentChange}` : `▼ ${donPercentChange}`}% {t.fromLastMonth}
              </span>
            </div>
            
            {/* SVG Line Chart with Gridlines & Glowing path */}
            <div className="h-28 w-full relative mb-5">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dbChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal reference gridlines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor" strokeDasharray="3,3" className="text-slate-100 dark:text-white/[0.03]" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" strokeDasharray="3,3" className="text-slate-100 dark:text-white/[0.03]" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="currentColor" strokeDasharray="3,3" className="text-slate-100 dark:text-white/[0.03]" />
                
                {/* Path Area */}
                <path d={areaPath} fill="url(#dbChartGrad)" />
                {/* Glowing stroke path */}
                <path d={linePath} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" className="filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.25)]" />
                {/* End Point Dot */}
                <circle cx={lastX} cy={lastY} r="4.5" fill="#F59E0B" stroke="currentColor" className="text-white dark:text-[#121324] shadow-md" strokeWidth="1.5" />
              </svg>
              <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-gray-550 mt-1 px-1">
                <span>{startLabel}</span>
                <span>{midLabel}</span>
                <span>{endLabel}</span>
              </div>
            </div>
            {/* Recent Donations List */}
            <div className="space-y-3">
              {completedDonations.slice(0, 3).map((don, idx) => (
                <div key={don.id || idx} className="flex items-center justify-between text-xs font-semibold border-b border-slate-50 dark:border-white/[0.02] pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-slate-900 dark:text-white truncate max-w-[140px] font-bold">{don.donorName || (language === "te" ? "అనామకుడు" : language === "hi" ? "गुमनाम" : "Anonymous")}</p>
                    <p className="text-[9px] text-slate-400 dark:text-gray-500 mt-0.5">{new Date(don.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-amber-600 dark:text-amber-400 font-black">{formatCurrency(don.amount)}</p>
                    <span className="inline-block text-[8px] font-black tracking-wider uppercase bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/15 px-1.5 py-0.5 rounded mt-0.5">{don.purpose}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 pt-0">
            <button onClick={() => onNavigate("donations")} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]">
              {t.viewAllDonations}
            </button>
          </div>
        </div>

        {/* 3. Attendance Records Panel */}
        <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.015)] dark:shadow-xl dark:shadow-black/30 backdrop-blur-xl rounded-2xl flex flex-col justify-between overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-500/10 transition-all duration-300">
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{t.attendanceRecords}</h3>
              <h2 className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">{t.attendanceOverview}</h2>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 dark:bg-[#16172D]/60 border border-slate-100 dark:border-white/[0.08] rounded-xl text-[10px] font-bold text-slate-700 dark:text-gray-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1e203e] transition-colors">
              <span>{t.thisWeek}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>
          </div>
          <div className="p-6 py-4 flex-1 flex flex-col justify-between">
            {/* Bar Chart with Gridlines & tooltips */}
            <div className="h-32 flex items-end justify-between gap-3 px-2 relative mb-6">
              
              {/* Thin background reference gridlines */}
              <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none z-0">
                <div className="w-full border-t border-slate-100 dark:border-white/[0.03]" />
                <div className="w-full border-t border-slate-100 dark:border-white/[0.03]" />
                <div className="w-full border-t border-slate-100 dark:border-white/[0.03]" />
              </div>

              {(() => {
                // Get latest 7 records (in chronological order for graph)
                const chartRecords = [...attendanceRecords].slice(0, 7).reverse();
                
                // If we have records, map them to the bar chart
                // Use the max headcount from actual records for auto-scaling
                const maxHeadcount = Math.max(...chartRecords.map(r => r.headcount || 0), 1);
                const barData = chartRecords.map((rec) => {
                  const dateObj = new Date(rec.date);
                  const dayLabel = dateObj.toLocaleDateString(
                    language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-US",
                    { weekday: 'short' }
                  );
                  const heightPercent = Math.min(100, Math.round((rec.headcount / maxHeadcount) * 100));
                  return {
                    day: dayLabel,
                    val: rec.headcount,
                    style: { height: `${heightPercent}%` }
                  };
                });
                
                                // Fallback if no records
                const defaultBars = [
                  { day: language === "te" ? "సోమ" : language === "hi" ? "సోమ" : "Mon", val: 0, style: { height: "4px" } },
                  { day: language === "te" ? "మం" : language === "hi" ? "मंगल" : "Tue", val: 0, style: { height: "4px" } },
                  { day: language === "te" ? "బుధ" : language === "hi" ? "బుధ" : "Wed", val: 0, style: { height: "4px" } },
                  { day: language === "te" ? "గురు" : language === "hi" ? "गुरु" : "Thu", val: 0, style: { height: "4px" } },
                  { day: language === "te" ? "శుక్ర" : language === "hi" ? "शुक्र" : "Fri", val: 0, style: { height: "4px" } },
                  { day: language === "te" ? "శని" : language === "hi" ? "శని" : "Sat", val: 0, style: { height: "4px" } },
                  { day: language === "te" ? "ఆది" : language === "hi" ? "రవి" : "Sun", val: 0, style: { height: "4px" } }
                ];
                
                const displayBars = barData.length > 0 ? barData : defaultBars;

                return displayBars.map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative z-10">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[9px] font-black px-2 py-0.5 rounded shadow-md pointer-events-none transition-all duration-200 z-20 whitespace-nowrap">
                      {bar.val}
                    </div>
                    
                    <div className="w-full bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] hover:bg-[#6366F1]/10 dark:hover:bg-[#6366F1]/10 rounded-t-xl transition-all flex items-end overflow-hidden h-24 min-h-[4px] cursor-pointer">
                      <div className="w-full bg-gradient-to-t from-blue-600 to-sky-400 dark:from-blue-500 dark:to-sky-450 rounded-t-xl transition-all duration-500 group-hover:brightness-105" style={bar.style} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-gray-550">{bar.day}</span>
                  </div>
                ));
              })()}
            </div>
            
            {/* Metrics List */}
            <div className="space-y-3">
              {[
                { label: t.totalAttendance, val: latestAttendance.toLocaleString() },
                { label: t.averageDaily, val: avgAttendance.toLocaleString() },
                { label: t.highestDay, val: highestDayName, highlight: true },
                { label: t.newVisitors, val: latestNewVisitors.toLocaleString() },
                { label: t.returningVisitors, val: latestReturningVisitors.toLocaleString() }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-semibold border-b border-slate-50 dark:border-white/[0.02] pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-500 dark:text-gray-400">{stat.label}</span>
                  <span className={`font-bold ${stat.highlight ? "text-indigo-650 dark:text-indigo-400 font-extrabold" : "text-slate-900 dark:text-white"}`}>{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 pt-0">
            <button onClick={() => onNavigate("reports")} className="w-full py-3 bg-white hover:bg-slate-50 dark:bg-white/[0.02] hover:dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-indigo-600 dark:text-indigo-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]">
              {t.viewFullReport}
            </button>
          </div>
        </div>
      </section>

      {/* ─── Bottom Section Grid ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Content Management Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.015)] dark:shadow-xl dark:shadow-black/30 backdrop-blur-xl rounded-2xl flex flex-col justify-between overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-500/10 transition-all duration-300">
          <div className="p-6 pb-2 border-b border-slate-100 dark:border-white/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{t.contentManagement}</h3>
              {/* Premium segmented tab controls */}
              <div className="p-1 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl flex gap-1 mt-3.5 inline-flex">
                {(["Sermons", "Events", "Announcements"] as const).map((tab) => {
                  const isActive = activeContentTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveContentTab(tab)}
                      className={`px-4 py-1.5 text-xs font-bold transition-all rounded-lg ${
                        isActive 
                          ? "bg-white dark:bg-white/[0.06] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-white/[0.02]" 
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      {tab === "Sermons" ? t.sermons : tab === "Events" ? t.events : t.announcements}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Context-aware action button */}
            {activeContentTab === "Sermons" && (
              <button onClick={onOpenAddSermon} className="py-2.5 px-4 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-500/10 hover:shadow-lg hover:shadow-pink-500/20 transition-all active:scale-[0.98]">
                <Plus className="w-4 h-4" /> {t.addNewSermon}
              </button>
            )}
            {activeContentTab === "Events" && (
              <button onClick={() => onNavigate("events")} className="py-2.5 px-4 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-500/10 hover:shadow-lg hover:shadow-pink-500/20 transition-all active:scale-[0.98]">
                <Plus className="w-4 h-4" /> {t.createEvent}
              </button>
            )}
            {activeContentTab === "Announcements" && (
              <button onClick={() => onNavigate("announcements")} className="py-2.5 px-4 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-500/10 hover:shadow-lg hover:shadow-pink-500/20 transition-all active:scale-[0.98]">
                <Plus className="w-4 h-4" /> {t.addAnnouncement}
              </button>
            )}
          </div>

          {/* Table contents with beautiful empty state */}
          <div className="flex-1 overflow-x-auto">
            {activeContentTab === "Sermons" && (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                    <th className="py-4 px-6">{t.tableTitle}</th>
                    <th className="py-4 px-6">{t.tableSpeaker}</th>
                    <th className="py-4 px-6">{t.tableDate}</th>
                    <th className="py-4 px-6">{t.tableCategory}</th>
                    <th className="py-4 px-6">{t.tableViews}</th>
                    <th className="py-4 px-6 text-right">{t.tableActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02] text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {filteredSermons.slice(0, 4).map((sermon) => (
                    <tr key={sermon.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0 shadow-md border border-white/10">
                          {(sermon.title || "SR").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px]">{sermon.title}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-650 dark:text-gray-400">{sermon.pastor || sermon.speaker || (language === "te" ? "ప్రసంగకర్త" : language === "hi" ? "प्रचारक" : "Speaker")}</td>
                      <td className="py-4 px-6 text-slate-500 dark:text-gray-400">{new Date(sermon.date).toLocaleDateString("en-IN")}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-slate-50 dark:bg-white/[0.04] text-slate-750 dark:text-gray-300 border border-slate-200 dark:border-white/[0.06] rounded-lg text-[10px] font-bold">{sermon.category}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-gray-400">{sermon.views || 0}</td>
                      <td className="py-4 px-6 text-right space-x-1 shrink-0 whitespace-nowrap">
                        <button onClick={() => onNavigate("sermons")} className="p-1.5 text-slate-450 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.04] inline-flex items-center"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => onDeleteSermon(sermon.id)} className="p-1.5 text-slate-450 dark:text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/15 inline-flex items-center"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredSermons.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 px-6">
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                            <FileText className="w-8 h-8 animate-pulse" />
                          </div>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{t.noSermons}</h3>
                          <p className="text-xs text-slate-400 dark:text-gray-500 max-w-xs mt-1 leading-relaxed">
                            {language === "te" 
                              ? "ప్రసంగాలను జోడించడానికి పైన ఉన్న బటన్‌ను క్లిక్ చేయండి." 
                              : language === "hi" 
                              ? "उपदेश जोड़ने के लिए ऊपर दिए गए बटन पर क्लिक करें।" 
                              : "Upload recorded video or audio files of church sermons to build your digital archive."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeContentTab === "Events" && (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                    <th className="py-4 px-6">{t.tableTitle}</th>
                    <th className="py-4 px-6">{t.tableLocation}</th>
                    <th className="py-4 px-6">{t.tableTime}</th>
                    <th className="py-4 px-6">{t.tableCategory}</th>
                    <th className="py-4 px-6 text-right">{t.tableActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02] text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {events.slice(0, 4).map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">{evt.title}</td>
                      <td className="py-4 px-6 text-slate-650 dark:text-gray-400">{evt.location}</td>
                      <td className="py-4 px-6 text-slate-500 dark:text-gray-400">{evt.time}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-750 dark:text-amber-300 rounded-lg text-[10px] font-bold border border-amber-200/50 dark:border-amber-500/20">{evt.category}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => onNavigate("events")} className="p-1.5 text-slate-450 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.04] inline-flex items-center"><Eye className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 px-6">
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-100 dark:border-amber-500/20 shadow-sm">
                            <Calendar className="w-8 h-8 animate-pulse" />
                          </div>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {language === "te" ? "కార్యక్రమాలు లేవు" : language === "hi" ? "कोई कार्यक्रम नहीं" : "No Events Found"}
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-gray-500 max-w-xs mt-1 leading-relaxed">
                            {language === "te" 
                              ? "నూతన చర్చి క్యాలెండర్ ఈవెంట్లను షెడ్యూల్ చేయండి." 
                              : language === "hi" 
                              ? "नए चर्च कैलेंडर कार्यक्रमों को शेड्यूल करें।" 
                              : "Schedule upcoming special services, youth events, and community activities."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeContentTab === "Announcements" && (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                    <th className="py-4 px-6">{t.tableTitle}</th>
                    <th className="py-4 px-6">{t.tableContent}</th>
                    <th className="py-4 px-6">{t.tablePriority}</th>
                    <th className="py-4 px-6 text-right">{t.tableActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02] text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {announcements.slice(0, 4).map((anc) => (
                    <tr key={anc.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">{anc.title}</td>
                      <td className="py-4 px-6 text-slate-650 dark:text-gray-400 truncate max-w-[200px]">{anc.content}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                          anc.priority === "HIGH" || anc.priority === "URGENT" 
                            ? "bg-rose-50 dark:bg-rose-500/10 text-rose-750 dark:text-rose-450 border-rose-100 dark:border-rose-500/20" 
                            : "bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-gray-400 border-slate-150 dark:border-white/[0.08]"
                        }`}>{anc.priority}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => onNavigate("announcements")} className="p-1.5 text-slate-450 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.04] inline-flex items-center"><Eye className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {announcements.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 px-6">
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-pink-50 dark:bg-pink-500/10 text-pink-500 flex items-center justify-center mb-4 border border-pink-100 dark:border-pink-500/20 shadow-sm">
                            <Megaphone className="w-8 h-8 animate-pulse" />
                          </div>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {language === "te" ? "ప్రకటనలు లేవు" : language === "hi" ? "कोई घोषणा नहीं" : "No Announcements Found"}
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-gray-500 max-w-xs mt-1 leading-relaxed">
                            {language === "te" 
                              ? "నూతన సమాచార ప్రసారాలను ఇక్కడ పోస్ట్ చేయండి." 
                              : language === "hi" 
                              ? "नया सूचना प्रसारण यहाँ पोस्ट करें।" 
                              : "Broadcast important updates, prayer alerts, or general news to all church members."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.015)] dark:shadow-xl dark:shadow-black/30 backdrop-blur-xl rounded-2xl flex flex-col justify-between overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-500/10 transition-all duration-300">
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/[0.04]">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{t.churchOperations}</h3>
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">{t.quickActions}</h2>
          </div>
          
          <div className="p-6 py-5 flex-1 space-y-3">
            {[
              { label: t.addNewMember, icon: UserPlus, color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/25", activeColor: "group-hover:border-emerald-300 group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-500/5", border: "border-l-[3.5px] border-l-emerald-500", act: onOpenAddMember },
              { label: t.recordDonation, icon: DollarSign, color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/25", activeColor: "group-hover:border-amber-300 group-hover:bg-amber-50/50 dark:group-hover:bg-amber-500/5", border: "border-l-[3.5px] border-l-amber-500", act: onOpenAddDonation },
              { label: t.markAttendance, icon: UserCheck, color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/25", activeColor: "group-hover:border-blue-300 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-500/5", border: "border-l-[3.5px] border-l-blue-500", act: onOpenAddAttendance },
              { label: t.createEvent, icon: Calendar, color: "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-500/25", activeColor: "group-hover:border-pink-300 group-hover:bg-pink-50/50 dark:group-hover:bg-pink-500/5", border: "border-l-[3.5px] border-l-pink-500", act: onOpenAddEvent },
              { label: t.addAnnouncement, icon: Megaphone, color: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/25", activeColor: "group-hover:border-violet-300 group-hover:bg-violet-50/50 dark:group-hover:bg-violet-500/5", border: "border-l-[3.5px] border-l-violet-500", act: onOpenAddAnnouncement }
            ].map((actItem, idx) => (
              <button 
                key={idx}
                onClick={actItem.act}
                className={`w-full flex items-center justify-between p-3.5 bg-slate-50/40 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-2xl transition-all text-left group hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(99,102,241,0.04)] ${actItem.border} ${actItem.activeColor}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${actItem.color} border flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform`}>
                    <actItem.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-gray-300 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">{actItem.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-350 dark:text-gray-600 group-hover:translate-x-1 group-hover:text-indigo-500 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
