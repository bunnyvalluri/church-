"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  Trash2,
  Trash,
  AlertTriangle,
  CheckSquare,
  Square,
  Check
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

// ── Multilingual Spotlight Content ──────────────────────────────────────────
const SPOTLIGHT_I18N = {
  en: {
    tag: "Special Revival Events",
    branch: "Subhash Nagar Branch",
    title: "Family Blessing Gathering & Prayer Festival 2026",
    desc: "Grand Family Blessing Festival with Chief Speaker Rev. Dr. B. Shekhar Daniel Garu and Host Bishop Kurra Kristhu Raju Garu. Join with your entire family and receive God's abundant blessings.",
    speakerHighlight: "Rev. Dr. B. Shekhar Daniel Garu",
    hostHighlight: "Bishop Kurra Kristhu Raju Garu",
    time: "15 August 2026, Saturday || 10:00 AM",
    venue: "Kingdom of Christ Ministries, Subhash Nagar",
    phone: "Phone: 9704090069, 7396433856, 9640943777",
    host: "Cordially Invited by: Bishop Kurra Kristhu Raju Garu",
    viewSpecial: "View Special Events",
    viewGallery: "View Gathering Gallery",
    poster1Tag: "Gathering Poster 1",
    poster2Tag: "Prayer Festival 2026",
    viewPosterBtn: "View Poster",
    deleteBtn: "Delete",
    specialEventsTag: "Special Events",
  },
  te: {
    tag: "ప్రత్యేక పునరుజ్జీవ కూడికలు",
    branch: "సుభాష్ నగర్ శాఖ",
    title: "కుటుంబ ఆశీర్వాద కూడిక & ప్రార్థన పండుగ 2026",
    desc: "ముఖ్య ప్రసంగీకులు రెవ. డా|| బి. శేఖర్ డానియెల్ గారు మరియు హోస్ట్ బిషప్ కుర్ర క్రీస్తు రాజు గారు సమక్షంలో కుటుంబ దీవెనల మహోత్సవం. తప్పకుండా కుటుంబ సమేతంగా పాల్గొని దేవుని ఆశీర్వాదాలను పొందండి.",
    speakerHighlight: "రెవ. డా|| బి. శేఖర్ డానియెల్ గారు",
    hostHighlight: "బిషప్ కుర్ర క్రీస్తు రాజు గారు",
    time: "15 ఆగస్టు 2026, శనివారం || ఉదయం 10:00 గం",
    venue: "కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్, సుభాష్ నగర్",
    phone: "ఫోన్: 9704090069, 7396433856, 9640943777",
    host: "ప్రేమతో ఆహ్వానించువారు: బిషప్ కుర్ర క్రీస్తు రాజు గారు",
    viewSpecial: "ప్రత్యేక కార్యక్రమాలు చూడండి",
    viewGallery: "కూడికల గ్యాలరీ చూడండి",
    poster1Tag: "కూడిక పోస్టర్ 1",
    poster2Tag: "ప్రార్థన పండుగ 2026",
    viewPosterBtn: "పోస్టర్ చూడండి",
    deleteBtn: "తొలగించు",
    specialEventsTag: "ప్రత్యేక కార్యక్రమాలు",
  },
  hi: {
    tag: "विशेष पुनरुद्धार कार्यक्रम",
    branch: "सुभाष नगर शाखा",
    title: "पारिवारिक आशीष सभा एवं प्रार्थना महोत्सव 2026",
    desc: "मुख्य वक्ता रेव. डॉ. बी. शेखर डैनियल जी और मेज़बान बिशप कुर्रा क्रिस्तु राजू जी की उपस्थिति में भव्य पारिवारिक आशीष महोत्सव। सपरिवार पधारें और प्रभु की आशीष प्राप्त करें।",
    speakerHighlight: "रेव. डॉ. बी. शेखर डैनियल जी",
    hostHighlight: "बिशप कुर्रा क्रिस्तु राजू जी",
    time: "15 अगस्त 2026, शनिवार || सुबह 10:00 बजे",
    venue: "किंगडम ऑफ़ क्राइस्ट मिनिस्ट्रीज, सुभाष नगर",
    phone: "फ़ोन: 9704090069, 7396433856, 9640943777",
    host: "हार्दिक निमंत्रक: बिशप कुर्रा क्रिस्तु राजू जी",
    viewSpecial: "विशेष कार्यक्रम देखें",
    viewGallery: "सभा गैलरी देखें",
    poster1Tag: "सभा पोस्टर 1",
    poster2Tag: "प्रार्थना महोत्सव 2026",
    viewPosterBtn: "पोस्टर देखें",
    deleteBtn: "हटाएं",
    specialEventsTag: "विशेष कार्यक्रम",
  },
};

