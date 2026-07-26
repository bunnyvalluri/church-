"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import DashboardOverview from "@/components/admin/DashboardOverview";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ExecutiveDashboardPage() {
  const { getIdToken } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const token = await getIdToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/admin/dashboard-data", { headers });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result);
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminPageTemplate
      title="Executive Analytics Dashboard"
      description="Real-time operational summary across congregation, financial ledgers, and ministry activities."
      icon={LayoutDashboard}
      onRefresh={loadData}
      isLoading={loading}
    >
      <DashboardOverview
        users={data?.users || []}
        donations={data?.donations || []}
        sermons={data?.sermons || []}
        events={data?.events || []}
        announcements={data?.announcements || []}
        attendanceRecords={data?.records || []}
        searchTerm=""
        onNavigate={() => {}}
        onAddMember={() => {}}
        onDeleteMember={() => {}}
        onAddSermon={() => {}}
        onDeleteSermon={() => {}}
      />
    </AdminPageTemplate>
  );
}
