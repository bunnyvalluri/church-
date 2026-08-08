"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  BookOpen, User, Calendar, Play, Video, Volume2,
  RefreshCw, Bell, Search, Clock, Tag, Headphones,
  TrendingUp, Eye, CheckCircle2, AlertCircle, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Sermon {
  id: string;
  title: string;
  description: string;
  pastor: string;
  date: string;
  videoUrl: string | null;
  audioUrl: string | null;
  thumbnail: string | null;
  category: string;
  tags: string[];
}

const CAT_STYLE: Record<string, string> = {
  GOSPEL:   "bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-100 border-purple-300 dark:border-purple-500/50",
  WORSHIP:  "bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-100 border-rose-300 dark:border-rose-500/50",
  PRAYER:   "bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-100 border-amber-300 dark:border-amber-500/50",
  TEACHING: "bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-100 border-blue-300 dark:border-blue-500/50",
};
const DEFAULT_CAT = "bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-100 border-purple-300 dark:border-purple-500/50";
const THUMB = "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=600";

const categoryTranslations = {
  en: {
    ALL: "All Categories",
    GOSPEL: "Gospel",
    WORSHIP: "Worship & Praise",
    PRAYER: "Prayer & Fasting",
    TEACHING: "Teaching & Doctrine",
  },
  te: {
    ALL: "అన్నీ",
    GOSPEL: "సువార్త",
    WORSHIP: "ఆరాధన & స్తుతి",
    PRAYER: "ప్రార్థన",
    TEACHING: "బోధన",
  },
  hi: {
    ALL: "सभी श्रेणियां",
    GOSPEL: "सुसमाचार",
    WORSHIP: "आराधना और स्तुति",
    PRAYER: "प्रार्थना",
    TEACHING: "शिक्षा",
  }
};

const sermonsTranslations = {
  en: {
    title: "Sermon Library",
    subtitle: "Life-changing messages from Bishop Kurra Kristhu Raju Garu",
    updated: "Updated",
    refresh: "Refresh",
    totalSermons: "Total",
    withVideo: "Video",
    audioOnly: "Audio",
    searchPlaceholder: "Search sermons, pastor, or topic...",
    newSermonsToast: "new sermon(s) published!",
    loadError: "Could not load sermons",
    noResults: 'No results for "{query}"',
    noSermons: "No sermons published yet",
    btnWatch: "Watch Video",
    btnListen: "Listen",
    mediaComingSoon: "Media coming soon",
  },
  te: {
    title: "ప్రసంగాల గ్రంథాలయం",
    subtitle: "బిషప్ కుర్రా క్రీస్తు రాజు గారి నుండి జీవితాన్ని మార్చే సందేశాలు",
    updated: "సమకాలీకరించబడింది",
    refresh: "రిఫ్రెష్",
    totalSermons: "మొత్తం",
    withVideo: "వీడియో",
    audioOnly: "ఆడియో",
    searchPlaceholder: "ప్రసంగాలు, పాస్టర్ లేదా అంశాల కోసం వెతకండి...",
    newSermonsToast: "కొత్త ప్రసంగం(లు) ప్రచురించబడ్డాయి!",
    loadError: "ప్రసంగాలను లోడ్ చేయడం వీలుపడలేదు",
    noResults: '"{query}" కొరకు ఫలితాలు ఏవీ లేవు',
    noSermons: "ఇంకా ప్రసంగాలు ప్రచురించబడలేదు",
    btnWatch: "వీడియో వీక్షించండి",
    btnListen: "వినండి",
    mediaComingSoon: "మీడియా త్వరలో అందుబాటులోకి వస్తుంది",
  },
  hi: {
    title: "उपदेश पुस्तकालय",
    subtitle: "बिशप कुर्रा क्रिस्तु राजू गारू के जीवन बदलने वाले संदेश",
    updated: "अपडेट किया गया",
    refresh: "रिफ्रेश",
    totalSermons: "कुल",
    withVideo: "वीडियो",
    audioOnly: "ऑडियो",
    searchPlaceholder: "उपदेश, पादरी या विषय खोजें...",
    newSermonsToast: "नए उपदेश प्रकाशित किए गए!",
    loadError: "उपदेश लोड नहीं किए जा सके",
    noResults: '"{query}" के लिए कोई परिणाम नहीं मिला',
    noSermons: "अभी तक कोई उपदेश प्रकाशित नहीं हुआ है",
    btnWatch: "वीडियो देखें",
    btnListen: "सुनें",
    mediaComingSoon: "मीडिया जल्द ही आ रहा है",
  }
};

