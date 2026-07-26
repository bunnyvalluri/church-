"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Calendar, MapPin, Clock, CheckCircle2, UserCheck,
  Loader2, RefreshCw, Bell, Users, TrendingUp, Activity,
  Filter, Search, ChevronRight, AlertCircle, Sparkles
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
  WORSHIP:     { pill: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40", bar: "bg-purple-500" },
  PRAYER:      { pill: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40",           bar: "bg-rose-500"   },
  YOUTH:       { pill: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",     bar: "bg-amber-500"  },
  FELLOWSHIP:  { pill: "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/40",     bar: "bg-green-500"  },
  OUTREACH:    { pill: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40",           bar: "bg-blue-500"   },
};
const DEFAULT_STYLE = { pill: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40", bar: "bg-purple-500" };

type FilterTab = "ALL" | "UPCOMING" | "REGISTERED";

const eventsTranslations = {
  en: {
    title: "Church Events",
    subtitle: "Browse upcoming programs and secure your seat",
    updated: "Updated",
    refresh: "Refresh",
    totalEvents: "Total",
    upcoming: "Upcoming",
    myRsvps: "My RSVPs",
    searchPlaceholder: "Search events or location...",
    tabAll: "All",
    tabUpcoming: "Upcoming",
    tabRegistered: "My RSVPs",
    newEventAlert: "New event added to the schedule!",
    loadError: "Could not load events",
    successRsvp: "Successfully registered! See you there 🙏",
    failRsvp: "Registration failed. Please try again.",
    netError: "Network error. Try again.",
    noEvents: "No events scheduled",
    noRegistered: "You haven't registered for any events yet",
    noMatches: 'No events matching "{query}"',
    pastBadge: "Past",
    upcomingBadge: "Upcoming",
    statusRegistered: "Registered",
    statusRsvp: "RSVP",
    statusEnded: "Ended",
  },
  te: {
    title: "చర్చి కార్యక్రమాలు",
    subtitle: "రాబోయే కార్యక్రమాలను బ్రౌజ్ చేయండి మరియు మీ సీటును భద్రపరుచుకోండి",
    updated: "సమకాలీకరించబడింది",
    refresh: "రిఫ్రెష్",
    totalEvents: "మొత్తం",
    upcoming: "రాబోయేవి",
    myRsvps: "నా సీట్లు",
    searchPlaceholder: "కార్యక్రమాలు లేదా స్థలాల కోసం వెతకండి...",
    tabAll: "అన్నీ",
    tabUpcoming: "రాబోయేవి",
    tabRegistered: "నా సీట్లు",
    newEventAlert: "షెడ్యూల్‌లో కొత్త కార్యక్రమం జోడించబడింది!",
    loadError: "కార్యక్రమాలను లోడ్ చేయడం వీలుపడలేదు",
    successRsvp: "విజయవంతంగా నమోదైంది! అక్కడ కలుద్దాం 🙏",
    failRsvp: "నమోదు విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    netError: "నెట్‌వర్క్ లోపం. మళ్ళీ ప్రయత్నించండి.",
    noEvents: "ఎటువంటి కార్యక్రమాలు షెడ్యూల్ చేయబడలేదు",
    noRegistered: "మీరు ఇంకా ఏ కార్యక్రమానికి నమోదు చేసుకోలేదు",
    noMatches: '"{query}" కి సరిపోలే కార్యక్రమాలు ఏవీ లేవు',
    pastBadge: "గతించినవి",
    upcomingBadge: "రాబోయేవి",
    statusRegistered: "నమోదైనవి",
    statusRsvp: "బుక్ చేయి (RSVP)",
    statusEnded: "ముగిసింది",
  },
  hi: {
    title: "चर्च के कार्यक्रम",
    subtitle: "आगामी कार्यक्रमों को देखें और अपनी सीट सुरक्षित करें",
    updated: "अपडेट किया गया",
    refresh: "रिफ्रेश",
    totalEvents: "कुल",
    upcoming: "आगामी",
    myRsvps: "मेरी सीटें",
    searchPlaceholder: "कार्यक्रम या स्थान खोजें...",
    tabAll: "सभी",
    tabUpcoming: "आगामी",
    tabRegistered: "मेरी सीटें",
    newEventAlert: "शेड्यूल में नया कार्यक्रम जोड़ा गया!",
    loadError: "कार्यक्रम लोड नहीं किए जा सके",
    successRsvp: "सफलतापूर्वक पंजीकृत! वहाँ मिलते हैं 🙏",
    failRsvp: "पंजीकरण विफल रहा। कृपया पुन: प्रयास करें।",
    netError: "नेटवर्क त्रुटि। पुन: प्रयास करें।",
    noEvents: "कोई कार्यक्रम निर्धारित नहीं है",
    noRegistered: "आपने अभी तक किसी भी कार्यक्रम के लिए पंजीकरण नहीं कराया है",
    noMatches: '"{query}" से मेल खाने वाला कोई कार्यक्रम नहीं मिला',
    pastBadge: "बीता हुआ",
    upcomingBadge: "आगामी",
    statusRegistered: "पंजीकृत",
    statusRsvp: "आरएसवीपी (RSVP)",
    statusEnded: "समाप्त",
  }
};

export default function MemberEvents() {
  const { user, status, mounted } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const et = eventsTranslations[language as keyof typeof eventsTranslations] || eventsTranslations.en;

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
          showToast(et.newEventAlert, "info");
        }
        prevIds.current = newIds;
        setEvents(newEvents);
        setRegisteredIds(data.registeredEventIds || []);
        setLastSynced(new Date());
      }
    } catch {
      if (!silent) showToast(et.loadError, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, et.newEventAlert, et.loadError]);

  useEffect(() => {
    if (status === "authenticated" && user?.uid) {
      load();
      interval.current = setInterval(() => load(true), 30000);
    }
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [status, user, load]);

  const handleRegister = async (eventId: string) => {
    setProcessingId(eventId);
    setRegisteredIds(prev => [...prev, eventId]);
    try {
      const res = await fetch("/api/member/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, eventId }),
      });
      if (res.ok) {
        showToast(et.successRsvp, "success");
      } else {
        setRegisteredIds(prev => prev.filter(id => id !== eventId));
        showToast(et.failRsvp, "error");
      }
    } catch {
      setRegisteredIds(prev => prev.filter(id => id !== eventId));
      showToast(et.netError, "error");
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
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 sm:bottom-8 sm:left-auto sm:right-6 sm:translate-x-0 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border max-w-[92vw] sm:max-w-md backdrop-blur-xl transition-all ${
              toast.type === "success" ? "bg-emerald-600 text-white border-emerald-400/40 shadow-emerald-600/30" :
              toast.type === "error"   ? "bg-red-600 text-white border-red-400/40 shadow-red-600/30" :
                                         "bg-indigo-600 text-white border-indigo-400/40 shadow-indigo-600/30"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" /> :
             toast.type === "error"   ? <AlertCircle className="w-4 h-4 flex-shrink-0 text-white" /> :
                                        <Bell className="w-4 h-4 flex-shrink-0 text-white" />}
            <span className="leading-snug whitespace-normal">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between gap-3 mb-1 sm:mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">{et.title}</h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Calendar className="w-3 h-3" /> Events
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{et.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {mounted && lastSynced && (
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
              {et.updated} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => load()}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-xs font-semibold shadow-sm active:scale-95"
            title="Refresh events schedule"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
            <span className="hidden sm:inline">{et.refresh}</span>
          </button>
        </div>
      </div>

      {/* STATS ROW — 3-Column Compact Grid on Mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: et.totalEvents, value: stats.total, icon: Activity, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40" },
          { label: et.upcoming,     value: stats.upcoming, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40" },
          { label: et.myRsvps,     value: stats.registered, icon: UserCheck, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40" },
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

      {/* CONTROLS: Search Input & Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={et.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all text-xs sm:text-sm font-medium shadow-sm"
          />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-1 shadow-sm grid grid-cols-3 gap-1 w-full sm:w-auto min-w-[280px]">
          {(["ALL", "UPCOMING", "REGISTERED"] as FilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`w-full py-2 px-2 rounded-xl text-xs font-black transition-all text-center whitespace-nowrap flex items-center justify-center ${
                filter === tab
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab === "ALL" ? et.tabAll : tab === "UPCOMING" ? et.tabUpcoming : et.tabRegistered}
            </button>
          ))}
        </div>
      </div>

      {/* EVENTS LIST */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-3xl animate-pulse border border-gray-100 dark:border-gray-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 sm:py-16 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
            {search ? et.noMatches.replace("{query}", search) : filter === "REGISTERED" ? et.noRegistered : et.noEvents}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
            Check back soon for new worship services, fellowship meetings, and ministry events.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3.5">
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
                  className={`bg-white dark:bg-gray-900 rounded-3xl border shadow-md overflow-hidden transition-all hover:shadow-lg group backdrop-blur-xl ${
                    isRegistered ? "border-emerald-300 dark:border-emerald-900/40 shadow-emerald-500/5" :
                    isPast       ? "border-gray-100 dark:border-gray-800 opacity-60" :
                                   "border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700"
                  }`}
                >
                  <div className={`h-1.5 ${style.bar}`} />
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4">
                    {/* Date Block */}
                    <div className="flex-shrink-0 flex sm:flex-col flex-row items-center justify-between sm:justify-center gap-2 sm:gap-0 sm:w-16 text-center bg-gray-50 dark:bg-gray-800/60 rounded-2xl py-2 px-3 sm:px-1 border border-gray-100 dark:border-gray-700/60">
                      <p className="text-[11px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {new Date(event.date).toLocaleDateString("en-IN", { month: "short" })}
                      </p>
                      <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                        {new Date(event.date).getDate()}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${style.pill}`}>
                          {event.category}
                        </span>
                        {!isPast && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            {et.upcomingBadge}
                          </span>
                        )}
                        {isPast && (
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                            {et.pastBadge}
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm sm:text-base leading-tight">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5 flex-shrink-0">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          {event.location}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                      {isRegistered ? (
                        <span className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-extrabold border border-emerald-200 dark:border-emerald-800/40 w-full sm:w-auto shadow-sm">
                          <UserCheck className="w-4 h-4 text-emerald-600" /> {et.statusRegistered}
                        </span>
                      ) : !isPast ? (
                        <button
                          onClick={() => handleRegister(event.id)}
                          disabled={processingId === event.id}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 w-full sm:w-auto"
                        >
                          {processingId === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          {et.statusRsvp}
                        </button>
                      ) : (
                        <span className="flex items-center justify-center px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-2xl text-xs font-bold w-full sm:w-auto">
                          {et.statusEnded}
                        </span>
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
