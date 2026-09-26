"use client";

import React, { useState, useEffect, useCallback } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";
import {
  UserCheck,
  Users,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Filter,
  Loader2,
  Sparkles,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Music,
  Tv,
  BookOpen,
  HeartHandshake,
  Shield,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VolunteerItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  ministry: string;
  status: "Pending" | "Approved" | "Active" | "Rejected";
  appliedAt: string;
  createdAt?: string;
}

const MINISTRY_OPTIONS = [
  "Choir & Worship",
  "Ushering & Hospitality",
  "Media, Sound & AV",
  "Sunday School & Children",
  "Community Outreach & Missions",
  "Men's Ministry",
  "Women's Ministry",
  "Youth Ministry",
  "Prayer Intercession",
];

const MINISTRY_ICON = (ministry: string) => {
  const m = (ministry || "").toLowerCase();
  if (m.includes("choir") || m.includes("worship")) return <Music className="w-3.5 h-3.5 text-violet-500 shrink-0" />;
  if (m.includes("media") || m.includes("sound") || m.includes("av")) return <Tv className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
  if (m.includes("sunday") || m.includes("children")) return <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
  if (m.includes("outreach") || m.includes("missions")) return <HeartHandshake className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
  if (m.includes("usher")) return <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
  return <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
};

