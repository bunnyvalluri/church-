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
  Sliders,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import PaletteToggle from "@/components/PaletteToggle";
import { motion, AnimatePresence } from "framer-motion";
import ChurchFeedbackWidget from "@/components/ChurchFeedbackWidget";
import MemberFooter from "@/components/layout/MemberFooter";

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
      { key: "profile", title: "My Profile", desc: "Update your details & photo", href: "/member/profile", icon: User, gradient: "from-violet-500 to-purple-700", glow: "shadow-purple-500/25", badge: "Update", badgeColor: "bg-violet-100 text-violet-800 dark:bg-violet-900/70 dark:text-violet-100 border border-violet-200 dark:border-violet-500/40" },
      { key: "events", title: "Church Events", desc: "Browse & RSVP for services", href: "/member/events", icon: Calendar, gradient: "from-blue-500 to-indigo-700", glow: "shadow-blue-500/25", badge: "Browse", badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-100 border border-blue-200 dark:border-blue-500/40" },
      { key: "prayers", title: "Prayer Requests", desc: "Submit & track your prayers", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/25", badge: "Submit", badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-100 border border-rose-200 dark:border-rose-500/40" },
      { key: "sermons", title: "Sermon Library", desc: "Watch & listen to messages", href: "/member/sermons", icon: Play, gradient: "from-indigo-500 to-blue-700", glow: "shadow-indigo-500/25", badge: "Watch", badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-500/40" },
      { key: "volunteer", title: "Volunteer", desc: "Serve in active ministries", href: "/member/volunteer", icon: Briefcase, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25", badge: "Apply", badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-100 border border-amber-200 dark:border-amber-500/40" },
      { key: "give", title: "Giving & Tithe", desc: "Offerings & download receipts", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-700", glow: "shadow-emerald-500/25", badge: "Give Now", badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-500/40" },
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
      { key: "profile", title: "నా ప్రొఫైల్", desc: "మీ వివరాలు & ఫోటో అప్‌డేట్ చేయండి", href: "/member/profile", icon: User, gradient: "from-violet-500 to-purple-700", glow: "shadow-purple-500/25", badge: "అప్‌డేట్", badgeColor: "bg-violet-100 text-violet-800 dark:bg-violet-900/70 dark:text-violet-100 border border-violet-200 dark:border-violet-500/40" },
      { key: "events", title: "చర్చి కార్యక్రమాలు", desc: "కూడికల వివరాలు & షెడ్యూల్", href: "/member/events", icon: Calendar, gradient: "from-blue-500 to-indigo-700", glow: "shadow-blue-500/25", badge: "చూడండి", badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-100 border border-blue-200 dark:border-blue-500/40" },
      { key: "prayers", title: "ప్రార్థన విన్నపాలు", desc: "ప్రార్థన పంపండి & ట్రాక్ చేయండి", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/25", badge: "పంపండి", badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-100 border border-rose-200 dark:border-rose-500/40" },
      { key: "sermons", title: "ప్రసంగాల లైబ్రరీ", desc: "వాక్యమును చూడండి & వినండి", href: "/member/sermons", icon: Play, gradient: "from-indigo-500 to-blue-700", glow: "shadow-indigo-500/25", badge: "చూడండి", badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-500/40" },
      { key: "volunteer", title: "వాలంటీర్ పరిచర్య", desc: "దేవుని పరిచర్యలో పాల్గొనండి", href: "/member/volunteer", icon: Briefcase, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25", badge: "చేరండి", badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-100 border border-amber-200 dark:border-amber-500/40" },
      { key: "give", title: "కానుకలు & దశమభాగాలు", desc: "కానుకలు పంపండి & రశీదులు", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-700", glow: "shadow-emerald-500/25", badge: "కానుక ఇవ్వండి", badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-500/40" },
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
      { key: "profile", title: "मेरी प्रोफाइल", desc: "अपना विवरण और फोटो अपडेट करें", href: "/member/profile", icon: User, gradient: "from-violet-500 to-purple-700", glow: "shadow-purple-500/25", badge: "अपडेट", badgeColor: "bg-violet-100 text-violet-800 dark:bg-violet-900/70 dark:text-violet-100 border border-violet-200 dark:border-violet-500/40" },
      { key: "events", title: "चर्च कार्यक्रम", desc: "सभाएं और कार्यक्रम देखें", href: "/member/events", icon: Calendar, gradient: "from-blue-500 to-indigo-700", glow: "shadow-blue-500/25", badge: "देखें", badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-100 border border-blue-200 dark:border-blue-500/40" },
      { key: "prayers", title: "प्रार्थना निवेदन", desc: "प्रार्थना भेजें और ट्रैक करें", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/25", badge: "भेजें", badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-100 border border-rose-200 dark:border-rose-500/40" },
      { key: "sermons", title: "प्रवचन लाइब्रेरी", desc: "वचन देखें और सुनें", href: "/member/sermons", icon: Play, gradient: "from-indigo-500 to-blue-700", glow: "shadow-indigo-500/25", badge: "देखें", badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-500/40" },
      { key: "volunteer", title: "स्वयंसेवक सेवा", desc: "मंत्रालय में सेवा करें", href: "/member/volunteer", icon: Briefcase, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25", badge: "जुड़ें", badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-100 border border-amber-200 dark:border-amber-500/40" },
      { key: "give", title: "दान और दशांश", desc: "दान दें और रसीद डाउनलोड करें", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-700", glow: "shadow-emerald-500/25", badge: "दान दें", badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-500/40" },
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
    <div className="w-full space-y-6 sm:space-y-8 pb-12">
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

      {/* ── Refresh & Header Utility Bar ─────────────────── */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-gray-900/60 p-3 sm:px-5 rounded-2xl border border-gray-200/80 dark:border-white/5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-purple-100/90 dark:bg-purple-900/80 text-purple-950 dark:text-purple-100 text-xs font-black px-3.5 py-1.5 rounded-xl border border-purple-300 dark:border-purple-500/60 shadow-xs">
            <activeGreeting.icon className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
            <span className="text-purple-950 dark:text-purple-50 font-black tracking-wide">{activeGreeting.text}</span>
          </div>
          {mounted && lastSynced && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              <span>{dt.syncText} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => loadFeeds(false)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-300 transition-all active:scale-95 cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-purple-600" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── Hero Welcome Banner ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 sm:p-8 md:p-10 text-white shadow-xl shadow-purple-500/10 border border-white/10"
      >
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {dt.greetings.welcome},{" "}
              <span className="text-amber-300">{firstName}! 🙏</span>
            </h2>
            <p className="text-violet-100/90 text-sm sm:text-base leading-relaxed font-medium">
              {dt.greetings.sub}
            </p>
          </div>

          {/* Stat chips on desktop hero */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3">
              <Calendar className="w-5 h-5 text-amber-300 flex-shrink-0" />
              <div>
                <p className="text-xl font-black leading-none">{loadingFeeds ? "..." : stats.events}</p>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider mt-1">{dt.stats.events.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3">
              <Heart className="w-5 h-5 text-rose-300 flex-shrink-0" />
              <div>
                <p className="text-xl font-black leading-none">{loadingFeeds ? "..." : stats.prayers}</p>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider mt-1">{dt.stats.prayers.label}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Daily Scripture Promise ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="relative bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 dark:from-amber-950/30 dark:via-amber-900/10 dark:to-amber-950/30 border border-amber-200/70 dark:border-amber-800/30 rounded-2xl p-5 sm:p-6 overflow-hidden shadow-xs"
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500/10 dark:text-amber-500/10 pointer-events-none">
          <BookOpen className="w-24 h-24" />
        </div>
        <div className="relative flex items-start gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex-shrink-0 shadow-xs border border-amber-200/50 dark:border-amber-700/40">
            <Flame className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-700 dark:text-amber-400 block mb-1">
              {dt.scriptureHeading}
            </span>
            <p className="text-sm sm:text-base font-semibold italic text-gray-800 dark:text-gray-100 leading-relaxed">
              &ldquo;{scripture.text}&rdquo;
            </p>
            <span className="inline-block mt-2.5 text-xs font-black text-amber-950 dark:text-amber-50 bg-amber-200 dark:bg-amber-800/80 px-3.5 py-1.5 rounded-full border border-amber-400 dark:border-amber-500/80 shadow-xs">
              — {scripture.ref}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Fellowship Overview Stats Grid ──────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            label: dt.stats.events.label,
            value: stats.events,
            icon: Calendar,
            iconColor: "text-purple-600 dark:text-purple-400",
            iconBg: "bg-purple-50 dark:bg-purple-950/40",
            border: "border-purple-200/80 dark:border-purple-900/30",
            badge: stats.events > 0 ? `${stats.events} ${dt.stats.events.badgeRSVP}` : dt.stats.events.badgeDefault,
            href: "/member/events",
          },
          {
            label: dt.stats.prayers.label,
            value: stats.prayers,
            icon: Heart,
            iconColor: "text-rose-600 dark:text-rose-400",
            iconBg: "bg-rose-50 dark:bg-rose-950/40",
            border: "border-rose-200/80 dark:border-rose-900/30",
            badge: stats.prayersAnswered > 0 ? `${stats.prayersAnswered} ${dt.stats.prayers.badgeAnswered}` : dt.stats.prayers.badgeDefault,
            href: "/member/prayers",
          },
          {
            label: dt.stats.sermons.label,
            value: stats.sermons,
            icon: BookOpen,
            iconColor: "text-indigo-600 dark:text-indigo-400",
            iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
            border: "border-indigo-200/80 dark:border-indigo-900/30",
            badge: dt.stats.sermons.badgeDefault,
            href: "/member/sermons",
          },
          {
            label: dt.stats.announcements.label,
            value: stats.announcements.length,
            icon: Bell,
            iconColor: "text-amber-600 dark:text-amber-400",
            iconBg: "bg-amber-50 dark:bg-amber-950/40",
            border: "border-amber-200/80 dark:border-amber-900/30",
            badge: stats.announcements.some(a => a.priority === "URGENT") ? dt.stats.announcements.badgeUrgent : dt.stats.announcements.badgeDefault,
            href: "#announcements",
          },
        ].map(({ label, value, icon: Icon, iconColor, iconBg, border, badge, href }, i) => (
          <Link
            key={i}
            href={href}
            className={`group relative bg-white dark:bg-gray-900/60 border ${border} rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {badge}
              </span>
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{label}</span>
            <span className={`text-3xl font-black ${iconColor} block mt-1 tracking-tight`}>
              {loadingFeeds ? <span className="inline-block w-8 h-7 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /> : value}
            </span>
          </Link>
        ))}
      </motion.div>

      {/* ── Believer Services Directory ─────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {dt.directoryHeading}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dt.cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + i * 0.03 }}
              >
                <Link
                  href={card.href}
                  className={`group h-full flex flex-col justify-between bg-white dark:bg-gray-900/60 border border-gray-200/80 dark:border-white/5 rounded-2xl p-5 hover:shadow-xl ${card.glow} hover:border-purple-300 dark:hover:border-purple-800/50 hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center justify-between">
                      <span>{card.title}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ── 2-Column Section for Secondary Content ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col (Announcements & Activity) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          {/* Announcements Card */}
          <motion.div
            id="announcements"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900/60 border border-gray-200/80 dark:border-white/5 rounded-2xl shadow-xs overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-purple-50 dark:bg-purple-950/40 rounded-xl flex items-center justify-center">
                  <Bell className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">{dt.announcementsTitle}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {dt.live}
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[360px] overflow-y-auto">
              {loadingFeeds ? (
                <div className="space-y-3 p-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800/30 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : stats.announcements.length === 0 ? (
                <div className="text-center py-10">
                  <Bookmark className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-medium">{dt.noAnnouncements}</p>
                </div>
              ) : (
                stats.announcements.map((anc) => {
                  const isUrgent = anc.priority === "URGENT" || anc.priority === "HIGH";
                  return (
                    <div key={anc.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{anc.title}</span>
                        {isUrgent && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500 text-white">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{anc.content}</p>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Activity Progress */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="bg-white dark:bg-gray-900/60 border border-gray-200/80 dark:border-white/5 rounded-2xl p-5 shadow-xs"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{dt.activityTitle}</h4>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: dt.activityLabels.events, value: stats.events, color: "bg-purple-500" },
                { label: dt.activityLabels.prayers, value: stats.prayers, color: "bg-rose-500" },
                { label: dt.activityLabels.answered, value: stats.prayersAnswered, color: "bg-emerald-500" },
                { label: dt.activityLabels.sermons, value: stats.sermons, color: "bg-indigo-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{loadingFeeds ? "..." : value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, (value / 5) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Col (Quick Actions & Feedback) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-5 text-white shadow-lg border border-white/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-300" />
              <h4 className="text-sm font-black">{dt.quickActionsTitle}</h4>
            </div>
            <div className="space-y-2.5">
              {dt.quickActions.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/15 transition-all text-xs font-bold"
                >
                  <Icon className="w-4 h-4 text-purple-200 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-200 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Feedback Widget */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
          >
            <ChurchFeedbackWidget userId={user?.uid} userName={user?.name || undefined} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
