"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { MessageSquare, Send, User } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorMessagesPage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.messagesTitle}
        subtitle={t.messagesSubtitle}
        badge={t.messagesBadge}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t.messagesPlaceholder}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-8 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-4 text-center">
        <MessageSquare className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto" />
        <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">{t.noMessagesText}</p>
      </div>
    </div>
  );
}
