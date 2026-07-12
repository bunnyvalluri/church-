"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, RefreshCw, Eye, Pencil, Trash2, Copy, Archive,
  RotateCcw, Star, StarOff, ChevronDown, ChevronUp, X, Check,
  GripVertical, Upload, Loader2, Globe, Clock, MapPin, Heart,
  Music, Users2, BookHeart, Mic2, Calendar, Flame, Shield, Sparkles,
  Filter, SortAsc, ToggleLeft, ToggleRight, Tag, Image as ImageIcon,
  // Extended icon set
  HandHeart, Headphones, Radio, Video, BookOpen,
  Feather, Sun, Rainbow, Leaf, TreePine,
  Baby, HeartHandshake, Handshake, Users, UserCheck, GraduationCap, Award,
  Zap, Lightbulb, Bell, Gift, Crown,
  Infinity, Home, Landmark,
  Send, Volume2, Mic, Camera,
  Coffee, Languages, Scroll,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

// ── Types ─────────────────────────────────────────────────────────────────────────
interface ChurchService {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  icon: string;
  iconColor: string;
  cardColor: string;
  badgeColor: string;
  serviceType: string;
  serviceDay?: string;
  occurrence?: string;
  startTime?: string;
  endTime?: string;
  frequency: string;
  location?: string;
  googleMapsUrl?: string;
  speakerName?: string;
  capacity?: number;
  registrationEnabled: boolean;
  registrationLimit?: number;
  featured: boolean;
  displayOrder: number;
  status: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  language: string;
  imageUrl?: string;
  imagePublicId?: string;
  branchId?: string;
  branch?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

// ── Icon options ──────────────────────────────────────────────────────────────────
const ICON_OPTIONS = [
  // ── Spiritual & Worship
  { name: "Heart",          label: "Love",         icon: Heart,         color: "linear-gradient(135deg,#f43f5e,#e11d48)"   },
  { name: "HandHeart",      label: "Devotion",     icon: HandHeart,     color: "linear-gradient(135deg,#ec4899,#be185d)"   },
  { name: "HeartHandshake", label: "Ministry",     icon: HeartHandshake,color: "linear-gradient(135deg,#f97316,#ea580c)"   },
  { name: "BookHeart",      label: "Bible",        icon: BookHeart,     color: "linear-gradient(135deg,#8b5cf6,#7c3aed)"   },
  { name: "BookOpen",       label: "Scripture",    icon: BookOpen,      color: "linear-gradient(135deg,#6366f1,#4f46e5)"   },
  { name: "Scroll",         label: "Word",         icon: Scroll,        color: "linear-gradient(135deg,#a78bfa,#7c3aed)"   },
  { name: "Feather",        label: "Spirit",       icon: Feather,       color: "linear-gradient(135deg,#38bdf8,#0284c7)"   },
  { name: "Flame",          label: "Revival",      icon: Flame,         color: "linear-gradient(135deg,#fb923c,#dc2626)"   },
  { name: "Sparkles",       label: "Glory",        icon: Sparkles,      color: "linear-gradient(135deg,#fbbf24,#f59e0b)"   },
  { name: "Crown",          label: "Kingdom",      icon: Crown,         color: "linear-gradient(135deg,#eab308,#ca8a04)"   },
  { name: "Star",           label: "Praise",       icon: Star,          color: "linear-gradient(135deg,#facc15,#d97706)"   },
  { name: "Sun",            label: "Light",        icon: Sun,           color: "linear-gradient(135deg,#fde68a,#f59e0b)"   },
  { name: "Rainbow",        label: "Promise",      icon: Rainbow,       color: "linear-gradient(135deg,#34d399,#059669)"   },
  { name: "Infinity",       label: "Eternal",      icon: Infinity,      color: "linear-gradient(135deg,#c084fc,#a855f7)"   },
  // ── People & Community
  { name: "Users2",         label: "Fellowship",   icon: Users2,        color: "linear-gradient(135deg,#22d3ee,#0891b2)"   },
  { name: "Users",          label: "Community",    icon: Users,         color: "linear-gradient(135deg,#60a5fa,#2563eb)"   },
  { name: "UserCheck",      label: "Disciples",    icon: UserCheck,     color: "linear-gradient(135deg,#4ade80,#16a34a)"   },
  { name: "Baby",           label: "Children",     icon: Baby,          color: "linear-gradient(135deg,#f9a8d4,#db2777)"   },
  { name: "GraduationCap",  label: "Youth",        icon: GraduationCap, color: "linear-gradient(135deg,#818cf8,#4f46e5)"   },
  { name: "Award",          label: "Leaders",      icon: Award,         color: "linear-gradient(135deg,#fcd34d,#b45309)"   },
  { name: "Handshake",      label: "Outreach",     icon: Handshake,     color: "linear-gradient(135deg,#6ee7b7,#059669)"   },
  // ── Music & Media
  { name: "Music",          label: "Worship",      icon: Music,         color: "linear-gradient(135deg,#e879f9,#a21caf)"   },
  { name: "Mic2",           label: "Sermon",       icon: Mic2,          color: "linear-gradient(135deg,#f472b6,#be185d)"   },
  { name: "Mic",            label: "Preaching",    icon: Mic,           color: "linear-gradient(135deg,#fb7185,#e11d48)"   },
  { name: "Headphones",     label: "Podcast",      icon: Headphones,    color: "linear-gradient(135deg,#a78bfa,#6d28d9)"   },
  { name: "Radio",          label: "Broadcast",    icon: Radio,         color: "linear-gradient(135deg,#67e8f9,#0891b2)"   },
  { name: "Video",          label: "Stream",       icon: Video,         color: "linear-gradient(135deg,#f87171,#dc2626)"   },
  { name: "Camera",         label: "Media",        icon: Camera,        color: "linear-gradient(135deg,#94a3b8,#475569)"   },
  { name: "Volume2",        label: "Audio",        icon: Volume2,       color: "linear-gradient(135deg,#7dd3fc,#0369a1)"   },
  // ── Schedule & Location
  { name: "Calendar",       label: "Events",       icon: Calendar,      color: "linear-gradient(135deg,#6366f1,#818cf8)"   },
  { name: "Clock",          label: "Schedule",     icon: Clock,         color: "linear-gradient(135deg,#64748b,#334155)"   },
  { name: "MapPin",         label: "Location",     icon: MapPin,        color: "linear-gradient(135deg,#f43f5e,#9f1239)"   },
  { name: "Globe",          label: "Global",       icon: Globe,         color: "linear-gradient(135deg,#22d3ee,#155e75)"   },
  { name: "Landmark",       label: "Church",       icon: Landmark,      color: "linear-gradient(135deg,#c4b5fd,#7c3aed)"   },
  { name: "Home",           label: "House",        icon: Home,          color: "linear-gradient(135deg,#86efac,#15803d)"   },
  // ── Misc & Symbolism
  { name: "Shield",         label: "Protection",   icon: Shield,        color: "linear-gradient(135deg,#3b82f6,#1d4ed8)"   },
  { name: "Bell",           label: "Alerts",       icon: Bell,          color: "linear-gradient(135deg,#fbbf24,#92400e)"   },
  { name: "Gift",           label: "Giving",       icon: Gift,          color: "linear-gradient(135deg,#f472b6,#9d174d)"   },
  { name: "Zap",            label: "Power",        icon: Zap,           color: "linear-gradient(135deg,#facc15,#ca8a04)"   },
  { name: "Lightbulb",      label: "Vision",       icon: Lightbulb,     color: "linear-gradient(135deg,#fde047,#a16207)"   },
  { name: "Leaf",           label: "Growth",       icon: Leaf,          color: "linear-gradient(135deg,#4ade80,#065f46)"   },
  { name: "TreePine",       label: "Nature",       icon: TreePine,      color: "linear-gradient(135deg,#86efac,#14532d)"   },
  { name: "Coffee",         label: "Cafe",         icon: Coffee,        color: "linear-gradient(135deg,#d97706,#78350f)"   },
  { name: "Send",           label: "Mission",      icon: Send,          color: "linear-gradient(135deg,#38bdf8,#0c4a6e)"   },
  { name: "Languages",      label: "Multilingual", icon: Languages,     color: "linear-gradient(135deg,#a3e635,#3f6212)"   },
];

const ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(
  ICON_OPTIONS.map(o => [o.name, o.icon])
);

// ── Color presets ─────────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { label: "Violet",  value: "from-violet-500 to-purple-600" },
  { label: "Blue",    value: "from-blue-500 to-cyan-500"     },
  { label: "Green",   value: "from-green-500 to-emerald-500" },
  { label: "Yellow",  value: "from-yellow-500 to-orange-500" },
  { label: "Pink",    value: "from-pink-500 to-rose-500"     },
  { label: "Purple",  value: "from-purple-600 to-violet-500" },
  { label: "Indigo",  value: "from-indigo-500 to-blue-600"   },
  { label: "Teal",    value: "from-teal-500 to-cyan-600"     },
];