export default function PastorVolunteersPage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMinistry, setSelectedMinistry] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState({
    name: "",
    email: "",
    phone: "",
    ministry: "Choir & Worship",
    status: "Pending" as "Pending" | "Approved" | "Active",
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch real volunteers from API
  const fetchVolunteers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch("/api/pastor/volunteers", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.success) {
        setVolunteers(data.volunteers || []);
      }
    } catch (err) {
      console.error("Failed to load volunteers:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  // Handle Approve / Status Change
  const handleUpdateStatus = async (id: string, newStatus: "Approved" | "Rejected" | "Pending" | "Active") => {
    try {
      const res = await fetch("/api/pastor/volunteers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVolunteers((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
        );
        showToast(
          newStatus === "Approved"
            ? (t.volunteerApprovedSuccess || "Volunteer approved successfully!")
            : `Volunteer status updated to ${newStatus}`,
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to update volunteer");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  // Handle Delete Volunteer
  const handleDeleteVolunteer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this volunteer?")) return;
    try {
      const res = await fetch(`/api/pastor/volunteers?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVolunteers((prev) => prev.filter((v) => v.id !== id));
        showToast(t.volunteerDeletedSuccess || "Volunteer removed successfully", "success");
      } else {
        throw new Error(data.error || "Failed to delete");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete volunteer", "error");
    }
  };

  // Handle Purge Fake/Test Records
  const handlePurgeFake = async () => {
    if (!confirm("Are you sure you want to remove all test and fake volunteer records?")) return;
    try {
      setLoading(true);
      const res = await fetch("/api/pastor/volunteers?cleanAllFake=true", { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Fake volunteer records removed successfully!", "success");
        fetchVolunteers();
      } else {
        showToast(data.error || "Failed to remove test records", "error");
      }
    } catch (err) {
      showToast("Error purging test records", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Create Volunteer
  const handleCreateVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVolunteer.name.trim() || !newVolunteer.ministry) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pastor/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newVolunteer.name.trim(),
          email: newVolunteer.email.trim(),
          phone: newVolunteer.phone.trim() || null,
          ministry: newVolunteer.ministry,
          status: newVolunteer.status,
          appliedAt: new Date().toISOString().slice(0, 10),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVolunteers((prev) => [data.volunteer, ...prev]);
        showToast(t.volunteerRegisteredSuccess || "Volunteer registered successfully!", "success");
        setIsModalOpen(false);
        setNewVolunteer({
          name: "",
          email: "",
          phone: "",
          ministry: "Choir & Worship",
          status: "Pending",
        });
      } else {
        throw new Error(data.error || "Failed to register volunteer");
      }
    } catch (err: any) {
      showToast(err.message || "Error registering volunteer", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Volunteers
  const filteredVolunteers = volunteers.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      v.name.toLowerCase().includes(q) ||
      (v.email || "").toLowerCase().includes(q) ||
      (v.phone || "").toLowerCase().includes(q) ||
      v.ministry.toLowerCase().includes(q);

    const matchesMinistry = selectedMinistry === "ALL" || v.ministry === selectedMinistry;
    const matchesStatus = selectedStatus === "ALL" || v.status.toUpperCase() === selectedStatus.toUpperCase();

    return matchesSearch && matchesMinistry && matchesStatus;
  });

  const activeCount = volunteers.filter((v) => v.status === "Approved" || v.status === "Active").length;
  const pendingCount = volunteers.filter((v) => v.status === "Pending").length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 max-w-sm text-xs font-semibold backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-500/90 text-white border-emerald-400"
                : "bg-rose-500/90 text-white border-rose-400"
            }`}
          >
            {toast.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1">{toast.msg}</span>
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <PastorPageHeader
        title={t.volunteersTitle || "Ministry Volunteer Roster & Applications"}
        subtitle={t.volunteersSubtitle || "Manage volunteer signups for Ushering, Choir, Sound & AV, Sunday School, and Community Outreach"}
        badge={`${activeCount} ${t.activeBadge || "Active"}`}
        primaryActionLabel={t.addVolunteerBtn || "Add Volunteer"}
        onPrimaryAction={() => setIsModalOpen(true)}
        onRefresh={() => fetchVolunteers(true)}
      />

      {/* Quick KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-white/[0.03] p-3.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Applications
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">{volunteers.length}</p>
        </div>

        <div className="bg-white dark:bg-white/[0.03] p-3.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Active Serving
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-white/[0.03] p-3.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-white/[0.03] p-3.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search volunteer name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Ministry Filter */}
          <div>
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="ALL">All Ministry Departments</option>
              {MINISTRY_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="ACTIVE">Active</option>
            </select>

            <button
              onClick={handlePurgeFake}
              className="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl hover:bg-rose-100 transition-all shrink-0"
              title={t.clearFakeVolunteers || "Clear Test Records"}
            >
              {t.clearFakeVolunteers || "Clear Test"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Loading volunteer applications...</p>
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="text-center py-20 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {t.noVolunteersFound || "No volunteer applications found"}
              </p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                {t.noVolunteersSubtitle || "New signups for choir, ushering, and technical departments will appear here in real time."}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.addVolunteerBtn || "Add Volunteer"}
            </button>
          </div>
        ) : (
          <>
            {/* ── MOBILE CARD VIEW (xs / sm screens) ── */}
            <div className="block md:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
              <AnimatePresence>
                {filteredVolunteers.map((vol, idx) => (
                  <motion.div
                    key={vol.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="p-4 space-y-3 hover:bg-indigo-50/20 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Header: Name & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {vol.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{vol.name}</h4>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                            Applied: {vol.appliedAt}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          vol.status === "Approved" || vol.status === "Active"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                            : vol.status === "Rejected"
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                        }`}
                      >
                        {vol.status}
                      </span>
                    </div>

                    {/* Ministry Tag */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-2 rounded-xl border border-gray-100 dark:border-white/5">
                      {MINISTRY_ICON(vol.ministry)}
                      <span className="font-semibold text-[11px] truncate">{vol.ministry}</span>
                    </div>

                    {/* Contact Links */}
                    <div className="flex items-center gap-3 text-[11px] text-gray-600 dark:text-gray-300 flex-wrap">
                      {vol.email && (
                        <a
                          href={`mailto:${vol.email}`}
                          className="inline-flex items-center gap-1 hover:text-indigo-600 truncate max-w-[180px]"
                        >
                          <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{vol.email}</span>
                        </a>
                      )}
                      {vol.phone && (
                        <a
                          href={`tel:${vol.phone}`}
                          className="inline-flex items-center gap-1 hover:text-indigo-600 shrink-0"
                        >
                          <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{vol.phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
                      {vol.status === "Pending" && (
                        <button
                          onClick={() => handleUpdateStatus(vol.id, "Approved")}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t.approveBtn || "Approve"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteVolunteer(vol.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                        title="Remove volunteer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── DESKTOP TABLE VIEW (md screens & above) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/75 dark:bg-white/[0.02]">
                    <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                      {t.volunteerNameHeader || "Volunteer"}
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                      {t.ministryAreaHeader || "Ministry Area"}
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                      {t.appliedDateHeader || "Applied Date"}
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                      {t.statusHeader || "Status"}
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px] text-right">
                      {t.actionsHeader || "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  <AnimatePresence>
                    {filteredVolunteers.map((vol, idx) => (
                      <motion.tr
                        key={vol.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-indigo-50/30 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Volunteer Name & Info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                              {vol.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white truncate max-w-[160px]">{vol.name}</p>
                              <p className="text-[10px] text-gray-400 truncate max-w-[160px]">
                                {vol.email || vol.phone || "No contact info"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Ministry */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
                            {MINISTRY_ICON(vol.ministry)}
                            {vol.ministry}
                          </span>
                        </td>

                        {/* Applied Date */}
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {vol.appliedAt}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              vol.status === "Approved" || vol.status === "Active"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                                : vol.status === "Rejected"
                                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40"
                                : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                            }`}
                          >
                            {vol.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {vol.status === "Pending" && (
                              <button
                                onClick={() => handleUpdateStatus(vol.id, "Approved")}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs"
                              >
                                {t.approveBtn || "Approve"}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteVolunteer(vol.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Modal: Register New Volunteer ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-[#11131a] rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {t.registerVolunteerModalTitle || "Register New Ministry Volunteer"}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {t.registerVolunteerModalSubtitle || "Add a church member to serve in a ministry department"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateVolunteer} className="p-4 sm:p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t.volunteerNameLabel || "Volunteer Full Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Solomon"
                    value={newVolunteer.name}
                    onChange={(e) => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t.volunteerEmailLabel || "Email Address"}
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. david@gmail.com"
                      value={newVolunteer.email}
                      onChange={(e) => setNewVolunteer({ ...newVolunteer, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t.volunteerPhoneLabel || "Phone Number"}
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={newVolunteer.phone}
                      onChange={(e) => setNewVolunteer({ ...newVolunteer, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t.volunteerMinistryLabel || "Ministry Department"} *
                  </label>
                  <select
                    value={newVolunteer.ministry}
                    onChange={(e) => setNewVolunteer({ ...newVolunteer, ministry: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {MINISTRY_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t.statusHeader || "Initial Status"}
                  </label>
                  <select
                    value={newVolunteer.status}
                    onChange={(e) => setNewVolunteer({ ...newVolunteer, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="Pending">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Active">Active</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
                  >
                    {t.cancelBtn || "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{t.saveRecord || "Register Volunteer"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
