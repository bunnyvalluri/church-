"use client";

import { useBranch } from "@/components/providers/BranchProvider";
import { useEffect, useState, useRef } from "react";
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

const getBranchStyles = (branchKey: "all" | "shapur" | "subhash" | "bahadur"): BranchStyle => {
  switch (branchKey) {
    case "shapur":
      return {
        active: "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-100 dark:shadow-none hover:brightness-105",
        inactive: "text-orange-700 dark:text-orange-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20",
        mapPin: "text-orange-500 dark:text-orange-400",
        border: "border-orange-200/50 dark:border-orange-800/30",
        activeText: "text-orange-700 dark:text-orange-250",
        triggerBg: "bg-orange-50/60 dark:bg-orange-950/15 hover:bg-orange-100/60 dark:hover:bg-orange-950/25"
      };
    case "subhash":
      return {
        active: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-md shadow-emerald-100 dark:shadow-none hover:brightness-105",
        inactive: "text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/20",
        mapPin: "text-emerald-500 dark:text-emerald-400",
        border: "border-emerald-200/50 dark:border-emerald-800/30",
        activeText: "text-emerald-700 dark:text-emerald-250",
        triggerBg: "bg-emerald-50/60 dark:bg-emerald-950/15 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/25"
      };
    case "bahadur":
      return {
        active: "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 text-white shadow-md shadow-cyan-100 dark:shadow-none hover:brightness-105",
        inactive: "text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50/80 dark:hover:bg-cyan-950/20",
        mapPin: "text-cyan-500 dark:text-cyan-400",
        border: "border-cyan-200/50 dark:border-cyan-800/30",
        activeText: "text-cyan-700 dark:text-cyan-250",
        triggerBg: "bg-cyan-50/60 dark:bg-cyan-950/15 hover:bg-cyan-100/60 dark:hover:bg-cyan-950/25"
      };
    case "all":
    default:
      return {
        active: "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-100 dark:shadow-none hover:brightness-105",
        inactive: "text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/20",
        mapPin: "text-indigo-500 dark:text-indigo-400",
        border: "border-indigo-200/50 dark:border-indigo-800/30",
        activeText: "text-indigo-700 dark:text-indigo-250",
        triggerBg: "bg-indigo-50/60 dark:bg-indigo-950/15 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/25"
      };
  }
};

export default function BranchSelector() {
  const { selectedBranchId, setSelectedBranchId, branches } = useBranch();
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

  if (!mounted) {
    return (
      <div className="h-9 w-32 bg-gray-100/50 dark:bg-white/5 animate-pulse rounded-xl" />
    );
  }

  const activeBranchName =
    selectedBranchId === "all"
      ? "All Branches"
      : branches.find((b) => b.id === selectedBranchId)?.name || "Select Branch";

  const currentKey = getBranchKey(selectedBranchId, selectedBranchId === "all" ? undefined : activeBranchName);
  const currentStyles = getBranchStyles(currentKey);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={`h-9 px-2.5 md:px-3 flex items-center gap-1.5 md:gap-2 ${currentStyles.triggerBg} backdrop-blur-md rounded-xl border ${currentStyles.border} text-xs font-black ${currentStyles.activeText} transition-all shadow-sm hover:scale-[1.01] active:scale-95`}
      >
        <MapPin className={`w-3.5 h-3.5 ${currentStyles.mapPin} flex-shrink-0 transition-colors`} />
        <span className="truncate max-w-[110px] sm:max-w-none">{activeBranchName}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl rounded-2xl border border-gray-200/60 dark:border-white/10 shadow-2xl p-1.5 z-[99] animate-scale-in">
          <button
            onClick={() => {
              setSelectedBranchId("all");
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              selectedBranchId === "all"
                ? getBranchStyles("all").active
                : getBranchStyles("all").inactive
            }`}
          >
            All Branches
          </button>
          
          <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />

          <div className="space-y-0.5">
            {branches.map((branch) => {
              const isActive = selectedBranchId === branch.id;
              const branchKey = getBranchKey(branch.id, branch.name);
              const styles = getBranchStyles(branchKey);
              return (
                <button
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranchId(branch.id);
                    setIsOpen(false);

                    // Link branch selection to contact details
                    const contactKey = mapBranchNameToKey(branch.name);
                    if (contactKey) {
                      if (window.location.pathname === "/") {
                        const element = document.getElementById("contact");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                        window.dispatchEvent(
                          new CustomEvent("change-contact-branch", {
                            detail: { branch: contactKey }
                          })
                        );
                      } else {
                        sessionStorage.setItem("pending-contact-branch", contactKey);
                        window.location.href = "/#contact";
                      }
                    }
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all truncate ${
                    isActive ? styles.active : styles.inactive
                  }`}
                >
                  {branch.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
