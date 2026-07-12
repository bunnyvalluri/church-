"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
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
  Loader2,
  Upload,
  X,
  Sparkles,
  AlertCircle,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Activity,
  Copy,
  Archive,
  RotateCcw,
  UserCheck,
  FileCheck,
  ChevronUp,
  ChevronDown,
  User,
  Phone,
  Mail,
  QrCode,
  DollarSign,
  PenTool,
} from "lucide-react";
import EventCard from "@/components/EventCard";
import EventForm, { EventFormData } from "@/components/EventForm";
import NotificationPopup, { NotificationData } from "@/components/NotificationPopup";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useRestoreEvent,
  useDuplicateEvent,
  useReorderEvents,
  useCheckInAttendee,
  useSubmitEventReport,
  useUpdateEventStatus,
} from "@/hooks/useEvents";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Branch {
  id: string;
  name: string;
}

type TabType = "list" | "reorder" | "checkin" | "reports" | "trash";

const CATEGORIES = [
  { value: "service", label: "Service", emoji: "⛪" },
  { value: "conference", label: "Conference", emoji: "🎤" },
  { value: "youth", label: "Youth", emoji: "⚡" },
  { value: "prayer", label: "Prayer", emoji: "🙏" },
  { value: "womens-fellowship", label: "Women's Fellowship", emoji: "🌸" },
  { value: "mens-fellowship", label: "Men's Fellowship", emoji: "💪" },
  { value: "children", label: "Children", emoji: "🌟" },
  { value: "bible-study", label: "Bible Study", emoji: "📖" },
  { value: "outreach", label: "Outreach", emoji: "❤️" },
  { value: "ngo", label: "NGO", emoji: "🤝" },
  { value: "camp", label: "Camp", emoji: "⛺" },
  { value: "special-meeting", label: "Special Meeting", emoji: "✨" },
];

