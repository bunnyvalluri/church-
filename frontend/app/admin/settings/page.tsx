"use client";

import React, { useState } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import SettingsManagement from "@/components/admin/SettingsManagement";
import { Settings } from "lucide-react";

export default function SettingsOverviewPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AdminPageTemplate
      title="Platform Settings & Configuration"
      description="System preferences, Church organization parameters, authentication policies, and security."
      icon={Settings}
      isLoading={loading}
    >
      <SettingsManagement
        onSaveConfig={async () => {}}
        activeSubTab="settings"
      />
    </AdminPageTemplate>
  );
}
