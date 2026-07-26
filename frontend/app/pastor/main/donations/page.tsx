"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import DonationsView from "@/components/pastor/views/DonationsView";

export default function PastorDonationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Tithe & Offering Giving Ledger"
        subtitle="Real-time breakdown of Sunday tithes, online offerings, building fund contributions, and donor records"
        badge="Financial Oversight"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={() => alert("Donations ledger exported")}
      />
      
      <DonationsView triggerToast={(msg, type) => alert(msg)} />
    </div>
  );
}
