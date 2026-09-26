"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";
import { getSharedSocket } from "@/lib/socketClient";
import {
  IndianRupee,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Loader2,
  Receipt,
  QrCode,
  CreditCard,
  TrendingUp,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Sparkles,
  Banknote,
  Building2,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Donation {
  id: string;
  donorName: string | null;
  donorEmail: string | null;
  donorPhone: string | null;
  amount: number;
  purpose: string;
  paymentMethod: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  createdAt: string;
}

interface Summary {
  totalCollected: number;
  pendingAmount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  upiCount: number;
  razorpayCount: number;
}

interface DonationsViewProps {
  triggerToast?: (msg: string, type: "success" | "error") => void;
}

const PURPOSE_COLORS: Record<string, string> = {
  TITHE:    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40",
  OFFERING: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40",
  BUILDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40",
  MISSIONS: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40",
  CHARITY:  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40",
  OTHER:    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
  GENERAL:  "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40",
  YOUTH:    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40",
};

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40",
  PENDING:   "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40",
  FAILED:    "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40",
  REFUNDED:  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
};

const METHOD_ICON = (method: string) => {
  const m = (method || "").toUpperCase();
  if (m === "UPI") return <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
  if (m === "RAZORPAY" || m === "STRIPE") return <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />;
  if (m === "BANK" || m === "BANK_TRANSFER") return <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
  if (m === "CASH") return <Banknote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
  return <IndianRupee className="w-3.5 h-3.5 text-gray-500 shrink-0" />;
};

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

