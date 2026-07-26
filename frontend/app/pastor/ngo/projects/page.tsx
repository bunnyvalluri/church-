"use client";

import React from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import NgoManagement from "@/components/admin/NgoManagement";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorNgoProjectsPage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.ngoProjectsTitle}
        subtitle={t.ngoProjectsSubtitle}
        badge={t.outreachBadge}
      />
      <NgoManagement activeSubView="projects" />
    </div>
  );
}

