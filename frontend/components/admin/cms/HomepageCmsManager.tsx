"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Layout,
  BarChart3,
  MapPin,
  Globe,
  Info,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type {
  HeroContent,
  SiteStatistic,
  SiteContact,
  FooterConfig,
  NavigationItem,
  AboutConfig,
  AboutValue,
  ContactPhone,
} from "@/types/cms";

type CmsSubTab = "hero" | "stats" | "contact" | "footer" | "about";

export default function HomepageCmsManager() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<CmsSubTab>("hero");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── States for each section ───────────────────────────────────────────────
  const [hero, setHero] = useState<Partial<HeroContent>>({});
  const [stats, setStats] = useState<SiteStatistic[]>([]);
  const [contacts, setContacts] = useState<SiteContact[]>([]);
  const [footer, setFooter] = useState<Partial<FooterConfig>>({});
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [about, setAbout] = useState<Partial<AboutConfig>>({});

  const [loading, setLoading] = useState(true);

  // ── Fetch all CMS data ───────────────────────────────────────────────────
  const fetchAllCmsData = async () => {
    setLoading(true);
    try {
      const [heroRes, statsRes, contactRes, footerRes, navRes, aboutRes] = await Promise.all([
        fetch("/api/cms/hero"),
        fetch("/api/cms/statistics"),
        fetch("/api/cms/contact"),
        fetch("/api/cms/footer"),
        fetch("/api/cms/navigation"),
        fetch("/api/cms/about"),
      ]);

      const [heroData, statsData, contactData, footerData, navData, aboutData] = await Promise.all([
        heroRes.json(),
        statsRes.json(),
        contactRes.json(),
        footerRes.json(),
        navRes.json(),
        aboutRes.json(),
      ]);

      if (heroData.data) setHero(heroData.data);
      if (statsData.data) setStats(statsData.data);
      if (contactData.data) setContacts(contactData.data);
      if (footerData.data) setFooter(footerData.data);

      // navData can be object grouped by placement or array
      if (navData.data) {
        if (Array.isArray(navData.data)) {
          setNavItems(navData.data);
        } else {
          const flat = Object.values(navData.data).flat() as NavigationItem[];
          setNavItems(flat);
        }
      }

      if (aboutData.data) setAbout(aboutData.data);
    } catch (err) {
      console.error("[HomepageCmsManager] Fetch error:", err);
      setMessage({ type: "error", text: "Failed to load CMS content." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCmsData();
  }, []);

  const triggerRevalidate = async (tags: string[]) => {
    try {
      await fetch("/api/cms/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });
    } catch (err) {
      console.error("[Revalidate error]", err);
    }
  };

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // ── Save Handlers ────────────────────────────────────────────────────────
  const saveHero = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hero),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update Hero");
      await triggerRevalidate(["cms-hero"]);
      showMsg("success", "Hero section updated successfully!");
    } catch (err: any) {
      showMsg("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveStats = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/statistics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statistics: stats.map((s, idx) => ({ ...s, displayOrder: idx })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update Statistics");
      await triggerRevalidate(["cms-statistics"]);
      showMsg("success", "Statistics updated successfully!");
    } catch (err: any) {
      showMsg("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveContactBranch = async (branch: SiteContact) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/cms/contact?key=${branch.branchKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update Contact branch");
      await triggerRevalidate(["cms-contact"]);
      showMsg("success", `${branch.branchName} contact updated!`);
    } catch (err: any) {
      showMsg("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveFooter = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(footer),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update Footer");
      await triggerRevalidate(["cms-footer"]);
      showMsg("success", "Footer configuration updated!");
    } catch (err: any) {
      showMsg("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAbout = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(about),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update About");
      await triggerRevalidate(["cms-about"]);
      showMsg("success", "About section updated successfully!");
    } catch (err: any) {
      showMsg("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* CMS Header & Status Notification */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-500" />
            Homepage Dynamic CMS
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage every section, title, image, stat, and contact detail across the KCM Church website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllCmsData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-violet-500" : ""}`} />
            Refresh
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Live Preview
          </a>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-x-auto">
        {[
          { id: "hero", label: "Hero Section", icon: Layout },
          { id: "stats", label: "Statistics & Counter Cards", icon: BarChart3 },
          { id: "contact", label: "Contact & Branches", icon: MapPin },
          { id: "footer", label: "Footer & Social Links", icon: Globe },
          { id: "about", label: "About Ministry", icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CmsSubTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-white dark:bg-violet-600 text-violet-600 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: HERO SECTION ────────────────────────────────────────────── */}
      {activeTab === "hero" && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layout className="w-5 h-5 text-violet-500" />
              Hero Section Settings
            </h3>
            <button
              onClick={saveHero}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Hero"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Top Announcement Badge Text
              </label>
              <input
                type="text"
                value={hero.badgeText || ""}
                onChange={(e) => setHero({ ...hero, badgeText: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm"
                placeholder="We are here for you 24/7"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Headline
              </label>
              <input
                type="text"
                value={hero.headline || ""}
                onChange={(e) => setHero({ ...hero, headline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm"
                placeholder="Welcome to"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Gradient Church Title (Subheadline)
              </label>
              <input
                type="text"
                value={hero.subheadline || ""}
                onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm"
                placeholder="Kingdom of Christ"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Subtitle Description
              </label>
              <textarea
                rows={3}
                value={hero.subtitle || ""}
                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm"
                placeholder="A place of Love, Faith, and Miracles"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-white/10 pt-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">CTA Buttons Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary CTA */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                <span className="text-xs font-bold text-violet-500 uppercase tracking-wider">Primary Button</span>
                <input
                  type="text"
                  value={hero.ctaPrimaryText || ""}
                  onChange={(e) => setHero({ ...hero, ctaPrimaryText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-semibold"
                  placeholder="Button Text"
                />
                <input
                  type="text"
                  value={hero.ctaPrimaryHref || ""}
                  onChange={(e) => setHero({ ...hero, ctaPrimaryHref: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs text-slate-500"
                  placeholder="Link Href (#services)"
                />
              </div>

              {/* Secondary CTA */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Secondary Button</span>
                <input
                  type="text"
                  value={hero.ctaSecondaryText || ""}
                  onChange={(e) => setHero({ ...hero, ctaSecondaryText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-semibold"
                  placeholder="Button Text"
                />
                <input
                  type="text"
                  value={hero.ctaSecondaryHref || ""}
                  onChange={(e) => setHero({ ...hero, ctaSecondaryHref: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs text-slate-500"
                  placeholder="Link Href (#sermons)"
                />
              </div>

              {/* Tertiary CTA */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Tertiary Button</span>
                <input
                  type="text"
                  value={hero.ctaTertiaryText || ""}
                  onChange={(e) => setHero({ ...hero, ctaTertiaryText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-semibold"
                  placeholder="Button Text"
                />
                <input
                  type="text"
                  value={hero.ctaTertiaryHref || ""}
                  onChange={(e) => setHero({ ...hero, ctaTertiaryHref: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs text-slate-500"
                  placeholder="Link Href (/prayer)"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: STATISTICS ──────────────────────────────────────────────── */}
      {activeTab === "stats" && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-500" />
              Homepage Statistics Cards
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const newStat: SiteStatistic = {
                    id: `stat-${Date.now()}`,
                    key: `stat_${Date.now()}`,
                    label: "New Stat",
                    labelTe: "",
                    labelHi: "",
                    value: "100+",
                    icon: "Users",
                    colorScheme: "violet",
                    autoCompute: false,
                    computeFrom: null,
                    displayOrder: stats.length,
                    isActive: true,
                    updatedById: null,
                    updatedAt: new Date().toISOString(),
                  };
                  setStats([...stats, newStat]);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                <Plus className="w-4 h-4" /> Add Stat Card
              </button>
              <button
                onClick={saveStats}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Statistics"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <div
                key={stat.id || idx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-violet-500 uppercase tracking-wider">
                    Card #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (idx === 0) return;
                        const copy = [...stats];
                        const temp = copy[idx - 1];
                        copy[idx - 1] = copy[idx];
                        copy[idx] = temp;
                        setStats(copy);
                      }}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (idx === stats.length - 1) return;
                        const copy = [...stats];
                        const temp = copy[idx + 1];
                        copy[idx + 1] = copy[idx];
                        copy[idx] = temp;
                        setStats(copy);
                      }}
                      disabled={idx === stats.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setStats(stats.filter((_, i) => i !== idx))}
                      className="p-1 text-rose-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Label (English)
                    </label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const copy = [...stats];
                        copy[idx].label = e.target.value;
                        setStats(copy);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Counter Value
                    </label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const copy = [...stats];
                        copy[idx].value = e.target.value;
                        setStats(copy);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-extrabold text-violet-600 dark:text-violet-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Telugu Label
                    </label>
                    <input
                      type="text"
                      value={stat.labelTe || ""}
                      onChange={(e) => {
                        const copy = [...stats];
                        copy[idx].labelTe = e.target.value;
                        setStats(copy);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Color Scheme
                    </label>
                    <select
                      value={stat.colorScheme}
                      onChange={(e) => {
                        const copy = [...stats];
                        copy[idx].colorScheme = e.target.value as any;
                        setStats(copy);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="violet">Violet</option>
                      <option value="emerald">Emerald</option>
                      <option value="amber">Amber</option>
                      <option value="rose">Rose</option>
                      <option value="blue">Blue</option>
                      <option value="teal">Teal</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: CONTACT & BRANCHES ──────────────────────────────────────── */}
      {activeTab === "contact" && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-white/10 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-violet-500" />
              Branch Contacts & Google Maps
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Edit addresses, phone numbers, and Google Maps embed links for each church branch.
            </p>
          </div>

          <div className="space-y-8">
            {contacts.map((c, idx) => (
              <div
                key={c.id || idx}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-violet-500" />
                    {c.branchName} ({c.branchKey})
                  </h4>
                  <button
                    onClick={() => saveContactBranch(c)}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Save className="w-3.5 h-3.5" /> Save {c.branchName}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={c.branchName}
                      onChange={(e) => {
                        const copy = [...contacts];
                        copy[idx].branchName = e.target.value;
                        setContacts(copy);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Service Hours / Schedule
                    </label>
                    <input
                      type="text"
                      value={c.serviceHours || ""}
                      onChange={(e) => {
                        const copy = [...contacts];
                        copy[idx].serviceHours = e.target.value;
                        setContacts(copy);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs"
                      placeholder="Sunday: 5:45 AM – 8:30 AM"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Address (Multi-line)
                    </label>
                    <textarea
                      rows={3}
                      value={c.address}
                      onChange={(e) => {
                        const copy = [...contacts];
                        copy[idx].address = e.target.value;
                        setContacts(copy);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Google Maps Direct URL
                    </label>
                    <input
                      type="text"
                      value={c.mapsUrl}
                      onChange={(e) => {
                        const copy = [...contacts];
                        copy[idx].mapsUrl = e.target.value;
                        setContacts(copy);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Google Maps Embed iFrame URL
                    </label>
                    <input
                      type="text"
                      value={c.embedUrl}
                      onChange={(e) => {
                        const copy = [...contacts];
                        copy[idx].embedUrl = e.target.value;
                        setContacts(copy);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: FOOTER & SOCIAL LINKS ───────────────────────────────────── */}
      {activeTab === "footer" && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-violet-500" />
              Footer Configuration & Social Links
            </h3>
            <button
              onClick={saveFooter}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Footer"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Scripture / Tagline Quote (English)
              </label>
              <textarea
                rows={2}
                value={footer.tagline || ""}
                onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Email Address
              </label>
              <input
                type="email"
                value={footer.email || ""}
                onChange={(e) => setFooter({ ...footer, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Google Maps Link
              </label>
              <input
                type="text"
                value={footer.mapsUrl || ""}
                onChange={(e) => setFooter({ ...footer, mapsUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                YouTube Channel URL
              </label>
              <input
                type="text"
                value={footer.youtubeUrl || ""}
                onChange={(e) => setFooter({ ...footer, youtubeUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Instagram URL
              </label>
              <input
                type="text"
                value={footer.instagramUrl || ""}
                onChange={(e) => setFooter({ ...footer, instagramUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: ABOUT SECTION ───────────────────────────────────────────── */}
      {activeTab === "about" && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-violet-500" />
              About Ministry Content & Mission
            </h3>
            <button
              onClick={saveAbout}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save About Section"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Section Badge Pill Text
              </label>
              <input
                type="text"
                value={about.sectionBadge || ""}
                onChange={(e) => setAbout({ ...about, sectionBadge: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm"
                placeholder="Who We Are"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Main Heading
              </label>
              <input
                type="text"
                value={about.heading || ""}
                onChange={(e) => setAbout({ ...about, heading: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-bold"
                placeholder="About Our Ministry"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Section Subtitle
              </label>
              <textarea
                rows={2}
                value={about.subtitle || ""}
                onChange={(e) => setAbout({ ...about, subtitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mission Card Title
              </label>
              <input
                type="text"
                value={about.missionTitle || ""}
                onChange={(e) => setAbout({ ...about, missionTitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-bold"
                placeholder="Our Mission"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mission Statement Body Text
              </label>
              <textarea
                rows={4}
                value={about.missionText || ""}
                onChange={(e) => setAbout({ ...about, missionText: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
