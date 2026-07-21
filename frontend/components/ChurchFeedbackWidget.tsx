"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Send,
  RefreshCw,
  MessageSquare,
  ThumbsUp,
  BarChart2,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

/* ──────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────── */
interface FeedbackStats {
  total: number;
  avgRating: number;
  breakdown: Record<string, { avg: number; count: number }>;
  distribution: number[]; // [1★, 2★, 3★, 4★, 5★]
}

interface FeedbackEntry {
  id: string;
  rating: number;
  category: string;
  comment?: string | null;
  userName?: string | null;
  isAnonymous: boolean;
  createdAt: string;
  emoji?: string | null;
}

interface Props {
  userId?: string;
  userName?: string;
}

/* ──────────────────────────────────────────────────────
   Translations
────────────────────────────────────────────────────── */
const feedbackTranslations = {
  en: {
    title: "Church Platform Feedback",
    ratingLabel: "Your Rating",
    categoryLabel: "Category",
    quickReactionLabel: "Quick Reaction",
    commentLabel: "Comment (optional)",
    placeholder: "Share what blessed you or how we can improve...",
    anonymousLabel: "Post anonymously",
    sending: "Sending...",
    submit: "Submit",
    thankYou: "Thank you for your feedback!",
    thankYouSub: "Your response helps us serve our church family better.",
    submitAnother: "Submit another feedback",
    reviews: "reviews",
    live: "Live",
    categories: {
      WORSHIP: "Worship",
      SERMONS: "Sermons",
      EVENTS: "Events",
      COMMUNITY: "Community",
      FACILITIES: "Facilities",
      ONLINE_PLATFORM: "Online Platform",
      LEADERSHIP: "Leadership",
      OVERALL: "Overall",
    },
    starLabels: ["", "Poor", "Fair", "Good", "Great", "Excellent"],
    footerText: "Auto-refreshes every 10 seconds · Last synced",
    communityVoices: "Community Voices",
  },
  te: {
    title: "చర్చి ప్లాట్‌ఫారమ్ అభిప్రాయం",
    ratingLabel: "మీ రేటింగ్",
    categoryLabel: "వర్గం",
    quickReactionLabel: "త్వరిత స్పందన",
    commentLabel: "కామెంట్ (ఐచ్ఛికం)",
    placeholder: "మీ ఆశీర్వాదం లేదా సలహాలను పంచుకోండి...",
    anonymousLabel: "అనామకంగా పంపండి",
    sending: "పంపుతోంది...",
    submit: "సమర్పించండి",
    thankYou: "మీ అభిప్రాయానికి ధన్యవాదాలు!",
    thankYouSub: "మీ స్పందన మా చర్చి కుటుంభానికి మెరుగ్గా సేవ చేయడానికి సహాయపడుతుంది.",
    submitAnother: "మరో అభిప్రాయం పంపండి",
    reviews: "సమీక్షలు",
    live: "లైవ్",
    categories: {
      WORSHIP: "ఆరాధన",
      SERMONS: "ప్రసంగాలు",
      EVENTS: "కార్యక్రమాలు",
      COMMUNITY: "సంఘం",
      FACILITIES: "వసతులు",
      ONLINE_PLATFORM: "ఆన్‌లైన్ వేదిక",
      LEADERSHIP: "నాయకత్వం",
      OVERALL: "మొత్తంగా",
    },
    starLabels: ["", "బాగోలేదు", "పర్వాలేదు", "మంచిది", "చాలా మంచిది", "అద్భుతం"],
    footerText: "ప్రతి 10 సెకన్లకు నవీకరించబడుతుంది · నవీకరించబడింది",
    communityVoices: "విశ్వాసుల మాటలు",
  },
  hi: {
    title: "चर्च प्लेटफॉर्म फीडबैक",
    ratingLabel: "आपकी रेटिंग",
    categoryLabel: "श्रेणी",
    quickReactionLabel: "त्वरित प्रतिक्रिया",
    commentLabel: "टिप्पणी (वैकल्पिक)",
    placeholder: "अपना अनुभव या सुझाव साझा करें...",
    anonymousLabel: "गुमनाम रूप से पोस्ट करें",
    sending: "भेज रहा है...",
    submit: "सबमिट करें",
    thankYou: "आपकी प्रतिक्रिया के लिए धन्यवाद!",
    thankYouSub: "आपका उत्तर हमें हमारे चर्च परिवार की बेहतर सेवा करने में मदद करता है।",
    submitAnother: "एक और प्रतिक्रिया भेजें",
    reviews: "समीक्षाएं",
    live: "लाइव",
    categories: {
      WORSHIP: "आराधना",
      SERMONS: "प्रवचन",
      EVENTS: "कार्यक्रम",
      COMMUNITY: "समुदाय",
      FACILITIES: "सुविधाएं",
      ONLINE_PLATFORM: "ऑनलाइन प्लेटफॉर्म",
      LEADERSHIP: "नेतृत्व",
      OVERALL: "कुल मिलाकर",
    },
    starLabels: ["", "खराब", "ठीक है", "अच्छा", "बहुत अच्छा", "उत्कृष्ट"],
    footerText: "हर 10 सेकंड में ऑटो-रिफ्रेश होता है · अंतिम सिंक",
    communityVoices: "समुदाय की आवाजें",
  }
};

