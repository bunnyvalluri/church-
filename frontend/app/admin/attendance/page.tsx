"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import AttendanceManagement from "@/components/admin/AttendanceManagement";
import { CalendarCheck } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AttendanceOverviewPage() {
  const { getIdToken } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = await Promise.race([
        getIdToken(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 50))
      ]);
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/admin/attendance/data", { headers });
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
      title="Attendance Hub"
      description="Track Sunday service headcounts, midweek prayer meetings, first-time visitors, and sanctuary growth."
      icon={CalendarCheck}
      onRefresh={loadData}
      isLoading={loading}
    >
      <AttendanceManagement
        events={data?.events || []}
        users={data?.users || []}
        records={data?.records || []}
        initialCheckins={data?.checkins}
        onRefresh={loadData}
        activeSubTab="records"
        isLoading={loading}
      />
    </AdminPageTemplate>
  );
}

