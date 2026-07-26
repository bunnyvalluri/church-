"use client";

import React, { useState } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import SettingsManagement from "@/components/admin/SettingsManagement";
import { Globe } from "lucide-react";

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AdminPageTemplate
      title="General Church Parameters"
      description="Church name, address, contact phone, email server keys (Resend), SMS gateway (Twilio), and Razorpay IDs."
      icon={Globe}
      isLoading={loading}
    >
      <SettingsManagement
        onSaveConfig={async () => {}}
        activeSubTab="settings"
      />
    </AdminPageTemplate>
  );
}
