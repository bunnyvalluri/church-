"use client";

import React from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import NgoManagement from "@/components/admin/NgoManagement";

export default function PastorNgoMediaPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="NGO Field Media & Beneficiary Stories"
        subtitle="Upload photo galleries, video documentaries, and testimony articles for community outreach projects"
        badge="Field Media"
      />
      <NgoManagement activeSubView="media" />
    </div>
  );
}
