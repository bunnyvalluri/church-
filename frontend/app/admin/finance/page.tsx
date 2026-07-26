"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import FinanceManagement from "@/components/admin/FinanceManagement";
import { DollarSign } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function FinanceOverviewPage() {
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
      title="Financial Overview & Ledgers"
      description="Monitor tithes, offerings, online gateways (Razorpay/Stripe), building funds, and general accounts."
      icon={DollarSign}
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
        activeSubTab="donations"
      />
    </AdminPageTemplate>
  );
}
