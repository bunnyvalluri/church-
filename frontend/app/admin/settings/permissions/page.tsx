"use client";

import React, { useState } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import SettingsManagement from "@/components/admin/SettingsManagement";
import { KeyRound } from "lucide-react";

export default function PermissionsMatrixPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AdminPageTemplate
      title="Permissions Control Matrix"
      description="Fine-grained feature gates, API endpoint permissions, and RBAC (Role-Based Access Control) matrix."
      icon={KeyRound}
      isLoading={loading}
    >
      <SettingsManagement
        onSaveConfig={async () => {}}
        activeSubTab="permissions"
      />
    </AdminPageTemplate>
  );
}
