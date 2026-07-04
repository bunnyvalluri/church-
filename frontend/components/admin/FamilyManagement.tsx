"use client";

import React, { useState, useEffect } from "react";
import { Home, Users, Plus, X, Search, Check, Shield, Phone, MapPin, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface FamilyManagementProps {
  users: any[];
}

interface Family {
  id: string;
  familyName: string;
  headOfHouseholdId: string;
  members: string[]; // User IDs
  contactPhone: string;
  address: string;
}

export default function FamilyManagement({ users }: FamilyManagementProps) {
  const { language } = useLanguage();
  const t = adminTranslations[language || "en"].families;

  const getFamilyNameTranslation = (name: string) => {
    switch (name) {
      case "Wilson Household": return language === "te" ? "విల్సన్ ఇల్లు" : language === "hi" ? "विल्सन घराना" : name;
      case "Martinez Family": return language === "te" ? "మార్టినెజ్ కుటుంబం" : language === "hi" ? "मार्टिनेज परिवार" : name;
      default: return name;
    }
  };

  const getFamilyAddressTranslation = (addr: string) => {
    if (addr.includes("Vivekananda Nagar")) {
      return language === "te" ? "15-201, వివేకానంద నగర్, జీడిమెట్ల, హైదరాబాద్" :
             language === "hi" ? "15-201, विवेकानंद नगर, जीडीमेटला, हैदराबाद" : addr;
    }
    if (addr.includes("Subhash Nagar")) {
      return language === "te" ? "సుభాష్ నగర్, హైదరాబాద్" :
             language === "hi" ? "सुभाष नगर, हैदराबाद" : addr;
    }
    return addr;
  };

  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/families');
      const data = await res.json();
      if (data.success) {
        setFamilies(data.families);
      }
    } catch (err) {
      console.error("Error fetching families:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [searchMember, setSearchMember] = useState("");
  
  const [newFamily, setNewFamily] = useState({ familyName: "", headId: "", contactPhone: "", address: "" });

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamily.familyName || !newFamily.headId) return;

    try {
      const res = await fetch('/api/admin/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyName: newFamily.familyName,
          headOfHouseholdId: newFamily.headId,
          contactPhone: newFamily.contactPhone || "+91 96409 43777",
          address: newFamily.address || "Hyderabad",
          members: [newFamily.headId]
        })
      });
      const data = await res.json();
      if (data.success) {
        setFamilies(prev => [data.family, ...prev]);
      }
    } catch (err) {
      console.error("Error creating family:", err);
    } finally {
      setNewFamily({ familyName: "", headId: "", contactPhone: "", address: "" });
      setIsCreateOpen(false);
    }
  };

  const handleAddMemberToFamily = async (userId: string) => {
    if (!selectedFamily) return;

    const alreadyExists = selectedFamily.members.includes(userId);
    const updatedMembers = alreadyExists 
      ? selectedFamily.members.filter(id => id !== userId) 
      : [...selectedFamily.members, userId];

    try {
      const res = await fetch('/api/admin/families', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFamily.id,
          members: updatedMembers
        })
      });
      const data = await res.json();
      if (data.success) {
        setFamilies(prev => prev.map(f => f.id === selectedFamily.id ? data.family : f));
        setSelectedFamily(data.family);
      }
    } catch (err) {
      console.error("Error toggling family member:", err);
    }
  };

  const handleSetHead = async (userId: string) => {
    if (!selectedFamily) return;

    try {
      const res = await fetch('/api/admin/families', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFamily.id,
          headOfHouseholdId: userId
        })
      });
      const data = await res.json();
      if (data.success) {
        setFamilies(prev => prev.map(f => f.id === selectedFamily.id ? data.family : f));
        setSelectedFamily(data.family);
      }
    } catch (err) {
      console.error("Error setting head of family:", err);
    }
  };

  const handleRemoveFamily = async (familyId: string) => {
    try {
      const res = await fetch(`/api/admin/families?id=${familyId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setFamilies(families.filter(f => f.id !== familyId));
        if (selectedFamily?.id === familyId) {
          setSelectedFamily(null);
        }
      }
    } catch (err) {
      console.error("Error removing family:", err);
    }
  };

  const getUserDetails = (userId: string) => {
    return users.find(u => u.id === userId || u.uid === userId) || { name: "Congregation Member", email: "believer@gmail.com", phone: "+91 96409 43777" };
  };

  const getAvatarGradient = (name: string) => {
    const code = name.charCodeAt(0) % 4;
    switch (code) {
      case 0: return "from-indigo-500 to-purple-600 shadow-indigo-500/15";
      case 1: return "from-emerald-400 to-teal-500 shadow-emerald-500/15";
      case 2: return "from-blue-500 to-sky-600 shadow-blue-500/15";
      default: return "from-pink-500 to-rose-600 shadow-pink-500/15";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
      
      {/* ─── Sidebar: Families List ─── */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white tracking-tight uppercase flex items-center gap-2">
              <Home className="w-5 h-5 text-[#6366F1]" /> {t.familyUnits}
            </h2>
            <button 
              onClick={() => setIsCreateOpen(true)} 
              className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-[#6366F1] dark:text-indigo-400 hover:bg-[#6366F1] dark:hover:bg-[#6366F1] hover:text-white dark:hover:text-white rounded-xl transition-all border border-indigo-100 dark:border-indigo-500/20 shadow-sm active:scale-95"
              title="Create new family"
            >
              <Plus className="w-4.5 h-4.5" />
            </button>
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1.5 custom-scrollbar">
            {families.map(fam => {
              const head = getUserDetails(fam.headOfHouseholdId);
              const isSelected = selectedFamily?.id === fam.id;
              return (
                <div 
                  key={fam.id}
                  onClick={() => setSelectedFamily(fam)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-0.5 ${
                    isSelected 
                      ? "bg-indigo-50/35 dark:bg-indigo-500/5 border-indigo-500/55 dark:border-indigo-500/40 shadow-[0_2px_8px_rgba(99,102,241,0.05)]" 
                      : "bg-slate-50/45 hover:bg-slate-50 dark:bg-[#16172D]/30 dark:hover:bg-[#16172D]/50 border-slate-150/60 dark:border-white/[0.04] hover:border-slate-250"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 overflow-hidden pr-3">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{getFamilyNameTranslation(fam.familyName)}</h4>
                      <p className="text-[10px] text-slate-450 dark:text-gray-400 font-semibold truncate">{t.headOfHousehold}: <span className="text-slate-700 dark:text-gray-300 font-bold">{head.name}</span></p>
                      <p className="text-[9px] text-slate-400 dark:text-gray-500 font-medium truncate mt-1">{getFamilyAddressTranslation(fam.address)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between h-full gap-4 shrink-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveFamily(fam.id); }}
                        className="text-slate-350 dark:text-gray-650 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1 rounded-lg transition-colors"
                        title="Delete Family"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#6366F1] bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20 px-2 py-0.5 rounded-full">
                        <Users className="w-3 h-3" /> {fam.members.length}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {families.length === 0 && (
              <p className="text-center text-xs text-slate-400 dark:text-gray-500 py-8 font-semibold">No families created yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Detail View ─── */}
      <div className="lg:col-span-2 space-y-6">
        {selectedFamily ? (
          <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-6">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white leading-none tracking-tight">{getFamilyNameTranslation(selectedFamily.familyName)}</h2>
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-400 dark:text-gray-500 border border-slate-150 dark:border-white/[0.04] shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.sanctuaryAddress}: <span className="font-bold">{getFamilyAddressTranslation(selectedFamily.address)}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-400 dark:text-gray-500 border border-slate-150 dark:border-white/[0.04] shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.contactPhone}: <span className="font-bold">{selectedFamily.contactPhone}</span></span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsAddMemberOpen(true)}
                className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all duration-200 active:scale-[0.98]"
              >
                <Users className="w-4 h-4" /> {t.manageHousehold}
              </button>
            </div>

            <hr className="border-t border-slate-100 dark:border-white/[0.03]" />

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-450 dark:text-gray-550 uppercase tracking-wider">{t.householdRoster} ({selectedFamily.members.length})</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {selectedFamily.members.map(memberId => {
                  const member = getUserDetails(memberId);
                  const isHead = selectedFamily.headOfHouseholdId === memberId;
                  return (
                    <div 
                      key={memberId} 
                      className={`p-4 border rounded-xl flex items-center justify-between gap-3 transition-all ${
                        isHead 
                          ? "bg-indigo-50/30 dark:bg-indigo-500/5 border-indigo-500/40 dark:border-indigo-500/30 shadow-sm" 
                          : "bg-slate-50/45 hover:bg-slate-50 dark:bg-[#16172D]/30 dark:hover:bg-[#16172D]/50 border-slate-150/60 dark:border-white/[0.04] hover:border-slate-250"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-9 h-9 bg-gradient-to-br ${getAvatarGradient(member.name || "")} text-white font-black rounded-xl flex items-center justify-center uppercase text-xs shadow-md shrink-0`}>
                          {(member.name || "M").substring(0, 2)}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                            {member.name} 
                            {isHead && (
                              <span className="px-1.5 py-0.5 bg-[#6366F1] text-white text-[8px] rounded uppercase font-black tracking-wide border border-indigo-400/20">
                                {t.headOfHousehold.toUpperCase()}
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold truncate">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isHead && (
                          <button 
                            onClick={() => handleSetHead(memberId)}
                            className="p-2 bg-white dark:bg-white/[0.02] text-slate-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-white/[0.08] rounded-xl hover:border-indigo-300 dark:hover:border-indigo-550/30 hover:bg-indigo-50/20 transition-all duration-200 active:scale-90"
                            title={t.nominateHead}
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleAddMemberToFamily(memberId)}
                          className="p-2 bg-white dark:bg-white/[0.02] text-slate-550 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-white/[0.08] rounded-xl hover:border-rose-300 dark:hover:border-rose-550/30 transition-all duration-200 active:scale-90"
                          title="Remove from Family"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-16 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl text-center flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-1.5 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
              <Home className="w-7 h-7 text-indigo-500 animate-pulse" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mt-1">{t.selectFamily}</h3>
            <p className="text-xs text-slate-400 dark:text-gray-500 max-w-xs leading-relaxed font-semibold">{t.selectFamilyDesc}</p>
          </div>
        )}
      </div>

      {/* ─── Modal: Create Family ─── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/40 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-tight">{t.setupModalTitle}</h3>
              <button 
                onClick={() => setIsCreateOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-xl transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateFamily} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">{t.familyNameLabel}</label>
                <input 
                  type="text" required placeholder="e.g. Wilson Household" value={newFamily.familyName}
                  onChange={(e) => setNewFamily({ ...newFamily, familyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">{t.headOfHouseholdSelect}</label>
                <div className="relative flex items-center">
                  <select 
                    value={newFamily.headId}
                    onChange={(e) => setNewFamily({ ...newFamily, headId: e.target.value })}
                    required
                    className="w-full pl-3.5 pr-8 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50 dark:bg-[#16172D]/60 text-slate-700 dark:text-gray-300 font-bold cursor-pointer appearance-none"
                  >
                    <option value="" className="dark:bg-[#121324]">{t.selectHeadPlaceholder}</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="dark:bg-[#121324]">{u.name} ({u.email})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">{t.contactPhone}</label>
                <input 
                  type="tel" placeholder="e.g. +91 96409 43777" value={newFamily.contactPhone}
                  onChange={(e) => setNewFamily({ ...newFamily, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">{t.sanctuaryAddress}</label>
                <textarea 
                  placeholder="Enter house address..." value={newFamily.address}
                  onChange={(e) => setNewFamily({ ...newFamily, address: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-semibold resize-none"
                />
              </div>
              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)} 
                  className="flex-1 py-3 border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-md shadow-indigo-500/10 active:scale-[0.98]"
                >
                  {t.setupFamilyBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Manage Household Members ─── */}
      {isAddMemberOpen && selectedFamily && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/40 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-tight">{t.assignMembersTitle}: {getFamilyNameTranslation(selectedFamily.familyName)}</h3>
              <button 
                onClick={() => setIsAddMemberOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-xl transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input 
                  type="text" 
                  placeholder={adminTranslations[language || "en"].groups.filterPlaceholder}
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar">
                {users
                  .filter(u => 
                    (u.name || "").toLowerCase().includes(searchMember.toLowerCase()) || 
                    (u.email || "").toLowerCase().includes(searchMember.toLowerCase())
                  )
                  .map(member => {
                    const isAdded = selectedFamily.members.includes(member.id);
                    return (
                      <div 
                        key={member.id}
                        onClick={() => handleAddMemberToFamily(member.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isAdded 
                            ? "bg-indigo-50/30 dark:bg-indigo-500/5 border-indigo-250 dark:border-indigo-500/40 shadow-sm" 
                            : "bg-white hover:bg-slate-50 dark:bg-[#121324] dark:hover:bg-[#16172D]/40 border-slate-150 dark:border-white/[0.04] hover:border-slate-250"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                            isAdded ? "bg-[#6366F1] text-white" : "bg-slate-100 dark:bg-white/[0.03] text-slate-650 dark:text-gray-400"
                          }`}>
                            {(member.name || "M").substring(0, 2)}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{member.name}</h4>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold truncate">{member.email}</p>
                          </div>
                        </div>
                        {isAdded && (
                          <div className="w-5 h-5 bg-[#6366F1] text-white rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.03] flex justify-end">
                <button 
                  onClick={() => setIsAddMemberOpen(false)} 
                  className="py-2.5 px-6 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-indigo-500/10 active:scale-[0.98]"
                >
                  {adminTranslations[language || "en"].groups.saveChanges}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
