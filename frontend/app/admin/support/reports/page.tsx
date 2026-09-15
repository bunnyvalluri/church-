"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  AlertTriangle,
  Bug,
  Clock,
  CheckCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  User,
  Laptop,
  Smartphone,
  Globe,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  AlertCircle,
  Check,
  Shield,
  FileText,
  Sliders,
  Terminal,
} from "lucide-react";
import { IssueReportRecord } from "@/lib/issueService";

const STATUS_BADGES: Record<string, { label: string; color: string; dot: string }> = {
  OPEN: { label: "Open", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", dot: "bg-blue-500" },
  INVESTIGATING: { label: "Investigating", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", dot: "bg-purple-500" },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", dot: "bg-amber-500" },
  RESOLVED: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500" },
  CLOSED: { label: "Closed", color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20", dot: "bg-gray-500" },
  DUPLICATE: { label: "Duplicate", color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20", dot: "bg-zinc-500" },
};

const SEVERITY_BADGES: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low", color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" },
  MEDIUM: { label: "Medium", color: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300" },
  HIGH: { label: "High", color: "bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-300" },
  CRITICAL: { label: "Critical", color: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 font-bold" },
};

export default function AdminReportsDashboardPage() {
  const { user } = useAuth();

  // Filter states
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Data states
  const [reports, setReports] = useState<IssueReportRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Selected report for detail inspection drawer
  const [selectedReport, setSelectedReport] = useState<IssueReportRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch reports from API
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (severityFilter !== "ALL") params.set("severity", severityFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("page", String(currentPage));
      params.set("limit", "15");

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        setTotalCount(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load admin reports:", err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, severityFilter, categoryFilter, searchQuery, currentPage]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Handle status update
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedReport) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/reports/${selectedReport.reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data.report);
        // Refresh listing
        fetchReports();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle adding internal note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !newNoteText.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/admin/reports/${selectedReport.reportId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNoteText.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data.report);
        setNewNoteText("");
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle staff assignment
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setIsAssigning(true);
    try {
      const res = await fetch(`/api/admin/reports/${selectedReport.reportId}/assignment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: assigneeInput }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data.report);
        fetchReports();
      }
    } catch (err) {
      console.error("Failed to assign report:", err);
    } finally {
      setIsAssigning(false);
    }
  };

  // Summary counts
  const openCount = reports.filter((r) => r.status === "OPEN").length;
  const inProgressCount = reports.filter((r) => r.status === "IN_PROGRESS" || r.status === "INVESTIGATING").length;
  const resolvedCount = reports.filter((r) => r.status === "RESOLVED").length;
  const criticalCount = reports.filter((r) => r.severity === "CRITICAL").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bug className="w-6 h-6 text-indigo-600" />
            Issue Reports & Diagnostics Triage
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry, device diagnostics, and support issue management.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total Filtered Reports</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Newly Received (Open)</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{openCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Active / In Progress</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{inProgressCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-rose-600 dark:text-rose-400">Critical Priority</div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">{criticalCount}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search report ID, title, email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter by Status"
          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="DUPLICATE">Duplicate</option>
        </select>

        {/* Severity Dropdown */}
        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter by Severity"
          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter by Category"
          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Categories</option>
          <option value="SOMETHING_IS_BROKEN">Something is Broken</option>
          <option value="PAGE_NOT_LOADING">Page Not Loading</option>
          <option value="LOGIN_ACCOUNT">Login & Account</option>
          <option value="MOBILE_RESPONSIVE">Mobile Responsive</option>
          <option value="WEBSITE_DISPLAY">Website Display</option>
          <option value="NETWORK_CONNECTION">Network & Connection</option>
          <option value="BUG_UNEXPECTED">Bug / Unexpected Error</option>
          <option value="SUGGESTION">Suggestion</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Report ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Title & Member</th>
                <th className="px-4 py-3">Environment</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading diagnostics and reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No reports match the selected filters.
                  </td>
                </tr>
              ) : (
                reports.map((r) => {
                  const statusInfo = STATUS_BADGES[r.status] || {
                    label: r.status,
                    color: "bg-slate-100 text-slate-700",
                    dot: "bg-slate-400",
                  };
                  const sevInfo = SEVERITY_BADGES[r.severity] || {
                    label: r.severity,
                    color: "bg-slate-100 text-slate-700",
                  };

                  return (
                    <tr
                      key={r.id || r.reportId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Report ID */}
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {r.reportId}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${statusInfo.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${sevInfo.color}`}>
                          {sevInfo.label}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                        {r.category.replace(/_/g, " ")}
                      </td>

                      {/* Title & Member */}
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {r.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {r.user?.name || "Member"} &bull; {r.user?.email || "Unknown"}
                        </div>
                      </td>

                      {/* Environment */}
                      <td className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <div>{r.browser || "Unknown Browser"}</div>
                        <div>{r.operatingSystem || "Unknown OS"} &bull; {r.deviceType || "desktop"}</div>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                        <div>
                          {new Date(r.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedReport(r);
                            setAssigneeInput(r.assignedTo || "");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing Page {currentPage} of {totalPages} ({totalCount} total)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Inspection Drawer / Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {selectedReport.reportId}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${STATUS_BADGES[selectedReport.status]?.color || ""}`}>
                    {STATUS_BADGES[selectedReport.status]?.label || selectedReport.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${SEVERITY_BADGES[selectedReport.severity]?.color || ""}`}>
                    {selectedReport.severity}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {selectedReport.title}
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  Submitted by <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedReport.user?.name || "Member"}</span> ({selectedReport.user?.email || "Unknown"}) on {new Date(selectedReport.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions (Status & Assignment) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Update Issue Status
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(STATUS_BADGES).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        selectedReport.status === st
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {STATUS_BADGES[st].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignment Form */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Assign To Staff Member / Engineer
                </label>
                <form onSubmit={handleAssign} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Staff email or name"
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isAssigning}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Assign
                  </button>
                </form>
              </div>
            </div>

            {/* Description & Behaviors */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Member Description
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                  {selectedReport.description}
                </div>
              </div>

              {(selectedReport.expectedBehavior || selectedReport.actualBehavior) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedReport.expectedBehavior && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="font-bold text-slate-500 mb-1">Expected Behavior</div>
                      <div className="text-slate-800 dark:text-slate-200">{selectedReport.expectedBehavior}</div>
                    </div>
                  )}
                  {selectedReport.actualBehavior && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="font-bold text-slate-500 mb-1">Actual Behavior</div>
                      <div className="text-slate-800 dark:text-slate-200">{selectedReport.actualBehavior}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Screenshot if available */}
            {selectedReport.screenshotUrl && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Attached User Screenshot
                </h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-2 bg-slate-50 dark:bg-slate-950 inline-block">
                  <a href={selectedReport.screenshotUrl} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedReport.screenshotUrl}
                      alt="User screenshot"
                      className="max-h-64 rounded-lg object-contain"
                    />
                  </a>
                </div>
              </div>
            )}

            {/* Real Telemetry Diagnostics Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" />
                Live Client Environment & Telemetry
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Browser</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReport.browser || "Unknown"} {selectedReport.browserVersion || ""}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Operating System</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReport.operatingSystem || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Device Type</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{selectedReport.deviceType || "Desktop"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Viewport Size</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReport.viewportWidth || 0} × {selectedReport.viewportHeight || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Screen Resolution</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReport.screenWidth || 0} × {selectedReport.screenHeight || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Timezone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReport.timezone || "UTC"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Connection</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReport.connectionType || (selectedReport.onlineStatus ? "Online" : "Offline")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Page URL</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block" title={selectedReport.pageUrl || ""}>
                    {selectedReport.pagePath || selectedReport.pageUrl || "/"}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Context if captured */}
            {(selectedReport.errorType || selectedReport.errorMessageSanitized) && (
              <div>
                <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Captured Client Error Context
                </h3>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono space-y-1">
                  {selectedReport.errorType && (
                    <div><span className="text-slate-400">Error Type:</span> <span className="text-rose-600 dark:text-rose-400 font-bold">{selectedReport.errorType}</span></div>
                  )}
                  {selectedReport.errorMessageSanitized && (
                    <div><span className="text-slate-400">Message:</span> <span className="text-slate-800 dark:text-slate-200">{selectedReport.errorMessageSanitized}</span></div>
                  )}
                  {selectedReport.correlationId && (
                    <div><span className="text-slate-400">Correlation ID:</span> <span className="text-indigo-600 dark:text-indigo-400">{selectedReport.correlationId}</span></div>
                  )}
                </div>
              </div>
            )}

            {/* Internal Admin Investigation Notes */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Internal Investigation Notes (Staff Only)
              </h3>

              {selectedReport.internalNotes ? (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                  {selectedReport.internalNotes}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No notes added yet.</p>
              )}

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new investigation note or root cause finding..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isAddingNote || !newNoteText.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Add Note
                </button>
              </form>
            </div>

            {/* Close Modal Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
