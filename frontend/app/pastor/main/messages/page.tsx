"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { MessageSquare, Send, User } from "lucide-react";

export default function PastorMessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Pastoral Messages & Helpline Inquiries"
        subtitle="Direct communication inbox for church member inquiries, pastoral counseling, and guidance messages"
        badge="Inquiries Inbox"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-4">
        <p className="text-xs text-slate-500 dark:text-gray-400">Pastoral inbox messages and counseling tickets appear here.</p>
      </div>
    </div>
  );
}
