"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Heart, Send, Check, Clock, EyeOff, Sparkles, Loader2,
  RefreshCw, Bell, MessageCircle, CheckCircle2, AlertCircle, Plus,
  ChevronDown, ChevronUp, Shield, Phone, Church, BookOpen, Quote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ────────────────────────── Types ────────────────────────── */
interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  status: "PENDING" | "PRAYING" | "ANSWERED";
  createdAt: string;
}

const STATUS_CFG = {
  PENDING:  { dot: "bg-amber-400",  pill: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  PRAYING:  { dot: "bg-purple-500 animate-pulse", pill: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  ANSWERED: { dot: "bg-emerald-500", pill: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
};

const CATS = [
  { value: "HEALTH",       emoji: "🏥" },
  { value: "FAMILY",       emoji: "👨‍👩‍👧‍👦" },
  { value: "FINANCIAL",    emoji: "💼" },
  { value: "SPIRITUAL",    emoji: "🙏" },
  { value: "GUIDANCE",     emoji: "🗺️" },
  { value: "THANKSGIVING", emoji: "🌟" },
  { value: "OTHER",        emoji: "💬" },
];

type FilterStatus = "ALL" | "PENDING" | "PRAYING" | "ANSWERED";

const categoryTranslations = {
  en: {
    HEALTH: "Health & Healing",
    FAMILY: "Family & Peace",
    FINANCIAL: "Financial Breakthrough",
    SPIRITUAL: "Spiritual Growth",
    GUIDANCE: "Direction & Career",
    THANKSGIVING: "Thanksgiving & Praise",
    OTHER: "Other Needs"
  },
  te: {
    HEALTH: "ఆరోగ్యం & స్వస్థత",
    FAMILY: "కుటుంబ సమాధానం",
    FINANCIAL: "ఆర్థిక దీవెన",
    SPIRITUAL: "ఆత్మీయ ఎదుగుదల",
    GUIDANCE: "మార్గదర్శకత్వం & ఉద్యోగం",
    THANKSGIVING: "కృతజ్ఞతాస్తుతులు & స్తుతి",
    OTHER: "ఇతర విన్నపాలు"
  },
  hi: {
    HEALTH: "स्वास्थ्य और चंगाई",
    FAMILY: "पारिवारिक शांति",
    FINANCIAL: "वित्तीय आशीष",
    SPIRITUAL: "आत्मिक उन्नति",
    GUIDANCE: "मार्गदर्शन और करियर",
    THANKSGIVING: "धन्यवाद और स्तुति",
    OTHER: "अन्य प्रार्थना विषय"
  }
};

const prayersTranslations = {
  en: {
    title: "Prayer Requests",
    subtitle: '"Where two or three gather in My name, there am I." — Matthew 18:20',
    wallTag: "Prayer Wall",
    updated: "Updated",
    refresh: "Refresh",
    totalSubmitted: "Total",
    beingPrayed: "Praying",
    answered: "Answered",
    formTitle: "Submit a Prayer Request",
    formSub: "Our Bishop & pastoral care team intercede over every request daily",
    openFormBtn: "New Prayer Request",
    closeFormBtn: "Close Form",
    inputTitle: "Prayer Request Title *",
    inputCategory: "Select Category *",
    inputYourPrayer: "Share Your Prayer Heart *",
    anonymousLabel: "Keep Confidential / Anonymous (Pastors Only)",
    btnSubmit: "Submit to Prayer Wall",
    btnSubmitting: "Submitting to Pastors...",
    placeholderTitle: "e.g. Healing and recovery for my mother",
    placeholderPrayer: "Share your heart with us in faith... Our pastoral intercessory team and prayer warriors pray specifically over your name and need.",
    successSubmit: "Prayer request submitted! Our pastoral team is interceding for you 🙏",
    failSubmit: "Failed to submit prayer request. Please try again.",
    loadError: "Could not load prayer requests",
    notifyAnswered: "🙌 One of your prayers has been marked ANSWERED! Praise God!",
    notifyPraying: "🙏 Pastors are actively interceding for your request right now",
    tabAll: "All",
    tabPraying: "Being Prayed",
    tabAnswered: "Answered",
    tabPending: "Pending Review",
    noPrayersAll: "No prayer requests yet — share your heart!",
    noPrayersFilter: "No {status} requests at this time",
    tagAnonymous: "Anonymous",
    pastoralBannerTitle: "Pastoral Care & 24/7 Prayer Line",
    pastoralBannerDesc: "Our pastoral intercessory team at Subhash Nagar Main Sanctuary gathers daily at 05:00 AM & 06:00 PM to lay hands and intercede over every prayer request.",
    pastoralCallBtn: "Call Prayer Helpline: +91 95052 88171",
    statuses: {
      PENDING: { label: "Under Review", desc: "Awaiting pastoral allocation" },
      PRAYING: { label: "Being Prayed For", desc: "Pastors interceding daily" },
      ANSWERED: { label: "Answered Praise 🙌", desc: "Testimony of God's grace" }
    }
  },
  te: {
    title: "ప్రార్థన విన్నపాలు",
    subtitle: '"ఇద్దరు లేక ముగ్గురు నా నామమున ఎక్కడ కూడియుందురో అక్కడ నేను వారి మధ్యన ఉందును." — మత్తయి 18:20',
    wallTag: "ప్రార్థన గోడ",
    updated: "సమకాలీకరించబడింది",
    refresh: "రిఫ్రెష్",
    totalSubmitted: "మొత్తం",
    beingPrayed: "ప్రార్థిస్తున్నవి",
    answered: "జవాబులు",
    formTitle: "ప్రార్థన విన్నపాన్ని సమర్పించండి",
    formSub: "మా బిషప్ గారు మరియు పాస్టర్ల బృందం ప్రతిరోజూ మీ విన్నపం కొరకు ప్రార్థిస్తారు",
    openFormBtn: "కొత్త ప్రార్థన విన్నపం",
    closeFormBtn: "ఫారమ్ మూసివేయి",
    inputTitle: "విన్నపం అంశం *",
    inputCategory: "విభాగం ఎంచుకోండి *",
    inputYourPrayer: "మీ ప్రార్థన హృదయాన్ని పంచుకోండి *",
    anonymousLabel: "గోప్యంగా ఉంచండి / పేరు లేకుండా (పాస్టర్లకు మాత్రమే)",
    btnSubmit: "ప్రార్థన విన్నపం సమర్పించు",
    btnSubmitting: "సమర్పిస్తున్నాము...",
    placeholderTitle: "ఉదా. మా తల్లిగారి ఆరోగ్యం & స్వస్థత కొరకు",
    placeholderPrayer: "విశ్వాసంతో మీ హృదయాన్ని పంచుకోండి... మా పాస్టర్ల ప్రార్థన బృందం మీ కొరకు ప్రత్యేకంగా ప్రార్థిస్తారు.",
    successSubmit: "ప్రార్థన విన్నపం సమర్పించబడింది! మా పాస్టర్ల బృందం మీ కొరకు ప్రార్థిస్తుంది 🙏",
    failSubmit: "సమర్పించడం వీలుపడలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    loadError: "ప్రార్థన విన్నపాలను లోడ్ చేయడం వీలుపడలేదు",
    notifyAnswered: "🙌 మీ ప్రార్థనకు దేవుడు జవాబిచ్చాడు! దేవునికి స్తోత్రం!",
    notifyPraying: "🙏 పాస్టర్లు ఇప్పుడు మీ విన్నపం కొరకు ప్రార్థిస్తున్నారు",
    tabAll: "అన్నీ",
    tabPraying: "ప్రార్థిస్తున్నవి",
    tabAnswered: "జవాబులు",
    tabPending: "పరిశీలనలో",
    noPrayersAll: "ఇంకా ప్రార్థన విన్నపాలు ఏవీ లేవు — మీ విన్నపాన్ని పంచుకోండి!",
    noPrayersFilter: "ఎటువంటి {status} విన్నపాలు లేవు",
    tagAnonymous: "పేరులేనివి",
    pastoralBannerTitle: "పాస్టరల్ కేర్ & 24/7 ప్రార్థన హెల్ప్‌లైన్",
    pastoralBannerDesc: "సుభాష్ నగర్ ప్రధాన ఆలయంలో మా ప్రార్థన బృందం ప్రతిరోజూ ఉదయం 5:00 మరియు సాయంత్రం 6:00 గంటలకు ప్రతి విన్నపం కొరకు ప్రార్థిస్తుంది.",
    pastoralCallBtn: "ప్రార్థన హెల్ప్‌లైన్: +91 95052 88171",
    statuses: {
      PENDING: { label: "పరిశీలనలో ఉంది", desc: "పాస్టర్ల పరిశీలన కొరకు వేచి ఉంది" },
      PRAYING: { label: "ప్రార్థిస్తున్నారు", desc: "పాస్టర్లు ప్రార్థిస్తున్నారు" },
      ANSWERED: { label: "జవాబు లభించింది 🙌", desc: "దేవుని కృప సాక్ష్యం" }
    }
  },
  hi: {
    title: "प्रार्थना अनुरोध",
    subtitle: '"जहाँ दो या तीन मेरे नाम पर इकट्ठा होते हैं, वहाँ मैं उनके बीच में हूँ।" — मत्ती 18:20',
    wallTag: "प्रार्थना वाल",
    updated: "अपडेट किया गया",
    refresh: "रिफ्रेश",
    totalSubmitted: "कुल",
    beingPrayed: "प्रार्थना में",
    answered: "उत्तर मिला",
    formTitle: "प्रार्थना अनुरोध भेजें",
    formSub: "हमारी पादरी टीम प्रतिदिन हर अनुरोध के लिए प्रार्थना करती है",
    openFormBtn: "नया प्रार्थना अनुरोध",
    closeFormBtn: "फॉर्म बंद करें",
    inputTitle: "अनुरोध का शीर्षक *",
    inputCategory: "श्रेणी चुनें *",
    inputYourPrayer: "अपनी प्रार्थना साझा करें *",
    anonymousLabel: "गोपनीय / गुप्त रखें (केवल पादरियों के लिए)",
    btnSubmit: "प्रार्थना अनुरोध भेजें",
    btnSubmitting: "भेजा जा रहा है...",
    placeholderTitle: "जैसे: मेरी माताजी के स्वास्थ्य और चंगाई के लिए",
    placeholderPrayer: "विश्वास के साथ अपना दिल साझा करें... हमारी पादरी प्रार्थना टीम आपकी आवश्यकता के लिए विशेष रूप से प्रार्थना करेगी।",
    successSubmit: "प्रार्थना अनुरोध भेजा गया! हमारी पादरी टीम आपके लिए प्रार्थना करेगी 🙏",
    failSubmit: "अनुरोध भेजने में विफल। कृपया पुन: प्रयास करें।",
    loadError: "प्रार्थना अनुरोध लोड नहीं किए जा सके",
    notifyAnswered: "🙌 आपकी प्रार्थना का उत्तर मिल गया है! परमेश्वर की स्तुति हो!",
    notifyPraying: "🙏 पादरी अब आपके अनुरोध के लिए प्रार्थना कर रहे हैं",
    tabAll: "सभी",
    tabPraying: "प्रार्थना में",
    tabAnswered: "उत्तर मिला",
    tabPending: "समीक्षा में",
    noPrayersAll: "अभी तक कोई प्रार्थना अनुरोध नहीं है — अपना दिल साझा करें!",
    noPrayersFilter: "कोई {status} अनुरोध नहीं है",
    tagAnonymous: "अनाम",
    pastoralBannerTitle: "पादरी देखभाल एवं 24/7 प्रार्थना हेल्पलाइन",
    pastoralBannerDesc: "सुभाष नगर मुख्य अभयारण्य में हमारी प्रार्थना टीम प्रतिदिन सुबह 5:00 बजे और शाम 6:00 बजे प्रत्येक प्रार्थना विषय के लिए मध्यस्थता करती है।",
    pastoralCallBtn: "प्रार्थना हेल्पलाइन: +91 95052 88171",
    statuses: {
      PENDING: { label: "समीक्षा लंबित", desc: "पादरी की समीक्षा की प्रतीक्षा है" },
      PRAYING: { label: "प्रार्थना जारी है", desc: "पादरी निरंतर प्रार्थना कर रहे हैं" },
      ANSWERED: { label: "उत्तर मिला 🙌", desc: "परमेश्वर की सामर्थ्य का प्रमाण" }
    }
  }
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function MemberPrayers() {
  const { user, status, mounted } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const pt = prayersTranslations[language as keyof typeof prayersTranslations] || prayersTranslations.en;
  const catsDict = categoryTranslations[language as keyof typeof categoryTranslations] || categoryTranslations.en;

  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("HEALTH");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const interval = useRef<NodeJS.Timeout | null>(null);
  const prevPrayers = useRef<PrayerRequest[]>([]);

  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  const load = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/member/prayers?userId=${user.uid}&t=${Date.now()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const fresh: PrayerRequest[] = data.prayers || [];
        fresh.forEach(p => {
          const prev = prevPrayers.current.find(pp => pp.id === p.id);
          if (prev && prev.status !== p.status) {
            if (p.status === "ANSWERED") showToast(pt.notifyAnswered, "success");
            if (p.status === "PRAYING")  showToast(pt.notifyPraying, "info");
          }
        });
        prevPrayers.current = fresh;
        setPrayers(fresh);
        setLastSynced(new Date());
      }
    } catch {
      if (!silent) showToast(pt.loadError, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, pt.loadError, pt.notifyAnswered, pt.notifyPraying]);

  useEffect(() => {
    if (status === "authenticated" && user?.uid) {
      load();
      interval.current = setInterval(() => load(true), 30000);
    }
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [status, user, load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    const temp: PrayerRequest = {
      id: `temp_${Date.now()}`,
      title,
      description,
      category,
      isAnonymous,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    setPrayers(prev => [temp, ...prev]);

    try {
      const res = await fetch("/api/member/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, title, description, category, isAnonymous }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(pt.successSubmit, "success");
        setTitle("");
        setDescription("");
        setIsAnonymous(false);
        setIsFormOpen(false);
        load(true);
      } else {
        setPrayers(prev => prev.filter(p => p.id !== temp.id));
        throw new Error(data.error);
      }
    } catch (err: any) {
      setPrayers(prev => prev.filter(p => p.id !== temp.id));
      showToast(err.message || pt.failSubmit, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = prayers.filter(p => filterStatus === "ALL" || p.status === filterStatus);
  const stats = {
    total: prayers.length,
    praying: prayers.filter(p => p.status === "PRAYING").length,
    answered: prayers.filter(p => p.status === "ANSWERED").length,
    pending: prayers.filter(p => p.status === "PENDING").length,
  };

  if (status === "unauthenticated" && mounted) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-5 sm:space-y-6 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 sm:bottom-8 sm:left-auto sm:right-6 sm:translate-x-0 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border max-w-[92vw] sm:max-w-md backdrop-blur-xl transition-all ${
              toast.type === "success" ? "bg-emerald-600 text-white border-emerald-400/40 shadow-emerald-600/30" :
              toast.type === "error"   ? "bg-red-600 text-white border-red-400/40 shadow-red-600/30" :
                                         "bg-purple-600 text-white border-purple-400/40 shadow-purple-600/30"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" /> :
             toast.type === "error"   ? <AlertCircle className="w-4 h-4 flex-shrink-0 text-white" /> :
                                        <Bell className="w-4 h-4 flex-shrink-0 text-white" />}
            <span className="leading-snug whitespace-normal">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-white/5 shadow-xs">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{pt.title}</h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-600 text-white border border-rose-500 shadow-xs">
              <Heart className="w-3 h-3 text-white fill-white/20" /> {pt.wallTag}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium italic border-l-2 border-rose-500 pl-2.5 py-0.5">
            {pt.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          {mounted && lastSynced && (
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">
              {pt.updated} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-rose-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isFormOpen ? pt.closeFormBtn : pt.openFormBtn}</span>
          </button>
          <button
            onClick={() => load(false)}
            disabled={refreshing}
            className="p-2.5 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Refresh prayer wall"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-rose-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Interactive Stat Cards (Fitts' Law: Click to Filter) ── */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {[
          {
            tab: "ALL" as FilterStatus,
            label: pt.totalSubmitted,
            value: stats.total,
            icon: Heart,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-950/40",
            border: filterStatus === "ALL" ? "ring-2 ring-rose-500 border-rose-500 shadow-md" : "border-gray-100 dark:border-white/5",
          },
          {
            tab: "PRAYING" as FilterStatus,
            label: pt.beingPrayed,
            value: stats.praying,
            icon: Sparkles,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-950/40",
            border: filterStatus === "PRAYING" ? "ring-2 ring-purple-500 border-purple-500 shadow-md" : "border-gray-100 dark:border-white/5",
          },
          {
            tab: "ANSWERED" as FilterStatus,
            label: pt.answered,
            value: stats.answered,
            icon: CheckCircle2,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/40",
            border: filterStatus === "ANSWERED" ? "ring-2 ring-emerald-500 border-emerald-500 shadow-md" : "border-gray-100 dark:border-white/5",
          },
        ].map(({ tab, label, value, icon: Icon, color, bg, border }) => (
          <button
            key={label}
            type="button"
            onClick={() => setFilterStatus(tab)}
            className={`bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border shadow-sm p-3 sm:p-4.5 flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3.5 transition-all active:scale-[0.98] cursor-pointer ${border}`}
          >
            <div className={`w-8 h-8 sm:w-11 sm:h-11 ${bg} rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-xs`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                {loading ? "—" : value}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-extrabold mt-1 truncate">
                {label}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Collapsible Prayer Submission Form ──────────────── */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 shadow-xl p-5 sm:p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-xs">
                    <Heart className="w-5 h-5 fill-rose-500/20" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg leading-tight">{pt.formTitle}</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{pt.formSub}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    {pt.inputTitle}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder={pt.placeholderTitle}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all text-xs sm:text-sm font-medium"
                  />
                </div>

                {/* Category Chips (Thumb-Friendly Tap Selector) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    {pt.inputCategory}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATS.map(c => {
                      const isSelected = category === c.value;
                      const label = catsDict[c.value as keyof typeof catsDict] || c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setCategory(c.value)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-rose-600 text-white shadow-xs font-extrabold scale-102"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          <span>{c.emoji}</span>
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    {pt.inputYourPrayer}
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    placeholder={pt.placeholderPrayer}
                    rows={4}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all resize-none text-xs sm:text-sm font-medium leading-relaxed"
                  />
                </div>

                {/* Confidential / Anonymous Checkbox + Submit Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={e => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5 font-semibold">
                      <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                      <span>{pt.anonymousLabel}</span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{pt.btnSubmitting}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{pt.btnSubmit}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pastoral Care Intercession Banner ───────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-50 via-rose-50/50 to-purple-50 dark:from-purple-950/40 dark:via-rose-950/20 dark:to-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Church className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
              {pt.pastoralBannerTitle}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed max-w-2xl">
              {pt.pastoralBannerDesc}
            </p>
          </div>
        </div>

        <a
          href="tel:+919505288171"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shrink-0 transition-all shadow-xs active:scale-95"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{pt.pastoralCallBtn}</span>
        </a>
      </div>

      {/* ── Responsive Filter Pill Bar (100% Non-Truncating) ── */}
      <div className="w-full bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-white/5 rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
        {(["ALL", "PRAYING", "ANSWERED", "PENDING"] as FilterStatus[]).map(f => {
          const count =
            f === "ALL" ? stats.total :
            f === "PRAYING" ? stats.praying :
            f === "ANSWERED" ? stats.answered :
            stats.pending;

          const label =
            f === "ALL" ? pt.tabAll :
            f === "PRAYING" ? pt.tabPraying :
            f === "ANSWERED" ? pt.tabAnswered :
            pt.tabPending;

          const isActive = filterStatus === f;
          return (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-xs font-black"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span>{label}</span>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${
                isActive ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Prayer Cards Grid ───────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-white dark:bg-gray-900 rounded-3xl animate-pulse border border-gray-100 dark:border-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 sm:py-16 px-4 sm:px-6 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-white/10 shadow-sm max-w-xl mx-auto"
        >
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-center justify-center mx-auto mb-3.5 text-rose-600 dark:text-rose-400 shadow-xs">
            <Heart className="w-7 h-7 fill-rose-500/20" />
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white mb-1.5">
            {filterStatus === "ALL" ? pt.noPrayersAll : pt.noPrayersFilter.replace("{status}", filterStatus === "PRAYING" ? pt.tabPraying : filterStatus === "ANSWERED" ? pt.tabAnswered : pt.tabPending)}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto mb-5 font-medium">
            Submit your prayer request using the form. Our pastors and prayer team intercede daily.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-2xl font-extrabold text-xs shadow-md shadow-rose-500/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            + {pt.formTitle}
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((prayer, i) => {
              const cfg = STATUS_CFG[prayer.status];
              const cat = CATS.find(c => c.value === prayer.category);
              const statusDict = pt.statuses[prayer.status];

              return (
                <motion.div
                  key={prayer.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-white dark:bg-gray-900 rounded-3xl border shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between backdrop-blur-xl h-full ${
                    prayer.status === "ANSWERED"
                      ? "border-emerald-300 dark:border-emerald-900/40 shadow-emerald-500/5 ring-1 ring-emerald-400/20"
                      : prayer.status === "PRAYING"
                      ? "border-purple-300 dark:border-purple-900/40 shadow-purple-500/5 ring-1 ring-purple-400/20"
                      : "border-gray-200/80 dark:border-white/5"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Emoji, Title & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-2xl shrink-0">{cat?.emoji || "🙏"}</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base leading-snug truncate">
                            {prayer.title}
                          </h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">
                            {catsDict[prayer.category as keyof typeof catsDict] || prayer.category}
                          </p>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${cfg.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span>{statusDict.label}</span>
                      </span>
                    </div>

                    {/* Prayer Description */}
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-l-2 border-rose-500/50 pl-3 py-0.5 font-medium line-clamp-4">
                      {prayer.description}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="flex justify-between items-center text-[10.5px] text-gray-400 dark:text-gray-500 font-semibold pt-3 border-t border-gray-100 dark:border-white/5 mt-4">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{new Date(prayer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </span>

                    {prayer.isAnonymous && (
                      <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 text-[10px] font-extrabold shrink-0">
                        <EyeOff className="w-3 h-3" />
                        <span>{pt.tagAnonymous}</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
