"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Calendar, MapPin, Clock, CheckCircle2, UserCheck,
  Loader2, RefreshCw, Bell, Users, TrendingUp, Activity,
  Filter, Search, ChevronRight, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
}

const CAT_STYLE: Record<string, { pill: string; bar: string }> = {
  WORSHIP:     { pill: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900/30", bar: "bg-purple-500" },
  PRAYER:      { pill: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900/30",           bar: "bg-rose-500"   },
  YOUTH:       { pill: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/30",     bar: "bg-amber-500"  },
  FELLOWSHIP:  { pill: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/30",     bar: "bg-green-500"  },
  OUTREACH:    { pill: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/30",           bar: "bg-blue-500"   },
};
const DEFAULT_STYLE = { pill: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/30", bar: "bg-indigo-500" };

type FilterTab = "ALL" | "UPCOMING" | "REGISTERED";

export default function MemberEvents() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const prevIds = useRef<string[]>([]);
  const interval = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  const load = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/member/events?userId=${user.uid}&t=${Date.now()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const newEvents: ChurchEvent[] = data.events || [];
        const newIds = newEvents.map((e: ChurchEvent) => e.id);
        if (prevIds.current.length && newIds.filter((id: string) => !prevIds.current.includes(id)).length) {
          showToast("New event added to the schedule!", "info");
        }
        prevIds.current = newIds;
        setEvents(newEvents);
        setRegisteredIds(data.registeredEventIds || []);
        setLastSynced(new Date());
      }
    } catch {
      if (!silent) showToast("Could not load events", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (status === "authenticated" && user?.uid) {
      load();
      interval.current = setInterval(() => load(true), 30000);
    }
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [status, user, load]);

  const handleRegister = async (eventId: string) => {
    setProcessingId(eventId);
    setRegisteredIds(prev => [...prev, eventId]); // optimistic
    try {
      const res = await fetch("/api/member/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, eventId }),
      });
      if (res.ok) {
        showToast("Successfully registered! See you there 🙏", "success");
      } else {
        setRegisteredIds(prev => prev.filter(id => id !== eventId));
        showToast("Registration failed. Please try again.", "error");
      }
    } catch {
      setRegisteredIds(prev => prev.filter(id => id !== eventId));
      showToast("Network error. Try again.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const now = new Date();
  const filtered = events.filter(e => {
    if (filter === "REGISTERED" && !registeredIds.includes(e.id)) return false;
    if (filter === "UPCOMING" && new Date(e.date) < now) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.date) >= now).length,
    registered: registeredIds.length,
  };

  if (!mounted || status === "loading") return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold border max-w-xs ${
              toast.type === "success" ? "bg-green-500 text-white border-green-400/30" :
              toast.type === "error"   ? "bg-red-500 text-white border-red-400/30" :
                                         "bg-indigo-600 text-white border-indigo-400/30"
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
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Church Events</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Browse upcoming programs and secure your seat</p>
        </div>
        <div className="flex items-center gap-2">
          {lastSynced && <span className="text-xs text-gray-400">Updated {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
          <button onClick={() => load()} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all text-xs font-semibold">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Events", value: stats.total, icon: Activity, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
          { label: "Upcoming",     value: stats.upcoming, icon: TrendingUp, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30" },
          { label: "My RSVPs",     value: stats.registered, icon: UserCheck, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{loading ? "—" : value}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide font-semibold mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all text-sm shadow-sm"
          />
        </div>
        <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-sm">
          {(["ALL", "UPCOMING", "REGISTERED"] as FilterTab[]).map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filter === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}>
              {tab === "ALL" ? "All" : tab === "UPCOMING" ? "Upcoming" : "My RSVPs"}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm">
            {search ? `No events matching "${search}"` : filter === "REGISTERED" ? "You haven't registered for any events yet" : "No events scheduled"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((event, i) => {
              const isRegistered = registeredIds.includes(event.id);
              const isPast = new Date(event.date) < now;
              const style = CAT_STYLE[event.category] || DEFAULT_STYLE;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md group ${
                    isRegistered ? "border-green-200 dark:border-green-900/30" :
                    isPast       ? "border-gray-100 dark:border-gray-800 opacity-60" :
                                   "border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900/40"
                  }`}
                >
                  <div className={`h-1 ${style.bar}`} />
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Date block */}
                    <div className="flex-shrink-0 w-14 text-center bg-gray-50 dark:bg-gray-800 rounded-xl py-2 px-1 border border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
                        {new Date(event.date).toLocaleDateString("en-IN", { month: "short" })}
                      </p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                        {new Date(event.date).getDate()}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${style.pill}`}>{event.category}</span>
                        {!isPast && <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Upcoming</span>}
                        {isPast && <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">Past</span>}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{event.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{event.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      {isRegistered ? (
                        <span className="flex items-center gap-1.5 px-4 py-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl text-xs font-bold border border-green-200 dark:border-green-900/30">
                          <UserCheck className="w-4 h-4" /> Registered
                        </span>
                      ) : !isPast ? (
                        <button
                          onClick={() => handleRegister(event.id)}
                          disabled={processingId === event.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50"
                        >
                          {processingId === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          RSVP
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-xl text-xs font-bold">Ended</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
