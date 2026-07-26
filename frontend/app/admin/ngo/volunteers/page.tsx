"use client";

import React, { useState } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import NgoManagement from "@/components/admin/NgoManagement";
import { UserCog } from "lucide-react";

export default function NgoVolunteersPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AdminPageTemplate
      title="NGO Volunteers Roster"
      description="Field volunteer assignments, emergency contact information, and service hours tracking."
      icon={UserCog}
      isLoading={loading}
    >
      <NgoManagement activeSubView="volunteers" />
    </AdminPageTemplate>
  );
}
