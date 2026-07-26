"use client";

import React from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import DonationsView from "@/components/pastor/views/DonationsView";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorDonationsPage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.donationsTitle}
        subtitle={t.donationsSubtitle}
        badge={t.financialOversight}
      />
      
      <DonationsView triggerToast={(msg, type) => {}} />
    </div>
  );
}
