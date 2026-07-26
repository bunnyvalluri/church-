"use client";

import React from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import NgoManagement from "@/components/admin/NgoManagement";

export default function PastorNgoProjectsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="NGO Humanitarian & Outreach Projects"
        subtitle="Manage community feeding programs, educational sponsorship, and rural medical camps"
        badge="Community Outreach"
      />
      <NgoManagement activeSubView="projects" />
    </div>
  );
}
