"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import MemberManagement from "@/components/admin/MemberManagement";
import { Users } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function UserAccountsSettingsPage() {
  const { getIdToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const tokenPromise = getIdToken();
      const token = await tokenPromise;
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/admin/users", { headers });
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = await getIdToken();
      const headers: HeadersInit = token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };
      await fetch("/api/admin/users", {
        method: "POST",
        headers,
        body: JSON.stringify({ userId, newRole }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId || u.uid === userId ? { ...u, role: newRole } : u))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMember = async (id: string | number) => {
    try {
      const token = await getIdToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      await fetch(`/api/admin/users?id=${id}`, { method: "DELETE", headers });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(s)) ||
      (u.email && u.email.toLowerCase().includes(s)) ||
      (u.role && u.role.toLowerCase().includes(s)) ||
      (u.phone && u.phone.includes(s))
    );
  });

  return (
    <AdminPageTemplate
      title="User Accounts Directory"
      description="Manage registered administrator, pastor, event manager, volunteer, and member accounts."
      icon={Users}
      onRefresh={loadData}
      isLoading={loading}
      searchPlaceholder="Search users by name, role or email..."
      searchValue={search}
      onSearchChange={setSearch}
    >
      <MemberManagement
        users={filteredUsers}
        onRoleChange={handleRoleChange}
        onDeleteMember={handleDeleteMember}
        onAddMember={() => {}}
      />
    </AdminPageTemplate>
  );
}
