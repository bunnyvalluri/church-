"use client";

import React, { useState } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import SettingsManagement from "@/components/admin/SettingsManagement";
import { Lock } from "lucide-react";

export default function SecurityAuditPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AdminPageTemplate
      title="Security & Audit Logs"
      description="View security event logs, failed login attempts, API token invocations, and system integrity status."
      icon={Lock}
      isLoading={loading}
    >
      <SettingsManagement
        onSaveConfig={async () => {}}
        activeSubTab="permissions"
      />
    </AdminPageTemplate>
  );
}
