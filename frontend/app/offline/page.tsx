"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff, RotateCw, Home, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function OfflinePage() {
  const { language } = useLanguage();
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    if (typeof navigator !== "undefined" && navigator.onLine) {
      window.location.reload();
      return;
    }
    setTimeout(() => {
      setIsChecking(false);
    }, 1200);
  };

  const content = {
    en: {
      badge: "Offline Mode",
      title: "No Internet Connection",
      desc: "It looks like you are currently offline. Any changes you make will be safely saved locally and synchronized as soon as your network connection is restored.",
      retry: "Retry Connection",
      checking: "Checking connection...",
      home: "Go to Home",
      feature1: "Cached sermons and prayer notes remain accessible",
      feature2: "Offline submissions will automatically sync when online",
    },
    te: {
      badge: "ఆఫ్‌లైన్ మోడ్",
      title: "ఇంటర్నెట్ కనెక్షన్ లేదు",
      desc: "మీరు ప్రస్తుతం ఆఫ్‌లైన్‌లో ఉన్నారు. మీరు చేసే మార్పులు సురక్షితంగా సేవ్ చేయబడతాయి మరియు నెట్‌వర్క్ కనెక్ట్ కాగానే ఆటోమేటిక్‌గా సింక్ అవుతాయి.",
      retry: "మళ్ళీ ప్రయత్నించండి",
      checking: "కనెక్షన్‌ని తనిఖీ చేస్తోంది...",
      home: "హోమ్‌కు వెళ్ళండి",
      feature1: "కాష్ చేయబడిన ప్రసంగాలు అందుబాటులో ఉంటాయి",
      feature2: "ఆన్‌లైన్‌లోకి రాగానే ఆటోమేటిక్ సింక్ ప్రారంభమవుతుంది",
    },
    hi: {
      badge: "ऑफ़लाइन मोड",
      title: "इंटरनेट कनेक्शन नहीं है",
      desc: "ऐसा लगता है कि आप वर्तमान में ऑफ़लाइन हैं। आपके द्वारा किए गए बदलाव सुरक्षित रूप से सहेजे जाएंगे और इंटरनेट आते ही सिंक हो जाएंगे।",
      retry: "पुनः प्रयास करें",
      checking: "कनेक्शन जांचा जा रहा है...",
      home: "होम पर जाएं",
      feature1: "कैश किए गए उपदेश उपलब्ध रहेंगे",
      feature2: "ऑनलाइन आते ही डेटा स्वचालित रूप से सिंक हो जाएगा",
    },
  };

  const t = (content as any)[language] || content.en;

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 py-8 font-sans antialiased text-slate-900 dark:text-gray-100 transition-colors duration-300">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[32rem] h-[32rem] rounded-full bg-violet-600/10 dark:bg-violet-900/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[32rem] h-[32rem] rounded-full bg-indigo-600/10 dark:bg-indigo-900/15 blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg p-6 sm:p-10 rounded-3xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-2xl text-center flex flex-col items-center">
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
          <WifiOff className="w-3.5 h-3.5" />
          <span>{t.badge}</span>
        </div>

        {/* Icon */}
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20">
          <WifiOff className="h-10 w-10 text-white" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
          {t.title}
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 mb-6 leading-relaxed max-w-md">
          {t.desc}
        </p>

        {/* Highlights */}
        <div className="w-full bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 mb-6 text-left space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-gray-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{t.feature1}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-gray-300">
            <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
            <span>{t.feature2}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isChecking}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 active:scale-95 transition-all duration-300 disabled:opacity-60 cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
            <span>{isChecking ? t.checking : t.retry}</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-xs sm:text-sm active:scale-95 transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            <span>{t.home}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
