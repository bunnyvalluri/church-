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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="h-9 px-2.5 md:px-3 flex items-center gap-1.5 md:gap-2 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md rounded-xl border border-gray-200/60 dark:border-white/10 text-xs font-black text-gray-700 dark:text-white/80 hover:text-gray-950 dark:hover:text-white transition-all shadow-sm hover:scale-[1.01] active:scale-95"
      >
        <MapPin className="w-3.5 h-3.5 text-purple-550 dark:text-purple-400 flex-shrink-0" />
        <span className="truncate max-w-[80px] md:max-w-[90px]">{activeBranchName}</span>
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
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                : "text-gray-650 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
          >
            All Branches
          </button>
          
          <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />

          <div className="space-y-0.5">
            {branches.map((branch) => {
              const isActive = selectedBranchId === branch.id;
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
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "text-gray-650 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
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
