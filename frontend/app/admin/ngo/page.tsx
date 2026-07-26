"use client";

import React, { useState } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import NgoManagement from "@/components/admin/NgoManagement";
import { HeartHandshake } from "lucide-react";

export default function NgoOverviewPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AdminPageTemplate
      title="NGO & Community Outreach Operations"
      description="Oversee charity initiatives, food distribution drives, medical camps, and community relief projects."
      icon={HeartHandshake}
      isLoading={loading}
    >
      <NgoManagement />
    </AdminPageTemplate>
  );
}
