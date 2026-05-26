"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
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
const DEFAULT_CAT = "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/30";
const THUMB = "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=600";

export default function MemberSermons() {
  const { status, mounted } = useAuth();
  const router = useRouter();

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
        if (prevCount.current && fresh.length > prevCount.current) showToast(`${fresh.length - prevCount.current} new sermon(s) published!`);
        prevCount.current = fresh.length;
        setSermons(fresh);
        setLastSynced(new Date());
      }
    } catch { if (!silent) showToast("Could not load sermons"); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

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

  if (!mounted || status === "loading") return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold border max-w-xs bg-indigo-600 text-white border-indigo-400/30">
            <Bell className="w-4 h-4" />{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Sermon Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Life-changing messages from Bishop Kurra Kristhu Raju Garu</p>
        </div>
        <div className="flex items-center gap-2">
          {lastSynced && <span className="text-xs text-gray-400">Updated {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
          <button onClick={() => fetch_()} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all text-xs font-semibold">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Sermons", value: sermons.length,                             icon: BookOpen,   color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
          { label: "With Video",    value: sermons.filter(s => s.videoUrl).length,     icon: Video,      color: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-50 dark:bg-rose-950/30"    },
          { label: "Audio Only",    value: sermons.filter(s => s.audioUrl && !s.videoUrl).length, icon: Headphones, color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/30"  },
        ].map(({ label, value, icon: Icon, color, bg }) => (
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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search sermons, pastor, or topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all text-sm shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white border-transparent shadow-md"
                  : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white"
              }`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Sermon Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-72 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">{search ? `No results for "${search}"` : "No sermons published yet"}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((sermon, i) => (
              <motion.article
                key={sermon.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-all group flex flex-col"
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
                      <div className="w-11 h-11 bg-white/20 backdrop-blur-md hover:bg-indigo-600 border border-white/40 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </a>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full border ${CAT_STYLE[sermon.category] || DEFAULT_CAT}`}>
                      {sermon.category}
                    </span>
                    <div className="flex items-center gap-1">
                      {sermon.videoUrl && <div className="w-5 h-5 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"><Video className="w-2.5 h-2.5 text-white" /></div>}
                      {sermon.audioUrl && <div className="w-5 h-5 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"><Volume2 className="w-2.5 h-2.5 text-white" /></div>}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {sermon.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3 flex-1">
                    {sermon.description}
                  </p>
                  {sermon.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {sermon.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-md border border-gray-100 dark:border-gray-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3 mb-3">
                    <span className="flex items-center gap-1 font-medium"><User className="w-3 h-3 text-indigo-400" />{sermon.pastor}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-indigo-400" />{new Date(sermon.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="flex gap-2">
                    {sermon.videoUrl
                      ? <a href={sermon.videoUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border border-indigo-100 dark:border-indigo-900/30">
                          <Video className="w-3.5 h-3.5" />Watch Video
                        </a>
                      : null}
                    {sermon.audioUrl
                      ? <a href={sermon.audioUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700">
                          <Volume2 className="w-3.5 h-3.5" />Listen
                        </a>
                      : null}
                    {!sermon.videoUrl && !sermon.audioUrl && (
                      <span className="flex-1 py-2 text-center text-[11px] text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        Media coming soon
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
