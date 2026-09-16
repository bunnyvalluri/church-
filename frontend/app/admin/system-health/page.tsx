"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Server,
  Database,
  Radio,
  HardDrive,
  Mail,
  MessageSquare,
  CreditCard,
  Layers,
  GitBranch,
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface ServiceTelemetry {
  name: string;
  category: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  latencyMs: number;
  lastCheck: string;
  errorCount: number;
  details: Record<string, any>;
}

export default function AdminSystemHealthPage() {
  const [services, setServices] = useState<ServiceTelemetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchTelemetry = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/system-health");
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: Failed to load health telemetry`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.services)) {
        setServices(data.services);
        setLastRefreshed(new Date().toLocaleTimeString());
        setError(null);
      } else {
        throw new Error(data.error || "Malformed telemetry response");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch health telemetry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Auto-refresh interval (30 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTelemetry]);

  const getStatusBadge = (status: "HEALTHY" | "DEGRADED" | "DOWN") => {
    switch (status) {
      case "HEALTHY":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            HEALTHY
          </span>
        );
      case "DEGRADED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            DEGRADED
          </span>
        );
      case "DOWN":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            DOWN
          </span>
        );
    }
  };

  const getServiceIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "frontend":
        return <Activity className="w-5 h-5 text-indigo-500" />;
      case "backend":
        return <Server className="w-5 h-5 text-sky-500" />;
      case "database":
        return <Database className="w-5 h-5 text-emerald-500" />;
      case "redis":
        return <Layers className="w-5 h-5 text-red-500" />;
      case "mongodb":
        return <Database className="w-5 h-5 text-green-500" />;
      case "firebase":
        return <ShieldCheck className="w-5 h-5 text-amber-500" />;
      case "realtime":
        return <Radio className="w-5 h-5 text-cyan-500" />;
      case "storage":
        return <HardDrive className="w-5 h-5 text-purple-500" />;
      case "email":
        return <Mail className="w-5 h-5 text-blue-500" />;
      case "sms":
        return <MessageSquare className="w-5 h-5 text-teal-500" />;
      case "payments":
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case "queues":
        return <Layers className="w-5 h-5 text-orange-500" />;
      case "ci/cd":
        return <GitBranch className="w-5 h-5 text-violet-500" />;
      case "deployment":
        return <Cloud className="w-5 h-5 text-blue-600" />;
      default:
        return <Server className="w-5 h-5 text-gray-500" />;
    }
  };

  const healthyCount = services.filter((s) => s.status === "HEALTHY").length;
  const degradedCount = services.filter((s) => s.status === "DEGRADED").length;
  const downCount = services.filter((s) => s.status === "DOWN").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070913] text-slate-900 dark:text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Health Telemetry</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live automated infrastructure monitoring across all 14 KCM subsystems.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-xs px-3 py-2 rounded-xl font-medium border transition-colors ${
                autoRefresh
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
            >
              {autoRefresh ? "Auto-Refresh: ON (30s)" : "Auto-Refresh: PAUSED"}
            </button>

            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Now
            </button>
          </div>
        </div>

        {/* Global KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Monitored</div>
            <div className="text-2xl font-bold mt-1">{services.length || 14}</div>
            <div className="text-xs text-slate-400 mt-1">Subsystems</div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Healthy</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{healthyCount}</div>
            <div className="text-xs text-slate-400 mt-1">Operational</div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Degraded</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{degradedCount}</div>
            <div className="text-xs text-slate-400 mt-1">Safe Fallback Active</div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-medium text-rose-600 dark:text-rose-400">Down</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{downCount}</div>
            <div className="text-xs text-slate-400 mt-1">Action Required</div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-2xl p-4 text-sm flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 14 Subsystem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                      {getServiceIcon(svc.name)}
                    </div>
                    <div>
                      <h2 className="text-base font-bold">{svc.name}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{svc.category}</p>
                    </div>
                  </div>
                  {getStatusBadge(svc.status)}
                </div>

                {/* Metrics Table */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400">Latency:</span>
                    <span className="font-semibold ml-1 text-slate-700 dark:text-slate-300">
                      {svc.latencyMs > 0 ? `${svc.latencyMs}ms` : "< 1ms"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Errors:</span>
                    <span
                      className={`font-semibold ml-1 ${
                        svc.errorCount > 0 ? "text-rose-500" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {svc.errorCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Checked: {lastRefreshed || "Just now"}
                </span>
                <span className="truncate max-w-[150px]">
                  {svc.details && Object.keys(svc.details).length > 0
                    ? Object.entries(svc.details)[0].join(": ")
                    : "Verified"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
