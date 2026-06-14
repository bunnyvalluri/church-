"use client";

import React, { useState } from "react";
import { UserCheck, Calendar, BarChart2, Plus, Users, Printer, TrendingUp, Sparkles, Filter, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface AttendanceManagementProps {
  events: any[];
  users: any[];
  records: AttendanceRecord[];
  onAddAttendance?: (rec: any) => void;
  onOpenAddAttendance?: () => void;
  activeSubTab?: "records" | "event-attendance" | "reports";
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
  onAddAttendance,
  onOpenAddAttendance,
  activeSubTab = "records" 
}: AttendanceManagementProps) {
  const [subView, setSubView] = useState<"records" | "event-attendance" | "reports">(activeSubTab);
  React.useEffect(() => {
    setSubView(activeSubTab);
  }, [activeSubTab]);
  const { language } = useLanguage();
  const t = adminTranslations[language as keyof typeof adminTranslations] || adminTranslations.en;

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
      case "Mar": return language === "te" ? "మార్చి" : language === "hi" ? "మార్्च" : "Mar";
      case "Apr": return language === "te" ? "ఏప్రి" : language === "hi" ? "अप्रैल" : "Apr";
      case "May": return language === "te" ? "మే" : language === "hi" ? "मई" : "May";
      case "Jun": return language === "te" ? "జూన్" : language === "hi" ? "जून" : "Jun";
      default: return month;
    }
  };

  // Event check-ins
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "evt_worship_sun");
  
  // Seed some checkins
  const [eventCheckins, setEventCheckins] = useState<Record<string, string[]>>({
    "evt_worship_sun": ["usr_1", "usr_2", "usr_3"],
    "evt_youth_camp": ["usr_1", "usr_5"],
    "evt_all_night_prayer": ["usr_2"]
  });

  const handleToggleCheckin = (eventId: string, userId: string) => {
    setEventCheckins(prev => {
      const current = prev[eventId] || [];
      const updated = current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId];
      return { ...prev, [eventId]: updated };
    });
  };

  const currentEvent = events.find(e => e.id === selectedEventId) || events[0] || { title: "Worship Program", id: "evt_worship_sun" };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─── Sub Navigation Tabs ─── */}
      <div className="p-1 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-2xl flex gap-1 items-center w-max max-w-full overflow-x-auto select-none scrollbar-none shadow-sm">
        {[
          { id: "records", label: t.attendance.attendanceTab, icon: UserCheck },
          { id: "event-attendance", label: t.attendance.terminalTab, icon: Calendar },
          { id: "reports", label: t.attendance.reportsTab, icon: BarChart2 }
        ].map((tab) => {
          const isSelected = subView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${
                isSelected
                  ? "bg-white dark:bg-white/[0.06] text-[#6366F1] dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-white/[0.02]"
                  : "text-slate-400 hover:text-slate-650 dark:hover:text-gray-300 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ────────────────── SUB-VIEW: RECORDS ────────────────── */}
      {subView === "records" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-950 dark:text-white tracking-tight uppercase">{t.attendance.attendanceRecords}</h2>
              <p className="text-xs text-slate-450 dark:text-gray-500 mt-1 font-semibold">{t.attendance.recordsSubtitle}</p>
            </div>
            <button 
              onClick={onOpenAddAttendance} 
              className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4.5 h-4.5" /> {t.attendance.recordServiceAttendance}
            </button>
          </div>

          <div className="border border-slate-100 dark:border-white/[0.05] bg-white dark:bg-[#121324]/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] font-bold text-slate-450 dark:text-gray-550 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                    <th className="py-4.5 px-6">{t.attendance.serviceDate}</th>
                    <th className="py-4.5 px-6">{t.attendance.serviceProgram}</th>
                    <th className="py-4.5 px-6">{t.attendance.churchLocation}</th>
                    <th className="py-4.5 px-6">{t.attendance.totalBelievers}</th>
                    <th className="py-4.5 px-6">{t.attendance.newVisitors}</th>
                    <th className="py-4.5 px-6">{t.attendance.logDetails}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/35 dark:hover:bg-[#16172D]/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{formatDate(rec.date)}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-gray-400 font-bold">{getServiceTypeTranslation(rec.serviceType)}</td>
                      <td className="py-4 px-6 text-indigo-650 dark:text-indigo-400 font-bold">{getLocationTranslation(rec.location)}</td>
                      <td className="py-4 px-6 text-sm font-extrabold text-slate-900 dark:text-white">{rec.headcount}</td>
                      <td className="py-4 px-6 text-emerald-600 dark:text-emerald-450 font-black">+{rec.newVisitors}</td>
                      <td className="py-4 px-6 text-slate-400 dark:text-gray-550 max-w-[200px] truncate" title={rec.notes}>{getMockNotesTranslation(rec.notes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: EVENT ATTENDANCE ────────────────── */}
      {subView === "event-attendance" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of events */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-3">
              <h3 className="text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-[#6366F1]" /> {t.attendance.chooseEvent}
              </h3>
              
              <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1.5 custom-scrollbar">
                {events.map(e => {
                  const checkinCount = (eventCheckins[e.id] || []).length;
                  const isSelected = selectedEventId === e.id;
                  return (
                    <div 
                      key={e.id}
                      onClick={() => setSelectedEventId(e.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                        isSelected 
                          ? "bg-indigo-50/35 dark:bg-indigo-500/5 border-indigo-500/55 dark:border-indigo-500/40 shadow-[0_2px_8px_rgba(99,102,241,0.05)]" 
                          : "bg-slate-50/45 hover:bg-slate-50 dark:bg-[#16172D]/30 dark:hover:bg-[#16172D]/50 border-slate-150/60 dark:border-white/[0.04] hover:border-slate-250"
                      }`}
                    >
                      <div className="overflow-hidden pr-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{e.title}</h4>
                        <p className="text-[9px] text-slate-400 dark:text-gray-550 font-semibold mt-0.5">{formatDate(e.date)}</p>
                      </div>
                      <span className="text-[9px] font-extrabold text-[#6366F1] bg-[#6366F1]/10 border border-indigo-100/30 px-2.5 py-0.5 rounded-full shrink-0">
                        {checkinCount} {t.attendance.checkins}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Registrations check-ins list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-5">
              <div>
                <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-755 dark:text-indigo-400 border border-indigo-100/50 rounded-lg text-[8px] font-bold uppercase tracking-wider">{t.attendance.checkInTerminal}</span>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white mt-2.5 leading-none">{currentEvent.title}</h3>
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-1.5 font-semibold">{t.dashboard.tableLocation}: {currentEvent.location} | {t.dashboard.tableDate}: {formatDate(currentEvent.date)}</p>
              </div>

              <hr className="border-t border-slate-100 dark:border-white/[0.03]" />

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-450 dark:text-gray-550 uppercase tracking-wider">{t.attendance.registrantsRoster}</h4>
                
                <div className="grid md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {users.map(user => {
                    const isCheckedIn = (eventCheckins[currentEvent.id] || []).includes(user.id);
                    return (
                      <div 
                        key={user.id}
                        onClick={() => handleToggleCheckin(currentEvent.id, user.id)}
                        className={`p-3.5 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isCheckedIn 
                            ? "border-emerald-250 dark:border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-500/5 shadow-sm" 
                            : "bg-slate-50/45 hover:bg-slate-50 dark:bg-[#16172D]/30 dark:hover:bg-[#16172D]/50 border-slate-150/60 dark:border-white/[0.04] hover:border-slate-250"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-all duration-300 ${
                            isCheckedIn ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10" : "bg-slate-200 dark:bg-white/[0.03] text-slate-700 dark:text-gray-400"
                          }`}>
                            {(user.name || "U").substring(0, 2)}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</h4>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className={`w-5.5 h-5.5 rounded-xl border flex items-center justify-center transition-all duration-200 shrink-0 ${
                          isCheckedIn 
                            ? "bg-gradient-to-tr from-emerald-400 to-teal-500 border-transparent text-white shadow-md shadow-emerald-500/15" 
                            : "bg-white dark:bg-white/[0.02] border-slate-300 dark:border-white/[0.08]"
                        }`}>
                          {isCheckedIn && (
                            <svg className="w-3.5 h-3.5 stroke-[3.5] stroke-current" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: REPORTS ────────────────── */}
      {subView === "reports" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-955 dark:text-white tracking-tight uppercase">{t.attendance.growthReports}</h2>
              <p className="text-xs text-slate-450 dark:text-gray-500 mt-1 font-semibold">{t.attendance.analyticsSubtitle}</p>
            </div>
            <button 
              onClick={() => window.print()} 
              className="py-2.5 px-4 bg-[#6366F1] hover:bg-indigo-650 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/10 active:scale-95"
            >
              <Printer className="w-4 h-4" /> {language === "te" ? "నివేదికలను ప్రింట్ చేయి" : language === "hi" ? "रिपोर्ट प्रिंट करें" : "Print Reports"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-6">
              <h3 className="text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-[#6366F1]" /> {t.attendance.monthlyHeadcountGrowth}
              </h3>

              {/* Bar Chart */}
              <div className="h-48 flex items-end justify-between gap-4 px-2 relative mb-6">
                {[
                  { month: "Jan", val: 510, height: "h-[50%]" },
                  { month: "Feb", val: 560, height: "h-[55%]" },
                  { month: "Mar", val: 620, height: "h-[62%]" },
                  { month: "Apr", val: 680, height: "h-[68%]" },
                  { month: "May", val: 780, height: "h-[78%]" },
                  { month: "Jun", val: 856, height: "h-[85%]" }
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <span className="absolute -top-7 text-[9px] font-extrabold text-[#6366F1] dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50/90 dark:bg-[#16172D]/90 px-2 py-0.5 rounded-lg border border-indigo-150 dark:border-indigo-500/20 shadow-sm z-10">{bar.val}</span>
                    <div className={`w-full bg-[#6366F1]/5 group-hover:bg-[#6366F1]/10 rounded-t-lg transition-colors flex items-end overflow-hidden ${bar.height} min-h-[4px]`}>
                      <div className="w-full bg-gradient-to-t from-indigo-500 to-purple-600 rounded-t-lg" style={{ height: "100%" }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-gray-550">{getMonthTranslation(bar.month)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-4">
              <h3 className="text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" /> {t.attendance.executiveSummaryIndices}
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: t.attendance.attendanceRetentionRate, val: "92.4%", desc: t.attendance.retentionRateDesc },
                  { label: t.attendance.avgSundayAttendance, val: "680", desc: t.attendance.sundayAttendanceDesc },
                  { label: t.attendance.weeklyNewVisitorsAvg, val: "14", desc: t.attendance.newVisitorsAvgDesc },
                  { label: t.attendance.youthParticipationRate, val: "38.2%", desc: t.attendance.youthParticipationDesc }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4 text-xs font-semibold">
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-slate-905 dark:text-white">{item.label}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-gray-500 leading-snug font-medium">{item.desc}</p>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-white/[0.02] px-2.5 py-1 rounded-xl border border-slate-150 dark:border-white/[0.04] shrink-0 shadow-sm">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
