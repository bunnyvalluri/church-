"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { UserCheck, CheckCircle, Clock, Mail, Phone, HeartHandshake } from "lucide-react";

export default function PastorVolunteersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const [volunteers, setVolunteers] = useState([
    { id: "1", name: "Daniel Raj", ministry: "Media & AV Team", email: "daniel@gmail.com", phone: "+91 97000 11223", status: "Approved", appliedAt: "Jul 15" },
    { id: "2", name: "Esther Rani", ministry: "Worship Choir", email: "esther@gmail.com", phone: "+91 98111 22334", status: "Pending", appliedAt: "Jul 22" }
  ]);

  const handleApprove = (id: string, name: string) => {
    setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: "Approved" } : v));
  };

  const filteredVolunteers = volunteers.filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return v.name.toLowerCase().includes(q) || v.ministry.toLowerCase().includes(q) || v.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Ministry Volunteer Roster & Applications"
        subtitle="Manage volunteer signups for Ushering, Choir, Sound & AV, Sunday School, and Community Outreach"
        badge={`${volunteers.filter(v => v.status === "Approved").length} Active`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm overflow-hidden">
        {/* 📱 MOBILE CARD VIEW (< md screens) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/[0.06]">
          {filteredVolunteers.map((v) => (
            <div key={v.id} className="p-4 space-y-3.5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-sm shadow-md shrink-0">
                    {v.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {v.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 mt-1">
                      {v.ministry}
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 border ${
                  v.status === "Approved" 
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                    : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                }`}>
                  {v.status}
                </span>
              </div>

              <div className="bg-slate-50/80 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.04] space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${v.email}`} className="hover:underline truncate">{v.email}</a>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/40 dark:border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${v.phone}`} className="hover:underline font-mono text-[11px]">{v.phone}</a>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{v.appliedAt}</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-end">
                {v.status === "Approved" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> Approved
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApprove(v.id, v.name)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/15 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Volunteer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 💻 DESKTOP TABLE VIEW (>= md screens) */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar w-full">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-[10px] font-black uppercase text-slate-400">
                <th className="py-4 px-6">Volunteer Name</th>
                <th className="py-4 px-6">Ministry Area</th>
                <th className="py-4 px-6">Applied Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
              {filteredVolunteers.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                    <div className="text-sm font-bold">{v.name}</div>
                    <div className="text-[11px] font-normal text-slate-400 mt-0.5">{v.email} • {v.phone}</div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-700 dark:text-gray-300">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      {v.ministry}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-medium">{v.appliedAt}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      v.status === "Approved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {v.status === "Approved" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-4 h-4" /> Approved
                      </span>
                    ) : (
                      <button type="button" onClick={() => handleApprove(v.id, v.name)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm active:scale-95">
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
