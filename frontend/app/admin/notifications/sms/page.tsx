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
  Info,
  X,
  RotateCcw
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
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 whitespace-nowrap">
            <Send className="w-3 h-3" /> Sent
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 whitespace-nowrap">
            <RefreshCw className="w-3 h-3 animate-spin" /> Processing
          </span>
        );
      case "QUEUED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
            <Clock className="w-3 h-3" /> Queued
          </span>
        );
      case "RETRYING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 whitespace-nowrap">
            <RefreshCw className="w-3 h-3 animate-spin" /> Retrying
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap">
            <AlertTriangle className="w-3 h-3" /> Failed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 whitespace-nowrap">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-500 whitespace-nowrap">
            {status}
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
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-500/20 flex-shrink-0">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                SMS Delivery Engine
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Production-grade Android Gateway & httpSMS integration for Kingdom of Christ Ministries
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-shrink-0">
          <button
            onClick={() => { refetchStats(); refetchMessages(); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${messagesLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/notifications/sms/test"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-90 shadow-md shadow-indigo-500/20 transition active:scale-95 whitespace-nowrap"
          >
            <Smartphone className="w-4 h-4" />
            <span>Send Test SMS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Gateway & Configuration Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-3.5 sm:p-4 rounded-2xl border border-indigo-500/20 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Active Provider</span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white capitalize text-sm sm:text-base">{settings.provider}</span>
              {settings.provider === 'httpsms' ? (
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Production</span>
              ) : (
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">Mock Sandbox</span>
              )}
            </div>
          </div>
          <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500/40 flex-shrink-0" />
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent p-3.5 sm:p-4 rounded-2xl border border-purple-500/20 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">SIM Gateway Origin</span>
            <div className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base truncate">{settings.fromNumber || "Configured in .env"}</div>
          </div>
          <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500/40 flex-shrink-0" />
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-3.5 sm:p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Queue Architecture</span>
            <div className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base truncate">{settings.queueMode}</div>
          </div>
          <Layers className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500/40 flex-shrink-0" />
        </div>
      </div>

      {/* KPI Cards — 2-col on mobile, 3-col on tablet, 6-col on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Total SMS</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">All recorded</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400">Delivered</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.delivered}</div>
          <span className="text-[10px] sm:text-[11px] text-emerald-600/80 font-bold block">{stats.deliveryRate}% Success</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400">Sent / In Flight</span>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{stats.sent + stats.processing}</div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 block">En route to carrier</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400">Queued</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{stats.queued}</div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 block">Outbox awaiting send</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-400">Retrying</span>
          <div className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400">{stats.retrying}</div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 block">Exponential backoff</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-semibold text-rose-600 dark:text-rose-400">Failed</span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">{stats.failed}</div>
          <span className="text-[10px] sm:text-[11px] text-rose-600/80 font-bold block">{stats.failureRate}% Failure</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Search by phone, content, ID..."
            className="w-full pl-9.5 pr-8 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap -mx-1 px-1">
          {["ALL", "QUEUED", "PROCESSING", "SENT", "DELIVERED", "RETRYING", "FAILED"].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 active:scale-95 ${
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

      {/* Messages Listing Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        {/* Loading state */}
        {messagesLoading ? (
          <div className="text-center py-16 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Loading SMS delivery records...</p>
          </div>
        ) : messagesData?.items?.length === 0 ? (
          <div className="text-center py-16 px-4 text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-1" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No SMS message records matching your query.</p>
            <p className="text-[11px] text-slate-400 mt-1">Try resetting search or selecting a different status filter.</p>
          </div>
        ) : (
          <>
            {/* MOBILE CARDS VIEW (Visible only on small screens < md) */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {messagesData?.items?.map((item) => (
                <div key={item.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  {/* Top Line: Recipient & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-mono">
                        {item.normalizedPhoneNumber || item.phoneNumber}
                      </div>
                      {item.member?.name && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                          {item.member.name}
                        </div>
                      )}
                    </div>
                    <div>{getStatusBadge(item.status)}</div>
                  </div>

                  {/* Message Content Preview */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed break-words line-clamp-3">
                    {item.message}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        ID: {item.providerMessageId ? item.providerMessageId.substring(0, 10) + '...' : '—'}
                      </span>
                      <span>•</span>
                      <span>
                        Attempts: <strong className="text-slate-700 dark:text-slate-300">{item.attempts}/{item.maxAttempts}</strong>
                      </span>
                    </div>
                    <div className="whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedMessage(item)}
                      className="flex-1 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl hover:bg-indigo-100 transition text-center"
                    >
                      View Details
                    </button>

                    {item.status === 'FAILED' && (
                      <button
                        onClick={() => retryMutation.mutate(item.id)}
                        disabled={retryMutation.isPending}
                        className="px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 rounded-xl hover:bg-amber-100 transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Retry
                      </button>
                    )}

                    {(item.status === 'QUEUED' || item.status === 'RETRYING') && (
                      <button
                        onClick={() => cancelMutation.mutate(item.id)}
                        disabled={cancelMutation.isPending}
                        className="px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 rounded-xl hover:bg-rose-100 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (Visible on >= md screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[750px]">
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
                  {messagesData?.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">
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
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Bar */}
        {messagesData && messagesData.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-4 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500">
            <div>
              Page <span className="font-bold text-slate-800 dark:text-slate-200">{messagesData.page}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{messagesData.totalPages}</span> ({messagesData.total} items)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition font-medium flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                onClick={() => setPage(p => Math.min(messagesData.totalPages, p + 1))}
                disabled={page >= messagesData.totalPages}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition font-medium flex items-center gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">SMS Delivery Details</h3>
              <button onClick={() => setSelectedMessage(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Recipient</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedMessage.normalizedPhoneNumber || selectedMessage.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                  <div>{getStatusBadge(selectedMessage.status)}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Message Content</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl font-sans whitespace-pre-wrap text-slate-700 dark:text-slate-300 mt-1 border border-slate-200/60 dark:border-slate-700/60 leading-relaxed text-xs">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Provider</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 capitalize">{selectedMessage.provider}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Provider Message ID</span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all">{selectedMessage.providerMessageId || 'N/A'}</span>
                </div>
              </div>

              {selectedMessage.failureReason && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-2xl text-rose-700 dark:text-rose-300 text-xs">
                  <span className="font-bold block text-[10px] uppercase">Failure Reason</span>
                  <p className="mt-1 leading-relaxed">{selectedMessage.failureReason}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
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
