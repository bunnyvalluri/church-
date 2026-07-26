"use client";

import React, { useState } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { Users, CheckCircle, Clock, Mail, Phone, Calendar } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorMemberRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [requests, setRequests] = useState([
    { id: "1", name: "Ramesh Varma", email: "ramesh.v@gmail.com", phone: "+91 98765 43210", type: "Membership Application", status: "Pending", appliedAt: "Today, 10:30 AM" },
    { id: "2", name: "Priya Sharma", email: "priya.s@yahoo.com", phone: "+91 91234 56789", type: "Baptism Request", status: "Pending", appliedAt: "Yesterday" },
    { id: "3", name: "David Kumar", email: "david.k@kcm.org", phone: "+91 94400 11223", type: "Transfer Certificate", status: "Approved", appliedAt: "3 days ago" }
  ]);

  const getTypeLabel = (type: string) => {
    if (type === "Membership Application") return t.typeMembershipApp || type;
    if (type === "Baptism Request") return t.typeBaptismReq || type;
    if (type === "Transfer Certificate") return t.typeTransferCert || type;
    return type;
  };

  const getStatusLabel = (status: string) => {
    if (status === "Approved") return t.approved || status;
    if (status === "Pending") return t.pending || status;
    return status;
  };

  const getAppliedAtLabel = (time: string) => {
    if (time.includes("Today")) return time.replace("Today", t.todayAt || "Today");
    if (time.includes("Yesterday")) return time.replace("Yesterday", t.yesterday || "Yesterday");
    if (time.includes("days ago")) return time.replace("days ago", t.daysAgo || "days ago");
    return time;
  };

  const handleApprove = (id: string, name: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Approved" } : r));
  };

  const filteredRequests = requests.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const typeLabel = getTypeLabel(r.type).toLowerCase();
    return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || typeLabel.includes(q);
  });

  const pendingCount = requests.filter(r => r.status === "Pending").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PastorPageHeader
        title={t.memberRequestsTitle || "Member Applications & Transfer Requests"}
        subtitle={t.memberRequestsSubtitle || "Review, approve, and assign pastoral follow-ups for new believer registrations and membership transfers"}
        badge={`${pendingCount} ${t.pendingBadge || "Pending"}`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={() => alert(t.memberApplicationsExported || "Member applications exported")}
      />

      <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm overflow-hidden">
        {/* 📱 MOBILE CARD VIEW (< md screens) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/[0.06]">
          {filteredRequests.map((r) => (
            <div key={r.id} className="p-4 space-y-3.5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
              {/* Header: Avatar, Name & Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center text-sm shadow-md shrink-0">
                    {r.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {r.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 mt-1">
                      {getTypeLabel(r.type)}
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 border ${
                  r.status === "Approved" 
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                    : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                }`}>
                  {getStatusLabel(r.status)}
                </span>
              </div>

              {/* Contact Info & Date */}
              <div className="bg-slate-50/80 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.04] space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${r.email}`} className="hover:underline truncate">{r.email}</a>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/40 dark:border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${r.phone}`} className="hover:underline font-mono text-[11px]">{r.phone}</a>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{getAppliedAtLabel(r.appliedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Pastoral Action */}
              <div className="pt-1 flex items-center justify-end">
                {r.status === "Approved" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> {t.approved || "Approved"}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApprove(r.id, r.name)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] hover:to-[#7C3AED] text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/15 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" /> {t.approveApplication || "Approve Application"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 💻 DESKTOP TABLE VIEW (>= md screens) */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar w-full">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-4 px-6">{t.applicantNameHeader || "Applicant Name"}</th>
                <th className="py-4 px-6">{t.requestTypeHeader || "Request Type"}</th>
                <th className="py-4 px-6">{t.submissionDateHeader || "Submission Date"}</th>
                <th className="py-4 px-6">{t.statusHeader || "Status"}</th>
                <th className="py-4 px-6 text-right">{t.pastoralActionHeader || "Pastoral Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
              {filteredRequests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                    <div className="text-sm font-bold">{r.name}</div>
                    <div className="text-[11px] font-normal text-slate-400 mt-0.5">{r.email} • {r.phone}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-700 dark:text-gray-300 font-medium">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                      {getTypeLabel(r.type)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-medium">{getAppliedAtLabel(r.appliedAt)}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      r.status === "Approved" 
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                    }`}>
                      {getStatusLabel(r.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {r.status === "Approved" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-4 h-4" /> {t.approved || "Approved"}
                      </span>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => handleApprove(r.id, r.name)} 
                        className="px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                      >
                        {t.approveBtn || "Approve"}
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
