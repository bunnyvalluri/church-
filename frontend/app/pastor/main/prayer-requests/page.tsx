"use client";

import React, { useState, useEffect } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { 
  Heart, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  Loader2, 
  MessageSquare,
  ArrowLeft,
  Users,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Plus
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

interface PrayerRequestItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: "HEALTH" | "FAMILY" | "FINANCIAL" | "SPIRITUAL" | "GUIDANCE" | "OTHER" | "THANKSGIVING";
  isAnonymous: boolean;
  status: "PENDING" | "PRAYING" | "ANSWERED";
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

const BIBLE_VERSES: Record<string, string[]> = {
  HEALTH: [
    "Heal me, Lord, and I will be healed; save me and I will be saved, for you are the one I praise. - Jeremiah 17:14",
    "Is anyone among you sick? Let them call the elders of the church to pray over them... - James 5:14"
  ],
  FAMILY: [
    "Believe in the Lord Jesus, and you will be saved—you and your household. - Acts 16:31",
    "As for me and my household, we will serve the Lord. - Joshua 24:15"
  ],
  FINANCIAL: [
    "And my God will meet all your needs according to the riches of his glory in Christ Jesus. - Philippians 4:19",
    "The Lord is my shepherd, I lack nothing. - Psalm 23:1"
  ],
  SPIRITUAL: [
    "Draw near to God, and he will draw near to you. - James 4:8",
    "Create in me a pure heart, O God, and renew a steadfast spirit within me. - Psalm 51:10"
  ],
  GUIDANCE: [
    "Trust in the Lord with all your heart and lean not on your own understanding... - Proverbs 3:5-6",
    "Your word is a lamp for my feet, a light on my path. - Psalm 119:105"
  ],
  THANKSGIVING: [
    "Give thanks to the Lord, for he is good; his love endures forever. - Psalm 107:1",
    "In every situation, by prayer and petition, with thanksgiving, present your requests to God. - Philippians 4:6"
  ],
  OTHER: [
    "Do not be anxious about anything, but in every situation, by prayer and petition... - Philippians 4:6"
  ]
};

export default function PastorPrayerRequestsPage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PRAYING" | "ANSWERED">("ALL");
  const [prayers, setPrayers] = useState<PrayerRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequestItem | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [mobileTab, setMobileTab] = useState<"list" | "detail">("list");

  const fetchPrayers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pastor/prayer-requests");
      const data = await res.json();
      if (data.success && Array.isArray(data.prayers)) {
        setPrayers(data.prayers);
        setSelectedPrayer(data.prayers.length > 0 ? data.prayers[0] : null);
      } else {
        setPrayers([]);
        setSelectedPrayer(null);
      }
    } catch {
      setPrayers([]);
      setSelectedPrayer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayers();
  }, []);

  const handleSelectPrayer = (prayer: PrayerRequestItem) => {
    setSelectedPrayer(prayer);
    setMobileTab("detail");
  };

  const handleUpdateStatus = async (id: string, newStatus: "PENDING" | "PRAYING" | "ANSWERED") => {
    setPrayers(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    if (selectedPrayer && selectedPrayer.id === id) {
      setSelectedPrayer(prev => prev ? { ...prev, status: newStatus } : null);
    }

    setSuccessMsg(`Status updated to ${newStatus}`);
    setTimeout(() => setSuccessMsg(""), 3000);

    try {
      await fetch("/api/pastor/prayer-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
    } catch {
      // Optimistic state retained
    }
  };

  const getVerseSuggestion = (cat: string) => {
    const verses = BIBLE_VERSES[cat] || BIBLE_VERSES.OTHER;
    return verses[0];
  };

  const filteredPrayers = prayers.filter(p => {
    const matchesSearch = 
      (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (!p.isAnonymous && p.user?.name ? p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) : false);
    
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Key metrics
  const totalCount = prayers.length;
  const pendingCount = prayers.filter(p => p.status === "PENDING").length;
  const prayingCount = prayers.filter(p => p.status === "PRAYING").length;
  const answeredCount = prayers.filter(p => p.status === "ANSWERED").length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <PastorPageHeader
        title={t.navPrayerRequests || "Prayer Requests"}
        subtitle="Intercede for members, track requests, and share testimonies."
        badge={`${pendingCount} Pending`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search prayer requests..."
        onRefresh={fetchPrayers}
      />

      {/* Success Toast */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm animate-scale-in">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Compact Stat Cards Row (2-col grid on mobile for clean screen layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Stat 1: Total */}
        <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-3 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Total</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">{totalCount}</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Stat 2: Pending */}
        <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-3 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Pending</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{pendingCount}</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Stat 3: Praying */}
        <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-3 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Praying</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5 block">{prayingCount}</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Stat 4: Answered */}
        <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-3 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Answered</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{answeredCount}</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

      </div>

      {/* Filter Status Chips (Horizontal Carousel) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(["ALL", "PENDING", "PRAYING", "ANSWERED"] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              statusFilter === st
                ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/20 scale-105"
                : "bg-white/70 dark:bg-[#0E0F24]/70 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-white/[0.06]"
            }`}
          >
            {st === "ALL" ? "All Requests" : st}
          </button>
        ))}
      </div>

      {/* Mobile Tab Switcher: [ List View | Details View ] (only visible on mobile screens) */}
      <div className="lg:hidden flex bg-slate-200/70 dark:bg-[#0E0F24]/80 p-1 rounded-2xl border border-slate-300/60 dark:border-white/10">
        <button
          type="button"
          onClick={() => setMobileTab("list")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            mobileTab === "list"
              ? "bg-white dark:bg-[#141632] text-[#6366F1] dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          List ({filteredPrayers.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("detail")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            mobileTab === "detail"
              ? "bg-white dark:bg-[#141632] text-[#6366F1] dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          Details
        </button>
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
          <p className="text-xs font-bold text-slate-400">Loading prayer requests...</p>
        </div>
      ) : filteredPrayers.length === 0 ? (
        <div className="py-16 text-center bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/[0.06] p-8 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-500/20">
            <Heart className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-black text-slate-800 dark:text-white">No prayer requests found</h4>
          <p className="text-xs text-slate-400 dark:text-gray-500 max-w-sm mx-auto">Try clearing search filters or checking back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: List (Hidden on mobile when detail tab is selected) */}
          <div className={`lg:col-span-1 space-y-3 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar ${
            mobileTab === "list" ? "block" : "hidden lg:block"
          }`}>
            {filteredPrayers.map((p) => {
              const isSelected = selectedPrayer?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPrayer(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                    isSelected
                      ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500/50 dark:border-indigo-500/60 shadow-md"
                      : "bg-white/70 dark:bg-[#0E0F24]/70 hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border-slate-200/60 dark:border-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                      p.status === "ANSWERED"
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                        : p.status === "PRAYING"
                        ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
                        : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                    }`}>
                      {p.status}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-2">{p.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-2 mt-1 leading-snug">{p.description}</p>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                    <span className="text-[9px] font-extrabold text-[#6366F1] dark:text-indigo-400 uppercase tracking-wider">{p.category}</span>
                    <span className="text-[9.5px] font-bold text-slate-500 dark:text-gray-400 truncate max-w-[120px]">
                      {p.isAnonymous ? "Anonymous Believer" : (p.user?.name || "Member")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Detail (Hidden on mobile when list tab is selected) */}
          <div className={`lg:col-span-2 space-y-6 ${
            mobileTab === "detail" ? "block" : "hidden lg:block"
          }`}>
            {/* Mobile Back Button */}
            <div className="lg:hidden mb-3">
              <button
                type="button"
                onClick={() => setMobileTab("list")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Requests List
              </button>
            </div>

            {selectedPrayer ? (
              <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-6">
                
                {/* Header Actions */}
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-[#6366F1] dark:text-indigo-400 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/20">
                        {selectedPrayer.category}
                      </span>
                      {selectedPrayer.isAnonymous && (
                        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 rounded-lg text-[9px] font-bold border border-slate-200 dark:border-white/10">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-2 leading-tight">
                      {selectedPrayer.title}
                    </h2>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1 font-semibold">
                      Submitted: {new Date(selectedPrayer.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="p-1 bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedPrayer.id, "PENDING")}
                      className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                        selectedPrayer.status === "PENDING"
                          ? "bg-white dark:bg-[#141632] text-amber-600 shadow-sm border border-slate-200 dark:border-white/10"
                          : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedPrayer.id, "PRAYING")}
                      className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                        selectedPrayer.status === "PRAYING"
                          ? "bg-white dark:bg-[#141632] text-blue-600 shadow-sm border border-slate-200 dark:border-white/10"
                          : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5" /> Praying
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedPrayer.id, "ANSWERED")}
                      className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                        selectedPrayer.status === "ANSWERED"
                          ? "bg-white dark:bg-[#141632] text-emerald-600 shadow-sm border border-slate-200 dark:border-white/10"
                          : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Answered
                    </button>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-white/[0.04]" />

                {/* Content */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">Prayer Description</h4>
                  <p className="text-xs text-slate-700 dark:text-gray-200 leading-relaxed bg-slate-50/50 dark:bg-[#070814]/40 p-4 border border-slate-200/60 dark:border-white/[0.04] rounded-2xl font-medium">
                    {selectedPrayer.description}
                  </p>
                </div>

                {/* Submitter details */}
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-gray-400 pt-1 font-semibold">
                  <span>ID: <span className="font-mono text-[10px] text-slate-400">{selectedPrayer.id}</span></span>
                  <span>Believer: <strong className="text-slate-800 dark:text-white font-bold">{selectedPrayer.isAnonymous ? "Anonymous" : (selectedPrayer.user?.name || "Member")}</strong></span>
                </div>

                {/* Suggested Scripture */}
                <div className="bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-indigo-500/15 dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-950 dark:text-indigo-100 p-5 rounded-2xl space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-[#6366F1] dark:text-indigo-400 shrink-0" />
                    <h3 className="font-black text-xs text-indigo-950 dark:text-indigo-100">Suggested Intercession Scripture</h3>
                  </div>
                  <p className="text-xs leading-relaxed italic font-bold text-indigo-900 dark:text-indigo-200">
                    &quot;{getVerseSuggestion(selectedPrayer.category)}&quot;
                  </p>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center bg-white/70 dark:bg-[#0E0F24]/70 rounded-3xl border border-slate-200/60 dark:border-white/[0.06] text-slate-400">
                Select a prayer request to view details
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
