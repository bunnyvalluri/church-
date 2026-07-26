"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { UserCheck, CheckCircle2, XCircle } from "lucide-react";

export default function PastorVolunteersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const volunteers = [
    { id: "1", name: "Daniel Raj", ministry: "Media & AV Team", email: "daniel@gmail.com", phone: "+91 97000 11223", status: "Approved", appliedAt: "Jul 15" },
    { id: "2", name: "Esther Rani", ministry: "Worship Choir", email: "esther@gmail.com", phone: "+91 98111 22334", status: "Pending", appliedAt: "Jul 22" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Ministry Volunteer Roster & Applications"
        subtitle="Manage volunteer signups for Ushering, Choir, Sound & AV, Sunday School, and Community Outreach"
        badge="14 Active Volunteers"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-[10px] font-black uppercase text-slate-400">
              <th className="py-3.5 px-4">Volunteer Name</th>
              <th className="py-3.5 px-4">Ministry Area</th>
              <th className="py-3.5 px-4">Applied Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
            {volunteers.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                  <div>{v.name}</div>
                  <div className="text-[10px] font-normal text-slate-400">{v.email} • {v.phone}</div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-gray-300">{v.ministry}</td>
                <td className="py-3.5 px-4 text-slate-500">{v.appliedAt}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    v.status === "Approved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button type="button" onClick={() => alert(`Approved ${v.name}`)} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
