"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import PrayerRequests from "@/components/admin/PrayerRequests";
import { Heart } from "lucide-react";

export default function PrayerRequestsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AdminPageTemplate
      title="Prayer Requests Desk"
      description="Review, assign, pray for, and track testimonies submitted by believers."
      icon={Heart}
      isLoading={loading}
    >
      <PrayerRequests />
    </AdminPageTemplate>
  );
}