const PublicEventCard = React.memo(function PublicEventCard({
  event,
  isNew,
  onOpenPreview,
  isDeleteMode,
  onDelete
}: {
  event: PublicEvent;
  isNew?: boolean;
  onOpenPreview?: (src: string) => void;
  isDeleteMode?: boolean;
  onDelete?: (id: string, title?: string) => void;
}) {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const spot = SPOTLIGHT_I18N[(language as keyof typeof SPOTLIGHT_I18N) || "en"];
  const cat = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.SPECIAL;
  const gradientClass = CATEGORY_GRADIENTS[event.category] || CATEGORY_GRADIENTS.SPECIAL;
  const eventDate = useMemo(() => new Date(event.date), [event.date]);
  const isUpcoming = mounted && eventDate > new Date();
  const thumbnail = event.image || event.media?.[0]?.imageUrl;
  const locale = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-IN";

  return (
    <div className={`group bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative ${isNew ? "border-violet-500/50 ring-2 ring-violet-500/30 animate-in slide-in-from-bottom-4 duration-500" : "border-slate-200 dark:border-white/10 hover:border-violet-500/40 dark:hover:border-violet-500/40"}`}>
      
      {/* 🔴 Direct Delete Mode Badge & Button on Card */}
      {isDeleteMode && (
        <div className="absolute top-3 right-3 z-30 animate-in zoom-in-90 duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(event.id, event.title);
            }}
            className="px-3 py-1.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/50 border border-rose-400 flex items-center gap-1.5 text-xs font-black cursor-pointer hover:scale-110 active:scale-95 transition-all"
            title="Delete this event (Ctrl+Shift+D)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{spot.deleteBtn}</span>
          </button>
        </div>
      )}

      {/* Thumbnail with Smart Poster Canvas (Full Complete Image, Never Cropped) */}
      <div className={`relative h-60 sm:h-72 overflow-hidden bg-slate-950 flex items-center justify-center`}>
        {thumbnail ? (
          <>
            {/* Ambient blurred backdrop so there are never awkward blank margins */}
            <img
              src={encodeSrc(thumbnail)}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50 scale-110 pointer-events-none select-none"
            />
            {/* Full uncropped crisp poster */}
            <img
              src={encodeSrc(thumbnail)}
              alt={event.title}
              loading="lazy"
              decoding="async"
              onClick={() => onOpenPreview?.(encodeSrc(thumbnail))}
              className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 cursor-pointer drop-shadow-lg"
            />
          </>
        ) : (
          /* Decorative placeholder — visible, branded, never pitch-black */
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
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
        {/* Softer overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
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

        {/* Date chip + View Poster Action */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between">
          <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
            <p className="text-[11px] font-black text-white" suppressHydrationWarning>
              {eventDate.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
          {thumbnail && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPreview?.(encodeSrc(thumbnail));
              }}
              className="px-2.5 py-1.5 rounded-xl bg-black/70 hover:bg-purple-600 text-white border border-white/20 transition-all shadow-sm flex items-center gap-1.5 text-[10px] font-bold cursor-pointer backdrop-blur-md"
              title="Click to view full poster"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{spot.viewPosterBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">{event.title}</h3>
        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">{event.description}</p>

        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            <span>{event.time || (language === "te" ? "సమయం నిర్ణయించబడుతుంది" : language === "hi" ? "समय घोषित होगा" : "TBD")}</span>
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
});

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

  const spot = SPOTLIGHT_I18N[(language as keyof typeof SPOTLIGHT_I18N) || "en"];

  // ── 🗑️ Shortcut & Delete Mode State (Ctrl + Shift + D) ──────────────────────
  const [isDeleteModeOpen, setIsDeleteModeOpen] = useState(false);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [deleteSearch, setDeleteSearch] = useState("");

  // ── Global Keyboard Shortcut: Ctrl + Shift + D / Cmd + Shift + D ────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore inside text inputs
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        if (!((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d")) {
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsDeleteModeOpen((prev) => !prev);
      }
      
      // Escape to close
      if (e.key === "Escape" && isDeleteModeOpen) {
        setIsDeleteModeOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleteModeOpen]);

  // ── Delete Handler Functions ───────────────────────────────────────────────
  const handleDeleteEvent = useCallback(async (id: string, title?: string) => {
    const confirmDelete = window.confirm(
      language === "te"
        ? `మీరు "${title || "ఈ ఈవెంట్"}"ని ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?`
        : language === "hi"
        ? `क्या आप वाकई "${title || "इस कार्यक्रम"}" को हटाना चाहते हैं?`
        : `Are you sure you want to delete "${title || "this event"}"?`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setSelectedDeleteIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setDeleteToast(
        language === "te"
          ? `ఈవెంట్ "${title || ""}" విజయవంతంగా తొలగించబడింది.`
          : language === "hi"
          ? `कार्यक्रम "${title || ""}" सफलतापूर्वक हटा दिया गया।`
          : `Event "${title || ""}" deleted successfully.`
      );
      setTimeout(() => setDeleteToast(null), 4000);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  }, [language]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedDeleteIds.size === 0) return;
    const count = selectedDeleteIds.size;
    const confirmDelete = window.confirm(
      language === "te"
        ? `ఎంచుకున్న ${count} ఈవెంట్లను ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?`
        : language === "hi"
        ? `क्या आप वाकई चयनित ${count} कार्यक्रमों को हटाना चाहते हैं?`
        : `Are you sure you want to delete ${count} selected events?`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    const idsToDelete = Array.from(selectedDeleteIds);
    try {
      await Promise.all(
        idsToDelete.map((id) =>
          fetch(`/api/events/${id}`, { method: "DELETE" }).catch(() => {})
        )
      );
      setEvents((prev) => prev.filter((e) => !selectedDeleteIds.has(e.id)));
      setSelectedDeleteIds(new Set());
      setDeleteToast(
        language === "te"
          ? `${count} ఈవెంట్లు విజయవంతంగా తొలగించబడ్డాయి.`
          : language === "hi"
          ? `${count} कार्यक्रम सफलतापूर्वक हटा दिए गए।`
          : `${count} events deleted successfully.`
      );
      setTimeout(() => setDeleteToast(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  }, [language, selectedDeleteIds]);

  const toggleSelectDeleteId = useCallback((id: string) => {
    setSelectedDeleteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((allIds: string[]) => {
    setSelectedDeleteIds((prev) => {
      if (prev.size === allIds.length) {
        return new Set();
      } else {
        return new Set(allIds);
      }
    });
  }, []);

  // ── Fetch events ────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const url = selectedBranchId === "all"
          ? "/api/events?status=PUBLISHED&limit=50"
          : `/api/branch/${selectedBranchId}/events`;
        const res = await fetch(url);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.success && isMounted) setEvents(data.events);
        }
      } catch { /* fail silently */ }
      finally { if (isMounted) setIsLoading(false); }
    };
    loadEvents();
    return () => { isMounted = false; };
  }, [selectedBranchId]);

  // ── Socket.io real-time updates ─────────────────────────────────────────
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3001" : "");
    if (!socketUrl) return;

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 2,
      timeout: 2500,
    });

    socket.on("connect", () => setIsSocketConnected(true));
    socket.on("disconnect", () => setIsSocketConnected(false));
    socket.on("connect_error", () => setIsSocketConnected(false));

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

    socket.on("event.deleted", (payload: any) => {
      const deletedId = typeof payload === "string" ? payload : payload?.id;
      if (deletedId) {
        setEvents((prev) => prev.filter((e) => e.id !== deletedId));
      }
    });

    socket.on("event:deleted", (payload: any) => {
      const deletedId = typeof payload === "string" ? payload : payload?.id;
      if (deletedId) {
        setEvents((prev) => prev.filter((e) => e.id !== deletedId));
      }
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

  // ── Filters & Memoized Lists ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        searchQuery === "" ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === "ALL" || e.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [events, searchQuery, categoryFilter]);

  const now = useMemo(() => new Date(), []);
  const upcoming = useMemo(() => filtered.filter((e) => new Date(e.date) > now), [filtered, now]);
  const past = useMemo(() => filtered.filter((e) => new Date(e.date) <= now), [filtered, now]);

  const specialCount = useMemo(() => events.filter((e) => e.category === "SPECIAL").length, [events]);

  // Filtered events inside delete modal
  const deleteModalEvents = useMemo(() => {
    return events.filter((e) =>
      deleteSearch === "" ||
      e.title.toLowerCase().includes(deleteSearch.toLowerCase()) ||
      e.location.toLowerCase().includes(deleteSearch.toLowerCase())
    );
  }, [events, deleteSearch]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05050a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* Notification popup */}
      <NotificationPopup notification={notification} onDismiss={() => setNotification(null)} />

      {/* 🔴 Delete Success Toast Banner */}
      {deleteToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-rose-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-rose-400">
            <Trash2 className="w-5 h-5 text-white animate-bounce" />
            <span className="text-sm font-bold">{deleteToast}</span>
            <button
              onClick={() => setDeleteToast(null)}
              className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 🗑️ Quick Event Deletion Modal (Triggered by Ctrl + Shift + D) */}
      {isDeleteModeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f1021] border border-rose-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white relative">
              <button
                onClick={() => setIsDeleteModeOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-md">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black font-serif text-white">
                      {language === "te" ? "ఈవెంట్లను తొలగించే మేనేజర్" : language === "hi" ? "कार्यक्रम हटाने का प्रबंधक" : "Quick Event Delete Manager"}
                    </h3>
                    <kbd className="px-2 py-0.5 rounded bg-white/20 border border-white/30 text-[11px] font-mono font-black text-white">
                      Ctrl+Shift+D
                    </kbd>
                  </div>
                  <p className="text-xs text-rose-100 mt-0.5">
                    {language === "te" ? "అనవసరమైన లేదా రద్దు చేయబడిన ఈవెంట్లను త్వరగా తొలగించండి." : language === "hi" ? "अनावश्यक या रद्द किए गए कार्यक्रमों को तुरंत हटाएं।" : "Selectively or bulk delete events across branches."}
                  </p>
                </div>
              </div>
            </div>

            {/* Search & Bulk Select Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={language === "te" ? "ఈవెంట్ పేరుతో శోధించండి..." : language === "hi" ? "कार्यक्रम खोजें..." : "Filter events to delete..."}
                  value={deleteSearch}
                  onChange={(e) => setDeleteSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSelectAll(deleteModalEvents.map((e) => e.id))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {selectedDeleteIds.size === deleteModalEvents.length && deleteModalEvents.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{language === "te" ? "అన్నీ ఎంచుకోండి" : language === "hi" ? "सभी चुनें" : "Select All"}</span>
                </button>

                {selectedDeleteIds.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash className="w-3.5 h-3.5" />
                    <span>{language === "te" ? `ఎంచుకున్న (${selectedDeleteIds.size}) తొలగించు` : language === "hi" ? `चयनित (${selectedDeleteIds.size}) हटाएं` : `Delete (${selectedDeleteIds.size})`}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Events List */}
            <div className="p-4 overflow-y-auto max-h-[55vh] space-y-2.5 custom-scrollbar">
              {deleteModalEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  {language === "te" ? "తొలగించడానికి ఈవెంట్లు లేవు." : language === "hi" ? "हटाने के लिए कोई कार्यक्रम नहीं मिला।" : "No events match your filter."}
                </div>
              ) : (
                deleteModalEvents.map((evt) => {
                  const isSelected = selectedDeleteIds.has(evt.id);
                  const evtDate = new Date(evt.date);
                  const thumb = evt.image || evt.media?.[0]?.imageUrl;

                  return (
                    <div
                      key={evt.id}
                      onClick={() => toggleSelectDeleteId(evt.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-rose-500/10 border-rose-500/50 shadow-sm"
                          : "bg-slate-50/80 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectDeleteId(evt.id);
                          }}
                          className="shrink-0 p-1 text-slate-400 hover:text-rose-500"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-rose-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          {thumb ? (
                            <img src={encodeSrc(thumb)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Calendar className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {evt.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-semibold">{evtDate.toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="truncate">{evt.location}</span>
                            {evt.branch && (
                              <>
                                <span>•</span>
                                <span className="text-purple-600 dark:text-purple-400 font-bold">{evt.branch.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Single Delete Action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(evt.id, evt.title);
                        }}
                        disabled={isDeleting}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white transition-all text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer border border-rose-300 dark:border-rose-700"
                        title="Delete this event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{spot.deleteBtn}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{language === "te" ? `మొత్తం ఈవెంట్లు: ${events.length}` : language === "hi" ? `कुल कार्यक्रम: ${events.length}` : `Total Events: ${events.length}`}</span>
              <button
                onClick={() => setIsDeleteModeOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold transition-colors cursor-pointer"
              >
                {language === "te" ? "మూసివేయి (Esc)" : language === "hi" ? "बंद करें (Esc)" : "Close (Esc)"}
              </button>
            </div>
          </div>
        </div>
      )}

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
          
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 dark:bg-purple-900/70 border border-purple-500/30 dark:border-purple-400/50 text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-white backdrop-blur-md shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-300 fill-amber-500/30" />
              <span className="font-extrabold tracking-wider">{t.nav?.churchName || "Kingdom of Christ"} {t.nav?.ministries || "Ministries"}</span>
              {isSocketConnected && <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse ml-1" />}
            </div>
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
              { label: spot.specialEventsTag, value: specialCount || 2 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SPECIAL EVENTS SPOTLIGHT BANNER (100% Multilingual) ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/90 via-indigo-950/95 to-slate-900/95 border border-purple-500/30 shadow-2xl backdrop-blur-xl p-6 sm:p-8 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/15 blur-[90px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            {/* Left Info Column */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {spot.tag}
                </span>
                <span className="text-xs font-bold text-purple-300 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30">
                  {spot.branch}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight font-outfit">
                {spot.title}
              </h2>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                {spot.desc}
              </p>

              {/* Event Metadata Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 border border-white/10">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold">{spot.time}</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 border border-white/10">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-bold">{spot.venue}</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 border border-white/10">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">{spot.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 border border-white/10">
                  <User className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-bold">{spot.host}</span>
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
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{spot.viewSpecial} ({specialCount || 2})</span>
                </button>
                <Link
                  href="/gallery"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-purple-300" />
                  <span>{spot.viewGallery}</span>
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
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-110 pointer-events-none select-none"
                />
                <img
                  src="/images/events/family-blessing-poster-1.jpg"
                  alt="Poster 1"
                  loading="lazy"
                  decoding="async"
                  className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-all duration-300 drop-shadow-md"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold text-white drop-shadow truncate">{spot.poster1Tag}</span>
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
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-110 pointer-events-none select-none"
                />
                <img
                  src="/images/events/family-blessing-poster-2.jpg"
                  alt="Poster 2"
                  loading="lazy"
                  decoding="async"
                  className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-all duration-300 drop-shadow-md"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold text-white drop-shadow truncate">{spot.poster2Tag}</span>
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
                placeholder={(t.events as any)?.searchPlaceholder || (language === "te" ? "పేరు లేదా స్థలం ద్వారా కార్యక్రమాలను వెతకండి..." : language === "hi" ? "नाम या स्थान से कार्यक्रम खोजें..." : "Search events by name or location...")}
                className="w-full h-10 pl-9 sm:pl-10 pr-9 sm:pr-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{(t.events as any)?.allCategories || (t.events?.categories as any)?.ALL || "All Categories"}</option>
              {["SPECIAL", "WORSHIP", "PRAYER", "YOUTH", "CHILDREN", "WOMEN", "MEN"].map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {c === "SPECIAL" ? `${(t.events?.categories as any)?.SPECIAL || "Special"} (${specialCount || 2})` : (t.events?.categories as any)?.[c] || c.charAt(0) + c.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-purple-600/30 scrollbar-track-transparent">
            {[
              { key: "ALL", label: (t.events as any)?.allCategories || (t.events?.categories as any)?.ALL || "All Events", count: events.length },
              { key: "SPECIAL", label: (t.events?.categories as any)?.SPECIAL || "Special Events", count: specialCount || 2, isSpecial: true },
              { key: "WORSHIP", label: (t.events?.categories as any)?.WORSHIP || "Worship", count: events.filter((e) => e.category === "WORSHIP").length },
              { key: "PRAYER", label: (t.events?.categories as any)?.PRAYER || "Prayer", count: events.filter((e) => e.category === "PRAYER").length },
              { key: "YOUTH", label: (t.events?.categories as any)?.YOUTH || "Youth", count: events.filter((e) => e.category === "YOUTH").length },
              { key: "CHILDREN", label: (t.events?.categories as any)?.CHILDREN || "Children", count: events.filter((e) => e.category === "CHILDREN").length },
            ].map((cat) => {
              const isActive = categoryFilter === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
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

        {/* 🔴 Delete Mode Active Notification Bar */}
        {isDeleteModeOpen && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between gap-4 text-slate-900 dark:text-white animate-in slide-in-from-top-4 duration-300 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  {language === "te" ? "ఈవెంట్ తొలగింపు మోడ్ ప్రారంభించబడింది" : language === "hi" ? "कार्यक्रम हटाने का मोड सक्रिय है" : "Delete Mode Active"}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {language === "te" ? "కార్డులపై ఉన్న ఎరుపు రంగు Delete బటన్ ద్వారా నేరుగా తొలగించండి." : language === "hi" ? "कार्ड्स पर लाल Delete बटन का उपयोग करके सीधे हटाएं।" : "Click any card's red Delete button to remove an event directly."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDeleteModeOpen(false)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              {language === "te" ? "ముగించు" : language === "hi" ? "समाप्त करें" : "Exit Mode"}
            </button>
          </div>
        )}

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
                      onOpenPreview={setPreviewPoster}
                      isDeleteMode={isDeleteModeOpen}
                      onDelete={handleDeleteEvent}
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
                    <PublicEventCard
                      key={event.id}
                      event={event}
                      onOpenPreview={setPreviewPoster}
                      isDeleteMode={isDeleteModeOpen}
                      onDelete={handleDeleteEvent}
                    />
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
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
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