"use client";

import { 
  Heart, 
  Gift, 
  Building, 
  Globe, 
  Users, 
  BookOpen, 
  Activity, 
  CheckCircle2,
  Sparkles,
  IndianRupee,
  Star,
  Shield,
  Sun
} from "lucide-react";

export interface GivingPurpose {
  id: string;
  code: string;
  nameEn: string;
  nameTe: string;
  nameHi?: string;
  descEn: string;
  icon?: string | null;
  colorTheme?: string | null;
  targetAmount?: number | null;
  raisedAmount?: number;
}

interface DynamicPurposeSelectorProps {
  purposes: GivingPurpose[];
  selectedCode: string;
  onSelect: (code: string) => void;
  language?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Heart: <Heart className="w-5 h-5" />,
  Gift: <Gift className="w-5 h-5" />,
  Building: <Building className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  IndianRupee: <IndianRupee className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  Sun: <Sun className="w-5 h-5" />,
};

const colorMap: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-300 dark:border-violet-700",
    text: "text-violet-700 dark:text-violet-300",
    ring: "ring-2 ring-violet-600",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-300 dark:border-emerald-700",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-2 ring-emerald-600",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-700",
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-2 ring-amber-600",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-300 dark:border-rose-700",
    text: "text-rose-700 dark:text-rose-300",
    ring: "ring-2 ring-rose-600",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-300 dark:border-blue-700",
    text: "text-blue-700 dark:text-blue-300",
    ring: "ring-2 ring-blue-600",
  },
};

export default function DynamicPurposeSelector({
  purposes,
  selectedCode,
  onSelect,
  language = "en",
}: DynamicPurposeSelectorProps) {
  if (!purposes || purposes.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          Select Giving Cause / Purpose
        </h3>
        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
          Dynamic Causes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {purposes.map((purpose) => {
          const isSelected = selectedCode === purpose.code;
          const themeKey = purpose.colorTheme || "violet";
          const theme = colorMap[themeKey] || colorMap.violet;
          const Icon = (purpose.icon && iconMap[purpose.icon]) || <Heart className="w-5 h-5" />;

          const name = language === "te" && purpose.nameTe ? purpose.nameTe : purpose.nameEn;
          const percentage = purpose.targetAmount && purpose.targetAmount > 0
            ? Math.min(Math.round(((purpose.raisedAmount || 0) / purpose.targetAmount) * 100), 100)
            : null;

          return (
            <button
              key={purpose.id}
              type="button"
              onClick={() => onSelect(purpose.code)}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? `${theme.bg} ${theme.border} ${theme.ring} shadow-md scale-[1.02]`
                  : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.text}`}>
                  {Icon}
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                )}
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-gray-900 dark:text-white text-base leading-snug">
                  {name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {purpose.descEn}
                </p>
              </div>

              {/* Campaign Progress Bar */}
              {percentage !== null && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-1 font-medium">
                    <span className="text-gray-500 dark:text-slate-400">Raised: ₹{(purpose.raisedAmount || 0).toLocaleString('en-IN')}</span>
                    <span className="text-violet-600 dark:text-violet-400 font-bold">{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
