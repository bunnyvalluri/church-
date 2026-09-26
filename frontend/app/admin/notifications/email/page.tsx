"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  XCircle,
  Search,
  Filter,
  Eye,
  Smartphone,
  Monitor,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Server,
  FileText,
  Copy,
  Check,
  X,
  RotateCcw
} from "lucide-react";

interface EmailLog {
  id: string;
  channel: string;
  status: string;
  recipient_addr: string;
  template: string | null;
  subject: string | null;
  providerMessageId: string | null;
  errorMessage: string | null;
  retryCount: number;
  sent_at: string;
  delivered_at: string | null;
  metadata: string | null;
}

interface StatsData {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  deliveryRate: number;
  failureRate: number;
}

interface ProviderInfo {
  activeProvider: string;
  senderName: string;
  senderAddress: string;
  replyTo: string;
  isConfigured: boolean;
}

const TEMPLATE_LIST = [
  { id: "WELCOME", label: "A. Welcome Email", group: "Member & Account" },
  { id: "EMAIL_VERIFICATION", label: "B. Email Verification", group: "Member & Account" },
  { id: "PASSWORD_RESET", label: "C. Password Reset", group: "Member & Account" },
  { id: "LOGIN_ALERT", label: "D. Login / Security Notification", group: "Member & Account" },
  { id: "EVENT_CREATED", label: "E. Event Created", group: "Church Events" },
  { id: "EVENT_UPDATED", label: "F. Event Updated", group: "Church Events" },
  { id: "EVENT_REMINDER", label: "G. Event Reminder", group: "Church Events" },
  { id: "EVENT_CANCELLED", label: "H. Event Cancellation", group: "Church Events" },
  { id: "PRAYER_CONFIRMATION", label: "I. Prayer Request Confirmation", group: "Prayer Ministry" },
  { id: "PRAYER_STATUS_UPDATE", label: "J. Prayer Request Status Update", group: "Prayer Ministry" },
  { id: "DONATION_CONFIRMATION", label: "K. Donation Confirmation", group: "Giving & Receipts" },
  { id: "DONATION_RECEIPT", label: "L. Donation Receipt (80G Tax Exemption)", group: "Giving & Receipts" },
  { id: "VOLUNTEER_CONFIRMATION", label: "M. Volunteer Application Confirmation", group: "Volunteers & Serving" },
  { id: "VOLUNTEER_APPROVAL", label: "N. Volunteer Approval", group: "Volunteers & Serving" },
  { id: "MEMBERSHIP_CONFIRMATION", label: "O. Membership Request Confirmation", group: "Church Membership" },
  { id: "MEMBERSHIP_APPROVAL", label: "P. Membership Approval", group: "Church Membership" },
  { id: "NEW_SERMON", label: "Q. New Sermon Notification", group: "Word & Teaching" },
  { id: "CHURCH_ANNOUNCEMENT", label: "R. Church Announcement", group: "Community" },
  { id: "MINISTRY_NOTIFICATION", label: "S. Important Ministry Notification", group: "Community" },
  { id: "SECURITY_ALERT", label: "T. Account Security Alert", group: "Security" },
];

