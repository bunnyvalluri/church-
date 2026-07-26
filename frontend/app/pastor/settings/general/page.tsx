"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";

export default function PastorGeneralSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="General Church & Ministry Settings"
        subtitle="Configure church organization parameters, sanctuary address, and helpline contacts"
        badge="General Settings"
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 p-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm max-w-2xl mx-auto space-y-4">
        <p className="text-xs text-slate-500 dark:text-gray-400">General platform parameters and church contact configurations.</p>
      </div>
    </div>
  );
}
