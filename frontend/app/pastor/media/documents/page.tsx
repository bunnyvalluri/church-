"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";

export default function PastorMediaDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Document Library & Study Outlines"
        subtitle="PDF study guides, baptism certificates, administrative policies, and pastoral teaching resources"
        badge="Document Library"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        primaryActionLabel="Upload Document"
        onPrimaryAction={() => alert("Upload document file")}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 p-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
        <p className="text-xs text-slate-500 dark:text-gray-400">PDF study guides and administrative pastoral document library.</p>
      </div>
    </div>
  );
}
