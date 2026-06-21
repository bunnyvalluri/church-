"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

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
            ? "✅ UPI donation approved & marked COMPLETED"
            : "❌ UPI donation rejected & marked FAILED",
          action === "APPROVE" ? "success" : "error"
        );
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      triggerToast(err.message || "Verification failed", "error");
    } finally {
      setVerifyingId(null);
    }
  };

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["ID", "Donor", "Email", "Phone", "Amount (₹)", "Purpose", "Method", "Status", "Tx Ref", "Date"];
    const rows = donations.map(d => [
      d.id,
      d.donorName || "Anonymous",
      d.donorEmail || "",
      d.donorPhone || "",
      d.amount.toFixed(2),
      d.purpose,
      d.paymentMethod,
      d.status,
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
    triggerToast("CSV export downloaded", "success");
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="admin-title text-base flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-[#6366F1]" />
            Donations & Giving
          </h2>
          <p className="admin-subtitle mt-0.5">{totalCount} records • Real-time from database</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDonations()}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-500 hover:text-[#6366F1] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Collected", value: formatINR(summary.totalCollected), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "Pending Amount", value: formatINR(summary.pendingAmount), icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: "UPI Payments",   value: String(summary.upiCount),         icon: QrCode,   color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Pending UPI",    value: String(summary.pendingCount),      icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`admin-card p-4 flex items-center gap-3 ${bg} border-0`}>
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <p className={`text-lg font-black ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="admin-card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, UTR..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-input pl-8 w-full text-xs"
            />
          </div>
          {/* Status */}
          <div className="min-w-[120px]">
            <label className="admin-modal-label mb-1">Status</label>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="admin-select w-full text-xs">
              <option value="">All</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          {/* Purpose */}
          <div className="min-w-[130px]">
            <label className="admin-modal-label mb-1">Purpose</label>
            <select value={filterPurpose} onChange={e => { setFilterPurpose(e.target.value); setPage(1); }} className="admin-select w-full text-xs">
              <option value="">All</option>
              {["TITHE","OFFERING","BUILDING","MISSIONS","CHARITY","OTHER","GENERAL","YOUTH"].map(p =>
                <option key={p} value={p}>{p}</option>
              )}
            </select>
          </div>
          {/* Method */}
          <div className="min-w-[110px]">
            <label className="admin-modal-label mb-1">Method</label>
            <select value={filterMethod} onChange={e => { setFilterMethod(e.target.value); setPage(1); }} className="admin-select w-full text-xs">
              <option value="">All</option>
              <option value="UPI">UPI</option>
              <option value="RAZORPAY">Razorpay</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          {/* Date Range */}
          <div className="min-w-[120px]">
            <label className="admin-modal-label mb-1">From</label>
            <input type="date" value={filterFrom} onChange={e => { setFilterFrom(e.target.value); setPage(1); }} className="admin-input w-full text-xs" />
          </div>
          <div className="min-w-[120px]">
            <label className="admin-modal-label mb-1">To</label>
            <input type="date" value={filterTo} onChange={e => { setFilterTo(e.target.value); setPage(1); }} className="admin-input w-full text-xs" />
          </div>
          {/* Clear */}
          {(filterStatus || filterPurpose || filterMethod || filterFrom || filterTo) && (
            <button
              onClick={() => { setFilterStatus(""); setFilterPurpose(""); setFilterMethod(""); setFilterFrom(""); setFilterTo(""); setPage(1); }}
              className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-rose-600 border border-gray-200 dark:border-white/10 rounded-xl transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#6366F1] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400">No donations found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.02]">
                  {["Donor", "Amount", "Purpose", "Method", "Status", "Tx Ref", "Date", "Actions"].map(h => (
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
                            {d.donorName || "Anonymous"}
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
                          {d.purpose}
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
                          {d.status}
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
                          {/* Receipt Link */}
                          <a
                            href={`/give/receipt/${d.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                            title="View Receipt"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Manual UPI Verify (only for PENDING UPI donations) */}
                          {d.status === "PENDING" && d.paymentMethod === "UPI" && (
                            <>
                              <button
                                onClick={() => handleVerify(d.id, "APPROVE")}
                                disabled={verifyingId === d.id}
                                className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                                title="Approve UPI Payment"
                              >
                                {verifyingId === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerify(d.id, "REJECT")}
                                disabled={verifyingId === d.id}
                                className="flex items-center gap-1 px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                                title="Reject UPI Payment"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
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
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages} • {totalCount} total records
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
