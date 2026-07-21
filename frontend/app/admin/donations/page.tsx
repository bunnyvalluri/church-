"use client";

/**
 * /admin/donations — Enterprise Donation Management CMS
 * ─────────────────────────────────────────────────────────────────────────────
 * Tabs:
 *  📊 Overview     — Real-time analytics: today/monthly/yearly, top donors, UPI app breakdown
 *  ⚙️  Settings    — UPI ID, QR expiry, min/max amounts, 80G registration number
 *  📋 Transactions — Paginated searchable list of all donations
 *  🔗 Webhooks     — Webhook event history, status, replay
 *  🧪 Testing      — Dev-only: simulate webhook scenarios
 *
 * Security: Requires ADMIN / SUPER_ADMIN role (enforced server-side on all APIs).
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Settings,
  ClipboardList,
  Link,
  FlaskConical,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Heart,
  Shield,
  Copy,
  ExternalLink,
  Download,
  ChevronDown,
  Webhook,
  Zap,
  QrCode,
  Smartphone,
  Activity,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analytics {
  summary: {
    today: { total: number; count: number; average: number };
    thisMonth: { total: number; count: number; average: number; growthPct: number | null };
    lastMonth: { total: number; count: number };
    yearToDate: { total: number; count: number };
    failedPayments30d: number;
  };
  byPurpose: Array<{ purpose: string; total: number; count: number }>;
  byBranch: Array<{ branchId: string; branchName: string; total: number; count: number }>;
  byUpiApp: Array<{ app: string; count: number }>;
  topDonors: Array<{ name: string; email: string; total: number; donations: number }>;
  recentDonations: Array<{
    id: string; donorName: string; amount: number; currency: string;
    purpose: string; branchName: string; upiApp: string; campaignName?: string; createdAt: string;
  }>;
  webhooks: { byStatus: Array<{ status: string; count: number }> };
}

interface DonationSettings {
  churchName: string;
  upiId: string;
  merchantName: string;
  qrExpiryMinutes: number;
  minDonationAmount: number;
  maxDonationAmount: number;
  eightygRegistrationNo?: string | null;
  adminAlertEmails?: string | null;
  financeAlertEmails?: string | null;
}

// ─── Tab Config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "transactions", label: "Transactions", icon: ClipboardList },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "testing", label: "Dev Testing", icon: FlaskConical },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── UPI App Labels ───────────────────────────────────────────────────────────

const UPI_APP_LABELS: Record<string, string> = {
  GPAY: "Google Pay", PHONEPE: "PhonePe", PAYTM: "Paytm",
  BHIM: "BHIM", AMAZON_PAY: "Amazon Pay", BANK: "Bank UPI",
  UNKNOWN: "Other UPI", undefined: "Unknown",
};

const UPI_APP_COLORS: Record<string, string> = {
  GPAY: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  PHONEPE: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  PAYTM: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  BHIM: "bg-green-500/20 text-green-300 border-green-500/30",
  AMAZON_PAY: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  BANK: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  UNKNOWN: "bg-slate-600/20 text-slate-400 border-slate-600/30",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DonationAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [settings, setSettings] = useState<DonationSettings | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [editedSettings, setEditedSettings] = useState<Partial<DonationSettings>>({});
  const [testScenario, setTestScenario] = useState("payment.captured");
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [recentPage, setRecentPage] = useState(0);
  const [webhookHistory, setWebhookHistory] = useState<any[]>([]);
  const [loadingWebhooks, setLoadingWebhooks] = useState(false);
  const [flushing, setFlushing] = useState(false);

  // ── Data loaders ────────────────────────────────────────────────────────────
  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/admin/donations/analytics");
      if (res.ok) setAnalytics(await res.json());
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/admin/donations/config");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setEditedSettings(data.settings);
      }
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  const loadWebhooks = useCallback(async () => {
    setLoadingWebhooks(true);
    try {
      const res = await fetch("/api/payments/webhook/history?limit=20");
      if (res.ok) {
        const data = await res.json();
        setWebhookHistory(data.events || []);
      }
    } finally {
      setLoadingWebhooks(false);
    }
  }, []);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  useEffect(() => { if (activeTab === "settings") loadSettings(); }, [activeTab, loadSettings]);
  useEffect(() => { if (activeTab === "webhooks") loadWebhooks(); }, [activeTab, loadWebhooks]);

  // ── Save settings ────────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/admin/donations/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedSettings),
      });
      if (res.ok) {
        setSaveStatus("success");
        await loadSettings();
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } finally {
      setSaving(false);
    }
  };

  // ── Test webhook ─────────────────────────────────────────────────────────────
  const handleTestWebhook = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/donations/test-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: testScenario }),
      });
      setTestResult(await res.json());
    } catch (e: any) {
      setTestResult({ error: e.message });
    } finally {
      setTestLoading(false);
    }
  };

  // ── Queue flush ──────────────────────────────────────────────────────────────
  const handleFlushQueue = async () => {
    setFlushing(true);
    try {
      await fetch("/api/donations/agent?action=flush_queue");
      await loadAnalytics();
    } finally {
      setFlushing(false);
    }
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-violet-400 via-purple-300 to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
              <Heart className="w-6 h-6 text-violet-400" />
              Donation Management CMS
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Kingdom of Christ Ministries — NGO Finance & Payment Operations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAnalytics}
              disabled={loadingAnalytics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalytics ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleFlushQueue}
              disabled={flushing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-900/40 hover:bg-violet-800/60 border border-violet-700/40 text-violet-300 text-xs font-semibold transition"
            >
              <Zap className={`w-3.5 h-3.5 ${flushing ? "animate-pulse" : ""}`} />
              {flushing ? "Flushing..." : "Flush Retry Queue"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0.5 overflow-x-auto no-scrollbar pb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                    active
                      ? "border-violet-500 text-violet-300 bg-violet-950/30"
                      : "border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ══ OVERVIEW TAB ════════════════════════════════════════ */}
        {activeTab === "overview" && (
          loadingAnalytics ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <KpiCard
                  label="Today's Giving"
                  value={`₹${(analytics.summary.today.total).toLocaleString("en-IN")}`}
                  sub={`${analytics.summary.today.count} donations`}
                  icon={<DollarSign className="w-4 h-4" />}
                  color="from-emerald-600 to-teal-700"
                  glow="shadow-emerald-950/40"
                />
                <KpiCard
                  label="This Month"
                  value={`₹${(analytics.summary.thisMonth.total).toLocaleString("en-IN")}`}
                  sub={analytics.summary.thisMonth.growthPct != null
                    ? `${analytics.summary.thisMonth.growthPct >= 0 ? "+" : ""}${analytics.summary.thisMonth.growthPct}% vs last month`
                    : `${analytics.summary.thisMonth.count} donations`}
                  icon={<Calendar className="w-4 h-4" />}
                  color="from-violet-600 to-indigo-700"
                  glow="shadow-violet-950/40"
                  trend={analytics.summary.thisMonth.growthPct}
                />
                <KpiCard
                  label="Year to Date"
                  value={`₹${(analytics.summary.yearToDate.total).toLocaleString("en-IN")}`}
                  sub={`${analytics.summary.yearToDate.count} total gifts`}
                  icon={<TrendingUp className="w-4 h-4" />}
                  color="from-amber-600 to-orange-700"
                  glow="shadow-amber-950/40"
                />
                <KpiCard
                  label="Failed (30d)"
                  value={`${analytics.summary.failedPayments30d}`}
                  sub="Failed payment sessions"
                  icon={<AlertCircle className="w-4 h-4" />}
                  color={analytics.summary.failedPayments30d > 0 ? "from-rose-700 to-red-800" : "from-slate-700 to-slate-800"}
                  glow="shadow-rose-950/40"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* By Purpose */}
                <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" /> Giving by Purpose (This Month)
                  </h3>
                  <div className="space-y-2.5">
                    {analytics.byPurpose.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-4">No donations this month</p>
                    ) : (
                      (() => {
                        const max = Math.max(...analytics.byPurpose.map(p => p.total), 1);
                        return analytics.byPurpose.slice(0, 8).map((p) => (
                          <div key={p.purpose} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-300 font-semibold truncate">{p.purpose.replace(/_/g, " ")}</span>
                              <span className="text-emerald-400 font-bold ml-2">₹{p.total.toLocaleString("en-IN")} <span className="text-slate-500 font-normal">({p.count})</span></span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all" style={{ width: `${(p.total / max) * 100}%` }} />
                            </div>
                          </div>
                        ));
                      })()
                    )}
                  </div>
                </div>

                {/* UPI App Breakdown */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-violet-400" /> UPI App Usage
                  </h3>
                  <div className="space-y-2">
                    {analytics.byUpiApp.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-4">No data yet</p>
                    ) : analytics.byUpiApp.map((a) => (
                      <div key={a.app} className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${UPI_APP_COLORS[a.app] || UPI_APP_COLORS.UNKNOWN}`}>
                          {UPI_APP_LABELS[a.app] || a.app}
                        </span>
                        <span className="text-xs font-bold text-slate-300">{a.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Donors + Recent */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Donors */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" /> Top Donors (This Month)
                  </h3>
                  <div className="space-y-2">
                    {analytics.topDonors.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-4">No donors this month</p>
                    ) : analytics.topDonors.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-violet-700/40 text-violet-300 flex items-center justify-center text-xs font-black">
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{d.name}</div>
                            <div className="text-[10px] text-slate-500">{d.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-emerald-400">₹{d.total.toLocaleString("en-IN")}</div>
                          <div className="text-[10px] text-slate-500">{d.donations} gifts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Donations */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> Recent Donations
                  </h3>
                  <div className="space-y-2">
                    {analytics.recentDonations.slice(recentPage * 5, recentPage * 5 + 5).map((d) => (
                      <div key={d.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{d.donorName}</div>
                          <div className="text-[10px] text-slate-500">{d.purpose.replace(/_/g, " ")} · {d.branchName}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${UPI_APP_COLORS[d.upiApp] || UPI_APP_COLORS.UNKNOWN}`}>
                            {UPI_APP_LABELS[d.upiApp] || "UPI"}
                          </span>
                          <span className="text-xs font-black text-emerald-400">₹{d.amount.toLocaleString("en-IN")}</span>
                          <a href={`/api/donations/receipt/${d.id}?format=html`} target="_blank" className="text-violet-400 hover:text-violet-300">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  {analytics.recentDonations.length > 5 && (
                    <div className="flex justify-between mt-3">
                      <button onClick={() => setRecentPage(p => Math.max(0, p - 1))} disabled={recentPage === 0} className="text-xs text-slate-400 hover:text-white disabled:opacity-30 transition">← Prev</button>
                      <span className="text-[10px] text-slate-500">Page {recentPage + 1}</span>
                      <button onClick={() => setRecentPage(p => p + 1)} disabled={(recentPage + 1) * 5 >= analytics.recentDonations.length} className="text-xs text-slate-400 hover:text-white disabled:opacity-30 transition">Next →</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Branch Performance */}
              {analytics.byBranch.length > 0 && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" /> Branch Performance (This Month)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {analytics.byBranch.map((b) => (
                      <div key={b.branchId || "general"} className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                        <div className="text-xs font-bold text-white truncate">{b.branchName}</div>
                        <div className="text-base font-black text-emerald-400 mt-1">₹{b.total.toLocaleString("en-IN")}</div>
                        <div className="text-[10px] text-slate-500">{b.count} donations</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
              Failed to load analytics. Check your admin access.
            </div>
          )
        )}

        {/* ══ SETTINGS TAB ═════════════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="space-y-5 max-w-2xl">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-black text-white border-b border-slate-800 pb-3">
                🏦 Payment Configuration
              </h2>

              {loadingSettings ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading settings...
                </div>
              ) : (
                <>
                  <SettingField
                    label="UPI VPA (Payment Address)"
                    hint="The UPI ID shown to donors in the QR code"
                    value={editedSettings.upiId || ""}
                    onChange={(v) => setEditedSettings(s => ({ ...s, upiId: v }))}
                    mono
                  />
                  <SettingField
                    label="Merchant Name"
                    hint="Name shown in UPI app payment confirmation"
                    value={editedSettings.merchantName || ""}
                    onChange={(v) => setEditedSettings(s => ({ ...s, merchantName: v }))}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <SettingField
                      label="QR Expiry (minutes)"
                      hint="How long each QR code stays valid"
                      value={String(editedSettings.qrExpiryMinutes || 10)}
                      onChange={(v) => setEditedSettings(s => ({ ...s, qrExpiryMinutes: parseInt(v) || 10 }))}
                      type="number"
                    />
                    <SettingField
                      label="Min Donation (₹)"
                      hint="Minimum accepted donation"
                      value={String(editedSettings.minDonationAmount || 10)}
                      onChange={(v) => setEditedSettings(s => ({ ...s, minDonationAmount: parseFloat(v) || 10 }))}
                      type="number"
                    />
                  </div>
                  <SettingField
                    label="Max Donation (₹)"
                    hint="Maximum single donation amount"
                    value={String(editedSettings.maxDonationAmount || 500000)}
                    onChange={(v) => setEditedSettings(s => ({ ...s, maxDonationAmount: parseFloat(v) || 500000 }))}
                    type="number"
                  />
                </>
              )}
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-black text-white border-b border-slate-800 pb-3">
                📜 80G Tax Exemption Details
              </h2>
              <SettingField
                label="80G Registration Number"
                hint="e.g. DIT(E)/80G/HYDTSC/2023-24 — shown on every receipt"
                value={editedSettings.eightygRegistrationNo || ""}
                onChange={(v) => setEditedSettings(s => ({ ...s, eightygRegistrationNo: v }))}
                mono
              />
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-black text-white border-b border-slate-800 pb-3">
                📧 Admin Alert Emails
              </h2>
              <SettingField
                label="Admin Alert Emails"
                hint="Comma-separated. Receive donation & payment failure alerts."
                value={editedSettings.adminAlertEmails || ""}
                onChange={(v) => setEditedSettings(s => ({ ...s, adminAlertEmails: v }))}
              />
              <SettingField
                label="Finance Alert Emails"
                hint="Receive detailed finance reports."
                value={editedSettings.financeAlertEmails || ""}
                onChange={(v) => setEditedSettings(s => ({ ...s, financeAlertEmails: v }))}
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-900/40 transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Settings"}
              </button>
              {saveStatus === "success" && (
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Saved!</span>
              )}
              {saveStatus === "error" && (
                <span className="text-rose-400 text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Save failed. Check permissions.</span>
              )}
            </div>
          </div>
        )}

        {/* ══ TRANSACTIONS TAB ════════════════════════════════════ */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Donation Transactions</h2>
              <a
                href="/api/admin/donations/analytics"
                target="_blank"
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </a>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
              {loadingAnalytics ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/50">
                        <th className="text-left p-3 text-slate-400 font-bold uppercase tracking-wide">Donor</th>
                        <th className="text-left p-3 text-slate-400 font-bold uppercase tracking-wide">Amount</th>
                        <th className="text-left p-3 text-slate-400 font-bold uppercase tracking-wide hidden sm:table-cell">Purpose</th>
                        <th className="text-left p-3 text-slate-400 font-bold uppercase tracking-wide hidden md:table-cell">Branch</th>
                        <th className="text-left p-3 text-slate-400 font-bold uppercase tracking-wide hidden lg:table-cell">App</th>
                        <th className="text-left p-3 text-slate-400 font-bold uppercase tracking-wide hidden lg:table-cell">Date</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analytics?.recentDonations || []).map((d) => (
                        <tr key={d.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                          <td className="p-3 font-semibold text-white">{d.donorName}</td>
                          <td className="p-3 font-black text-emerald-400">₹{d.amount.toLocaleString("en-IN")}</td>
                          <td className="p-3 text-slate-300 hidden sm:table-cell">{d.purpose.replace(/_/g, " ")}</td>
                          <td className="p-3 text-slate-400 hidden md:table-cell">{d.branchName}</td>
                          <td className="p-3 hidden lg:table-cell">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${UPI_APP_COLORS[d.upiApp] || UPI_APP_COLORS.UNKNOWN}`}>
                              {UPI_APP_LABELS[d.upiApp] || "UPI"}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 hidden lg:table-cell">{new Date(d.createdAt).toLocaleDateString("en-IN")}</td>
                          <td className="p-3">
                            <a href={`/api/donations/receipt/${d.id}?format=html`} target="_blank" className="text-violet-400 hover:text-violet-300">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      ))}
                      {(!analytics?.recentDonations?.length) && (
                        <tr><td colSpan={7} className="p-8 text-center text-slate-500">No donations found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ WEBHOOKS TAB ════════════════════════════════════════ */}
        {activeTab === "webhooks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Webhook Event History</h2>
              <button onClick={loadWebhooks} disabled={loadingWebhooks} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold transition hover:bg-slate-700 border border-slate-700">
                <RefreshCw className={`w-3 h-3 ${loadingWebhooks ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>

            {/* Status summary from analytics */}
            {analytics?.webhooks?.byStatus && (
              <div className="flex gap-2 flex-wrap">
                {analytics.webhooks.byStatus.map((s) => (
                  <div key={s.status} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    s.status === "PROCESSED" ? "bg-emerald-900/30 border-emerald-700/40 text-emerald-300" :
                    s.status === "FAILED" ? "bg-rose-900/30 border-rose-700/40 text-rose-300" :
                    s.status === "DUPLICATE" ? "bg-amber-900/30 border-amber-700/40 text-amber-300" :
                    "bg-slate-800 border-slate-700 text-slate-400"
                  }`}>
                    {s.status}: {s.count}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
              {loadingWebhooks ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                </div>
              ) : webhookHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/50">
                        <th className="text-left p-3 text-slate-400 font-bold uppercase">Event</th>
                        <th className="text-left p-3 text-slate-400 font-bold uppercase">Status</th>
                        <th className="text-left p-3 text-slate-400 font-bold uppercase hidden sm:table-cell">Payment ID</th>
                        <th className="text-left p-3 text-slate-400 font-bold uppercase hidden md:table-cell">Amount</th>
                        <th className="text-left p-3 text-slate-400 font-bold uppercase hidden lg:table-cell">Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {webhookHistory.map((w: any) => (
                        <tr key={w.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                          <td className="p-3 font-mono font-semibold text-violet-300 text-[10px]">{w.event || "payment.captured"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              w.status === "PROCESSED" ? "bg-emerald-900/30 border-emerald-700/40 text-emerald-300" :
                              w.status === "FAILED" ? "bg-rose-900/30 border-rose-700/40 text-rose-300" :
                              w.status === "DUPLICATE" ? "bg-amber-900/30 border-amber-700/40 text-amber-300" :
                              "bg-slate-700 border-slate-600 text-slate-400"
                            }`}>{w.status}</span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-slate-400 hidden sm:table-cell">{w.razorpayPaymentId?.slice(0, 16) || "—"}...</td>
                          <td className="p-3 font-bold text-slate-300 hidden md:table-cell">{w.amount ? `₹${(w.amount / 100).toLocaleString("en-IN")}` : "—"}</td>
                          <td className="p-3 text-slate-500 hidden lg:table-cell">{w.createdAt ? new Date(w.createdAt).toLocaleString("en-IN") : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Webhook className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No webhook events found</p>
                  <p className="text-xs mt-1">Webhook history will appear once payments are processed</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TESTING TAB ═════════════════════════════════════════ */}
        {activeTab === "testing" && (
          <div className="space-y-4 max-w-xl">
            <div className="bg-amber-950/40 border border-amber-700/40 rounded-xl p-3 text-xs text-amber-200 font-semibold">
              ⚠️ Dev-only: This panel is blocked in production. All scenarios simulate Razorpay webhook events without real UPI transactions.
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white">Simulate Webhook Scenario</h2>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wide">Scenario</label>
                <select
                  value={testScenario}
                  onChange={(e) => setTestScenario(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition"
                >
                  <option value="payment.captured">✅ payment.captured — Full success flow</option>
                  <option value="payment.failed">❌ payment.failed — Mark session failed</option>
                  <option value="duplicate">🔁 duplicate — Duplicate event deduplication</option>
                  <option value="qr_expiry">⏰ qr_expiry — Force QR expiry</option>
                  <option value="amount_mismatch">🚨 amount_mismatch — Security: tampered amount</option>
                </select>
              </div>

              <button
                onClick={handleTestWebhook}
                disabled={testLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-bold text-sm transition disabled:opacity-50"
              >
                {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
                {testLoading ? "Simulating..." : "Run Simulation"}
              </button>

              {testResult && (
                <div className={`rounded-xl p-4 border font-mono text-[11px] leading-relaxed overflow-x-auto ${
                  testResult.success ? "bg-emerald-950/40 border-emerald-700/40 text-emerald-200" :
                  "bg-rose-950/40 border-rose-700/40 text-rose-200"
                }`}>
                  <div className="font-bold mb-2 font-sans text-xs">
                    {testResult.success ? "✅ " : "❌ "}{testResult.message || testResult.error}
                  </div>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, color, glow, trend }: {
  label: string; value: string; sub: string; icon: React.ReactNode;
  color: string; glow: string; trend?: number | null;
}) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-4 shadow-xl ${glow} border border-white/5`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider">{label}</span>
        <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white/80">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black text-white leading-tight">{value}</div>
      <div className="flex items-center gap-1 mt-1">
        {trend != null && (
          trend >= 0
            ? <TrendingUp className="w-3 h-3 text-emerald-300" />
            : <TrendingDown className="w-3 h-3 text-rose-300" />
        )}
        <span className="text-[10px] text-white/60">{sub}</span>
      </div>
    </div>
  );
}

function SettingField({ label, hint, value, onChange, mono, type = "text" }: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; mono?: boolean; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-white">{label}</label>
      {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-slate-800/70 border border-slate-700 hover:border-slate-600 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition ${mono ? "font-mono text-xs" : ""}`}
      />
    </div>
  );
}
