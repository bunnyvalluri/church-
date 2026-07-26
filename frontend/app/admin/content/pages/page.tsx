"use client";

import React, { useState } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import HomepageCmsManager from "@/components/admin/cms/HomepageCmsManager";
import { FileText } from "lucide-react";

export default function PagesCmsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AdminPageTemplate
      title="Public Page CMS"
      description="Edit hero section text, vision statement, service schedules, pastor biography, and contact info."
      icon={FileText}
      isLoading={loading}
    >
      <HomepageCmsManager />
    </AdminPageTemplate>
  );
}
