"use client";

import React, { useState } from "react";
import { Users, Plus, X, Search, Check, Tag, Info, Layers, UserPlus, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface MemberGroupsProps {
  users: any[];
}

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  members: string[]; // User IDs
}

export default function MemberGroups({ users }: MemberGroupsProps) {
  const { language } = useLanguage();
  const t = adminTranslations[language || "en"].groups;

  const getCategoryTranslation = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "YOUTH": return language === "te" ? "యువజన కూడిక" : language === "hi" ? "युवा संगति" : "Youth Fellowship";
      case "CHILDREN": return language === "te" ? "సండే స్కూల్" : language === "hi" ? "रविवार स्कूल" : "Sunday School";
      case "WOMEN": return language === "te" ? "స్త్రీల పరిచర్య" : language === "hi" ? "महिला मंत्रालय" : "Women Ministry";
      case "MEN": return language === "te" ? "పురుషుల పరిచర్య" : language === "hi" ? "पुरुष मंत्रालय" : "Men Ministry";
      case "SERVICE": return language === "te" ? "సేవ మరియు క్రమశిక్షణ" : language === "hi" ? "सेवा और सुरक्षा" : "Service & Ushership";
      default: return cat;
    }
  };

  const getGroupNameTranslation = (name: string) => {
    switch (name) {
      case "Youth Fellowship": return language === "te" ? "యువజన సహవాసం" : language === "hi" ? "युवा संगति" : "Youth Fellowship";
      case "Sunday School Choir": return language === "te" ? "సండే స్కూల్ కోయిర్" : language === "hi" ? "रविवार स्कूल गायक दल" : "Sunday School Choir";
      case "Women's Prayer Guild": return language === "te" ? "స్త్రీల ప్రార్థన సంఘం" : language === "hi" ? "महिला प्रार्थना संघ" : "Women's Prayer Guild";
      case "Church Ushers & Safety": return language === "te" ? "చర్చి ఉషర్స్ & భద్రత" : language === "hi" ? "चर्च के द्वारपाल और सुरक्षा" : "Church Ushers & Safety";
      default: return name;
    }
  };

  const getGroupDescTranslation = (desc: string) => {
    if (desc.includes("Young adults fellowship")) {
      return language === "te" ? "యువతీ యువకుల సహవాసం, సంగీతం మరియు ఆత్మీయ కూడికలు." :
             language === "hi" ? "युवा वयस्कों की संगति, संगीत और आध्यात्मिक सत्र।" : desc;
    }
    if (desc.includes("Children's choir team")) {
      return language === "te" ? "ఆదివారం ఆరాధన కూడికల్లో పాడే పిల్లల గాయక బృందం." :
             language === "hi" ? "रविवार आराधना सेवा के दौरान गाने वाले बच्चों का गायक दल।" : desc;
    }
    if (desc.includes("Mothers and sisters")) {
      return language === "te" ? "తల్లులు మరియు సోదరీమణుల ప్రార్థన బృందం వారానికోసారి కూడుకుంటుంది." :
             language === "hi" ? "माताओं और बहनों की मध्यस्थता प्रार्थना टीम साप्ताहिक बैठक करती है।" : desc;
    }
    if (desc.includes("Volunteers maintaining order")) {
      return language === "te" ? "చర్చిలో క్రమశిక్షణను కాపాడే మరియు విశ్వాసులను ఆహ్వానించే స్వచ్ఛంద సేవకులు." :
             language === "hi" ? "व्यवस्था बनाए रखने और आगंतुकों का स्वागत करने वाले स्वयंसेवक।" : desc;
    }
    return desc;
  };

  // Helper color map based on category
  const getCategoryStyles = (category: string) => {
    switch (category.toUpperCase()) {
      case "YOUTH":
        return "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20";
      case "CHILDREN":
        return "bg-amber-50 dark:bg-amber-500/10 text-amber-650 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20";
      case "WOMEN":
        return "bg-pink-50 dark:bg-pink-500/10 text-pink-650 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20";
      case "MEN":
        return "bg-sky-50 dark:bg-sky-500/10 text-sky-650 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20";
      default:
        return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20";
    }
  };

  const [groups, setGroups] = useState<Group[]>([
    { id: "grp_1", name: "Youth Fellowship", description: "Young adults fellowship, music jams, and spiritual sessions.", category: "YOUTH", members: [] },
    { id: "grp_2", name: "Sunday School Choir", description: "Children's choir team singing during Sunday worship services.", category: "CHILDREN", members: [] },
    { id: "grp_3", name: "Women's Prayer Guild", description: "Mothers and sisters intercessory team meeting weekly.", category: "WOMEN", members: [] },
    { id: "grp_4", name: "Church Ushers & Safety", description: "Volunteers maintaining order and welcoming visitors.", category: "SERVICE", members: [] }
  ]);
  
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  
  const [newGroup, setNewGroup] = useState({ name: "", description: "", category: "YOUTH" });
  const [searchMember, setSearchMember] = useState("");

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name) return;
    const created: Group = {
      id: `grp_${Date.now()}`,
      name: newGroup.name,
      description: newGroup.description,
      category: newGroup.category,
      members: []
    };
    setGroups([...groups, created]);
    setNewGroup({ name: "", description: "", category: "YOUTH" });
    setIsCreateOpen(false);
  };

  const handleAddMemberToGroup = (userId: string) => {
    if (!selectedGroup) return;
    
    setGroups(prev => prev.map(g => {
      if (g.id === selectedGroup.id) {
        const alreadyExists = g.members.includes(userId);
        const updatedMembers = alreadyExists 
          ? g.members.filter(id => id !== userId) 
          : [...g.members, userId];
        
        const updatedGroup = { ...g, members: updatedMembers };
        setSelectedGroup(updatedGroup);
        return updatedGroup;
      }
      return g;
    }));
  };

  const handleRemoveGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
      
      {/* ─── Sidebar / Groups List ─── */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white tracking-tight uppercase leading-none">{t.believerGroups}</h2>
            <button onClick={() => setIsCreateOpen(true)} className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-550 dark:text-indigo-400 hover:bg-indigo-650 dark:hover:bg-indigo-500/20 hover:text-white dark:hover:text-white flex items-center justify-center transition-all">
              <Plus className="w-4.5 h-4.5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {groups.map(group => {
              const isSelected = selectedGroup?.id === group.id;
              return (
                <div 
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-start group hover:-translate-y-0.5 ${
                    isSelected 
                      ? "bg-indigo-50/35 dark:bg-indigo-500/5 border-indigo-500/50 dark:border-indigo-500/40 shadow-[0_2px_8px_rgba(99,102,241,0.05)]" 
                      : "bg-slate-50/45 hover:bg-slate-50 dark:bg-[#16172D]/30 dark:hover:bg-[#16172D]/50 border-slate-150/60 dark:border-white/[0.04] hover:border-slate-250"
                  }`}
                >
                  <div className="space-y-1.5 overflow-hidden pr-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getCategoryStyles(group.category)}`}>
                      {getCategoryTranslation(group.category)}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">{getGroupNameTranslation(group.name)}</h4>
                    <p className="text-[10px] text-slate-450 dark:text-gray-400 line-clamp-1 leading-normal font-medium">{getGroupDescTranslation(group.description)}</p>
                  </div>
                  
                  <div className="flex flex-col items-end justify-between h-full gap-4 shrink-0 self-stretch">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveGroup(group.id); }}
                      className="text-slate-300 dark:text-gray-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-0.5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-550 dark:text-gray-450 flex items-center gap-1.5 bg-white dark:bg-[#121324] border border-slate-100 dark:border-white/[0.04] rounded-lg px-2 py-0.5">
                      <Users className="w-3 h-3 text-indigo-550" />
                      <span>{group.members.length}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Group Members Detail View ─── */}
      <div className="lg:col-span-2 space-y-6">
        {selectedGroup ? (
          <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${getCategoryStyles(selectedGroup.category)}`}>
                  {getCategoryTranslation(selectedGroup.category)}
                </span>
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white mt-3.5 leading-none tracking-tight">{getGroupNameTranslation(selectedGroup.name)}</h2>
                <p className="text-xs text-slate-450 mt-2 leading-relaxed max-w-xl font-medium">{getGroupDescTranslation(selectedGroup.description)}</p>
              </div>
              <button 
                onClick={() => setIsAddMemberOpen(true)}
                className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] shrink-0"
              >
                <UserPlus className="w-4 h-4" /> {t.manageMembers}
              </button>
            </div>

            <hr className="border-t border-slate-100 dark:border-white/[0.03]" />

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.groupRoster} ({selectedGroup.members.length})</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {users.filter(u => selectedGroup.members.includes(u.id)).map(member => (
                  <div key={member.id} className="p-3.5 bg-slate-50/40 dark:bg-white/[0.01] border border-slate-150/70 dark:border-white/[0.04] rounded-2xl flex items-center justify-between gap-3 hover:-translate-y-0.5 hover:border-indigo-200 dark:hover:border-indigo-500/10 transition-all group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-550 dark:text-indigo-400 font-bold rounded-xl flex items-center justify-center uppercase text-xs border border-indigo-100/50 dark:border-indigo-500/15">
                        {(member.name || "M").substring(0, 2)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{member.name}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 truncate mt-0.5">{member.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddMemberToGroup(member.id)}
                      className="text-slate-300 dark:text-gray-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {selectedGroup.members.length === 0 && (
                  <div className="col-span-full py-10 text-center bg-slate-50/30 dark:bg-[#16172D]/20 border border-slate-100 dark:border-white/[0.03] rounded-2xl flex flex-col items-center justify-center gap-2 p-6">
                    <Users className="w-6 h-6 text-slate-350 dark:text-gray-600" />
                    <p className="text-xs text-slate-450 dark:text-gray-500 font-bold">{t.noMembers}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-16 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl text-center flex flex-col items-center justify-center gap-2.5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-1.5 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
              <Layers className="w-7 h-7 text-indigo-500" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mt-1">{t.selectGroup}</h3>
            <p className="text-xs text-slate-400 dark:text-gray-500 max-w-xs leading-relaxed font-semibold">{t.selectGroupDesc}</p>
          </div>
        )}
      </div>

      {/* ─── Modal: Create Group ─── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.createModalTitle}</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-lg">✕</button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">{t.groupName}</label>
                <input 
                  type="text" required placeholder="e.g. Worship Band" value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">{t.description}</label>
                <textarea 
                  placeholder="Describe group goals..." value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 resize-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">{t.category}</label>
                <div className="relative flex items-center">
                  <select 
                    value={newGroup.category}
                    onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="YOUTH">{getCategoryTranslation("YOUTH")}</option>
                    <option value="CHILDREN">{getCategoryTranslation("CHILDREN")}</option>
                    <option value="WOMEN">{getCategoryTranslation("WOMEN")}</option>
                    <option value="MEN">{getCategoryTranslation("MEN")}</option>
                    <option value="SERVICE">{getCategoryTranslation("SERVICE")}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase transition-colors">{t.cancel}</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-md shadow-indigo-500/10">{t.createBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Manage Group Members ─── */}
      {isAddMemberOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate pr-6">{t.assignMembersTitle}: {getGroupNameTranslation(selectedGroup.name)}</h3>
              <button onClick={() => setIsAddMemberOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-lg shrink-0">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t.filterPlaceholder}
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>
 
              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar">
                {users
                  .filter(u => 
                    (u.name || "").toLowerCase().includes(searchMember.toLowerCase()) || 
                    (u.email || "").toLowerCase().includes(searchMember.toLowerCase())
                  )
                  .map(member => {
                    const isAdded = selectedGroup.members.includes(member.id);
                    return (
                      <div 
                        key={member.id}
                        onClick={() => handleAddMemberToGroup(member.id)}
                        className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all group ${
                          isAdded 
                            ? "bg-indigo-50/20 dark:bg-indigo-500/5 border-indigo-250 dark:border-indigo-500/30 shadow-sm" 
                            : "bg-white dark:bg-[#121324] hover:bg-slate-50 dark:hover:bg-white/[0.01] border-slate-150/70 dark:border-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 border transition-all ${
                            isAdded 
                              ? "bg-indigo-600 border-indigo-650 text-white" 
                              : "bg-slate-50 dark:bg-white/[0.02] border-slate-150 dark:border-white/[0.04] text-slate-500 dark:text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600"
                          }`}>
                            {(member.name || "M").substring(0, 2)}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{member.name}</h4>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 truncate mt-0.5">{member.email}</p>
                          </div>
                        </div>
                        {isAdded && (
                          <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
 
              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.03] flex justify-end">
                <button onClick={() => setIsAddMemberOpen(false)} className="py-2.5 px-6 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-indigo-500/10 active:scale-[0.98]">
                  {t.saveChanges}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
