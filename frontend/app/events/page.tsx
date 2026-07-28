"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Building2,
  Filter,
  Search,
  X,
  Bell,
  Wifi,
} from "lucide-react";
import NotificationPopup, { NotificationData } from "@/components/NotificationPopup";
import { useBranch } from "@/components/providers/BranchProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";

// ── Inline EventCard for landing page (simpler, public-facing) ──────────────
interface PublicEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  status: string;
  image?: string | null;
  branch?: { name: string } | null;
  media?: { imageUrl: string }[];
  _count?: { registrations: number; media: number };
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  WORSHIP: { bg: "bg-purple-600", text: "text-white font-black", border: "border-purple-500" },
  PRAYER: { bg: "bg-blue-600", text: "text-white font-black", border: "border-blue-500" },
  YOUTH: { bg: "bg-amber-600", text: "text-white font-black", border: "border-amber-500" },
  CHILDREN: { bg: "bg-pink-600", text: "text-white font-black", border: "border-pink-500" },
  WOMEN: { bg: "bg-rose-600", text: "text-white font-black", border: "border-rose-500" },
  MEN: { bg: "bg-sky-600", text: "text-white font-black", border: "border-sky-500" },
  SPECIAL: { bg: "bg-indigo-600", text: "text-white font-black", border: "border-indigo-500" },
};

