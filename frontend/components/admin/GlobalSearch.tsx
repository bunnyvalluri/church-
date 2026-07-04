"use client";

/**
 * components/admin/GlobalSearch.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Debounced full-text global search across Members, Events, Sermons,
 * Announcements, and Prayer Requests.
 * Results appear in a dropdown below the search input.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Users,
  Calendar,
  Play,
  Megaphone,
  Heart,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

// ── Types ──────────────────────────────────────────────────────────────────────
interface SearchCategory {
  label: string;
  items: any[];
  total: number;
}

interface SearchResults {
  members?: SearchCategory;
  events?: SearchCategory;
  sermons?: SearchCategory;
  announcements?: SearchCategory;
  prayers?: SearchCategory;
}

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORY_META: Record<string, { icon: React.ElementType; color: string }> = {
  members: { icon: Users, color: "text-emerald-500" },
  events: { icon: Calendar, color: "text-pink-500" },
  sermons: { icon: Play, color: "text-indigo-500" },
  announcements: { icon: Megaphone, color: "text-amber-500" },
  prayers: { icon: Heart, color: "text-rose-500" },
};

// ── Debounce helper ────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface GlobalSearchProps {
  onNavigate: (view: string) => void;
}

export default function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const { getIdToken } = useAuth();
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // ── Fetch search results ───────────────────────────────────────────────────
  const fetchResults = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const token = await getIdToken();
        const res = await fetch(`/api/dashboard/search?q=${encodeURIComponent(q)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setResults(data.results ?? null);
        setIsOpen(true);
      } catch {
        // Silently fail — search is non-critical
      } finally {
        setIsLoading(false);
      }
    },
    [getIdToken]
  );

  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clear = () => {
    setQuery("");
    setResults(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const placeholder =
    language === "te"
      ? "సభ్యులు, కార్యక్రమాలు వెతకండి..."
      : language === "hi"
      ? "सदस्य, कार्यक्रम खोजें..."
      : "Search members, events, sermons...";

  const hasResults = results
    ? Object.values(results).some((cat) => cat.items.length > 0)
    : false;

  const totalResults = results
    ? Object.values(results).reduce((sum, cat) => sum + cat.items.length, 0)
    : 0;

  // Navigate and close search
  const handleNavigate = (view: string) => {
    onNavigate(view);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-40 sm:w-52 md:w-72 group">
      {/* Input */}
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/70 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        id="admin-global-search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results && hasResults && setIsOpen(true)}
        className="w-full pl-10 pr-8 py-2 text-xs bg-gray-100 dark:bg-[#16172D]/60 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 dark:hover:border-white/[0.15] transition-all duration-300"
        autoComplete="off"
      />

      {/* Right slot: spinner or clear button */}
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-400 animate-spin" />
      )}
      {!isLoading && query && (
        <button
          onClick={clear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-300 dark:bg-white/20 text-slate-600 dark:text-gray-300 flex items-center justify-center hover:bg-slate-400 dark:hover:bg-white/30 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Results dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#0E0F20] border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden max-h-80 overflow-y-auto">
          {!hasResults && !isLoading ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs font-bold text-slate-400 dark:text-gray-500">
                No results for &quot;{query}&quot;
              </p>
            </div>
          ) : (
            <>
              {/* Summary bar */}
              <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide">
                  Results
                </span>
                <span className="text-[10px] font-extrabold text-indigo-500">
                  {totalResults} found
                </span>
              </div>

              {/* Category sections */}
              {results &&
                Object.entries(results).map(([key, cat]) => {
                  if (!cat || cat.items.length === 0) return null;
                  const meta = CATEGORY_META[key];
                  const Icon = meta?.icon ?? Search;

                  return (
                    <div key={key}>
                      {/* Category header */}
                      <div className="px-3 py-1.5 flex items-center gap-1.5 bg-slate-50/50 dark:bg-white/[0.01]">
                        <Icon className={`w-3 h-3 ${meta?.color ?? "text-slate-400"}`} />
                        <span className="text-[9px] font-extrabold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                          {cat.label}
                        </span>
                      </div>

                      {/* Items */}
                      {cat.items.map((item: any) => (
                        <button
                          key={item.id}
                          onClick={() => handleNavigate(key === "prayers" ? "prayers" : key === "members" ? "members" : key === "events" ? "events" : key === "sermons" ? "sermons" : "announcements")}
                          className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.03] text-left transition-colors border-b border-slate-50 dark:border-white/[0.02] last:border-0"
                        >
                          <div className={`w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center shrink-0 ${meta?.color ?? ""}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.title || item.name || item.donorName || "—"}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 truncate">
                              {item.email || item.location || item.pastor || item.content?.substring(0, 60) || ""}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
