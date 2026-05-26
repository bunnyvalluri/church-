"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, User, Calendar, ArrowLeft, Play, Sparkles, Video, Volume2, RefreshCw, Bell, Search, Filter, Clock } from "lucide-react";
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

const FALLBACK_THUMB = "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=600";
const CATEGORY_COLORS: Record<string, string> = {
  GOSPEL: "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300",
  WORSHIP: "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300",
  PRAYER: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
  TEACHINGS: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300",
  PROPHECY: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300",
};

export default function MemberSermons() {
  const { status, mounted } = useAuth();
  const router = useRouter();

  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevCount = useRef(0);

  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  const fetchSermons = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/pastor/sermons?t=${Date.now()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const newSermons: Sermon[] = data.sermons || [];
        if (prevCount.current > 0 && newSermons.length > prevCount.current) {
          showToast(`🎙️ ${newSermons.length - prevCount.current} new sermon(s) published!`, "info");
        }
        prevCount.current = newSermons.length;
        setSermons(newSermons);
        setLastSynced(new Date());
      }
    } catch (err) {
      if (!silent) showToast("Could not load sermons", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSermons();
      intervalRef.current = setInterval(() => fetchSermons(true), 30000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status, fetchSermons]);

  const categories = ["ALL", ...Array.from(new Set(sermons.map(s => s.category)))];

  const filteredSermons = sermons.filter(s => {
    const matchCat = activeCategory === "ALL" || s.category === activeCategory;
    const matchSearch = !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pastor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Loading sermon library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50 dark:from-gray-950 dark:via-indigo-950/10 dark:to-gray-900">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2.5 max-w-sm backdrop-blur-xl border ${
              toast.type === "success" ? "bg-green-500/90 text-white border-green-400/30" :
              toast.type === "error" ? "bg-red-500/90 text-white border-red-400/30" :
              "bg-indigo-600/90 text-white border-indigo-400/30"
            }`}
          >
            <Bell className="w-4 h-4" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/member" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:gap-3 transition-all text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Live Library
            </div>
            {lastSynced && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Updated {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={() => fetchSermons()}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-gray-500 hover:text-indigo-600 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 rounded-3xl p-8 text-white overflow-hidden relative shadow-2xl"
        >
          <div className="absolute inset-0">
            <div className="absolute -top-10 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-indigo-200" />
                <span className="text-indigo-200 text-sm font-semibold uppercase tracking-wider">Sermon Library</span>
              </div>
              <h1 className="text-3xl font-black mb-1">Sermons & Bible Messages</h1>
              <p className="text-indigo-200 text-sm">Life-changing messages from Bishop Kurra Kristhu Raju Garu</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
                <div className="text-3xl font-black">{sermons.length}</div>
                <div className="text-indigo-200 text-[10px] font-semibold uppercase">Total Sermons</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
                <div className="text-3xl font-black">{sermons.filter(s => s.videoUrl).length}</div>
                <div className="text-indigo-200 text-[10px] font-semibold uppercase">With Video</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sermons, pastors, topics..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md"
                    : "bg-white dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sermons Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-72 bg-white dark:bg-gray-800/20 rounded-3xl animate-pulse" />)}
          </div>
        ) : filteredSermons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700"
          >
            <BookOpen className="w-12 h-12 text-indigo-300 dark:text-indigo-800 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">
              {searchQuery ? `No sermons matching "${searchQuery}"` : "No sermons published yet."}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredSermons.map((sermon, i) => (
                <motion.div
                  key={sermon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-white/5 shadow-md overflow-hidden flex flex-col hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <Image
                      src={sermon.thumbnail || FALLBACK_THUMB}
                      alt={sermon.title}
                      fill
                      unoptimized
                      className="object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {sermon.videoUrl && (
                      <a
                        href={sermon.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setPlayingId(sermon.id)}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md hover:bg-indigo-600 border-2 border-white/40 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-indigo-500/30 group/btn">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                      </a>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${CATEGORY_COLORS[sermon.category] || "bg-purple-100 text-purple-700"}`}>
                        {sermon.category}
                      </span>
                      <div className="flex gap-1.5">
                        {sermon.videoUrl && (
                          <span className="w-6 h-6 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Video className="w-3 h-3 text-white" />
                          </span>
                        )}
                        {sermon.audioUrl && (
                          <span className="w-6 h-6 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Volume2 className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-gray-950 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {sermon.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {sermon.description}
                      </p>
                      {/* Tags */}
                      {sermon.tags && sermon.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sermon.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 text-[10px] font-semibold bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full border border-gray-100 dark:border-gray-700">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-white/5 pt-3">
                        <span className="flex items-center gap-1 font-medium">
                          <User className="w-3 h-3 text-indigo-500" />
                          {sermon.pastor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-500" />
                          {new Date(sermon.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {sermon.videoUrl && (
                          <a
                            href={sermon.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all active:scale-[0.98]"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Watch Video
                          </a>
                        )}
                        {sermon.audioUrl && (
                          <a
                            href={sermon.audioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            Listen
                          </a>
                        )}
                        {!sermon.videoUrl && !sermon.audioUrl && (
                          <span className="flex-1 py-2.5 bg-gray-50 dark:bg-gray-800/40 text-gray-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-dashed border-gray-200 dark:border-gray-700">
                            <Clock className="w-3.5 h-3.5" />
                            Media coming soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
