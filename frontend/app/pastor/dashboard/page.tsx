"use client";

import React, { useState, useEffect } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { Users, Play, Heart, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [sermonsCount, setSermonsCount] = useState<number>(0);
  const [publishedSermonsCount, setPublishedSermonsCount] = useState<number>(0);
  const [memberRequestsCount, setMemberRequestsCount] = useState<number>(0);
  const [newMemberRequestsCount, setNewMemberRequestsCount] = useState<number>(0);
  const [prayerRequestsCount, setPrayerRequestsCount] = useState<number>(0);
  const [urgentPrayersCount, setUrgentPrayersCount] = useState<number>(0);
  const [eventsCount, setEventsCount] = useState<number>(0);
  const [recentSermons, setRecentSermons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMetrics = () => {
    setIsLoading(true);
    Promise.allSettled([
      fetch("/api/pastor/sermons").then((res) => res.json()),
      fetch("/api/pastor/member-requests").then((res) => res.json()),
      fetch("/api/pastor/prayer-requests").then((res) => res.json()),
      fetch("/api/pastor/events").then((res) => res.json()),
    ]).then(([sermonsRes, memberReqsRes, prayersRes, eventsRes]) => {
      if (sermonsRes.status === "fulfilled" && sermonsRes.value?.success && Array.isArray(sermonsRes.value.sermons)) {
        const list = sermonsRes.value.sermons;
        setSermonsCount(list.length);
        setPublishedSermonsCount(list.filter((s: any) => s.status === "Published").length);
        setRecentSermons(list.slice(0, 3));
      }
      if (memberReqsRes.status === "fulfilled" && memberReqsRes.value?.success && Array.isArray(memberReqsRes.value.requests)) {
        const list = memberReqsRes.value.requests;
        setMemberRequestsCount(list.length);
        setNewMemberRequestsCount(list.filter((r: any) => r.status === "New" || r.status === "Pending").length);
      }
      if (prayersRes.status === "fulfilled" && prayersRes.value?.success && Array.isArray(prayersRes.value.prayers)) {
        const list = prayersRes.value.prayers;
        setPrayerRequestsCount(list.length);
        setUrgentPrayersCount(list.filter((p: any) => p.category === "HEALTH" || p.priority === "Urgent" || p.status === "PENDING").length);
      }
      if (eventsRes.status === "fulfilled" && eventsRes.value?.success && Array.isArray(eventsRes.value.events)) {
        setEventsCount(eventsRes.value.events.length);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const stats = [
    {
      title: t.navSermons,
      value: sermonsCount.toString(),
      change: `${publishedSermonsCount} Published`,
      href: "/pastor/main/sermons",
      icon: Play,
      color: "text-violet-600 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-500/20"
    },
    {
      title: t.navMemberRequests,
      value: memberRequestsCount.toString(),
      change: `${newMemberRequestsCount} New / Pending`,
      href: "/pastor/main/member-requests",
      icon: Users,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/20"
    },
    {
      title: t.navPrayerRequests,
      value: prayerRequestsCount.toString(),
      change: `${urgentPrayersCount} Urgent / Pending`,
      href: "/pastor/main/prayer-requests",
      icon: Heart,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/20"
    },
    {
      title: t.navEvents,
      value: eventsCount.toString(),
      change: t.next30Days,
      href: "/pastor/main/events",
      icon: Calendar,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-500/20"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.overviewWorkspace}
        subtitle={t.dashboardSubtitle}
        badge={t.pastorPortal}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t.searchRecords}
        primaryActionLabel={t.createSermon}
        onPrimaryAction={() => alert("Upload sermon modal opened")}
        onRefresh={fetchMetrics}
      />

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => (
          <Link key={item.title} href={item.href} className="group">
            <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider">{item.title}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {isLoading ? "..." : item.value}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 dark:text-gray-400 mt-1">{item.change}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sermons Card */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.04] pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{t.navSermons}</h3>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">{t.recentActivity}</p>
            </div>
            <Link href="/pastor/main/sermons" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">{t.viewAll}</Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="p-4 text-center text-xs font-bold text-slate-400">Loading sermons...</div>
            ) : recentSermons.length === 0 ? (
              <div className="p-4 text-center text-xs font-bold text-slate-400">
                {t.noSermonsFound || "No sermons found"}
              </div>
            ) : (
              recentSermons.map((s, idx) => (
                <div key={s.id || idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{s.title}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400">{s.scripture || t.scriptureRef} • {s.category || t.sundayWorship} • {s.duration || "40:00"}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">{s.status || t.published}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Pastoral Tools Card */}
        <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-white/[0.04] pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">{t.quickActionsTitle}</h3>
            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">{t.dashboardSubtitle}</p>
          </div>
          <div className="space-y-2">
            <Link href="/pastor/main/member-requests" className="w-full p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-between hover:bg-indigo-100/50 transition-colors">
              <span>{t.navMemberRequests}</span>
              <Users className="w-4 h-4" />
            </Link>
            <Link href="/pastor/main/prayer-requests" className="w-full p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between hover:bg-rose-100/50 transition-colors">
              <span>{t.viewPrayers}</span>
              <Heart className="w-4 h-4" />
            </Link>
            <Link href="/pastor/reports/attendance" className="w-full p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center justify-between hover:bg-purple-100/50 transition-colors">
              <span>{t.navAttendanceReports}</span>
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
