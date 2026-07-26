"use client";

import React, { useState } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import NgoManagement from "@/components/admin/NgoManagement";
import { FolderKanban } from "lucide-react";

export default function NgoProjectsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AdminPageTemplate
      title="Outreach Projects & Campaigns"
      description="Manage ongoing social initiatives, budget allocation, beneficiary statistics, and progress logs."
      icon={FolderKanban}
      isLoading={loading}
    >
      <NgoManagement />
    </AdminPageTemplate>
  );
}
