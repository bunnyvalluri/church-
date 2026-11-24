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
  AlertTriangle,
  MapPin,
  Star,
  LifeBuoy,
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
      { key: "profile", title: "My Profile", desc: "Update your details, testimony & photo", href: "/member/profile", icon: User, gradient: "from-violet-500 to-purple-700", glow: "shadow-purple-500/20", badge: "Update", badgeColor: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 font-bold" },
      { key: "events", title: "Church Events", desc: "Browse & RSVP for upcoming services", href: "/member/events", icon: Calendar, gradient: "from-blue-500 to-indigo-700", glow: "shadow-blue-500/20", badge: "Browse", badgeColor: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 font-bold" },
      { key: "prayers", title: "Prayer Requests", desc: "Submit & track your personal prayers", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/20", badge: "Submit", badgeColor: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 font-bold" },
      { key: "sermons", title: "Sermon Library", desc: "Watch & listen to Bishop's anointed messages", href: "/member/sermons", icon: Play, gradient: "from-indigo-500 to-blue-700", glow: "shadow-indigo-500/20", badge: "Watch", badgeColor: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 font-bold" },
      { key: "volunteer", title: "Volunteer Ministry", desc: "Serve in active departments & outreach", href: "/member/volunteer", icon: Briefcase, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20", badge: "Apply", badgeColor: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 font-bold" },
      { key: "give", title: "Giving & Tithe", desc: "Support the Lord's work & download receipts", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-700", glow: "shadow-emerald-500/20", badge: "Give Now", badgeColor: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 font-bold" },
    ],
    supportBanner: {
      title: "Pastoral Care & Help Center",
      desc: "Need prayer counseling, have a testimony to share, or experiencing technical problems? Our pastoral care and support team are with you 24/7.",
      action: "Get Help & Report Issue",
    },
    serviceSpotlight: {
      title: "Next Worship Gathering",
      subtitle: "Join us in praise, worship & Word",
      serviceName: "Sunday Celebration & Miracle Service",
      serviceDate: "Every Sunday · 10:00 AM IST",
      location: "Subhash Nagar Main Sanctuary",
      pastor: "Bishop Kurra Kristhu Raju Garu",
      rsvpBtn: "RSVP to Attend",
      prayerBtn: "Request Prayer",
    },
    feedbackToggle: {
      title: "Church Platform Feedback",
      subtitle: "Help us serve our church family better",
      tapToShare: "Share Feedback ★★★★★",
      hideForm: "Close Feedback Form",
    },
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
      { key: "profile", title: "నా ప్రొఫైల్", desc: "మీ వివరాలు & ఫోటో అప్‌డేట్ చేయండి", href: "/member/profile", icon: User, gradient: "from-violet-500 to-purple-700", glow: "shadow-purple-500/20", badge: "అప్‌డేట్", badgeColor: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 font-bold" },
      { key: "events", title: "చర్చి కార్యక్రమాలు", desc: "కూడికల వివరాలు & షెడ్యూల్", href: "/member/events", icon: Calendar, gradient: "from-blue-500 to-indigo-700", glow: "shadow-blue-500/20", badge: "చూడండి", badgeColor: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 font-bold" },
      { key: "prayers", title: "ప్రార్థన విన్నపాలు", desc: "ప్రార్థన పంపండి & ట్రాక్ చేయండి", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/20", badge: "పంపండి", badgeColor: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 font-bold" },
      { key: "sermons", title: "ప్రసంగాల లైబ్రరీ", desc: "వాక్యమును చూడండి & వినండి", href: "/member/sermons", icon: Play, gradient: "from-indigo-500 to-blue-700", glow: "shadow-indigo-500/20", badge: "చూడండి", badgeColor: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 font-bold" },
      { key: "volunteer", title: "వాలంటీర్ పరిచర్య", desc: "దేవుని పరిచర్యలో పాల్గొనండి", href: "/member/volunteer", icon: Briefcase, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20", badge: "చేరండి", badgeColor: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 font-bold" },
      { key: "give", title: "కానుకలు & దశమభాగాలు", desc: "కానుకలు పంపండి & రశీదులు", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-700", glow: "shadow-emerald-500/20", badge: "కానుక ఇవ్వండి", badgeColor: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 font-bold" },
    ],
    supportBanner: {
      title: "పాస్టరల్ కేర్ & సహాయ కేంద్రం",
      desc: "ఏదైనా సమస్య లేదా సాంకేతిక లోపం ఉందా? మా సహాయ బృందం మీకు సహాయం చేయడానికి సిద్ధంగా ఉంది.",
      action: "సహాయం పొందండి & సమస్యను నివేదించండి",
    },
    serviceSpotlight: {
      title: "తదుపరి ఆరాధన కూడిక",
      subtitle: "స్తుతి, ఆరాధన & దైవ వాక్యంలో మాతో చేరండి",
      serviceName: "ఆదివారపు ఆరాధన & అద్భుతాల కూడిక",
      serviceDate: "ప్రతి ఆదివారం · ఉదయం 10:00 గంటలకు",
      location: "సుభాష్ నగర్ ప్రధాన మందిరం",
      pastor: "బిషప్ కుర్రా క్రీస్తు రాజు గారు",
      rsvpBtn: "హాజరు కావడానికి నమోదు అవ్వండి",
      prayerBtn: "పాస్టరల్ ప్రార్థన కోరండి",
    },
    feedbackToggle: {
      title: "చర్చి ప్లాట్‌ఫారమ్ అభిప్రాయం",
      subtitle: "మా చర్చి కుటుంబానికి మరింత మెరుగ్గా సేవ చేయడానికి సహాయపడండి",
      tapToShare: "మీ అభిప్రాయాన్ని పంచుకోండి ★★★★★",
      hideForm: "ఫారమ్ మూసివేయండి",
    },
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
      { key: "profile", title: "मेरी प्रोफाइल", desc: "अपना विवरण और फोटो अपडेट करें", href: "/member/profile", icon: User, gradient: "from-violet-500 to-purple-700", glow: "shadow-purple-500/20", badge: "अपडेट", badgeColor: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 font-bold" },
      { key: "events", title: "चर्च कार्यक्रम", desc: "सभाएं और कार्यक्रम देखें", href: "/member/events", icon: Calendar, gradient: "from-blue-500 to-indigo-700", glow: "shadow-blue-500/20", badge: "देखें", badgeColor: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 font-bold" },
      { key: "prayers", title: "प्रार्थना निवेदन", desc: "प्रार्थना भेजें और ट्रैक करें", href: "/member/prayers", icon: Heart, gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/20", badge: "भेजें", badgeColor: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 font-bold" },
      { key: "sermons", title: "प्रवचन लाइब्रेरी", desc: "वचन देखें और सुनें", href: "/member/sermons", icon: Play, gradient: "from-indigo-500 to-blue-700", glow: "shadow-indigo-500/20", badge: "देखें", badgeColor: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 font-bold" },
      { key: "volunteer", title: "स्वयंसेवक सेवा", desc: "मंत्रालय में सेवा करें", href: "/member/volunteer", icon: Briefcase, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20", badge: "जुड़ें", badgeColor: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 font-bold" },
      { key: "give", title: "दान और दशांश", desc: "दान दें और रसीद डाउनलोड करें", href: "/member/give", icon: Gift, gradient: "from-emerald-500 to-green-700", glow: "shadow-emerald-500/20", badge: "दान दें", badgeColor: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 font-bold" },
    ],
    supportBanner: {
      title: "पास्टोरल देखभाल और सहायता केंद्र",
      desc: "कोई समस्या या तकनीकी दिक्कत? हमारी सेवा टीम आपकी सहायता के लिए सदैव तत्पर है।",
      action: "सहायता प्राप्त करें और समस्या दर्ज करें",
    },
    serviceSpotlight: {
      title: "अगली आराधना सभा",
      subtitle: "स्तुति, आराधना और वचन में हमारे साथ जुड़ें",
      serviceName: "रविवार आराधना एवं चमत्कार सभा",
      serviceDate: "प्रत्येक रविवार · प्रातः 10:00 बजे",
      location: "सुभाष नगर मुख्य प्रार्थनालय",
      pastor: "बिशप कुर्रा क्रिस्तु राजू गारू",
      rsvpBtn: "उपस्थिति दर्ज करें",
      prayerBtn: "प्रार्थना सहायता का अनुरोध करें",
    },
    feedbackToggle: {
      title: "चर्च प्लेटफॉर्म फीडबैक",
      subtitle: "चर्च परिवार की बेहतर सेवा करने में हमारी सहायता करें",
      tapToShare: "अपने विचार साझा करें ★★★★★",
      hideForm: "फ़ॉर्म बंद करें",
    },
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

/* ────────────────────────── Helpers ─────────────────────── */
function getHumanFriendlyName(rawName: string | null | undefined): string {
  if (!rawName) return "Believer";
  const trimmed = rawName.trim();
  if (!trimmed) return "Believer";

  const parts = trimmed.split(/\s+/);
  // Find first token that is purely alphabetical (at least 2 letters)
  const humanPart = parts.find((p) => /^[a-zA-Z]{2,}$/.test(p));
  if (humanPart) {
    return humanPart.charAt(0).toUpperCase() + humanPart.slice(1).toLowerCase();
  }

  const first = parts[0].replace(/[^a-zA-Z0-9]/g, "");
  if (/^[a-zA-Z]+$/.test(first)) {
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }
  return parts.length > 1 ? parts[1] : first || "Believer";
}

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
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
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

  const firstName = getHumanFriendlyName(user?.name);

  /* ═════════════════════════════════════════════════════════
     RENDER
  ═════════════════════════════════════════════════════════ */
  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 pb-12 px-1 sm:px-2 md:px-4">
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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900/60 p-3 sm:px-5 rounded-2xl border border-gray-200/80 dark:border-white/5 shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-purple-600 dark:bg-purple-700 text-white text-xs font-black px-3 py-1.5 rounded-xl border border-purple-500 shadow-xs shrink-0">
            <activeGreeting.icon className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="text-white font-black tracking-wide truncate max-w-[140px] sm:max-w-none">{activeGreeting.text}</span>
          </div>
          {mounted && lastSynced && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 truncate">
              <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{dt.syncText} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => loadFeeds(false)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-300 transition-all active:scale-95 cursor-pointer ml-auto"
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
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 p-5 sm:p-7 md:p-8 text-white shadow-xl shadow-purple-900/20 border border-white/15"
      >
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 w-72 sm:w-80 h-72 sm:h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-56 sm:w-64 h-56 sm:h-64 bg-indigo-400/20 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2 sm:space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{new Date().getHours() < 12 ? dt.greetings.morning : new Date().getHours() < 17 ? dt.greetings.afternoon : dt.greetings.evening}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {dt.greetings.welcome},{" "}
              <span className="text-amber-300 inline-block">{firstName}! 🙏</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-purple-100/90 font-normal leading-relaxed max-w-xl pt-0.5">
              {dt.greetings.sub}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0 pt-1 md:pt-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wide">{dt.memberTag}</span>
            </div>
            <Link
              href="/member/events"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white text-purple-900 font-extrabold text-xs sm:text-sm hover:bg-purple-50 active:scale-95 transition-all shadow-md shadow-purple-950/20"
            >
              <Calendar className="w-4 h-4 text-purple-700" />
              <span>{dt.serviceSpotlight.rsvpBtn}</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Daily Scripture Promise ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="relative bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 dark:from-amber-950/30 dark:via-amber-900/10 dark:to-amber-950/30 border border-amber-200/70 dark:border-amber-800/30 rounded-2xl p-4 sm:p-5.5 overflow-hidden shadow-xs"
      >
        <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-amber-500/10 dark:text-amber-500/10 pointer-events-none select-none">
          <BookOpen className="w-20 h-20 sm:w-24 sm:h-24" />
        </div>
        <div className="relative flex items-start gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex-shrink-0 shadow-xs border border-amber-200/50 dark:border-amber-700/40">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-700 dark:text-amber-400 block mb-1">
              {dt.scriptureHeading}
            </span>
            <p className="text-xs sm:text-sm md:text-base font-semibold italic text-gray-800 dark:text-gray-100 leading-relaxed">
              &ldquo;{scripture.text}&rdquo;
            </p>
            <span className="inline-block mt-2 text-xs font-black text-amber-950 dark:text-amber-50 bg-amber-200 dark:bg-amber-800/80 px-3 py-1 rounded-full border border-amber-400 dark:border-amber-500/80 shadow-xs">
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4"
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
            className={`group relative bg-white dark:bg-gray-900/60 border ${border} rounded-2xl p-3 sm:p-4.5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-2.5">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 truncate max-w-[85px] sm:max-w-[100px] shrink-0">
                {badge}
              </span>
            </div>
            <div>
              <span className="text-[9.5px] sm:text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-normal sm:tracking-wider block leading-tight break-words line-clamp-2">{label}</span>
              <span className={`text-xl sm:text-2xl lg:text-3xl font-black ${iconColor} block mt-0.5 tracking-tight`}>
                {loadingFeeds ? <span className="inline-block w-8 h-7 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /> : value}
              </span>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* ── Believer Services Directory ─────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="space-y-3 sm:space-y-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {dt.directoryHeading}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                  className={`group h-full flex flex-col justify-between bg-white dark:bg-gray-900/60 border border-gray-200/80 dark:border-white/5 rounded-2xl p-4 sm:p-5 hover:shadow-xl ${card.glow} hover:border-purple-300 dark:hover:border-purple-800/50 hover:-translate-y-0.5 transition-all duration-300`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                      <Icon className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className={`text-[9.5px] sm:text-[10px] font-extrabold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center justify-between">
                      <span className="truncate">{card.title}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                      {card.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Pastoral Care & Support Banner (Full-width balanced layout) */}
        <div className="mt-3 sm:mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <LifeBuoy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
                {dt.supportBanner.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                {dt.supportBanner.desc}
              </p>
            </div>
          </div>
          <Link
            href="/member/report"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shrink-0 transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <span>{dt.supportBanner.action}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.section>

      {/* ── 2-Column Section for Secondary Content ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Col (Announcements & Activity) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-5 sm:space-y-6">
          {/* Announcements Card */}
          <motion.div
            id="announcements"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900/80 border border-purple-200/80 dark:border-purple-900/40 p-4 sm:p-5 shadow-xl shadow-purple-500/5 backdrop-blur-xl"
          >
            {/* Ambient subtle decorative glow */}
            <div className="pointer-events-none absolute -top-12 -right-12 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-purple-100 dark:bg-purple-950/60 rounded-xl flex items-center justify-center border border-purple-200 dark:border-purple-800/60 shadow-xs shrink-0">
                  <Bell className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight truncate">
                    {dt.announcementsTitle}
                  </h4>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium hidden sm:block truncate">
                    Church updates, notifications & schedules
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 text-[9px] font-extrabold uppercase tracking-wider shrink-0">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>{dt.live}</span>
              </div>
            </div>

            <div className="relative z-10 min-h-[220px] sm:min-h-[250px] flex flex-col justify-center">
              {loadingFeeds ? (
                <div className="space-y-3 p-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800/40 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : stats.announcements.length === 0 ? (
                <div className="text-center py-8 sm:py-12 px-4 rounded-2xl bg-gray-50/60 dark:bg-gray-800/30 border border-dashed border-gray-200/80 dark:border-white/5 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3 shadow-xs">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-extrabold text-gray-900 dark:text-white mb-1">All Caught Up!</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                    There are no new announcements at this time. Stay connected for upcoming ministry events and pastoral updates.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                  {stats.announcements.map((anc) => {
                    const isUrgent = anc.priority === "URGENT" || anc.priority === "HIGH";
                    return (
                      <div
                        key={anc.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                          isUrgent
                            ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                            : "bg-gray-50/70 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800/80 hover:border-purple-200 dark:hover:border-purple-800/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">{anc.title}</span>
                          {isUrgent && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white shrink-0">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{anc.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Activity Progress */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900/80 border border-purple-200/80 dark:border-purple-900/40 p-4 sm:p-5 shadow-xl shadow-purple-500/5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 shadow-xs shrink-0">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight">
                    {dt.activityTitle}
                  </h4>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium hidden sm:block">
                    Your spiritual journey & engagement
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
                Live Stats
              </span>
            </div>
            <div className="space-y-3.5 sm:space-y-4">
              {[
                { label: dt.activityLabels.events, value: stats.events, color: "bg-purple-500" },
                { label: dt.activityLabels.prayers, value: stats.prayers, color: "bg-rose-500" },
                { label: dt.activityLabels.answered, value: stats.prayersAnswered, color: "bg-emerald-500" },
                { label: dt.activityLabels.sermons, value: stats.sermons, color: "bg-indigo-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300 truncate">{label}</span>
                    <span className="font-bold text-gray-900 dark:text-white ml-2">{loadingFeeds ? "..." : value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, (value / 5) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Col (Service Spotlight & Collapsible Feedback) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-5 sm:space-y-6">
          {/* ── Upcoming Service & Fellowship Spotlight ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white border border-purple-500/30 p-5 sm:p-6 shadow-xl shadow-purple-900/20"
          >
            <div className="pointer-events-none absolute -top-12 -right-12 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-300">
                  <Star className="w-4 h-4 fill-amber-300" />
                  <span className="text-[11px] font-black uppercase tracking-widest">{dt.serviceSpotlight.title}</span>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-purple-200">
                  Subhash Nagar
                </span>
              </div>

              <div>
                <h4 className="text-lg sm:text-xl font-black text-white leading-snug">
                  {dt.serviceSpotlight.serviceName}
                </h4>
                <p className="text-xs text-purple-200/90 mt-1 font-medium">
                  {dt.serviceSpotlight.subtitle}
                </p>
              </div>

              <div className="space-y-2 pt-1 text-xs text-purple-100/90 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="font-semibold">{dt.serviceSpotlight.serviceDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-300 shrink-0" />
                  <span className="font-medium">{dt.serviceSpotlight.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="font-medium">{dt.serviceSpotlight.pastor}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <Link
                  href="/member/events"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 font-bold text-xs text-white transition-all shadow-md"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dt.serviceSpotlight.rsvpBtn}</span>
                </Link>
                <Link
                  href="/member/prayers"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 font-bold text-xs text-white transition-all"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-300" />
                  <span>{dt.serviceSpotlight.prayerBtn}</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ── Collapsible Church Platform Feedback ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900/80 border border-purple-200/80 dark:border-purple-900/40 p-4 sm:p-5 shadow-xl shadow-purple-500/5 backdrop-blur-xl transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0">
                    <Heart className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                    {dt.feedbackToggle.title}
                  </h4>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {dt.feedbackToggle.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFeedbackExpanded(!isFeedbackExpanded)}
                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all active:scale-95 shrink-0"
              >
                {isFeedbackExpanded ? dt.feedbackToggle.hideForm : dt.feedbackToggle.tapToShare}
              </button>
            </div>

            <AnimatePresence>
              {isFeedbackExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                  <ChurchFeedbackWidget userId={user?.uid} userName={user?.name || undefined} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
