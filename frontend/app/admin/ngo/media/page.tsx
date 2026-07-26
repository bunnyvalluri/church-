"use client";

import React, { useState } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import NgoManagement from "@/components/admin/NgoManagement";
import { Camera } from "lucide-react";

export default function NgoMediaPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AdminPageTemplate
      title="Field Photos & Impact Video Media"
      description="Gallery of outreach event photographs, field reports, and beneficiary impact testimonies."
      icon={Camera}
      isLoading={loading}
    >
      <NgoManagement />
    </AdminPageTemplate>
  );
}
