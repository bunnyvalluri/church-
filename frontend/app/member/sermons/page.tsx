"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  BookOpen, User, Calendar, Play, Video, Volume2,
  RefreshCw, Bell, Search, Clock, Tag, Headphones,
  TrendingUp, Eye
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
  GOSPEL:   "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900/30",
  WORSHIP:  "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900/30",
  PRAYER:   "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/30",
  TEACHING: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/30",
};
const DEFAULT_CAT = "bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/30 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/10";
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
    ALL: "అన్ని విభాగాలు",
    GOSPEL: "సువార్త",
    WORSHIP: "ఆరాధన & స్తుతి",
    PRAYER: "ప్రార్థన & ఉపవాసం",
    TEACHING: "బోధన & సిద్ధాంతం",
  },
  hi: {
    ALL: "सभी श्रेणियां",
    GOSPEL: "सुसमाचार",
    WORSHIP: "आराधना और स्तुति",
    PRAYER: "प्रार्थना और उपवास",
    TEACHING: "शिक्षा और सिद्धांत",
  }
};

const sermonsTranslations = {
  en: {
    title: "Sermon Library",
    subtitle: "Life-changing messages from Bishop Kurra Kristhu Raju Garu",
    updated: "Updated",
    refresh: "Refresh",
    totalSermons: "Total Sermons",
    withVideo: "With Video",
    audioOnly: "Audio Only",
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
    totalSermons: "మొత్తం ప్రసంగాలు",
    withVideo: "వీడియోతో ఉన్నవి",
    audioOnly: "ఆడియో మాత్రమే",
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
    totalSermons: "कुल उपदेश",
    withVideo: "वीडियो के साथ",
    audioOnly: "केवल ऑडियो",
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

  if (!mounted || status === "loading" || status === "unauthenticated") return null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 sm:space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold border max-w-[90vw] sm:max-w-xs bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]/30">
            <Bell className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">{st.title}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{st.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {mounted && lastSynced && <span className="text-xs text-gray-400 dark:text-gray-555 hidden sm:inline">{st.updated} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
          <button onClick={() => fetch_()} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))]/20 dark:hover:border-[hsl(var(--primary))]/30 transition-all text-xs font-semibold shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{st.refresh}</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: st.totalSermons, value: sermons.length,                             icon: BookOpen,   color: "text-[hsl(var(--primary))]", bg: "bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/30" },
          { label: st.withVideo,    value: sermons.filter(s => s.videoUrl).length,     icon: Video,      color: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-50 dark:bg-rose-950/30"    },
          { label: st.audioOnly,    value: sermons.filter(s => s.audioUrl && !s.videoUrl).length, icon: Headphones, color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/30"  },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">{loading ? "—" : value}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-555 uppercase tracking-wide font-semibold mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={st.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent focus:outline-none transition-all text-sm shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-nowrap max-w-full">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
                activeCategory === cat
                  ? "bg-[hsl(var(--primary))] text-white border-transparent shadow-md"
                  : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white"
              }`}>{catsDict[cat as keyof typeof catsDict] || cat}</button>
          ))}
        </div>
      </div>

      {/* Sermon Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-72 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-650 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">{search ? st.noResults.replace("{query}", search) : st.noSermons}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-lg hover:border-[hsl(var(--primary))]/30 dark:hover:border-[hsl(var(--primary))]/25 transition-all group flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-slate-900 overflow-hidden flex-shrink-0">
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
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-md hover:bg-[hsl(var(--primary))] border border-white/40 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </a>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full border ${catStyle}`}>
                        {catsDict[sermon.category as keyof typeof catsDict] || sermon.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {sermon.videoUrl && <div className="w-5 h-5 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"><Video className="w-2.5 h-2.5 text-white" /></div>}
                        {sermon.audioUrl && <div className="w-5 h-5 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"><Volume2 className="w-2.5 h-2.5 text-white" /></div>}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-1 group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
                      {sermon.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3 flex-1">
                      {sermon.description}
                    </p>
                    {sermon.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {sermon.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-550 rounded-md border border-gray-100 dark:border-gray-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-555 border-t border-gray-100 dark:border-gray-800 pt-3 mb-3">
                      <span className="flex items-center gap-1 font-medium"><User className="w-3 h-3 text-[hsl(var(--primary))]/80" />{sermon.pastor}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[hsl(var(--primary))]/80" />{new Date(sermon.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    <div className="flex gap-2">
                      {sermon.videoUrl && (
                        <a href={sermon.videoUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2 bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/30 text-[hsl(var(--primary))] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-all border border-[hsl(var(--primary))]/20">
                          <Video className="w-3.5 h-3.5" />{st.btnWatch}
                        </a>
                      )}
                      {sermon.audioUrl && (
                        <a href={sermon.audioUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700">
                          <Volume2 className="w-3.5 h-3.5" />{st.btnListen}
                        </a>
                      )}
                      {!sermon.videoUrl && !sermon.audioUrl && (
                        <span className="flex-1 py-2 text-center text-[11px] text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
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
