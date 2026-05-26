"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  Heart,
  BookOpen,
  Sparkles,
  ArrowRight,
  LogOut,
  Bell,
  Clock,
  Briefcase,
  Flame,
  Bookmark,
  Gift,
  RefreshCw,
  Wifi,
  TrendingUp,
  CheckCircle2,
  Activity,
  ChevronRight,
  Star,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

const memberTranslations = {
  en: {
    portalName: "KCM Portal",
    roleName: "Believer Member",
    welcome: "Welcome,",
    signOut: "Sign Out",
    portalDashboard: "Member Fellowship Space",
    hello: "Welcome Home,",
    description: "We are so glad to have you in our spiritual family. Access your events, review sermons, submit prayers, and volunteer in active ministries.",
    registeredEvents: "Registered Events",
    prayerRequests: "Prayer Requests",
    directoryTitle: "Believer Services Directory",
    latestAnnouncements: "Latest Announcements",
    noAnnouncements: "No active church announcements currently.",
    urgent: "Urgent",
    loadingFeeds: "Loading member portal feeds...",
    loadingPortal: "Securing Member Fellowship Space...",
    scriptureTitle: "Scripture of the Day",
    scriptureText: '"The Lord is my shepherd; I shall not want."',
    scriptureRef: "— Psalm 23:1",
    services: {
      profile: { title: "My Profile", desc: "Update phone numbers, profile images, and address." },
      events: { title: "Church Events", desc: "Browse upcoming schedules and secure seats." },
      prayers: { title: "Prayer Requests", desc: "Submit, edit, and keep track of prayer lines." },
      sermons: { title: "Sermon Library", desc: "Watch recent bible sessions and pastorships." },
      volunteer: { title: "Volunteer Sign Up", desc: "Serve in active church programs and ministries." },
      giving: { title: "Giving & Receipts", desc: "Make offerings, tithe, and download statements." },
    },
  },
  te: {
    portalName: "కింగ్డమ్ ఆఫ్ క్రైస్ట్ పోర్టల్",
    roleName: "సభ్యుడు",
    welcome: "స్వాగతం,",
    signOut: "లాగ్ అవుట్",
    portalDashboard: "సభ్యుల పోర్టల్ డాష్‌బోర్డ్",
    hello: "హలో,",
    description: "మా ఆత్మీయ కుటుంబంలో మిమ్మల్ని కలిగి ఉన్నందుకు మేము చాలా సంతోషిస్తున్నాము. మీ ఈవెంట్‌లను యాక్సెస్ చేయండి, ప్రసంగాలను సమీక్షించండి, ప్రార్థనలను సమర్పించండి మరియు పరిచర్యలలో వాలంటీర్‌గా ఉండండి.",
    registeredEvents: "నమోదైన కార్యక్రమాలు",
    prayerRequests: "ప్రార్థన విన్నపాలు",
    directoryTitle: "సభ్యుల సేవల డైరెక్టరీ",
    latestAnnouncements: "తాజా ప్రకటనలు",
    noAnnouncements: "ప్రస్తుతం చర్చి ప్రకటనలు ఏవీ లేవు.",
    urgent: "అత్యవసరం",
    loadingFeeds: "ఫీడ్‌లను లోడ్ చేస్తోంది...",
    loadingPortal: "సభ్యుల పోర్టల్ లోడ్ అవుతోంది...",
    scriptureTitle: "నేటి దైవ వాక్యం",
    scriptureText: '"యెహోవా నా కాపరి, నాకు లేమి కలుగదు."',
    scriptureRef: "— కీర్తనలు 23:1",
    services: {
      profile: { title: "నా ప్రొఫైల్", desc: "ఫోన్ నంబర్లు, ప్రొఫైల్ చిత్రాలు మరియు చిరునామాను నవీకరించండి." },
      events: { title: "చర్చి కార్యక్రమాలు", desc: "రాబోయే షెడ్యూల్‌లను బ్రౌజ్ చేయండి మరియు సీట్లను బుక్ చేసుకోండి." },
      prayers: { title: "ప్రార్థన విన్నపాలు", desc: "ప్రార్థన విన్నపాలను సమర్పించండి మరియు ట్రాక్ చేయండి." },
      sermons: { title: "ప్రసంగాల లైబ్రరీ", desc: "ఇటీవలి బైబిల్ సందేశాలు మరియు ప్రసంగాలు వీక్షించండి." },
      volunteer: { title: "వాలంటీర్ నమోదు", desc: "సక్రియ చర్చి కార్యక్రమాలు మరియు పరిచర్యలలో సేవ చేయండి." },
      giving: { title: "కానుకలు & రసీదులు", desc: "దశమభాగాలు, కానుకలు ఇవ్వండి మరియు రసీదులు డౌన్‌లోడ్ చేసుకోండి." },
    },
  },
  hi: {
    portalName: "केसीएम पोर्टल",
    roleName: "सदस्य",
    welcome: "स्वागत है,",
    signOut: "साइन आउट",
    portalDashboard: "सदस्य पोर्टल डैशबोर्ड",
    hello: "नमस्ते,",
    description: "हमें अपने आध्यात्मिक परिवार में पाकर बहुत खुशी हुई है। अपने कार्यक्रमों तक पहुँचें, प्रवचनों की समीक्षा करें, प्रार्थनाएँ जमा करें, और सक्रिय मंत्रालयों में स्वयंसेवा करें।",
    registeredEvents: "पंजीकृत कार्यक्रम",
    prayerRequests: "प्रार्थना निवेदन",
    directoryTitle: "सदस्य सेवा निर्देशिका",
    latestAnnouncements: "नवीनतम घोषणाएं",
    noAnnouncements: "वर्तमान में कोई सक्रिय घोषणा नहीं है।",
    urgent: "अति आवश्यक",
    loadingFeeds: "फ़ीड लोड हो रहा है...",
    loadingPortal: "सदस्य पोर्टल लोड हो रहा है...",
    scriptureTitle: "आज का पवित्र वचन",
    scriptureText: '"यहोवा मेरा चरवाहा है, मुझे कोई घटी न होगी।"',
    scriptureRef: "— भजन संहिता 23:1",
    services: {
      profile: { title: "मेरी प्रोफाइल", desc: "फ़ोन नंबर, प्रोफ़ाइल चित्र और पता अपडेट करें।" },
      events: { title: "चर्च कार्यक्रम", desc: "आगामी कार्यक्रम देखें और सीटें सुरक्षित करें।" },
      prayers: { title: "प्रार्थना निवेदन", desc: "प्रार्थना निवेदन जमा करें, संपादित करें और ट्रैक करें।" },
      sermons: { title: "प्रवचन लाइब्रेरी", desc: "हाल के बाइबिल सत्र और संदेश देखें।" },
      volunteer: { title: "स्वयंसेवक पंजीकरण", desc: "सक्रिय चर्च कार्यक्रमों और मंत्रालयों में सेवा करें।" },
      giving: { title: "दान और रसीदें", desc: "दशमांश, प्रसाद दें और रसीदें डाउनलोड करें।" },
    },
  },
};

