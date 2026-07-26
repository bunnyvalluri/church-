"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";

export default function PastorMemberRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const requests = [
    { id: "1", name: "Ramesh Varma", email: "ramesh.v@gmail.com", phone: "+91 98765 43210", type: "Membership Application", status: "Pending", appliedAt: "Today, 10:30 AM" },
    { id: "2", name: "Priya Sharma", email: "priya.s@yahoo.com", phone: "+91 91234 56789", type: "Baptism Request", status: "Pending", appliedAt: "Yesterday" },
    { id: "3", name: "David Kumar", email: "david.k@kcm.org", phone: "+91 94400 11223", type: "Transfer Certificate", status: "Approved", appliedAt: "3 days ago" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title="Member Applications & Transfer Requests"
        subtitle="Review, approve, and assign pastoral follow-ups for new believer registrations and membership transfers"
        badge="12 Pending"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={() => alert("Member applications exported")}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-[10px] font-black uppercase text-slate-400">
              <th className="py-3.5 px-4">Applicant Name</th>
              <th className="py-3.5 px-4">Request Type</th>
              <th className="py-3.5 px-4">Submission Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Pastoral Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                  <div>{r.name}</div>
                  <div className="text-[10px] font-normal text-slate-400">{r.email} • {r.phone}</div>
                </td>
                <td className="py-3.5 px-4 text-slate-700 dark:text-gray-300 font-medium">{r.type}</td>
                <td className="py-3.5 px-4 text-slate-500">{r.appliedAt}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    r.status === "Approved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button type="button" onClick={() => alert(`Approved ${r.name}`)} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
