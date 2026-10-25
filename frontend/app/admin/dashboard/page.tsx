"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import DashboardOverview from "@/components/admin/DashboardOverview";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ExecutiveDashboardPage() {
  const router = useRouter();
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

  const handleNavigate = (view: string) => {
    switch (view) {
      case "members":
        router.push("/admin/members");
        break;
      case "donations":
        router.push("/admin/donations");
        break;
      case "reports":
        router.push("/admin/attendance/reports");
        break;
      case "attendance":
        router.push("/admin/attendance");
        break;
      case "events":
        router.push("/admin/content/events");
        break;
      case "announcements":
        router.push("/admin/content/announcements");
        break;
      case "sermons":
        router.push("/admin/content/sermons");
        break;
      case "content":
        router.push("/admin/content");
        break;
      case "finance":
        router.push("/admin/finance");
        break;
      case "settings":
        router.push("/admin/settings");
        break;
      case "ngo":
        router.push("/admin/ngo");
        break;
      case "support":
        router.push("/admin/support/reports");
        break;
      default:
        router.push(`/admin/${view}`);
    }
  };

  const handleDeleteMember = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      const token = await getIdToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE", headers });
      if (res.ok) {
        setData((prev: any) =>
          prev
            ? {
                ...prev,
                users: (prev.users || []).filter((u: any) => u.id !== id),
              }
            : prev
        );
      }
    } catch (e) {
      console.error("Failed to delete member:", e);
    }
  };

  const handleDeleteSermon = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sermon?")) return;
    try {
      const token = await getIdToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/pastor/sermons?id=${id}`, { method: "DELETE", headers });
      if (res.ok) {
        setData((prev: any) =>
          prev
            ? {
                ...prev,
                sermons: (prev.sermons || []).filter((s: any) => s.id !== id),
              }
            : prev
        );
      }
    } catch (e) {
      console.error("Failed to delete sermon:", e);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <AdminPageTemplate
      title="Executive Analytics Dashboard"
      description="Real-time operational summary across congregation, financial ledgers, and ministry activities."
      icon={LayoutDashboard}
      onRefresh={loadData}
      isLoading={loading}
      searchPlaceholder="Search members, sermons, records..."
      searchPlaceholderMobile="Search members, sermons..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <DashboardOverview
        users={data?.users || []}
        donations={data?.donations || []}
        sermons={data?.sermons || []}
        events={data?.events || []}
        announcements={data?.announcements || []}
        attendanceRecords={data?.records || []}
        searchTerm={searchTerm}
        onNavigate={handleNavigate}
        onAddMember={() => router.push("/admin/members?action=add")}
        onDeleteMember={handleDeleteMember}
        onAddSermon={() => router.push("/admin/content/sermons?action=add")}
        onDeleteSermon={handleDeleteSermon}
        onOpenAddMember={() => router.push("/admin/members?action=add")}
        onOpenAddDonation={() => router.push("/admin/donations")}
        onOpenAddAttendance={() => router.push("/admin/attendance")}
        onOpenAddEvent={() => router.push("/admin/content/events")}
        onOpenAddAnnouncement={() => router.push("/admin/content/announcements")}
        onOpenAddSermon={() => router.push("/admin/content/sermons?action=add")}
      />
    </AdminPageTemplate>
  );
}
