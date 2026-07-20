"use client";

import { IndianRupee, Sparkles } from "lucide-react";

export interface PresetAmount {
  id: string;
  amount: number;
  label?: string | null;
  isPopular?: boolean;
}

interface DynamicAmountSelectorProps {
  amounts: PresetAmount[];
  selectedAmount: string;
  customAmount: string;
  onSelectAmount: (val: string) => void;
  onCustomAmountChange: (val: string) => void;
  minAmount?: number;
  maxAmount?: number;
}

export default function DynamicAmountSelector({
  amounts,
  selectedAmount,
  customAmount,
  onSelectAmount,
  onCustomAmountChange,
  minAmount = 1,
  maxAmount = 500000,
}: DynamicAmountSelectorProps) {
  const isCustomSelected = selectedAmount === "custom";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Select Donation Amount
        </label>
        <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
          Min ₹{minAmount} • Max ₹{maxAmount.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Preset Amount Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {amounts.map((preset) => {
          const valStr = String(preset.amount);
          const isSelected = selectedAmount === valStr;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onSelectAmount(valStr);
                onCustomAmountChange("");
              }}
              className={`relative py-3 px-2 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30 scale-[1.03]"
                  : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white hover:border-violet-300 dark:hover:border-violet-700"
              }`}
            >
              {preset.isPopular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full tracking-wider shadow">
                  Popular
                </span>
              )}
              ₹{preset.amount.toLocaleString("en-IN")}
            </button>
          );
        })}

        {/* Custom Amount Button */}
        <button
          type="button"
          onClick={() => onSelectAmount("custom")}
          className={`py-3 px-2 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
            isCustomSelected
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/30 scale-[1.03]"
              : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white hover:border-violet-300 dark:hover:border-violet-700"
          }`}
        >
          Custom
        </button>
      </div>

      {/* Custom Amount Input Field */}
      {isCustomSelected && (
        <div className="relative mt-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 font-bold">
            ₹
          </div>
          <input
            type="number"
            min={minAmount}
            max={maxAmount}
            value={customAmount}
            onChange={(e) => onCustomAmountChange(e.target.value)}
            placeholder="Enter custom donation amount"
            className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-900 border border-violet-400 dark:border-violet-600 rounded-xl font-bold text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 shadow-sm"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
