"use client";

import React from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import NgoManagement from "@/components/admin/NgoManagement";

export default function PastorNgoVolunteersPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="NGO Field Volunteers & Relief Drivers"
        subtitle="Manage NGO volunteer assignments, emergency response teams, and medical mission volunteers"
        badge="Field Team"
      />
      <NgoManagement activeSubView="volunteers" />
    </div>
  );
}
