"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Heart, Send, ArrowLeft, Check, Clock, EyeOff, Sparkles, Loader2, RefreshCw, Bell, MessageCircle, Filter, Activity } from "lucide-react";
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

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400", dot: "bg-amber-500", description: "Awaiting pastoral review" },
  PRAYING: { label: "Being Prayed For", color: "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400", dot: "bg-purple-500 animate-pulse", description: "Our pastors are interceding" },
  ANSWERED: { label: "Answered! 🙌", color: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400", dot: "bg-green-500", description: "Praise God!" },
};

const CATEGORY_ICONS: Record<string, string> = {
  HEALTH: "🏥",
  FAMILY: "👨‍👩‍👧‍👦",
  FINANCIAL: "💼",
  SPIRITUAL: "🙏",
  GUIDANCE: "🗺️",
  THANKSGIVING: "🌟",
  OTHER: "💬",
};

export default function MemberPrayers() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();

  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("HEALTH");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "PRAYING" | "ANSWERED">("ALL");

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevPrayerIds = useRef<string[]>([]);

  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  const loadPrayers = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/member/prayers?userId=${user.uid}&t=${Date.now()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const newPrayers: PrayerRequest[] = data.prayers || [];
        // Detect status changes
        if (prevPrayerIds.current.length > 0) {
          const updatedAnswered = newPrayers.filter(p =>
            p.status === "ANSWERED" && !prayers.find(pp => pp.id === p.id && pp.status === "ANSWERED")
          );
          if (updatedAnswered.length > 0) {
            showToast(`🙌 Great news! One of your prayers has been answered!`, "success");
          }
          const updatedPraying = newPrayers.filter(p =>
            p.status === "PRAYING" && !prayers.find(pp => pp.id === p.id && pp.status === "PRAYING")
          );
          if (updatedPraying.length > 0) {
            showToast("🙏 Pastors are now praying for your request", "info");
          }
        }
        prevPrayerIds.current = newPrayers.map(p => p.id);
        setPrayers(newPrayers);
        setLastSynced(new Date());
      }
    } catch (err) {
      if (!silent) showToast("Could not load prayer requests", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (status === "authenticated" && user?.uid) {
      loadPrayers();
      // Poll every 30s for status updates
      intervalRef.current = setInterval(() => loadPrayers(true), 30000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [user, status, loadPrayers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Optimistic add
    const tempId = `temp_${Date.now()}`;
    const optimisticPrayer: PrayerRequest = {
      id: tempId,
      title,
      description,
      category,
      isAnonymous,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    setPrayers(prev => [optimisticPrayer, ...prev]);

    try {
      const res = await fetch("/api/member/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, title, description, category, isAnonymous }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Prayer request submitted! Our pastoral team will intercede for you. 🙏", "success");
        setTitle("");
        setDescription("");
        setIsAnonymous(false);
        // Replace optimistic with real data
        loadPrayers(true);
      } else {
        setPrayers(prev => prev.filter(p => p.id !== tempId));
        throw new Error(data.error || "Failed to submit prayer request");
      }
    } catch (err: any) {
      setPrayers(prev => prev.filter(p => p.id !== tempId));
      showToast(err.message || "Failed to submit. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPrayers = prayers.filter(p => filterStatus === "ALL" || p.status === filterStatus);
  const stats = {
    total: prayers.length,
    praying: prayers.filter(p => p.status === "PRAYING").length,
    answered: prayers.filter(p => p.status === "ANSWERED").length,
  };

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Loading prayer center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/20 to-purple-50/30 dark:from-gray-950 dark:via-rose-950/5 dark:to-gray-900">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2.5 max-w-xs backdrop-blur-xl border ${
              toast.type === "success"
                ? "bg-green-500/90 text-white border-green-400/30"
                : toast.type === "error"
                ? "bg-red-500/90 text-white border-red-400/30"
                : "bg-purple-600/90 text-white border-purple-400/30"
            }`}
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            <span className="leading-snug">{toast.msg}</span>
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
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Live Prayer Wall
            </div>
            {lastSynced && (
              <span className="text-xs text-gray-400">
                Updated {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={() => loadPrayers()}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-500 hover:text-rose-600 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 rounded-3xl p-8 text-white overflow-hidden relative shadow-2xl"
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-20 blur-xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-12 blur-xl" />
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-pink-200 fill-pink-200/50" />
                <span className="text-pink-200 text-sm font-semibold uppercase tracking-wider">Prayer Request Center</span>
              </div>
              <h1 className="text-3xl font-black mb-1">Your Prayer Wall</h1>
              <p className="text-pink-100 text-sm italic">"For where two or three gather in My name, there am I." — Matthew 18:20</p>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              {[
                { label: "Submitted", value: stats.total },
                { label: "Being Prayed", value: stats.praying },
                { label: "Answered", value: stats.answered },
              ].map(({ label, value }) => (
                <div key={label} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 min-w-[70px]">
                  <div className="text-2xl font-black">{value}</div>
                  <div className="text-pink-200 text-[10px] font-semibold uppercase leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Submit Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 bg-white dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl p-6 backdrop-blur-md"
          >
            <h3 className="text-lg font-black text-gray-950 dark:text-white mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              Send a Prayer Request
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Request Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Healing for Mother"
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-400 focus:border-rose-300 focus:outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-400 focus:outline-none transition-all text-sm"
                >
                  <option value="HEALTH">🏥 Health & Healing</option>
                  <option value="FAMILY">👨‍👩‍👧‍👦 Family & Relations</option>
                  <option value="FINANCIAL">💼 Financial Needs</option>
                  <option value="SPIRITUAL">🙏 Spiritual Guidance</option>
                  <option value="GUIDANCE">🗺️ Direction & Choices</option>
                  <option value="THANKSGIVING">🌟 Thanksgiving & Praise</option>
                  <option value="OTHER">💬 Other Requests</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Prayer Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Share your heart... our pastors will pray specifically for you."
                  rows={4}
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-400 focus:border-rose-300 focus:outline-none transition-all resize-none text-sm leading-relaxed"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none py-2">
                <div
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    isAnonymous ? "bg-rose-500 border-rose-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isAnonymous && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                  Submit anonymously
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-rose-500/20 transition-all active:scale-[0.99] disabled:opacity-50 text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Prayer Request
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Prayer List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-8 space-y-4"
          >
            {/* Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter:</span>
              {(["ALL", "PENDING", "PRAYING", "ANSWERED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    filterStatus === s
                      ? "bg-gradient-to-r from-rose-500 to-purple-600 text-white border-transparent shadow-md"
                      : "bg-white dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {s === "ALL" ? `All (${prayers.length})` : s === "PRAYING" ? `Praying (${stats.praying})` : s === "ANSWERED" ? `Answered (${stats.answered})` : `Pending (${prayers.filter(p => p.status === "PENDING").length})`}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-white dark:bg-gray-800/20 rounded-2xl animate-pulse" />)}
              </div>
            ) : filteredPrayers.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                <Heart className="w-12 h-12 text-rose-300 dark:text-rose-800 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">
                  {filterStatus === "ALL" ? "You haven't submitted any prayer requests yet." : `No ${filterStatus.toLowerCase()} requests`}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {filteredPrayers.map((prayer, i) => {
                    const cfg = STATUS_CONFIG[prayer.status] || STATUS_CONFIG.PENDING;
                    return (
                      <motion.div
                        key={prayer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.04 }}
                        className={`bg-white dark:bg-gray-800/50 rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 ${
                          prayer.status === "ANSWERED"
                            ? "border-green-200 dark:border-green-900/30"
                            : prayer.status === "PRAYING"
                            ? "border-purple-200 dark:border-purple-900/30"
                            : "border-gray-100 dark:border-white/5"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3 flex-wrap mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl flex-shrink-0">{CATEGORY_ICONS[prayer.category] || "🙏"}</span>
                            <div className="min-w-0">
                              <span className="font-bold text-gray-950 dark:text-white text-base block truncate">{prayer.title}</span>
                              <span className="text-[10px] text-gray-400 font-medium">{prayer.category}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 ${cfg.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                            <span className="text-[10px] text-gray-400">{cfg.description}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-l-2 border-gray-100 dark:border-gray-700 pl-3">
                          {prayer.description}
                        </p>

                        <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 pt-3 mt-3 border-t border-gray-100 dark:border-white/5">
                          <span>{new Date(prayer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          {prayer.isAnonymous && (
                            <span className="flex items-center gap-1">
                              <EyeOff className="w-3 h-3" /> Anonymous
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
