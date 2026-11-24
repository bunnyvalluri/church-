"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  BookOpen, User, Calendar, Play, Video, Volume2,
  RefreshCw, Bell, Search, Clock, Tag, Headphones,
  Share2, FileText, CheckCircle2, X, Download, Copy,
  Sparkles, Flame, Heart, Shield, Music, BookMarked,
  Filter, Check, ArrowRight, Radio
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SermonCinemaModal = dynamic(
  () => import("@/components/sections/SermonCinemaModal"),
  { ssr: false }
);

interface Sermon {
  id: string;
  title: string;
  description: string;
  pastor: string;
  date: string;
  videoUrl: string | null;
  directVideoUrl?: string | null;
  videoId?: string | null;
  audioUrl: string | null;
  thumbnail: string | null;
  category: string;
  tags: string[];
  duration?: string;
  views?: string | number;
  scripture?: string;
  notes?: string[];
}

// ── Category badge styles ───────────────────────────────────────────────────
const CAT_STYLES: Record<string, string> = {
  ALL: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border-purple-200 dark:border-purple-800",
  FAITH_MIRACLES: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-200 dark:border-amber-800",
  HEALING: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-200 dark:border-rose-800",
  PRAYER: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800",
  HOLY_SPIRIT: "bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200 border-orange-200 dark:border-orange-800",
  WORSHIP: "bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-200 border-pink-200 dark:border-pink-800",
  TEACHING: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-200 dark:border-blue-800",
  GOSPEL: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border-purple-200 dark:border-purple-800",
};
const DEFAULT_CAT_STYLE = "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border-purple-200 dark:border-purple-800";

const STANDARD_CATEGORIES = [
  { key: "ALL", icon: "✨" },
  { key: "FAITH_MIRACLES", icon: "🕊️" },
  { key: "HEALING", icon: "❤️‍🩹" },
  { key: "PRAYER", icon: "🙏" },
  { key: "HOLY_SPIRIT", icon: "🔥" },
  { key: "WORSHIP", icon: "🎵" },
  { key: "TEACHING", icon: "📖" },
];

const categoryTranslations = {
  en: {
    ALL: "All Categories",
    FAITH_MIRACLES: "Faith & Miracles",
    HEALING: "Healing & Deliverance",
    PRAYER: "Prayer & Fasting",
    HOLY_SPIRIT: "Holy Spirit & Revival",
    WORSHIP: "Worship & Praise",
    TEACHING: "Teaching & Doctrine",
    GOSPEL: "Gospel",
  },
  te: {
    ALL: "అన్ని ప్రసంగాలు",
    FAITH_MIRACLES: "విశ్వాసం & అద్భుతాలు",
    HEALING: "స్వస్థత & విడుదల",
    PRAYER: "ప్రార్థన & ఉపవాసం",
    HOLY_SPIRIT: "పరిశుద్ధాత్మ & పునరుజ్జీవం",
    WORSHIP: "ఆరాధన & స్తుతి",
    TEACHING: "బోధన & సిద్ధాంతం",
    GOSPEL: "సువార్త",
  },
  hi: {
    ALL: "सभी उपदेश",
    FAITH_MIRACLES: "विश्वास और चमत्कार",
    HEALING: "चंगाई और छुटकारा",
    PRAYER: "प्रार्थना और उपवास",
    HOLY_SPIRIT: "पवित्र आत्मा और पुनरुद्धार",
    WORSHIP: "आराधना और स्तुति",
    TEACHING: "शिक्षा और सिद्धांत",
    GOSPEL: "सुसमाचार",
  }
};

