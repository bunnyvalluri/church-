"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import ContentManagement from "@/components/admin/ContentManagement";
import { Video } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SermonsContentPage() {
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
      title="Sermon Archive & Video Publishing"
      description="Publish sermon videos, YouTube links, series topics, speaker names, and sermon notes."
      icon={Video}
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
        activeSubTab="sermons"
      />
    </AdminPageTemplate>
  );
}
