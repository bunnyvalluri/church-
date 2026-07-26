"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import MemberGroups from "@/components/admin/MemberGroups";
import { UsersRound } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function MemberGroupsPage() {
  const { getIdToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
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
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminPageTemplate
      title="Member Groups & Fellowships"
      description="Organize church members into ministries, life groups, cell groups, and volunteer departments."
      icon={UsersRound}
      onRefresh={loadData}
      isLoading={loading}
    >
      <MemberGroups users={users} />
    </AdminPageTemplate>
  );
}