const GRADIENT_CSS: Record<string, string> = {
  "from-violet-500 to-purple-600": "linear-gradient(135deg,#8b5cf6,#9333ea)",
  "from-blue-500 to-cyan-500":     "linear-gradient(135deg,#3b82f6,#06b6d4)",
  "from-green-500 to-emerald-500": "linear-gradient(135deg,#22c55e,#10b981)",
  "from-yellow-500 to-orange-500": "linear-gradient(135deg,#eab308,#f97316)",
  "from-pink-500 to-rose-500":     "linear-gradient(135deg,#ec4899,#f43f5e)",
  "from-purple-600 to-violet-500": "linear-gradient(135deg,#9333ea,#8b5cf6)",
  "from-indigo-500 to-blue-600":   "linear-gradient(135deg,#6366f1,#2563eb)",
  "from-teal-500 to-cyan-600":     "linear-gradient(135deg,#14b8a6,#0891b2)",
};

function resolveGrad(color: string): string {
  return GRADIENT_CSS[color] || "linear-gradient(135deg,#8b5cf6,#9333ea)";
}

function formatTime(t: string | null | undefined): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function scheduleLabel(s: ChurchService): string {
  const parts: string[] = [];
  if (s.occurrence) parts.push(s.occurrence);
  else if (s.serviceDay) parts.push(s.serviceDay);
  if (s.startTime) {
    parts.push(formatTime(s.startTime) + (s.endTime ? ` – ${formatTime(s.endTime)}` : ""));
  }
  return parts.join(" · ");
}

