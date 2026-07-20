"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  TrendingUp,
  DollarSign,
  Users,
  Building,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  Layers,
  Sparkles,
  Bot,
} from 'lucide-react';

interface SummaryStats {
  totalDonations: number;
  totalAmount: number;
  todayAmount: number;
  monthAmount: number;
  pendingCount: number;
  avgDonation: number;
}

interface CauseStat {
  purposeCode: string;
  purposeName: string;
  count: number;
  totalAmount: number;
}

interface FunnelStep {
  event: string;
  count: number;
  conversionRate: number;
}

export default function DonationAdminDashboard() {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [causes, setCauses] = useState<CauseStat[]>([]);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [flushing, setFlushing] = useState(false);
  const [queueStats, setQueueStats] = useState<any>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, causeRes, funnelRes] = await Promise.all([
        fetch('/api/admin/donations/stats?type=summary'),
        fetch('/api/admin/donations/stats?type=causes'),
        fetch('/api/admin/donations/stats?type=funnel'),
      ]);

      if (sumRes.ok) setSummary((await sumRes.json()).data);
      if (causeRes.ok) setCauses((await causeRes.json()).data);
      if (funnelRes.ok) setFunnel((await funnelRes.json()).data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlushQueue = async () => {
    setFlushing(true);
    try {
      const res = await fetch('/api/donations/agent?action=flush_queue');
      if (res.ok) {
        const data = await res.json();
        setQueueStats(data.stats);
      }
    } catch (err) {
      console.error('Queue flush failed:', err);
    } finally {
      setFlushing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-950 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            <Bot className="w-8 h-8 text-purple-400" /> Donation Management Agent Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time donation analytics, conversion funnel, and background job queue monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleFlushQueue}
            disabled={flushing}
            className="px-4 py-2 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-300 hover:bg-purple-800/50 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${flushing ? 'animate-spin' : ''}`} />
            {flushing ? 'Flushing Retry Queue...' : 'Flush Retry Queue'}
          </button>

          <button
            onClick={loadDashboardData}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Raised</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-3">
            ₹{(summary?.totalAmount || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">{summary?.totalDonations || 0} total donations</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">This Month</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-3">
            ₹{(summary?.monthAmount || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">₹{(summary?.todayAmount || 0).toLocaleString('en-IN')} raised today</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Avg Donation</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-3">
            ₹{(summary?.avgDonation || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">per verified transaction</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active QR Sessions</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-3">
            {summary?.pendingCount || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">sessions awaiting payment</div>
        </div>
      </div>

      {/* Conversion Funnel & Causes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" /> Agent Conversion Funnel (30 Days)
          </h2>

          <div className="space-y-3">
            {funnel.map((step) => (
              <div key={step.event} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300 font-mono">{step.event}</span>
                  <span className="text-slate-400">{step.count} ({step.conversionRate}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${Math.max(step.conversionRate, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Causes Performance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-pink-400" /> Cause & Campaign Performance
          </h2>

          <div className="space-y-4">
            {causes.map((c) => (
              <div key={c.purposeCode} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-white">{c.purposeName}</div>
                  <div className="text-xs text-slate-400">{c.count} contributions</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">₹{c.totalAmount.toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
