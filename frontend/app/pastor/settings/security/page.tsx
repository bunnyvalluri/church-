"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";
import { ShieldCheck, Lock, Clock, FileCheck, Save } from "lucide-react";

export default function PastorSecuritySettingsPage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    twoFactor: true,
    sessionTimeout: true,
    auditLog: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.securitySettingsTitle}
        subtitle={t.securitySettingsSubtitle}
        badge={t.accessControlBadge}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm max-w-3xl mx-auto space-y-6">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            {t.securitySettingsTitle}
          </h3>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <span>✓</span> {t.securitySavedMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                {t.twoFactorAuth}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-gray-400">{t.twoFactorAuthDesc}</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.twoFactor}
              onChange={(e) => setPrefs({ ...prefs, twoFactor: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {t.sessionTimeout}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-gray-400">{t.sessionTimeoutDesc}</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.sessionTimeout}
              onChange={(e) => setPrefs({ ...prefs, sessionTimeout: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                {t.auditLogging}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-gray-400">{t.auditLoggingDesc}</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.auditLog}
              onChange={(e) => setPrefs({ ...prefs, auditLog: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
            />
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
