"use client";

import React, { useState, useEffect } from "react";
import { 
  Play, 
  Calendar, 
  Megaphone, 
  Image as ImageIcon, 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Edit2, 
  Search, 
  Sparkles,
  ChevronDown,
  X,
  LayoutGrid,
  List,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Clock,
  User,
  BookOpen,
  Filter,
  Tag,
  AlertTriangle,
  Info,
  Radio,
  Share2,
  CheckCircle2,
  Video,
  Upload
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";
import { useAuth } from "@/components/providers/AuthProvider";
import Image from "next/image";

interface ContentManagementProps {
  sermons: any[];
  events: any[];
  announcements: any[];
  onAddSermon?: (sermon: any) => void;
  onDeleteSermon?: (id: string) => void;
  onAddEvent?: (event: any) => void;
  onDeleteEvent?: (id: string) => void;
  onAddAnnouncement?: (announcement: any) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onOpenAddSermon?: () => void;
  onOpenAddEvent?: () => void;
  onOpenAddAnnouncement?: () => void;
  activeSubTab?: "sermons" | "events" | "announcements" | "media" | "pages";
  isLoading?: boolean;
}

export default function ContentManagement({
  sermons: initialSermons = [],
  events: initialEvents = [],
  announcements: initialAnnouncements = [],
  activeSubTab = "sermons",
  isLoading = false
}: ContentManagementProps) {
  const { getIdToken } = useAuth();
  const { language } = useLanguage();
  const t = adminTranslations[language as keyof typeof adminTranslations] || adminTranslations.en;

  // Local state for full interactivity
  const [subView, setSubView] = useState<"sermons" | "events" | "announcements" | "media" | "pages">(activeSubTab);
  const [sermonsList, setSermonsList] = useState<any[]>(initialSermons);
  const [eventsList, setEventsList] = useState<any[]>(initialEvents);
  const [announcementsList, setAnnouncementsList] = useState<any[]>(initialAnnouncements);
  
  // Media items state
  const [mediaList, setMediaList] = useState<any[]>([
    { id: "m1", title: "Church Front Sanctuary", cat: "BANNERS", url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80" },
    { id: "m2", title: "Bishop Kurra Kristhu Raju Portrait", cat: "PASTOR", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80" },
    { id: "m3", title: "Sunday Worship Choir Banner", cat: "EVENTS", url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80" },
    { id: "m4", title: "Youth Camp Campfire Session", cat: "EVENTS", url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80" },
    { id: "m5", title: "Prayer Vigil Gathering", cat: "EVENTS", url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800&q=80" },
    { id: "m6", title: "Sunday School Children Worship", cat: "GALLERY", url: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=800&q=80" }
  ]);

  useEffect(() => {
    setSubView(activeSubTab);
  }, [activeSubTab]);

  useEffect(() => {
    if (initialSermons?.length) setSermonsList(initialSermons);
  }, [initialSermons]);

  useEffect(() => {
    if (initialEvents?.length) setEventsList(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    if (initialAnnouncements?.length) setAnnouncementsList(initialAnnouncements);
  }, [initialAnnouncements]);

  // Controls & Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active Modals
  const [activeModal, setActiveModal] = useState<"add-sermon" | "add-event" | "add-announcement" | "add-media" | "preview-media" | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: "sermon" | "event" | "announcement" | "media"; name: string } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form states
  const [sermonForm, setSermonForm] = useState({
    title: "",
    speaker: "Bishop Kurra Kristhu Raju",
    category: "Faith",
    date: new Date().toISOString().split("T")[0],
    videoUrl: "",
    audioUrl: "",
    bibleVerse: "",
    description: ""
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    location: "Subhash Nagar Sanctuary",
    category: "WORSHIP",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    speaker: "Bishop Kurra Kristhu Raju",
    description: ""
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    priority: "NORMAL",
    expiresAt: ""
  });

  const [mediaForm, setMediaForm] = useState({
    title: "",
    cat: "BANNERS",
    url: ""
  });

  const [submitting, setSubmitting] = useState(false);

  // Helper for notification toast
  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Safe date formatter
  const safeFormatDate = (dateVal: any) => {
    if (!dateVal) return "N/A";
    try {
      return formatDate(dateVal);
    } catch {
      return new Date(dateVal).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    }
  };

  // API Call helper
  const executeApiAction = async (actionType: string, payloadData: any) => {
    setSubmitting(true);
    try {
      const token = await getIdToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const res = await fetch("/api/admin/content/action", {
        method: "POST",
        headers,
        body: JSON.stringify({ actionType, data: payloadData })
      });
      const result = await res.json();
      return result;
    } catch (err) {
      console.error(err);
      return { success: false, error: "Network error" };
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers for Adding
  const handleAddSermonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sermonForm.title || !sermonForm.speaker) return;
    
    const res = await executeApiAction("ADD_SERMON", sermonForm);
    const newSermon = res.sermon || {
      id: "sermon-" + Date.now(),
      ...sermonForm,
      views: 0,
      createdAt: new Date().toISOString()
    };
    
    setSermonsList([newSermon, ...sermonsList]);
    setActiveModal(null);
    setSermonForm({
      title: "",
      speaker: "Bishop Kurra Kristhu Raju",
      category: "Faith",
      date: new Date().toISOString().split("T")[0],
      videoUrl: "",
      audioUrl: "",
      bibleVerse: "",
      description: ""
    });
    showToast("Sermon published successfully!");
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.location) return;

    const res = await executeApiAction("ADD_EVENT", eventForm);
    const newEvent = res.event || {
      id: "event-" + Date.now(),
      ...eventForm,
      createdAt: new Date().toISOString()
    };

    setEventsList([newEvent, ...eventsList]);
    setActiveModal(null);
    setEventForm({
      title: "",
      location: "Subhash Nagar Sanctuary",
      category: "WORSHIP",
      date: new Date().toISOString().split("T")[0],
      time: "10:00 AM",
      speaker: "Bishop Kurra Kristhu Raju",
      description: ""
    });
    showToast("Event created successfully!");
  };

  const handleAddAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) return;

    const res = await executeApiAction("ADD_ANNOUNCEMENT", announcementForm);
    const newAnc = res.announcement || {
      id: "anc-" + Date.now(),
      ...announcementForm,
      createdAt: new Date().toISOString()
    };

    setAnnouncementsList([newAnc, ...announcementsList]);
    setActiveModal(null);
    setAnnouncementForm({
      title: "",
      content: "",
      priority: "NORMAL",
      expiresAt: ""
    });
    showToast("Announcement broadcasted successfully!");
  };

  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaForm.title || !mediaForm.url) return;

    const newMedia = {
      id: "media-" + Date.now(),
      title: mediaForm.title,
      cat: mediaForm.cat,
      url: mediaForm.url
    };

    setMediaList([newMedia, ...mediaList]);
    setActiveModal(null);
    setMediaForm({ title: "", cat: "BANNERS", url: "" });
    showToast("Media asset added to library!");
  };

  // Handlers for Deleting
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;

    if (type === "sermon") {
      await executeApiAction("DELETE_SERMON", { id });
      setSermonsList(sermonsList.filter(s => s.id !== id));
      showToast("Sermon deleted.");
    } else if (type === "event") {
      await executeApiAction("DELETE_EVENT", { id });
      setEventsList(eventsList.filter(e => e.id !== id));
      showToast("Event deleted.");
    } else if (type === "announcement") {
      await executeApiAction("DELETE_ANNOUNCEMENT", { id });
      setAnnouncementsList(announcementsList.filter(a => a.id !== id));
      showToast("Announcement deleted.");
    } else if (type === "media") {
      setMediaList(mediaList.filter(m => m.id !== id));
      showToast("Media asset removed.");
    }

    setDeleteConfirm(null);
  };

  // Copy to clipboard helper
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Preacher Avatar Badge
  const getPreacherAvatar = (speaker: string) => {
    const isBishop = speaker?.toLowerCase().includes("bishop");
    const initials = speaker ? speaker.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "PA";
    return (
      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${
        isBishop ? "from-purple-600 to-indigo-700 text-white" : "from-emerald-500 to-teal-600 text-white"
      } font-black flex items-center justify-center text-[10px] shrink-0 shadow-sm border border-white/10`}>
        {initials}
      </div>
    );
  };

  // Priority Badge Styling
  const getPriorityBadge = (priority: string) => {
    const p = priority?.toUpperCase() || "NORMAL";
    switch (p) {
      case "URGENT":
        return (
          <span className="px-3 py-1 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-500/30 flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3 h-3" /> Urgent
          </span>
        );
      case "HIGH":
        return (
          <span className="px-3 py-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
            <Radio className="w-3 h-3" /> High Priority
          </span>
        );
      case "LOW":
        return (
          <span className="px-3 py-1 bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-white/10">
            Low Priority
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30 flex items-center gap-1.5">
            <Info className="w-3 h-3" /> Normal
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200/60 dark:bg-white/[0.05] rounded-2xl" />
          ))}
        </div>
        <div className="h-12 bg-slate-200/60 dark:bg-white/[0.05] rounded-2xl w-full" />
        <div className="h-96 bg-slate-200/60 dark:bg-white/[0.05] rounded-2xl w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─── Notification Toast ─── */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-indigo-500/30 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">{actionSuccess}</span>
        </div>
      )}

      {/* ─── Top KPI Metric Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: "Sermons (Library)", 
            value: sermonsList.length, 
            sub: `${sermonsList.reduce((acc, s) => acc + (s.views || 0), 0)} Total Views`, 
            icon: Play, 
            color: "from-indigo-500 to-purple-600",
            bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          },
          { 
            label: "Church Events", 
            value: eventsList.length, 
            sub: `${eventsList.filter(e => new Date(e.date) >= new Date()).length} Upcoming`, 
            icon: Calendar, 
            color: "from-emerald-500 to-teal-600",
            bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          },
          { 
            label: "Announcements", 
            value: announcementsList.length, 
            sub: `${announcementsList.filter(a => a.priority === "URGENT" || a.priority === "HIGH").length} High Priority`, 
            icon: Megaphone, 
            color: "from-amber-500 to-orange-600",
            bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          },
          { 
            label: "Media Assets", 
            value: mediaList.length, 
            sub: "Photos & Banners", 
            icon: ImageIcon, 
            color: "from-sky-500 to-blue-600",
            bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400"
          }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#121324]/60 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all backdrop-blur-xl group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400">{stat.label}</span>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-gray-500 mt-0.5">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Sub Navigation Tabs ─── */}
      <div className="p-1.5 bg-white dark:bg-[#121324]/80 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl flex gap-1 items-center overflow-x-auto scrollbar-none shadow-sm backdrop-blur-xl">
        {[
          { id: "sermons", label: "Sermons (Library)", count: sermonsList.length, icon: Play },
          { id: "events", label: "Events Manager", count: eventsList.length, icon: Calendar },
          { id: "announcements", label: "Announcements", count: announcementsList.length, icon: Megaphone },
          { id: "media", label: "Media Library", count: mediaList.length, icon: ImageIcon },
          { id: "pages", label: "Page Settings", count: 4, icon: FileText }
        ].map((tab) => {
          const isSelected = subView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`py-2.5 px-4 rounded-xl flex items-center gap-2.5 text-xs font-extrabold transition-all whitespace-nowrap ${
                isSelected
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-gray-400"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Filter & Control Bar ─── */}
      <div className="bg-white dark:bg-[#121324]/60 border border-slate-200/80 dark:border-white/[0.06] p-4.5 rounded-2xl shadow-sm backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search ${subView}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#16172D]/80 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Dropdown for Sermons */}
          {subView === "sermons" && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2.5 px-3 bg-slate-50 dark:bg-[#16172D]/80 border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Faith">Faith</option>
              <option value="Inspiration">Inspiration</option>
              <option value="Prayer">Prayer</option>
              <option value="Purpose">Purpose</option>
            </select>
          )}

          {/* View Mode Toggle for Sermons */}
          {subView === "sermons" && (
            <div className="flex items-center p-1 bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-white/[0.06]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "grid" ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm" : "text-slate-400"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "table" ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm" : "text-slate-400"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          {subView === "sermons" && (
            <button 
              onClick={() => setActiveModal("add-sermon")} 
              className="w-full md:w-auto py-2.5 px-4.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-650 hover:to-indigo-750 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4.5 h-4.5" /> Publish New Sermon
            </button>
          )}
          {subView === "events" && (
            <button 
              onClick={() => setActiveModal("add-event")} 
              className="w-full md:w-auto py-2.5 px-4.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-650 hover:to-teal-650 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4.5 h-4.5" /> Schedule Event
            </button>
          )}
          {subView === "announcements" && (
            <button 
              onClick={() => setActiveModal("add-announcement")} 
              className="w-full md:w-auto py-2.5 px-4.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-650 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4.5 h-4.5" /> Post Announcement
            </button>
          )}
          {subView === "media" && (
            <button 
              onClick={() => setActiveModal("add-media")} 
              className="w-full md:w-auto py-2.5 px-4.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-650 hover:to-blue-650 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4.5 h-4.5" /> Upload Media Asset
            </button>
          )}
        </div>
      </div>

      {/* ────────────────── SUB-VIEW: SERMONS ────────────────── */}
      {subView === "sermons" && (
        <div className="space-y-6">
          {sermonsList.filter(s => {
            const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                                  (s.speaker && s.speaker.toLowerCase().includes(search.toLowerCase()));
            const matchesCat = categoryFilter === "ALL" || s.category === categoryFilter;
            return matchesSearch && matchesCat;
          }).length === 0 ? (
            <div className="bg-white dark:bg-[#121324]/40 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No sermons found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">Try broadening your search criteria or publish a new sermon video into the library.</p>
              <button 
                onClick={() => setActiveModal("add-sermon")}
                className="py-2 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm mt-2"
              >
                <Plus className="w-4 h-4" /> Add First Sermon
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sermonsList.filter(s => {
                const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                                      (s.speaker && s.speaker.toLowerCase().includes(search.toLowerCase()));
                const matchesCat = categoryFilter === "ALL" || s.category === categoryFilter;
                return matchesSearch && matchesCat;
              }).map((sermon) => (
                <div key={sermon.id} className="bg-white dark:bg-[#121324]/60 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 backdrop-blur-xl flex flex-col justify-between group">
                  <div>
                    {/* Media Thumbnail Container */}
                    <div className="h-44 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                      <img 
                        src={sermon.thumbnail || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80"} 
                        alt={sermon.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                      
                      {/* Play Button Overlay */}
                      <a 
                        href={sermon.videoUrl || "#"} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/20 relative z-10"
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </a>

                      {/* Category Tag */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-[9px] font-extrabold uppercase tracking-wider border border-white/10">
                        {sermon.category || "Faith"}
                      </span>

                      {/* Duration Badge */}
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/70 backdrop-blur-md text-white rounded text-[10px] font-mono font-bold">
                        {sermon.duration || "45:00"}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getPreacherAvatar(sermon.pastor || sermon.speaker || "Bishop Kurra Kristhu Raju")}
                          <span className="text-xs font-bold text-slate-700 dark:text-gray-200 truncate">
                            {sermon.pastor || sermon.speaker || "Bishop Kurra Kristhu Raju"}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-gray-500">
                          {safeFormatDate(sermon.date)}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {sermon.title}
                      </h4>

                      {sermon.bibleVerse && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-bold border border-indigo-100 dark:border-indigo-500/20">
                          <BookOpen className="w-3 h-3 shrink-0" />
                          <span>{sermon.bibleVerse}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-gray-500 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {sermon.views || 0} views
                    </span>

                    <div className="flex items-center gap-1">
                      {sermon.videoUrl && (
                        <a 
                          href={sermon.videoUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                          title="Watch Video"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button 
                        onClick={() => setDeleteConfirm({ id: sermon.id, type: "sermon", name: sermon.title })}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Sermon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#121324]/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/[0.06] text-[10px] font-extrabold text-slate-400 dark:text-gray-400 uppercase tracking-wider bg-slate-50 dark:bg-white/[0.02]">
                      <th className="py-4 px-6">Sermon Title & Scripture</th>
                      <th className="py-4 px-6">Speaker / Pastor</th>
                      <th className="py-4 px-6">Preached Date</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Views</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs font-semibold text-slate-700 dark:text-gray-300">
                    {sermonsList.filter(s => {
                      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                                            (s.speaker && s.speaker.toLowerCase().includes(search.toLowerCase()));
                      const matchesCat = categoryFilter === "ALL" || s.category === categoryFilter;
                      return matchesSearch && matchesCat;
                    }).map((sermon) => (
                      <tr key={sermon.id} className="hover:bg-slate-50/60 dark:hover:bg-[#16172D]/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
                              <Play className="w-4 h-4 fill-current" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-900 dark:text-white block max-w-[260px] truncate">{sermon.title}</span>
                              {sermon.bibleVerse && (
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{sermon.bibleVerse}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {getPreacherAvatar(sermon.pastor || sermon.speaker || "Bishop Kurra Kristhu Raju")}
                            <span className="font-bold text-slate-800 dark:text-gray-200">{sermon.pastor || sermon.speaker || "Bishop Kurra Kristhu Raju"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-500 dark:text-gray-400">{safeFormatDate(sermon.date)}</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-gray-300 rounded-lg text-[9px] font-extrabold border border-slate-200 dark:border-white/10 uppercase tracking-wider">
                            {sermon.category || "Faith"}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-500 dark:text-gray-400">{sermon.views || 0}</td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {sermon.videoUrl && (
                              <a 
                                href={sermon.videoUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button 
                              onClick={() => setDeleteConfirm({ id: sermon.id, type: "sermon", name: sermon.title })}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SUB-VIEW: EVENTS ────────────────── */}
      {subView === "events" && (
        <div className="space-y-6">
          {eventsList.filter(e => e.title.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
            <div className="bg-white dark:bg-[#121324]/40 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No scheduled events</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">Create and publish upcoming church services, worship rallies, or youth programs.</p>
              <button 
                onClick={() => setActiveModal("add-event")}
                className="py-2 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm mt-2"
              >
                <Plus className="w-4 h-4" /> Schedule New Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsList.filter(e => e.title.toLowerCase().includes(search.toLowerCase())).map((evt) => (
                <div key={evt.id} className="bg-white dark:bg-[#121324]/60 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all backdrop-blur-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-extrabold border border-emerald-500/20 uppercase tracking-wider">
                        {evt.category || "Worship"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {evt.time || "10:00 AM"}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">{evt.title}</h4>
                    
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300 font-semibold">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{safeFormatDate(evt.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">
                      {evt.speaker ? `Speaker: ${evt.speaker}` : "Sanctuary Event"}
                    </span>
                    <button 
                      onClick={() => setDeleteConfirm({ id: evt.id, type: "event", name: evt.title })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SUB-VIEW: ANNOUNCEMENTS ────────────────── */}
      {subView === "announcements" && (
        <div className="space-y-4">
          {announcementsList.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
            <div className="bg-white dark:bg-[#121324]/40 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No active announcements</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">Broadcast news bulletins or high priority alerts to sanctuary members.</p>
              <button 
                onClick={() => setActiveModal("add-announcement")}
                className="py-2 px-4 bg-amber-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm mt-2"
              >
                <Plus className="w-4 h-4" /> Broadcast Announcement
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {announcementsList.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map((anc) => (
                <div key={anc.id} className="bg-white dark:bg-[#121324]/60 border border-slate-200/80 dark:border-white/[0.06] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      {getPriorityBadge(anc.priority)}
                      <span className="text-[10px] font-semibold text-slate-400">
                        Posted {safeFormatDate(anc.createdAt)}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">{anc.title}</h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-gray-300 leading-relaxed max-w-3xl">{anc.content}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {anc.expiresAt && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10">
                        Expires: {safeFormatDate(anc.expiresAt)}
                      </span>
                    )}
                    <button 
                      onClick={() => setDeleteConfirm({ id: anc.id, type: "announcement", name: anc.title })}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SUB-VIEW: MEDIA LIBRARY ────────────────── */}
      {subView === "media" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaList.filter(m => m.title.toLowerCase().includes(search.toLowerCase())).map((media) => (
              <div key={media.id} className="bg-white dark:bg-[#121324]/60 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 backdrop-blur-xl group">
                {/* Image Container */}
                <div 
                  onClick={() => { setSelectedMedia(media); setActiveModal("preview-media"); }}
                  className="h-44 bg-slate-900 relative overflow-hidden cursor-pointer"
                >
                  <img src={media.url} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-black/70 backdrop-blur-md border border-white/10 text-white rounded text-[8px] font-black tracking-wider uppercase">
                    {media.cat}
                  </span>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="py-1.5 px-3 bg-white/90 text-slate-900 rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-lg">
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </span>
                  </div>
                </div>

                {/* Info & Copy */}
                <div className="p-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate">{media.title}</h4>
                  
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleCopyLink(media.url, media.id)}
                      className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {copiedId === media.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" /> <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy URL
                        </>
                      )}
                    </button>

                    <button 
                      onClick={() => setDeleteConfirm({ id: media.id, type: "media", name: media.title })}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: PAGES ────────────────── */}
      {subView === "pages" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { page: "Home Page", path: "/", desc: "Main landing hero layout, welcome notes, and service times overview." },
            { page: "Leadership Page", path: "/about/leadership", desc: "Biography and credentials for Bishop Kurra Kristhu Raju Garu." },
            { page: "Ministries Hub", path: "/about/ministries", desc: "Directory displaying active departments and coordinators." },
            { page: "Giving / Tithes Form", path: "/give", desc: "Tax exemption details and Razorpay/Stripe checkout handles." }
          ].map((item, idx) => (
            <div key={idx} className="p-5 bg-white dark:bg-[#121324]/60 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm backdrop-blur-xl flex items-start justify-between gap-4 hover:border-indigo-500/40 transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.page}</h4>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-black uppercase">Live</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                <code className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-2.5 py-1 rounded-lg font-mono inline-block font-bold">
                  {item.path}
                </code>
              </div>
              <a 
                href="/admin/content/pages" 
                className="py-2 px-3.5 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-600 hover:text-white transition-all shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit CMS
              </a>
            </div>
          ))}
        </div>
      )}

      {/* ────────────────── MODALS ────────────────── */}

      {/* 1. Add Sermon Modal */}
      {activeModal === "add-sermon" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-indigo-600" /> Publish New Sermon
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSermonSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Sermon Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Walking by Faith in Times of Trial"
                  value={sermonForm.title}
                  onChange={(e) => setSermonForm({ ...sermonForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Speaker / Preacher *</label>
                  <input 
                    type="text" 
                    required
                    value={sermonForm.speaker}
                    onChange={(e) => setSermonForm({ ...sermonForm, speaker: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Category</label>
                  <select 
                    value={sermonForm.category}
                    onChange={(e) => setSermonForm({ ...sermonForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Faith">Faith</option>
                    <option value="Inspiration">Inspiration</option>
                    <option value="Prayer">Prayer</option>
                    <option value="Purpose">Purpose</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Date Preached</label>
                  <input 
                    type="date" 
                    value={sermonForm.date}
                    onChange={(e) => setSermonForm({ ...sermonForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Bible Scripture / Verse</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Hebrews 11:1"
                    value={sermonForm.bibleVerse}
                    onChange={(e) => setSermonForm({ ...sermonForm, bibleVerse: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">YouTube / Video URL</label>
                <input 
                  type="url" 
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={sermonForm.videoUrl}
                  onChange={(e) => setSermonForm({ ...sermonForm, videoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Sermon Summary / Description</label>
                <textarea 
                  rows={3}
                  placeholder="Brief synopsis of message..."
                  value={sermonForm.description}
                  onChange={(e) => setSermonForm({ ...sermonForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold shadow-md hover:from-indigo-650 transition-all disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Sermon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Event Modal */}
      {activeModal === "add-event" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" /> Schedule Church Event
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Event Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sunday Anointing & Deliverance Service"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Sanctuary / Location *</label>
                  <input 
                    type="text" 
                    required
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Category</label>
                  <select 
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="WORSHIP">Worship Service</option>
                    <option value="PRAYER">Prayer Vigil</option>
                    <option value="YOUTH">Youth Activity</option>
                    <option value="CHILDREN">Sunday School</option>
                    <option value="SPECIAL">Special Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Event Date</label>
                  <input 
                    type="date" 
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Time</label>
                  <input 
                    type="text" 
                    placeholder="10:00 AM - 1:00 PM"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-md hover:from-emerald-650 transition-all disabled:opacity-50"
                >
                  {submitting ? "Scheduling..." : "Schedule Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Announcement Modal */}
      {activeModal === "add-announcement" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" /> Broadcast Announcement
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAnnouncementSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Announcement Headline *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Special Fasting & Prayer Week Schedule"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Priority Level</label>
                  <select 
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent!</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Expiration Date (Optional)</label>
                  <input 
                    type="date" 
                    value={announcementForm.expiresAt}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Announcement Details *</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Enter the full message text for congregation members..."
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-md hover:from-amber-600 transition-all disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Media Modal */}
      {activeModal === "add-media" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-sky-500" /> Upload Media Asset
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMediaSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Asset Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Easter Choir Worship Banner"
                  value={mediaForm.title}
                  onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Category</label>
                <select 
                  value={mediaForm.cat}
                  onChange={(e) => setMediaForm({ ...mediaForm, cat: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="BANNERS">Banners</option>
                  <option value="PASTOR">Pastor</option>
                  <option value="EVENTS">Events</option>
                  <option value="GALLERY">Gallery</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Image Direct URL *</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={mediaForm.url}
                  onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="py-2.5 px-5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-bold shadow-md hover:from-sky-650 transition-all"
                >
                  Add Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Preview Media Modal */}
      {activeModal === "preview-media" && selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-4 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white truncate">{selectedMedia.title}</h3>
              <button onClick={() => setActiveModal(null)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-80 w-full bg-black rounded-xl overflow-hidden relative">
              <img src={selectedMedia.url} alt={selectedMedia.title} className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-gray-400 font-mono">{selectedMedia.cat}</span>
              <button
                onClick={() => handleCopyLink(selectedMedia.url, selectedMedia.id)}
                className="py-1.5 px-3 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Image URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Delete Item?</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mt-1">
                Are you sure you want to remove <span className="font-bold text-slate-800 dark:text-gray-200">"{deleteConfirm.name}"</span>? This action can be audited or restored from archive.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="py-2 px-4 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
