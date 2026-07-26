"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";
import { Save, Building2, MapPin, Phone, Mail, Clock, Globe } from "lucide-react";

export default function PastorGeneralSettingsPage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [settings, setSettings] = useState({
    churchName: "Kingdom of Christ Ministries",
    sanctuaryAddress: "H.No 6-3-121, Main Road, Shapur Nagar, Jeedimetla, Hyderabad, Telangana 500055",
    helplinePhone: "+91 97040 90069",
    officialEmail: "contact@kcmchurch.org",
    timezone: "Asia/Kolkata (IST +05:30)",
    defaultLanguage: "Telugu & English (Bilingual)"
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.generalSettingsTitle}
        subtitle={t.generalSettingsSubtitle}
        badge={t.systemConfigBadge}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm max-w-3xl mx-auto space-y-6">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-500" />
            {t.generalSettingsTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            {t.generalConfigDesc}
          </p>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <span>✓</span> {t.generalSettingsSavedMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Church Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5 mb-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {t.churchNameLabel}
            </label>
            <input
              type="text"
              value={settings.churchName}
              onChange={(e) => setSettings({ ...settings, churchName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Sanctuary Address */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {t.sanctuaryAddressLabel}
            </label>
            <textarea
              rows={3}
              value={settings.sanctuaryAddress}
              onChange={(e) => setSettings({ ...settings, sanctuaryAddress: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
            />
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {t.helplinePhoneLabel}
              </label>
              <input
                type="text"
                value={settings.helplinePhone}
                onChange={(e) => setSettings({ ...settings, helplinePhone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {t.officialEmailLabel}
              </label>
              <input
                type="email"
                value={settings.officialEmail}
                onChange={(e) => setSettings({ ...settings, officialEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Timezone & Default Language Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {t.timezoneLabel}
              </label>
              <input
                type="text"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                {t.defaultLanguageLabel}
              </label>
              <input
                type="text"
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveSettingsBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
