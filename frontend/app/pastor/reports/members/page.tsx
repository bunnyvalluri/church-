"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorMemberReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.memberReportTitle}
        subtitle={t.memberReportSubtitle}
        badge={t.demographicsBadge}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={() => alert("Member report exported")}
      />
    </div>
  );
}