const sermonsTranslations = {
  en: {
    title: "Sermon Library",
    subtitle: "Life-changing messages from Bishop Kurra Kristhu Raju Garu",
    updated: "Updated",
    refresh: "Refresh",
    totalSermons: "Total Messages",
    withVideo: "Video Messages",
    audioOnly: "Audio Podcasts",
    filterAll: "All Messages",
    filterVideo: "Video",
    filterAudio: "Audio",
    searchPlaceholderDesktop: "Search sermons, scripture, pastor, or topics...",
    searchPlaceholderMobile: "Search sermons or topics...",
    clearSearch: "Clear",
    showingCount: "Showing {count} sermon(s)",
    newSermonsToast: "new sermon(s) available!",
    loadError: "Could not load latest sermons",
    noResultsTitle: 'No sermons found matching "{query}"',
    noResultsDesc: "Try adjusting your search terms or selecting a different category filter.",
    resetFilters: "Reset Search & Filters",
    noSermons: "No sermons published yet",
    btnWatch: "Watch Video",
    btnListen: "Listen Audio",
    btnNotes: "Study Notes",
    shareSuccess: "Sermon link copied to clipboard!",
    notesCopied: "Sermon notes copied to clipboard!",
    downloadNotes: "Download Notes (.txt)",
    close: "Close",
    scriptureRef: "Key Scripture Reference",
    sermonKeyNotes: "Sermon Key Points & Outline",
    pastorLabel: "Speaker",
    durationLabel: "Duration",
    viewsLabel: "Views",
    mediaComingSoon: "Media coming soon",
    audioPlaying: "Playing Audio Message",
    pause: "Pause",
    play: "Play",
    liveBroadcast: "Weekly Ministry Broadcast",
    bishopName: "Bishop Kurra Kristhu Raju Garu",
  },
  te: {
    title: "ప్రసంగాల గ్రంథాలయం",
    subtitle: "బిషప్ కుర్రా క్రీస్తు రాజు గారి నుండి జీవితాన్ని మార్చే సందేశాలు",
    updated: "సమకాలీకరించబడింది",
    refresh: "రిఫ్రెష్",
    totalSermons: "మొత్తం ప్రసంగాలు",
    withVideo: "వీడియో సందేశాలు",
    audioOnly: "ఆడియో సందేశాలు",
    filterAll: "అన్ని ప్రసంగాలు",
    filterVideo: "వీడియో",
    filterAudio: "ఆడియో",
    searchPlaceholderDesktop: "ప్రసంగాలు, వాక్యం, పాస్టర్ లేదా అంశాల కోసం వెతకండి...",
    searchPlaceholderMobile: "ప్రసంగాలు లేదా అంశాలు వెతకండి...",
    clearSearch: "రద్దు చేయి",
    showingCount: "{count} ప్రసంగాలు అందుబాటులో ఉన్నాయి",
    newSermonsToast: "కొత్త ప్రసంగం(లు) ప్రచురించబడ్డాయి!",
    loadError: "ప్రసంగాలను లోడ్ చేయడం వీలుపడలేదు",
    noResultsTitle: '"{query}" కొరకు ఏ ప్రసంగాలు లభించలేదు',
    noResultsDesc: "దయచేసి శోధన పదాన్ని సరిచూడండి లేదా మరొక విభాగాన్ని ఎంచుకోండి.",
    resetFilters: "శోధనను రీసెట్ చేయండి",
    noSermons: "ఇంకా ప్రసంగాలు ప్రచురించబడలేదు",
    btnWatch: "వీడియో చూడండి",
    btnListen: "ఆడియో వినండి",
    btnNotes: "సందేశ నోట్స్",
    shareSuccess: "ప్రసంగం లింక్ కాపీ చేయబడింది!",
    notesCopied: "ప్రసంగ నోట్స్ కాపీ చేయబడ్డాయి!",
    downloadNotes: "నోట్స్ డౌన్‌లోడ్ (.txt)",
    close: "మూసివేయి",
    scriptureRef: "ప్రధాన బైబిల్ వాక్య సూచన",
    sermonKeyNotes: "ప్రసంగ ముఖ్య అంశాలు & సారాంశం",
    pastorLabel: "ప్రసంగీకులు",
    durationLabel: "వ్యవధి",
    viewsLabel: "వీక్షణలు",
    mediaComingSoon: "మీడియా త్వరలో అందుబాటులోకి వస్తుంది",
    audioPlaying: "ఆడియో సందేశం వినబడుతోంది",
    pause: "నిలిపివేయి",
    play: "ప్లే చేయి",
    liveBroadcast: "వారం వారం మంత్రిత్వ ప్రసారం",
    bishopName: "బిషప్ కుర్రా క్రీస్తు రాజు గారు",
  },
  hi: {
    title: "उपदेश पुस्तकालय",
    subtitle: "बिशप कुर्रा क्रिस्तु राजू गारू के जीवन बदलने वाले संदेश",
    updated: "अपडेट किया गया",
    refresh: "रिफ्रेश",
    totalSermons: "कुल उपदेश",
    withVideo: "वीडियो संदेश",
    audioOnly: "ऑडियो संदेश",
    filterAll: "सभी संदेश",
    filterVideo: "वीडियो",
    filterAudio: "ऑडियो",
    searchPlaceholderDesktop: "उपदेश, वचन, पादरी या विषय खोजें...",
    searchPlaceholderMobile: "उपदेश या विषय खोजें...",
    clearSearch: "साफ़ करें",
    showingCount: "{count} उपदेश प्रदर्शित",
    newSermonsToast: "नए उपदेश प्रकाशित किए गए!",
    loadError: "उपदेश लोड नहीं किए जा सके",
    noResultsTitle: '"{query}" के लिए कोई उपदेश नहीं मिला',
    noResultsDesc: "कृपया अपने खोज शब्दों को बदलें या कोई अन्य श्रेणी चुनें।",
    resetFilters: "खोज और फ़िल्टर रीसेट करें",
    noSermons: "अभी तक कोई उपदेश प्रकाशित नहीं हुआ है",
    btnWatch: "वीडियो देखें",
    btnListen: "ऑडियो सुनें",
    btnNotes: "अध्ययन नोट्स",
    shareSuccess: "उपदेश लिंक क्लिपबोर्ड पर कॉपी किया गया!",
    notesCopied: "उपदेश नोट्स कॉपी किए गए!",
    downloadNotes: "नोट्स डाउनलोड (.txt)",
    close: "बंद करें",
    scriptureRef: "मुख्य बाइबिल वचन संदर्भ",
    sermonKeyNotes: "उपदेश के मुख्य बिंदु और रूपरेखा",
    pastorLabel: "प्रवक्ता",
    durationLabel: "अवधि",
    viewsLabel: "व्यूज",
    mediaComingSoon: "मीडिया जल्द ही आ रहा है",
    audioPlaying: "ऑडियो संदेश चल रहा है",
    pause: "रोकें",
    play: "चलाएं",
    liveBroadcast: "साप्ताहिक सेवकाई प्रसारण",
    bishopName: "बिशप कुर्रा क्रिस्तु राजू गारू",
  }
};