// ── Blank form ────────────────────────────────────────────────────────────────────
const BLANK_FORM: Partial<ChurchService> = {
  title: "", shortDescription: "", description: "",
  serviceType: "WORSHIP", icon: "Heart", iconColor: "#ffffff",
  cardColor: "from-violet-500 to-purple-600", badgeColor: "from-violet-500 to-purple-600",
  serviceDay: "", frequency: "WEEKLY", occurrence: "",
  startTime: "", endTime: "",
  location: "", googleMapsUrl: "", speakerName: "",
  capacity: undefined, registrationEnabled: false, registrationLimit: undefined,
  featured: false, displayOrder: 0, status: "DRAFT",
  seoTitle: "", seoDescription: "", tags: [], language: "en",
  imageUrl: "", imagePublicId: "",
};

// ── Status badge ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20",
    DRAFT:     "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20",
    ARCHIVED:  "bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[status] || map.DRAFT}`}>
      {status}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────────
interface Props { onClose: () => void; token?: string; }

export default function ChurchServiceManager({ onClose, token }: Props) {
  const { getIdToken } = useAuth();
  const [services, setServices]     = useState<ChurchService[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);

  // UI state
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy]         = useState("displayOrder");
  const [showFilters, setShowFilters] = useState(false);
  const [viewingService, setViewingService] = useState<ChurchService | null>(null);

  // Modal state
  const [modalMode, setModalMode]   = useState<"create" | "edit" | null>(null);
  const [formData, setFormData]     = useState<Partial<ChurchService>>(BLANK_FORM);
  const [deleteTarget, setDeleteTarget] = useState<ChurchService | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<ChurchService | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<ChurchService | null>(null);
  const [tagInput, setTagInput]     = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getHeaders = async (isJson = false) => {
    const headers: any = {};
    if (isJson) headers["Content-Type"] = "application/json";
    const t = token || (await getIdToken());
    if (t) headers["Authorization"] = `Bearer ${t}`;
    return headers;
  };

  // ── Fetch services ──────────────────────────────────────────────────────────────
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ admin: "1", status: filterStatus, search });
      const headers = await getHeaders();
      const res = await fetch(`/api/services?${params}`, { headers });
      const data = await res.json();
      let items: ChurchService[] = data.services || [];

      // Client-side sort
      if (sortBy === "displayOrder") items.sort((a, b) => a.displayOrder - b.displayOrder);
      else if (sortBy === "title") items.sort((a, b) => a.title.localeCompare(b.title));
      else if (sortBy === "newest") items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      else if (sortBy === "updated") items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setServices(items);
      setTotal(data.total || items.length);
    } catch (err) {
      console.error("[ChurchServiceManager] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search, sortBy, token]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  // ── Validate form ───────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!formData.title?.trim()) errors.title = "Title is required.";
    if (formData.title && formData.title.length < 2) errors.title = "Title must be at least 2 characters.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Image upload ────────────────────────────────────────────────────────────────
  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (formData.imagePublicId) fd.append("oldPublicId", formData.imagePublicId);
      const headers = await getHeaders();
      const res = await fetch("/api/upload/service-icon", {
        method: "POST",
        headers,
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFormData(prev => ({ ...prev, imageUrl: data.url, imagePublicId: data.publicId }));
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  // ── Save (create/edit) ──────────────────────────────────────────────────────────
  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const isEdit = modalMode === "edit" && formData.id;
      const url = isEdit ? `/api/services/${formData.id}` : "/api/services";
      const method = isEdit ? "PUT" : "POST";
      const headers = await getHeaders(true);

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setModalMode(null);
      setFormData(BLANK_FORM);
      await fetchServices();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Patch action ────────────────────────────────────────────────────────────────
  async function patchService(id: string, action: string, extra?: any) {
    try {
      const headers = await getHeaders(true);
      const res = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchServices();
      // If duplicate — open edit for the copy
      if (action === "duplicate" && data.service) {
        setFormData(data.service);
        setModalMode("edit");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────────
  async function handleDelete(id: string, hard = false) {
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/services/${id}?hard=${hard ? "1" : "0"}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDeleteTarget(null);
      await fetchServices();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  // ── Reorder (move up/down) ──────────────────────────────────────────────────────
  async function moveService(id: string, direction: "up" | "down") {
    const idx = services.findIndex(s => s.id === id);
    if (idx < 0) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === services.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const updated = [...services];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];

    const items = updated.map((s, i) => ({ id: s.id, displayOrder: i + 1 }));
    setServices(updated);

    const headers = await getHeaders(true);
    await fetch("/api/services/reorder", {
      method: "POST",
      headers,
      body: JSON.stringify({ items }),
    });
  }

  // ── Tag management ──────────────────────────────────────────────────────────────
  function addTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
      if (!formData.tags?.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
      }
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
  }

  // ── Open create modal ───────────────────────────────────────────────────────────
  function openCreate() {
    const nextOrder = Math.max(0, ...services.map(s => s.displayOrder)) + 1;
    setFormData({ ...BLANK_FORM, displayOrder: nextOrder });
    setFormErrors({});
    setTagInput("");
    setModalMode("create");
  }

  // ── Open edit modal ─────────────────────────────────────────────────────────────
  function openEdit(service: ChurchService) {
    setFormData({ ...service });
    setFormErrors({});
    setTagInput("");
    setModalMode("edit");
  }

  // ── Rendered ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-[#0f0f1a] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-white/[0.08]"
      >
        {/* ── Header ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Manage Worship Services</h2>
              <p className="text-xs text-slate-500 dark:text-white/40">
                CREATE · READ · UPDATE · DELETE · {total} service{total !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-violet-500/30 hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-4 h-4" /> New Service
            </button>
            <button
              onClick={fetchServices}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60 hover:bg-red-100 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
        <div className="px-4 py-3 sm:px-6 border-b border-slate-100 dark:border-white/[0.06] flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search services…"
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              />
            </div>

            {/* Filters Group */}
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:w-auto">
              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-white/70 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-white/70 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              >
                <option value="displayOrder">Display Order</option>
                <option value="title">Alphabetical</option>
                <option value="newest">Newest</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Service List ──────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              <p className="text-slate-500 dark:text-white/40 text-sm">Loading services…</p>
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Heart className="w-12 h-12 text-slate-300 dark:text-white/10" />
              <p className="text-slate-500 dark:text-white/40 text-sm">No services found.</p>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create First Service
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {services.map((service, idx) => {
                const Icon = ICON_MAP[service.icon] || Heart;
                const grad = resolveGrad(service.cardColor);
                const isViewing = viewingService?.id === service.id;

                return (
                  <div key={service.id}>
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-6 sm:py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${isViewing ? "bg-violet-50 dark:bg-violet-500/5" : ""}`}>
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        {/* Reorder */}
                        <div className="flex sm:flex-col items-center gap-1 sm:gap-0.5 flex-shrink-0">
                          <button onClick={() => moveService(service.id, "up")} disabled={idx === 0} className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30">
                            <ChevronUp className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-slate-400" />
                          </button>
                          <GripVertical className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-slate-300 dark:text-white/20 mx-auto hidden sm:block" />
                          <button onClick={() => moveService(service.id, "down")} disabled={idx === services.length - 1} className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30">
                            <ChevronDown className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-slate-400" />
                          </button>
                        </div>

                        {/* Icon */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: grad }}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: service.iconColor || "#fff" }} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">{service.title}</span>
                            {service.featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                            <StatusBadge status={service.status} />
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-white/40 flex-wrap">
                            {scheduleLabel(service) && (
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{scheduleLabel(service)}</span>
                            )}
                            {service.serviceType && (
                              <span className="uppercase font-medium text-[10px] tracking-wider">{service.serviceType}</span>
                            )}
                            {service.branch && (
                              <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{service.branch.name}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap border-t border-slate-100 dark:border-white/[0.04] sm:border-0 pt-3 sm:pt-0 justify-end w-full sm:w-auto">
                        {/* View */}
                        <button
                          onClick={() => setViewingService(isViewing ? null : service)}
                          className={`p-2 rounded-xl transition-colors ${isViewing ? "bg-violet-100 dark:bg-violet-500/20 text-violet-600" : "hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500 dark:text-white/40"}`}
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(service)}
                          className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-500 dark:text-white/40 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Duplicate */}
                        <button
                          onClick={() => patchService(service.id, "duplicate")}
                          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500 dark:text-white/40 hover:text-slate-700 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {/* Toggle featured */}
                        <button
                          onClick={() => patchService(service.id, "toggle-featured")}
                          className={`p-2 rounded-xl transition-colors ${service.featured ? "text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]"}`}
                          title={service.featured ? "Unfeature" : "Feature"}
                        >
                          {service.featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                        </button>
                        {/* Toggle publish */}
                        <button
                          onClick={() => patchService(service.id, service.status === "PUBLISHED" ? "draft" : "publish")}
                          className={`p-2 rounded-xl transition-colors ${service.status === "PUBLISHED" ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-400/10" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]"}`}
                          title={service.status === "PUBLISHED" ? "Set to Draft" : "Publish"}
                        >
                          {service.status === "PUBLISHED" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        {/* Archive */}
                        {service.status !== "ARCHIVED" && (
                          <button
                            onClick={() => setArchiveTarget(service)}
                            className="p-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-500/10 text-slate-400 hover:text-orange-500 transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        {/* Restore */}
                        {service.status === "ARCHIVED" && (
                          <button
                            onClick={() => setRestoreTarget(service)}
                            className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors"
                            title="Restore"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(service)}
                          className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* ── Inline Read / Detail Drawer ─────────────────────────── */}
                    <AnimatePresence>
                      {isViewing && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden bg-violet-50 dark:bg-violet-500/[0.03] border-y border-violet-100 dark:border-violet-500/10"
                        >
                          <div className="px-4 py-4 sm:px-6 sm:py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <DetailRow label="Title" value={service.title} />
                              <DetailRow label="Short Description" value={service.shortDescription} />
                              <DetailRow label="Description" value={service.description} />
                              <DetailRow label="Service Type" value={service.serviceType} />
                              <DetailRow label="Speaker" value={service.speakerName} />
                              <DetailRow label="Language" value={service.language} />
                            </div>
                            <div className="space-y-3">
                              <DetailRow label="Schedule" value={scheduleLabel(service)} />
                              <DetailRow label="Frequency" value={service.frequency} />
                              <DetailRow label="Location" value={service.location} />
                              <DetailRow label="Capacity" value={service.capacity?.toString()} />
                              <DetailRow label="Registration" value={service.registrationEnabled ? `Enabled (limit: ${service.registrationLimit || "∞"})` : "Disabled"} />
                              {service.tags?.length > 0 && (
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Tags</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {service.tags.map(t => (
                                      <span key={t} className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-[10px] font-medium">#{t}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 md:col-span-2 pt-2 border-t border-violet-100 dark:border-violet-500/10">
                              <button
                                onClick={() => openEdit(service)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit This Service
                              </button>
                              <button
                                onClick={() => setDeleteTarget(service)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────────── */}
        <div className="px-4 py-4 sm:px-6 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 bg-slate-50 dark:bg-white/[0.02]">
          <p className="text-xs text-slate-400 dark:text-white/30 text-center sm:text-left">
            Showing {services.length} of {total} services · Changes appear live on landing page
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60 text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>

      {/* ══════════════════════ CREATE / EDIT MODAL ═══════════════════════════════ */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f0f1a] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col border border-slate-200 dark:border-white/[0.08] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-white/[0.06]">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate pr-4">
                  {modalMode === "create" ? "Create New Service" : `Edit: ${formData.title}`}
                </h3>
                <button onClick={() => setModalMode(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Preview card */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02]">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{ background: resolveGrad(formData.cardColor || "from-violet-500 to-purple-600") }}
                  >
                    {(() => { const Icon = ICON_MAP[formData.icon || "Heart"] || Heart; return <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: formData.iconColor || "#fff" }} />; })()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{formData.title || "Service Title"}</p>
                    <p className="text-xs text-slate-500 dark:text-white/40 truncate">{formData.shortDescription || "Short description…"}</p>
                    <div className="mt-1">
                      <StatusBadge status={formData.status || "DRAFT"} />
                    </div>
                  </div>
                </div>

                {/* ── Core Fields ──────────────────────────────────────────────── */}
                <FormSection title="Basic Information">
                  <FormRow>
                    <FormField label="Service Name *" error={formErrors.title}>
                      <input value={formData.title || ""} onChange={e => setFormData(p => ({...p, title: e.target.value}))}
                        className={inputCls(!!formErrors.title)} placeholder="e.g. Sunday Worship Service" />
                    </FormField>
                    <FormField label="Service Type">
                      <select value={formData.serviceType || "WORSHIP"} onChange={e => setFormData(p => ({...p, serviceType: e.target.value}))} className={inputCls()}>
                        {["WORSHIP","PRAYER","YOUTH","CHILDREN","WOMEN","MEN","SPECIAL","FASTING","ANOINTING","BIBLE_STUDY"].map(t => (
                          <option key={t} value={t}>{t.replace("_", " ")}</option>
                        ))}
                      </select>
                    </FormField>
                  </FormRow>
                  <FormField label="Short Description">
                    <input value={formData.shortDescription || ""} onChange={e => setFormData(p => ({...p, shortDescription: e.target.value}))}
                      className={inputCls()} placeholder="One-line summary for service cards" maxLength={300} />
                  </FormField>
                  <FormField label="Full Description">
                    <textarea value={formData.description || ""} onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                      className={inputCls() + " resize-none"} rows={3} placeholder="Detailed description…" />
                  </FormField>
                </FormSection>

                {/* ── Schedule ──────────────────────────────────────────────────── */}
                <FormSection title="Schedule">
                  <FormRow>
                    <FormField label="Service Day">
                      <select value={formData.serviceDay || ""} onChange={e => setFormData(p => ({...p, serviceDay: e.target.value}))} className={inputCls()}>
                        <option value="">Select day</option>
                        {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Frequency">
                      <select value={formData.frequency || "WEEKLY"} onChange={e => setFormData(p => ({...p, frequency: e.target.value}))} className={inputCls()}>
                        {["WEEKLY","MONTHLY","DAILY","SPECIAL"].map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </FormField>
                  </FormRow>
                  <FormField label="Occurrence (for Monthly/Special)">
                    <input value={formData.occurrence || ""} onChange={e => setFormData(p => ({...p, occurrence: e.target.value}))}
                      className={inputCls()} placeholder="e.g. Every 4th Sunday, 1st Sunday" />
                  </FormField>
                  <FormRow>
                    <FormField label="Start Time">
                      <input type="time" value={formData.startTime || ""} onChange={e => setFormData(p => ({...p, startTime: e.target.value}))} className={inputCls()} />
                    </FormField>
                    <FormField label="End Time">
                      <input type="time" value={formData.endTime || ""} onChange={e => setFormData(p => ({...p, endTime: e.target.value}))} className={inputCls()} />
                    </FormField>
                  </FormRow>
                </FormSection>

                {/* ── Appearance ─────────────────────────────────────────────────── */}
                <FormSection title="Appearance">
                  <FormField label="Icon">
                    <div className="space-y-3">
                      {[
                        { label: "Spiritual & Worship", start: 0,  count: 14 },
                        { label: "People & Community",  start: 14, count: 7  },
                        { label: "Music & Media",        start: 21, count: 8  },
                        { label: "Schedule & Location",  start: 29, count: 6  },
                        { label: "Misc & Symbolism",     start: 35, count: ICON_OPTIONS.length - 35 },
                      ].map(({ label, start, count }) => (
                        <div key={label}>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mb-2 px-0.5 flex items-center gap-2">
                            <span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                            {label}
                            <span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                          </p>
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-1.5 sm:gap-2">
                            {ICON_OPTIONS.slice(start, start + count).map(({ name, label: iconLabel, icon: Ic, color }) => {
                              const isSelected = formData.icon === name;
                              return (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => setFormData(p => ({...p, icon: name}))}
                                  className={`relative flex flex-col items-center gap-1.5 py-2 px-1 rounded-2xl border-2 transition-all duration-200 ${
                                    isSelected
                                      ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 scale-[1.08] shadow-lg shadow-violet-200/60 dark:shadow-violet-900/40"
                                      : "border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:border-violet-300 dark:hover:border-violet-500/40 hover:scale-105 hover:shadow-md"
                                  }`}
                                  title={iconLabel}
                                >
                                  <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                                    style={{ background: color }}
                                  >
                                    <Ic className="w-5 h-5 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }} />
                                  </div>
                                  <span className={`text-[8px] font-bold leading-none truncate w-full text-center ${
                                    isSelected ? "text-violet-700 dark:text-violet-300" : "text-slate-500 dark:text-white/40"
                                  }`}>{iconLabel}</span>
                                  {isSelected && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-violet-500 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center shadow-sm">
                                      <Check className="w-2.5 h-2.5 text-white" />
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormField>
                  <FormRow>
                    <FormField label="Card Color / Gradient">
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {COLOR_PRESETS.map(p => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setFormData(prev => ({...prev, cardColor: p.value, badgeColor: p.value}))}
                            className={`h-10 rounded-xl border-2 transition-all ${formData.cardColor === p.value ? "border-slate-900 dark:border-white scale-105" : "border-transparent"}`}
                            style={{ background: resolveGrad(p.value) }}
                            title={p.label}
                          />
                        ))}
                      </div>
                    </FormField>
                    <FormField label="Icon Color">
                      <div className="flex items-center gap-3">
                        <input type="color" value={formData.iconColor || "#ffffff"} onChange={e => setFormData(p => ({...p, iconColor: e.target.value}))}
                          className="w-12 h-10 rounded-xl border border-slate-200 dark:border-white/[0.08] cursor-pointer" />
                        <span className="text-sm text-slate-500 dark:text-white/40 font-mono">{formData.iconColor || "#ffffff"}</span>
                      </div>
                    </FormField>
                  </FormRow>

                  {/* Image Upload */}
                  <FormField label="Service Image">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {formData.imageUrl && (
                        <img src={formData.imageUrl} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-white/[0.08] flex-shrink-0" />
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 text-slate-500 dark:text-white/40 text-sm hover:border-violet-400 hover:text-violet-500 transition-colors w-full sm:w-auto"
                      >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? "Uploading…" : "Upload Image"}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      />
                    </div>
                  </FormField>
                </FormSection>

                {/* ── Location & Registration ─────────────────────────────────── */}
                <FormSection title="Location & Registration">
                  <FormRow>
                    <FormField label="Location">
                      <input value={formData.location || ""} onChange={e => setFormData(p => ({...p, location: e.target.value}))}
                        className={inputCls()} placeholder="e.g. Main Hall, Branch Address" />
                    </FormField>
                    <FormField label="Speaker / Pastor">
                      <input value={formData.speakerName || ""} onChange={e => setFormData(p => ({...p, speakerName: e.target.value}))}
                        className={inputCls()} placeholder="Speaker name" />
                    </FormField>
                  </FormRow>
                  <FormRow>
                    <FormField label="Max Capacity">
                      <input type="number" value={formData.capacity || ""} onChange={e => setFormData(p => ({...p, capacity: parseInt(e.target.value) || undefined}))}
                        className={inputCls()} placeholder="Leave blank for unlimited" min={1} />
                    </FormField>
                    <FormField label="Registration">
                      <label className="flex items-center gap-3 pt-2 cursor-pointer">
                        <input type="checkbox" checked={formData.registrationEnabled || false}
                          onChange={e => setFormData(p => ({...p, registrationEnabled: e.target.checked}))}
                          className="w-4 h-4 rounded accent-violet-500" />
                        <span className="text-sm text-slate-700 dark:text-white/70">Require Registration</span>
                      </label>
                    </FormField>
                  </FormRow>
                </FormSection>

                {/* ── Publishing & SEO ───────────────────────────────────────────── */}
                <FormSection title="Publishing & SEO">
                  <FormRow>
                    <FormField label="Status">
                      <select value={formData.status || "DRAFT"} onChange={e => setFormData(p => ({...p, status: e.target.value}))} className={inputCls()}>
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </FormField>
                    <FormField label="Display Order">
                      <input type="number" value={formData.displayOrder ?? 0} onChange={e => setFormData(p => ({...p, displayOrder: parseInt(e.target.value) || 0}))} className={inputCls()} min={0} />
                    </FormField>
                    <FormField label="Language">
                      <select value={formData.language || "en"} onChange={e => setFormData(p => ({...p, language: e.target.value}))} className={inputCls()}>
                        <option value="en">English</option>
                        <option value="te">Telugu</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </FormField>
                  </FormRow>
                  <FormRow>
                    <FormField label="Featured">
                      <label className="flex items-center gap-3 pt-2 cursor-pointer">
                        <input type="checkbox" checked={formData.featured || false}
                          onChange={e => setFormData(p => ({...p, featured: e.target.checked}))}
                          className="w-4 h-4 rounded accent-violet-500" />
                        <span className="text-sm text-slate-700 dark:text-white/70">Mark as Featured</span>
                      </label>
                    </FormField>
                  </FormRow>
                  <FormField label="SEO Title">
                    <input value={formData.seoTitle || ""} onChange={e => setFormData(p => ({...p, seoTitle: e.target.value}))}
                      className={inputCls()} placeholder="SEO page title (optional)" maxLength={255} />
                  </FormField>
                  <FormField label="SEO Description">
                    <textarea value={formData.seoDescription || ""} onChange={e => setFormData(p => ({...p, seoDescription: e.target.value}))}
                      className={inputCls() + " resize-none"} rows={2} placeholder="Meta description (optional)" maxLength={500} />
                  </FormField>
                  <FormField label="Tags">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags?.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-medium">
                          #{tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                      className={inputCls()} placeholder="Type tag and press Enter" />
                  </FormField>
                </FormSection>
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-4 sm:px-6 border-t border-slate-100 dark:border-white/[0.06] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 dark:bg-white/[0.01]">
                <button 
                  onClick={() => setModalMode(null)} 
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60 text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => { setFormData(p => ({...p, status: "DRAFT"})); setTimeout(handleSave, 50); }}
                    disabled={saving || uploading}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/60 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => { setFormData(p => ({...p, status: "PUBLISHED"})); setTimeout(handleSave, 50); }}
                    disabled={saving || uploading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-violet-500/30 disabled:opacity-50 transition-all"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {modalMode === "create" ? "Publish Service" : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════ DELETE CONFIRM ════════════════════════════════════ */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmModal
            title="Delete Service"
            message={`Delete "${deleteTarget.title}"? This action will soft-delete the service (recoverable). Use "Permanent Delete" to remove forever.`}
            icon={<Trash2 className="w-6 h-6 text-red-500" />}
            confirmLabel="Move to Trash"
            confirmClass="bg-red-500 hover:bg-red-600 text-white"
            secondaryLabel="Permanent Delete"
            onConfirm={() => handleDelete(deleteTarget.id, false)}
            onSecondary={() => handleDelete(deleteTarget.id, true)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* ══════════════════════ ARCHIVE CONFIRM ═══════════════════════════════════ */}
      <AnimatePresence>
        {archiveTarget && (
          <ConfirmModal
            title="Archive Service"
            message={`Archive "${archiveTarget.title}"? It will be hidden from the landing page but not deleted.`}
            icon={<Archive className="w-6 h-6 text-orange-500" />}
            confirmLabel="Archive"
            confirmClass="bg-orange-500 hover:bg-orange-600 text-white"
            onConfirm={() => { patchService(archiveTarget.id, "archive"); setArchiveTarget(null); }}
            onCancel={() => setArchiveTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* ══════════════════════ RESTORE CONFIRM ═══════════════════════════════════ */}
      <AnimatePresence>
        {restoreTarget && (
          <ConfirmModal
            title="Restore Service"
            message={`Restore "${restoreTarget.title}"? It will be set back to Draft status.`}
            icon={<RotateCcw className="w-6 h-6 text-blue-500" />}
            confirmLabel="Restore"
            confirmClass="bg-blue-500 hover:bg-blue-600 text-white"
            onConfirm={() => { patchService(restoreTarget.id, "restore"); setRestoreTarget(null); }}
            onCancel={() => setRestoreTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">{label}</span>
      <p className="text-sm text-slate-700 dark:text-white/70 mt-0.5">{value}</p>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-4 pb-2 border-b border-slate-100 dark:border-white/[0.06]">{title}</h4>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 dark:text-white/50">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(error = false): string {
  return `w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-white/[0.04] border ${error ? "border-red-400 ring-2 ring-red-400/20" : "border-slate-200 dark:border-white/[0.08]"} text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors`;
}

interface ConfirmModalProps {
  title: string;
  message: string;
  icon: React.ReactNode;
  confirmLabel: string;
  confirmClass: string;
  secondaryLabel?: string;
  onConfirm: () => void;
  onSecondary?: () => void;
  onCancel: () => void;
}

function ConfirmModal({ title, message, icon, confirmLabel, confirmClass, secondaryLabel, onConfirm, onSecondary, onCancel }: ConfirmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95 }}
        className="bg-white dark:bg-[#0f0f1a] rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-200 dark:border-white/[0.08]"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">{icon}</div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-white/60 mb-8 leading-relaxed">{message}</p>
        <div className="flex flex-wrap gap-3 justify-end">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60 text-sm font-medium hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          {secondaryLabel && onSecondary && (
            <button onClick={onSecondary} className="px-5 py-2.5 rounded-xl bg-red-900 text-red-200 text-sm font-medium hover:bg-red-800 transition-colors">
              {secondaryLabel}
            </button>
          )}
          <button onClick={onConfirm} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
