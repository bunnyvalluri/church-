"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import AttendanceManagement from "@/components/admin/AttendanceManagement";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function EventAttendancePage() {
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
      title="Event & Special Service Attendance"
      description="Special conference attendances, baptism ceremonies, retreats, and crusade check-ins."
      icon={CalendarDays}
      onRefresh={loadData}
      isLoading={loading}
    >
      <AttendanceManagement
        events={data?.events || []}
        users={data?.users || []}
        records={data?.records || []}
        onAddAttendance={() => {}}
        activeSubTab="event-attendance"
      />
    </AdminPageTemplate>
  );
}
