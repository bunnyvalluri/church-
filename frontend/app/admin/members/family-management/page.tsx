"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import FamilyManagement from "@/components/admin/FamilyManagement";
import { FolderKanban } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function FamilyManagementPage() {
  const { getIdToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const token = await getIdToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Fast fetch focused users endpoint instead of heavy multi-table dashboard query
      const res = await fetch("/api/admin/users", { headers });
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.users)) {
          setUsers(result.users);
          return;
        }
      }

      // Fallback if /api/admin/users returns empty/fails
      const fallbackRes = await fetch("/api/admin/dashboard-data", { headers });
      const fallbackResult = await fallbackRes.json();
      if (fallbackRes.ok && fallbackResult.success) {
        setUsers(fallbackResult.users || []);
      }
    } catch (err) {
      console.error("Error loading family management users:", err);
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
