"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowLeft, CheckCircle2, UserCheck, Sparkles, Loader2, RefreshCw, Bell, Check, Users, TrendingUp, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendeeCount?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  WORSHIP: "from-purple-500 to-indigo-500",
  PRAYER: "from-rose-500 to-pink-500",
  YOUTH: "from-orange-500 to-amber-500",
  FELLOWSHIP: "from-green-500 to-emerald-500",
  OUTREACH: "from-blue-500 to-cyan-500",
  DEFAULT: "from-purple-500 to-violet-500",
};

const CATEGORY_BG: Record<string, string> = {
  WORSHIP: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300",
  PRAYER: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300",
  YOUTH: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
  FELLOWSHIP: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300",
  OUTREACH: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300",
};

export default function MemberEvents() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [filter, setFilter] = useState<"ALL" | "UPCOMING" | "REGISTERED">("ALL");
  const prevEventIds = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [mounted, status, router]);

  const loadEventsData = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/member/events?userId=${user.uid}&t=${Date.now()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const newEvents: ChurchEvent[] = data.events || [];
        const newIds = newEvents.map((e: ChurchEvent) => e.id);
        // Detect new events since last refresh
        const brandNew = newIds.filter((id: string) => !prevEventIds.current.includes(id));
        if (brandNew.length > 0 && prevEventIds.current.length > 0) {
          setNewEventsCount(brandNew.length);
          showToast(`${brandNew.length} new event(s) added!`, "info");
        }
        prevEventIds.current = newIds;
        setEvents(newEvents);
        setRegisteredIds(data.registeredEventIds || []);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      if (!silent) showToast("Could not load events", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (status === "authenticated" && user?.uid) {
      loadEventsData();
      // Poll every 30s for new events
      intervalRef.current = setInterval(() => loadEventsData(true), 30000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, status, loadEventsData]);

  const handleRegister = async (eventId: string) => {
    setProcessingId(eventId);
    // Optimistic update
    setRegisteredIds(prev => [...prev, eventId]);
    try {
      const res = await fetch("/api/member/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, eventId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Successfully registered!", "success");
      } else {
        // Rollback
        setRegisteredIds(prev => prev.filter(id => id !== eventId));
        showToast("Registration failed. Try again.", "error");
      }
    } catch (err) {
      setRegisteredIds(prev => prev.filter(id => id !== eventId));
      showToast("Network error. Please try again.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === "REGISTERED") return registeredIds.includes(event.id);
    if (filter === "UPCOMING") return new Date(event.date) >= new Date();
    return true;
  });

  const stats = {
    total: events.length,
    registered: registeredIds.length,
    upcoming: events.filter(e => new Date(e.date) >= new Date()).length,
  };

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl animate-pulse">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-gray-900">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2.5 max-w-sm backdrop-blur-xl border ${
              toast.type === "success"
                ? "bg-green-500/90 text-white border-green-400/30"
                : toast.type === "error"
                ? "bg-red-500/90 text-white border-red-400/30"
                : "bg-indigo-600/90 text-white border-indigo-400/30"
            }`}
          >
            <Bell className="w-4 h-4" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/member" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:gap-3 transition-all text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Updates
            </div>
            {lastRefreshed && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Synced {lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={() => loadEventsData()}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-gray-500 hover:text-purple-600 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 rounded-3xl p-8 text-white overflow-hidden relative shadow-2xl"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-xl" />
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-200" />
                <span className="text-purple-200 text-sm font-semibold uppercase tracking-wider">Church Programs</span>
              </div>
              <h1 className="text-3xl font-black mb-1">Events & Ministries</h1>
              <p className="text-purple-200 text-sm">Participate in worship services, fellowship camps & local outreach</p>
            </div>
            {/* Quick Stats */}
            <div className="flex gap-4 flex-shrink-0">
              {[
                { label: "Total", value: stats.total, icon: Activity },
                { label: "Registered", value: stats.registered, icon: UserCheck },
                { label: "Upcoming", value: stats.upcoming, icon: TrendingUp },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                  <div className="text-2xl font-black">{value}</div>
                  <div className="text-purple-200 text-[10px] font-semibold uppercase">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800/50 rounded-2xl p-1.5 border border-gray-100 dark:border-gray-700/50 w-fit shadow-sm">
          {(["ALL", "UPCOMING", "REGISTERED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === tab
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab === "ALL" ? `All (${stats.total})` : tab === "UPCOMING" ? `Upcoming (${stats.upcoming})` : `My RSVPs (${stats.registered})`}
            </button>
          ))}
        </div>

        {/* Events List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white dark:bg-gray-800/20 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700"
          >
            <Calendar className="w-12 h-12 text-purple-300 dark:text-purple-800 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">
              {filter === "REGISTERED" ? "You haven't registered for any events yet." : "No events listed at this time."}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filteredEvents.map((event, i) => {
                const isRegistered = registeredIds.includes(event.id);
                const isPast = new Date(event.date) < new Date();
                const gradient = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.DEFAULT;
                const catBg = CATEGORY_BG[event.category] || "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300";

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white dark:bg-gray-800/50 rounded-3xl border shadow-md overflow-hidden transition-all hover:shadow-xl group ${
                      isPast
                        ? "border-gray-100 dark:border-gray-700/30 opacity-60"
                        : isRegistered
                        ? "border-green-200 dark:border-green-900/30"
                        : "border-gray-100 dark:border-white/5 hover:border-purple-200 dark:hover:border-purple-900/40"
                    }`}
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${catBg}`}>
                            {event.category}
                          </span>
                          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </span>
                          {isPast && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full">
                              Past
                            </span>
                          )}
                          {!isPast && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              Upcoming
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-5 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-purple-500" />
                            {new Date(event.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-purple-500" />
                            {event.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isRegistered ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-5 py-3.5 bg-green-500 text-white rounded-2xl font-bold text-sm shadow-md flex items-center gap-1.5 select-none">
                              <UserCheck className="w-4 h-4" />
                              Registered!
                            </span>
                            <span className="text-xs text-green-600 dark:text-green-400 font-semibold">See you there 🙏</span>
                          </div>
                        ) : !isPast ? (
                          <button
                            type="button"
                            disabled={processingId === event.id}
                            onClick={() => handleRegister(event.id)}
                            className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:shadow-xl hover:shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                          >
                            {processingId === event.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Registering...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                RSVP Now
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="px-5 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-2xl font-bold text-sm">
                            Event Ended
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
