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
  Flame,
  Maximize2,
  Phone,
  User,
  Share2,
} from "lucide-react";
import Image from "next/image";
import NotificationPopup, { NotificationData } from "@/components/NotificationPopup";
import { useBranch } from "@/components/providers/BranchProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";

// Helper to encode safe URLs
function encodeSrc(src: string | null | undefined): string {
  if (!src) return "";
  let clean = src.trim();
  if (clean.startsWith("https%3A") || clean.startsWith("http%3A")) {
    try {
      clean = decodeURIComponent(clean);
    } catch {}
  }
  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("//") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }
  if (!clean.startsWith("/")) {
    clean = "/" + clean;
  }
  try {
    const [path, ...queryAndHash] = clean.split(/(?=[?#])/);
    const encodedPath = path
      .split("/")
      .map((segment) => {
        try {
          return encodeURIComponent(decodeURIComponent(segment));
        } catch {
          return encodeURIComponent(segment);
        }
      })
      .join("/");
    return [encodedPath, ...queryAndHash].join("");
  } catch {
    return clean;
  }
}

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

// Per-category gradient palettes for placeholder backgrounds
const CATEGORY_GRADIENTS: Record<string, string> = {
  WORSHIP:  "from-violet-600 via-purple-600 to-indigo-700",
  PRAYER:   "from-blue-600 via-indigo-600 to-violet-700",
  YOUTH:    "from-amber-500 via-orange-500 to-rose-600",
  CHILDREN: "from-pink-500 via-rose-500 to-fuchsia-600",
  WOMEN:    "from-rose-500 via-pink-500 to-purple-600",
  MEN:      "from-sky-500 via-blue-600 to-indigo-700",
  SPECIAL:  "from-indigo-600 via-violet-600 to-purple-700",
  FELLOWSHIP: "from-emerald-500 via-teal-500 to-cyan-600",
  OUTREACH: "from-orange-500 via-amber-500 to-yellow-500",
};

function PublicEventCard({ event, isNew }: { event: PublicEvent; isNew?: boolean }) {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const cat = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.SPECIAL;
  const gradientClass = CATEGORY_GRADIENTS[event.category] || CATEGORY_GRADIENTS.SPECIAL;
  const eventDate = new Date(event.date);
  const isUpcoming = mounted && eventDate > new Date();
  const thumbnail = event.image || event.media?.[0]?.imageUrl;
  const locale = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-IN";

  return (
    <div className={`group bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${isNew ? "border-violet-500/50 ring-2 ring-violet-500/30 animate-in slide-in-from-bottom-4 duration-500" : "border-slate-200 dark:border-white/10 hover:border-violet-500/40 dark:hover:border-violet-500/40"}`}>
      {/* Thumbnail */}
      <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${gradientClass}`}>
        {thumbnail ? (
          <img src={encodeSrc(thumbnail)} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          /* Decorative placeholder — visible, branded, never pitch-black */
          <div className="absolute inset-0">
            {/* Soft radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
            {/* Large faint icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="w-16 h-16 text-white/30" />
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-black/10" />
          </div>
        )}
        {/* Softer overlay — lets gradient breathe */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

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
        <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">{event.title}</h3>
        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">{event.description}</p>

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
  const [previewPoster, setPreviewPoster] = useState<string | null>(null);

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

  const specialCount = events.filter((e) => e.category === "SPECIAL").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05050a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* Notification popup */}
      <NotificationPopup notification={notification} onDismiss={() => setNotification(null)} />

      {/* Poster Zoom Modal */}
      {previewPoster && (
        <div
          onClick={() => setPreviewPoster(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer select-none"
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <button
              onClick={() => setPreviewPoster(null)}
              className="absolute -top-12 right-0 sm:right-2 p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewPoster}
              alt="Special Event Poster"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}

      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-50/80 via-slate-50 to-slate-50 dark:from-purple-950/40 dark:via-slate-950 dark:to-slate-950 text-slate-900 dark:text-white pt-36 pb-20 md:pt-40 md:pb-24 border-b border-slate-200/80 dark:border-white/5 transition-colors duration-300">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-1/4 w-96 h-96 rounded-full bg-violet-500/10 dark:bg-violet-600/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 dark:opacity-10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <div className="mb-6 flex justify-center">
            <BackToHome />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 dark:bg-purple-900/70 border border-purple-500/30 dark:border-purple-400/50 text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-white mb-6 backdrop-blur-md shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-300 fill-amber-500/30" />
            <span className="font-extrabold tracking-wider">{t.nav?.churchName || "Kingdom of Christ"} {t.nav?.ministries || "Ministries"}</span>
            {isSocketConnected && <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse ml-1" />}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-4 font-outfit">
            {(t.events as any)?.pageTitle1 || "Events &"}{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 dark:from-violet-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
              {(t.events as any)?.pageTitle2 || "Gatherings"}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            {(t.events as any)?.pageSubtitle || "Stay connected with what's happening across all three branches — Shapur Nagar, Subhash Nagar, and Bahadurpally."}
          </p>

          {liveCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-violet-900/60 border border-purple-300 dark:border-violet-400/40 rounded-full text-xs font-extrabold text-purple-900 dark:text-white shadow-sm backdrop-blur-md">
              <Bell className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
              {liveCount} {(t.events as any)?.liveAdded || "new event(s) added live tonight"}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-md mx-auto mt-10 p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-lg dark:shadow-xl">
            {[
              { label: (t.events as any)?.totalEvents || "Total Events", value: events.length },
              { label: (t.events as any)?.upcoming || "Upcoming", value: upcoming.length },
              { label: "Special Events", value: specialCount || 2 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SPECIAL EVENTS SPOTLIGHT BANNER ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/90 via-indigo-950/95 to-slate-900/95 border border-purple-500/30 shadow-2xl backdrop-blur-xl p-6 sm:p-8 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/15 blur-[90px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            {/* Left Info Column */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Special Revival Events
                </span>
                <span className="text-xs font-bold text-purple-300 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30">
                  Subhash Nagar Branch
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight font-outfit">
                కుటుంబ ఆశీర్వాద కూడిక & ప్రార్థన పండుగ 2026
              </h2>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                ముఖ్య ప్రసంగీకులు <strong className="text-amber-300">రెవ. డా|| బి. శేఖర్ డానియెల్ గారు</strong> మరియు హోస్ట్ <strong className="text-purple-300">బిషప్ కుర్ర క్రీస్తు రాజు గారు</strong> సమక్షంలో కుటుంబ దీవెనల మహోత్సవం. తప్పకుండా కుటుంబ సమేతంగా పాల్గొని దేవుని ఆశీర్వాదాలను పొందండి.
              </p>

              {/* Event Metadata Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 border border-white/10">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold">15 ఆగస్టు 2026, శనివారం || ఉదయం 10:00 గం</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 border border-white/10">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-bold">కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్, సుభాష్ నగర్</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 border border-white/10">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">ఫోన్: 9704090069, 7396433856, 9640943777</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 border border-white/10">
                  <User className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-bold">ప్రేమతో ఆహ్వానించువారు: బిషప్ కుర్ర క్రీస్తు రాజు గారు</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setCategoryFilter("SPECIAL");
                    const el = document.getElementById("events-grid-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View Special Events ({specialCount || 2})</span>
                </button>
                <Link
                  href="/gallery"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-purple-300" />
                  <span>View Gathering Gallery</span>
                </Link>
              </div>
            </div>

            {/* Right Poster Images Showcase */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0 max-w-sm">
              {/* Poster 1 */}
              <div
                onClick={() => setPreviewPoster("/images/events/family-blessing-poster-1.jpg")}
                className="group relative h-56 rounded-2xl overflow-hidden border border-purple-400/30 shadow-xl cursor-pointer hover:border-amber-400 transition-all duration-300 hover:scale-[1.03] bg-slate-950 flex items-center justify-center"
              >
                <img
                  src="/images/events/family-blessing-poster-1.jpg"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-110 pointer-events-none select-none"
                />
                <img
                  src="/images/events/family-blessing-poster-1.jpg"
                  alt="కుటుంబ ఆశీర్వాద కూడిక Poster 1"
                  className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-all duration-300 drop-shadow-md"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold text-white drop-shadow truncate">కూడిక పోస్టర్ 1</span>
                    <Maximize2 className="w-3.5 h-3.5 text-amber-300 opacity-80 group-hover:opacity-100" />
                  </div>
                </div>
              </div>

              {/* Poster 2 */}
              <div
                onClick={() => setPreviewPoster("/images/events/family-blessing-poster-2.jpg")}
                className="group relative h-56 rounded-2xl overflow-hidden border border-purple-400/30 shadow-xl cursor-pointer hover:border-amber-400 transition-all duration-300 hover:scale-[1.03] bg-slate-950 flex items-center justify-center"
              >
                <img
                  src="/images/events/family-blessing-poster-2.jpg"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-110 pointer-events-none select-none"
                />
                <img
                  src="/images/events/family-blessing-poster-2.jpg"
                  alt="కుటుంబ ఆశీర్వాద ప్రార్థన పండుగ Poster 2"
                  className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-all duration-300 drop-shadow-md"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold text-white drop-shadow truncate">ప్రార్థన పండుగ 2026</span>
                    <Maximize2 className="w-3.5 h-3.5 text-amber-300 opacity-80 group-hover:opacity-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky Search + Filter Bar ────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#080811]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-md transition-colors duration-300 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full h-10 pl-9 sm:pl-10 pr-9 sm:pr-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
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
              {["SPECIAL", "WORSHIP", "PRAYER", "YOUTH", "CHILDREN", "WOMEN", "MEN"].map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {c === "SPECIAL" ? `Special Events (${specialCount || 2})` : (t.events?.categories as any)?.[c] || c.charAt(0) + c.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-purple-600/30 scrollbar-track-transparent">
            {[
              { key: "ALL", label: "All Events", count: events.length },
              { key: "SPECIAL", label: "Special Events", count: specialCount || 2, isSpecial: true },
              { key: "WORSHIP", label: "Worship", count: events.filter((e) => e.category === "WORSHIP").length },
              { key: "PRAYER", label: "Prayer", count: events.filter((e) => e.category === "PRAYER").length },
              { key: "YOUTH", label: "Youth", count: events.filter((e) => e.category === "YOUTH").length },
              { key: "CHILDREN", label: "Children", count: events.filter((e) => e.category === "CHILDREN").length },
            ].map((cat) => {
              const isActive = categoryFilter === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-purple-600 text-white border-purple-500 shadow-md"
                      : cat.isSpecial
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                      : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  {cat.isSpecial && <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />}
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Events Content ────────────────────────────────────────────────────── */}
      <div id="events-grid-section" className="max-w-7xl mx-auto px-6 py-12 space-y-12">

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