export default function AdminEmailDeliveryPage() {
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    deliveryRate: 100,
    failureRate: 0,
  });
  const [providerInfo, setProviderInfo] = useState<ProviderInfo>({
    activeProvider: "resend",
    senderName: "Kingdom of Christ Ministries",
    senderAddress: "noreply@kingdomofchristministries.org",
    replyTo: "kingofchristministries23@gmail.com",
    isConfigured: true,
  });
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [templateFilter, setTemplateFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Preview Modal
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewTemplate, setPreviewTemplate] = useState<string>("WELCOME");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewSubject, setPreviewSubject] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  // Test Send
  const [testEmail, setTestEmail] = useState<string>("");
  const [testSending, setTestSending] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications/email?action=stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        if (data.providerInfo) setProviderInfo(data.providerInfo);
      }
    } catch (err) {
      console.error("Failed to load email stats:", err);
    }
  }, []);

  // Fetch Logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (templateFilter !== "ALL") params.append("template", templateFilter);
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(`/api/admin/notifications/email?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        if (data.pagination) setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load email logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, templateFilter, searchTerm]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Fetch Preview
  const loadPreview = async (tpl: string) => {
    setPreviewLoading(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/admin/notifications/email?action=preview&template=${tpl}`);
      const data = await res.json();
      if (data.success) {
        setPreviewHtml(data.html);
        setPreviewSubject(data.subject);
      }
    } catch (err) {
      console.error("Failed to render preview:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const openPreviewModal = (templateName: string = "WELCOME") => {
    setPreviewTemplate(templateName);
    setPreviewOpen(true);
    loadPreview(templateName);
  };

  // Retry Failed Email
  const handleRetry = async (logId: string) => {
    setRetryingId(logId);
    try {
      const res = await fetch("/api/admin/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry", logId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchStats();
        fetchLogs();
      } else {
        alert(`Retry notice: ${data.result?.error || "Delivery could not complete."}`);
      }
    } catch (err: any) {
      alert(`Retry failed: ${err.message}`);
    } finally {
      setRetryingId(null);
    }
  };

  // Send Test Email
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes("@")) {
      setTestResult({ success: false, message: "Please enter a valid recipient email address." });
      return;
    }

    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_send",
          template: previewTemplate,
          to: testEmail.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: `✓ Test email dispatched to ${testEmail} via ${data.result?.provider || "active provider"}!`,
        });
        fetchStats();
        fetchLogs();
      } else {
        setTestResult({
          success: false,
          message: `Delivery issue: ${data.result?.error || "Check server logs"}`,
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Error: ${err.message}` });
    } finally {
      setTestSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" /> Sent
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap">
            <AlertTriangle className="w-3 h-3" /> Failed
          </span>
        );
      case "RETRYING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
            <RefreshCw className="w-3 h-3 animate-spin" /> Retrying
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 whitespace-nowrap">
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 w-full max-w-7xl mx-auto overflow-x-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-purple-500/20 flex-shrink-0">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Email Delivery Engine
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Multi-Transport Transactional Email Infrastructure for Kingdom of Christ Ministries
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-shrink-0">
          <button
            onClick={() => {
              fetchStats();
              fetchLogs();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => openPreviewModal("WELCOME")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/25 transition active:scale-95 whitespace-nowrap"
          >
            <Eye className="w-4 h-4" />
            <span>Preview All 20 Templates</span>
          </button>
        </div>
      </div>

      {/* Provider & Stats Status Band — 2-col on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Emails */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Total Emails</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats.total.toLocaleString()}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">All logged emails</div>
        </div>

        {/* Successfully Delivered */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Delivered</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.sent.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {stats.deliveryRate}%
            </span>
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">Dispatched successfully</div>
        </div>

        {/* Failed */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Failed</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.failed.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {stats.failureRate}%
            </span>
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">One-click retry ready</div>
        </div>

        {/* Active Transport Provider */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Transport Provider</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Server className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase truncate">
              {providerInfo.activeProvider}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">
            {providerInfo.senderAddress}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2.5 sm:space-y-3">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by recipient email, subject, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-medium transition shadow-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="RETRYING">Retrying</option>
            </select>
          </div>

          {/* Template Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Template:</span>
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white cursor-pointer truncate"
            >
              <option value="ALL">All 20 Templates</option>
              {TEMPLATE_LIST.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Listing Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        {/* Loading state */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Loading audit delivery logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 px-4 text-center text-slate-400">
            <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-1" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No email logs found matching criteria.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Emails sent by member registration, logins, receipts, or prayers will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE CARDS VIEW (Visible only on small screens < md) */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <div key={log.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  {/* Recipient & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 pr-1">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate font-mono">
                        {log.recipient_addr}
                      </div>
                      {log.providerMessageId && (
                        <div className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                          ID: {log.providerMessageId}
                        </div>
                      )}
                    </div>
                    <div>{getStatusBadge(log.status)}</div>
                  </div>

                  {/* Template & Sent Time */}
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 truncate max-w-[180px]">
                      {log.template || "CUSTOM"}
                    </span>
                    <span className="text-slate-400 text-[10px] whitespace-nowrap">
                      {new Date(log.sent_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Subject Preview */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-800 dark:text-slate-200 font-medium break-words">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Subject</span>
                    {log.subject || "—"}
                  </div>

                  {/* Error banner if present */}
                  {log.errorMessage && (
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl text-rose-700 dark:text-rose-300 text-[11px] font-mono break-all">
                      Error: {log.errorMessage}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="flex-1 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      <span>Audit Record</span>
                    </button>

                    {log.status === "FAILED" && (
                      <button
                        onClick={() => handleRetry(log.id)}
                        disabled={retryingId === log.id}
                        className="px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 rounded-xl hover:bg-rose-100 transition flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${retryingId === log.id ? "animate-spin" : ""}`} />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (Visible on >= md screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 min-w-[750px]">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Template</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Sent At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 font-medium">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-white font-mono">
                          {log.recipient_addr}
                        </div>
                        {log.providerMessageId && (
                          <div className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                            ID: {log.providerMessageId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                          {log.template || "CUSTOM"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="truncate max-w-[240px] text-slate-800 dark:text-slate-200 font-medium">
                          {log.subject || "—"}
                        </div>
                        {log.errorMessage && (
                          <div className="text-xs text-rose-500 truncate max-w-[240px]">
                            Error: {log.errorMessage}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(log.status)}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(log.sent_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {log.status === "FAILED" && (
                            <button
                              onClick={() => handleRetry(log.id)}
                              disabled={retryingId === log.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition disabled:opacity-50"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${retryingId === log.id ? "animate-spin" : ""}`}
                              />
                              <span>Retry</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition"
                          >
                            <FileText className="w-3.5 h-3.5 text-purple-600" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-4 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <div>
              Page <span className="font-bold text-slate-800 dark:text-slate-200">{page}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition font-medium flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition font-medium flex items-center gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── LIVE TEMPLATE PREVIEW MODAL ─────────────────────────────────────── */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[92vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-purple-600 text-white rounded-xl flex-shrink-0">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 pr-1">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Live Template Studio & Preview
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                    Subject: <span className="font-semibold text-slate-700 dark:text-slate-300">{previewSubject}</span>
                  </p>
                </div>
              </div>

              {/* Template Selector & Device Toggle */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={previewTemplate}
                  onChange={(e) => {
                    setPreviewTemplate(e.target.value);
                    loadPreview(e.target.value);
                  }}
                  className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white cursor-pointer truncate max-w-[200px]"
                >
                  {TEMPLATE_LIST.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 sm:p-1 rounded-xl">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      previewDevice === "desktop"
                        ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      previewDevice === "mobile"
                        ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>

                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with Iframe */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950/60 p-2.5 sm:p-6 overflow-y-auto flex items-center justify-center">
              {previewLoading ? (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
                  <span className="text-xs sm:text-sm font-medium">Rendering cross-client HTML template...</span>
                </div>
              ) : (
                <div
                  className={`transition-all duration-300 mx-auto shadow-2xl rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-white ${
                    previewDevice === "mobile" ? "w-full max-w-[360px] h-[550px] sm:h-[650px]" : "w-full max-w-[620px] h-full"
                  }`}
                >
                  <iframe
                    srcDoc={previewHtml}
                    title="Email Template Live Preview"
                    className="w-full h-full border-0 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer: Live Test Send Form */}
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">
                    Send Live Test:
                  </span>
                  <input
                    type="email"
                    placeholder="Enter email to test deliverability..."
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full sm:w-80 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                  {testResult && (
                    <span
                      className={`text-xs font-semibold truncate max-w-[200px] sm:max-w-none ${
                        testResult.success ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {testResult.message}
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={testSending || !testEmail}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-50 transition shadow-sm whitespace-nowrap"
                  >
                    <Send className={`w-3.5 h-3.5 ${testSending ? "animate-pulse" : ""}`} />
                    <span>{testSending ? "Dispatching..." : "Send Test"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILS MODAL ───────────────────────────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Email Delivery Audit Record</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Log ID:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {selectedLog.recipient_addr}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Template:</span>
                <span className="font-bold text-purple-600">{selectedLog.template || "CUSTOM"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Subject:</span>
                <span className="text-slate-800 dark:text-slate-200 break-words">{selectedLog.subject || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Status:</span>
                <span>{getStatusBadge(selectedLog.status)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Provider Message ID:</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all">
                  {selectedLog.providerMessageId || "None"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Retry Count:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {selectedLog.retryCount}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Sent Timestamp:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {new Date(selectedLog.sent_at).toLocaleString("en-IN")}
                </span>
              </div>

              {selectedLog.errorMessage && (
                <div className="pt-2">
                  <span className="text-slate-400 block mb-1">Error Message:</span>
                  <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl font-mono text-[11px] break-all">
                    {selectedLog.errorMessage}
                  </div>
                </div>
              )}

              {selectedLog.metadata && (
                <div className="pt-2">
                  <span className="text-slate-400 block mb-1">Sanitized Metadata:</span>
                  <pre className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-[11px] overflow-x-auto text-slate-700 dark:text-slate-300">
                    {selectedLog.metadata}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full sm:w-auto px-5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