/* ──────────────────────────────────────────────────────
   Constants
────────────────────────────────────────────────────── */
const CATEGORIES: { value: string; emoji: string }[] = [
  { value: "WORSHIP", emoji: "🙏" },
  { value: "SERMONS", emoji: "📖" },
  { value: "EVENTS", emoji: "🎉" },
  { value: "COMMUNITY", emoji: "❤️" },
  { value: "FACILITIES", emoji: "🏛️" },
  { value: "ONLINE_PLATFORM", emoji: "💻" },
  { value: "LEADERSHIP", emoji: "⭐" },
  { value: "OVERALL", emoji: "✨" },
];

const QUICK_EMOJIS = ["🙏", "🔥", "✨", "❤️", "🌟", "🎉"];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ──────────────────────────────────────────────────────
   Main Component
────────────────────────────────────────────────────── */
export default function ChurchFeedbackWidget({ userId, userName }: Props) {
  const { language } = useLanguage();
  const ft = feedbackTranslations[language as keyof typeof feedbackTranslations] || feedbackTranslations.en;

  /* ─── State ─────────────────────────────────────────── */
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [recentFeed, setRecentFeed] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [liveCount, setLiveCount] = useState(0); 

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("");
  const [comment, setComment] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // UI state
  const [showFeed, setShowFeed] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [newEntryIds, setNewEntryIds] = useState<Set<string>>(new Set());

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const prevTotalRef = useRef(0);
  const seenIdsRef = useRef<Set<string>>(new Set());

  /* ─── Fetch stats ────────────────────────────────────── */
  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setPolling(true);
    try {
      const res = await fetch(`/api/member/feedback?t=${Date.now()}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (data.success) {
        // Detect new entries for live pulse
        const incoming: FeedbackEntry[] = data.recent || [];
        const freshIds = new Set<string>();
        for (const e of incoming) {
          if (!seenIdsRef.current.has(e.id)) {
            freshIds.add(e.id);
            seenIdsRef.current.add(e.id);
          }
        }
        if (freshIds.size > 0 && prevTotalRef.current > 0) {
          setNewEntryIds(freshIds);
          setLiveCount(c => c + freshIds.size);
          setTimeout(() => setNewEntryIds(new Set()), 4000);
        }
        if (prevTotalRef.current === 0) {
          // Initial load — seed seen ids
          for (const e of incoming) seenIdsRef.current.add(e.id);
        }
        prevTotalRef.current = data.stats?.total ?? 0;
        setStats(data.stats);
        setRecentFeed(incoming);
        setLastUpdated(new Date());
      }
    } catch {
      // Silent failure — keep stale data
    } finally {
      setLoading(false);
      setPolling(false);
    }
  }, []);

  /* ─── Polling (10 s interval) ────────────────────────── */
  useEffect(() => {
    fetchStats(false);
    pollRef.current = setInterval(() => fetchStats(true), 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchStats]);

  /* ─── Submit ─────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!rating) return setFormError("Please select a star rating.");
    if (!category) return setFormError("Please choose a category.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/member/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: isAnonymous ? null : userId,
          userName: isAnonymous ? null : userName,
          rating,
          category,
          comment: comment.trim() || null,
          isAnonymous,
          emoji: selectedEmoji || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
      // Refresh stats immediately
      await fetchStats(true);
      // Reset form after 4s
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setCategory("");
        setComment("");
        setSelectedEmoji("");
        setIsAnonymous(false);
      }, 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ─── Render helpers ─────────────────────────────────── */
  const avgDisplay = stats ? (stats.avgRating || 0).toFixed(1) : "—";
  const maxDist = stats ? Math.max(...stats.distribution, 1) : 1;

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className="bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center shadow-sm">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white leading-none">
              {ft.title}
            </h4>
            {stats && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                {stats.total} {ft.reviews} · avg {avgDisplay}★
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Live pulse */}
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">{ft.live}</span>
          </div>
          {polling && <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />}
          {liveCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[9px] font-black text-white bg-violet-600 px-1.5 py-0.5 rounded-full"
            >
              +{liveCount} new
            </motion.span>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="p-5 space-y-5">

        {/* ── Overall score bar ───────────────────────── */}
        {!loading && stats && stats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-[hsl(var(--accent)_/_0.4)] to-[hsl(var(--accent)_/_0.2)] dark:from-[hsl(var(--accent)_/_0.15)] dark:to-[hsl(var(--accent)_/_0.05)] rounded-xl border border-[hsl(var(--primary)_/_0.15)] dark:border-[hsl(var(--primary)_/_0.25)]"
          >
            {/* Big score */}
            <div className="text-center flex-shrink-0">
              <p className="text-4xl font-black text-violet-700 dark:text-violet-400 leading-none">{avgDisplay}</p>
              <div className="flex justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${s <= Math.round(stats.avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                  />
                ))}
              </div>
              <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{stats.total} {ft.reviews}</p>
            </div>

            {/* Distribution mini bars */}
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-500 dark:text-gray-400 w-3 font-bold flex-shrink-0">{s}</span>
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.distribution[s - 1] / maxDist) * 100}%` }}
                      transition={{ duration: 0.6, delay: (5 - s) * 0.05 }}
                      className={`h-full rounded-full ${
                        s >= 4 ? "bg-emerald-500" : s === 3 ? "bg-amber-400" : "bg-rose-400"
                      }`}
                    />
                  </div>
                  <span className="text-[9px] text-gray-400 w-4 text-right font-medium flex-shrink-0">{stats.distribution[s - 1]}</span>
                </div>
              ))}
            </div>

            {/* Expand chart toggle */}
            <button
              onClick={() => setShowChart(c => !c)}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-950/40 text-violet-600 dark:text-violet-400 transition-colors"
              title="Category breakdown"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ── Category breakdown (expandable) ─────────── */}
        <AnimatePresence>
          {showChart && stats && Object.keys(stats.breakdown).length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 pb-1">
                {Object.entries(stats.breakdown)
                  .sort((a, b) => b[1].avg - a[1].avg)
                  .map(([cat, { avg, count }]) => {
                    const info = CATEGORIES.find(c => c.value === cat);
                    const catLabel = ft.categories[cat as keyof typeof ft.categories] || cat;
                    return (
                      <div key={cat} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/30 rounded-xl px-3 py-2">
                        <span className="text-base">{info?.emoji || "📊"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate">{catLabel}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-2 h-2 ${s <= Math.round(avg) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} />
                            ))}
                            <span className="text-[9px] text-gray-400 ml-1">{avg}★ ({count})</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Submit Form ──────────────────────────────── */}
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-6 gap-2 text-center"
            >
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{ft.thankYou} 🙏</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{ft.thankYouSub}</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Star rating picker */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{ft.ratingLabel}</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      type="button"
                      key={s}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
                      aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          s <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                  {(hoverRating || rating) > 0 && (
                    <motion.span
                      key={hoverRating || rating}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-2 text-xs font-bold text-violet-600 dark:text-violet-400"
                    >
                      {ft.starLabels[hoverRating || rating]}
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Category chips */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{ft.categoryLabel}</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => {
                    const catLabel = ft.categories[c.value as keyof typeof ft.categories] || c.value;
                    return (
                      <button
                        type="button"
                        key={c.value}
                        onClick={() => setCategory(c.value)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                          category === c.value
                            ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/25"
                            : "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-violet-400/60"
                        }`}
                      >
                        <span>{c.emoji}</span> {catLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick emoji reactions */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{ft.quickReactionLabel}</p>
                <div className="flex gap-2">
                  {QUICK_EMOJIS.map(e => (
                    <button
                      type="button"
                      key={e}
                      onClick={() => setSelectedEmoji(selectedEmoji === e ? "" : e)}
                      className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center transition-all hover:scale-110 ${
                        selectedEmoji === e
                          ? "bg-violet-50 dark:bg-violet-950/40 border-violet-400 shadow-sm"
                          : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-white/10"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional comment */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{ft.commentLabel}</p>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value.slice(0, 300))}
                  rows={2}
                  maxLength={300}
                  placeholder={ft.placeholder}
                  className="w-full px-3 py-2.5 text-xs bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-600 transition-all"
                />
                <p className="text-[9px] text-gray-400 text-right">{comment.length}/300</p>
              </div>

              {/* Anonymous toggle + submit */}
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setIsAnonymous(a => !a)}
                    className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${
                      isAnonymous ? "bg-violet-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${isAnonymous ? "left-4.5 left-[18px]" : "left-0.5"}`} />
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{ft.anonymousLabel}</span>
                </label>

                {formError && (
                  <p className="text-[10px] text-red-500 font-medium flex-1 text-center">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !rating || !category}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-violet-600 to-purple-700 text-white text-xs font-bold rounded-xl shadow hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {submitting ? ft.sending : ft.submit}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* ── Recent feed toggle ───────────────────────── */}
        {recentFeed.length > 0 && (
          <div className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-3">
            <button
              onClick={() => setShowFeed(f => !f)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Community Voices ({recentFeed.length})
              </span>
              {showFeed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
              {showFeed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2.5 overflow-hidden"
                >
                  {recentFeed.map(entry => {
                    const isNew = newEntryIds.has(entry.id);
                    const cat = CATEGORIES.find(c => c.value === entry.category);
                    const catLabel = ft.categories[entry.category as keyof typeof ft.categories] || entry.category;
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex gap-2.5 p-3 rounded-xl border transition-all ${
                          isNew
                            ? "bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-900/30 ring-1 ring-violet-400/20"
                            : "bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-white/5"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {entry.isAnonymous ? "?" : (entry.userName?.[0] || "M").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate">
                                {entry.isAnonymous ? "Anonymous" : (entry.userName || "Member")}
                              </span>
                              <span className="text-[9px] text-gray-400">{cat?.emoji} {catLabel}</span>
                            </div>
                            {isNew && (
                              <span className="text-[8px] font-black text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                NEW
                              </span>
                            )}
                          </div>
                          {/* Stars */}
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-2.5 h-2.5 ${s <= entry.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} />
                            ))}
                            {entry.emoji && <span className="ml-1 text-sm">{entry.emoji}</span>}
                          </div>
                          {entry.comment && (
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                              &ldquo;{entry.comment}&rdquo;
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-2.5 h-2.5 text-gray-400" />
                            <span className="text-[9px] text-gray-400">{timeAgo(entry.createdAt)}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Footer sync line ─────────────────────────── */}
        {lastUpdated && (
          <p className="text-[9px] text-gray-400 dark:text-gray-600 flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" />
            Auto-refreshes every 10 seconds · Last synced {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
}
