"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import ContentManagement from "@/components/admin/ContentManagement";
import { Globe } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ContentOverviewPage() {
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
      const res = await fetch("/api/admin/content/data", { headers });
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
      title="Content & CMS Hub"
      description="Manage public website content, sermons, event calendar, announcements, and media assets."
      icon={Globe}
      onRefresh={loadData}
      isLoading={loading}
    >
      <ContentManagement
        sermons={data?.sermons || []}
        events={data?.events || []}
        announcements={data?.announcements || []}
        onAddSermon={() => {}}
        onDeleteSermon={() => {}}
        onAddEvent={() => {}}
        onDeleteEvent={() => {}}
        onAddAnnouncement={() => {}}
        onDeleteAnnouncement={() => {}}
        isLoading={loading}
      />
    </AdminPageTemplate>
  );
}
