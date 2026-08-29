"use client";

import { useBranch } from "@/components/providers/BranchProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useEffect, useState, useRef, useMemo } from "react";
import { MapPin, ChevronDown } from "lucide-react";

const mapBranchNameToKey = (name: string): "shapur" | "subhash" | "bahadur" | null => {
  const norm = name.toLowerCase().replace(/\s+nagar/g, "").trim();
  if (norm.includes("shapur")) return "shapur";
  if (norm.includes("subhash")) return "subhash";
  if (norm.includes("bahadur")) return "bahadur";
  return null;
};

const getBranchKey = (id: string, name?: string): "all" | "shapur" | "subhash" | "bahadur" => {
  if (id === "all") return "all";
  if (!name) return "all";
  const key = mapBranchNameToKey(name);
  return key || "all";
};

interface BranchStyle {
  active: string;
  inactive: string;
  mapPin: string;
  border: string;
  activeText: string;
  triggerBg: string;
}

const getBranchStyles = (_branchKey: "all" | "shapur" | "subhash" | "bahadur"): BranchStyle => {
  return {
    active: "bg-violet-600 dark:bg-violet-600 text-white dark:text-white shadow-md hover:bg-violet-700",
    inactive: "text-gray-700 dark:text-slate-200 hover:bg-gray-100/80 dark:hover:bg-slate-800/80",
    mapPin: "text-violet-600 dark:text-violet-400",
    border: "border-white/60 dark:border-white/20",
    activeText: "text-gray-900 dark:text-white",
    triggerBg: "bg-white/60 dark:bg-slate-900/60 hover:bg-white/80 dark:hover:bg-slate-800/80",
  };
};

export default function BranchSelector() {
  const { selectedBranchId, setSelectedBranchId, branches } = useBranch();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const branchTranslations: Record<string, string> = useMemo(() => {
    const bDict = (t as any).branches || {};
    const navDict = (t as any).nav || {};
    return {
      all: bDict.all || navDict.allBranches || "All Branches",
      shapur: bDict.shapur || "Shapur Nagar",
      subhash: bDict.subhash || "Subhash Nagar",
      bahadur: bDict.bahadur || "Bahadurpally",
      select: bDict.select || "Select Branch",
    };
  }, [t]);

  const rawBranches =
    branches && branches.length > 0
      ? branches
      : [
          { id: "b1", name: "Shapur Nagar" },
          { id: "b2", name: "Subhash Nagar" },
          { id: "b3", name: "Bahadurpally" },
        ];

  const displayBranches = useMemo(() => {
    return rawBranches.map((b) => {
      const key = mapBranchNameToKey(b.name);
      const localizedName = key && branchTranslations[key] ? branchTranslations[key] : b.name;
      return {
        id: b.id,
        rawName: b.name,
        name: localizedName,
        key,
      };
    });
  }, [rawBranches, branchTranslations]);

  const activeBranchName = useMemo(() => {
    if (selectedBranchId === "all") {
      return branchTranslations.all;
    }
    const found = displayBranches.find((b) => b.id === selectedBranchId);
    if (found) return found.name;
    if (selectedBranchId === "b1" || selectedBranchId === "shapur") return branchTranslations.shapur;
    if (selectedBranchId === "b2" || selectedBranchId === "subhash") return branchTranslations.subhash;
    if (selectedBranchId === "b3" || selectedBranchId === "bahadur") return branchTranslations.bahadur;
    return branchTranslations.select;
  }, [selectedBranchId, displayBranches, branchTranslations]);

  const currentKey = getBranchKey(selectedBranchId, selectedBranchId === "all" ? undefined : activeBranchName);
  const currentStyles = getBranchStyles(currentKey);

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={`apple-liquid-glass-btn h-8.5 min-[360px]:h-9 px-2 min-[360px]:px-2.5 sm:px-3 flex items-center gap-1 min-[360px]:gap-1.5 ${currentStyles.triggerBg} backdrop-blur-xl rounded-xl border ${currentStyles.border} text-[10.5px] min-[360px]:text-xs font-black ${currentStyles.activeText} transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer`}
      >
        <div className="apple-liquid-shimmer" />
        <MapPin className={`w-3.5 h-3.5 ${currentStyles.mapPin} flex-shrink-0 relative z-10 transition-colors`} />
        <span
          className="whitespace-nowrap relative z-10 font-extrabold tracking-tight max-w-[85px] min-[360px]:max-w-[110px] sm:max-w-[140px] truncate"
          suppressHydrationWarning
        >
          {activeBranchName}
        </span>
        <ChevronDown
          className={`w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 text-gray-400 flex-shrink-0 relative z-10 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && mounted && (
        <div className="absolute right-0 mt-2 min-w-[190px] bg-white/95 dark:bg-[#0d091e]/95 backdrop-blur-3xl rounded-2xl border border-white/60 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-2 z-[99] animate-scale-in space-y-1">
          <button
            onClick={() => {
              setSelectedBranchId("all");
              setIsOpen(false);
            }}
            className={`apple-liquid-glass-btn w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedBranchId === "all"
                ? getBranchStyles("all").active
                : getBranchStyles("all").inactive
            }`}
          >
            <div className="apple-liquid-shimmer" />
            <span className="relative z-10" suppressHydrationWarning>{branchTranslations.all}</span>
          </button>

          <div className="h-px bg-gray-200/60 dark:bg-white/10 my-1" />

          <div className="space-y-0.5">
            {displayBranches.map((branch) => {
              const isActive = selectedBranchId === branch.id;
              const branchKey = branch.key || getBranchKey(branch.id, branch.rawName);
              const styles = getBranchStyles(branchKey);
              return (
                <button
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranchId(branch.id);
                    setIsOpen(false);

                    // Link branch selection to contact details
                    const contactKey = mapBranchNameToKey(branch.rawName);
                    if (contactKey) {
                      if (window.location.pathname === "/") {
                        const element = document.getElementById("contact");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                        window.dispatchEvent(
                          new CustomEvent("change-contact-branch", {
                            detail: { branch: contactKey },
                          })
                        );
                      } else {
                        sessionStorage.setItem("pending-contact-branch", contactKey);
                        window.location.href = "/#contact";
                      }
                    }
                  }}
                  className={`apple-liquid-glass-btn w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive ? styles.active : styles.inactive
                  }`}
                >
                  <div className="apple-liquid-shimmer" />
                  <span className="relative z-10" suppressHydrationWarning>{branch.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