export default function EventManagement() {
  const { user, getIdToken } = useAuth();
  const role = user?.role ?? "MEMBER";
  const canManage = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(role);
  const canDelete = ["SUPER_ADMIN", "ADMIN"].includes(role);

  // ── States ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  // Modals
  const [modal, setModal] = useState<"create" | "edit" | "upload" | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Check-In Form
  const [checkinEventId, setCheckinEventId] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const [checkinMessage, setCheckinMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Completion Report Form
  const [reportEventId, setReportEventId] = useState("");
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [offeringAmount, setOfferingAmount] = useState(0);
  const [visitorsCount, setVisitorsCount] = useState(0);
  const [newMembersCount, setNewMembersCount] = useState(0);
  const [prayerRequestsCount, setPrayerRequestsCount] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [comments, setComments] = useState("");
  const [summary, setSummary] = useState("");
  const [reportMessage, setReportMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Branches
  const [branches, setBranches] = useState<Branch[]>([]);

  // Socket Feed
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [liveActivity, setLiveActivity] = useState<
    { id: string; text: string; time: string; type: string }[]
  >([
    { id: "sys-1", text: "Event management portal initialized.", time: "Just now", type: "sys" },
  ]);

  // ── React Query Queries & Mutations ───────────────────────────────────────
  const { data: eventsData, isLoading, refetch } = useEvents({
    branchId: branchFilter,
    category: categoryFilter,
    status: statusFilter,
    search: searchQuery,
    cursor,
    limit: 25,
  });

  // Query to get all events for reordering (draft + published, non-deleted)
  const { data: allEventsData } = useEvents({
    status: "ALL",
    limit: 100,
  });

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  const restoreMutation = useRestoreEvent();
  const duplicateMutation = useDuplicateEvent();
  const reorderMutation = useReorderEvents();
  const checkinMutation = useCheckInAttendee();
  const reportMutation = useSubmitEventReport();
  const statusMutation = useUpdateEventStatus();

  const events = eventsData?.events || [];
  const nextCursor = eventsData?.nextCursor;

  // Compute metrics
  const stats = {
    total: allEventsData?.events?.length || 0,
    published: allEventsData?.events?.filter((e: any) => e.status === "PUBLISHED").length || 0,
    drafts: allEventsData?.events?.filter((e: any) => e.status === "DRAFT").length || 0,
    upcoming: allEventsData?.events?.filter((e: any) => new Date(e.date) > new Date() && e.status === "PUBLISHED").length || 0,
  };

  // Fetch branches
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await fetch("/api/field-volunteer/branches");
        if (res.ok) {
          const data = await res.json();
          if (data.success) setBranches(data.branches);
        }
      } catch { /* fail silently */ }
    };
    loadBranches();
  }, []);

  // ── Socket.io Listeners ────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("event.created", (payload: any) => {
      setNotification({
        id: String(Date.now()),
        type: "new-event",
        title: `New Event Published`,
        description: `"${payload.title}" is scheduled at ${payload.location}.`,
        timestamp: new Date(),
        icon: "event",
      });
      setLiveActivity((prev) => [
        {
          id: String(Date.now()),
          text: `New event "${payload.title}" created.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "event",
        },
        ...prev.slice(0, 19),
      ]);
      refetch();
    });

    socket.on("event.updated", (payload: any) => {
      setLiveActivity((prev) => [
        {
          id: String(Date.now()),
          text: `Event "${payload.title}" updated (Status: ${payload.status}).`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "event",
        },
        ...prev.slice(0, 19),
      ]);
      refetch();
    });

    socket.on("event.registration.created", (payload: any) => {
      setLiveActivity((prev) => [
        {
          id: String(Date.now()),
          text: `Member "${payload.name}" registered for ticket (${payload.status}).`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "event",
        },
        ...prev.slice(0, 19),
      ]);
      refetch();
    });

    socket.on("event.attendance.checkin", (payload: any) => {
      setLiveActivity((prev) => [
        {
          id: String(Date.now()),
          text: `Attendee "${payload.name}" checked in successfully.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "upload",
        },
        ...prev.slice(0, 19),
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [refetch]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreate = async (data: EventFormData) => {
    await createMutation.mutateAsync(data);
    setModal(null);
  };

  const handleUpdate = async (data: EventFormData) => {
    if (!selectedEvent) return;
    await updateMutation.mutateAsync({ id: selectedEvent.id, data });
    setModal(null);
    setSelectedEvent(null);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeleteConfirmId(null);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateMutation.mutateAsync(id);
    setActiveTab("list");
  };

  const handleRestore = async (id: string) => {
    await restoreMutation.mutateAsync(id);
    refetch();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await statusMutation.mutateAsync({ id, status });
  };

  // UP/DOWN Reordering panel
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const list = [...(allEventsData?.events || [])];
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === list.length - 1) return;

    const swapTarget = direction === "up" ? index - 1 : index + 1;
    const temp = list[index];
    list[index] = list[swapTarget];
    list[swapTarget] = temp;

    const ids = list.map((e: any) => e.id);
    await reorderMutation.mutateAsync(ids);
  };

  // QR check-in
  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckinMessage(null);
    try {
      const res = await checkinMutation.mutateAsync({
        eventId: checkinEventId,
        ticketCode,
      });
      setCheckinMessage({
        text: `Checked in successfully: ${res.registration?.name}! Ticket status: ${res.registration?.status}`,
        type: "success",
      });
      setTicketCode("");
    } catch (err: any) {
      setCheckinMessage({ text: err.message || "Failed to check in.", type: "error" });
    }
  };

  // Submit Post-Event Completion Report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportMessage(null);
    try {
      await reportMutation.mutateAsync({
        eventId: reportEventId,
        data: {
          attendanceCount,
          offeringAmount,
          visitorsCount,
          newMembersCount,
          prayerRequestsCount,
          expenses,
          comments,
          summary,
        },
      });
      setReportMessage({
        text: "Post-event report submitted successfully! Event status set to COMPLETED.",
        type: "success",
      });
      // Reset form
      setAttendanceCount(0);
      setOfferingAmount(0);
      setVisitorsCount(0);
      setNewMembersCount(0);
      setPrayerRequestsCount(0);
      setExpenses(0);
      setComments("");
      setSummary("");
    } catch (err: any) {
      setReportMessage({ text: err.message || "Failed to submit report.", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <NotificationPopup notification={notification} onDismiss={() => setNotification(null)} />

      {/* ── Welcome Banner ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-955 rounded-3xl p-6 text-white border border-white/[0.08] shadow-xl group">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
          <Sparkles className="w-36 h-36" />
        </div>

        <div className="relative space-y-2 max-w-xl">
          <span className="inline-flex px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-200">
            Principal Admin Portal
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-1">
            Event Management Suite
          </h2>
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            Fully dynamic CRUD, reordering, QR check-ins, and post-event reports synced instantly via Socket.IO to the public homepage.
          </p>
        </div>

        {canManage && (
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => setModal("create")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-950 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              Create Event
            </button>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/5 rounded-xl text-xs font-bold transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Sync API
            </button>
          </div>
        )}
      </div>

      {/* ── Stats Panels ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active & Draft", value: stats.total, color: "text-slate-900 dark:text-white", dot: "bg-slate-400" },
          { label: "Published Live", value: stats.published, color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
          { label: "Drafts Queue", value: stats.drafts, color: "text-amber-500 dark:text-amber-400", dot: "bg-amber-400" },
          { label: "Future Live", value: stats.upcoming, color: "text-indigo-600 dark:text-indigo-400", dot: "bg-indigo-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabbed View Selection ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-1">
        {[
          { id: "list", label: "Events Catalog", icon: Calendar },
          { id: "reorder", label: "Custom Layout Order", icon: ChevronUp },
          { id: "checkin", label: "Attendee Check-in", icon: UserCheck },
          { id: "reports", label: "Completion Reports", icon: FileCheck },
          { id: "trash", label: "Trash & Archive", icon: Trash2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 -mb-[2px] ${
                isActive
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Content Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Work Area (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">

          {/* TAB 1: Catalog List */}
          {activeTab === "list" && (
            <div className="space-y-6">
              {/* Filter controls */}
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCursor(undefined); }}
                    placeholder="Search title, pastor, speaker or branch..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCursor(undefined); }}
                  className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>

                <select
                  value={branchFilter}
                  onChange={(e) => { setBranchFilter(e.target.value); setCursor(undefined); }}
                  className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCursor(undefined); }}
                  className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>

              {/* Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-72 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="py-20 text-center bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/[0.05] rounded-3xl">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No events found</h4>
                  <p className="text-xs text-slate-400 mt-1">Try relaxing filters or search terms.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {events.map((event: any) => (
                    <div key={event.id} className="relative group bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        {/* Status Label */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            event.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-500" :
                            event.status === "DRAFT" ? "bg-amber-500/10 text-amber-500" :
                            "bg-slate-500/10 text-slate-500"
                          }`}>
                            {event.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{event.branch?.name || "General"}</span>
                        </div>
                        {event.image && (
                          <img src={event.image} alt={event.title} className="h-32 w-full object-cover rounded-2xl mb-3 border border-slate-100 dark:border-white/5" />
                        )}
                        <h3 className="text-sm font-black text-slate-800 dark:text-white line-clamp-1">{event.title}</h3>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{event.shortDescription || event.description}</p>

                        <div className="text-[11px] text-slate-500 space-y-1 mt-3">
                          <p>📅 {new Date(event.date).toLocaleDateString("en-IN")} at {event.time}</p>
                          <p>📍 {event.location}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                        <button
                          onClick={() => { setSelectedEvent(event); setModal("edit"); }}
                          className="flex-1 h-8 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 hover:bg-slate-100 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDuplicate(event.id)}
                          className="flex-1 h-8 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 hover:bg-slate-100 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" /> Clone
                        </button>
                        <button
                          onClick={() => handleStatusChange(event.id, event.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}
                          className="flex-1 h-8 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black flex items-center justify-center gap-1 transition-all"
                        >
                          {event.status === "PUBLISHED" ? <Archive className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          {event.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(event.id)}
                          className="h-8 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold flex items-center justify-center transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cursor Pagination triggers */}
              {nextCursor && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setCursor(nextCursor)}
                    className="h-10 px-5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                  >
                    Load More Events
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Custom Layout Reordering */}
          {activeTab === "reorder" && (
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ChevronUp className="w-4 h-4 text-indigo-500" /> Landing Page Presentation Order
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Use Up and Down controls to sequence events. The order maps to display priority on the landing page.</p>
              </div>

              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {(allEventsData?.events || []).map((e: any, index: number) => (
                  <div key={e.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-black text-slate-400">#{index + 1}</span>
                      {e.image && <img src={e.image} className="w-10 h-10 object-cover rounded-lg" />}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-none">{e.title}</h4>
                        <p className="text-[9px] text-slate-400 mt-1">📅 {new Date(e.date).toLocaleDateString("en-IN")} · {e.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleMoveOrder(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, "down")}
                        disabled={index === (allEventsData?.events || []).length - 1}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Attendee Check-In */}
          {activeTab === "checkin" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scan input */}
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-indigo-500" /> Scanning & Check-in Panel
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Simulate ticket scanning by entering a Registration ID or Code (e.g. `KCM-TICKET-[id]`).</p>
                </div>

                <form onSubmit={handleCheckin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Select Event *</label>
                    <select
                      value={checkinEventId}
                      onChange={(e) => setCheckinEventId(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="">-- Choose Event --</option>
                      {(allEventsData?.events || []).filter((e: any) => e.status === "PUBLISHED").map((e: any) => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Ticket QR Data or Registration ID *</label>
                    <input
                      value={ticketCode}
                      onChange={(e) => setTicketCode(e.target.value)}
                      placeholder="e.g. clrgwq... or KCM-TICKET-clrg..."
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  {checkinMessage && (
                    <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                      checkinMessage.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50"
                        : "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200/50"
                    }`}>
                      {checkinMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <p className="font-semibold">{checkinMessage.text}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!checkinEventId || !ticketCode}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md hover:from-indigo-500 transition-all disabled:opacity-50"
                  >
                    Check In Attendee
                  </button>
                </form>
              </div>

              {/* Checkin live logs */}
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <User className="w-4 h-4 text-violet-500" /> Recent Attendance Check-Ins
                </h3>
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto">
                  {liveActivity.filter((act) => act.type === "upload").length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-8">No check-ins recorded in this session.</p>
                  ) : (
                    liveActivity.filter((act) => act.type === "upload").map((act) => (
                      <div key={act.id} className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
                        {act.text} <span className="float-right text-[10px] text-slate-400">{act.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Post-Event Completion Reports */}
          {activeTab === "reports" && (
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-indigo-500" /> Post-Event Report Form
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Submit offerings, visitor metrics, and expenses to auto-complete this event and publish statistics.</p>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Choose Completed Event *</label>
                  <select
                    value={reportEventId}
                    onChange={(e) => setReportEventId(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="">-- Select Event --</option>
                    {(allEventsData?.events || []).filter((e: any) => e.status !== "COMPLETED").map((e: any) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Attendance Count</label>
                    <input type="number" value={attendanceCount} onChange={(e) => setAttendanceCount(Number(e.target.value))} className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-0.5"><DollarSign className="w-3 h-3 text-emerald-500" /> Offering Amount (INR)</label>
                    <input type="number" value={offeringAmount} onChange={(e) => setOfferingAmount(Number(e.target.value))} className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">New Visitors</label>
                    <input type="number" value={visitorsCount} onChange={(e) => setVisitorsCount(Number(e.target.value))} className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Expenses (INR)</label>
                    <input type="number" value={expenses} onChange={(e) => setExpenses(Number(e.target.value))} className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">New Saved Members</label>
                    <input type="number" value={newMembersCount} onChange={(e) => setNewMembersCount(Number(e.target.value))} className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Prayer Requests Collected</label>
                    <input type="number" value={prayerRequestsCount} onChange={(e) => setPrayerRequestsCount(Number(e.target.value))} className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1"><PenTool className="w-3.5 h-3.5" /> Event Summary (Full Report) *</label>
                  <textarea
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Provide a detailed summary of how the event went, testimonies, sermon highlights..."
                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none resize-none"
                  />
                </div>

                {reportMessage && (
                  <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                    reportMessage.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50"
                      : "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200/50"
                  }`}>
                    {reportMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <p className="font-semibold">{reportMessage.text}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!reportEventId || !summary}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md hover:from-emerald-500 transition-all disabled:opacity-50"
                >
                  Submit Completion Report & Close Event
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: Trash & Archive */}
          {activeTab === "trash" && (
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-500" /> Soft Deleted & Archived Queue
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Recover soft-deleted items or manage archived historical events.</p>
              </div>

              {/* Load deleted / archived events */}
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
              ) : (allEventsData?.events || []).filter((e: any) => e.isDeleted || e.status === "ARCHIVED").length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                  Queue empty. No deleted or archived events.
                </div>
              ) : (
                <div className="space-y-3">
                  {(allEventsData?.events || []).filter((e: any) => e.isDeleted || e.status === "ARCHIVED").map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl">
                      <div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase mb-1 ${e.isDeleted ? "bg-rose-500/15 text-rose-600" : "bg-slate-500/15 text-slate-400"}`}>
                          {e.isDeleted ? "DELETED" : "ARCHIVED"}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{e.title}</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5">Venue: {e.location}</p>
                      </div>
                      <div className="flex gap-2">
                        {e.isDeleted ? (
                          <button
                            onClick={() => handleRestore(e.id)}
                            className="h-8 px-3 rounded-lg bg-indigo-500 text-white text-[10px] font-black flex items-center gap-1 hover:bg-indigo-400 transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(e.id, "DRAFT")}
                            className="h-8 px-3 rounded-lg bg-indigo-500 text-white text-[10px] font-black flex items-center gap-1 hover:bg-indigo-400 transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Set Draft
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Sidebar Feed */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
              <Activity className="w-4 h-4 text-indigo-500" />
              <div className="flex-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Real-time activity
                </h3>
                <p className="text-[9px] text-slate-400 font-semibold">WebSockets Live Monitor</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {liveActivity.map((act) => (
                <div key={act.id} className="text-xs space-y-0.5 border-l-2 border-slate-200 dark:border-white/10 pl-3.5 relative">
                  <div className={`absolute w-2 h-2 rounded-full -left-[5px] top-[5px] border-2 border-white dark:border-slate-900 ${act.type === "upload" ? "bg-emerald-500" : "bg-indigo-500"}`} />
                  <p className="font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{act.text}</p>
                  <span className="text-[9px] text-slate-400 font-bold">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Modals & Overlays ────────────────────────────────────────────────── */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(9,10,26,0.65)", backdropFilter: "blur(12px)" }}>
          <div className="bg-white dark:bg-[#0f1021] border border-slate-200/50 dark:border-white/[0.06] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-[#0f1021] border-b border-slate-100 dark:border-white/5 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl">
                  {modal === "create" ? <PlusCircle className="w-4 h-4 text-white" /> : <Edit3 className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {modal === "create" ? "Create New Event" : "Edit Event"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {modal === "create" ? "Add event details to sync instantly to the homepage." : `Editing: ${selectedEvent?.title}`}
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
                  slug: selectedEvent.slug,
                  shortDescription: selectedEvent.shortDescription,
                  description: selectedEvent.description,
                  date: selectedEvent.date,
                  endDate: selectedEvent.endDate,
                  time: selectedEvent.time,
                  endTime: selectedEvent.endTime,
                  timezone: selectedEvent.timezone,
                  location: selectedEvent.location,
                  googleMapsUrl: selectedEvent.googleMapsUrl,
                  category: selectedEvent.category,
                  organizer: selectedEvent.organizer,
                  speaker: selectedEvent.speaker,
                  pastor: selectedEvent.pastor,
                  contactPerson: selectedEvent.contactPerson,
                  contactPhone: selectedEvent.contactPhone,
                  contactEmail: selectedEvent.contactEmail,
                  registrationRequired: selectedEvent.registrationRequired,
                  registrationLimit: selectedEvent.registrationLimit,
                  image: selectedEvent.image,
                  coverImagePublicId: selectedEvent.coverImagePublicId,
                  eventBanner: selectedEvent.eventBanner,
                  eventBannerPublicId: selectedEvent.eventBannerPublicId,
                  tags: selectedEvent.tags,
                  featured: selectedEvent.featured,
                  priority: selectedEvent.priority,
                  colorTheme: selectedEvent.colorTheme,
                  status: selectedEvent.status,
                  visibility: selectedEvent.visibility,
                  registrationOpenDate: selectedEvent.registrationOpenDate,
                  registrationCloseDate: selectedEvent.registrationCloseDate,
                  seoTitle: selectedEvent.seoTitle,
                  seoDescription: selectedEvent.seoDescription,
                  branchId: selectedEvent.branchId,
                } : undefined}
                isEditMode={modal === "edit"}
                onSubmit={modal === "create" ? handleCreate : handleUpdate}
                onCancel={() => { setModal(null); setSelectedEvent(null); }}
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
                <p className="text-[10px] text-slate-400">This will soft delete the event and move it to the Trash & Archive tab.</p>
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
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-sm font-bold hover:from-rose-500 hover:to-red-500 transition-all flex items-center justify-center gap-2"
              >
                Soft Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
