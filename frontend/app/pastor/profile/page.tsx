"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { Save } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorProfilePage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [profile, setProfile] = useState({
    name: "Bishop Kurra Kristhu Raju",
    title: "Senior Pastor & Founder",
    email: "bishop.kraju@kcmchurch.org",
    phone: "+91 97040 90069",
    bio: "Bishop Kurra Kristhu Raju has been serving in ministry with unwavering dedication. His passion for souls and commitment to God's Word has transformed countless lives across Hyderabad and beyond."
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.pastorProfileTitle}
        subtitle={t.pastorProfileSubtitle}
        badge={t.pastoralCredentialsBadge}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 p-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm max-w-2xl mx-auto space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1">{t.profileNameLabel}</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1">{t.profileTitleLabel}</label>
            <input type="text" value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1">{t.profileEmailLabel}</label>
            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1">{t.profilePhoneLabel}</label>
            <input type="text" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1">{t.profileBioLabel}</label>
          <textarea rows={4} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white leading-relaxed resize-none" />
        </div>

        <button type="button" onClick={() => alert("Profile updated!")} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5">
          <Save className="w-4 h-4" /> {t.saveProfileBtn}
        </button>
      </div>
    </div>
  );
}
