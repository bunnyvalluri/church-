"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import FinanceManagement from "@/components/admin/FinanceManagement";
import { Receipt } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const CACHE_KEY = "kcm_finance_cache";

export default function PledgesPage() {
  const { getIdToken } = useAuth();
  const [data, setData] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });
  const [loading, setLoading] = useState(() => !data);
  const dataRef = useRef(data);
  dataRef.current = data;

  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    try {
      const token = await Promise.race([
        getIdToken(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 120))
      ]);
      if (token) return { Authorization: `Bearer ${token}` };
    } catch (e) {}
    return {};
  }, [getIdToken]);

  const loadData = useCallback(async (isUserInitiated = false) => {
    if (isUserInitiated || !dataRef.current) {
      setLoading(true);
    }
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch("/api/admin/finance", { headers: authHeader });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(result));
        } catch (e) {}
      }
    } catch (err) {
      console.error("[PledgesPage] Failed to fetch financial records:", err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => {
      loadData(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Real-time add pledge
  const handleAddPledge = async (pledge: any) => {
    const tempId = `plg_${Date.now()}`;
    const optimisticPledge = {
      id: tempId,
      ...pledge,
      createdAt: new Date().toISOString(),
    };

    setData((prev: any) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        pledges: [optimisticPledge, ...(prev.pledges || [])],
      };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ ...pledge, entityType: "pledge" }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result?.pledge?.id) {
          setData((prev: any) => {
            if (!prev) return prev;
            const updated = {
              ...prev,
              pledges: (prev.pledges || []).map((p: any) => p.id === tempId ? result.pledge : p),
            };
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      }
    } catch (err) {
      console.error("[PledgesPage] Add pledge error:", err);
      loadData(false);
    }
  };

  // Real-time delete pledge
  const handleDeletePledge = async (id: string) => {
    setData((prev: any) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        pledges: (prev.pledges || []).filter((p: any) => p.id !== id),
      };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const authHeader = await getAuthHeader();
      await fetch(`/api/admin/finance?id=${encodeURIComponent(id)}&entityType=pledge`, {
        method: "DELETE",
        headers: authHeader,
      });
    } catch (err) {
      console.error("[PledgesPage] Delete pledge error:", err);
      loadData(false);
    }
  };

  // Real-time add donation
  const handleAddDonation = async (donation: any) => {
    const tempId = `don_${Date.now()}`;
    const optimisticDonation = {
      id: tempId,
      ...donation,
      createdAt: new Date().toISOString(),
    };

    setData((prev: any) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        donations: [optimisticDonation, ...(prev.donations || [])],
      };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ ...donation, entityType: "donation" }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result?.donation?.id) {
          setData((prev: any) => {
            if (!prev) return prev;
            const updated = {
              ...prev,
              donations: (prev.donations || []).map((d: any) => d.id === tempId ? result.donation : d),
            };
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      }
    } catch (err) {
      console.error("[PledgesPage] Add donation error:", err);
      loadData(false);
    }
  };

  // Real-time delete donation
  const handleDeleteDonation = async (id: string) => {
    setData((prev: any) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        donations: (prev.donations || []).filter((d: any) => d.id !== id),
      };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const authHeader = await getAuthHeader();
      await fetch(`/api/admin/finance?id=${encodeURIComponent(id)}&entityType=donation`, {
        method: "DELETE",
        headers: authHeader,
      });
    } catch (err) {
      console.error("[PledgesPage] Delete donation error:", err);
      loadData(false);
    }
  };

  // Real-time add transaction
  const handleAddTransaction = async (tx: any) => {
    const tempId = `tx_${Date.now()}`;
    const optimisticTx = {
      id: tempId,
      ...tx,
      createdAt: new Date().toISOString(),
    };

    setData((prev: any) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        transactions: [optimisticTx, ...(prev.transactions || [])],
      };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ ...tx, entityType: "transaction" }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result?.transaction?.id) {
          setData((prev: any) => {
            if (!prev) return prev;
            const updated = {
              ...prev,
              transactions: (prev.transactions || []).map((t: any) => t.id === tempId ? result.transaction : t),
            };
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      }
    } catch (err) {
      console.error("[PledgesPage] Add transaction error:", err);
      loadData(false);
    }
  };

  // Real-time delete transaction
  const handleDeleteTransaction = async (id: string) => {
    setData((prev: any) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        transactions: (prev.transactions || []).filter((t: any) => t.id !== id),
      };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const authHeader = await getAuthHeader();
      await fetch(`/api/admin/finance?id=${encodeURIComponent(id)}&entityType=transaction`, {
        method: "DELETE",
        headers: authHeader,
      });
    } catch (err) {
      console.error("[PledgesPage] Delete transaction error:", err);
      loadData(false);
    }
  };

  return (
    <AdminPageTemplate
      title="Pledges & Campaign Tracker"
      description="Track building pledges, faith promises, mission campaign commitments, and fulfillment rates."
      icon={Receipt}
      onRefresh={() => loadData(true)}
      isLoading={loading && !data}
    >
      <FinanceManagement
        donations={data?.donations || []}
        pledges={data?.pledges || []}
        transactions={data?.transactions || []}
        accounts={data?.accounts || []}
        users={data?.users || []}
        onAddDonation={handleAddDonation}
        onDeleteDonation={handleDeleteDonation}
        onAddPledge={handleAddPledge}
        onDeletePledge={handleDeletePledge}
        onAddTransaction={handleAddTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        activeSubTab="pledges"
      />
    </AdminPageTemplate>
  );
}
