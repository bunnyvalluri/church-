"use client";

import { useBranch } from "@/components/providers/BranchProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useEffect, useState, useRef, useMemo } from "react";
import { MapPin, ChevronDown, Check, Building2, Globe, Clock } from "lucide-react";
import Link from "next/link";

const mapBranchNameToKey = (name: string): "shapur" | "subhash" | "bahadur" | null => {
  const norm = name.toLowerCase().replace(/\s+nagar/g, "").trim();
  if (norm.includes("shapur")) return "shapur";
  if (norm.includes("subhash")) return "subhash";
  if (norm.includes("bahadur")) return "bahadur";
  return null;
};

export default function BranchSelector() {
  const { selectedBranchId, setSelectedBranchId, branches } = useBranch();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const branchTranslations: Record<string, string> = useMemo(() => {
    const bDict = (t as any).branches || {};
    const navDict = (t as any).nav || {};
    return {
      all: bDict.all || navDict.allBranches || "All Branches",
      shapur: bDict.shapur || "Shapur Nagar",
      subhash: bDict.subhash || "Subhash Nagar",
      bahadur: bDict.bahadur || "Bahadurpally",
      select: bDict.select || "Select Campus",
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

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* ── Trigger Button: Executive Frosted Glass Capsule (Apple HIG) ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Branch selector: currently ${activeBranchName}`}
        className="h-8 min-[360px]:h-8.5 px-2 min-[360px]:px-2.5 flex items-center gap-1.5 shrink-0 flex-shrink-0 bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] backdrop-blur-xl rounded-xl border border-slate-200/90 dark:border-white/15 text-[11px] min-[360px]:text-xs font-bold text-slate-800 dark:text-slate-100 transition-all duration-200 shadow-2xs hover:scale-[1.02] active:scale-95 cursor-pointer select-none"
      >
        <MapPin className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0 transition-colors" />
        <span
          className="whitespace-nowrap font-extrabold tracking-tight max-w-[70px] min-[360px]:max-w-[80px] sm:max-w-[90px] md:max-w-[95px] lg:max-w-[110px] xl:max-w-[130px] truncate"
          suppressHydrationWarning
        >
          {activeBranchName}
        </span>
        <ChevronDown
          className={`w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 text-slate-400 dark:text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── Dropdown Panel: Clean Material 3 / iOS 18 Floating Menu ── */}
      {isOpen && mounted && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 sm:w-72 bg-white/95 dark:bg-[#0c0f1e]/95 backdrop-blur-2xl rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] p-1.5 z-[1100] animate-in fade-in zoom-in-95 duration-150 space-y-1"
        >
          {/* Menu Micro-Header */}
          <div className="px-3 pt-2 pb-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
            <span>{branchTranslations.select}</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
              3 Campuses
            </span>
          </div>

          {/* 1. All Branches Option */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setSelectedBranchId("all");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
              selectedBranchId === "all"
                ? "bg-violet-500/10 dark:bg-violet-500/20 text-violet-950 dark:text-violet-200 font-extrabold ring-1 ring-violet-500/30"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/90 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white font-medium"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedBranchId === "all"
                    ? "bg-violet-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                }`}
              >
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight truncate">
                  {branchTranslations.all}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-400 leading-tight mt-0.5 truncate">
                  All 3 Locations & Live Streams
                </div>
              </div>
            </div>
            {selectedBranchId === "all" && (
              <Check className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 ml-2" />
            )}
          </button>

          {/* Section Divider */}
          <div className="h-px bg-slate-200/80 dark:bg-white/10 my-1 mx-2" />

          {/* 2. Specific Campus Branches */}
          <div className="space-y-0.5">
            {displayBranches.map((branch) => {
              const isActive = selectedBranchId === branch.id;
              const subtitle =
                branch.key === "shapur"
                  ? "Central Sanctuary • Jeedimetla"
                  : branch.key === "subhash"
                  ? "Subhash Nagar • Morning Worship"
                  : "North Campus • Bahadurpally";

              return (
                <button
                  key={branch.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSelectedBranchId(branch.id);
                    setIsOpen(false);

                    // Smooth-scroll and link to contact details
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-violet-500/10 dark:bg-violet-500/20 text-violet-950 dark:text-violet-200 font-extrabold ring-1 ring-violet-500/30"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/90 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-violet-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight truncate">
                        {branch.name}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-400 leading-tight mt-0.5 truncate">
                        {subtitle}
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <Check className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Micro-Footer with Quick Link to Contact/Directions */}
          <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-white/[0.06] px-2 py-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-violet-400" />
              <span>Sun & Mid-week</span>
            </span>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="text-violet-600 dark:text-violet-400 hover:underline font-bold"
            >
              Directions →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
