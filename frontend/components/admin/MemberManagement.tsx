"use client";

import React, { useState } from "react";
import { Search, Shield, Trash2, Calendar, Phone, Mail, Loader2, Plus, X, User, Star, Sparkles, Filter, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface MemberManagementProps {
  users: any[];
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  onDeleteMember: (id: string | number) => void;
  onAddMember: (member: any) => void;
  onOpenAddMember?: () => void;
}

export default function MemberManagement({
  users,
  onRoleChange,
  onDeleteMember,
  onAddMember,
  onOpenAddMember
}: MemberManagementProps) {
  const { language } = useLanguage();
  const t = adminTranslations[language || "en"].members;
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  const handleRoleChangeInternal = async (userId: string, newRole: string) => {
    setRoleUpdatingId(userId);
    try {
      await onRoleChange(userId, newRole);
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").includes(search);
    
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          bg: "bg-purple-50 dark:bg-purple-500/10 text-purple-750 dark:text-purple-350 border-purple-100 dark:border-purple-500/20",
          grad: "from-purple-500 to-indigo-600 shadow-purple-500/15",
          icon: Sparkles,
          accentColor: "text-purple-500 bg-purple-50/50 dark:bg-purple-500/5 border-purple-100"
        };
      case "ADMIN":
        return {
          bg: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-750 dark:text-indigo-350 border-indigo-100 dark:border-indigo-500/20",
          grad: "from-indigo-500 to-blue-600 shadow-indigo-500/15",
          icon: Shield,
          accentColor: "text-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-100"
        };
      case "PASTOR":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-750 dark:text-emerald-350 border-emerald-100 dark:border-emerald-500/20",
          grad: "from-emerald-400 to-teal-650 shadow-emerald-500/15",
          icon: Star,
          accentColor: "text-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100"
        };
      default:
        return {
          bg: "bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-350 border-slate-100 dark:border-white/[0.08]",
          grad: "from-slate-400 to-slate-650 shadow-slate-500/10",
          icon: User,
          accentColor: "text-slate-500 bg-slate-50/50 dark:bg-white/[0.04] border-slate-150"
        };
    }
  };

  const getRoleLabel = (role: string) => {
    const fullLabel = role === "SUPER_ADMIN" ? t.superAdmins 
                    : role === "ADMIN" ? t.admins 
                    : role === "PASTOR" ? t.pastors 
                    : t.believers;
    return fullLabel.split(" / ")[0].split(" (")[0];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ─── Header Controls Panel ─── */}
      <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl">
        {/* Abstract background ambient glow */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white tracking-tight uppercase leading-none">{t.registryTitle}</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-[#6366F1] border border-indigo-100 dark:border-indigo-900/30">
              {filteredUsers.length} / {users.length} {language === "te" ? "వినియోగదారులు" : language === "hi" ? "उपयोगकर्ता" : "Users"}
            </span>
          </div>
          <p className="text-xs text-slate-450 dark:text-gray-500 mt-1 max-w-xl font-medium">{t.registrySubtitle}</p>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap gap-3 items-center w-full lg:w-auto shrink-0 z-10">
          {/* Search registry bar */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full sm:w-56 pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-white/[0.15] transition-all duration-300 font-semibold" 
            />
          </div>
          
          {/* Filter dropdown */}
          <div className="relative w-full sm:w-auto flex items-center">
            <Filter className="absolute left-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)} 
              className="w-full sm:w-auto pl-9 pr-8 py-2.5 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-gray-300 rounded-xl hover:border-slate-300 dark:hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="ALL">{t.filterAll}</option>
              <option value="SUPER_ADMIN">{t.superAdmins}</option>
              <option value="ADMIN">{t.admins}</option>
              <option value="PASTOR">{t.pastors}</option>
              <option value="MEMBER">{t.believers}</option>
            </select>
            <ChevronDown className="absolute right-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
          
          {/* Add User button */}
          <button 
            onClick={onOpenAddMember} 
            className="w-full sm:w-auto py-2.5 px-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> {t.addUser}
          </button>
        </div>
      </div>

      {/* ─── Users Registry Cards Grid ─── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((u) => {
          const badge = getRoleBadgeStyles(u.role || "MEMBER");
          const RoleIcon = badge.icon;
          
          return (
            <div 
              key={u.id} 
              className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 flex flex-col justify-between relative overflow-hidden rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-500/15 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-black/40 transition-all duration-300 group"
            >
              {/* Card top right Delete action */}
              <button 
                onClick={() => onDeleteMember(u.id)} 
                className="absolute top-4 right-4 text-slate-350 dark:text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-lg transition-all duration-200"
                title="Remove user"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-4.5">
                <div className="flex items-center gap-4">
                  {/* Styled Avatar Circle */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${badge.grad} text-white font-black rounded-2xl flex items-center justify-center uppercase text-sm shadow-md shrink-0 transition-transform duration-300 group-hover:scale-105`}>
                    {(u.name || "U").substring(0, 2)}
                  </div>
                  
                  <div className="overflow-hidden min-w-0 pr-6">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate tracking-tight leading-snug">
                      {u.name || (language === "te" ? "సంఘ సభ్యుడు" : language === "hi" ? "कलीसिया सदस्य" : "Congregation Member")}
                    </h4>
                    
                    {/* User Role Pill Badge */}
                    <div className="mt-1 flex items-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${badge.bg}`}>
                        <RoleIcon className="w-2.5 h-2.5 shrink-0" />
                        {getRoleLabel(u.role || "MEMBER")}
                      </span>
                    </div>
                  </div>
                </div>

                <hr className="border-t border-slate-100 dark:border-white/[0.03]" />
                
                {/* User details list with circular icon badges */}
                <div className="space-y-3 text-xs font-semibold text-slate-700 dark:text-gray-300">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-400 dark:text-gray-500 border border-slate-150 dark:border-white/[0.04] shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate font-bold" title={u.email}>{u.email}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-400 dark:text-gray-500 border border-slate-150 dark:border-white/[0.04] shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-650 dark:text-gray-350">{u.phone || t.noPhone}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-400 dark:text-gray-500 border border-slate-150 dark:border-white/[0.04] shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      {t.registered}: <span className="font-bold text-slate-900 dark:text-white ml-0.5">{new Date(u.createdAt).toLocaleDateString("en-IN")}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Bottom Role Modifier Selector */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.03] space-y-1.5">
                <label className="block text-[9px] tracking-wider font-extrabold text-slate-400 dark:text-gray-500 uppercase">{t.changeRole}</label>
                {roleUpdatingId === u.id ? (
                  <div className="w-full py-2 rounded-xl flex items-center justify-center gap-2 border border-slate-100 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.02]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{t.updating}</span>
                  </div>
                ) : (
                  <div className="relative flex items-center w-full">
                    <select 
                      value={u.role || "MEMBER"} 
                      onChange={(e) => handleRoleChangeInternal(u.id, e.target.value)} 
                      className="w-full py-2 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] hover:border-slate-350 dark:hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="MEMBER">{t.believerOption}</option>
                      <option value="PASTOR">{t.shepherdOption}</option>
                      <option value="ADMIN">{t.adminOption}</option>
                      <option value="SUPER_ADMIN">{t.superAdminOption}</option>
                    </select>
                    <ChevronDown className="absolute right-3 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ─── Empty State if no filters matched ─── */}
        {filteredUsers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-[#121324]/60 border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl flex flex-col items-center justify-center p-8 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-1 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
              <Search className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {language === "te" ? "వినియోగదారులు కనుగొనబడలేదు" : language === "hi" ? "कोई उपयोगकर्ता नहीं मिला" : "No Users Found"}
            </h3>
            <p className="text-xs text-slate-400 dark:text-gray-500 max-w-xs leading-relaxed">{t.noUsersFound}</p>
          </div>
        )}
      </div>

    </div>
  );
}