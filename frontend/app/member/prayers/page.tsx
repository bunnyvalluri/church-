"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Heart, Send, Check, Clock, EyeOff, Sparkles, Loader2,
  RefreshCw, Bell, MessageCircle, CheckCircle2, AlertCircle, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  PENDING:  { dot: "bg-amber-400",  pill: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40" },
  PRAYING:  { dot: "bg-purple-500 animate-pulse", pill: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40" },
  ANSWERED: { dot: "bg-emerald-500",  pill: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40" },
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
    FAMILY: "Family & Relations",
    FINANCIAL: "Financial Needs",
    SPIRITUAL: "Spiritual Guidance",
    GUIDANCE: "Direction & Choices",
    THANKSGIVING: "Thanksgiving & Praise",
    OTHER: "Other Requests"
  },
  te: {
    HEALTH: "ఆరోగ్యం & స్వస్థత",
    FAMILY: "కుటుంబం & సంబంధాలు",
    FINANCIAL: "ఆర్థిక అవసరాలు",
    SPIRITUAL: "ఆత్మీయ నడిపింపు",
    GUIDANCE: "మార్గదర్శకత్వం & ఎంపికలు",
    THANKSGIVING: "కృతజ్ఞతాస్తుతులు & స్తుతి",
    OTHER: "ఇతర విన్నపాలు"
  },
  hi: {
    HEALTH: "स्वास्थ्य और चंगाई",
    FAMILY: "परिवार और संबंध",
    FINANCIAL: "वित्तीय आवश्यकताएं",
    SPIRITUAL: "आध्यात्मिक मार्गदर्शन",
    GUIDANCE: "मार्गदर्शन और विकल्प",
    THANKSGIVING: "धन्यवाद और स्तुति",
    OTHER: "अन्य प्रार्थना विषय"
  }
};

const prayersTranslations = {
  en: {
    title: "Prayer Requests",
    subtitle: '"Where two or three gather in My name, there am I." — Matthew 18:20',
    updated: "Updated",
    refresh: "Refresh",
    totalSubmitted: "Total Submitted",
    beingPrayed: "Being Prayed",
    answered: "Answered",
    formTitle: "New Prayer Request",
    inputTitle: "Title *",
    inputCategory: "Category",
    inputYourPrayer: "Your Prayer *",
    anonymousLabel: "Submit anonymously",
    btnSubmit: "Submit Request",
    btnSubmitting: "Submitting...",
    placeholderTitle: "e.g. Healing for my mother",
    placeholderPrayer: "Share your heart with us... our pastors will pray specifically for your situation.",
    successSubmit: "Prayer request submitted! Our pastoral team will intercede for you 🙏",
    failSubmit: "Failed to submit prayer request",
    loadError: "Could not load prayer requests",
    notifyAnswered: "🙌 One of your prayers has been answered!",
    notifyPraying: "🙏 Pastors are now praying for your request",
    tabAll: "All",
    tabPraying: "Praying",
    tabAnswered: "Answered",
    tabPending: "Pending",
    noPrayersAll: "No prayer requests yet — share your heart!",
    noPrayersFilter: "No {status} requests",
    tagAnonymous: "Anonymous",
    statuses: {
      PENDING: { label: "Pending Review", desc: "Awaiting pastoral review" },
      PRAYING: { label: "Being Prayed For", desc: "Pastors interceding" },
      ANSWERED: { label: "Answered 🙌", desc: "Praise God!" }
    }
  },
  te: {
    title: "ప్రార్థన విన్నపాలు",
    subtitle: '"ఇద్దరు లేక ముగ్గురు నా నామమున ఎక్కడ కూడియుందురో అక్కడ నేను వారి మధ్యన ఉందును." — మత్తయి 18:20',
    updated: "సమకాలీకరించబడింది",
    refresh: "రిఫ్రెష్",
    totalSubmitted: "మొత్తం విన్నపాలు",
    beingPrayed: "ప్రార్థిస్తున్నవి",
    answered: "జవాబు లభించినవి",
    formTitle: "కొత్త ప్రార్థన విన్నపం",
    inputTitle: "అంశం *",
    inputCategory: "విభాగం",
    inputYourPrayer: "మీ ప్రార్థన విన్నపం *",
    anonymousLabel: "పేరు లేకుండా సమర్పించండి",
    btnSubmit: "సమర్పించు",
    btnSubmitting: "సమర్పించబడుతోంది...",
    placeholderTitle: "ఉదా. నా తల్లి ఆరోగ్యం కొరకు",
    placeholderPrayer: "మీ హృదయాన్ని మాతో పంచుకోండి... మా పాస్టర్లు మీ కొరకు ప్రార్థిస్తారు.",
    successSubmit: "ప్రార్థన విన్నపం సమర్పించబడింది! మా పాస్టర్ల బృందం మీ కొరకు ప్రార్థిస్తుంది 🙏",
    failSubmit: "ప్రార్థన విన్నపం సమర్పించడం విఫలమైంది",
    loadError: "ప్రార్థన విన్నపాలను లోడ్ చేయడం వీలుపడలేదు",
    notifyAnswered: "🙌 మీ ప్రార్థనలలో ఒకదానికి దేవుడు జవాబిచ్చాడు!",
    notifyPraying: "🙏 పాస్టర్లు ఇప్పుడు మీ ప్రార్థన విన్నపం కొరకు ప్రార్థిస్తున్నారు",
    tabAll: "అన్నీ",
    tabPraying: "ప్రార్థిస్తున్నవి",
    tabAnswered: "జవాబులు",
    tabPending: "పరిశీలనలో",
    noPrayersAll: "ఇంకా ప్రార్థన విన్నపాలు ఏవీ లేవు — మీ విన్నపాన్ని పంచుకోండి!",
    noPrayersFilter: "ఎటువంటి {status} విన్నపాలు లేవు",
    tagAnonymous: "పేరులేనివి",
    statuses: {
      PENDING: { label: "పరిశీలనలో ఉంది", desc: "పాస్టర్ల పరిశీలన కొరకు వేచి ఉంది" },
      PRAYING: { label: "ప్రార్థిస్తున్నారు", desc: "పాస్టర్లు ప్రార్థిస్తున్నారు" },
      ANSWERED: { label: "జవాబు లభించింది 🙌", desc: "దేవునికి స్తోత్రం!" }
    }
  },
  hi: {
    title: "प्रार्थना अनुरोध",
    subtitle: '"जहाँ दो या तीन मेरे नाम पर इकट्ठा होते हैं, वहाँ मैं उनके बीच में हूँ।" — मत्ती 18:20',
    updated: "अपडेट किया गया",
    refresh: "रिफ्रेश",
    totalSubmitted: "कुल अनुरोध",
    beingPrayed: "प्रार्थना जारी",
    answered: "उत्तर मिला",
    formTitle: "नया प्रार्थना अनुरोध",
    inputTitle: "शीर्षक *",
    inputCategory: "श्रेणी",
    inputYourPrayer: "आपकी प्रार्थना *",
    anonymousLabel: "गुप्त रूप से भेजें",
    btnSubmit: "अनुरोध भेजें",
    btnSubmitting: "भेजा जा रहा है...",
    placeholderTitle: "जैसे: मेरी माँ के स्वास्थ्य के लिए",
    placeholderPrayer: "अपना दिल हमसे साझा करें... हमारे पादरी आपकी परिस्थिति के लिए विशेष रूप से प्रार्थना करेंगे।",
    successSubmit: "प्रार्थना अनुरोध भेजा गया! हमारी पादरी टीम आपके लिए प्रार्थना करेगी 🙏",
    failSubmit: "प्रार्थना अनुरोध भेजने में विफल",
    loadError: "प्रार्थना अनुरोध लोड नहीं किए जा सके",
    notifyAnswered: "🙌 आपकी एक प्रार्थना का उत्तर मिल गया है!",
    notifyPraying: "🙏 पादरी अब आपके अनुरोध के लिए प्रार्थना कर रहे हैं",
    tabAll: "सभी",
    tabPraying: "प्रार्थना जारी",
    tabAnswered: "उत्तर मिला",
    tabPending: "लंबित",
    noPrayersAll: "अभी तक कोई प्रार्थना अनुरोध नहीं है — अपना दिल साझा करें!",
    noPrayersFilter: "कोई {status} अनुरोध नहीं है",
    tagAnonymous: "अनाम",
    statuses: {
      PENDING: { label: "समीक्षा लंबित", desc: "पादरी की समीक्षा की प्रतीक्षा है" },
      PRAYING: { label: "प्रार्थना की जा रही है", desc: "पादरी प्रार्थना कर रहे हैं" },
      ANSWERED: { label: "उत्तर मिला 🙌", desc: "परमेश्वर की स्तुति हो!" }
    }
  }
};

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
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [status, user, load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const temp: PrayerRequest = {
      id: `temp_${Date.now()}`, title, description, category,
      isAnonymous, status: "PENDING", createdAt: new Date().toISOString(),
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
        setTitle(""); setDescription(""); setIsAnonymous(false);
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
  };

  if (status === "unauthenticated" && mounted) return null;

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6">
      {/* Floating Bottom Pop-Up Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 sm:bottom-8 sm:left-auto sm:right-6 sm:translate-x-0 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border max-w-[92vw] sm:max-w-md backdrop-blur-xl transition-all ${
              toast.type === "success" ? "bg-emerald-600 text-white border-emerald-400/40 shadow-emerald-600/30" :
              toast.type === "error"   ? "bg-red-600 text-white border-red-400/40 shadow-red-600/30" :
                                         "bg-rose-600 text-white border-rose-400/40 shadow-rose-600/30"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" /> :
             toast.type === "error"   ? <AlertCircle className="w-4 h-4 flex-shrink-0 text-white" /> :
                                        <Bell className="w-4 h-4 flex-shrink-0 text-white" />}
            <span className="leading-snug whitespace-normal">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between gap-3 mb-1 sm:mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">{pt.title}</h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <Heart className="w-3 h-3 fill-rose-500/20" /> Prayer Wall
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 italic">{pt.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {mounted && lastSynced && (
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
              {pt.updated} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => load()}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-700 transition-all text-xs font-semibold shadow-sm active:scale-95"
            title="Refresh prayer wall"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-rose-600" : ""}`} />
            <span className="hidden sm:inline">{pt.refresh}</span>
          </button>
        </div>
      </div>

      {/* STATS ROW — 3-Column Compact Grid on Mobile */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { label: pt.totalSubmitted, value: stats.total, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40", icon: Heart },
          { label: pt.beingPrayed,   value: stats.praying, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40", icon: Sparkles },
          { label: pt.answered,       value: stats.answered, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40", icon: CheckCircle2 },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-md p-2.5 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-3.5 transition-transform active:scale-[0.98]"
          >
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${bg} border rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                {loading ? "—" : value}
              </p>
              <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-extrabold mt-1 truncate">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 items-start">
        {/* SUBMIT FORM */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xl overflow-hidden backdrop-blur-xl"
        >
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 dark:border-gray-800/80 bg-rose-50/50 dark:bg-rose-950/20">
            <div className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Heart className="w-4 h-4 fill-rose-500/20" />
            </div>
            <h3 className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base">{pt.formTitle}</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">{pt.inputTitle}</label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)} required
                placeholder={pt.placeholderTitle}
                className="w-full py-2.5 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent focus:outline-none transition-all text-xs sm:text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">{pt.inputCategory}</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent focus:outline-none transition-all text-xs sm:text-sm font-medium">
                {CATS.map(c => <option key={c.value} value={c.value}>{c.emoji} {catsDict[c.value as keyof typeof catsDict] || c.value}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">{pt.inputYourPrayer}</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)} required
                placeholder={pt.placeholderPrayer}
                rows={4}
                className="w-full py-2.5 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent focus:outline-none transition-all resize-none text-xs sm:text-sm font-medium leading-relaxed"
              />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${isAnonymous ? "bg-rose-600 border-rose-600" : "border-gray-300 dark:border-gray-600"}`}
              >
                {isAnonymous && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                <EyeOff className="w-3.5 h-3.5 text-gray-400" /> {pt.anonymousLabel}
              </span>
            </label>
            <button
              type="submit" disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{pt.btnSubmitting}</> : <><Send className="w-4 h-4" />{pt.btnSubmit}</>}
            </button>
          </form>
        </motion.div>

        {/* PRAYER LIST & FILTERS */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-3 space-y-3.5 w-full min-w-0"
        >
          {/* Responsive Filter Tab Bar — Smooth Horizontal Scroll with No Text Cutoffs */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-1.5 shadow-sm overflow-x-auto scrollbar-none flex items-center gap-1 min-w-0">
            {(["ALL", "PENDING", "PRAYING", "ANSWERED"] as FilterStatus[]).map(f => {
              const count = f === "ALL" ? stats.total : f === "PRAYING" ? stats.praying : f === "ANSWERED" ? stats.answered : prayers.filter(p => p.status === "PENDING").length;
              const label = f === "ALL" ? pt.tabAll : f === "PRAYING" ? pt.tabPraying : f === "ANSWERED" ? pt.tabAnswered : pt.tabPending;
              return (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${
                    filterStatus === f
                      ? "bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-md"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span>{label}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${filterStatus === f ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List Content */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white dark:bg-gray-900 rounded-3xl animate-pulse border border-gray-100 dark:border-gray-800" />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 sm:py-16 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-rose-600 dark:text-rose-400">
                <Heart className="w-7 h-7 fill-rose-500/20" />
              </div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                {filterStatus === "ALL" ? pt.noPrayersAll : pt.noPrayersFilter.replace("{status}", filterStatus === "PRAYING" ? pt.tabPraying : filterStatus === "ANSWERED" ? pt.tabAnswered : pt.tabPending)}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
                Submit your prayer request using the form. Our pastors and prayer team intercede daily.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((prayer, i) => {
                const cfg = STATUS_CFG[prayer.status];
                const cat = CATS.find(c => c.value === prayer.category);
                const statusDict = pt.statuses[prayer.status];
                return (
                  <motion.div
                    key={prayer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: i * 0.04 }}
                    className={`bg-white dark:bg-gray-900 rounded-3xl border shadow-md hover:shadow-lg transition-all p-4.5 sm:p-5 backdrop-blur-xl ${
                      prayer.status === "ANSWERED" ? "border-emerald-300 dark:border-emerald-900/40 shadow-emerald-500/5" :
                      prayer.status === "PRAYING"  ? "border-purple-300 dark:border-purple-900/40 shadow-purple-500/5" :
                                                     "border-gray-100 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl flex-shrink-0">{cat?.emoji || "🙏"}</span>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base leading-tight truncate">{prayer.title}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{catsDict[prayer.category as keyof typeof catsDict] || prayer.category}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex-shrink-0 ${cfg.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {statusDict.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-l-2 border-rose-500/40 dark:border-rose-400/30 pl-3 mb-3 font-medium">
                      {prayer.description}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 font-semibold pt-1 border-t border-gray-100 dark:border-gray-800/80">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        {new Date(prayer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {prayer.isAnonymous && (
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                          <EyeOff className="w-3 h-3" /> {pt.tagAnonymous}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
}