// ── Helper to extract clean YouTube ID ──────────────────────────────────────
function extractVideoId(urlOrId: string | null | undefined): string {
  if (!urlOrId) return "B1M_Ls_vi4o";
  if (urlOrId.includes("v=")) {
    const vid = urlOrId.split("v=")[1].split("&")[0];
    if (vid && vid.length >= 6) return vid;
  }
  if (urlOrId.includes("youtu.be/")) {
    const vid = urlOrId.split("youtu.be/")[1].split("?")[0];
    if (vid && vid.length >= 6) return vid;
  }
  if (urlOrId.includes("/embed/")) {
    const vid = urlOrId.split("/embed/")[1].split("?")[0];
    if (vid && vid.length >= 6) return vid;
  }
  if (urlOrId.length === 11 && !urlOrId.includes("/") && !urlOrId.includes(".")) {
    return urlOrId;
  }
  return "B1M_Ls_vi4o";
}

export default function MemberSermons() {
  const { status, mounted } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const st = sermonsTranslations[language as keyof typeof sermonsTranslations] || sermonsTranslations.en;
  const catsDict = categoryTranslations[language as keyof typeof categoryTranslations] || categoryTranslations.en;

  const [dbSermons, setDbSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [mediaFilter, setMediaFilter] = useState<"ALL" | "VIDEO" | "AUDIO">("ALL");

  // Modals & Active media
  const [cinemaSermon, setCinemaSermon] = useState<Sermon | null>(null);
  const [notesSermon, setNotesSermon] = useState<Sermon | null>(null);
  const [audioSermon, setAudioSermon] = useState<Sermon | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [toast, setToast] = useState<{ msg: string } | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const prevCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = (msg: string) => {
    setToast({ msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  // Fetch sermons from server API
  const fetchSermons = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/pastor/sermons?t=${Date.now()}`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.sermons)) {
        const fresh: Sermon[] = data.sermons;
        if (prevCount.current && fresh.length > prevCount.current) {
          showToast(`${fresh.length - prevCount.current} ${st.newSermonsToast}`);
        }
        prevCount.current = fresh.length;
        setDbSermons(fresh);
        setLastSynced(new Date());
      }
    } catch {
      if (!silent) showToast(st.loadError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [st.newSermonsToast, st.loadError]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSermons();
      interval.current = setInterval(() => fetchSermons(true), 30000);
    }
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [status, fetchSermons]);

  // Purely authentic church database sermons
  const allSermons: Sermon[] = useMemo(() => {
    return dbSermons;
  }, [dbSermons]);

  // Dynamic available categories
  const categoryKeys = useMemo(() => {
    const standardKeys = STANDARD_CATEGORIES.map(c => c.key);
    const dbCats = Array.from(new Set(allSermons.map(s => s.category).filter(Boolean)));
    const combined = ["ALL", ...standardKeys.filter(k => k !== "ALL")];
    for (const c of dbCats) {
      if (!combined.includes(c)) combined.push(c);
    }
    return combined;
  }, [allSermons]);

  // Filtered sermons
  const filtered = useMemo(() => {
    return allSermons.filter(s => {
      // 1. Category Filter
      const matchCat = activeCategory === "ALL" || s.category === activeCategory;

      // 2. Media Filter (All, Video, Audio)
      const matchMedia =
        mediaFilter === "ALL"
          ? true
          : mediaFilter === "VIDEO"
          ? Boolean(s.videoUrl || s.videoId || s.directVideoUrl)
          : Boolean(s.audioUrl);

      // 3. Search Query
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.pastor?.toLowerCase().includes(q) ||
        s.scripture?.toLowerCase().includes(q) ||
        (s.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (s.notes || []).some(n => n.toLowerCase().includes(q));

      return matchCat && matchMedia && matchSearch;
    });
  }, [allSermons, activeCategory, mediaFilter, search]);

  // Quick stats
  const totalCount = allSermons.length;
  const videoCount = allSermons.filter(s => s.videoUrl || s.videoId || s.directVideoUrl).length;
  const audioCount = allSermons.filter(s => s.audioUrl).length;

  // Handle Share
  const handleShare = async (sermon: Sermon) => {
    const shareUrl = sermon.videoUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: sermon.title,
          text: `${sermon.title} — ${sermon.pastor || "Bishop Kurra Kristhu Raju"}\n${sermon.scripture || ""}`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled share
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${sermon.title} - ${shareUrl}`);
      showToast(st.shareSuccess);
    }
  };

  // Handle Copy Notes
  const handleCopyNotes = async (sermon: Sermon) => {
    const textToCopy = `📖 ${sermon.title}\n🎙️ ${sermon.pastor}\n📜 Scripture: ${sermon.scripture || "N/A"}\n\nOutline & Notes:\n${(sermon.notes || [sermon.description]).join("\n")}\n\nKingdom of Christ Ministries`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(textToCopy);
      showToast(st.notesCopied);
    }
  };

  // Handle Download Notes
  const handleDownloadNotes = (sermon: Sermon) => {
    const textContent = `SERMON STUDY NOTES — KINGDOM OF CHRIST MINISTRIES\n==================================================\nTitle: ${sermon.title}\nSpeaker: ${sermon.pastor}\nDate: ${new Date(sermon.date).toLocaleDateString("en-IN")}\nScripture: ${sermon.scripture || "N/A"}\nCategory: ${sermon.category}\n\nOVERVIEW:\n${sermon.description}\n\nKEY SERMON POINTS & PRINCIPLES:\n${(sermon.notes || []).map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\n==================================================\nKingdom of Christ Ministries • Subhash Nagar, Hyderabad\nBishop Kurra Kristhu Raju Garu\n`;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sermon.title.replace(/[^a-zA-Z0-9]/g, "_")}_Notes.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(st.notesCopied);
  };

  // Handle Audio Playback
  const handleToggleAudio = (sermon: Sermon) => {
    if (audioSermon?.id === sermon.id && isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
    } else {
      setAudioSermon(sermon);
      setIsPlayingAudio(true);
      if (audioRef.current) {
        audioRef.current.src = sermon.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        audioRef.current.play().catch(() => {});
      }
    }
  };

  if (status === "unauthenticated" && mounted) return null;

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 pb-28 sm:pb-32 lg:pb-12">
      {/* Hidden Audio Player Element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlayingAudio(false)}
        onError={() => setIsPlayingAudio(false)}
        className="hidden"
      />

      {/* Floating Bottom Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border max-w-[92vw] sm:max-w-md backdrop-blur-xl bg-purple-600 text-white border-purple-400/40 shadow-purple-600/30 transition-all"
          >
            <Bell className="w-4 h-4 flex-shrink-0 text-white animate-bounce" />
            <span className="leading-snug whitespace-normal">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE HEADER: Title, Pastoral Subtitle, Live Sync & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1 sm:mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {st.title}
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-600 dark:bg-purple-700 text-white border border-purple-500 shadow-xs">
              <BookOpen className="w-3 h-3 text-white" /> Library
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
            {st.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
          {mounted && lastSynced && (
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 hidden sm:inline font-semibold">
              {st.updated}{" "}
              {lastSynced.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            onClick={() => fetchSermons()}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-all text-xs font-semibold shadow-xs active:scale-95 cursor-pointer"
            title="Refresh sermon library"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-purple-600" : ""}`} />
            <span className="hidden sm:inline">{st.refresh}</span>
          </button>
        </div>
      </div>

      {/* STATS ROW — 3 Interactive Clickable Filters (Fitts's Law) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          {
            key: "ALL" as const,
            label: st.totalSermons,
            shortLabel: st.filterAll,
            value: totalCount,
            icon: BookOpen,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40",
            activeRing: "ring-2 ring-purple-600 border-purple-400 dark:border-purple-500 shadow-purple-500/10",
          },
          {
            key: "VIDEO" as const,
            label: st.withVideo,
            shortLabel: st.filterVideo,
            value: videoCount,
            icon: Video,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40",
            activeRing: "ring-2 ring-rose-600 border-rose-400 dark:border-rose-500 shadow-rose-500/10",
          },
          {
            key: "AUDIO" as const,
            label: st.audioOnly,
            shortLabel: st.filterAudio,
            value: audioCount,
            icon: Headphones,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40",
            activeRing: "ring-2 ring-amber-600 border-amber-400 dark:border-amber-500 shadow-amber-500/10",
          },
        ].map(({ key, label, shortLabel, value, icon: Icon, color, bg, activeRing }) => {
          const isActive = mediaFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setMediaFilter(key)}
              className={`bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-200 p-2.5 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-3.5 active:scale-[0.98] cursor-pointer shadow-sm relative overflow-hidden ${
                isActive
                  ? `${activeRing} shadow-md`
                  : "border-gray-100 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              {isActive && (
                <div className="absolute top-1 right-1.5 hidden sm:flex items-center gap-0.5 text-[9px] font-black uppercase text-purple-600 dark:text-purple-400">
                  <Check className="w-2.5 h-2.5" /> Active
                </div>
              )}
              <div
                className={`w-7 h-7 sm:w-10 sm:h-10 ${bg} border rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                  {loading ? "—" : value}
                </p>
                <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-extrabold mt-1 whitespace-nowrap">
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{shortLabel}</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* CONTROLS: Responsive Search Input & Comprehensive Category Pills */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Search Input with Clear Button */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={
                typeof window !== "undefined" && window.innerWidth < 640
                  ? st.searchPlaceholderMobile
                  : st.searchPlaceholderDesktop
              }
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all text-xs sm:text-sm font-semibold shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                title={st.clearSearch}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Active Media Indicator on Desktop */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
            <Filter className="w-3.5 h-3.5 text-purple-500" />
            <span>{st.showingCount.replace("{count}", filtered.length.toString())}</span>
          </div>
        </div>

        {/* Category Pills Strip: Horizontally scrollable on mobile & desktop */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap max-w-full">
          {categoryKeys.map(catKey => {
            const standard = STANDARD_CATEGORIES.find(s => s.key === catKey);
            const icon = standard ? standard.icon : "📜";
            const label = catsDict[catKey as keyof typeof catsDict] || catKey;
            const isSelected = activeCategory === catKey;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setActiveCategory(catKey)}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-sm shadow-purple-600/30 scale-[1.02]"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AUDIO PLAYER BANNER (If audio is currently playing) */}
      <AnimatePresence>
        {audioSermon && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white border border-purple-500/30 shadow-xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => handleToggleAudio(audioSermon)}
                className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg cursor-pointer transition-all active:scale-95"
              >
                {isPlayingAudio ? <Volume2 className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-400/20">
                    {st.audioPlaying}
                  </span>
                  {audioSermon.scripture && (
                    <span className="text-[10px] text-gray-300 hidden sm:inline">
                      • {audioSermon.scripture}
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                  {audioSermon.title}
                </h4>
                <p className="text-[10px] text-gray-300 truncate">
                  {audioSermon.pastor}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setNotesSermon(audioSermon)}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> {st.btnNotes}
              </button>
              <button
                type="button"
                onClick={() => {
                  audioRef.current?.pause();
                  setIsPlayingAudio(false);
                  setAudioSermon(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title={st.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SERMONS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-80 bg-white dark:bg-gray-900 rounded-3xl animate-pulse border border-gray-100 dark:border-gray-800"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 sm:py-16 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-purple-600 dark:text-purple-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
            {search ? st.noResultsTitle.replace("{query}", search) : st.noSermons}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
            {search
              ? st.noResultsDesc
              : "Check back soon for weekly life-changing messages and broadcasts from Bishop Kurra Kristhu Raju Garu."}
          </p>
          {(search || activeCategory !== "ALL" || mediaFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("ALL");
                setMediaFilter("ALL");
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {st.resetFilters}
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((sermon, idx) => {
              const catStyle = CAT_STYLES[sermon.category] || DEFAULT_CAT_STYLE;
              const hasVideo = Boolean(sermon.videoUrl || sermon.videoId || sermon.directVideoUrl);
              const hasAudio = Boolean(sermon.audioUrl);
              const isCurrentlyPlayingAudio = isPlayingAudio && audioSermon?.id === sermon.id;

              return (
                <motion.article
                  key={sermon.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md overflow-hidden hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700/60 transition-all group flex flex-col backdrop-blur-xl"
                >
                  {/* Thumbnail & Quick Cinema Play Action */}
                  <div className="relative h-48 bg-slate-950 overflow-hidden flex-shrink-0">
                    <Image
                      src={sermon.thumbnail || "/gallery/pastor/1.0.jpeg"}
                      alt={sermon.title}
                      fill
                      unoptimized
                      className="object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    {/* In-App Cinema Play Trigger */}
                    {hasVideo && (
                      <button
                        type="button"
                        onClick={() => setCinemaSermon(sermon)}
                        aria-label={`Watch ${sermon.title}`}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer group/play"
                      >
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md group-hover/play:bg-purple-600 border border-white/40 text-white rounded-full flex items-center justify-center transition-all duration-300 group-hover/play:scale-110 shadow-xl">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </button>
                    )}

                    {/* Top Right: Scripture or Duration Pill */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      {sermon.duration && (
                        <span className="px-2 py-0.5 text-[9px] font-black rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {sermon.duration}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(sermon);
                        }}
                        aria-label="Share sermon"
                        className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-white hover:text-gray-900 border border-white/20 flex items-center justify-center transition-all cursor-pointer"
                        title="Share sermon"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom Pill: Category + Media icons */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                      <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border shadow-xs ${catStyle}`}>
                        {catsDict[sermon.category as keyof typeof catsDict] || sermon.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {hasVideo && (
                          <div className="w-5 h-5 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center" title="Video Available">
                            <Video className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        {hasAudio && (
                          <div className="w-5 h-5 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center" title="Audio Available">
                            <Headphones className="w-2.5 h-2.5 text-amber-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-4 sm:p-4.5 flex flex-col flex-1">
                    {/* Scripture Reference Tag */}
                    {sermon.scripture && (
                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-purple-600 dark:text-purple-400 mb-1">
                        <BookMarked className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{sermon.scripture}</span>
                      </div>
                    )}

                    <h3 className="font-black text-gray-900 dark:text-white text-sm sm:text-base leading-snug mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                      {sermon.title}
                    </h3>

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3 flex-1 font-medium">
                      {sermon.description}
                    </p>

                    {/* Metadata Footer: Pastor & Date */}
                    <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 font-semibold border-t border-gray-100 dark:border-gray-800/80 pt-2.5 mb-3">
                      <span className="flex items-center gap-1.5 truncate max-w-[65%]">
                        <User className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                        <span className="truncate">{sermon.pastor || st.bishopName}</span>
                      </span>
                      <span className="flex items-center gap-1.5 flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                        {new Date(sermon.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    {/* Action Buttons: Watch Video, Audio Listen, Notes */}
                    <div className="flex items-center gap-1.5">
                      {hasVideo ? (
                        <button
                          type="button"
                          onClick={() => setCinemaSermon(sermon)}
                          className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-500/20 active:scale-[0.98] cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>{st.btnWatch}</span>
                        </button>
                      ) : null}

                      {hasAudio && (
                        <button
                          type="button"
                          onClick={() => handleToggleAudio(sermon)}
                          className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all border active:scale-[0.98] cursor-pointer ${
                            isCurrentlyPlayingAudio
                              ? "bg-amber-500 text-white border-amber-600 shadow-md"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750"
                          }`}
                        >
                          <Headphones className="w-3.5 h-3.5" />
                          <span>{isCurrentlyPlayingAudio ? st.pause : st.btnListen}</span>
                        </button>
                      )}

                      {/* Notes Button */}
                      <button
                        type="button"
                        onClick={() => setNotesSermon(sermon)}
                        className="px-2.5 py-2 sm:py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-xs font-bold flex items-center justify-center cursor-pointer"
                        title={st.btnNotes}
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── CINEMA MODAL FOR IN-APP VIDEO PLAYBACK ───────────────────────── */}
      {cinemaSermon && (
        <SermonCinemaModal
          sermon={{
            id: cinemaSermon.id,
            title: cinemaSermon.title,
            pastor: cinemaSermon.pastor,
            category: catsDict[cinemaSermon.category as keyof typeof catsDict] || cinemaSermon.category,
            videoId: extractVideoId(cinemaSermon.videoId || cinemaSermon.videoUrl),
            videoUrl: cinemaSermon.videoUrl || undefined,
            directVideoUrl: cinemaSermon.directVideoUrl || undefined,
          }}
          onClose={() => setCinemaSermon(null)}
        />
      )}

      {/* ── STUDY NOTES & SCRIPTURE MODAL ──────────────────────────────── */}
      <AnimatePresence>
        {notesSermon && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={notesSermon.title}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200"
            onClick={() => setNotesSermon(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[88vh]"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-850 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white truncate">
                      {notesSermon.title}
                    </h3>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold truncate">
                      {notesSermon.pastor} • {catsDict[notesSermon.category as keyof typeof catsDict] || notesSermon.category}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotesSermon(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  title={st.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 overflow-y-auto space-y-4">
                {/* Scripture Reference */}
                {notesSermon.scripture && (
                  <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40">
                    <p className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                      {st.scriptureRef}
                    </p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
                      {notesSermon.scripture}
                    </p>
                  </div>
                )}

                {/* Sermon Overview */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                    Overview
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    {notesSermon.description}
                  </p>
                </div>

                {/* Key Points Outline */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                    {st.sermonKeyNotes}
                  </h4>
                  <div className="space-y-2">
                    {(notesSermon.notes && notesSermon.notes.length > 0
                      ? notesSermon.notes
                      : [
                          "Faith speaks to mountains before they move in the name of Jesus.",
                          "Divine covenant is activated through unwavering obedience to God's Word.",
                          "Walking in daily prayer and fasting breaks spiritual bondages.",
                        ]
                    ).map((point, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-medium flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center flex-shrink-0 text-xs font-black">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyNotes(notesSermon)}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-purple-500" />
                  <span>Copy Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadNotes(notesSermon)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{st.downloadNotes}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
