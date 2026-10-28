"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { Play, Plus, Search, Filter, Clock, BookOpen, Tag, Loader2, Sparkles, X } from "lucide-react";
import SermonInlineForm from "@/components/SermonInlineForm";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorSermonsPage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [searchQuery, setSearchQuery] = useState("");
  const [sermons, setSermons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const fetchSermons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pastor/sermons");
      const data = await res.json();
      if (data.success && Array.isArray(data.sermons)) {
        setSermons(data.sermons);
      } else {
        setSermons([]);
      }
    } catch (err) {
      console.error("Error fetching sermons:", err);
      setSermons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  const handleSermonSuccess = (title: string) => {
    setIsModalOpen(false);
    setSuccessMsg(`Sermon "${title}" published successfully!`);
    fetchSermons();
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filtered = sermons.filter(s => 
    (s.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.scripture || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.sermonLibraryTitle}
        subtitle={t.sermonLibrarySubtitle}
        badge={`${sermons.length} ${t.messagesCount}`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t.searchSermonsPlaceholder}
        primaryActionLabel={t.uploadSermon}
        onPrimaryAction={() => setIsModalOpen(true)}
        onRefresh={fetchSermons}
      />

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-scale-in">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
          <p className="text-xs font-bold text-slate-400">{t.loadingSermons}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/[0.06] p-8 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-500/20">
            <Play className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-black text-slate-800 dark:text-white">{t.noSermonsFound}</h4>
          <p className="text-xs text-slate-400 dark:text-gray-500 max-w-sm mx-auto">{t.sermonLibrarySubtitle}</p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold text-xs rounded-xl shadow-sm hover:from-[#5053E4] hover:to-[#7C3AED] transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.uploadSermon}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((sermon) => (
            <div key={sermon.id} className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="h-40 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-slate-200/60 dark:border-white/10 flex items-center justify-center relative overflow-hidden group">
                {sermon.thumbnail ? (
                  <img src={sermon.thumbnail} alt={sermon.title} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Play className="w-10 h-10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                )}
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">{sermon.duration || "40:00"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{sermon.category || t.sundayWorship}</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug mt-0.5">{sermon.title}</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  {sermon.scripture || t.scriptureRef}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
                <span>{sermon.date ? String(sermon.date).split("T")[0] : "Recent"}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">{sermon.status === "Published" ? t.sermonPublished : (sermon.status || t.sermonPublished)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Upload Form mounted to document.body to avoid parent animation/stacking/clipping issues */}
      {isModalOpen && mounted && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-sermon-modal-title"
        >
          <div 
            className="bg-white dark:bg-[#0E0F24] border border-slate-200/90 dark:border-white/10 rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl relative my-auto max-h-[92dvh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-4.5 border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm shrink-0">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                <div className="min-w-0">
                  <h3 id="upload-sermon-modal-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    {t.uploadNewSermon}
                  </h3>
                  <p className="text-[10.5px] sm:text-xs text-slate-500 dark:text-gray-400 truncate">
                    {t.sermonLibrarySubtitle || "Upload and publish Sunday messages"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 rounded-xl transition-all active:scale-95 shrink-0 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with smooth custom scrollbar */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-thin-scrollbar flex-1">
              <SermonInlineForm
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSermonSuccess}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
