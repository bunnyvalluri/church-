"use client";

import React, { useState, useEffect } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import FinanceManagement from "@/components/admin/FinanceManagement";
import { Landmark } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function BankAccountsPage() {
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
      title="Bank Accounts & General Ledgers"
      description="Manage ministry bank accounts, petty cash reserves, razorpay payout accounts, and fund balances."
      icon={Landmark}
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
        activeSubTab="accounts"
      />
    </AdminPageTemplate>
  );
}
