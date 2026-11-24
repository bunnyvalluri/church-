"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Calendar, MapPin, Clock, CheckCircle2, UserCheck,
  Loader2, RefreshCw, Bell, Users, TrendingUp, Activity,
  Filter, Search, ChevronRight, AlertCircle, Sparkles, X,
  Church, ExternalLink, Download, Video, Image as ImageIcon,
  Check, Share2, Compass
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ────────────────────────── Types ────────────────────────── */
interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  speaker?: string;
  mapsUrl?: string;
  isRecurring?: boolean;
}

type FilterTab = "ALL" | "UPCOMING" | "REGISTERED";
type CampusFilter = "ALL" | "Subhash Nagar" | "Shapur Nagar" | "Bahadurpally";

const CAT_STYLE: Record<string, { pill: string; bar: string; badgeBg: string }> = {
  WORSHIP:     { pill: "bg-purple-600 dark:bg-purple-700 text-white border-purple-500 font-extrabold shadow-xs", bar: "bg-purple-500", badgeBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  PRAYER:      { pill: "bg-rose-600 dark:bg-rose-700 text-white border-rose-500 font-extrabold shadow-xs",       bar: "bg-rose-500",   badgeBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
  YOUTH:       { pill: "bg-amber-600 dark:bg-amber-700 text-white border-amber-500 font-extrabold shadow-xs", bar: "bg-amber-500",  badgeBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  FELLOWSHIP:  { pill: "bg-emerald-600 dark:bg-emerald-700 text-white border-emerald-500 font-extrabold shadow-xs", bar: "bg-emerald-500", badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  OUTREACH:    { pill: "bg-indigo-600 dark:bg-indigo-700 text-white border-indigo-500 font-extrabold shadow-xs", bar: "bg-indigo-500",  badgeBg: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" },
  SPECIAL:     { pill: "bg-violet-600 dark:bg-violet-700 text-white border-violet-500 font-extrabold shadow-xs", bar: "bg-violet-500",  badgeBg: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800" },
};
const DEFAULT_STYLE = { pill: "bg-purple-600 dark:bg-purple-700 text-white border-purple-500 font-extrabold shadow-xs", bar: "bg-purple-500", badgeBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" };

/* ────────────────────────── Helpers ────────────────────────── */
function getGoogleCalendarUrl(event: { title: string; description: string; location: string; date: string; time: string }): string {
  const d = new Date(event.date);
  const startTime = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endTime = new Date(d.getTime() + 3 * 3600 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${startTime}/${endTime}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcsFile(event: { title: string; description: string; location: string; date: string; time: string }): void {
  const d = new Date(event.date);
  const start = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(d.getTime() + 3 * 3600 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kingdom of Christ Ministries//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.title.replace(/\s+/g, "-")}-${d.getTime()}@kcmchurch.org`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, " ")}`,
    `LOCATION:${event.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ────────────────────────── Translations ────────────────────────── */
const eventsTranslations = {
  en: {
    title: "Church Events",
    subtitle: "Browse upcoming programs and secure your seat",
    eventsTag: "Events",
    updated: "Updated",
    refresh: "Refresh",
    totalEvents: "Total",
    upcoming: "Upcoming",
    myRsvps: "My RSVPs",
    searchPlaceholder: "Search events, speaker, location...",
    allCampuses: "All Campuses",
    subhashCampus: "Subhash Nagar",
    shapurCampus: "Shapur Nagar",
    bahadurpallyCampus: "Bahadurpally",
    tabAll: "All",
    tabUpcoming: "Upcoming",
    tabRegistered: "My RSVPs",
    newEventAlert: "New event added to the schedule!",
    loadError: "Could not load events",
    successRsvp: "Successfully registered! See you there 🙏",
    unrsvpSuccess: "RSVP cancelled successfully.",
    failRsvp: "Registration failed. Please try again.",
    netError: "Network error. Try again.",
    noEvents: "No events scheduled",
    noRegistered: "You haven't registered for any events yet",
    noMatches: 'No events matching "{query}"',
    pastBadge: "Completed",
    upcomingBadge: "Upcoming",
    recurringBadge: "Weekly Service",
    statusRegistered: "Registered",
    statusRsvp: "Reserve My Seat (RSVP)",
    statusEnded: "Completed Gathering",
    directions: "Directions",
    calendar: "Calendar",
    googleCal: "Google Calendar",
    icsCal: "Apple / Outlook (.ics)",
    watchMessage: "Watch Sermon",
    viewPhotos: "View Photos",
    speakerLabel: "Speaker / Host",
  },
  te: {
    title: "చర్చి కార్యక్రమాలు",
    subtitle: "రాబోయే కార్యక్రమాలను బ్రౌజ్ చేయండి మరియు మీ సీటును భద్రపరుచుకోండి",
    eventsTag: "కార్యక్రమాలు",
    updated: "సమకాలీకరించబడింది",
    refresh: "రిఫ్రెష్",
    totalEvents: "మొత్తం",
    upcoming: "రాబోయేవి",
    myRsvps: "నా సీట్లు",
    searchPlaceholder: "కార్యక్రమాలు, ప్రసంగీకులు లేదా స్థలాల కోసం వెతకండి...",
    allCampuses: "అన్ని బ్రాంచులు",
    subhashCampus: "సుభాష్ నగర్",
    shapurCampus: "షాపూర్ నగర్",
    bahadurpallyCampus: "బహదూర్‌పల్లి",
    tabAll: "అన్నీ",
    tabUpcoming: "రాబోయేవి",
    tabRegistered: "నా సీట్లు",
    newEventAlert: "షెడ్యూల్‌లో కొత్త కార్యక్రమం జోడించబడింది!",
    loadError: "కార్యక్రమాలను లోడ్ చేయడం వీలుపడలేదు",
    successRsvp: "విజయవంతంగా నమోదైంది! అక్కడ కలుద్దాం 🙏",
    unrsvpSuccess: "సీటు రద్దు చేయబడింది.",
    failRsvp: "నమోదు విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    netError: "నెట్‌వర్క్ లోపం. మళ్ళీ ప్రయత్నించండి.",
    noEvents: "ఎటువంటి కార్యక్రమాలు షెడ్యూల్ చేయబడలేదు",
    noRegistered: "మీరు ఇంకా ఏ కార్యక్రమానికి నమోదు చేసుకోలేదు",
    noMatches: '"{query}" కి సరిపోలే కార్యక్రమాలు ఏవీ లేవు',
    pastBadge: "ముగిసింది",
    upcomingBadge: "రాబోయేవి",
    recurringBadge: "వారంవారీ ఆరాధన",
    statusRegistered: "నమోదైనవి",
    statusRsvp: "నా సీటు రిజర్వ్ చేయి (RSVP)",
    statusEnded: "ముగిసిన కూడిక",
    directions: "దిశలు (మ్యాప్స్)",
    calendar: "క్యాలెండర్",
    googleCal: "గూగుల్ క్యాలెండర్",
    icsCal: "ఆపిల్ / ఔట్లుక్ (.ics)",
    watchMessage: "ప్రసంగం వినండి",
    viewPhotos: "ఫోటోలు చూడండి",
    speakerLabel: "ప్రసంగీకులు / ఆహ్వానికులు",
  },
  hi: {
    title: "चर्च के कार्यक्रम",
    subtitle: "आगामी कार्यक्रमों को देखें और अपनी सीट सुरक्षित करें",
    eventsTag: "कार्यक्रम",
    updated: "अपडेट किया गया",
    refresh: "रिफ्रेश",
    totalEvents: "कुल",
    upcoming: "आगामी",
    myRsvps: "मेरी सीटें",
    searchPlaceholder: "कार्यक्रम, वक्ता या स्थान खोजें...",
    allCampuses: "सभी परिसर",
    subhashCampus: "सुभाष नगर",
    shapurCampus: "शापुर नगर",
    bahadurpallyCampus: "बहादुरपल्ली",
    tabAll: "सभी",
    tabUpcoming: "आगामी",
    tabRegistered: "मेरी सीटें",
    newEventAlert: "शेड्यूल में नया कार्यक्रम जोड़ा गया!",
    loadError: "कार्यक्रम लोड नहीं किए जा सके",
    successRsvp: "सफलतापूर्वक पंजीकृत! वहाँ मिलते हैं 🙏",
    unrsvpSuccess: "सीट निरस्त की गई।",
    failRsvp: "पंजीकरण विफल रहा। कृपया पुन: प्रयास करें।",
    netError: "नेटवर्क त्रुटि। पुन: प्रयास करें।",
    noEvents: "कोई कार्यक्रम निर्धारित नहीं है",
    noRegistered: "आपने अभी तक किसी भी कार्यक्रम के लिए पंजीकरण नहीं कराया है",
    noMatches: '"{query}" से मेल खाने वाला कोई कार्यक्रम नहीं मिला',
    pastBadge: "समाप्त",
    upcomingBadge: "आगामी",
    recurringBadge: "साप्ताहिक आराधना",
    statusRegistered: "पंजीकृत",
    statusRsvp: "मेरी सीट आरक्षित करें (RSVP)",
    statusEnded: "समाप्त सभा",
    directions: "दिशाएं (मानचित्र)",
    calendar: "कैलेंडर",
    googleCal: "गूगल कैलेंडर",
    icsCal: "एप्पल / आउटलुक (.ics)",
    watchMessage: "प्रवचन सुनें",
    viewPhotos: "तस्वीरें देखें",
    speakerLabel: "वक्ता / मेज़बान",
  }
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function MemberEvents() {
  const { user, status, mounted } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const et = eventsTranslations[language as keyof typeof eventsTranslations] || eventsTranslations.en;

  const [dbEvents, setDbEvents] = useState<ChurchEvent[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [campusFilter, setCampusFilter] = useState<CampusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [activeCalendarMenu, setActiveCalendarMenu] = useState<string | null>(null);

  const prevIds = useRef<string[]>([]);
  const interval = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  // Click outside listener for calendar dropdown menu
  useEffect(() => {
    const handleClickOutside = () => setActiveCalendarMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  /* ── Load Events From Server ─────────────────────────────── */
  const load = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/member/events?userId=${user.uid}&t=${Date.now()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const fetchedEvents: ChurchEvent[] = data.events || [];
        const newIds = fetchedEvents.map((e: ChurchEvent) => e.id);
        if (prevIds.current.length && newIds.filter((id: string) => !prevIds.current.includes(id)).length) {
          showToast(et.newEventAlert, "info");
        }
        prevIds.current = newIds;
        setDbEvents(fetchedEvents);
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
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [status, user, load]);

  /* ── Events List (Exclusively Real Events From Church Database) ── */
  const allEvents = useMemo(() => {
    return [...dbEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dbEvents]);

  /* ── RSVP Handler ────────────────────────────────────────── */
  const handleRegister = async (eventId: string) => {
    setProcessingId(eventId);
    const wasRegistered = registeredIds.includes(eventId);

    if (wasRegistered) {
      // Toggle off / cancel
      setRegisteredIds(prev => prev.filter(id => id !== eventId));
      showToast(et.unrsvpSuccess, "info");
      setProcessingId(null);
      return;
    }

    // Add optimistic registration
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

  /* ── Filtering Logic ─────────────────────────────────────── */
  const filtered = useMemo(() => {
    return allEvents.filter(e => {
      const isPast = new Date(e.date) < now;

      // Filter Tab
      if (filter === "REGISTERED" && !registeredIds.includes(e.id)) return false;
      if (filter === "UPCOMING" && isPast) return false;

      // Campus Filter
      if (campusFilter !== "ALL") {
        const locLower = (e.location || "").toLowerCase();
        if (campusFilter === "Subhash Nagar" && !locLower.includes("subhash")) return false;
        if (campusFilter === "Shapur Nagar" && !locLower.includes("shapur")) return false;
        if (campusFilter === "Bahadurpally" && !locLower.includes("bahadur")) return false;
      }

      // Search Query
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = (e.title || "").toLowerCase().includes(q);
        const matchesLoc = (e.location || "").toLowerCase().includes(q);
        const matchesSpeaker = (e.speaker || "").toLowerCase().includes(q);
        const matchesDesc = (e.description || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesSpeaker && !matchesDesc) return false;
      }

      return true;
    });
  }, [allEvents, filter, campusFilter, search, registeredIds, now]);

  const stats = useMemo(() => {
    return {
      total: allEvents.length,
      upcoming: allEvents.filter(e => new Date(e.date) >= now).length,
      registered: registeredIds.length,
    };
  }, [allEvents, registeredIds, now]);

  if (status === "unauthenticated" && mounted) return null;

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 sm:bottom-8 sm:left-auto sm:right-6 sm:translate-x-0 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border max-w-[92vw] sm:max-w-md backdrop-blur-xl transition-all ${
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

      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900/60 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-white/5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{et.title}</h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-600 text-white border border-indigo-500 shadow-xs">
              <Calendar className="w-3 h-3 text-white" /> {et.eventsTag}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{et.subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {mounted && lastSynced && (
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">
              {et.updated} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => load(false)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Refresh events schedule"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
            <span>{et.refresh}</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Stat Cards (Fitts' Law: Click to Filter) ── */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {[
          {
            tab: "ALL" as FilterTab,
            label: et.totalEvents,
            value: stats.total,
            icon: Activity,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-950/40",
            border: filter === "ALL" ? "ring-2 ring-indigo-500 border-indigo-500 shadow-md" : "border-gray-100 dark:border-white/5",
          },
          {
            tab: "UPCOMING" as FilterTab,
            label: et.upcoming,
            value: stats.upcoming,
            icon: TrendingUp,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/40",
            border: filter === "UPCOMING" ? "ring-2 ring-emerald-500 border-emerald-500 shadow-md" : "border-gray-100 dark:border-white/5",
          },
          {
            tab: "REGISTERED" as FilterTab,
            label: et.myRsvps,
            value: stats.registered,
            icon: UserCheck,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-950/40",
            border: filter === "REGISTERED" ? "ring-2 ring-purple-500 border-purple-500 shadow-md" : "border-gray-100 dark:border-white/5",
          },
        ].map(({ tab, label, value, icon: Icon, color, bg, border }) => (
          <button
            key={label}
            type="button"
            onClick={() => setFilter(tab)}
            className={`bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border shadow-sm p-3 sm:p-4.5 flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3.5 transition-all active:scale-[0.98] cursor-pointer ${border}`}
          >
            <div className={`w-8 h-8 sm:w-11 sm:h-11 ${bg} rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-xs`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                {loading ? "—" : value}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-extrabold mt-1 truncate">
                {label}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Search Bar, Tabs & Campus Filters ────────────────── */}
      <div className="space-y-3 bg-white dark:bg-gray-900/60 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-white/5 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={et.searchPlaceholder}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all text-xs sm:text-sm font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Status Tabs */}
          <div className="bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-2xl grid grid-cols-3 gap-1 w-full sm:w-auto min-w-[270px]">
            {(["ALL", "UPCOMING", "REGISTERED"] as FilterTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap flex items-center justify-center cursor-pointer ${
                  filter === tab
                    ? "bg-purple-600 text-white shadow-xs font-black"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab === "ALL" ? et.tabAll : tab === "UPCOMING" ? et.tabUpcoming : et.tabRegistered}
              </button>
            ))}
          </div>
        </div>

        {/* Campus Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> Campus:
          </span>
          {[
            { id: "ALL" as CampusFilter, label: et.allCampuses },
            { id: "Subhash Nagar" as CampusFilter, label: et.subhashCampus },
            { id: "Shapur Nagar" as CampusFilter, label: et.shapurCampus },
            { id: "Bahadurpally" as CampusFilter, label: et.bahadurpallyCampus },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setCampusFilter(c.id)}
              className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-all cursor-pointer ${
                campusFilter === c.id
                  ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 shadow-xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Events List ─────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-3xl animate-pulse border border-gray-100 dark:border-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 sm:py-16 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-white/10 shadow-sm"
        >
          <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-purple-600 dark:text-purple-400 shadow-xs">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
            {search ? et.noMatches.replace("{query}", search) : filter === "REGISTERED" ? et.noRegistered : et.noEvents}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            All fellowship and prayer services are updated dynamically. Reset your filters to see upcoming weekly celebration services.
          </p>
          {(filter !== "ALL" || campusFilter !== "ALL" || search) && (
            <button
              onClick={() => { setFilter("ALL"); setCampusFilter("ALL"); setSearch(""); }}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((event, i) => {
              const isRegistered = registeredIds.includes(event.id);
              const isPast = new Date(event.date) < now;
              const style = CAT_STYLE[event.category] || DEFAULT_STYLE;
              const evDate = new Date(event.date);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-white dark:bg-gray-900 rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg group ${
                    isRegistered
                      ? "border-emerald-300 dark:border-emerald-900/40 shadow-emerald-500/5 ring-1 ring-emerald-400/20"
                      : isPast
                      ? "border-gray-200 dark:border-white/5 opacity-85"
                      : "border-gray-200/90 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-800"
                  }`}
                >
                  {/* Category Accent Stripe */}
                  <div className={`h-1.5 ${style.bar}`} />

                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4 sm:gap-5">
                    {/* Modern Date Tile */}
                    <div className="flex md:flex-col flex-row items-center justify-between md:justify-center gap-2 md:gap-0.5 md:w-20 md:h-20 text-center bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-2.5 border border-gray-100 dark:border-white/5 shrink-0">
                      <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                        {evDate.toLocaleDateString("en-IN", { month: "short" })}
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none">
                        {evDate.getDate()}
                      </span>
                      <span className="text-[9.5px] font-extrabold text-gray-400 uppercase tracking-wider">
                        {evDate.toLocaleDateString("en-IN", { weekday: "short" })}
                      </span>
                    </div>

                    {/* Event Core Information */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Badges Bar */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${style.pill}`}>
                          {event.category}
                        </span>

                        {!isPast ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            {et.upcomingBadge}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                            <Check className="w-3 h-3 text-gray-400" />
                            {et.pastBadge}
                          </span>
                        )}
                      </div>

                      {/* Event Title */}
                      <h3 className="font-extrabold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-base sm:text-lg leading-snug">
                        {event.title}
                      </h3>

                      {/* Speaker / Presiding Host */}
                      {event.speaker && (
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>{event.speaker}</span>
                        </p>
                      )}

                      {/* Description */}
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>

                      {/* Time & Venue Metadata */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>{event.time}</span>
                        </span>

                        <span className="flex items-center gap-1.5 shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{event.location}</span>
                        </span>

                        {/* Directions / Maps Link */}
                        <a
                          href={event.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:underline font-bold text-[11px] shrink-0"
                        >
                          <Compass className="w-3 h-3" />
                          <span>{et.directions}</span>
                        </a>

                        {/* Add to Calendar Action */}
                        <div className="relative inline-block text-left shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCalendarMenu(activeCalendarMenu === event.id ? null : event.id);
                            }}
                            className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                          >
                            <Calendar className="w-3 h-3 text-purple-600" />
                            <span>{et.calendar}</span>
                          </button>

                          {activeCalendarMenu === event.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 bottom-full mb-1 z-30 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 text-xs"
                            >
                              <a
                                href={getGoogleCalendarUrl(event)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{et.googleCal}</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  downloadIcsFile(event);
                                  setActiveCalendarMenu(null);
                                }}
                                className="w-full text-left flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{et.icsCal}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Block */}
                    <div className="flex md:flex-col items-stretch md:items-end justify-between md:justify-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-white/5 w-full md:w-auto">
                      {!isPast ? (
                        isRegistered ? (
                          <button
                            type="button"
                            onClick={() => handleRegister(event.id)}
                            disabled={processingId === event.id}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-black border border-emerald-300 dark:border-emerald-800 transition-all shadow-xs w-full md:w-auto cursor-pointer"
                            title="Click to cancel registration"
                          >
                            {processingId === event.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                            )}
                            <span>{et.statusRegistered}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRegister(event.id)}
                            disabled={processingId === event.id}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-purple-500/20 active:scale-95 disabled:opacity-50 w-full md:w-auto cursor-pointer"
                          >
                            {processingId === event.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                            <span>{et.statusRsvp}</span>
                          </button>
                        )
                      ) : (
                        /* Past Event Engagement: View Highlights & Watch Sermon */
                        <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                          <span className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl text-[11px] font-bold text-center">
                            <Check className="w-3.5 h-3.5 text-gray-400" />
                            <span>{et.statusEnded}</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            <Link
                              href="/member/sermons"
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-800 transition-colors"
                            >
                              <Video className="w-3 h-3" />
                              <span>{et.watchMessage}</span>
                            </Link>
                            <Link
                              href="/gallery"
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-bold border border-gray-200 dark:border-gray-700 transition-colors"
                            >
                              <ImageIcon className="w-3 h-3" />
                              <span>{et.viewPhotos}</span>
                            </Link>
                          </div>
                        </div>
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
