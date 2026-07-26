"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import AttendanceManagement from "@/components/admin/AttendanceManagement";
import { FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AttendanceRecordsPage() {
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
      title="Service Attendance Records"
      description="Historical ledger of worship service attendances, split by main sanctuary, youth service, and kids church."
      icon={FileSpreadsheet}
      onRefresh={loadData}
      isLoading={loading}
    >
      <AttendanceManagement
        events={data?.events || []}
        users={data?.users || []}
        records={data?.records || []}
        onAddAttendance={() => {}}
        activeSubTab="records"
      />
    </AdminPageTemplate>
  );
}
