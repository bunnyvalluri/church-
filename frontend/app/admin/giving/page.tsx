"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Heart, 
  IndianRupee, 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2,
  Building,
  ShieldCheck,
  Layout,
  ListOrdered
} from 'lucide-react';

export default function AdminGivingCmsPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'purposes' | 'amounts' | 'form'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // CMS State Data
  const [heroConfig, setHeroConfig] = useState<any>({
    headline: "Sow a Seed of Faith & Transform Lives",
    subtitle: "Your generous giving supports our local church services, community outreach programs, youth development, and global missions.",
    badgeText: "100% Tax Exempt (80G) & Secure",
    campaignBannerText: "",
    campaignBannerHref: "",
  });

  const [purposes, setPurposes] = useState<any[]>([]);
  const [amounts, setAmounts] = useState<any[]>([]);
  const [formFields, setFormFields] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCmsData() {
      try {
        setLoading(true);
        const res = await fetch('/api/donations/config');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.heroConfig) setHeroConfig(data.heroConfig);
            if (data.causes) setPurposes(data.causes);
            if (data.amounts) setAmounts(data.amounts);
            if (data.formFields) setFormFields(data.formFields);
          }
        }
      } catch (err) {
        console.error('Failed to load CMS data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCmsData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveHero = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/cms/giving-hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroConfig),
      });
      showToast("Hero CMS Configuration Saved!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <p className="text-sm font-bold mt-3 text-slate-400">Loading Giving CMS Admin Panel...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-950 text-white min-h-screen">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-violet-400 via-purple-400 to-amber-300 bg-clip-text text-transparent">
            <Sparkles className="w-8 h-8 text-violet-400" /> Dynamic Giving Platform CMS
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage dynamic hero content, preset amounts, causes, form fields, and payment rules.
          </p>
        </div>

        <a
          href="/member/give"
          target="_blank"
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow"
        >
          View Live Giving Page ↗
        </a>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'hero' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4" /> Hero Banner CMS
        </button>
        <button
          onClick={() => setActiveTab('purposes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'purposes' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" /> Causes & Purposes
        </button>
        <button
          onClick={() => setActiveTab('amounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'amounts' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <IndianRupee className="w-4 h-4" /> Preset Amounts
        </button>
        <button
          onClick={() => setActiveTab('form')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'form' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ListOrdered className="w-4 h-4" /> Donor Form Fields
        </button>
      </div>

      {/* TAB CONTENT: HERO */}
      {activeTab === 'hero' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-violet-400" /> Giving Hero Section Customization
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Headline</label>
              <input
                type="text"
                value={heroConfig.headline}
                onChange={(e) => setHeroConfig({ ...heroConfig, headline: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subtitle</label>
              <textarea
                rows={3}
                value={heroConfig.subtitle}
                onChange={(e) => setHeroConfig({ ...heroConfig, subtitle: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Badge Text</label>
              <input
                type="text"
                value={heroConfig.badgeText}
                onChange={(e) => setHeroConfig({ ...heroConfig, badgeText: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Campaign Alert Banner Text (Optional)</label>
              <input
                type="text"
                value={heroConfig.campaignBannerText || ''}
                onChange={(e) => setHeroConfig({ ...heroConfig, campaignBannerText: e.target.value })}
                placeholder="e.g. Special Festival & Outreach Drive active!"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>

            <button
              onClick={handleSaveHero}
              disabled={saving}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-bold text-sm shadow flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Hero Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PURPOSES */}
      {activeTab === 'purposes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" /> Active Giving Purposes & Targets
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {purposes.map((p) => (
              <div key={p.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{p.nameEn}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-violet-900/60 text-violet-300 font-mono">{p.code}</span>
                </div>
                <p className="text-xs text-slate-400">{p.descEn}</p>
                {p.targetAmount && (
                  <div className="text-xs text-slate-500 font-medium pt-1">
                    Target: ₹{p.targetAmount.toLocaleString('en-IN')} • Raised: ₹{(p.raisedAmount || 0).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AMOUNTS */}
      {activeTab === 'amounts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-400" /> Preset Donation Amounts
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {amounts.map((a) => (
              <div key={a.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center font-bold text-base text-white">
                ₹{a.amount.toLocaleString('en-IN')}
                {a.isPopular && <span className="block text-[10px] text-amber-400 uppercase tracking-wider mt-1">Popular</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: FORM FIELDS */}
      {activeTab === 'form' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-violet-400" /> Configured Donor Form Fields
          </h3>
          <div className="space-y-3">
            {formFields.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold">
                <span className="text-white">{f.label} ({f.fieldName})</span>
                <span className="text-slate-400 uppercase">{f.fieldType} • {f.isRequired ? 'Required' : 'Optional'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
