"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";

export default function PastorPreferencesSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Workspace UI Preferences & Localization"
        subtitle="Theme defaults, default landing view, timezone preferences, and language translations"
        badge="UI Preferences"
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 p-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Enable Telugu Translation Toggle</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Allow one-click bilingual switching in header</p>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600" />
        </div>
      </div>
    </div>
  );
}
