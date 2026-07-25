"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Shield, 
  Trash2, 
  Calendar, 
  Phone, 
  Mail, 
  Loader2, 
  Plus, 
  User, 
  Star, 
  Sparkles, 
  Filter, 
  ChevronDown,
  LayoutGrid,
  List,
  Users,
  Crown,
  Copy,
  Check
} from "lucide-react";
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
  users = [],
  onRoleChange,
  onDeleteMember,
  onAddMember,
  onOpenAddMember
}: MemberManagementProps) {
  const { language } = useLanguage();
  const isTe = language === "te";
  const isHi = language === "hi";
  const t = adminTranslations[language || "en"].members;

  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRoleChangeInternal = async (userId: string, newRole: string) => {
    setRoleUpdatingId(userId);
    try {
      await onRoleChange(userId, newRole);
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const superAdmins = users.filter(u => u.role === "SUPER_ADMIN").length;
    const admins = users.filter(u => u.role === "ADMIN").length;
    const pastors = users.filter(u => u.role === "PASTOR").length;
    const members = users.filter(u => u.role === "MEMBER" || !u.role).length;
    return { total, superAdmins, admins, pastors, members };
  }, [users]);

  // Filtering
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = 
        (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.phone || "").includes(search);
      
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          badge: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40",
          grad: "from-indigo-600 via-purple-600 to-violet-700",
          icon: Crown,
          label: isTe ? "రూట్ అడ్మిన్" : isHi ? "सुपर एडमिन" : "Super Admin"
        };
      case "ADMIN":
        return {
          badge: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40",
          grad: "from-indigo-500 to-violet-650",
          icon: Shield,
          label: isTe ? "అడ్మిన్" : isHi ? "एडमिन" : "Admin"
        };
      case "PASTOR":
        return {
          badge: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40",
          grad: "from-emerald-500 to-teal-600",
          icon: Star,
          label: isTe ? "పాస్టర్" : isHi ? "पास्टर" : "Pastor"
        };
      default:
        return {
          badge: "bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08]",
          grad: "from-slate-600 to-slate-800",
          icon: User,
          label: isTe ? "విశ్వాసి" : isHi ? "विश्वासी" : "Believer"
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ─── Top Overview Metric Bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "మొత్తం విశ్వాసులు" : isHi ? "कुल विश्वासी" : "Total Believers"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{stats.total}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "కాపరులు & పాస్టర్లు" : isHi ? "पास्टर और चरवाहे" : "Shepherds & Pastors"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{stats.pastors}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <Star className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "అడ్మినిస్ట్రేటర్లు" : isHi ? "एडमिनिस्ट्रेटर" : "System Administrators"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{stats.superAdmins + stats.admins}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "సంఘ సభ్యులు" : isHi ? "कलीसिया सदस्य" : "Active Believers"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{stats.members}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── Header Controls Panel ─── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 rounded-2xl shadow-sm backdrop-blur-xl">
        
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-wider uppercase leading-none">
              {t.registryTitle}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
              {filteredUsers.length} / {users.length} {isTe ? "వినియోగదారులు" : isHi ? "उपयोगकर्ता" : "Users"}
            </span>
          </div>
          <p className="text-xs text-slate-450 dark:text-gray-400 mt-1 font-semibold max-w-xl">
            {t.registrySubtitle}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center w-full lg:w-auto shrink-0">
          
          {/* View Mode Toggle */}
          <div className="p-1 bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.04] rounded-xl flex gap-1 items-center shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-white/[0.08] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-white/[0.04]"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-gray-300"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-white dark:bg-white/[0.08] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-white/[0.04]"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-gray-300"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Search registry bar */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full sm:w-56 pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-semibold" 
            />
          </div>
          
          {/* Role Filter dropdown */}
          <div className="relative w-full sm:w-auto flex items-center">
            <Filter className="absolute left-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)} 
              className="w-full sm:w-auto pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-bold appearance-none cursor-pointer"
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
            className="w-full sm:w-auto py-2 px-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> {t.addUser}
          </button>
        </div>
      </div>

      {/* ─── Role Filter Tabs Bar ─── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { key: "ALL", label: isTe ? "అన్నీ" : isHi ? "सभी" : "All Users", count: stats.total },
          { key: "SUPER_ADMIN", label: isTe ? "రూట్ అడ్మిన్‌లు" : isHi ? "सुपर एडमिन" : "Super Admins", count: stats.superAdmins },
          { key: "ADMIN", label: isTe ? "అడ్మిన్‌లు" : isHi ? "एडमिन" : "Admins", count: stats.admins },
          { key: "PASTOR", label: isTe ? "పాస్టర్లు" : isHi ? "पास्टर" : "Pastors", count: stats.pastors },
          { key: "MEMBER", label: isTe ? "విశ్వాసులు" : isHi ? "विश्वासी" : "Believers", count: stats.members }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setRoleFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              roleFilter === tab.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-[#111827] text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              roleFilter === tab.key
                ? "bg-white/20 text-white"
                : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-gray-300"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── VIEW 1: GRID CARDS VIEW ─── */}
      {viewMode === "grid" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((u) => {
            const badge = getRoleBadgeStyles(u.role || "MEMBER");
            const RoleIcon = badge.icon;
            
            return (
              <div 
                key={u.id} 
                className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden rounded-2xl shadow-sm hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Delete button */}
                <button 
                  onClick={() => onDeleteMember(u.id)} 
                  className="absolute top-4 right-4 text-slate-300 dark:text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-xl transition-all duration-200"
                  title="Remove user"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="space-y-4">
                  <div className="flex items-center gap-3.5">
                    {/* Avatar Circle */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${badge.grad} text-white font-black rounded-2xl flex items-center justify-center uppercase text-sm shadow-md shadow-indigo-500/10 shrink-0 transition-transform duration-300 group-hover:scale-105`}>
                      {(u.name || "U").substring(0, 2)}
                    </div>
                    
                    <div className="overflow-hidden min-w-0 pr-6">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">
                        {u.name || (isTe ? "సంఘ సభ్యుడు" : isHi ? "कलीसिया सदस्य" : "Congregation Member")}
                      </h4>
                      
                      {/* Role Pill Badge */}
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${badge.badge}`}>
                          <RoleIcon className="w-2.5 h-2.5 shrink-0" />
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-t border-slate-100 dark:border-white/[0.04]" />
                  
                  {/* Info details */}
                  <div className="space-y-2.5 text-xs font-semibold text-slate-700 dark:text-gray-300">
                    
                    <div className="flex items-center justify-between gap-2 group/copy">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-7 h-7 rounded-xl bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center text-slate-400 shrink-0 border border-slate-200/60 dark:border-white/[0.04]">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate font-bold text-slate-800 dark:text-gray-200" title={u.email}>{u.email}</span>
                      </div>
                      <button 
                        onClick={() => handleCopyText(u.email, `email_${u.id}`)}
                        className="text-slate-300 dark:text-gray-600 hover:text-indigo-600 transition-colors p-1"
                        title="Copy Email"
                      >
                        {copiedId === `email_${u.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center text-slate-400 shrink-0 border border-slate-200/60 dark:border-white/[0.04]">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-600 dark:text-gray-400">{u.phone || t.noPhone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center text-slate-400 shrink-0 border border-slate-200/60 dark:border-white/[0.04]">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        {t.registered}: <span className="font-bold text-slate-900 dark:text-white ml-0.5">{new Date(u.createdAt).toLocaleDateString("en-IN")}</span>
                      </span>
                    </div>

                  </div>
                </div>

                {/* Card Bottom Role Modifier Selector */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/[0.04] space-y-1.5">
                  <label className="block text-[9px] tracking-wider font-extrabold text-slate-400 dark:text-gray-500 uppercase">
                    {t.changeRole}
                  </label>
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
                        className="w-full py-2 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="MEMBER">{t.believerOption}</option>
                        <option value="PASTOR">{t.shepherdOption}</option>
                        <option value="ADMIN">{t.adminOption}</option>
                        <option value="SUPER_ADMIN">{t.superAdminOption}</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── VIEW 2: COMPACT TABLE ROSTER VIEW ─── */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-150 dark:border-white/[0.04] text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                  <th className="py-4 px-6">{isTe ? "సభ్యుడు" : isHi ? "सदस्य" : "Member"}</th>
                  <th className="py-4 px-6">{isTe ? "హోదా" : isHi ? "भूमिका" : "Platform Role"}</th>
                  <th className="py-4 px-6">{isTe ? "ఈమెయిల్" : isHi ? "ईमेल" : "Email"}</th>
                  <th className="py-4 px-6">{isTe ? "ఫోన్" : isHi ? "फोन" : "Phone"}</th>
                  <th className="py-4 px-6">{isTe ? "చేరిన తేదీ" : isHi ? "पंजीकृत" : "Registered"}</th>
                  <th className="py-4 px-6 text-center">{isTe ? "చర్యలు" : isHi ? "कार्रवाई" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-xs font-semibold text-slate-700 dark:text-gray-300">
                {filteredUsers.map((u) => {
                  const badge = getRoleBadgeStyles(u.role || "MEMBER");
                  const RoleIcon = badge.icon;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 bg-gradient-to-br ${badge.grad} text-white font-black rounded-xl flex items-center justify-center uppercase text-xs shadow-sm shrink-0`}>
                            {(u.name || "U").substring(0, 2)}
                          </div>
                          <span className="font-black text-slate-900 dark:text-white block">{u.name || "Member"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${badge.badge}`}>
                          <RoleIcon className="w-2.5 h-2.5" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-600 dark:text-gray-300">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 font-medium">
                        {u.phone || "—"}
                      </td>
                      <td className="py-3.5 px-6 text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="relative">
                            <select 
                              value={u.role || "MEMBER"} 
                              onChange={(e) => handleRoleChangeInternal(u.id, e.target.value)} 
                              className="py-1.5 pl-3 pr-7 border rounded-xl text-[10px] font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all appearance-none cursor-pointer"
                            >
                              <option value="MEMBER">{t.believerOption}</option>
                              <option value="PASTOR">{t.shepherdOption}</option>
                              <option value="ADMIN">{t.adminOption}</option>
                              <option value="SUPER_ADMIN">{t.superAdminOption}</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                          </div>

                          <button 
                            onClick={() => onDeleteMember(u.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Empty State ─── */}
      {filteredUsers.length === 0 && (
        <div className="py-16 text-center bg-white dark:bg-[#111827] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
            <Search className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            {t.noUsersFound}
          </h4>
          <p className="text-xs text-slate-450 dark:text-gray-500 max-w-xs font-semibold">
            {isTe ? "వేరొక శోధన లేదా వడపోతను ప్రయత్నించండి." : isHi ? "कृपया एक अलग खोज या फ़िल्टर आज़माएं।" : "Try clearing search filter or changing role categories."}
          </p>
        </div>
      )}

    </div>
  );
}