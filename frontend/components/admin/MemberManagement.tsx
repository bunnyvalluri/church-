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
  Filter, 
  ChevronDown,
  LayoutGrid,
  List,
  Users,
  Crown,
  Copy,
  Check,
  X
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
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "MEMBER"
  });

  const handleRoleChangeInternal = async (userId: string, newRole: string) => {
    setRoleUpdatingId(userId);
    try {
      await onRoleChange(userId, newRole);
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddModal = () => {
    if (onOpenAddMember) {
      onOpenAddMember();
    } else {
      setIsAddModalOpen(true);
    }
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.name || !newMemberForm.email) return;

    const newMemberObj = {
      id: `user_${Date.now()}`,
      name: newMemberForm.name,
      email: newMemberForm.email,
      phone: newMemberForm.phone || "",
      role: newMemberForm.role,
      createdAt: new Date().toISOString()
    };

    onAddMember(newMemberObj);
    setNewMemberForm({ name: "", email: "", phone: "", role: "MEMBER" });
    setIsAddModalOpen(false);
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
      
      const matchesRole = roleFilter === "ALL" || (u.role || "MEMBER") === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Vibrant, high-contrast gradients palette for member initials in light & dark mode
  const AVATAR_GRADIENTS = [
    "from-indigo-500 to-violet-600 text-white shadow-indigo-500/20",
    "from-blue-500 to-cyan-600 text-white shadow-blue-500/20",
    "from-emerald-500 to-teal-600 text-white shadow-emerald-500/20",
    "from-violet-500 to-purple-600 text-white shadow-violet-500/20",
    "from-rose-500 to-pink-600 text-white shadow-rose-500/20",
    "from-amber-500 to-orange-600 text-white shadow-amber-500/20",
    "from-sky-500 to-blue-600 text-white shadow-sky-500/20",
    "from-teal-500 to-emerald-600 text-white shadow-teal-500/20",
  ];

  const getMemberAvatarGrad = (name: string, role: string) => {
    if (role === "SUPER_ADMIN") return "from-purple-600 via-indigo-600 to-violet-700 text-white shadow-purple-500/25";
    if (role === "ADMIN") return "from-indigo-600 to-blue-600 text-white shadow-indigo-500/25";
    if (role === "PASTOR") return "from-amber-500 to-orange-600 text-white shadow-amber-500/25";
    
    // Hash the name to pick a deterministic vibrant gradient
    let hash = 0;
    const str = name || "User";
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[idx];
  };

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          badge: "bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-500/30 font-bold",
          grad: "from-purple-600 via-indigo-600 to-violet-700",
          icon: Crown,
          label: isTe ? "రూట్ అడ్మిన్" : isHi ? "सुपर एडमिन" : "Super Admin"
        };
      case "ADMIN":
        return {
          badge: "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-500/30 font-bold",
          grad: "from-indigo-600 to-blue-600",
          icon: Shield,
          label: isTe ? "అడ్మిన్" : isHi ? "एडमिन" : "Admin"
        };
      case "PASTOR":
        return {
          badge: "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/30 font-bold",
          grad: "from-amber-500 to-orange-600",
          icon: Star,
          label: isTe ? "పాస్టర్" : isHi ? "పాస్టర్" : "Pastor"
        };
      default:
        return {
          badge: "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-500/30 font-bold",
          grad: "from-indigo-500 to-violet-600",
          icon: User,
          label: isTe ? "విశ్వాసి" : isHi ? "विश्वासी" : "Believer"
        };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0 w-full">
      
      {/* ─── Top Overview Metric Bar ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/[0.08] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md dark:shadow-none flex items-center justify-between hover:-translate-y-0.5 transition-all min-w-0">
          <div className="min-w-0 pr-2">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              {isTe ? "మొత్తం విశ్వాసులు" : isHi ? "कुल विश्वासी" : "Total Believers"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight">{stats.total}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30 rounded-xl sm:rounded-2xl shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/[0.08] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md dark:shadow-none flex items-center justify-between hover:-translate-y-0.5 transition-all min-w-0">
          <div className="min-w-0 pr-2">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              {isTe ? "కాపరులు & పాస్టర్లు" : isHi ? "पास्टर और चरवाहे" : "Shepherds & Pastors"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight">{stats.pastors}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/30 rounded-xl sm:rounded-2xl shrink-0">
            <Star className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/[0.08] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md dark:shadow-none flex items-center justify-between hover:-translate-y-0.5 transition-all min-w-0">
          <div className="min-w-0 pr-2">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              {isTe ? "అడ్మినిస్ట్రేటర్లు" : isHi ? "एडमिनिस्ट्रेटर" : "System Administrators"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight">{stats.superAdmins + stats.admins}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/30 rounded-xl sm:rounded-2xl shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/[0.08] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md dark:shadow-none flex items-center justify-between hover:-translate-y-0.5 transition-all min-w-0">
          <div className="min-w-0 pr-2">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              {isTe ? "సంఘ సభ్యులు" : isHi ? "कलीसिया सदस्य" : "Active Believers"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight">{stats.members}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/30 rounded-xl sm:rounded-2xl shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* ─── Header Controls Panel ─── */}
      <div className="bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/[0.08] p-4 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-5 rounded-xl sm:rounded-2xl shadow-sm dark:shadow-none min-w-0">
        
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-wider uppercase leading-none">
              {t.registryTitle}
            </h2>
            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shrink-0">
              {filteredUsers.length} / {users.length} {isTe ? "వినియోగదారులు" : isHi ? "उपयोगकर्ता" : "Users"}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium max-w-xl">
            {t.registrySubtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center w-full xl:w-auto shrink-0">
          
          <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
            {/* View Mode Toggle */}
            <div className="p-1 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 rounded-xl flex gap-1 items-center shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm border border-slate-200/60 dark:border-indigo-500"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm border border-slate-200/60 dark:border-indigo-500"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Role Filter Custom Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-0">
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="w-full sm:w-auto pl-8 pr-7 py-2 text-xs bg-slate-50 dark:bg-[#1A1C36] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold flex items-center justify-between gap-2 truncate"
              >
                <Filter className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 dark:text-slate-400 pointer-events-none" />
                <span className="truncate">
                  {roleFilter === "ALL" ? t.filterAll :
                   roleFilter === "SUPER_ADMIN" ? t.superAdmins :
                   roleFilter === "ADMIN" ? t.admins :
                   roleFilter === "PASTOR" ? t.pastors : t.believers}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isFilterDropdownOpen && (
                <>
                  {/* Backdrop overlay to close dropdown when clicking outside */}
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setIsFilterDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 sm:right-0 mt-1.5 w-52 py-1.5 bg-white dark:bg-[#161832] border border-slate-200 dark:border-white/15 rounded-xl shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
                    {[
                      { value: "ALL", label: t.filterAll },
                      { value: "SUPER_ADMIN", label: t.superAdmins },
                      { value: "ADMIN", label: t.admins },
                      { value: "PASTOR", label: t.pastors },
                      { value: "MEMBER", label: t.believers },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setRoleFilter(opt.value);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                          roleFilter === opt.value
                            ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {roleFilter === opt.value && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search registry bar */}
          <div className="relative flex-1 w-full sm:w-56 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-[#1A1C36] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold" 
            />
          </div>
          
          {/* Add User button */}
          <button 
            onClick={handleOpenAddModal} 
            className="w-full sm:w-auto py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> {t.addUser}
          </button>
        </div>
      </div>

      {/* ─── Role Filter Tabs Bar ─── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-1.5 pt-0.5 touch-pan-x min-w-0 max-w-full">
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap ${
              roleFilter === tab.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-[#121428] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/10"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              roleFilter === tab.key
                ? "bg-white/20 text-white"
                : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── VIEW 1: GRID CARDS VIEW ─── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {filteredUsers.map((u) => {
            const badge = getRoleBadgeStyles(u.role || "MEMBER");
            const RoleIcon = badge.icon;
            
            return (
              <div 
                key={u.id} 
                className="bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-200 group min-w-0"
              >
                {/* Delete button */}
                <button 
                  onClick={() => onDeleteMember(u.id)} 
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 p-1.5 rounded-xl transition-all z-10"
                  title="Remove user"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="space-y-3.5 sm:space-y-4">
                  <div className="flex items-center gap-3 sm:gap-3.5 pr-6">
                    {/* Avatar Circle */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getMemberAvatarGrad(u.name, u.role)} font-black rounded-xl sm:rounded-2xl flex items-center justify-center uppercase text-xs sm:text-sm shadow-md shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                      {(u.name || "U").substring(0, 2)}
                    </div>
                    
                    <div className="overflow-hidden min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">
                        {u.name || (isTe ? "సంఘ సభ్యుడు" : isHi ? "कलीसिया सदस्य" : "Congregation Member")}
                      </h4>
                      
                      {/* Role Pill Badge */}
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider border ${badge.badge}`}>
                          <RoleIcon className="w-2.5 h-2.5 shrink-0" />
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-t border-slate-100 dark:border-white/[0.06]" />
                  
                  {/* Info details */}
                  <div className="space-y-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden min-w-0">
                        <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-500/25">
                          <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <span className="truncate font-bold text-slate-900 dark:text-slate-100 max-w-[150px] min-[400px]:max-w-[200px] sm:max-w-[220px]" title={u.email}>{u.email || "—"}</span>
                      </div>
                      {u.email && (
                        <button 
                          onClick={() => handleCopyText(u.email, `email_${u.id}`)}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 shrink-0"
                          title="Copy Email"
                        >
                          {copiedId === `email_${u.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden min-w-0">
                        <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-500/25">
                          <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{u.phone || t.noPhone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100 dark:border-emerald-500/25">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate">
                        {t.registered}: <span className="font-bold text-slate-900 dark:text-white ml-0.5">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "Recent"}</span>
                      </span>
                    </div>

                  </div>
                </div>

                {/* Card Bottom Role Modifier Selector */}
                <div className="mt-4 pt-3 sm:mt-5 sm:pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-1">
                  <label className="block text-[9px] tracking-wider font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {t.changeRole}
                  </label>
                  {roleUpdatingId === u.id ? (
                    <div className="w-full py-2 rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{t.updating}</span>
                    </div>
                  ) : (
                    <div className="relative flex items-center w-full">
                      <select 
                        value={u.role || "MEMBER"} 
                        onChange={(e) => handleRoleChangeInternal(u.id, e.target.value)} 
                        className="w-full py-2 pl-3 pr-8 border rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#1A1C36] border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="MEMBER">{t.believerOption}</option>
                        <option value="PASTOR">{t.shepherdOption}</option>
                        <option value="ADMIN">{t.adminOption}</option>
                        <option value="SUPER_ADMIN">{t.superAdminOption}</option>
                      </select>
                      <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 dark:text-slate-400 pointer-events-none" />
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
        <div className="bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm dark:shadow-none min-w-0">
          
          {/* 📱 Mobile Responsive Roster List (< sm) */}
          <div className="block sm:hidden divide-y divide-slate-100 dark:divide-white/[0.06]">
            {filteredUsers.map((u) => {
              const badge = getRoleBadgeStyles(u.role || "MEMBER");
              const RoleIcon = badge.icon;
              return (
                <div key={u.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 bg-gradient-to-br ${getMemberAvatarGrad(u.name, u.role)} font-black rounded-xl flex items-center justify-center uppercase text-xs shadow-sm shrink-0`}>
                        {(u.name || "U").substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-slate-900 dark:text-white text-xs block truncate" title={u.name}>{u.name || "Member"}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[8px] font-extrabold uppercase tracking-wider border ${badge.badge} mt-0.5`}>
                          <RoleIcon className="w-2 h-2 shrink-0" />
                          {badge.label}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onDeleteMember(u.id)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 rounded-xl transition-colors shrink-0"
                      title="Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-[#1A1C36]/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-slate-800 dark:text-slate-200 font-bold max-w-[210px]">{u.email || "—"}</span>
                      {u.email && (
                        <button 
                          onClick={() => handleCopyText(u.email, `m_email_${u.id}`)}
                          className="text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold shrink-0"
                        >
                          {copiedId === `m_email_${u.id}` ? "Copied!" : "Copy"}
                        </button>
                      )}
                    </div>
                    {u.phone && <div className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold">{u.phone}</div>}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t.changeRole}:</span>
                    <div className="relative max-w-[160px] flex-1">
                      <select 
                        value={u.role || "MEMBER"} 
                        onChange={(e) => handleRoleChangeInternal(u.id, e.target.value)} 
                        className="w-full py-1.5 pl-2.5 pr-6 border rounded-xl text-[10px] font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#1A1C36] border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer truncate"
                      >
                        <option value="MEMBER">{t.believerOption}</option>
                        <option value="PASTOR">{t.shepherdOption}</option>
                        <option value="ADMIN">{t.adminOption}</option>
                        <option value="SUPER_ADMIN">{t.superAdminOption}</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 💻 Desktop Table View (>= sm) */}
          <div className="hidden sm:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[880px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-100/70 dark:bg-[#1A1C36]/80">
                  <th className="py-3.5 px-4 sm:px-5 w-56">{isTe ? "సభ్యుడు" : isHi ? "सदस्य" : "Member"}</th>
                  <th className="py-3.5 px-4 sm:px-5 w-36">{isTe ? "హోదా" : isHi ? "భూమిక" : "Platform Role"}</th>
                  <th className="py-3.5 px-4 sm:px-5 min-w-[220px]">{isTe ? "ఈమెయిల్" : isHi ? "ఈమెయిల్" : "Email"}</th>
                  <th className="py-3.5 px-4 sm:px-5 w-36">{isTe ? "ఫోన్" : isHi ? "ఫోన్" : "Phone"}</th>
                  <th className="py-3.5 px-4 sm:px-5 w-32">{isTe ? "చేరిన తేదీ" : isHi ? "పंजीकृत" : "Registered"}</th>
                  <th className="py-3.5 px-4 sm:px-5 w-44 text-center">{isTe ? "చర్యలు" : isHi ? "కా కార్రవై" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] text-xs font-semibold text-slate-800 dark:text-slate-200">
                {filteredUsers.map((u) => {
                  const badge = getRoleBadgeStyles(u.role || "MEMBER");
                  const RoleIcon = badge.icon;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                      {/* Member Name */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br ${getMemberAvatarGrad(u.name, u.role)} font-black rounded-xl flex items-center justify-center uppercase text-xs shadow-sm shrink-0`}>
                            {(u.name || "U").substring(0, 2)}
                          </div>
                          <span className="font-black text-slate-900 dark:text-white block truncate max-w-[170px]" title={u.name}>{u.name || "Member"}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border whitespace-nowrap ${badge.badge}`}>
                          <RoleIcon className="w-2.5 h-2.5 shrink-0" />
                          {badge.label}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center justify-between gap-2 max-w-[240px]">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={u.email}>{u.email || "—"}</span>
                          {u.email && (
                            <button 
                              onClick={() => handleCopyText(u.email, `email_tbl_${u.id}`)}
                              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 shrink-0"
                              title="Copy Email"
                            >
                              {copiedId === `email_tbl_${u.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 sm:px-5 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                        {u.phone || "—"}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 sm:px-5 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "Recent"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="relative max-w-[140px] flex-1">
                            <select 
                              value={u.role || "MEMBER"} 
                              onChange={(e) => handleRoleChangeInternal(u.id, e.target.value)} 
                              className="w-full py-1.5 pl-2.5 pr-6 border rounded-xl text-[10px] font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#1A1C36] border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer truncate"
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
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 rounded-xl transition-colors shrink-0"
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
        <div className="py-12 sm:py-16 text-center bg-white dark:bg-[#121428] border border-dashed border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-6 sm:p-8 gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/30 shadow-sm">
            <Search className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
            {t.noUsersFound}
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 max-w-xs font-semibold">
            {isTe ? "వేరొక శోధన లేదా వడపోతను ప్రయత్నించండి." : isHi ? "कृपया एक अलग खोज या फ़िल्टर आज़माएं।" : "Try clearing search filter or changing role categories."}
          </p>
        </div>
      )}

      {/* ─── MODAL: ADD MEMBER ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121428] rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-white/15 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#1A1C36]/50">
              <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                {isTe ? "కొత్త సభ్యుడిని చేర్చండి" : isHi ? "नया सदस्य जोड़ें" : "Add New Member"}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/10 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddMemberSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                  {isTe ? "పూర్తి పేరు" : isHi ? "पूरा नाम" : "Full Name"} *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. John Doe" 
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-[#1A1C36] text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                  {isTe ? "ఈమెయిల్ చిరునామా" : isHi ? "ईमेल पता" : "Email Address"} *
                </label>
                <input 
                  type="email" 
                  required 
                  placeholder="e.g. john@example.com" 
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-[#1A1C36] text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                  {isTe ? "ఫోన్ నంబర్" : isHi ? "फोन नंबर" : "Phone Number"}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 9876543210" 
                  value={newMemberForm.phone}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-[#1A1C36] text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                  {isTe ? "హోదా" : isHi ? "भूमिका" : "Platform Role"}
                </label>
                <div className="relative flex items-center">
                  <select 
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1C36] border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="MEMBER">{t.believerOption}</option>
                    <option value="PASTOR">{t.shepherdOption}</option>
                    <option value="ADMIN">{t.adminOption}</option>
                    <option value="SUPER_ADMIN">{t.superAdminOption}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="flex-1 py-2.5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  {isTe ? "రద్దు" : isHi ? "రద్ద کریں" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-md shadow-indigo-500/20 active:scale-95"
                >
                  {isTe ? "చేర్చండి" : isHi ? "जोड़ें" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}