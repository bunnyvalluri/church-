"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Activity,
  ChevronRight,
  ChevronDown,
  Play,
  Shield,
  Sun,
  Moon,
  Sunset,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import PaletteToggle from "@/components/PaletteToggle";
import { motion, AnimatePresence } from "framer-motion";
import ChurchFeedbackWidget from "@/components/ChurchFeedbackWidget";

/* ────────────────────────── Types ────────────────────────── */
interface DashboardStats {
  prayers: number;
  prayersAnswered: number;
  events: number;
  sermons: number;
  announcements: Announcement[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
}

/* ────────────────────────── Translations ────────────────────── */
const dashboardTranslations = {
  en: {
    greetings: {
      morning: "Good Morning",
      afternoon: "Good Afternoon",
      evening: "Good Evening",
      welcome: "Welcome back",
      sub: "So glad to have you in our spiritual family. Explore your events, submit prayers, and stay connected.",
    },
    memberTag: "Verified Member",
    syncText: "Live · Last synced",
    scriptures: [
      { text: "For God so loved the world that He gave His only Son.", ref: "John 3:16" },
      { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
      { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
      { text: "Trust in the Lord with all your heart.", ref: "Proverbs 3:5" },
      { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
      { text: "Come to me, all who are weary, and I will give you rest.", ref: "Matthew 11:28" },
      { text: "The Lord will fight for you; you need only to be still.", ref: "Exodus 14:14" },
    ],
    scriptureHeading: "Daily Scripture Promise",
    cards: [
      { key: "profile", title: "My Profile", desc: "Update your details & photo", href: "/member/profile", icon: User, gradient: "from-violet-500 to-purple-700", glow: "shadow-purple-500/25", badge: "Update", badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300" },
      { key: "events", title: "Church Events", desc: "Browse & RSVP for services", href: "/member/events", icon: Calendar, gradient: "from-blue-500 to-indigo-700", glow: "shadow-blue-500/25", badge: "Browse", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" },
      { key: "prayers", title: "Prayer Requests", desc: "Submit & track your prayers", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/25", badge: "Submit", badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" },
      { key: "sermons", title: "Sermon Library", desc: "Watch & listen to messages", href: "/member/sermons", icon: Play, gradient: "from-indigo-500 to-blue-700", glow: "shadow-indigo-500/25", badge: "Watch", badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300" },
      { key: "volunteer", title: "Volunteer", desc: "Serve in active ministries", href: "/member/volunteer", icon: Briefcase, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25", badge: "Apply", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
      { key: "give", title: "Giving & Tithe", desc: "Offerings & download receipts", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-700", glow: "shadow-emerald-500/25", badge: "Give Now", badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
    ],
    directoryHeading: "Believer Services Directory",
    statsHeading: "Quick Fellowship Overview",
    stats: {
      events: { label: "Registered Events", badgeRSVP: "RSVPs", badgeDefault: "Register" },
      prayers: { label: "Prayer Requests", badgeAnswered: "Answered", badgeDefault: "Submit" },
      sermons: { label: "Sermons Available", badgeDefault: "Watch" },
      announcements: { label: "Announcements", badgeUrgent: "⚠️ Urgent", badgeDefault: "View" },
    },
    announcementsTitle: "Latest Announcements",
    noAnnouncements: "No announcements currently.",
    live: "Live",
    quickActionsTitle: "Quick Actions",
    quickActions: [
      { label: "Submit a Prayer", href: "/member/prayers", icon: Heart },
      { label: "Register for Event", href: "/member/events", icon: Calendar },
      { label: "Give Online", href: "/member/give", icon: Gift },
    ],
    activityTitle: "Your Activity",
    activityLabels: {
      events: "Events Registered",
      prayers: "Prayers Submitted",
      answered: "Prayers Answered",
      sermons: "Sermons Watched",
    },
    userMenu: {
      myAccount: "My Account",
      viewProfile: "View Profile",
      editProfile: "Edit Details",
      logOut: "Log Out",
    }
  },
  te: {
    greetings: {
      morning: "శుభోదయం",
      afternoon: "శుభ మధ్యాహ్నం",
      evening: "శుభ సాయంత్రం",
      welcome: "తిరిగి స్వాగతం",
      sub: "మా ఆత్మీయ కుటుంబంలో మిమ్మల్ని చూడటం ఎంతో సంతోషం. మీ కార్యక్రమాలు చూసి, ప్రార్థనలు సమర్పించండి.",
    },
    memberTag: "ధృవీకరించబడిన సభ్యుడు",
    syncText: "లైవ్ · నవీకరించబడింది",
    scriptures: [
      { text: "దేవుడు లోకమును ఎంతో ప్రేమించెను, అందువలన ఆయన తన అద్వితీయ కుమారుడిని అనుగ్రహించెను.", ref: "యోహాను 3:16" },
      { text: "నన్ను బలపరచు క్రీస్తు నందే నేను సమస్తమును చేయగలను.", ref: "ఫిలిప్పీయులకు 4:13" },
      { text: "యెహోవా నా కాపరి; నాకు ఏ కొరతయు ఉండదు.", ref: "కీర్తనలు 23:1" },
      { text: "నీ పూర్ణహృదయముతో యెహోవాయందు నమ్మకముంచుము.", ref: "సామెతలు 3:5" },
      { text: "ఊరకుండుడి, నేనే దేవుడనని తెలుసుకొనుడి.", ref: "కీర్తనలు 46:10" },
      { text: "ప్రయాసపడి భారము మోసుకొనుచున్న సమస్త జనులారా, నా యొద్దకు రండి, నేను మీకు విశ్రాంతినిచ్చెదను.", ref: "మత్తయి 11:28" },
      { text: "యెహోవా మీ పక్షమున యుద్ధము చేయును; మీరు ఊరకయే యుండవలెను.", ref: "నిర్గమకాండము 14:14" },
    ],
    scriptureHeading: "దైనందిన వాగ్దానం",
    cards: [
      { key: "profile", title: "నా ప్రొఫైల్", desc: "మీ వివరాలు & ఫోటో అప్‌డేట్ చేయండి", href: "/member/profile", icon: User, gradient: "from-violet-500 to-purple-700", glow: "shadow-purple-500/25", badge: "అప్‌డేట్", badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300" },
      { key: "events", title: "చర్చి కార్యక్రమాలు", desc: "కూడికల వివరాలు & షెడ్యూల్", href: "/member/events", icon: Calendar, gradient: "from-blue-500 to-indigo-700", glow: "shadow-blue-500/25", badge: "చూడండి", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" },
      { key: "prayers", title: "ప్రార్థన విన్నపాలు", desc: "ప్రార్థన పంపండి & ట్రాక్ చేయండి", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/25", badge: "పంపండి", badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" },
      { key: "sermons", title: "ప్రసంగాల లైబ్రరీ", desc: "వాక్యమును చూడండి & వినండి", href: "/member/sermons", icon: Play, gradient: "from-indigo-500 to-blue-700", glow: "shadow-indigo-500/25", badge: "చూడండి", badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300" },
      { key: "volunteer", title: "వాలంటీర్ పరిచర్య", desc: "దేవుని పరిచర్యలో పాల్గొనండి", href: "/member/volunteer", icon: Briefcase, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25", badge: "చేరండి", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
      { key: "give", title: "కానుకలు & దశమభాగాలు", desc: "కానుకలు పంపండి & రశీదులు", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-700", glow: "shadow-emerald-500/25", badge: "కానుక ఇవ్వండి", badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
    ],
    directoryHeading: "విశ్వాసుల సేవల జాబితా",
    statsHeading: "పరిచర్య ముఖ్యాంశాలు",
    stats: {
      events: { label: "నమోదైన కార్యక్రమాలు", badgeRSVP: "నమోదులు", badgeDefault: "చేరండి" },
      prayers: { label: "ప్రార్థన విన్నపాలు", badgeAnswered: "సమాధానం పొందినవి", badgeDefault: "పంపండి" },
      sermons: { label: "ప్రసంగాల లైబ్రరీ", badgeDefault: "చూడండి" },
      announcements: { label: "ప్రకటనలు", badgeUrgent: "⚠️ అత్యవసరం", badgeDefault: "చూడండి" },
    },
    announcementsTitle: "తాజా ప్రకటనలు",
    noAnnouncements: "ప్రస్తుతం ప్రకటనలు లేవు.",
    live: "లైవ్",
    quickActionsTitle: "త్వరిత చర్యలు",
    quickActions: [
      { label: "ప్రార్థన విన్నపం సమర్పించండి", href: "/member/prayers", icon: Heart },
      { label: "కార్యక్రమంలో నమోదు అవ్వండి", href: "/member/events", icon: Calendar },
      { label: "ఆన్‌లైన్‌లో కానుక ఇవ్వండి", href: "/member/give", icon: Gift },
    ],
    activityTitle: "మీ కార్యాచరణ",
    activityLabels: {
      events: "నమోదైన కార్యక్రమాలు",
      prayers: "సమర్పించిన ప్రార్థనలు",
      answered: "సమాధానం పొందినవి",
      sermons: "వీక్షించిన ప్రసంగాలు",
    },
    userMenu: {
      myAccount: "నా ఖాతా",
      viewProfile: "ప్రొఫైల్ చూడండి",
      editProfile: "వివరాలు మార్చండి",
      logOut: "లాగ్ అవుట్",
    }
  },
  hi: {
    greetings: {
      morning: "शुभ प्रभात",
      afternoon: "शुभ दोपहर",
      evening: "शुभ संध्या",
      welcome: "पुनः स्वागत है",
      sub: "हमारे आत्मिक परिवार में आपका स्वागत है। अपने कार्यक्रम देखें और प्रार्थना निवेदन भेजें।",
    },
    memberTag: "सत्यापित सदस्य",
    syncText: "लाइव · अंतिम सिंक",
    scriptures: [
      { text: "क्योंकि परमेश्वर ने जगत से ऐसा प्रेम रखा कि उसने अपना एकलौता पुत्र दे दिया।", ref: "यूहन्ना 3:16" },
      { text: "जो मुझे सामर्थ्य देता है उसमें मैं सब कुछ कर सकता हूँ।", ref: "फिलिपियों 4:13" },
      { text: "यहोवा मेरा चरवाहा है; मुझे कोई घटी न होगी।", ref: "भजन संहिता 23:1" },
      { text: "तू अपने पूरे मन से यहोवा पर भरोसा रख।", ref: "नीतिवचन 3:5" },
      { text: "शांत रहो और जान लो कि मैं ही परमेश्वर हूँ।", ref: "भजन संहिता 46:10" },
      { text: "हे सब परिश्रम करने वालों और बोझ से दबे लोगों, मेरे पास आओ, मैं तुम्हें विश्राम दूँगा।", ref: "मत्ती 11:28" },
      { text: "यहोवा स्वयं तुम्हारे लिए लड़ेगा; तुम बस शांत रहो।", ref: "निर्गमन 14:14" },
    ],
    scriptureHeading: "दैनिक बाइबिल वचन",
    cards: [
      { key: "profile", title: "मेरी प्रोफाइल", desc: "अपना विवरण और फोटो अपडेट करें", href: "/member/profile", icon: User, gradient: "from-violet-500 to-purple-700", glow: "shadow-purple-500/25", badge: "अपडेट", badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300" },
      { key: "events", title: "चर्च कार्यक्रम", desc: "सभाएं और कार्यक्रम देखें", href: "/member/events", icon: Calendar, gradient: "from-blue-500 to-indigo-700", glow: "shadow-blue-500/25", badge: "देखें", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" },
      { key: "prayers", title: "प्रार्थना निवेदन", desc: "प्रार्थना भेजें और ट्रैक करें", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/25", badge: "भेजें", badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" },
      { key: "sermons", title: "प्रवचन लाइब्रेरी", desc: "वचन देखें और सुनें", href: "/member/sermons", icon: Play, gradient: "from-indigo-500 to-blue-700", glow: "shadow-indigo-500/25", badge: "देखें", badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300" },
      { key: "volunteer", title: "स्वयंसेवक सेवा", desc: "मंत्रालय में सेवा करें", href: "/member/volunteer", icon: Briefcase, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25", badge: "जुड़ें", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
      { key: "give", title: "दान और दशांश", desc: "दान दें और रसीद डाउनलोड करें", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-700", glow: "shadow-emerald-500/25", badge: "दान दें", badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
    ],
    directoryHeading: "विश्वास योग्य सेवाएं",
    statsHeading: "फैलोशिप सारांश",
    stats: {
      events: { label: "पंजीकृत कार्यक्रम", badgeRSVP: "पंजीकरण", badgeDefault: "जुड़ें" },
      prayers: { label: "प्रार्थना निवेदन", badgeAnswered: "उत्तर मिले", badgeDefault: "भेजें" },
      sermons: { label: "प्रवचन लाइब्रेरी", badgeDefault: "देखें" },
      announcements: { label: "घोषणाएं", badgeUrgent: "⚠️ अति आवश्यक", badgeDefault: "देखें" },
    },
    announcementsTitle: "नवीनतम घोषणाएं",
    noAnnouncements: "वर्तमान में कोई घोषणा नहीं है।",
    live: "लाइव",
    quickActionsTitle: "त्वरित कार्रवाई",
    quickActions: [
      { label: "प्रार्थना निवेदन भेजें", href: "/member/prayers", icon: Heart },
      { label: "कार्यक्रम में भाग लें", href: "/member/events", icon: Calendar },
      { label: "ऑनलाइन दान दें", href: "/member/give", icon: Gift },
    ],
    activityTitle: "आपकी गतिविधि",
    activityLabels: {
      events: "पंजीकृत कार्यक्रम",
      prayers: "भेजी गई प्रार्थनाएं",
      answered: "उत्तर मिली प्रार्थनाएं",
      sermons: "देखे गए प्रवचन",
    },
    userMenu: {
      myAccount: "मेरा खाता",
      viewProfile: "प्रोफाइल देखें",
      editProfile: "विवरण बदलें",
      logOut: "लॉग आउट",
    }
  }
};

/* ────────────────────────── Helpers ─────────────────────── */
function getGreeting(lang: string): { text: string; icon: React.ElementType } {
  const dt = dashboardTranslations[lang as keyof typeof dashboardTranslations] || dashboardTranslations.en;
  const hour = new Date().getHours();
  if (hour < 12) return { text: dt.greetings.morning, icon: Sun };
  if (hour < 17) return { text: dt.greetings.afternoon, icon: Sunset };
  return { text: dt.greetings.evening, icon: Moon };
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function MemberDashboard() {
  const { user, status, mounted, logout } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const dt = dashboardTranslations[language as keyof typeof dashboardTranslations] || dashboardTranslations.en;
  const activeGreeting = getGreeting(language);

  const [stats, setStats] = useState<DashboardStats>({
    prayers: 0,
    prayersAnswered: 0,
    events: 0,
    sermons: 0,
    announcements: [],
  });
  const [loadingFeeds, setLoadingFeeds] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" | "error" } | null>(null);
  const [scriptureIndex, setScriptureIndex] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevAnnouncementCount = useRef(0);

  const scripture = dt.scriptures[scriptureIndex % dt.scriptures.length] || dt.scriptures[0];

  /* ── Auth redirect ─────────────────────────────────────── */
  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  /* ── Online / offline ─────────────────────────────────── */
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  /* ── Click-outside close profile dropdown ─────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node))
        setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Random scripture index (client-only to avoid hydration mismatch) */
  useEffect(() => {
    setScriptureIndex(Math.floor(Math.random() * dt.scriptures.length));
  }, []);

  /* ── Toast ─────────────────────────────────────────────── */
  const showToast = (msg: string, type: "success" | "info" | "error" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Data fetch ─────────────────────────────────────────── */
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
      let announcements: Announcement[] = [];

      if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
        const d = await eventsRes.value.json();
        if (d.success) eventsCount = d.registeredEventIds?.length || 0;
      }
      if (prayersRes.status === "fulfilled" && prayersRes.value.ok) {
        const d = await prayersRes.value.json();
        if (d.success) {
          prayersCount = d.prayers?.length || 0;
          prayersAnswered = d.prayers?.filter((p: { status: string }) => p.status === "ANSWERED").length || 0;
        }
      }
      if (sermonsRes.status === "fulfilled" && sermonsRes.value.ok) {
        const d = await sermonsRes.value.json();
        if (d.success) sermonsCount = d.sermons?.length || 0;
      }
      if (announcementsRes.status === "fulfilled" && announcementsRes.value.ok) {
        const d = await announcementsRes.value.json();
        announcements = d.announcements || [];
        if (prevAnnouncementCount.current > 0 && announcements.length > prevAnnouncementCount.current) {
          showToast(`📢 ${announcements.length - prevAnnouncementCount.current} new announcement(s)!`, "info");
        }
        prevAnnouncementCount.current = announcements.length;
      } else {
        announcements = [];
      }

      setStats({ prayers: prayersCount, prayersAnswered, events: eventsCount, sermons: sermonsCount, announcements });
      setLastSynced(new Date());
    } catch (err) {
      if (!silent) console.error("Dashboard feeds error:", err);
      // Fallback to empty
      setStats(prev => ({ ...prev, announcements: [] }));
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

  if (status === "unauthenticated" && mounted) return null;

  const firstName = user?.name?.split(" ")[0] || "Believer";

  /* ═════════════════════════════════════════════════════════
     RENDER
  ═════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 dark:bg-[#0a0a12] text-gray-900 dark:text-gray-100">

      {/* ── Toast ─────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: 60 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2.5 max-w-xs backdrop-blur-xl border ${
              toast.type === "success" ? "bg-emerald-500/90 text-white border-emerald-400/30"
              : toast.type === "error"   ? "bg-red-500/90 text-white border-red-400/30"
              :                            "bg-violet-600/90 text-white border-violet-400/30"
            }`}
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a12]/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/5 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-violet-300/40 group-hover:border-violet-500/60 shadow-lg transition-all bg-white flex items-center justify-center">
              <Image src="/logo.png" alt="KCM" fill className="object-contain p-0.5" priority />
            </div>
            <div className="block">
              <p className="text-sm font-black bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent leading-none">
                KCM Portal
              </p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">
                Believer Member
              </p>
            </div>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Online badge */}
            <div className={`flex items-center justify-center rounded-full text-[10px] font-bold border flex-shrink-0 transition-all ${
              isOnline
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400"
            } p-1 sm:px-2.5 sm:py-1 gap-0 sm:gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
              <span className="hidden sm:inline">{isOnline ? "Live" : "Offline"}</span>
            </div>

            {/* Toggles capsule */}
            <div className="hidden md:flex items-center gap-1.5 bg-gray-100/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-1 rounded-2xl backdrop-blur-md">
              <LanguageToggle />
              <ThemeToggle />
              <PaletteToggle />
            </div>

            {/* Refresh */}
            <button
              onClick={() => loadFeeds(false)}
              disabled={isRefreshing}
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-violet-400/50 text-gray-400 hover:text-violet-600 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            {/* Profile dropdown */}
            <div className="relative flex-shrink-0" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-gray-100/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-violet-400/50 transition-all"
                aria-label="Profile menu"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-violet-500/50 shadow-sm flex-shrink-0">
                  {user?.image && typeof user.image === "string" && user.image.length > 0 ? (
                    <Image src={user.image} alt={user.name || "Member"} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center">
                      <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
                </div>
                <span className="hidden lg:block text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-[80px] truncate">
                  {firstName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl p-4 space-y-4 z-50"
                  >
                    {/* User info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-violet-200/40 flex-shrink-0">
                        {user?.image && typeof user.image === "string" && user.image.length > 0 ? (
                          <Image src={user.image} alt={user.name || "Member"} width={48} height={48} unoptimized className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                            <User className="w-6 h-6 text-violet-600" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-sm text-gray-900 dark:text-white truncate">{user?.name || "Member"}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
                        <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 px-2 py-0.5 bg-violet-50 dark:bg-violet-950/30 rounded-full border border-violet-100 dark:border-violet-900/30">
                          <Shield className="w-2.5 h-2.5" /> {dt.memberTag}
                        </span>
                      </div>
                    </div>
                    <div className="h-px bg-gray-100 dark:bg-white/5" />

                    {/* Mobile toggles */}
                    <div className="md:hidden space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preferences</p>
                      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <LanguageToggle />
                        <ThemeToggle />
                        <PaletteToggle />
                      </div>
                    </div>

                    {/* Nav links */}
                    <div className="space-y-1">
                      <Link href="/member/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                        <User className="w-4 h-4 text-violet-500" /> {dt.userMenu.viewProfile}
                      </Link>
                      <Link href="/member/prayers" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                        <Heart className="w-4 h-4 text-rose-500" /> {dt.stats.prayers.label}
                      </Link>
                    </div>
                    <div className="h-px bg-gray-100 dark:bg-white/5" />

                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-sm font-bold transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" /> {dt.userMenu.logOut}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Direct logout */}
            <button
              onClick={logout}
              className="hidden sm:flex h-9 items-center gap-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-200/40 dark:border-red-900/30 hover:scale-[1.02] active:scale-95 transition-all flex-shrink-0 text-xs font-bold shadow-sm"
              title={dt.userMenu.logOut}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{dt.userMenu.logOut}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════ */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid xl:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ══════════════ LEFT / MAIN COL ══════════════ */}
          <div className="xl:col-span-8 space-y-6">

            {/* ── Hero Welcome Card ───────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-5 sm:p-7 md:p-10 text-white shadow-2xl shadow-violet-500/20"
            >
              {/* Decorative blobs */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-indigo-400/20 rounded-full blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <activeGreeting.icon className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs font-bold text-violet-200 uppercase tracking-widest">
                      {activeGreeting.text}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                    {dt.greetings.welcome}, <br />
                    <span className="text-yellow-300">{firstName}! 🙏</span>
                  </h2>
                  <p className="text-violet-100/80 text-sm leading-relaxed max-w-md">
                    {dt.greetings.sub}
                  </p>

                  {mounted && lastSynced && (
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/90 bg-white/15 border border-white/20 px-3 py-1 rounded-full">
                      <Wifi className="w-3 h-3" />
                      {dt.syncText} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>

                {/* Quick greeting stats */}
                <div className="flex sm:flex-col gap-3 sm:gap-2 flex-shrink-0">
                  {[
                    { label: dt.stats.events.label, value: stats.events, icon: Calendar },
                    { label: dt.stats.prayers.label, value: stats.prayers, icon: Heart },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2.5">
                      <Icon className="w-4 h-4 text-white flex-shrink-0" />
                      <div>
                        <p className="text-lg font-black leading-none text-white">
                          {loadingFeeds ? <span className="inline-block w-5 h-4 bg-white/20 rounded animate-pulse" /> : value}
                        </p>
                        <p className="text-[10px] text-white/80 font-semibold">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Scripture of the Day ─────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="group relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/60 dark:border-amber-800/20 rounded-2xl p-5 md:p-6 overflow-hidden"
            >
              <div className="absolute right-4 top-4 text-amber-300/20 dark:text-amber-700/20">
                <BookOpen className="w-20 h-20" />
              </div>
              <div className="relative flex items-start gap-4">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-950/40 rounded-xl flex-shrink-0">
                  <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-600 dark:text-amber-400 block mb-2">
                    {dt.scriptureHeading}
                  </span>
                  <p className="text-sm font-semibold italic text-gray-800 dark:text-gray-200 leading-relaxed">
                    &ldquo;{scripture.text}&rdquo;
                  </p>
                  <span className="inline-block mt-2 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 px-3 py-1 rounded-full border border-violet-100 dark:border-violet-900/30">
                    — {scripture.ref}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ── Stats Grid ──────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
            >
              {[
                {
                  label: dt.stats.events.label,
                  value: stats.events,
                  icon: Calendar,
                  iconColor: "text-violet-600 dark:text-violet-400",
                  iconBg: "bg-violet-50 dark:bg-violet-950/30",
                  accent: "border-violet-200 dark:border-violet-900/20",
                  badge: stats.events > 0 ? `${stats.events} ${dt.stats.events.badgeRSVP}` : dt.stats.events.badgeDefault,
                  href: "/member/events",
                },
                {
                  label: dt.stats.prayers.label,
                  value: stats.prayers,
                  icon: Heart,
                  iconColor: "text-rose-600 dark:text-rose-400",
                  iconBg: "bg-rose-50 dark:bg-rose-950/30",
                  accent: "border-rose-200 dark:border-rose-900/20",
                  badge: stats.prayersAnswered > 0 ? `${stats.prayersAnswered} ${dt.stats.prayers.badgeAnswered}` : dt.stats.prayers.badgeDefault,
                  href: "/member/prayers",
                },
                {
                  label: dt.stats.sermons.label,
                  value: stats.sermons,
                  icon: BookOpen,
                  iconColor: "text-indigo-600 dark:text-indigo-400",
                  iconBg: "bg-indigo-50 dark:bg-indigo-950/30",
                  accent: "border-indigo-200 dark:border-indigo-900/20",
                  badge: dt.stats.sermons.badgeDefault,
                  href: "/member/sermons",
                },
                {
                  label: dt.stats.announcements.label,
                  value: stats.announcements.length,
                  icon: Bell,
                  iconColor: "text-amber-600 dark:text-amber-400",
                  iconBg: "bg-amber-50 dark:bg-amber-950/30",
                  accent: "border-amber-200 dark:border-amber-900/20",
                  badge: stats.announcements.some(a => a.priority === "URGENT") ? dt.stats.announcements.badgeUrgent : dt.stats.announcements.badgeDefault,
                  href: "#announcements",
                },
              ].map(({ label, value, icon: Icon, iconColor, iconBg, accent, badge, href }, i) => (
                <Link
                  key={i}
                  href={href}
                  className={`group relative bg-white dark:bg-gray-800/80 border ${accent} rounded-2xl p-3.5 sm:p-4 md:p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
                >
                  <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider block leading-tight">{label}</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={value}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-3xl md:text-4xl font-black ${iconColor} block mt-1.5 tracking-tight`}
                    >
                      {loadingFeeds ? <span className="inline-block w-9 h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /> : value}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-1 block">{badge}</span>
                </Link>
              ))}
            </motion.div>

            {/* ── Services Navigation Grid ─────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <h3 className="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {dt.directoryHeading}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {dt.cards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.href}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22 + i * 0.04 }}
                    >
                      <Link
                        href={card.href}
                        className={`group flex items-center gap-4 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-white/10 rounded-2xl p-4 md:p-5 hover:shadow-xl ${card.glow} hover:border-gray-300 dark:hover:border-white/20 hover:scale-[1.015] transition-all duration-300`}
                      >
                        <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm md:text-base font-extrabold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-tight">
                            {card.title}
                          </h4>
                          <p className="text-[11px] md:text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed truncate">
                            {card.desc}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                            {card.badge}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

          </div>

          {/* ══════════════ RIGHT / SIDEBAR ══════════════ */}
          <div className="xl:col-span-4 space-y-5">

            {/* ── Announcements Feed ───────────────────── */}
            <motion.div
              id="announcements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-violet-50 dark:bg-violet-950/30 rounded-xl flex items-center justify-center">
                    <Bell className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">{dt.announcementsTitle}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  {dt.live}
                </div>
              </div>

              {/* Feed */}
              <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-[400px] overflow-y-auto scrollbar-thin">
                {loadingFeeds ? (
                  <div className="space-y-3 p-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800/30 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : stats.announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">{dt.noAnnouncements}</p>
                  </div>
                ) : (
                  stats.announcements.map((anc) => {
                    const isUrgent = anc.priority === "URGENT" || anc.priority === "HIGH";
                    return (
                      <div
                        key={anc.id}
                        className={`px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors ${
                          isUrgent ? "border-l-2 border-red-400" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight flex-1">
                            {anc.priority === "URGENT" && <span className="text-amber-500">⚡ </span>}
                            {anc.priority === "HIGH" && <span className="text-violet-500">🔔 </span>}
                            {anc.title}
                          </span>
                          {isUrgent && (
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                              anc.priority === "URGENT"
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-amber-500 text-white"
                            }`}>
                              {anc.priority === "URGENT" ? "Urgent" : "Hot"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                          {anc.content}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3 text-violet-400" />
                          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">
                            {new Date(anc.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* ── Quick Actions ────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.32 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-5 text-white shadow-xl shadow-violet-500/20"
            >
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <h4 className="text-sm font-black">{dt.quickActionsTitle}</h4>
                </div>
                <div className="space-y-2">
                  {dt.quickActions.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="group flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 hover:border-white/25 transition-all"
                    >
                      <Icon className="w-4 h-4 text-violet-200 flex-shrink-0" />
                      <span className="text-sm font-semibold flex-1">{label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-violet-300 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Your Activity ────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.38 }}
              className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{dt.activityTitle}</h4>
                </div>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div className="space-y-3">
                {[
                  { label: dt.activityLabels.events, value: stats.events, color: "bg-violet-500", bar: "bg-violet-100 dark:bg-violet-900/40" },
                  { label: dt.activityLabels.prayers, value: stats.prayers, color: "bg-rose-500", bar: "bg-rose-100 dark:bg-rose-900/40" },
                  { label: dt.activityLabels.answered, value: stats.prayersAnswered, color: "bg-emerald-500", bar: "bg-emerald-100 dark:bg-emerald-900/40" },
                  { label: dt.activityLabels.sermons, value: stats.sermons, color: "bg-indigo-500", bar: "bg-indigo-100 dark:bg-indigo-900/40" },
                ].map(({ label, value, color, bar }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{label}</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {loadingFeeds ? "..." : value}
                      </span>
                    </div>
                    <div className={`h-1.5 rounded-full ${bar} overflow-hidden`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (value / Math.max(stats.events + stats.prayers + stats.sermons + 1, 1)) * 400)}%` }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className={`h-full rounded-full ${color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Church Platform Feedback ─────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.42 }}
            >
              <ChurchFeedbackWidget userId={user?.uid} userName={user?.name || undefined} />
            </motion.div>


          </div>
        </div>
      </main>
    </div>
  );
}
