"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import FinanceManagement from "@/components/admin/FinanceManagement";
import { Receipt } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PledgesPage() {
  const { getIdToken } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      let headers: HeadersInit = {};
      try {
        const token = await Promise.race([
          getIdToken(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 50))
        ]);
        if (token) headers = { Authorization: `Bearer ${token}` };
      } catch (e) {}

      const res = await fetch("/api/admin/finance", { headers });
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
      title="Pledges & Campaign Tracker"
      description="Track building pledges, faith promises, mission campaign commitments, and fulfillment rates."
      icon={Receipt}
      onRefresh={loadData}
      isLoading={loading}
    >
      <FinanceManagement
        donations={data?.donations || []}
        pledges={data?.pledges || []}
        transactions={data?.transactions || []}
        accounts={data?.accounts || []}
        users={data?.users || []}
        onAddDonation={() => {}}
        onDeleteDonation={async () => {}}
        onAddPledge={async () => {}}
        onAddTransaction={async () => {}}
        activeSubTab="pledges"
      />
    </AdminPageTemplate>
  );
}
