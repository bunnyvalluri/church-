"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import FamilyManagement from "@/components/admin/FamilyManagement";
import { FolderKanban } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function FamilyManagementPage() {
  const { getIdToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/admin/dashboard-data", { headers });
      const result = await res.json();
      if (res.ok && result.success) {
        setUsers(result.users || []);
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
      title="Family & Household Management"
      description="Map family trees, household heads, dependents, and anniversary tracking."
      icon={FolderKanban}
      onRefresh={loadData}
      isLoading={loading}
    >
      <FamilyManagement users={users} />
    </AdminPageTemplate>
  );
}
