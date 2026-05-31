"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Heart, Send, Check, Clock, EyeOff, Sparkles, Loader2,
  RefreshCw, Bell, MessageCircle, CheckCircle2, AlertCircle
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
  PENDING:  { dot: "bg-amber-400",  pill: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30" },
  PRAYING:  { dot: "bg-[hsl(var(--primary))] animate-pulse", pill: "bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/30 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/20" },
  ANSWERED: { dot: "bg-green-500",  pill: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30" },
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
        // Notify on status upgrades
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

  if (!mounted || status === "loading") return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold border max-w-xs leading-snug ${
              toast.type === "success" ? "bg-green-500 text-white border-green-400/30" :
              toast.type === "error"   ? "bg-red-500 text-white border-red-400/30" :
                                         "bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]/30"
            }`}
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{pt.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 italic">{pt.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {lastSynced && <span className="text-xs text-gray-400">{pt.updated} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
          <button onClick={() => load()} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))]/20 dark:hover:border-[hsl(var(--primary))]/30 transition-all text-xs font-semibold">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {pt.refresh}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: pt.totalSubmitted, value: stats.total,    color: "text-[hsl(var(--primary))]",   bg: "bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/30",     icon: Heart },
          { label: pt.beingPrayed,   value: stats.praying,  color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30", icon: Sparkles },
          { label: pt.answered,       value: stats.answered, color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-950/30",   icon: CheckCircle2 },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{loading ? "—" : value}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Submit Form */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/20">
            <Heart className="w-4 h-4 text-[hsl(var(--primary))] fill-[hsl(var(--accent))]/40" />
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{pt.formTitle}</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{pt.inputTitle}</label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)} required
                placeholder={pt.placeholderTitle}
                className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent focus:outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{pt.inputCategory}</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent focus:outline-none transition-all text-sm">
                {CATS.map(c => <option key={c.value} value={c.value}>{c.emoji} {catsDict[c.value as keyof typeof catsDict] || c.value}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{pt.inputYourPrayer}</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)} required
                placeholder={pt.placeholderPrayer}
                rows={4}
                className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent focus:outline-none transition-all resize-none text-sm leading-relaxed"
              />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${isAnonymous ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]" : "border-gray-300 dark:border-gray-600"}`}
              >
                {isAnonymous && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <EyeOff className="w-3.5 h-3.5" /> {pt.anonymousLabel}
              </span>
            </label>
            <button
              type="submit" disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-gradient-start to-gradient-end hover:opacity-90 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/20 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{pt.btnSubmitting}</> : <><Send className="w-4 h-4" />{pt.btnSubmit}</>}
            </button>
          </form>
        </motion.div>

        {/* Prayer List */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-3 space-y-3"
        >
          {/* Filter */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-1 shadow-sm w-fit">
            {(["ALL", "PENDING", "PRAYING", "ANSWERED"] as FilterStatus[]).map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === f ? "bg-[hsl(var(--primary))] text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}>
                {f === "ALL" ? `${pt.tabAll} (${stats.total})` : f === "PRAYING" ? `${pt.tabPraying} (${stats.praying})` : f === "ANSWERED" ? `${pt.tabAnswered} (${stats.answered})` : `${pt.tabPending} (${prayers.filter(p => p.status === "PENDING").length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <Heart className="w-10 h-10 text-gray-300 dark:text-gray-650 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-400">
                {filterStatus === "ALL" ? pt.noPrayersAll : pt.noPrayersFilter.replace("{status}", filterStatus === "PRAYING" ? pt.tabPraying : filterStatus === "ANSWERED" ? pt.tabAnswered : pt.tabPending)}
              </p>
            </div>
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
                    className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm hover:shadow-md transition-all p-4 ${
                      prayer.status === "ANSWERED" ? "border-green-200 dark:border-green-900/30" :
                      prayer.status === "PRAYING"  ? "border-[hsl(var(--primary))]/35 dark:border-[hsl(var(--primary))]/20" :
                                                     "border-gray-100 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg flex-shrink-0">{cat?.emoji || "🙏"}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{prayer.title}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">{catsDict[prayer.category as keyof typeof catsDict] || prayer.category}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border flex-shrink-0 ${cfg.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {statusDict.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-l-2 border-gray-100 dark:border-gray-700 pl-3 mb-3 line-clamp-2">{prayer.description}</p>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(prayer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {prayer.isAnonymous && <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" />{pt.tagAnonymous}</span>}
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
