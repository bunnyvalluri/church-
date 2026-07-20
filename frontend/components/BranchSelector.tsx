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

const getBranchStyles = (_branchKey: "all" | "shapur" | "subhash" | "bahadur"): BranchStyle => {
  return {
    active: "bg-gray-900 dark:bg-white/10 text-white dark:text-white shadow-sm hover:bg-gray-800 dark:hover:bg-white/15",
    inactive: "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/8",
    mapPin: "text-gray-500 dark:text-gray-400",
    border: "border-gray-200/60 dark:border-white/10",
    activeText: "text-gray-700 dark:text-gray-300",
    triggerBg: "bg-gray-100/60 dark:bg-white/5 hover:bg-gray-200/60 dark:hover:bg-white/10"
  };
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
      <div className="h-9 w-32 bg-gray-100/50 dark:bg-violet-500/8 animate-pulse rounded-xl" />
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
        <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-2xl border border-gray-200/60 dark:border-violet-500/20 shadow-2xl dark:shadow-[0_8px_40px_rgba(109,40,217,0.2)] p-1.5 z-[99] animate-scale-in">
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