// ─── Component ────────────────────────────────────────────────────────────────
export default function DonationsView({ triggerToast: propTriggerToast }: DonationsViewProps) {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  // Local Toast fallback if parent does not provide one
  const [localToast, setLocalToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    if (propTriggerToast) {
      propTriggerToast(msg, type);
    }
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setLocalToast({ msg, type });
    toastTimeoutRef.current = setTimeout(() => setLocalToast(null), 4000);
  }, [propTriggerToast]);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isSocketLive, setIsSocketLive] = useState(false);

  // Filters state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;

  // Manual Record Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [submittingRecord, setSubmittingRecord] = useState(false);
  const [recordForm, setRecordForm] = useState({
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    amount: "",
    purpose: "TITHE",
    paymentMethod: "CASH",
    razorpayPaymentId: "",
  });

  // Purpose & Status Translator Helpers
  const getPurposeLabel = (p: string) => {
    const key = (p || "").toUpperCase();
    const map: Record<string, string> = {
      TITHE: t.purposeTithe || "TITHE",
      OFFERING: t.purposeOffering || "OFFERING",
      BUILDING: t.purposeBuilding || "BUILDING",
      MISSIONS: t.purposeMissions || "MISSIONS",
      CHARITY: t.purposeCharity || "CHARITY",
      OTHER: t.purposeOther || "OTHER",
      GENERAL: t.purposeGeneral || "GENERAL",
      YOUTH: t.purposeYouth || "YOUTH",
    };
    return map[key] || p;
  };

  const getStatusLabel = (s: string) => {
    const key = (s || "").toUpperCase();
    const map: Record<string, string> = {
      COMPLETED: t.completedStatus || "Completed",
      PENDING: t.pendingStatus || "Pending",
      FAILED: t.failedStatus || "Failed",
      REFUNDED: t.refundedStatus || "Refunded",
    };
    return map[key] || s;
  };

  const getMethodLabel = (m: string) => {
    const key = (m || "").toUpperCase();
    if (key === "CASH") return t.methodCash || "Cash";
    if (key === "UPI") return t.methodUPI || "UPI";
    if (key === "RAZORPAY") return t.methodRazorpay || "Razorpay";
    if (key === "BANK" || key === "BANK_TRANSFER") return t.methodBank || "Bank Transfer";
    if (key === "CHEQUE") return t.methodCheque || "Cheque";
    return m;
  };

  // ─── Fetch Donations Data ───────────────────────────────────────────────────
  const fetchDonations = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setIsSyncing(true);
    }

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (filterStatus)  params.set("status", filterStatus);
      if (filterPurpose) params.set("purpose", filterPurpose);
      if (filterMethod)  params.set("method", filterMethod);
      if (filterFrom)    params.set("from", filterFrom);
      if (filterTo)      params.set("to", filterTo);

      const res = await fetch(`/api/admin/donations?${params}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDonations(data.donations || []);
        setSummary(data.summary || null);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalCount || 0);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error("[DonationsView] fetch error:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [page, filterStatus, filterPurpose, filterMethod, filterFrom, filterTo]);

  // Initial fetch on filter / page change
  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // ─── Real-Time WebSocket & Auto-Sync Workflow ───────────────────────────────
  useEffect(() => {
    let isMounted = true;
    let socketRef: any = null;

    async function initRealTimeSocket() {
      try {
        const socket = await getSharedSocket();
        if (!socket || !isMounted) return;
        socketRef = socket;

        setIsSocketLive(socket.connected);

        socket.on("connect", () => {
          if (isMounted) setIsSocketLive(true);
        });

        socket.on("disconnect", () => {
          if (isMounted) setIsSocketLive(false);
        });

        // Real-time Event: New Donation Received
        const handleNewDonation = (newDonation: any) => {
          if (!isMounted) return;
          fetchDonations(true);
          const donor = newDonation?.donorName || t.anonymousDonor || "Member";
          const amt = Number(newDonation?.amount || 0);
          showToast(`⚡ New Giving: ₹${amt.toLocaleString("en-IN")} from ${donor}`, "success");
        };

        // Real-time Event: Donation Status Change / Verification
        const handleDonationUpdate = (updatedDonation: any) => {
          if (!isMounted) return;
          setDonations((prev) =>
            prev.map((d) => (d.id === updatedDonation?.id ? { ...d, ...updatedDonation } : d))
          );
          fetchDonations(true);
        };

        socket.on("donation:new", handleNewDonation);
        socket.on("donation_received", handleNewDonation);
        socket.on("donation:created", handleNewDonation);
        socket.on("donation:updated", handleDonationUpdate);
        socket.on("donation:verified", handleDonationUpdate);
        socket.on("donation:deleted", () => fetchDonations(true));
        socket.on("donations:refresh", () => fetchDonations(true));
      } catch (e) {
        console.warn("[DonationsView] WebSocket init skipped:", e);
      }
    }

    initRealTimeSocket();

    // Proactive auto-polling fallback (every 10 seconds)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchDonations(true);
      }
    }, 10000);

    // Instant sync when pastor refocuses window
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDonations(true);
      }
    };
    const handleFocus = () => fetchDonations(true);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      if (socketRef) {
        socketRef.off("donation:new");
        socketRef.off("donation_received");
        socketRef.off("donation:created");
        socketRef.off("donation:updated");
        socketRef.off("donation:verified");
        socketRef.off("donation:deleted");
        socketRef.off("donations:refresh");
      }
    };
  }, [fetchDonations, showToast, t.anonymousDonor]);

  // ─── Manual UPI Verification ────────────────────────────────────────────────
  const handleVerify = async (donationId: string, action: "APPROVE" | "REJECT") => {
    setVerifyingId(donationId);
    try {
      const res = await fetch("/api/admin/donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId, action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDonations((prev) =>
          prev.map((d) =>
            d.id === donationId
              ? { ...d, status: action === "APPROVE" ? "COMPLETED" : "FAILED" }
              : d
          )
        );
        showToast(
          action === "APPROVE" ? t.upiApproveSuccess : t.upiRejectSuccess,
          action === "APPROVE" ? "success" : "error"
        );
        fetchDonations(true);
      } else {
        throw new Error(data.error || "Action failed");
      }
    } catch (err: any) {
      showToast(err.message || t.verificationFailed, "error");
    } finally {
      setVerifyingId(null);
    }
  };

  // ─── Manual Giving Entry Submission ─────────────────────────────────────────
  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(recordForm.amount);
    if (isNaN(amt) || amt <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    setSubmittingRecord(true);
    try {
      const res = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: recordForm.donorName.trim() || "Anonymous Giver",
          donorPhone: recordForm.donorPhone.trim() || null,
          donorEmail: recordForm.donorEmail.trim() || null,
          amount: amt,
          purpose: recordForm.purpose,
          paymentMethod: recordForm.paymentMethod,
          razorpayPaymentId: recordForm.razorpayPaymentId.trim() || null,
          status: "COMPLETED",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(t.recordSuccess || "Giving record logged successfully!", "success");
        setIsRecordModalOpen(false);
        setRecordForm({
          donorName: "",
          donorPhone: "",
          donorEmail: "",
          amount: "",
          purpose: "TITHE",
          paymentMethod: "CASH",
          razorpayPaymentId: "",
        });
        fetchDonations(true);
      } else {
        throw new Error(data.error || "Failed to record donation");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to record giving", "error");
    } finally {
      setSubmittingRecord(false);
    }
  };

  // ─── CSV Export ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = [
      "ID",
      t.donorHeader,
      "Email",
      "Phone",
      `${t.amountHeader} (₹)`,
      t.purposeHeader,
      t.methodHeader,
      t.statusHeader,
      t.txRefHeader,
      t.dateHeader,
    ];
    const rows = donations.map((d) => [
      d.id,
      d.donorName || t.anonymousDonor,
      d.donorEmail || "",
      d.donorPhone || "",
      d.amount.toFixed(2),
      getPurposeLabel(d.purpose),
      getMethodLabel(d.paymentMethod),
      getStatusLabel(d.status),
      d.razorpayPaymentId || "",
      new Date(d.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kcm-giving-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t.csvExportSuccess, "success");
  };

  // ─── Filter & Search Logic ──────────────────────────────────────────────────
  const filtered = donations.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (d.donorName || "").toLowerCase().includes(q) ||
      (d.donorEmail || "").toLowerCase().includes(q) ||
      (d.donorPhone || "").toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      (d.razorpayPaymentId || "").toLowerCase().includes(q)
    );
  });

  const hasActiveFilters = Boolean(filterStatus || filterPurpose || filterMethod || filterFrom || filterTo || search);
  const activeFilterCount = [filterStatus, filterPurpose, filterMethod, filterFrom, filterTo, search].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearch("");
    setFilterStatus("");
    setFilterPurpose("");
    setFilterMethod("");
    setFilterFrom("");
    setFilterTo("");
    setPage(1);
  };

  const handleQuickFilterPending = () => {
    setFilterStatus("PENDING");
    setFilterMethod("UPI");
    setPage(1);
  };

  const formatINR = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

  const handlePurgeFake = async () => {
    if (!confirm(t.confirmPurgeFake)) return;
    try {
      setLoading(true);
      const res = await fetch("/api/admin/donations?cleanAllFake=true", { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || t.purgeFakeSuccess, "success");
        fetchDonations();
      } else {
        showToast(data.error || t.purgeFakeError, "error");
      }
    } catch (err) {
      showToast(t.purgeFakeError, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* ── Local Floating Toast Notification ── */}
      <AnimatePresence>
        {localToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 max-w-sm text-xs font-semibold backdrop-blur-md ${
              localToast.type === "success"
                ? "bg-emerald-500/90 text-white border-emerald-400"
                : "bg-rose-500/90 text-white border-rose-400"
            }`}
          >
            {localToast.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="flex-1">{localToast.msg}</span>
            <button onClick={() => setLocalToast(null)} className="opacity-70 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Bar: Title, Live Pulse & Quick Action Buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-white/[0.03] p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {t.donationsAndGiving}
            </h2>
            {/* Live Indicator Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isSocketLive ? "Live Real-Time" : t.liveRealtimeSync || "Live Sync"}
              {isSyncing && <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-500 ml-0.5" />}
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {totalCount} {t.recordsRealtime || "records • Real-time from database"}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Record Giving Button */}
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.recordGiving || "Record Giving"}
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchDonations()}
            disabled={loading || isSyncing}
            className="p-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-all active:scale-95 shrink-0"
            title={t.refreshData || "Refresh"}
          >
            <RefreshCw className={`w-4 h-4 ${loading || isSyncing ? "animate-spin text-indigo-600" : ""}`} />
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.exportCSV}</span>
            <span className="sm:hidden">CSV</span>
          </button>

          {/* Clear Test Records */}
          <button
            onClick={handlePurgeFake}
            className="px-2.5 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 text-xs font-bold rounded-xl transition-all active:scale-95"
            title={t.clearTestRecords}
          >
            {t.clearTestRecords || "Clear Test"}
          </button>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            {
              label: t.totalCollected,
              value: formatINR(summary.totalCollected),
              sub: `${summary.completedCount} transactions`,
              icon: TrendingUp,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30",
              action: null,
            },
            {
              label: t.pendingAmount,
              value: formatINR(summary.pendingAmount),
              sub: `${summary.pendingCount} awaiting approval`,
              icon: Clock,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50/80 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30",
              action: handleQuickFilterPending,
            },
            {
              label: t.upiPayments,
              value: String(summary.upiCount),
              sub: "Direct UPI Collections",
              icon: QrCode,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50/80 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30",
              action: () => { setFilterMethod("UPI"); setPage(1); },
            },
            {
              label: t.pendingUPI,
              value: String(summary.pendingCount),
              sub: "Requires pastor action",
              icon: AlertCircle,
              color: summary.pendingCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-gray-500",
              bg: summary.pendingCount > 0 ? "bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40" : "bg-gray-50/60 dark:bg-white/[0.02] border-gray-100 dark:border-white/5",
              action: handleQuickFilterPending,
            },
          ].map(({ label, value, sub, icon: Icon, color, bg, action }) => (
            <div
              key={label}
              onClick={action || undefined}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${bg} ${action ? "cursor-pointer hover:shadow-md hover:scale-[1.01]" : ""}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                  {label}
                </span>
                <div className="w-7 h-7 rounded-xl bg-white/70 dark:bg-white/10 flex items-center justify-center shrink-0 shadow-xs">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
              </div>
              <p className={`text-base sm:text-xl font-black ${color} truncate`}>{value}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Responsive Search & Filter Bar ── */}
      <div className="bg-white dark:bg-white/[0.03] p-3.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-sm space-y-3">
        {/* Search Row + Mobile Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t.searchDonationsPlaceholder || "Search name, email, UTR..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              showMobileFilters || hasActiveFilters
                ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800"
                : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{t.filterToggle || "Filters"}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Selects: Responsive Grid (Always visible on sm+, Collapsible on mobile) */}
        <div className={`${showMobileFilters ? "grid" : "hidden sm:grid"} grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 sm:pt-0`}>
          {/* Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              {t.filterStatus || "Status"}
            </label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="">{t.allOptions || "All Statuses"}</option>
              <option value="COMPLETED">{t.completedStatus || "Completed"}</option>
              <option value="PENDING">{t.pendingStatus || "Pending"}</option>
              <option value="FAILED">{t.failedStatus || "Failed"}</option>
            </select>
          </div>

          {/* Purpose */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              {t.filterPurpose || "Purpose"}
            </label>
            <select
              value={filterPurpose}
              onChange={(e) => { setFilterPurpose(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="">{t.allOptions || "All Purposes"}</option>
              {["TITHE", "OFFERING", "BUILDING", "MISSIONS", "CHARITY", "OTHER", "GENERAL", "YOUTH"].map((p) => (
                <option key={p} value={p}>{getPurposeLabel(p)}</option>
              ))}
            </select>
          </div>

          {/* Method */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              {t.filterMethod || "Method"}
            </label>
            <select
              value={filterMethod}
              onChange={(e) => { setFilterMethod(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="">{t.allOptions || "All Methods"}</option>
              <option value="UPI">UPI</option>
              <option value="CASH">{t.methodCash || "Cash"}</option>
              <option value="RAZORPAY">Razorpay</option>
              <option value="BANK_TRANSFER">{t.methodBank || "Bank Transfer"}</option>
            </select>
          </div>

          {/* Date Range Group */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              {t.dateHeader || "Date Range"}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }}
                className="w-full px-1.5 py-1 text-[11px] rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden"
                placeholder="From"
              />
              <input
                type="date"
                value={filterTo}
                onChange={(e) => { setFilterTo(e.target.value); setPage(1); }}
                className="w-full px-1.5 py-1 text-[11px] rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden"
                placeholder="To"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Row */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-white/5 text-xs">
            <span className="text-gray-500 dark:text-gray-400 text-[11px]">
              Active filters applied ({activeFilterCount})
            </span>
            <button
              onClick={clearAllFilters}
              className="px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
            >
              {t.clearFilters || "Clear Filters"}
            </button>
          </div>
        )}
      </div>

      {/* ── Main Records Content ── */}
      <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Loading ledger records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{t.noDonationsFound}</p>
            <p className="text-xs text-gray-400 mt-1">{t.tryAdjustingFilters}</p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-3 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-all"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── MOBILE CARD VIEW (xs / sm screens) ── */}
            <div className="block md:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
              <AnimatePresence>
                {filtered.map((d, idx) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.015 }}
                    className="p-3.5 sm:p-4 space-y-2.5 hover:bg-indigo-50/20 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Header: Donor & Amount */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                          {d.donorName || t.anonymousDonor}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {d.donorPhone || d.donorEmail || "No contact"}
                        </p>
                      </div>
                      <span className="font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400 shrink-0">
                        ₹{d.amount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Badges: Purpose, Status, Method */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${PURPOSE_COLORS[d.purpose] || PURPOSE_COLORS.OTHER}`}>
                        {getPurposeLabel(d.purpose)}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[d.status] || STATUS_STYLES.FAILED}`}>
                        {getStatusLabel(d.status)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                        {METHOD_ICON(d.paymentMethod)}
                        {getMethodLabel(d.paymentMethod)}
                      </span>
                    </div>

                    {/* Footer: Date, UTR & Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-white/[0.05] text-[11px]">
                      <div className="min-w-0 flex-1">
                        <span className="text-gray-500 dark:text-gray-400 block text-[10px]">
                          {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                        </span>
                        {d.razorpayPaymentId && (
                          <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 truncate block max-w-[150px]">
                            {d.razorpayPaymentId}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`/give/receipt/${d.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 transition-all"
                          title={t.viewReceipt}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {d.status === "PENDING" && d.paymentMethod === "UPI" && (
                          <>
                            <button
                              onClick={() => handleVerify(d.id, "APPROVE")}
                              disabled={verifyingId === d.id}
                              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs"
                            >
                              {verifyingId === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                              {t.approveBtn}
                            </button>
                            <button
                              onClick={() => handleVerify(d.id, "REJECT")}
                              disabled={verifyingId === d.id}
                              className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-all"
                            >
                              <XCircle className="w-3 h-3" />
                              {t.rejectBtn}
                            </button>
                          </>
                        )}
                      </div>
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
                    {[t.donorHeader, t.amountHeader, t.purposeHeader, t.methodHeader, t.statusHeader, t.txRefHeader, t.dateHeader, t.actionsHeader].map((h) => (
                      <th key={h} className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  <AnimatePresence>
                    {filtered.map((d, idx) => (
                      <motion.tr
                        key={d.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.015 }}
                        className="hover:bg-indigo-50/30 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Donor */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                              {d.donorName || t.anonymousDonor}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[150px]">
                              {d.donorPhone || d.donorEmail || "—"}
                            </p>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 font-black text-gray-900 dark:text-white whitespace-nowrap">
                          ₹{d.amount.toLocaleString("en-IN")}
                        </td>

                        {/* Purpose */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${PURPOSE_COLORS[d.purpose] || PURPOSE_COLORS.OTHER}`}>
                            {getPurposeLabel(d.purpose)}
                          </span>
                        </td>

                        {/* Method */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
                            {METHOD_ICON(d.paymentMethod)}
                            {getMethodLabel(d.paymentMethod)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[d.status] || STATUS_STYLES.FAILED}`}>
                            {getStatusLabel(d.status)}
                          </span>
                        </td>

                        {/* Tx Ref */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] text-indigo-700 dark:text-indigo-300 truncate max-w-[120px] block">
                            {d.razorpayPaymentId || "—"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`/give/receipt/${d.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                              title={t.viewReceipt}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {d.status === "PENDING" && d.paymentMethod === "UPI" && (
                              <>
                                <button
                                  onClick={() => handleVerify(d.id, "APPROVE")}
                                  disabled={verifyingId === d.id}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                                  title={t.approveBtn}
                                >
                                  {verifyingId === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                  {t.approveBtn}
                                </button>
                                <button
                                  onClick={() => handleVerify(d.id, "REJECT")}
                                  disabled={verifyingId === d.id}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                                  title={t.rejectBtn}
                                >
                                  <XCircle className="w-3 h-3" />
                                  {t.rejectBtn}
                                </button>
                              </>
                            )}
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

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left pt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t.pageInfo
              ?.replace("{page}", String(page))
              ?.replace("{totalPages}", String(totalPages))
              ?.replace("{totalCount}", String(totalCount)) ||
              `Page ${page} of ${totalPages} • ${totalCount} records`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 disabled:opacity-30 hover:text-indigo-600 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 px-2">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 disabled:opacity-30 hover:text-indigo-600 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: Record Offline / Sunday Giving ── */}
      <AnimatePresence>
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-[#11131a] rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {t.recordGiving || "Record Giving"}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {t.recordGivingSubtitle || "Log offline Sunday cash, tithe, or bank transfer contributions"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRecordModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleRecordSubmit} className="p-4 sm:p-5 space-y-4">
                {/* Donor Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t.donorName || "Donor / Member Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Reddy"
                      value={recordForm.donorName}
                      onChange={(e) => setRecordForm({ ...recordForm, donorName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t.donorPhone || "Phone Number"}
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={recordForm.donorPhone}
                      onChange={(e) => setRecordForm({ ...recordForm, donorPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>

                {/* Amount with Quick Chips */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t.amountINR || "Amount (₹)"} *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="e.g. 2000"
                      value={recordForm.amount}
                      onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm font-bold rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                  {/* Quick Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRecordForm({ ...recordForm, amount: String(amt) })}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                          recordForm.amount === String(amt)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-indigo-300"
                        }`}
                      >
                        ₹{amt.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose & Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t.givingPurpose || "Giving Purpose"} *
                    </label>
                    <select
                      value={recordForm.purpose}
                      onChange={(e) => setRecordForm({ ...recordForm, purpose: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <option value="TITHE">{getPurposeLabel("TITHE")}</option>
                      <option value="OFFERING">{getPurposeLabel("OFFERING")}</option>
                      <option value="BUILDING">{getPurposeLabel("BUILDING")}</option>
                      <option value="MISSIONS">{getPurposeLabel("MISSIONS")}</option>
                      <option value="CHARITY">{getPurposeLabel("CHARITY")}</option>
                      <option value="YOUTH">{getPurposeLabel("YOUTH")}</option>
                      <option value="GENERAL">{getPurposeLabel("GENERAL")}</option>
                      <option value="OTHER">{getPurposeLabel("OTHER")}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t.paymentMethod || "Payment Mode"} *
                    </label>
                    <select
                      value={recordForm.paymentMethod}
                      onChange={(e) => setRecordForm({ ...recordForm, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <option value="CASH">{t.methodCash || "Cash"}</option>
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">{t.methodBank || "Bank Transfer"}</option>
                      <option value="CHEQUE">{t.methodCheque || "Cheque"}</option>
                    </select>
                  </div>
                </div>

                {/* Reference / Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t.notesReference || "Transaction Ref / Notes (Optional)"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunday Morning Service / Cheque #1042"
                    value={recordForm.razorpayPaymentId}
                    onChange={(e) => setRecordForm({ ...recordForm, razorpayPaymentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
                  >
                    {t.cancelBtn || "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRecord}
                    className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    {submittingRecord ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {t.savingRecord || "Recording..."}
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        {t.saveRecord || "Record Contribution"}
                      </>
                    )}
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
