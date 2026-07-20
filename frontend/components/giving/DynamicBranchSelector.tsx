"use client";

import { Building2, MapPin } from "lucide-react";

export interface BranchOption {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
}

interface DynamicBranchSelectorProps {
  branches: BranchOption[];
  selectedBranchId: string;
  onSelectBranch: (id: string) => void;
}

export default function DynamicBranchSelector({
  branches,
  selectedBranchId,
  onSelectBranch,
}: DynamicBranchSelectorProps) {
  if (!branches || branches.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Building2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        Church Branch Location
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {branches.map((branch) => {
          const isSelected = selectedBranchId === branch.id;
          return (
            <button
              key={branch.id}
              type="button"
              onClick={() => onSelectBranch(branch.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-violet-50 dark:bg-violet-950/40 border-violet-600 ring-2 ring-violet-600 text-gray-900 dark:text-white shadow"
                  : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-700"
              }`}
            >
              <div className="font-bold text-sm leading-snug flex items-center justify-between">
                <span>{branch.name}</span>
                <MapPin className={`w-4 h-4 ${isSelected ? "text-violet-600 dark:text-violet-400" : "text-gray-400"}`} />
              </div>
              {branch.address && (
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {branch.address}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
