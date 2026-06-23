"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Branch {
  id: string;
  name: string;
}

interface BranchContextType {
  selectedBranchId: string; // 'all' or branch.id
  setSelectedBranchId: (id: string) => void;
  branches: Branch[];
  activeBranch: Branch | null;
  loading: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load selected branch from localStorage (if browser)
  useEffect(() => {
    const saved = localStorage.getItem("kcm-selected-branch");
    if (saved) {
      setSelectedBranchId(saved);
    }
  }, []);

  // Fetch branches from the API on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch("/api/branches");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // Sort customly to guarantee: Shapur Nagar, Subhash Nagar, Bahadurpally
            const getIndex = (name: string) => {
              const norm = name.toLowerCase();
              if (norm.includes("shapur")) return 0;
              if (norm.includes("subhash")) return 1;
              if (norm.includes("bahadur")) return 2;
              return 3;
            };
            const sortedBranches = [...data.branches].sort(
              (a: Branch, b: Branch) => getIndex(a.name) - getIndex(b.name)
            );
            setBranches(sortedBranches);
          }
        }
      } catch (err) {
        console.error("[BranchProvider] Failed to fetch branches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const handleSetSelectedBranch = (id: string) => {
    setSelectedBranchId(id);
    localStorage.setItem("kcm-selected-branch", id);
  };

  const activeBranch = branches.find((b) => b.id === selectedBranchId) || null;

  return (
    <BranchContext.Provider
      value={{
        selectedBranchId,
        setSelectedBranchId: handleSetSelectedBranch,
        branches,
        activeBranch,
        loading,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}