export default function MemberSermons() {
  const { status, mounted } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const st = sermonsTranslations[language as keyof typeof sermonsTranslations] || sermonsTranslations.en;
  const catsDict = categoryTranslations[language as keyof typeof categoryTranslations] || categoryTranslations.en;

  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [toast, setToast] = useState<{ msg: string } | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const prevCount = useRef(0);

  const showToast = (msg: string) => { setToast({ msg }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  const fetch_ = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/pastor/sermons?t=${Date.now()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const fresh: Sermon[] = data.sermons || [];
        if (prevCount.current && fresh.length > prevCount.current) showToast(`${fresh.length - prevCount.current} ${st.newSermonsToast}`);
        prevCount.current = fresh.length;
        setSermons(fresh);
        setLastSynced(new Date());
      }
    } catch { if (!silent) showToast(st.loadError); }
    finally { setLoading(false); setRefreshing(false); }
  }, [st.newSermonsToast, st.loadError]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch_();
      interval.current = setInterval(() => fetch_(true), 30000);
    }
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [status, fetch_]);

  const categories = ["ALL", ...Array.from(new Set(sermons.map(s => s.category).filter(Boolean)))];

  const filtered = sermons.filter(s => {
    const matchCat = activeCategory === "ALL" || s.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.pastor?.toLowerCase().includes(q) || (s.tags || []).some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:bottom-8 sm:left-auto sm:right-6 sm:translate-x-0 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border max-w-[92vw] sm:max-w-md backdrop-blur-xl bg-purple-600 text-white border-purple-400/40 shadow-purple-600/30 transition-all"
          >
            <Bell className="w-4 h-4 flex-shrink-0 text-white" />
            <span className="leading-snug whitespace-normal">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between gap-3 mb-1 sm:mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">{st.title}</h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <BookOpen className="w-3 h-3" /> Library
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{st.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {mounted && lastSynced && (
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
              {st.updated} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => fetch_()}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-all text-xs font-semibold shadow-sm active:scale-95"
            title="Refresh sermon library"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-purple-600" : ""}`} />
            <span className="hidden sm:inline">{st.refresh}</span>
          </button>
        </div>
      </div>

      {/* STATS ROW — 3-Column Compact Grid on Mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: st.totalSermons, value: sermons.length,                             icon: BookOpen,   color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40" },
          { label: st.withVideo,    value: sermons.filter(s => s.videoUrl).length,     icon: Video,      color: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40"    },
          { label: st.audioOnly,    value: sermons.filter(s => s.audioUrl && !s.videoUrl).length, icon: Headphones, color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40"  },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-md p-2.5 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-3.5 transition-transform active:scale-[0.98]"
          >
            <div className={`w-7 h-7 sm:w-10 sm:h-10 ${bg} border rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <Icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                {loading ? "—" : value}
              </p>
              <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-extrabold mt-1 whitespace-nowrap">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CONTROLS: Search Input & Category Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={st.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all text-xs sm:text-sm font-medium shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-nowrap max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all border whitespace-nowrap flex-shrink-0 shadow-xs ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-md"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-purple-300 dark:hover:border-purple-700"
              }`}
            >
              {catsDict[cat as keyof typeof catsDict] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* SERMON GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 bg-white dark:bg-gray-900 rounded-3xl animate-pulse border border-gray-100 dark:border-gray-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 sm:py-16 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-purple-600 dark:text-purple-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
            {search ? st.noResults.replace("{query}", search) : st.noSermons}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
            Check back soon for life-changing messages, Sunday sermons, and video archives.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
          <AnimatePresence mode="popLayout">
            {filtered.map((sermon, i) => {
              const catStyle = CAT_STYLE[sermon.category] || DEFAULT_CAT;
              return (
                <motion.article
                  key={sermon.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-md overflow-hidden hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700/60 transition-all group flex flex-col backdrop-blur-xl"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden flex-shrink-0">
                    <Image
                      src={sermon.thumbnail || THUMB}
                      alt={sermon.title}
                      fill unoptimized
                      className="object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {sermon.videoUrl && (
                      <a href={sermon.videoUrl} target="_blank" rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-purple-600 border border-white/40 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </a>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                      <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${catStyle}`}>
                        {catsDict[sermon.category as keyof typeof catsDict] || sermon.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {sermon.videoUrl && <div className="w-5 h-5 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"><Video className="w-2.5 h-2.5 text-white" /></div>}
                        {sermon.audioUrl && <div className="w-5 h-5 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"><Volume2 className="w-2.5 h-2.5 text-white" /></div>}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4.5 flex flex-col flex-1">
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base leading-snug mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                      {sermon.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3 flex-1 font-medium">
                      {sermon.description}
                    </p>
                    {sermon.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {sermon.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg border border-gray-100 dark:border-gray-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 font-semibold border-t border-gray-100 dark:border-gray-800/80 pt-3 mb-3">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-purple-500" />{sermon.pastor}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-500" />{new Date(sermon.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    <div className="flex gap-2">
                      {sermon.videoUrl && (
                        <a href={sermon.videoUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-500/20 active:scale-[0.98]">
                          <Video className="w-3.5 h-3.5" />{st.btnWatch}
                        </a>
                      )}
                      {sermon.audioUrl && (
                        <a href={sermon.audioUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 active:scale-[0.98]">
                          <Volume2 className="w-3.5 h-3.5" />{st.btnListen}
                        </a>
                      )}
                      {!sermon.videoUrl && !sermon.audioUrl && (
                        <span className="flex-1 py-2.5 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 font-semibold">
                          {st.mediaComingSoon}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
