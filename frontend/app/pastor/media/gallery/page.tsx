"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";

export default function PastorMediaGalleryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Photo Gallery & Event Photography"
        subtitle="High-resolution event photography, Sunday worship snapshots, and outreach photo albums"
        badge="Photo Library"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        primaryActionLabel="Upload Photos"
        onPrimaryAction={() => alert("Upload photo album")}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 p-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
        <p className="text-xs text-slate-500 dark:text-gray-400">Photo gallery albums and worship event photography.</p>
      </div>
    </div>
  );
}
