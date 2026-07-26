"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";
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
  triggerToast: (msg: string, type: "success" | "error") => void;
}

const PURPOSE_COLORS: Record<string, string> = {
  TITHE:    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  OFFERING: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  BUILDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  MISSIONS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  CHARITY:  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  OTHER:    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  GENERAL:  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  YOUTH:    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
};

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  PENDING:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  FAILED:    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  REFUNDED:  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const METHOD_ICON = (method: string) => {
  if (method === "UPI") return <QrCode className="w-3.5 h-3.5 text-emerald-600" />;
  if (method === "RAZORPAY") return <CreditCard className="w-3.5 h-3.5 text-indigo-600" />;
  return <IndianRupee className="w-3.5 h-3.5 text-gray-500" />;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function DonationsView({ triggerToast }: DonationsViewProps) {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Purpose & Status Translator Helpers
  const getPurposeLabel = (p: string) => {
    const map: Record<string, string> = {
      TITHE: t.purposeTithe,
      OFFERING: t.purposeOffering,
      BUILDING: t.purposeBuilding,
      MISSIONS: t.purposeMissions,
      CHARITY: t.purposeCharity,
      OTHER: t.purposeOther,
      GENERAL: t.purposeGeneral,
      YOUTH: t.purposeYouth,
    };
    return map[p] || p;
  };

  const getStatusLabel = (s: string) => {
    const map: Record<string, string> = {
      COMPLETED: t.completedStatus,
      PENDING: t.pendingStatus,
      FAILED: t.failedStatus,
      REFUNDED: t.refundedStatus,
    };
    return map[s] || s;
  };

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;

  const fetchDonations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
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

      const res = await fetch(`/api/admin/donations?${params}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setDonations(data.donations);
        setSummary(data.summary);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (err) {
      console.error("[DonationsView] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterPurpose, filterMethod, filterFrom, filterTo]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  // ── Manual UPI Verify ───────────────────────────────────────────────────────
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
        setDonations(prev => prev.map(d =>
          d.id === donationId
            ? { ...d, status: action === "APPROVE" ? "COMPLETED" : "FAILED" }
            : d
        ));
        triggerToast(
          action === "APPROVE"
            ? t.upiApproveSuccess
            : t.upiRejectSuccess,
          action === "APPROVE" ? "success" : "error"
        );
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      triggerToast(err.message || t.verificationFailed, "error");
    } finally {
      setVerifyingId(null);
    }
  };

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["ID", t.donorHeader, "Email", "Phone", `${t.amountHeader} (₹)`, t.purposeHeader, t.methodHeader, t.statusHeader, t.txRefHeader, t.dateHeader];
    const rows = donations.map(d => [
      d.id,
      d.donorName || t.anonymousDonor,
      d.donorEmail || "",
      d.donorPhone || "",
      d.amount.toFixed(2),
      getPurposeLabel(d.purpose),
      d.paymentMethod,
      getStatusLabel(d.status),
      d.razorpayPaymentId || "",
      new Date(d.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kcm-donations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast(t.csvExportSuccess, "success");
  };

  // ── Filter / Search ─────────────────────────────────────────────────────────
  const filtered = donations.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (d.donorName || "").toLowerCase().includes(q) ||
      (d.donorEmail || "").toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      (d.razorpayPaymentId || "").toLowerCase().includes(q)
    );
  });

  const formatINR = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

  const handlePurgeFake = async () => {
    if (!confirm(t.confirmPurgeFake)) return;
    try {
      setLoading(true);
      const res = await fetch("/api/admin/donations?cleanAllFake=true", { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(data.message || t.purgeFakeSuccess, "success");
        fetchDonations();
      } else {
        triggerToast(data.error || t.purgeFakeError, "error");
      }
    } catch (err) {
      triggerToast(t.purgeFakeError, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">

      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="admin-title text-base sm:text-lg flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-[#6366F1]" />
            {t.donationsAndGiving}
          </h2>
          <p className="admin-subtitle text-xs mt-0.5">{totalCount} {t.recordsRealtime}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchDonations()}
            disabled={loading}
            className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-500 hover:text-[#6366F1] transition-all"
            title={t.refreshData}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handlePurgeFake}
            className="flex-1 sm:flex-none px-3 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-bold rounded-xl transition-all text-center"
            title={t.clearTestRecords}
          >
            {t.clearTestRecords}
          </button>
          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {t.exportCSV}
          </button>
        </div>
      </div>

      {/* ── Summary Cards Grid ── */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            { label: t.totalCollected, value: formatINR(summary.totalCollected), icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: t.pendingAmount,  value: formatINR(summary.pendingAmount),   icon: Clock,      color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: t.upiPayments,    value: String(summary.upiCount),           icon: QrCode,     color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: t.pendingUPI,     value: String(summary.pendingCount),       icon: AlertCircle,color: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-50 dark:bg-rose-900/20" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`admin-card p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 ${bg} border-0`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">{label}</p>
                <p className={`text-base sm:text-lg font-black ${color} truncate`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters Grid ── */}
      <div className="admin-card p-3.5 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          {/* Search */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-1">
            <label className="admin-modal-label text-[11px] font-bold text-gray-600 dark:text-gray-300 block">{t.searchDonationsPlaceholder}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t.searchDonationsPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="admin-input !pl-9 w-full text-xs py-2"
              />
            </div>
          </div>

          {/* Status */}
          <div className="col-span-1 space-y-1">
            <label className="admin-modal-label text-[11px] font-bold text-gray-600 dark:text-gray-300 block">{t.filterStatus}</label>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="admin-select w-full text-xs py-2">
              <option value="">{t.allOptions}</option>
              <option value="COMPLETED">{t.completedStatus}</option>
              <option value="PENDING">{t.pendingStatus}</option>
              <option value="FAILED">{t.failedStatus}</option>
            </select>
          </div>

          {/* Purpose */}
          <div className="col-span-1 space-y-1">
            <label className="admin-modal-label text-[11px] font-bold text-gray-600 dark:text-gray-300 block">{t.filterPurpose}</label>
            <select value={filterPurpose} onChange={e => { setFilterPurpose(e.target.value); setPage(1); }} className="admin-select w-full text-xs py-2">
              <option value="">{t.allOptions}</option>
              {["TITHE","OFFERING","BUILDING","MISSIONS","CHARITY","OTHER","GENERAL","YOUTH"].map(p =>
                <option key={p} value={p}>{getPurposeLabel(p)}</option>
              )}
            </select>
          </div>

          {/* Method */}
          <div className="col-span-1 space-y-1">
            <label className="admin-modal-label text-[11px] font-bold text-gray-600 dark:text-gray-300 block">{t.filterMethod}</label>
            <select value={filterMethod} onChange={e => { setFilterMethod(e.target.value); setPage(1); }} className="admin-select w-full text-xs py-2">
              <option value="">{t.allOptions}</option>
              <option value="UPI">UPI</option>
              <option value="RAZORPAY">Razorpay</option>
              <option value="CASH">Cash</option>
            </select>
          </div>

          {/* Date Range: From & To */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="admin-modal-label text-[11px] font-bold text-gray-600 dark:text-gray-300 block">{t.filterFrom}</label>
              <input type="date" value={filterFrom} onChange={e => { setFilterFrom(e.target.value); setPage(1); }} className="admin-input w-full text-xs py-2 px-2" />
            </div>
            <div className="space-y-1">
              <label className="admin-modal-label text-[11px] font-bold text-gray-600 dark:text-gray-300 block">{t.filterTo}</label>
              <input type="date" value={filterTo} onChange={e => { setFilterTo(e.target.value); setPage(1); }} className="admin-input w-full text-xs py-2 px-2" />
            </div>
          </div>

          {/* Clear Filters */}
          {(filterStatus || filterPurpose || filterMethod || filterFrom || filterTo || search) && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-6 flex justify-end pt-1">
              <button
                onClick={() => { setSearch(""); setFilterStatus(""); setFilterPurpose(""); setFilterMethod(""); setFilterFrom(""); setFilterTo(""); setPage(1); }}
                className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-rose-600 border border-gray-200 dark:border-white/10 rounded-xl transition-all"
              >
                {t.clearFilters}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Records Content ── */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#6366F1] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Receipt className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400">{t.noDonationsFound}</p>
            <p className="text-xs text-gray-400 mt-1">{t.tryAdjustingFilters}</p>
          </div>
        ) : (
          <>
            {/* MOBILE CARD VIEW (xs / sm screens) */}
            <div className="block md:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
              <AnimatePresence>
                {filtered.map((d, idx) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="p-4 space-y-3 hover:bg-indigo-50/20 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Header: Donor & Amount */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                          {d.donorName || t.anonymousDonor}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{d.donorEmail || "—"}</p>
                      </div>
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
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
                        {d.paymentMethod}
                      </span>
                    </div>

                    {/* Footer: Date, UTR & Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-white/[0.05] text-[11px]">
                      <div className="min-w-0">
                        <span className="text-gray-500 dark:text-gray-400 block text-[10px]">
                          {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                        </span>
                        {d.razorpayPaymentId && (
                          <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 truncate block max-w-[140px]">
                            {d.razorpayPaymentId}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`/give/receipt/${d.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#6366F1] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 transition-all"
                          title={t.viewReceipt}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {d.status === "PENDING" && d.paymentMethod === "UPI" && (
                          <>
                            <button
                              onClick={() => handleVerify(d.id, "APPROVE")}
                              disabled={verifyingId === d.id}
                              className="flex items-center gap-1 px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold transition-all"
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

            {/* DESKTOP TABLE VIEW (md screens & above) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.02]">
                    {[t.donorHeader, t.amountHeader, t.purposeHeader, t.methodHeader, t.statusHeader, t.txRefHeader, t.dateHeader, t.actionsHeader].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px] whitespace-nowrap">{h}</th>
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
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-indigo-50/30 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Donor */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white truncate max-w-[140px]">
                              {d.donorName || t.anonymousDonor}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{d.donorEmail || "—"}</p>
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
                          <span className="inline-flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                            {METHOD_ICON(d.paymentMethod)}
                            {d.paymentMethod}
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
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                              title={t.viewReceipt}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {d.status === "PENDING" && d.paymentMethod === "UPI" && (
                              <>
                                <button
                                  onClick={() => handleVerify(d.id, "APPROVE")}
                                  disabled={verifyingId === d.id}
                                  className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                                  title={t.approveBtn}
                                >
                                  {verifyingId === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                  {t.approveBtn}
                                </button>
                                <button
                                  onClick={() => handleVerify(d.id, "REJECT")}
                                  disabled={verifyingId === d.id}
                                  className="flex items-center gap-1 px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t.pageInfo.replace("{page}", String(page)).replace("{totalPages}", String(totalPages)).replace("{totalCount}", String(totalCount))}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 disabled:opacity-30 hover:text-[#6366F1] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{page}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 disabled:opacity-30 hover:text-[#6366F1] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
