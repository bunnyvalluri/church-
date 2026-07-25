"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Home, 
  Users, 
  Plus, 
  X, 
  Search, 
  Check, 
  Phone, 
  MapPin, 
  ChevronDown, 
  Crown, 
  Mail, 
  ArrowRight, 
  Trash2, 
  UserCheck, 
  Award,
  Sparkles,
  UserPlus
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface FamilyManagementProps {
  users?: any[];
}

interface Family {
  id: string;
  familyName: string;
  headOfHouseholdId: string;
  members: string[]; // User IDs
  contactPhone: string;
  address: string;
}

const DEFAULT_FAMILIES: Family[] = [
  {
    id: "fam_001",
    familyName: "Valluri Household",
    headOfHouseholdId: "user_super_admin_001",
    members: ["user_super_admin_001", "user_admin_002"],
    contactPhone: "+91 96409 43777",
    address: "15-201, Vivekananda Nagar, Jeedimetla, Hyderabad"
  },
  {
    id: "fam_002",
    familyName: "Raju Family",
    headOfHouseholdId: "user_pastor_003",
    members: ["user_pastor_003", "user_member_004"],
    contactPhone: "+91 87654 32109",
    address: "Subhash Nagar Sanctuary Road, Hyderabad"
  },
  {
    id: "fam_003",
    familyName: "Reddy Household",
    headOfHouseholdId: "user_member_005",
    members: ["user_member_005", "user_member_006"],
    contactPhone: "+91 65432 10987",
    address: "Kompally Family Quarters, Hyderabad"
  }
];

