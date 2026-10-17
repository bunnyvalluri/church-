"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import FamilyManagement from "@/components/admin/FamilyManagement";
import { FolderKanban } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const CACHE_USERS_KEY = "kcm_family_users_cache";

export default function FamilyManagementPage() {
  const { getIdToken } = useAuth();
  const [users, setUsers] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_USERS_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });
  const [loading, setLoading] = useState(() => users.length === 0);
  const usersRef = useRef(users);
  usersRef.current = users;

  const loadData = useCallback(async (isUserInitiated = false) => {
    if (isUserInitiated || usersRef.current.length === 0) {
      setLoading(true);
    }
    try {
      let headers: HeadersInit = {};
      try {
        const token = await Promise.race([
          getIdToken(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 100))
        ]);
        if (token) headers = { Authorization: `Bearer ${token}` };
      } catch (e) {}
      
      const res = await fetch("/api/admin/users", { headers });
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.users)) {
          setUsers(result.users);
          try {
            localStorage.setItem(CACHE_USERS_KEY, JSON.stringify(result.users));
          } catch (e) {}
          return;
        }
      }

      // Fallback
      const fallbackRes = await fetch("/api/admin/dashboard-data", { headers });
      const fallbackResult = await fallbackRes.json();
      if (fallbackRes.ok && fallbackResult.success && Array.isArray(fallbackResult.users)) {
        setUsers(fallbackResult.users);
        try {
          localStorage.setItem(CACHE_USERS_KEY, JSON.stringify(fallbackResult.users));
        } catch (e) {}
      }
    } catch (err) {
      console.error("Error loading family management users:", err);
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => {
      loadData(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <AdminPageTemplate
      title="Family & Household Management"
      description="Map family trees, household heads, dependents, and anniversary tracking."
      icon={FolderKanban}
      onRefresh={() => loadData(true)}
      isLoading={loading && users.length === 0}
    >
      <FamilyManagement users={users} />
    </AdminPageTemplate>
  );
}
