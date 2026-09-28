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
  Bell,
  Briefcase,
  Flame,
  Bookmark,
  Gift,
  RefreshCw,
  Wifi,
  Activity,
  ChevronRight,
  Play,
  Zap,
  AlertTriangle,
  TrendingUp,
  Star,
  CheckCircle2,
  ArrowUpRight,
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
      { key: "profile", title: "My Profile", desc: "Update your details & photo", href: "/member/profile", icon: User, gradient: "from-violet-500 to-purple-700", glow: "shadow-purple-500/25", badge: "Update", badgeColor: "bg-purple-600 dark:bg-purple-700 text-white border border-purple-500 font-extrabold shadow-xs" },
      { key: "events", title: "Church Events", desc: "Browse & RSVP for services", href: "/member/events", icon: Calendar, gradient: "from-blue-500 to-indigo-700", glow: "shadow-blue-500/25", badge: "Browse", badgeColor: "bg-indigo-600 dark:bg-indigo-700 text-white border border-indigo-500 font-extrabold shadow-xs" },
      { key: "prayers", title: "Prayer Requests", desc: "Submit & track your prayers", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/25", badge: "Submit", badgeColor: "bg-rose-600 dark:bg-rose-700 text-white border border-rose-500 font-extrabold shadow-xs" },
      { key: "sermons", title: "Sermon Library", desc: "Watch & listen to messages", href: "/member/sermons", icon: Play, gradient: "from-indigo-500 to-blue-700", glow: "shadow-indigo-500/25", badge: "Watch", badgeColor: "bg-purple-600 dark:bg-purple-700 text-white border border-purple-500 font-extrabold shadow-xs" },
      { key: "volunteer", title: "Volunteer", desc: "Serve in active ministries", href: "/member/volunteer", icon: Briefcase, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25", badge: "Apply", badgeColor: "bg-amber-600 dark:bg-amber-700 text-white border border-amber-500 font-extrabold shadow-xs" },
      { key: "give", title: "Giving & Tithe", desc: "Offerings & download receipts", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-700", glow: "shadow-emerald-500/25", badge: "Give Now", badgeColor: "bg-emerald-600 dark:bg-emerald-700 text-white border border-emerald-500 font-extrabold shadow-xs" },
      { key: "report", title: "Report a Problem", desc: "Technical issue & diagnostics", href: "/member/report", icon: AlertTriangle, gradient: "from-rose-500 to-red-700", glow: "shadow-rose-500/25", badge: "Support", badgeColor: "bg-rose-600 dark:bg-rose-700 text-white border border-rose-500 font-extrabold shadow-xs" },
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
    quickActionsSub: "Instant access to key fellowship tools",
    quickActions: [
      { label: "Submit a Prayer", desc: "Pastoral care & prayer wall", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-600", text: "text-rose-500 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-200/80 dark:border-rose-900/40" },
      { label: "Register for Event", desc: "RSVP to services & meets", href: "/member/events", icon: Calendar, gradient: "from-indigo-500 to-blue-600", text: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-200/80 dark:border-indigo-900/40" },
      { label: "Give Online", desc: "Offerings, tithe & receipts", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-600", text: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200/80 dark:border-emerald-900/40" },
      { label: "Report Issue", desc: "Get help & tech diagnostics", href: "/member/report", icon: AlertTriangle, gradient: "from-amber-500 to-rose-600", text: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200/80 dark:border-amber-900/40" },
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
      { key: "profile", title: "నా ప్రొఫైల్", desc: "మీ వివరాలు & ఫోటో అప్‌డేట్ చేయండి", href: "/member/profile", icon: User, gradient: "from-violet-500 to-purple-700", glow: "shadow-purple-500/25", badge: "అప్‌డేట్", badgeColor: "bg-purple-600 dark:bg-purple-700 text-white border border-purple-500 font-extrabold shadow-xs" },
      { key: "events", title: "చర్చి కార్యక్రమాలు", desc: "కూడికల వివరాలు & షెడ్యూల్", href: "/member/events", icon: Calendar, gradient: "from-blue-500 to-indigo-700", glow: "shadow-blue-500/25", badge: "చూడండి", badgeColor: "bg-indigo-600 dark:bg-indigo-700 text-white border border-indigo-500 font-extrabold shadow-xs" },
      { key: "prayers", title: "ప్రార్థన విన్నపాలు", desc: "ప్రార్థన పంపండి & ట్రాక్ చేయండి", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/25", badge: "పంపండి", badgeColor: "bg-rose-600 dark:bg-rose-700 text-white border border-rose-500 font-extrabold shadow-xs" },
      { key: "sermons", title: "ప్రసంగాల లైబ్రరీ", desc: "వాక్యమును చూడండి & వినండి", href: "/member/sermons", icon: Play, gradient: "from-indigo-500 to-blue-700", glow: "shadow-indigo-500/25", badge: "చూడండి", badgeColor: "bg-purple-600 dark:bg-purple-700 text-white border border-purple-500 font-extrabold shadow-xs" },
      { key: "volunteer", title: "వాలంటీర్ పరిచర్య", desc: "దేవుని పరిచర్యలో పాల్గొనండి", href: "/member/volunteer", icon: Briefcase, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25", badge: "చేరండి", badgeColor: "bg-amber-600 dark:bg-amber-700 text-white border border-amber-500 font-extrabold shadow-xs" },
      { key: "give", title: "కానుకలు & దశమభాగాలు", desc: "కానుకలు పంపండి & రశీదులు", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-700", glow: "shadow-emerald-500/25", badge: "కానుక ఇవ్వండి", badgeColor: "bg-emerald-600 dark:bg-emerald-700 text-white border border-emerald-500 font-extrabold shadow-xs" },
      { key: "report", title: "సమస్య నివేదిక", desc: "సాంకేతిక సమస్య & సహాయం", href: "/member/report", icon: AlertTriangle, gradient: "from-rose-500 to-red-700", glow: "shadow-rose-500/25", badge: "సహాయం", badgeColor: "bg-rose-600 dark:bg-rose-700 text-white border border-rose-500 font-extrabold shadow-xs" },
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
    quickActionsSub: "ప్రధాన సేవల ప్రత్యక్ష ప్రవేశం",
    quickActions: [
      { label: "ప్రార్థన విన్నపం సమర్పించండి", desc: "పాస్టరల్ ప్రార్థన & గోడ", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-600", text: "text-rose-500 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-200/80 dark:border-rose-900/40" },
      { label: "కార్యక్రమంలో నమోదు అవ్వండి", desc: "కూడికలు & ఆరాధనలు", href: "/member/events", icon: Calendar, gradient: "from-indigo-500 to-blue-600", text: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-200/80 dark:border-indigo-900/40" },
      { label: "ఆన్‌లైన్‌లో కానుక ఇవ్వండి", desc: "దశమభాగం & రశీదులు", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-600", text: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200/80 dark:border-emerald-900/40" },
      { label: "సమస్యను నివేదించండి", desc: "సాంకేతిక సహాయం & లోపాలు", href: "/member/report", icon: AlertTriangle, gradient: "from-amber-500 to-rose-600", text: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200/80 dark:border-amber-900/40" },
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
      { key: "profile", title: "मेरी प्रोफाइल", desc: "अपना विवरण और फोटो अपडेट करें", href: "/member/profile", icon: User, gradient: "from-violet-500 to-purple-700", glow: "shadow-purple-500/25", badge: "अपडेट", badgeColor: "bg-purple-600 dark:bg-purple-700 text-white border border-purple-500 font-extrabold shadow-xs" },
      { key: "events", title: "चर्च कार्यक्रम", desc: "सभाएं और कार्यक्रम देखें", href: "/member/events", icon: Calendar, gradient: "from-blue-500 to-indigo-700", glow: "shadow-blue-500/25", badge: "देखें", badgeColor: "bg-indigo-600 dark:bg-indigo-700 text-white border border-indigo-500 font-extrabold shadow-xs" },
      { key: "prayers", title: "प्रार्थना निवेदन", desc: "प्रार्थना भेजें और ट्रैक करें", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/25", badge: "भेजें", badgeColor: "bg-rose-600 dark:bg-rose-700 text-white border border-rose-500 font-extrabold shadow-xs" },
      { key: "sermons", title: "प्रवचन लाइब्रेरी", desc: "वचन देखें और सुनें", href: "/member/sermons", icon: Play, gradient: "from-indigo-500 to-blue-700", glow: "shadow-indigo-500/25", badge: "देखें", badgeColor: "bg-purple-600 dark:bg-purple-700 text-white border border-purple-500 font-extrabold shadow-xs" },
      { key: "volunteer", title: "स्वयंसेवक सेवा", desc: "मंत्रालय में सेवा करें", href: "/member/volunteer", icon: Briefcase, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25", badge: "जुड़ें", badgeColor: "bg-amber-600 dark:bg-amber-700 text-white border border-amber-500 font-extrabold shadow-xs" },
      { key: "give", title: "दान और दशांश", desc: "दान दें और रसीद डाउनलोड करें", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-700", glow: "shadow-emerald-500/25", badge: "दान दें", badgeColor: "bg-emerald-600 dark:bg-emerald-700 text-white border border-emerald-500 font-extrabold shadow-xs" },
      { key: "report", title: "समस्या रिपोर्ट", desc: "तकनीकी समस्या और सहायता", href: "/member/report", icon: AlertTriangle, gradient: "from-rose-500 to-red-700", glow: "shadow-rose-500/25", badge: "सहायता", badgeColor: "bg-rose-600 dark:bg-rose-700 text-white border border-rose-500 font-extrabold shadow-xs" },
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
    quickActionsSub: "प्रमुख सेवाओं की त्वरित पहुंच",
    quickActions: [
      { label: "प्रार्थना निवेदन भेजें", desc: "प्रार्थना सहायता और प्रार्थना वॉल", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-600", text: "text-rose-500 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-200/80 dark:border-rose-900/40" },
      { label: "कार्यक्रम में भाग लें", desc: "आगामी सभाएं और सेवाएं", href: "/member/events", icon: Calendar, gradient: "from-indigo-500 to-blue-600", text: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-200/80 dark:border-indigo-900/40" },
      { label: "ऑनलाइन दान दें", desc: "दशांश, भेंट और रसीदें", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-600", text: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200/80 dark:border-emerald-900/40" },
      { label: "समस्या रिपोर्ट करें", desc: "तकनीकी सहायता और सुझाव", href: "/member/report", icon: AlertTriangle, gradient: "from-amber-500 to-rose-600", text: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200/80 dark:border-amber-900/40" },
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


/* ── Animated Counter ─────────────────────────────────────── */
function AnimatedCounter({ value, loading }: { value: number; loading: boolean }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (loading) return;
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 20);
    return () => clearInterval(timer);
  }, [value, loading]);
  if (loading) return <span className="inline-block w-8 h-6 bg-white/20 rounded animate-pulse" />;
  return <>{display}</>;
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function MemberDashboard() {
  const { user, status, mounted, logout } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const dt = dashboardTranslations[language as keyof typeof dashboardTranslations] || dashboardTranslations.en;

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
        fetch(`/api/member/events?userId=${encodeURIComponent(user.uid)}&t=${Date.now()}`),
        fetch(`/api/member/prayers?userId=${encodeURIComponent(user.uid)}&t=${Date.now()}`),
        fetch(`/api/pastor/sermons?t=${Date.now()}`),
        fetch(`/api/pastor/announcements?t=${Date.now()}`),
      ]);

      let eventsCount = 0;
      let prayersCount = 0;
      let prayersAnswered = 0;
      let sermonsCount = 0;
      let announcements: Announcement[] = [];

      if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
        const d = await eventsRes.value.json().catch(() => null);
        if (d?.success) eventsCount = d.registeredEventIds?.length || 0;
      }
      if (prayersRes.status === "fulfilled" && prayersRes.value.ok) {
        const d = await prayersRes.value.json().catch(() => null);
        if (d?.success) {
          prayersCount = d.prayers?.length || 0;
          prayersAnswered = d.prayers?.filter((p: { status: string }) => p.status === "ANSWERED").length || 0;
        }
      }
      if (sermonsRes.status === "fulfilled" && sermonsRes.value.ok) {
        const d = await sermonsRes.value.json().catch(() => null);
        if (d?.success) sermonsCount = d.sermons?.length || 0;
      }
      if (announcementsRes.status === "fulfilled" && announcementsRes.value.ok) {
        const d = await announcementsRes.value.json().catch(() => null);
        announcements = d?.announcements || [];
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
    <div className="w-full max-w-7xl mx-auto space-y-5 sm:space-y-7 pb-16 px-1 sm:px-2 md:px-4">

      {/* ── Toast ────────────────────────────────────── */}
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
          HERO — CINEMATIC WELCOME BANNER
      ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
        style={{ background: "linear-gradient(135deg, #3b0764 0%, #581c87 25%, #4c1d95 55%, #1e1b4b 85%, #0f172a 100%)" }}
      >
        {/* Layered ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/25 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl" />
        </div>

        {/* Decorative cross watermark */}
        <div className="pointer-events-none absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 opacity-[0.05] select-none">
          <svg viewBox="0 0 100 130" className="w-36 h-48 sm:w-52 sm:h-72 fill-white">
            <rect x="40" y="0" width="20" height="130" rx="5" />
            <rect x="0" y="35" width="100" height="20" rx="5" />
          </svg>
        </div>

        {/* Top utility strip */}
        <div className="relative z-10 flex items-center justify-between px-4 sm:px-7 pt-4 pb-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white text-[10px] font-bold px-3 py-1 rounded-full">
              <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
              {dt.memberTag}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {mounted && lastSynced && (
              <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-white/50">
                <Wifi className="w-3 h-3 text-emerald-400" />
                {dt.syncText} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={() => loadFeeds(false)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-bold text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-violet-300" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Main hero content */}
        <div className="relative z-10 px-4 sm:px-7 md:px-9 pt-5 pb-6 sm:pt-7 sm:pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">

            {/* Left — Name & greeting */}
            <div className="space-y-3 max-w-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-amber-300/90 text-xs font-semibold tracking-wide">
                  {new Date().getHours() < 12 ? dt.greetings.morning : new Date().getHours() < 17 ? dt.greetings.afternoon : dt.greetings.evening}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black text-white tracking-tight leading-[1.1]">
                {dt.greetings.welcome},{" "}
                <br className="sm:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                  {firstName}! 🙏
                </span>
              </h1>
              <p className="text-sm sm:text-base text-purple-200/80 font-medium leading-relaxed max-w-md">
                {dt.greetings.sub}
              </p>
            </div>

            {/* Right — 4 stat chips */}
            <div className="grid grid-cols-2 gap-2.5 shrink-0 md:w-68">
              {[
                { icon: Calendar, label: dt.stats.events.label, value: stats.events, color: "from-violet-500/35 to-purple-500/25" },
                { icon: Heart, label: dt.stats.prayers.label, value: stats.prayers, color: "from-rose-500/35 to-pink-500/25" },
                { icon: BookOpen, label: dt.stats.sermons.label, value: stats.sermons, color: "from-indigo-500/35 to-blue-500/25" },
                { icon: Bell, label: dt.stats.announcements.label, value: stats.announcements.length, color: "from-amber-500/35 to-orange-500/25" },
              ].map(({ icon: Icon, label, value, color }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.06, ease: "backOut" }}
                  className={`bg-gradient-to-br ${color} backdrop-blur-md border border-white/12 rounded-2xl p-3 sm:p-3.5`}
                >
                  <Icon className="w-4 h-4 text-white/65 mb-2" />
                  <p className="text-xl sm:text-2xl font-black text-white leading-none">
                    <AnimatedCounter value={value} loading={loadingFeeds} />
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-white/55 font-bold uppercase tracking-wider mt-1 leading-tight">
                    {label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom edge line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </motion.div>

      {/* ══════════════════════════════════════════════════
          DAILY SCRIPTURE
      ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative overflow-hidden rounded-2xl border border-amber-200/60 dark:border-amber-800/30 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/40 dark:via-amber-900/20 dark:to-amber-950/40"
      >
        <div className="absolute right-0 top-0 bottom-0 w-28 opacity-[0.07] pointer-events-none flex items-center justify-center">
          <BookOpen className="w-24 h-24 text-amber-800 dark:text-amber-200" />
        </div>
        <div className="relative flex items-start gap-3 sm:gap-4 p-4 sm:p-5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
            <Flame className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-700 dark:text-amber-400 block mb-1">
              ✦ {dt.scriptureHeading} ✦
            </span>
            <p className="text-sm sm:text-base font-semibold italic text-amber-900 dark:text-amber-100 leading-relaxed">
              &ldquo;{scripture.text}&rdquo;
            </p>
            <span className="inline-block mt-2 text-[10px] font-black text-amber-900 dark:text-amber-50 bg-amber-300/50 dark:bg-amber-800/50 px-3 py-1 rounded-full border border-amber-400/40 dark:border-amber-600/40">
              — {scripture.ref}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          STAT CARDS — PREMIUM GRID
      ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {[
          {
            label: dt.stats.events.label,
            value: stats.events,
            icon: Calendar,
            gradient: "from-violet-500 to-purple-600",
            lightBg: "from-violet-50/70 to-purple-50/50",
            darkBg: "dark:from-violet-950/50 dark:to-purple-950/30",
            valueColor: "text-violet-600 dark:text-violet-300",
            href: "/member/events",
            trend: stats.events > 0 ? `${stats.events} RSVPs` : null,
          },
          {
            label: dt.stats.prayers.label,
            value: stats.prayers,
            icon: Heart,
            gradient: "from-rose-500 to-pink-600",
            lightBg: "from-rose-50/70 to-pink-50/50",
            darkBg: "dark:from-rose-950/50 dark:to-pink-950/30",
            valueColor: "text-rose-600 dark:text-rose-300",
            href: "/member/prayers",
            trend: stats.prayersAnswered > 0 ? `✓ ${stats.prayersAnswered} answered` : null,
          },
          {
            label: dt.stats.sermons.label,
            value: stats.sermons,
            icon: BookOpen,
            gradient: "from-indigo-500 to-blue-600",
            lightBg: "from-indigo-50/70 to-blue-50/50",
            darkBg: "dark:from-indigo-950/50 dark:to-blue-950/30",
            valueColor: "text-indigo-600 dark:text-indigo-300",
            href: "/member/sermons",
            trend: null,
          },
          {
            label: dt.stats.announcements.label,
            value: stats.announcements.length,
            icon: Bell,
            gradient: "from-amber-500 to-orange-500",
            lightBg: "from-amber-50/70 to-orange-50/50",
            darkBg: "dark:from-amber-950/50 dark:to-orange-950/30",
            valueColor: "text-amber-600 dark:text-amber-300",
            href: "#announcements",
            trend: stats.announcements.some(a => a.priority === "URGENT") ? "⚠️ Urgent" : null,
          },
        ].map(({ label, value, icon: Icon, gradient, lightBg, darkBg, valueColor, href, trend }, i) => (
          <Link
            key={i}
            href={href}
            className="group relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/8 bg-white dark:bg-gray-900/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Gradient accent top bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}`} />
            {/* Subtle background tint */}
            <div className={`absolute inset-0 bg-gradient-to-br ${lightBg} ${darkBg} opacity-60 group-hover:opacity-90 transition-opacity`} />

            <div className="relative z-10 p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {trend && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 text-right leading-tight">
                    {trend}
                  </span>
                )}
              </div>
              <p className={`text-2xl sm:text-3xl font-black ${valueColor} leading-none tracking-tight mb-1`}>
                <AnimatedCounter value={value} loading={loadingFeeds} />
              </p>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">
                {label}
              </p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════
          SERVICES DIRECTORY — PREMIUM CARDS
      ══════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">
            {dt.directoryHeading}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {dt.cards.map((card, i) => {
            const Icon = card.icon;
            const emojis = ["👤", "📅", "🙏", "🎙️", "🤝", "💚", "🔧"];
            return (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.28 + i * 0.04, ease: "easeOut" }}
              >
                <Link
                  href={card.href}
                  className="group h-full flex flex-col bg-white dark:bg-gray-900/60 border border-gray-200/60 dark:border-white/6 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-300/50 dark:hover:border-purple-800/50 transition-all duration-300"
                >
                  {/* Gradient card header */}
                  <div className={`relative bg-gradient-to-br ${card.gradient} p-4 sm:p-5`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_65%)]" />
                    <div className="relative flex items-start justify-between">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full bg-black/20 text-white/90 border border-white/15 backdrop-blur-sm">
                        {card.badge}
                      </span>
                    </div>
                    <div className="text-xl mt-2 opacity-85 select-none">{emojis[i] || "✨"}</div>
                  </div>

                  {/* Card body */}
                  <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                        {card.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-3 text-purple-600 dark:text-purple-400 text-[11px] font-bold group-hover:gap-1.5 transition-all">
                      <span>Open</span>
                      <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════
          BOTTOM GRID — Announcements + Quick Actions + Activity
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

        {/* ── Left: Announcements ───────────────────── */}
        <motion.div
          id="announcements"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-7 bg-white dark:bg-gray-900/60 border border-gray-200/60 dark:border-white/6 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-violet-50/70 to-purple-50/40 dark:from-violet-950/20 dark:to-purple-950/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">{dt.announcementsTitle}</h3>
                <p className="text-[10px] text-gray-400 font-medium">Church updates & notices</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {dt.live}
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[360px] overflow-y-auto">
            {loadingFeeds ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-gray-50 dark:bg-gray-800/30 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : stats.announcements.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Bookmark className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm text-gray-400 font-medium">{dt.noAnnouncements}</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Check back soon for updates</p>
              </div>
            ) : (
              stats.announcements.map((anc) => {
                const isUrgent = anc.priority === "URGENT" || anc.priority === "HIGH";
                return (
                  <div key={anc.id} className="p-4 sm:p-5 hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isUrgent ? "bg-red-500 animate-pulse" : "bg-purple-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {anc.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1 line-clamp-2">
                            {anc.content}
                          </p>
                        </div>
                      </div>
                      {isUrgent && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-red-500 text-white shrink-0">
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* ── Right: Quick Actions + Activity ───────── */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-5">

          {/* Quick Actions Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.33 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900/60 border border-purple-200/60 dark:border-purple-900/40 shadow-sm"
          >
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-500/8 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500/8 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-purple-100/60 dark:border-purple-900/30 bg-gradient-to-r from-purple-50/70 to-indigo-50/40 dark:from-purple-950/20 dark:to-indigo-950/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">{dt.quickActionsTitle}</h4>
                  <p className="text-[10px] text-gray-400 font-medium hidden sm:block">{dt.quickActionsSub}</p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                Fast Links
              </span>
            </div>

            <div className="relative z-10 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
              {dt.quickActions.map(({ label, desc, href, icon: Icon, gradient }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800/70 border border-gray-200/60 dark:border-white/6 hover:border-purple-300 dark:hover:border-purple-700/60 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight">
                      {label}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight mt-0.5 truncate">
                      {desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Activity Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.37 }}
            className="bg-white dark:bg-gray-900/60 border border-gray-200/60 dark:border-white/6 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">{dt.activityTitle}</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Your spiritual journey</p>
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="space-y-4">
              {[
                { label: dt.activityLabels.events, value: stats.events, max: 10, gradient: "from-violet-500 to-purple-600", icon: Calendar },
                { label: dt.activityLabels.prayers, value: stats.prayers, max: 10, gradient: "from-rose-500 to-pink-600", icon: Heart },
                { label: dt.activityLabels.answered, value: stats.prayersAnswered, max: 10, gradient: "from-emerald-500 to-teal-600", icon: CheckCircle2 },
                { label: dt.activityLabels.sermons, value: stats.sermons, max: 20, gradient: "from-indigo-500 to-blue-600", icon: Play },
              ].map(({ label, value, max, gradient, icon: Icon }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span>
                    </div>
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      {loadingFeeds ? "..." : value}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: loadingFeeds ? "0%" : `${Math.min(100, (value / max) * 100)}%` }}
                      transition={{ duration: 0.9, delay: 0.4 + Math.random() * 0.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ChurchFeedbackWidget userId={user?.uid} userName={user?.name || undefined} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}