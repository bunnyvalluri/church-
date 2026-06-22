"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  PlusCircle,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  Building2,
  BarChart3,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Upload,
  X,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Activity,
} from "lucide-react";
import EventCard, { EventCardData } from "@/components/EventCard";
import EventForm, { EventFormData } from "@/components/EventForm";
import UploadSection from "@/components/UploadSection";
import NotificationPopup, { NotificationData } from "@/components/NotificationPopup";
import { useAuth } from "@/components/providers/AuthProvider";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Branch {
  id: string;
  name: string;
}

type FilterStatus = "ALL" | "PUBLISHED" | "DRAFT" | "CANCELLED" | "COMPLETED";

// ── Modal types ────────────────────────────────────────────────────────────────
type ModalType = "create" | "edit" | "upload" | "delete" | null;

// ── Stats ──────────────────────────────────────────────────────────────────────
interface Stats {
  total: number;
  published: number;
  draft: number;
  upcoming: number;
}

export default function EventManagement() {
  const { user, getIdToken } = useAuth();
  const role = user?.role ?? "MEMBER";
  const canManage = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(role);
  const canDelete = ["SUPER_ADMIN", "ADMIN"].includes(role);

  // ── State ──────────────────────────────────────────────────────────────────
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventCardData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ── Socket & Notifications ─────────────────────────────────────────────────
  const socketRef = useRef<Socket | null>(null);
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [liveActivity, setLiveActivity] = useState<
    { id: string; text: string; time: string; type: string }[]
  >([
    { id: "sys-1", text: "Event management portal initialized.", time: "Just now", type: "sys" },
  ]);

  // ── Upload state ───────────────────────────────────────────────────────────
  const uploadSectionRef = useRef<{
    uploadAll: (getIdToken: () => Promise<string | null>) => void;
  } | null>(null);

  // ── Computed stats ─────────────────────────────────────────────────────────
  const stats: Stats = {
    total: events.length,
    published: events.filter((e) => e.status === "PUBLISHED").length,
    draft: events.filter((e) => e.status === "DRAFT").length,
    upcoming: events.filter((e) => new Date(e.date) > new Date() && e.status === "PUBLISHED").length,
  };

  // ── Filtered events ────────────────────────────────────────────────────────
  const filteredEvents = events.filter((e) => {
    const matchSearch =
      searchQuery === "" ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBranch = branchFilter === "ALL" || e.branch?.id === branchFilter;
    const matchStatus = statusFilter === "ALL" || e.status === statusFilter;
    const matchCat = categoryFilter === "ALL" || e.category === categoryFilter;
    return matchSearch && matchBranch && matchStatus && matchCat;
  });

  // ── Fetch events ───────────────────────────────────────────────────────────
  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getIdToken();
      const query = new URLSearchParams();
      if (statusFilter !== "ALL") query.set("status", statusFilter);
      else query.set("status", "ALL"); // admin: see all statuses

      const res = await fetch(`/api/events?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setEvents(data.events);
      }
    } catch (err) {
      console.error("[EventMgmt] Failed to load events:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getIdToken, statusFilter]);

  // ── Fetch branches ─────────────────────────────────────────────────────────
  const loadBranches = useCallback(async () => {
    try {
      const res = await fetch("/api/field-volunteer/branches");
      if (res.ok) {
        const data = await res.json();
        if (data.success) setBranches(data.branches);
      }
    } catch { /* fail silently */ }
  }, []);

  useEffect(() => {
    loadEvents();
    loadBranches();
  }, [loadEvents, loadBranches]);

  // ── Socket.io ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.on("new-event", (payload: any) => {
      setNotification({
        id: String(Date.now()),
        type: "new-event",
        title: `New Event: ${payload.title}`,
        description: `${payload.location} · ${new Date(payload.date).toLocaleDateString("en-IN")}`,
        timestamp: new Date(),
        icon: "event",
      });
      setLiveActivity((prev) => [
        {
          id: String(Date.now()),
          text: `New event "${payload.title}" published by ${payload.createdBy || "admin"}.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "event",
        },
        ...prev.slice(0, 19),
      ]);
      loadEvents();
    });

    socket.on("event-images-uploaded", (payload: any) => {
      setNotification({
        id: String(Date.now()),
        type: "event-images-uploaded",
        title: `${payload.imagesCount} Photos Uploaded`,
        description: `Event: ${payload.eventTitle} · by ${payload.uploadedBy}`,
        timestamp: new Date(),
        icon: "upload",
      });
      setLiveActivity((prev) => [
        {
          id: String(Date.now()),
          text: `${payload.imagesCount} photo(s) uploaded to "${payload.eventTitle}".`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "upload",
        },
        ...prev.slice(0, 19),
      ]);
      loadEvents();
    });

    return () => {
      socket.disconnect();
    };
  }, [loadEvents]);

  // ── Create event ───────────────────────────────────────────────────────────
  const handleCreateEvent = async (data: EventFormData) => {
    const token = await getIdToken();
    const res = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create event.");
    }
    await loadEvents();
    setModal(null);
  };

  // ── Update event ───────────────────────────────────────────────────────────
  const handleUpdateEvent = async (data: EventFormData) => {
    if (!selectedEvent) return;
    const token = await getIdToken();
    const res = await fetch(`/api/events/${selectedEvent.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update event.");
    }
    await loadEvents();
    setModal(null);
    setSelectedEvent(null);
  };

  // ── Delete event ───────────────────────────────────────────────────────────
  const handleDeleteEvent = async (id: string) => {
    setActionLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        setDeleteConfirmId(null);
        setModal(null);
      }
    } catch (err) {
      console.error("[EventMgmt] Delete error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Upload images ──────────────────────────────────────────────────────────
  const handleUploadImages = async (eventId: string) => {
    setSelectedEvent(events.find((e) => e.id === eventId) || null);
    setModal("upload");
  };

  // ── Upload trigger (wired from UploadSection custom event) ─────────────────
  useEffect(() => {
    const handler = async (e: any) => {
      if (e.detail?.eventId && modal === "upload") {
        const uploadSection = document.querySelector<any>("[data-upload-section]");
        // We trigger by calling the API directly from here with auth
        const files = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
        // The UploadSection handles this via its own uploadAll function
      }
    };
    document.addEventListener("upload-request", handler);
    return () => document.removeEventListener("upload-request", handler);
  }, [modal]);

  const handleUploadComplete = (count: number) => {
    setLiveActivity((prev) => [
      {
        id: String(Date.now()),
        text: `${count} photo(s) uploaded to "${selectedEvent?.title}".`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "upload",
      },
      ...prev,
    ]);
    loadEvents();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Notification popup */}
      <NotificationPopup
        notification={notification}
        onDismiss={() => setNotification(null)}
      />

      {/* Modal Overlays */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(9,10,26,0.65)", backdropFilter: "blur(12px)" }}>
          <div className="bg-white dark:bg-[#0f1021] border border-slate-200/50 dark:border-white/[0.06] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-[#0f1021] border-b border-slate-100 dark:border-white/5 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-2 rounded-xl">
                  {modal === "create" ? (
                    <PlusCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Edit3 className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {modal === "create" ? "Create New Event" : "Edit Event"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {modal === "create"
                      ? "Fill in the details — it'll publish immediately if set to Published"
                      : `Editing: ${selectedEvent?.title}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setModal(null); setSelectedEvent(null); }}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <EventForm
                branches={branches}
                initialData={modal === "edit" && selectedEvent ? {
                  title: selectedEvent.title,
                  description: selectedEvent.description,
                  date: new Date(selectedEvent.date).toISOString().split("T")[0],
                  time: selectedEvent.time,
                  location: selectedEvent.location,
                  category: selectedEvent.category as any,
                  branchId: selectedEvent.branch?.id,
                  status: selectedEvent.status as any,
                  image: selectedEvent.image || "",
                } : undefined}
                isEditMode={modal === "edit"}
                onSubmit={modal === "create" ? handleCreateEvent : handleUpdateEvent}
                onCancel={() => { setModal(null); setSelectedEvent(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {modal === "upload" && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(9,10,26,0.65)", backdropFilter: "blur(12px)" }}>
          <div className="bg-white dark:bg-[#0f1021] border border-slate-200/50 dark:border-white/[0.06] rounded-3xl shadow-2xl w-full max-w-md">
            <div className="border-b border-slate-100 dark:border-white/5 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl">
                  <Upload className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Upload Photos</h3>
                  <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{selectedEvent.title}</p>
                </div>
              </div>
              <button
                onClick={() => { setModal(null); setSelectedEvent(null); }}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <UploadSectionWithAuth
                eventId={selectedEvent.id}
                getIdToken={getIdToken}
                onUploadComplete={(count) => {
                  handleUploadComplete(count);
                  setModal(null);
                }}
                onClose={() => { setModal(null); setSelectedEvent(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(9,10,26,0.65)", backdropFilter: "blur(12px)" }}>
          <div className="bg-white dark:bg-[#0f1021] border border-slate-200/50 dark:border-white/[0.06] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Delete Event?</h3>
                <p className="text-[10px] text-slate-400">This will permanently delete the event and all uploaded photos.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 h-11 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(deleteConfirmId)}
                disabled={actionLoading}
                className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-sm font-bold hover:from-rose-500 hover:to-red-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left: Main area (3 cols) */}
        <div className="lg:col-span-3 space-y-6">

          {/* Welcome hero */}
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg group">
            <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Sparkles className="w-36 h-36" />
            </div>

            <div className="relative space-y-2 max-w-xl">
              <span className="inline-flex px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[9px] font-black uppercase tracking-widest text-violet-100">
                Event Management
              </span>
              <h2 className="text-2xl font-black tracking-tight mt-1">
                {stats.upcoming > 0
                  ? `${stats.upcoming} Upcoming Event${stats.upcoming > 1 ? "s" : ""} 🎉`
                  : "Manage Church Events"}
              </h2>
              <p className="text-xs text-violet-100/80 leading-relaxed">
                Create events for all branches — Shapur Nagar, Subhash Nagar, Bahadurpally. Upload photos and they instantly appear on the landing page via real-time sync.
              </p>
            </div>

            {canManage && (
              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => setModal("create")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-violet-700 hover:bg-violet-50 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create New Event
                </button>
                <button
                  onClick={() => loadEvents()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Events", value: stats.total, color: "text-slate-900 dark:text-white", dot: "bg-slate-400" },
              { label: "Published", value: stats.published, color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
              { label: "Drafts", value: stats.draft, color: "text-slate-500 dark:text-slate-400", dot: "bg-slate-400" },
              { label: "Upcoming", value: stats.upcoming, color: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</span>
                </div>
                <p className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events by title or location..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>

              {/* Branch filter */}
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none"
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {["WORSHIP", "PRAYER", "YOUTH", "CHILDREN", "WOMEN", "MEN", "SPECIAL"].map((c) => (
                  <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                ))}
              </select>

              {canManage && (
                <button
                  onClick={() => setModal("create")}
                  className="h-10 flex items-center gap-1.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:from-violet-500 hover:to-indigo-500 shadow-md transition-all shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  New Event
                </button>
              )}
            </div>

            {(searchQuery || branchFilter !== "ALL" || statusFilter !== "ALL" || categoryFilter !== "ALL") && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold">
                  Showing {filteredEvents.length} of {events.length} events
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setBranchFilter("ALL");
                    setStatusFilter("ALL");
                    setCategoryFilter("ALL");
                  }}
                  className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Events grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.05] rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.05] rounded-3xl shadow-sm">
              <Calendar className="w-14 h-14 mx-auto mb-4 text-slate-200 dark:text-slate-800" />
              <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                {events.length === 0 ? "No events yet" : "No events match your filters"}
              </p>
              <p className="text-xs mt-1.5 text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                {canManage && events.length === 0
                  ? 'Click "Create New Event" to publish your first event.'
                  : "Try adjusting the filters above."}
              </p>
              {canManage && events.length === 0 && (
                <button
                  onClick={() => setModal("create")}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create First Event
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isAdmin={canManage}
                  onDelete={canDelete ? (id) => setDeleteConfirmId(id) : undefined}
                  onEdit={(ev) => { setSelectedEvent(ev); setModal("edit"); }}
                  onUploadImages={canManage ? handleUploadImages : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar: Live Activity feed (1 col) */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
              <Activity className="w-4 h-4 text-violet-500" />
              <div className="flex-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Live Activity
                </h3>
                <p className="text-[9px] text-slate-400 font-semibold">Real-time event feed</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {liveActivity.map((act) => (
                <div
                  key={act.id}
                  className="text-xs space-y-0.5 border-l-2 border-slate-200 dark:border-white/10 pl-3.5 relative"
                >
                  <div
                    className={`absolute w-2 h-2 rounded-full -left-[5px] top-[5px] border-2 border-white dark:border-slate-900 ${
                      act.type === "upload"
                        ? "bg-emerald-500"
                        : act.type === "event"
                        ? "bg-violet-500"
                        : "bg-slate-400"
                    }`}
                  />
                  <p className="font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                    {act.text}
                  </p>
                  <span className="text-[9px] text-slate-400 font-bold">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick create shortcut */}
          {canManage && (
            <div className="bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 dark:border-violet-500/10 rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-violet-700 dark:text-violet-400">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setModal("create")}
                  className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-violet-400 dark:hover:border-violet-600/30 hover:shadow-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-violet-500" />
                  Create New Event
                </button>
                <button
                  onClick={() => loadEvents()}
                  className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600/30 hover:shadow-sm transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-500" />
                  Refresh Events
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Internal: UploadSection wired with auth ────────────────────────────────────
function UploadSectionWithAuth({
  eventId,
  getIdToken,
  onUploadComplete,
  onClose,
}: {
  eventId: string;
  getIdToken: () => Promise<string | null>;
  onUploadComplete: (count: number) => void;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MAX = 5 * 1024 * 1024;

  const addFiles = (rawFiles: FileList | File[]) => {
    const incoming = Array.from(rawFiles);
    const valid: File[] = [];
    const errors: string[] = [];

    incoming.forEach((f) => {
      if (!ALLOWED.includes(f.type)) errors.push(`${f.name}: Invalid type. Use JPEG/PNG/WebP.`);
      else if (f.size > MAX) errors.push(`${f.name}: Too large (max 5MB).`);
      else valid.push(f);
    });

    setFileErrors(errors);
    setFiles((prev) => [...prev, ...valid].slice(0, 10));
    setPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))].slice(0, 10));
  };

  const doUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    const token = await getIdToken();
    const fd = new FormData();
    files.forEach((f) => fd.append("images[]", f));

    try {
      const res = await fetch(`/api/events/${eventId}/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({ success: data.uploaded, failed: data.failed || 0 });
        onUploadComplete(data.uploaded);
      } else {
        setResult({ success: 0, failed: files.length });
      }
    } catch {
      setResult({ success: 0, failed: files.length });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed cursor-pointer p-8 text-center transition-all ${
          isDragging ? "border-violet-500 bg-violet-500/5" : "border-slate-300 dark:border-white/10 hover:border-violet-400 bg-slate-50/50 dark:bg-white/[0.02]"
        }`}
      >
        <input ref={fileRef} type="file" multiple accept={ALLOWED.join(",")} className="hidden" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
        <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${isDragging ? "text-violet-500" : "text-slate-300 dark:text-slate-600"}`} />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {isDragging ? "Drop here!" : "Drag & drop or click to browse"}
        </p>
        <p className="text-[11px] text-slate-400 mt-1">JPEG · PNG · WebP · Max 5MB · Up to 10 images</p>
      </div>

      {/* Validation errors */}
      {fileErrors.map((err, i) => (
        <p key={i} className="text-[10px] text-rose-500 font-semibold flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 shrink-0" /> {err}
        </p>
      ))}

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((src, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/10 group">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((_, i) => i !== idx)); setPreviews((p) => p.filter((_, i) => i !== idx)); }}
                className="absolute top-1 right-1 p-0.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold ${result.failed === 0 ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30" : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30"}`}>
          {result.failed === 0 ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {result.success > 0 ? `✅ ${result.success} image(s) uploaded!` : ""}{result.failed > 0 ? ` ⚠️ ${result.failed} failed.` : ""}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="flex-1 h-11 rounded-2xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
          Cancel
        </button>
        <button
          onClick={doUpload}
          disabled={files.length === 0 || isUploading}
          className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload {files.length > 0 ? `${files.length} Photo${files.length > 1 ? "s" : ""}` : "Photos"}</>}
        </button>
      </div>
    </div>
  );
}