const SCRIPTURES = [
  { text: '"The Lord is my shepherd; I shall not want."', ref: "— Psalm 23:1" },
  { text: '"I can do all things through Christ who strengthens me."', ref: "— Philippians 4:13" },
  { text: '"For God so loved the world that He gave His only Son."', ref: "— John 3:16" },
  { text: '"Trust in the Lord with all your heart."', ref: "— Proverbs 3:5" },
  { text: '"Be still, and know that I am God."', ref: "— Psalm 46:10" },
];

interface DashboardStats {
  prayers: number;
  prayersAnswered: number;
  events: number;
  sermons: number;
  announcements: any[];
}

export default function MemberDashboard() {
  const { user, status, mounted, logout } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const mt = memberTranslations[language as keyof typeof memberTranslations] || memberTranslations.en;

  const [stats, setStats] = useState<DashboardStats>({ prayers: 0, prayersAnswered: 0, events: 0, sermons: 0, announcements: [] });
  const [loadingFeeds, setLoadingFeeds] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" | "error" } | null>(null);
  const [scriptureIndex, setScriptureIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevAnnouncementCount = useRef(0);

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  // Set random scripture ONLY on client (avoid SSR/hydration mismatch)
  useEffect(() => {
    setScriptureIndex(Math.floor(Math.random() * SCRIPTURES.length));
  }, []);

  const showToast = (msg: string, type: "success" | "info" | "error" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadFeeds = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setIsRefreshing(true);
    try {
      const [eventsRes, prayersRes, sermonsRes, announcementsRes] = await Promise.allSettled([
        fetch(`/api/member/events?userId=${user.uid}&t=${Date.now()}`),
        fetch(`/api/member/prayers?userId=${user.uid}&t=${Date.now()}`),
        fetch(`/api/pastor/sermons?t=${Date.now()}`),
        fetch("/api/pastor/announcements"),
      ]);

      let eventsCount = 0;
      let prayersCount = 0;
      let prayersAnswered = 0;
      let sermonsCount = 0;
      let announcements: any[] = [];

      if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
        const d = await eventsRes.value.json();
        if (d.success) eventsCount = d.registeredEventIds?.length || 0;
      }
      if (prayersRes.status === "fulfilled" && prayersRes.value.ok) {
        const d = await prayersRes.value.json();
        if (d.success) {
          prayersCount = d.prayers?.length || 0;
          prayersAnswered = d.prayers?.filter((p: any) => p.status === "ANSWERED").length || 0;
        }
      }
      if (sermonsRes.status === "fulfilled" && sermonsRes.value.ok) {
        const d = await sermonsRes.value.json();
        if (d.success) sermonsCount = d.sermons?.length || 0;
      }
      if (announcementsRes.status === "fulfilled" && announcementsRes.value.ok) {
        const d = await announcementsRes.value.json();
        announcements = d.announcements || [];
        // Notify on new announcements
        if (prevAnnouncementCount.current > 0 && announcements.length > prevAnnouncementCount.current) {
          showToast(`📢 ${announcements.length - prevAnnouncementCount.current} new announcement(s)!`, "info");
        }
        prevAnnouncementCount.current = announcements.length;
      } else {
        announcements = [
          { id: "1", title: "Sunday Worship Reschedule", content: "Our main worship service will start at 9:00 AM instead of 10:00 AM this Sunday only.", priority: "HIGH", createdAt: "2026-05-26T00:00:00.000Z" },
          { id: "2", title: "Youth Spiritual Fellowship", content: "Weekly youth meetups every Friday night at Bahadurpally. Join us for fellowship & study.", priority: "NORMAL", createdAt: "2026-05-25T00:00:00.000Z" },
        ];
      }

      setStats({ prayers: prayersCount, prayersAnswered, events: eventsCount, sermons: sermonsCount, announcements });
      setLastSynced(new Date());
    } catch (err) {
      if (!silent) console.error("Dashboard feeds error:", err);
    } finally {
      setLoadingFeeds(false);
      setIsRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (status === "authenticated" && user?.uid) {
      loadFeeds();
      intervalRef.current = setInterval(() => loadFeeds(true), 30000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [user, status, loadFeeds]);

  const scripture = SCRIPTURES[scriptureIndex];

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="text-center space-y-4">
          <div className="relative w-14 h-14 mx-auto">
            <div className="animate-spin rounded-full h-14 w-14 border-2 border-purple-500/10 border-t-purple-600" />
            <div className="absolute inset-2 rounded-full bg-purple-500/20 animate-ping" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{mt.loadingPortal}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 dark:text-gray-200 transition-colors duration-500">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: 60 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -40, x: 40 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2.5 max-w-sm backdrop-blur-xl border ${
              toast.type === "success" ? "bg-green-500/90 text-white border-green-400/30" :
              toast.type === "error" ? "bg-red-500/90 text-white border-red-400/30" :
              "bg-purple-600/90 text-white border-purple-400/30"
            }`}
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight leading-none">
                {mt.portalName}
              </h1>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{mt.roleName}</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </div>
            <button
              onClick={() => loadFeeds(false)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-gray-400 hover:text-purple-600 transition-all"
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <span className="text-sm font-semibold hidden md:inline text-gray-700 dark:text-gray-300">
              {mt.welcome} <span className="text-purple-600 dark:text-purple-400">{user?.name?.split(" ")[0] || "Member"}</span>
            </span>
            <button
              onClick={logout}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl font-bold text-xs flex items-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              {mt.signOut}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Main Dashboard Content */}
          <div className="lg:col-span-8 space-y-7">

            {/* Welcome Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-purple-500/20"
            >
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl translate-y-20 -translate-x-12" />
              <div className="relative">
                <span className="text-xs uppercase font-extrabold tracking-widest text-purple-200 block mb-3">{mt.portalDashboard}</span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                  {mt.hello} {user?.name?.split(" ")[0] || "Believer"}! 🙏
                </h2>
                <p className="text-purple-100 max-w-lg leading-relaxed text-sm">{mt.description}</p>
                {lastSynced && (
                  <div className="mt-4 flex items-center gap-2 text-purple-300 text-xs font-semibold">
                    <Wifi className="w-3.5 h-3.5" />
                    Live sync active · Last updated {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Scripture of the Day */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="relative p-6 bg-white/70 dark:bg-gray-900/40 backdrop-blur-xl border border-amber-100 dark:border-amber-900/20 rounded-3xl shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl text-amber-500 flex-shrink-0 shadow-sm">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400 block mb-1">{mt.scriptureTitle}</span>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 italic leading-relaxed">{scripture.text}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap bg-purple-50 dark:bg-purple-950/30 px-3 py-1.5 rounded-full border border-purple-100 dark:border-purple-900/30 flex-shrink-0">
                {scripture.ref}
              </span>
            </motion.div>

            {/* Live Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: mt.registeredEvents, value: stats.events, icon: Calendar, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/20", trend: "+" },
                { label: mt.prayerRequests, value: stats.prayers, icon: Heart, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/20", trend: stats.prayersAnswered > 0 ? `${stats.prayersAnswered} answered` : "" },
                { label: "Sermons Available", value: stats.sermons, icon: BookOpen, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/20", trend: "📖" },
                { label: "Announcements", value: stats.announcements.length, icon: Bell, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20", trend: stats.announcements.some(a => a.priority === "HIGH" || a.priority === "URGENT") ? "🔴 Urgent" : "" },
              ].map(({ label, value, icon: Icon, color, bg, trend }, idx) => (
                <div key={idx} className="bg-white/60 dark:bg-gray-800/30 backdrop-blur-md p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider block leading-tight">{label}</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={value}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-3xl font-black ${color} block mt-1.5 tracking-tight`}
                    >
                      {loadingFeeds ? (
                        <span className="inline-block w-8 h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ) : value}
                    </motion.span>
                  </AnimatePresence>
                  {trend && <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5 block">{trend}</span>}
                  {/* Pulse dot for live */}
                  <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              ))}
            </motion.div>

            {/* Services Navigation Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                {mt.directoryTitle}
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: mt.services.profile.title,
                    desc: mt.services.profile.desc,
                    href: "/member/profile",
                    icon: User,
                    gradient: "from-purple-500 to-violet-600",
                    badge: "Update",
                  },
                  {
                    title: mt.services.events.title,
                    desc: mt.services.events.desc,
                    href: "/member/events",
                    icon: Calendar,
                    gradient: "from-indigo-500 to-blue-600",
                    badge: stats.events > 0 ? `${stats.events} RSVPs` : "Browse",
                  },
                  {
                    title: mt.services.prayers.title,
                    desc: mt.services.prayers.desc,
                    href: "/member/prayers",
                    icon: Heart,
                    gradient: "from-rose-500 to-pink-600",
                    badge: stats.prayers > 0 ? `${stats.prayers} Requests` : "Submit",
                  },
                  {
                    title: mt.services.sermons.title,
                    desc: mt.services.sermons.desc,
                    href: "/member/sermons",
                    icon: BookOpen,
                    gradient: "from-blue-500 to-indigo-600",
                    badge: stats.sermons > 0 ? `${stats.sermons} Sermons` : "Watch",
                  },
                  {
                    title: mt.services.volunteer.title,
                    desc: mt.services.volunteer.desc,
                    href: "/member/volunteer",
                    icon: Briefcase,
                    gradient: "from-amber-500 to-orange-500",
                    badge: "Apply",
                  },
                  {
                    title: mt.services.giving.title,
                    desc: mt.services.giving.desc,
                    href: "/give",
                    icon: Gift,
                    gradient: "from-green-500 to-emerald-600",
                    badge: "Give Now",
                  },
                ].map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    className="group bg-white/60 dark:bg-gray-800/30 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-white/5 shadow-md p-6 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900/40 hover:scale-[1.01] transition-all duration-300 flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${link.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <link.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm">
                        {link.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed truncate">{link.desc}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2.5 py-1 rounded-full border border-purple-100 dark:border-purple-900/30">
                        {link.badge}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Announcements Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-4"
          >
            {/* Announcements Card */}
            <div className="bg-white/60 dark:bg-gray-800/30 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center">
                    <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  {mt.latestAnnouncements}
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 dark:text-green-400">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live
                </div>
              </div>

              {loadingFeeds ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800/30 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : stats.announcements.length === 0 ? (
                <div className="text-center py-10">
                  <Bookmark className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">{mt.noAnnouncements}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                  {stats.announcements.map((anc: any) => {
                    const isUrgent = anc.priority === "URGENT" || anc.priority === "HIGH";
                    return (
                      <div
                        key={anc.id}
                        className={`p-4 rounded-2xl border text-sm leading-relaxed transition-all hover:scale-[1.01] ${
                          isUrgent
                            ? "bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30"
                            : "bg-white/40 dark:bg-gray-800/20 border-gray-100 dark:border-white/5"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{anc.title}</span>
                          {isUrgent && (
                            <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 tracking-widest animate-pulse">
                              {mt.urgent}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{anc.content}</p>
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1.5 uppercase tracking-wide">
                          <Clock className="w-3 h-3 text-purple-500" />
                          {new Date(anc.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-purple-500/20">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
              <h4 className="font-black mb-4 text-sm relative">⚡ Quick Actions</h4>
              <div className="space-y-2.5 relative">
                {[
                  { label: "Submit a Prayer", href: "/member/prayers", icon: Heart },
                  { label: "Register for Event", href: "/member/events", icon: Calendar },
                  { label: "Give Online", href: "/give", icon: Gift },
                ].map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all group border border-white/10 hover:border-white/30"
                  >
                    <Icon className="w-4 h-4 text-purple-200" />
                    <span className="text-sm font-semibold">{label}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-purple-300 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Activity Status */}
            <div className="bg-white/60 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-white/5 shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-green-500" />
                  Your Activity
                </span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                {[
                  { label: "Events Registered", value: stats.events, color: "bg-purple-500" },
                  { label: "Prayers Submitted", value: stats.prayers, color: "bg-rose-500" },
                  { label: "Prayers Answered", value: stats.prayersAnswered, color: "bg-green-500" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 ${color} rounded-full`} />
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{label}</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{loadingFeeds ? "..." : value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
