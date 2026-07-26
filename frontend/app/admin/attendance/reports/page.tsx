"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import AttendanceManagement from "@/components/admin/AttendanceManagement";
import { BarChart3 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AttendanceReportsPage() {
  const { getIdToken } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/admin/dashboard-data", { headers });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminPageTemplate
      title="Attendance Growth & Visitor Analytics"
      description="Quarterly retention curves, first-time visitor follow-up ratios, and trend reports."
      icon={BarChart3}
      onRefresh={loadData}
      isLoading={loading}
    >
      <AttendanceManagement
        events={data?.events || []}
        users={data?.users || []}
        records={data?.records || []}
        onAddAttendance={() => {}}
        activeSubTab="reports"
      />
    </AdminPageTemplate>
  );
}
