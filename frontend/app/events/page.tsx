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

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  WORSHIP: { bg: "bg-violet-500/10", text: "text-violet-700 dark:text-violet-400", dot: "bg-violet-500" },
  PRAYER: { bg: "bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  YOUTH: { bg: "bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
  CHILDREN: { bg: "bg-pink-500/10", text: "text-pink-700 dark:text-pink-400", dot: "bg-pink-500" },
  WOMEN: { bg: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  MEN: { bg: "bg-sky-500/10", text: "text-sky-700 dark:text-sky-400", dot: "bg-sky-500" },
  SPECIAL: { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
};

function PublicEventCard({ event, isNew }: { event: PublicEvent; isNew?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const cat = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.SPECIAL;
  const eventDate = new Date(event.date);
  const isUpcoming = mounted && eventDate > new Date();
  const thumbnail = event.image || event.media?.[0]?.imageUrl;

  return (
    <div className={`group bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${isNew ? "border-violet-400/40 dark:border-violet-500/30 ring-2 ring-violet-500/20 animate-in slide-in-from-bottom-4 duration-500" : "border-slate-200/60 dark:border-white/[0.06] hover:border-violet-400/30 dark:hover:border-violet-500/20"}`}>
      <Navbar />
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700">
        {thumbnail ? (
          <img src={thumbnail} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-15">
            <Calendar className="w-20 h-20 text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl ${cat.bg} ${cat.text} border border-current/20 backdrop-blur-sm`}>
            {event.category}
          </span>
          {isUpcoming && (
            <span className="text-[9px] font-black px-2.5 py-1 rounded-xl bg-emerald-500/90 text-white">UPCOMING</span>
          )}
          {isNew && (
            <span className="text-[9px] font-black px-2.5 py-1 rounded-xl bg-violet-600/90 text-white animate-bounce">NEW</span>
          )}
        </div>

        {/* Date chip */}
        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-xl">
          <p className="text-[10px] font-black text-slate-800 dark:text-white" suppressHydrationWarning>
            {eventDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight line-clamp-1">{event.title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{event.description}</p>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3 text-violet-500 shrink-0" />
            <span className="font-semibold">{event.time || "TBD"}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          {event.branch && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>{event.branch.name}</span>
            </div>
          )}
        </div>

        {event._count && event._count.registrations > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-white/5">
            <p className="text-[9px] text-slate-400 font-semibold">
              {event._count.registrations} registered · {event._count.media || 0} photos
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

      setNotification({
        id: String(Date.now()),
        type: "new-event",
        title: `New Event: ${payload.title}`,
        description: `${payload.location} · ${new Date(payload.date).toLocaleDateString("en-IN")}`,
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
  }, []);

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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors">
      {/* Notification popup */}
      <NotificationPopup notification={notification} onDismiss={() => setNotification(null)} />

      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-900 pt-36 pb-16">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-1/4 w-96 h-96 rounded-full bg-violet-600/15 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="mb-6 flex justify-center">
            <BackToHome />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-violet-300 mb-4">
            <Sparkles className="w-3 h-3" />
            Kingdom of Christ Ministries
            {isSocketConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-4">
            Events &{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Gatherings
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stay connected with what's happening across all three branches — Shapur Nagar, Subhash Nagar, and Bahadurpally.
          </p>

          {liveCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full text-[10px] font-bold text-violet-300">
              <Bell className="w-3 h-3" />
              {liveCount} new event{liveCount > 1 ? "s" : ""} added live tonight
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mt-8">
            {[
              { label: "Total Events", value: events.length },
              { label: "Upcoming", value: upcoming.length },
              { label: "Branches", value: 3 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky Search + Filter Bar ────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-white/[0.06] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by name or location..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {["WORSHIP", "PRAYER", "YOUTH", "CHILDREN", "WOMEN", "MEN", "SPECIAL"].map((c) => (
              <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Events Content ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/[0.06] rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Upcoming events */}
            {upcoming.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Upcoming Events</h2>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-2.5 py-1 rounded-xl">
                    {upcoming.length} event{upcoming.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Past Events</h2>
                  <span className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 text-[10px] font-black px-2.5 py-1 rounded-xl">
                    {past.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-80">
                  {past.map((event) => (
                    <PublicEventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="py-24 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-800" />
                <p className="text-xl font-black text-slate-700 dark:text-slate-300">
                  {events.length === 0 ? "No events published yet" : "No events match your search"}
                </p>
                <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                  {events.length === 0
                    ? "Check back soon — church events will appear here in real-time as they're published."
                    : "Try adjusting the filters or clearing your search."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setCategoryFilter("ALL"); }}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-500 transition-all"
                  >
                    <X className="w-4 h-4" /> Clear Filters
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