function PublicEventCard({ event, isNew }: { event: PublicEvent; isNew?: boolean }) {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const cat = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.SPECIAL;
  const eventDate = new Date(event.date);
  const isUpcoming = mounted && eventDate > new Date();
  const thumbnail = event.image || event.media?.[0]?.imageUrl;
  const locale = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-IN";

  return (
    <div className={`group bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${isNew ? "border-violet-500/50 ring-2 ring-violet-500/30 animate-in slide-in-from-bottom-4 duration-500" : "border-slate-200 dark:border-white/10 hover:border-violet-500/40 dark:hover:border-violet-500/40"}`}>
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700">
        {thumbnail ? (
          <img src={thumbnail} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-25">
            <Calendar className="w-20 h-20 text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl text-white shadow-sm border ${cat.bg} ${cat.border}`}>
            {(t.events?.categories as any)?.[event.category] || event.category}
          </span>
          {isUpcoming && (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-emerald-500 text-white shadow-sm">
              {t.events?.badgeUpcoming || "UPCOMING"}
            </span>
          )}
          {isNew && (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-violet-600 text-white shadow-sm animate-bounce">
              {t.events?.badgeNew || "NEW"}
            </span>
          )}
        </div>

        {/* Date chip */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
          <p className="text-[11px] font-black text-white" suppressHydrationWarning>
            {eventDate.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight line-clamp-1">{event.title}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{event.description}</p>

        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            <span>{event.time || "TBD"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          {event.branch && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{event.branch.name}</span>
            </div>
          )}
        </div>

        {event._count && event._count.registrations > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-white/10">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
              {event._count.registrations} {t.events?.registeredText || "registered"} · {event._count.media || 0} {t.events?.photosText || "photos"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Events Page ──────────────────────────────────────────────────────────
export default function EventsPage() {
  const { selectedBranchId } = useBranch();
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [liveCount, setLiveCount] = useState(0);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // ── Fetch events ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const url = selectedBranchId === "all"
          ? "/api/events?status=PUBLISHED&limit=50"
          : `/api/branch/${selectedBranchId}/events`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success) setEvents(data.events);
        }
      } catch { /* fail silently */ }
      finally { setIsLoading(false); }
    };
    loadEvents();
  }, [selectedBranchId]);

  // ── Socket.io real-time updates ─────────────────────────────────────────
  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => setIsSocketConnected(true));
    socket.on("disconnect", () => setIsSocketConnected(false));

    socket.on("new-event", (payload: any) => {
      // Add to top of list
      const newEvent: PublicEvent = {
        id: payload.id,
        title: payload.title,
        description: payload.description,
        date: payload.date,
        time: payload.time || "TBD",
        location: payload.location,
        category: payload.category,
        status: payload.status,
        image: payload.image || null,
        branch: payload.branchName ? { name: payload.branchName } : null,
        _count: { registrations: 0, media: 0 },
      };

      setEvents((prev) => {
        // Avoid duplicates
        if (prev.some((e) => e.id === payload.id)) {
          return prev.map((e) => e.id === payload.id ? { ...e, ...newEvent } : e);
        }
        return [newEvent, ...prev];
      });

      setNewEventIds((prev) => {
        const next = new Set(prev);
        next.add(payload.id);
        setTimeout(() => {
          setNewEventIds((p) => { const n = new Set(p); n.delete(payload.id); return n; });
        }, 10000);
        return next;
      });

      setLiveCount((n) => n + 1);

      const locale = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-IN";
      setNotification({
        id: String(Date.now()),
        type: "new-event",
        title: `New Event: ${payload.title}`,
        description: `${payload.location} · ${new Date(payload.date).toLocaleDateString(locale)}`,
        timestamp: new Date(),
        icon: "event",
      });
    });

    socket.on("event-images-uploaded", (payload: any) => {
      // Update media count for existing event
      setEvents((prev) =>
        prev.map((e) =>
          e.id === payload.eventId
            ? { ...e, _count: { ...e._count, registrations: e._count?.registrations || 0, media: (e._count?.media || 0) + payload.imagesCount } }
            : e
        )
      );
      setNotification({
        id: String(Date.now()),
        type: "event-images-uploaded",
        title: `${payload.imagesCount} Photos Added`,
        description: `Event: ${payload.eventTitle}`,
        timestamp: new Date(),
        icon: "upload",
      });
    });

    return () => { socket.disconnect(); };
  }, [language]);

  // ── Filters ─────────────────────────────────────────────────────────────
  const filtered = events.filter((e) => {
    const matchSearch =
      searchQuery === "" ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "ALL" || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const upcoming = filtered.filter((e) => new Date(e.date) > new Date());
  const past = filtered.filter((e) => new Date(e.date) <= new Date());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05050a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* Notification popup */}
      <NotificationPopup notification={notification} onDismiss={() => setNotification(null)} />

      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-900 dark:bg-[#080811] text-white pt-36 pb-20 md:pt-40 md:pb-24 border-b border-slate-800/80 dark:border-white/5">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-1/4 w-96 h-96 rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/20 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <div className="mb-6 flex justify-center">
            <BackToHome />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/70 border border-purple-400/50 text-xs font-extrabold uppercase tracking-wider text-white mb-6 backdrop-blur-md shadow-md">
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300/30" />
            <span className="text-white font-extrabold tracking-wider">{t.nav?.churchName || "Kingdom of Christ"} {t.nav?.ministries || "Ministries"}</span>
            {isSocketConnected && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-4 font-outfit">
            {(t.events as any)?.pageTitle1 || "Events &"}{" "}
            <span className="bg-gradient-to-r from-violet-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              {(t.events as any)?.pageTitle2 || "Gatherings"}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            {(t.events as any)?.pageSubtitle || "Stay connected with what's happening across all three branches — Shapur Nagar, Subhash Nagar, and Bahadurpally."}
          </p>

          {liveCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-violet-900/60 border border-violet-400/40 rounded-full text-xs font-extrabold text-white shadow-md backdrop-blur-md">
              <Bell className="w-3.5 h-3.5 text-amber-300" />
              {liveCount} {(t.events as any)?.liveAdded || "new event(s) added live tonight"}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-md mx-auto mt-10 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
            {[
              { label: (t.events as any)?.totalEvents || "Total Events", value: events.length },
              { label: (t.events as any)?.upcoming || "Upcoming", value: upcoming.length },
              { label: (t.events as any)?.branches || "Branches", value: 3 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-white">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-300 font-bold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky Search + Filter Bar ────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#080811]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={(t.events as any)?.searchPlaceholder || "Search events by name or location..."}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{(t.events as any)?.allCategories || "All Categories"}</option>
            {["WORSHIP", "PRAYER", "YOUTH", "CHILDREN", "WOMEN", "MEN", "SPECIAL"].map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {(t.events?.categories as any)?.[c] || c.charAt(0) + c.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Events Content ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 bg-slate-200/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Upcoming events */}
            {upcoming.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {(t.events as any)?.upcomingEvents || "Upcoming Events"}
                  </h2>
                  <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black px-3 py-1 rounded-xl">
                    {upcoming.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcoming.map((event) => (
                    <PublicEventCard
                      key={event.id}
                      event={event}
                      isNew={newEventIds.has(event.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Past events */}
            {past.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {(t.events as any)?.pastEvents || "Past Events"}
                  </h2>
                  <span className="bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 text-xs font-black px-3 py-1 rounded-xl">
                    {past.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-85">
                  {past.map((event) => (
                    <PublicEventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="py-24 text-center">
                <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-inner">
                  <Calendar className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-xl font-black text-slate-800 dark:text-slate-200">
                  {events.length === 0
                    ? ((t.events as any)?.noEventsTitle || "No events published yet")
                    : ((t.events as any)?.noEventsMatch || "No events match your search")}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto font-medium leading-relaxed">
                  {events.length === 0
                    ? ((t.events as any)?.noEventsDesc || "Check back soon — church events will appear here in real-time as they're published.")
                    : ((t.events as any)?.noEventsMatchDesc || "Try adjusting the filters or clearing your search.")}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setCategoryFilter("ALL"); }}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-600/25 transition-all hover:scale-105 active:scale-95"
                  >
                    <X className="w-4 h-4" /> {(t.events as any)?.clearFilters || "Clear Filters"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}