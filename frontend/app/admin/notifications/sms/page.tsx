"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
  Smartphone,
  Info
} from "lucide-react";
import { useSmsMessages, useSmsStats, useSmsSettings, useRetrySms, useCancelSms } from "@/hooks/useSms";

export default function AdminSmsDashboardPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useSmsStats();
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useSmsMessages({
    page,
    limit: 15,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: searchTerm || undefined,
  });
  const { data: settingsData } = useSmsSettings();

  const retryMutation = useRetrySms();
  const cancelMutation = useCancelSms();

  const stats = statsData?.stats || {
    total: 0,
    queued: 0,
    processing: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    retrying: 0,
    expired: 0,
    cancelled: 0,
    deliveryRate: 0,
    failureRate: 0,
  };

  const settings = settingsData?.settings || {
    provider: "httpsms",
    isConfigured: false,
    fromNumber: "Not configured",
    queueMode: "PostgreSQL Outbox Worker",
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
      case "SENT":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"><Send className="w-3.5 h-3.5" /> Sent</span>;
      case "PROCESSING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing</span>;
      case "QUEUED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Queued</span>;
      case "RETRYING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Retrying</span>;
      case "FAILED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"><AlertTriangle className="w-3.5 h-3.5" /> Failed</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                SMS Delivery Engine
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Production-grade Android Gateway & httpSMS integration for Kingdom of Christ Ministries
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => { refetchStats(); refetchMessages(); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${messagesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/admin/notifications/sms/test"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-90 shadow-md shadow-indigo-500/20 transition"
          >
            <Smartphone className="w-4 h-4" />
            Send Test SMS
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Gateway & Configuration Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-4 rounded-xl border border-indigo-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Active Provider</span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white capitalize text-base">{settings.provider}</span>
              {settings.provider === 'httpsms' ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Production</span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">Mock Sandbox</span>
              )}
            </div>
          </div>
          <ShieldCheck className="w-8 h-8 text-indigo-500/40" />
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent p-4 rounded-xl border border-purple-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">SIM Gateway Origin</span>
            <div className="font-extrabold text-slate-900 dark:text-white text-base">{settings.fromNumber || "Configured in .env"}</div>
          </div>
          <Smartphone className="w-8 h-8 text-purple-500/40" />
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-4 rounded-xl border border-emerald-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Queue Architecture</span>
            <div className="font-extrabold text-slate-900 dark:text-white text-base">{settings.queueMode}</div>
          </div>
          <Layers className="w-8 h-8 text-emerald-500/40" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Total SMS</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
          <span className="text-[11px] text-slate-400 font-medium">All recorded</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Delivered</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.delivered}</div>
          <span className="text-[11px] text-emerald-600/80 font-bold">{stats.deliveryRate}% Success</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Sent / In Flight</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.sent + stats.processing}</div>
          <span className="text-[11px] text-slate-400">En route to carrier</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Queued</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.queued}</div>
          <span className="text-[11px] text-slate-400">Outbox awaiting send</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Retrying</span>
          <div className="text-2xl font-black text-orange-600 dark:text-orange-400">{stats.retrying}</div>
          <span className="text-[11px] text-slate-400">Exponential backoff</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Failed</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.failed}</div>
          <span className="text-[11px] text-rose-600/80 font-bold">{stats.failureRate}% Failure</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Search by phone, content, ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "QUEUED", "PROCESSING", "SENT", "DELIVERED", "RETRYING", "FAILED"].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Realtime Messages Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-4 sm:px-6 py-3.5">Recipient</th>
                <th className="px-4 sm:px-6 py-3.5">Message</th>
                <th className="px-4 sm:px-6 py-3.5">Status</th>
                <th className="px-4 sm:px-6 py-3.5">Provider ID</th>
                <th className="px-4 sm:px-6 py-3.5">Attempts</th>
                <th className="px-4 sm:px-6 py-3.5">Created At</th>
                <th className="px-4 sm:px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {messagesLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading SMS delivery records...
                  </td>
                </tr>
              ) : messagesData?.items?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    No SMS message records matching your query.
                  </td>
                </tr>
              ) : (
                messagesData?.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.normalizedPhoneNumber || item.phoneNumber}
                      </div>
                      {item.member?.name && (
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                          {item.member.name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      {item.message}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {item.providerMessageId ? item.providerMessageId.substring(0, 16) + '...' : '—'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.attempts}</span>
                      <span className="text-slate-400">/{item.maxAttempts}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedMessage(item)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg hover:bg-indigo-100 transition"
                      >
                        Details
                      </button>

                      {item.status === 'FAILED' && (
                        <button
                          onClick={() => retryMutation.mutate(item.id)}
                          disabled={retryMutation.isPending}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 rounded-lg hover:bg-amber-100 transition"
                        >
                          Retry
                        </button>
                      )}

                      {(item.status === 'QUEUED' || item.status === 'RETRYING') && (
                        <button
                          onClick={() => cancelMutation.mutate(item.id)}
                          disabled={cancelMutation.isPending}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg hover:bg-rose-100 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {messagesData && messagesData.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="text-xs text-slate-500">
              Page <span className="font-bold">{messagesData.page}</span> of <span className="font-bold">{messagesData.totalPages}</span> ({messagesData.total} items)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(messagesData.totalPages, p + 1))}
                disabled={page >= messagesData.totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">SMS Delivery Details</h3>
              <button onClick={() => setSelectedMessage(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Recipient</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMessage.normalizedPhoneNumber || selectedMessage.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Status</span>
                  <div>{getStatusBadge(selectedMessage.status)}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold">Message Content</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-sans whitespace-pre-wrap text-slate-700 dark:text-slate-300 mt-1">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Provider</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{selectedMessage.provider}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Provider Message ID</span>
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{selectedMessage.providerMessageId || 'N/A'}</span>
                </div>
              </div>

              {selectedMessage.failureReason && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl text-rose-700 dark:text-rose-300">
                  <span className="font-bold block text-[11px] uppercase">Failure Reason</span>
                  <p className="mt-1">{selectedMessage.failureReason}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
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