export default function FamilyManagement({ users = [] }: FamilyManagementProps) {
  const { language } = useLanguage();
  const isTe = language === "te";
  const isHi = language === "hi";
  const t = adminTranslations[language || "en"]?.families || {
    familyUnits: "Family Units",
    headOfHousehold: "Head of Household",
    manageHousehold: "Manage Members",
    householdRoster: "Household Roster",
    nominateHead: "Set as Head",
    selectFamily: "Select a Family",
    selectFamilyDesc: "Choose a family household unit to view its records, set household heads, or assign members.",
    setupModalTitle: "Setup Family Unit",
    familyNameLabel: "Family Title / Name",
    headOfHouseholdSelect: "Head of Household",
    selectHeadPlaceholder: "Select Household Head",
    contactPhone: "Contact Phone",
    sanctuaryAddress: "Sanctuary Address",
    cancel: "Cancel",
    setupFamilyBtn: "Create Family",
    assignMembersTitle: "Assign Family Members"
  };

  const getFamilyNameTranslation = (name: string) => {
    switch (name) {
      case "Valluri Household": return isTe ? "వల్లూరి కుటుంబం" : isHi ? "वल्लूरी घराना" : name;
      case "Raju Family": return isTe ? "రాజు కుటుంబం" : isHi ? "राजू परिवार" : name;
      case "Reddy Household": return isTe ? "రెడ్డి ఇల్లు" : isHi ? "रेड्डी घराना" : name;
      default: return name;
    }
  };

  const getFamilyAddressTranslation = (addr: string) => {
    if (addr.includes("Vivekananda Nagar")) {
      return isTe ? "15-201, వివేకానంద నగర్, జీడిమెట్ల, హైదరాబాద్" :
             isHi ? "15-201, विवेकानंद नगर, जीडीमेटला, हैदराबाद" : addr;
    }
    if (addr.includes("Subhash Nagar")) {
      return isTe ? "సుభాష్ నగర్, హైదరాబాద్" :
             isHi ? "सुभाष नगर, हैदराबाद" : addr;
    }
    return addr;
  };

  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [familySearchQuery, setFamilySearchQuery] = useState("");
  const [memberSearchModal, setMemberSearchModal] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newFamily, setNewFamily] = useState({ familyName: "", headId: "", contactPhone: "", address: "" });

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/families');
      const data = await res.json();
      if (data.success && data.families) {
        setFamilies(data.families);
        if (data.families.length > 0) {
          setSelectedFamily(data.families[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching families", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  // Computed Stats
  const stats = useMemo(() => {
    const totalFamilies = families.length;
    const totalEnrolled = families.reduce((acc, f) => acc + (f.members ? f.members.length : 0), 0);
    const avgSize = totalFamilies > 0 ? (totalEnrolled / totalFamilies).toFixed(1) : "0";
    return { totalFamilies, totalEnrolled, avgSize };
  }, [families]);

  // Filtered Families List
  const filteredFamilies = useMemo(() => {
    return families.filter(f => {
      const head = users.find(u => u.id === f.headOfHouseholdId) || {};
      const matchesQuery = 
        f.familyName.toLowerCase().includes(familySearchQuery.toLowerCase()) ||
        f.address.toLowerCase().includes(familySearchQuery.toLowerCase()) ||
        (head.name || "").toLowerCase().includes(familySearchQuery.toLowerCase());
      return matchesQuery;
    });
  }, [families, familySearchQuery, users]);

  // Handlers
  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamily.familyName) return;

    const headId = newFamily.headId || (users.length > 0 ? users[0].id : "user_001");
    const created: Family = {
      id: `fam_${Date.now()}`,
      familyName: newFamily.familyName,
      headOfHouseholdId: headId,
      members: [headId],
      contactPhone: newFamily.contactPhone || "+91 96409 43777",
      address: newFamily.address || "Jeedimetla, Hyderabad"
    };

    try {
      await fetch('/api/admin/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
    } catch (err) {
      console.warn("Backend API unavailable, saving locally", err);
    }

    setFamilies(prev => [created, ...prev]);
    setSelectedFamily(created);
    setNewFamily({ familyName: "", headId: "", contactPhone: "", address: "" });
    setIsCreateOpen(false);
  };

  const handleAddMemberToFamily = async (userId: string) => {
    if (!selectedFamily) return;

    const alreadyExists = selectedFamily.members.includes(userId);
    const updatedMembers = alreadyExists 
      ? selectedFamily.members.filter(id => id !== userId) 
      : [...selectedFamily.members, userId];

    const updatedFamily = { ...selectedFamily, members: updatedMembers };

    try {
      await fetch('/api/admin/families', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFamily.id,
          members: updatedMembers
        })
      });
    } catch (err) {
      console.warn("Backend update failed, applying locally", err);
    }

    setFamilies(prev => prev.map(f => f.id === selectedFamily.id ? updatedFamily : f));
    setSelectedFamily(updatedFamily);
  };

  const handleSetHead = async (userId: string) => {
    if (!selectedFamily) return;

    const updatedFamily = { ...selectedFamily, headOfHouseholdId: userId };

    try {
      await fetch('/api/admin/families', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFamily.id,
          headOfHouseholdId: userId
        })
      });
    } catch (err) {
      console.warn("Backend update failed, applying locally", err);
    }

    setFamilies(prev => prev.map(f => f.id === selectedFamily.id ? updatedFamily : f));
    setSelectedFamily(updatedFamily);
  };

  const handleRemoveFamily = async (familyId: string) => {
    if (confirm(isTe ? "మీరు ఖచ్చితంగా ఈ కుటుంబ రికార్డును తొలగించాలనుకుంటున్నారా?" : isHi ? "क्या आप वाकई इस परिवार रिकॉर्ड को हटाना चाहते हैं?" : "Are you sure you want to delete this family record?")) {
      try {
        await fetch(`/api/admin/families?id=${familyId}`, { method: 'DELETE' });
      } catch (err) {
        console.warn("Backend delete failed, applying locally", err);
      }

      setFamilies(prev => prev.filter(f => f.id !== familyId));
      if (selectedFamily?.id === familyId) {
        const remaining = families.filter(f => f.id !== familyId);
        setSelectedFamily(remaining.length > 0 ? remaining[0] : null);
      }
    }
  };

  const getUserDetails = (userId: string) => {
    return users.find(u => u.id === userId || u.uid === userId) || { 
      name: "Congregation Member", 
      email: "believer@gmail.com", 
      phone: "+91 96409 43777" 
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ─── Top Overview Metric Bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "మొత్తం కుటుంబాలు" : isHi ? "कुल परिवार" : "Total Family Units"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{stats.totalFamilies}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <Home className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "చేరిన కుటుంబ సభ్యులు" : isHi ? "नामांकित सदस्य" : "Enrolled Members"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{stats.totalEnrolled}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "సగటు కుటుంబ పరిమాణం" : isHi ? "औसत आकार" : "Avg Household Size"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{stats.avgSize}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "నమోదైన విశ్వాసులు" : isHi ? "पंजीकृत विश्वासी" : "Church Believers"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{users.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid: Sidebar List + Right Detail/Dashboard Pane ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ─── Left Column: Families Index ─── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl space-y-4">
            
            {/* Header & Action */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {t.familyUnits}
                </h2>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-0.5">
                  {filteredFamilies.length} {isTe ? "కుటుంబ రికార్డులు" : isHi ? "परिवार रिकॉर्ड" : "active households"}
                </p>
              </div>
              <button 
                onClick={() => setIsCreateOpen(true)} 
                className="py-2 px-3 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> {isTe ? "కొత్తది" : isHi ? "नया" : "New"}
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder={isTe ? "కుటుంబాల శోధన..." : isHi ? "परिवार खोजें..." : "Filter households..."}
                value={familySearchQuery}
                onChange={(e) => setFamilySearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-semibold"
              />
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredFamilies.map(fam => {
                const head = getUserDetails(fam.headOfHouseholdId);
                const isSelected = selectedFamily?.id === fam.id;
                
                return (
                  <div 
                    key={fam.id}
                    onClick={() => setSelectedFamily(fam)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:-translate-y-0.5 ${
                      isSelected 
                        ? "bg-white dark:bg-[#16172D] border-indigo-500/60 dark:border-indigo-500/50 shadow-md shadow-indigo-500/5" 
                        : "bg-slate-50/50 hover:bg-white dark:bg-[#16172D]/30 dark:hover:bg-[#16172D]/60 border-slate-200/60 dark:border-white/[0.04]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-violet-600" />
                    )}

                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1 overflow-hidden pr-2">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {getFamilyNameTranslation(fam.familyName)}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-gray-400 font-semibold truncate flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{head.name || "Household Head"}</span>
                        </p>
                        <p className="text-[9px] text-slate-400 dark:text-gray-500 font-medium truncate mt-1">
                          {getFamilyAddressTranslation(fam.address)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemoveFamily(fam.id); }}
                          className="text-slate-300 dark:text-gray-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                          title="Delete Family"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-extrabold text-slate-600 dark:text-gray-300 flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-white/[0.04]">
                          <Users className="w-3 h-3 text-indigo-500" />
                          <span>{fam.members ? fam.members.length : 0}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredFamilies.length === 0 && (
                <div className="py-10 text-center text-xs text-slate-400 dark:text-gray-500 font-semibold bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.05] p-4">
                  {isTe ? "కుటుంబ రికార్డులు ఏవీ కనుగొనబడలేదు" : isHi ? "कोई परिवार रिकॉर्ड नहीं मिला" : "No matching family households found."}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ─── Right Column: Selected Household Detail or Interactive Showcase ─── */}
        <div className="lg:col-span-2 space-y-6">
          {selectedFamily ? (
            /* SELECTED FAMILY DETAIL VIEW */
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-xl space-y-6">
              
              {/* Header Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/10 via-purple-900/5 to-slate-900/5 dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-transparent border border-indigo-100 dark:border-white/[0.06] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
                    <Home className="w-3 h-3" />
                    {isTe ? "కుటుంబ విభాగాలు" : isHi ? "परिवार इकाई" : "Household Unit"}
                  </span>

                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {getFamilyNameTranslation(selectedFamily.familyName)}
                  </h2>

                  <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-600 dark:text-gray-300 font-semibold">
                    <span className="flex items-center gap-1.5 bg-white/80 dark:bg-white/[0.04] px-3 py-1 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      {t.headOfHousehold}: <strong className="text-slate-900 dark:text-white ml-0.5">{getUserDetails(selectedFamily.headOfHouseholdId).name}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/80 dark:bg-white/[0.04] px-3 py-1 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      {selectedFamily.contactPhone}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/80 dark:bg-white/[0.04] px-3 py-1 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {getFamilyAddressTranslation(selectedFamily.address)}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsAddMemberOpen(true)}
                  className="py-3 px-5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  {isTe ? "సభ్యులను చేర్చండి" : isHi ? "सदस्य जोड़ें" : "+ Assign Members"}
                </button>
              </div>

              {/* Household Roster Section Header */}
              <div className="flex items-center justify-between pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">
                  {t.householdRoster} ({selectedFamily.members ? selectedFamily.members.length : 0})
                </h3>
              </div>

              {/* Roster Member Grid */}
              <div className="grid md:grid-cols-2 gap-3">
                {selectedFamily.members && selectedFamily.members.map((mId) => {
                  const member = getUserDetails(mId);
                  const isHead = mId === selectedFamily.headOfHouseholdId;
                  
                  return (
                    <div 
                      key={mId} 
                      className="p-4 bg-slate-50/50 hover:bg-white dark:bg-[#16172D]/30 dark:hover:bg-[#16172D]/60 border border-slate-200/60 dark:border-white/[0.04] hover:border-indigo-200 dark:hover:border-indigo-500/20 rounded-2xl flex items-center justify-between gap-3 transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-extrabold rounded-2xl flex items-center justify-center uppercase text-xs shadow-md shadow-indigo-500/10 shrink-0">
                          {(member.name || "M").substring(0, 2)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {member.name}
                            </h4>
                            {isHead && (
                              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-200/60 rounded-md">
                                <Crown className="w-2.5 h-2.5" />
                                {isTe ? "ఇంటి పెద్ద" : isHi ? "मुखिया" : "Head"}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-450 dark:text-gray-400 truncate mt-0.5 font-medium">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!isHead && (
                          <button 
                            onClick={() => handleSetHead(mId)}
                            className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all"
                            title={t.nominateHead}
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleAddMemberToFamily(mId)}
                          className="p-1.5 text-slate-300 dark:text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Remove from household"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {(!selectedFamily.members || selectedFamily.members.length === 0) && (
                  <div className="col-span-full py-16 text-center bg-slate-50/40 dark:bg-[#16172D]/20 border border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl flex flex-col items-center justify-center gap-3 p-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                      <Home className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {isTe ? "ఈ కుటుంబంలో ఇంకా సభ్యులు లేరు" : isHi ? "इस परिवार में अभी कोई सदस्य नहीं है" : "No members assigned to this household yet"}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-gray-500 max-w-sm mt-1 font-medium">
                        {isTe ? "విశ్వాసుల రిజిస్ట్రీ నుండి కుటుంబ సభ్యులను సులభంగా అసైన్ చేయండి." : isHi ? "विश्वासी निर्देशिका से परिवार के सदस्यों को आसानी से इस घराने में जोड़ें।" : "Assign congregation believers to this family household unit."}
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsAddMemberOpen(true)}
                      className="mt-2 py-2.5 px-5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/15 transition-all active:scale-95"
                    >
                      <UserPlus className="w-4 h-4" />
                      {isTe ? "సభ్యులను జతచేయండి" : isHi ? "सदस्य जोड़ें" : "Assign Family Members"}
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* INTERACTIVE HOUSEHOLD DIRECTORY SHOWCASE (When no family is selected) */
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-8 rounded-2xl shadow-sm backdrop-blur-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-150/60 dark:border-white/[0.04]">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {isTe ? "కుటుంబ రికార్డుల కేంద్రం" : isHi ? "परिवार रिकॉर्ड केंद्र" : "Church Household Directory"}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-gray-400 font-semibold mt-1">
                    {isTe ? "కుటుంబాన్ని ఎంచుకోండి లేదా క్రొత్త రికార్డును సృష్టించండి" : isHi ? "किसी परिवार का चयन करें या नया घराना रिकॉर्ड बनाएं" : "Select any household to inspect members, assign family heads, or register new units"}
                  </p>
                </div>
                
                <button 
                  onClick={() => setIsCreateOpen(true)}
                  className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  {isTe ? "క్రొత్త కుటుంబ రికార్డు" : isHi ? "नया परिवार रिकॉर्ड" : "Setup Family Unit"}
                </button>
              </div>

              {/* Showcase Cards Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {families.map(fam => {
                  const head = getUserDetails(fam.headOfHouseholdId);
                  return (
                    <div 
                      key={fam.id}
                      onClick={() => setSelectedFamily(fam)}
                      className="p-5 bg-slate-50/50 hover:bg-white dark:bg-[#16172D]/30 dark:hover:bg-[#16172D]/60 border border-slate-200/60 dark:border-white/[0.04] hover:border-indigo-300 dark:hover:border-indigo-500/30 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          Household
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-500 dark:text-gray-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-indigo-500" />
                          {fam.members ? fam.members.length : 0} {isTe ? "సభ్యులు" : isHi ? "सदस्य" : "members"}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {getFamilyNameTranslation(fam.familyName)}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-semibold flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{t.headOfHousehold}: {head.name}</span>
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        <span>{isTe ? "వివరాలు చూడండి" : isHi ? "विवरण देखें" : "Inspect Household"}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>

      </div>

      {/* ─── MODAL: CREATE FAMILY UNIT ─── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {t.setupModalTitle}
              </h3>
              <button 
                onClick={() => setIsCreateOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateFamily} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">
                  {t.familyNameLabel} *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Valluri Household" 
                  value={newFamily.familyName}
                  onChange={(e) => setNewFamily({ ...newFamily, familyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">
                  {t.headOfHouseholdSelect}
                </label>
                <div className="relative flex items-center">
                  <select 
                    value={newFamily.headId}
                    onChange={(e) => setNewFamily({ ...newFamily, headId: e.target.value })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 appearance-none cursor-pointer"
                  >
                    <option value="">{t.selectHeadPlaceholder}</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">
                  {t.contactPhone}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 96409 43777" 
                  value={newFamily.contactPhone}
                  onChange={(e) => setNewFamily({ ...newFamily, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">
                  {t.sanctuaryAddress}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Jeedimetla, Hyderabad" 
                  value={newFamily.address}
                  onChange={(e) => setNewFamily({ ...newFamily, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)} 
                  className="flex-1 py-2.5 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-md shadow-indigo-500/10 active:scale-95"
                >
                  {t.setupFamilyBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ASSIGN FAMILY MEMBERS ─── */}
      {isAddMemberOpen && selectedFamily && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {t.assignMembersTitle}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-0.5">
                  {getFamilyNameTranslation(selectedFamily.familyName)}
                </p>
              </div>
              <button 
                onClick={() => setIsAddMemberOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={isTe ? "సభ్యుల శోధన..." : isHi ? "सदस्य खोजें..." : "Filter members directory..."}
                  value={memberSearchModal}
                  onChange={(e) => setMemberSearchModal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {users
                  .filter(u => 
                    (u.name || "").toLowerCase().includes(memberSearchModal.toLowerCase()) || 
                    (u.email || "").toLowerCase().includes(memberSearchModal.toLowerCase())
                  )
                  .map(member => {
                    const isAdded = selectedFamily.members ? selectedFamily.members.includes(member.id) : false;
                    const isHead = selectedFamily.headOfHouseholdId === member.id;

                    return (
                      <div 
                        key={member.id}
                        onClick={() => handleAddMemberToFamily(member.id)}
                        className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          isAdded 
                            ? "bg-indigo-50/40 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 shadow-sm" 
                            : "bg-white dark:bg-[#121324] hover:bg-slate-50 dark:hover:bg-white/[0.01] border-slate-200/60 dark:border-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 border transition-all ${
                            isAdded 
                              ? "bg-indigo-600 border-indigo-600 text-white" 
                              : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.04] text-slate-500 dark:text-gray-400"
                          }`}>
                            {(member.name || "M").substring(0, 2)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{member.name}</h4>
                              {isHead && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 truncate mt-0.5 font-medium">{member.email}</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isAdded ? "bg-indigo-600 text-white" : "border border-slate-300 dark:border-white/[0.1]"
                        }`}>
                          {isAdded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.04] flex justify-end">
                <button 
                  onClick={() => setIsAddMemberOpen(false)} 
                  className="py-2.5 px-6 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-indigo-500/10 active:scale-95"
                >
                  {isTe ? "పూర్తయింది" : isHi ? "सहेजें" : "Done"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
