"use client";

import React, { useState, useEffect } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { Play, Plus, Search, Filter, Clock, BookOpen, Tag, Loader2, Sparkles } from "lucide-react";
import SermonInlineForm from "@/components/SermonInlineForm";

export default function PastorSermonsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sermons, setSermons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchSermons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pastor/sermons");
      const data = await res.json();
      if (data.success && Array.isArray(data.sermons)) {
        setSermons(data.sermons);
      } else {
        // Fallback default list if DB is empty
        setSermons([
          { id: "1", title: "Walking in Divine Favor & Overflow", scripture: "Psalm 23:1-6", duration: "42:15", date: "Sunday, Jul 20", status: "Published", category: "Sunday Worship" },
          { id: "2", title: "The Power of Persistent Prayer", scripture: "Luke 18:1-8", duration: "38:00", date: "Wednesday, Jul 16", status: "Published", category: "Midweek Service" },
          { id: "3", title: "Building Strong Faithful Families", scripture: "Joshua 24:15", duration: "45:30", date: "Sunday, Jul 13", status: "Published", category: "Family Ministry" },
          { id: "4", title: "Overcoming Trials Through Faith", scripture: "James 1:2-4", duration: "35:10", date: "Sunday, Jul 06", status: "Published", category: "Youth Service" }
        ]);
      }
    } catch (err) {
      setSermons([
        { id: "1", title: "Walking in Divine Favor & Overflow", scripture: "Psalm 23:1-6", duration: "42:15", date: "Sunday, Jul 20", status: "Published", category: "Sunday Worship" },
        { id: "2", title: "The Power of Persistent Prayer", scripture: "Luke 18:1-8", duration: "38:00", date: "Wednesday, Jul 16", status: "Published", category: "Midweek Service" },
        { id: "3", title: "Building Strong Faithful Families", scripture: "Joshua 24:15", duration: "45:30", date: "Sunday, Jul 13", status: "Published", category: "Family Ministry" },
        { id: "4", title: "Overcoming Trials Through Faith", scripture: "James 1:2-4", duration: "35:10", date: "Sunday, Jul 06", status: "Published", category: "Youth Service" }
      ]);
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
        title="Sermon Management Library"
        subtitle="Upload, manage, tag, and publish Sunday Worship messages and Bible Study series"
        badge={`${sermons.length} Messages`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search sermon title, scripture reference, category..."
        primaryActionLabel="Upload Sermon"
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
          <p className="text-xs font-bold text-slate-400">Loading Sermon Records...</p>
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
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{sermon.category || "Sunday Worship"}</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug mt-0.5">{sermon.title}</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  {sermon.scripture || "Scripture Reference"}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
                <span>{sermon.date ? String(sermon.date).split("T")[0] : "Recent"}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">{sermon.status || "Published"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Upload Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E0F24] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Upload New Sermon</h3>
            <SermonInlineForm
              onClose={() => setIsModalOpen(false)}
              onSuccess={handleSermonSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
