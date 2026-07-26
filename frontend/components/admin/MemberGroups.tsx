"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, 
  Plus, 
  X, 
  Search, 
  Check, 
  Layers, 
  UserPlus, 
  ChevronDown, 
  Sparkles, 
  Smile, 
  Heart, 
  Shield, 
  UserCheck, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Trash2,
  Filter,
  Award,
  Crown
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface MemberGroupsProps {
  users?: any[];
}

interface Group {
  id: string;
  name: string;
  description: string;
  category: "YOUTH" | "CHILDREN" | "WOMEN" | "MEN" | "SERVICE";
  members: string[]; // User IDs
  leaderId?: string;
  meetingTime?: string;
  location?: string;
}

export default function MemberGroups({ users = [] }: MemberGroupsProps) {
  const { language } = useLanguage();
  const isTe = language === "te";
  const isHi = language === "hi";

  // Category Translations
  const getCategoryTranslation = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "YOUTH": return isTe ? "యువజన కూడిక" : isHi ? "युवा संगति" : "Youth Fellowship";
      case "CHILDREN": return isTe ? "సండే స్కూల్" : isHi ? "रविवार स्कूल" : "Sunday School";
      case "WOMEN": return isTe ? "స్త్రీల పరిచర్య" : isHi ? "महिला मंत्रालय" : "Women Ministry";
      case "MEN": return isTe ? "పురుషుల పరిచర్య" : isHi ? "पुरुष मंत्रालय" : "Men Ministry";
      case "SERVICE": return isTe ? "సేవ & భద్రత" : isHi ? "सेवा और सुरक्षा" : "Service & Ushership";
      default: return cat;
    }
  };

  const getGroupNameTranslation = (name: string) => {
    switch (name) {
      case "Youth Fellowship": return isTe ? "యువజన సహవాసం" : isHi ? "युवा संगति" : "Youth Fellowship";
      case "Sunday School Choir": return isTe ? "సండే స్కూల్ కోయిర్" : isHi ? "रविवार स्कूल गायक दल" : "Sunday School Choir";
      case "Women's Prayer Guild": return isTe ? "స్త్రీల ప్రార్థన సంఘం" : isHi ? "महिला प्रार्थना संघ" : "Women's Prayer Guild";
      case "Church Ushers & Safety": return isTe ? "చర్చి ఉషర్స్ & భద్రత" : isHi ? "चर्च के द्वारपाल और सुरक्षा" : "Church Ushers & Safety";
      default: return name;
    }
  };

  const getGroupDescTranslation = (desc: string) => {
    if (desc.includes("Young adults fellowship")) {
      return isTe ? "యువతీ యువకుల సహవాసం, సంగీతం మరియు ఆత్మీయ కూడికలు." :
             isHi ? "युवा वयस्कों की संगति, संगीत और आध्यात्मिक सत्र।" : desc;
    }
    if (desc.includes("Children's choir team")) {
      return isTe ? "ఆదివారం ఆరాధన కూడికల్లో పాడే పిల్లల గాయక బృందం." :
             isHi ? "रविवार आराधना सेवा के दौरान गाने वाले बच्चों का गायक दल।" : desc;
    }
    if (desc.includes("Mothers and sisters")) {
      return isTe ? "తల్లులు మరియు సోదరీమణుల ప్రార్థన బృందం వారానికోసారి కూడుకుంటుంది." :
             isHi ? "माताओं और बहनों की मध्यस्थता प्रार्थना टीम साप्ताहिक बैठक करती है।" : desc;
    }
    if (desc.includes("Volunteers maintaining order")) {
      return isTe ? "చర్చిలో క్రమశిక్షణను కాపాడే మరియు విశ్వాసులను ఆహ్వానించే స్వచ్ఛంద సేవకులు." :
             isHi ? "व्यवस्था बनाए रखने और आगंतुकों का स्वागत करने वाले स्वयंसेवक।" : desc;
    }
    return desc;
  };

  // Category visual configurations
  const getCategoryTheme = (category: string) => {
    switch (category.toUpperCase()) {
      case "YOUTH":
        return {
          icon: Sparkles,
          badge: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40",
          cardBg: "from-indigo-500/10 via-purple-500/5 to-transparent",
          glow: "border-indigo-500/50 shadow-indigo-500/10",
          iconBg: "bg-indigo-600 text-white"
        };
      case "CHILDREN":
        return {
          icon: Smile,
          badge: "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/40",
          cardBg: "from-sky-500/10 via-blue-500/5 to-transparent",
          glow: "border-sky-500/50 shadow-sky-500/10",
          iconBg: "bg-sky-600 text-white"
        };
      case "WOMEN":
        return {
          icon: Heart,
          badge: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40",
          cardBg: "from-rose-500/10 via-pink-500/5 to-transparent",
          glow: "border-rose-500/50 shadow-rose-500/10",
          iconBg: "bg-rose-600 text-white"
        };
      case "MEN":
        return {
          icon: Users,
          badge: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40",
          cardBg: "from-blue-500/10 via-indigo-500/5 to-transparent",
          glow: "border-blue-500/50 shadow-blue-500/10",
          iconBg: "bg-blue-600 text-white"
        };
      default:
        return {
          icon: Shield,
          badge: "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200/60 dark:border-violet-800/40",
          cardBg: "from-violet-500/10 via-purple-500/5 to-transparent",
          glow: "border-violet-500/50 shadow-violet-500/10",
          iconBg: "bg-violet-600 text-white"
        };
    }
  };

  // State
  const [groups, setGroups] = useState<Group[]>([
    { 
      id: "grp_1", 
      name: "Youth Fellowship", 
      description: "Young adults fellowship, music jams, and spiritual sessions.", 
      category: "YOUTH", 
      members: users.length > 0 ? [users[0]?.id].filter(Boolean) : [],
      meetingTime: "Fridays 7:00 PM",
      location: "Main Fellowship Hall"
    },
    { 
      id: "grp_2", 
      name: "Sunday School Choir", 
      description: "Children's choir team singing during Sunday worship services.", 
      category: "CHILDREN", 
      members: users.length > 1 ? [users[1]?.id].filter(Boolean) : [],
      meetingTime: "Sundays 9:00 AM",
      location: "Children's Chapel"
    },
    { 
      id: "grp_3", 
      name: "Women's Prayer Guild", 
      description: "Mothers and sisters intercessory team meeting weekly.", 
      category: "WOMEN", 
      members: users.length > 2 ? [users[2]?.id].filter(Boolean) : [],
      meetingTime: "Wednesdays 6:00 PM",
      location: "Prayer Tower Room 2"
    },
    { 
      id: "grp_4", 
      name: "Church Ushers & Safety", 
      description: "Volunteers maintaining order and welcoming visitors.", 
      category: "SERVICE", 
      members: users.length > 3 ? [users[3]?.id].filter(Boolean) : [],
      meetingTime: "Sundays 8:30 AM",
      location: "Main Entrance Lobby"
    }
  ]);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [rosterSearchQuery, setRosterSearchQuery] = useState("");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: "YOUTH" as "YOUTH" | "CHILDREN" | "WOMEN" | "MEN" | "SERVICE",
    meetingTime: "",
    location: ""
  });
  const [searchMemberModal, setSearchMemberModal] = useState("");

  // Computed metrics
  const totalEnrolledBelievers = useMemo(() => {
    const allMemberIds = new Set<string>();
    groups.forEach(g => g.members.forEach(mId => allMemberIds.add(mId)));
    return allMemberIds.size;
  }, [groups]);

  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      const matchesCat = categoryFilter === "ALL" || g.category === categoryFilter;
      const matchesQuery = 
        g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(groupSearchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [groups, categoryFilter, groupSearchQuery]);

  // Handlers
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name) return;
    const created: Group = {
      id: `grp_${Date.now()}`,
      name: newGroup.name,
      description: newGroup.description || "Active church fellowship group.",
      category: newGroup.category,
      members: [],
      meetingTime: newGroup.meetingTime || "Weekly Service",
      location: newGroup.location || "Sanctuary"
    };
    setGroups(prev => [...prev, created]);
    setSelectedGroup(created);
    setNewGroup({ name: "", description: "", category: "YOUTH", meetingTime: "", location: "" });
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
    if (confirm(isTe ? "మీరు ఖచ్చితంగా ఈ సమూహాన్ని తొలగించాలనుకుంటున్నారా?" : isHi ? "क्या आप वाकई इस समूह को हटाना चाहते हैं?" : "Are you sure you want to delete this fellowship group?")) {
      setGroups(prev => prev.filter(g => g.id !== groupId));
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ─── Top Overview Metric Bar ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all min-w-0">
          <div className="min-w-0 pr-2">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 block truncate">
              {isTe ? "మొత్తం సమూహాలు" : isHi ? "कुल समूह" : "Total Groups"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 sm:mt-1 tracking-tight">{groups.length}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-xl sm:rounded-2xl shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all min-w-0">
          <div className="min-w-0 pr-2">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 block truncate">
              {isTe ? "చేరిన విశ్వాసులు" : isHi ? "नामांकित विश्वासी" : "Enrolled Believers"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 sm:mt-1 tracking-tight">{totalEnrolledBelievers}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-xl sm:rounded-2xl shrink-0">
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all min-w-0">
          <div className="min-w-0 pr-2">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 block truncate">
              {isTe ? "విభాగాల సంఖ్య" : isHi ? "इकाइयाँ" : "Fellowship Units"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 sm:mt-1 tracking-tight">5</h3>
          </div>
          <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-xl sm:rounded-2xl shrink-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all min-w-0">
          <div className="min-w-0 pr-2">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 block truncate">
              {isTe ? "నమోదైన సభ్యులు" : isHi ? "कुल सदस्य" : "Registered Members"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 sm:mt-1 tracking-tight">{users.length}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-xl sm:rounded-2xl shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid: Sidebar List + Right Detail/Dashboard Pane ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ─── Left Column: Groups List ─── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-4">
            
            {/* Header & Create Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {isTe ? "విశ్వాస సమూహాలు" : isHi ? "विश्वासी समूह" : "Believer Groups"}
                </h2>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-0.5">
                  {groups.length} {isTe ? "సమూహాలు అందుబాటులో ఉన్నాయి" : isHi ? "समूह उपलब्ध हैं" : "active fellowship units"}
                </p>
              </div>
              <button 
                onClick={() => setIsCreateOpen(true)} 
                className="py-2 px-3 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> {isTe ? "కొత్తది" : isHi ? "नया" : "New"}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder={isTe ? "సమూహాల శోధన..." : isHi ? "समूह खोजें..." : "Search groups..."}
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-semibold"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {["ALL", "YOUTH", "CHILDREN", "WOMEN", "SERVICE"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all shrink-0 ${
                    categoryFilter === cat
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-white/[0.02] text-slate-450 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {cat === "ALL" ? (isTe ? "అన్నీ" : isHi ? "सभी" : "All") : cat}
                </button>
              ))}
            </div>

            {/* Group Cards List */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredGroups.map(group => {
                const isSelected = selectedGroup?.id === group.id;
                const theme = getCategoryTheme(group.category);
                const IconComponent = theme.icon;
                
                return (
                  <div 
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:-translate-y-0.5 ${
                      isSelected 
                        ? `bg-white dark:bg-[#16172D] border-indigo-500/60 dark:border-indigo-500/50 shadow-md ${theme.glow}` 
                        : "bg-slate-50/50 hover:bg-white dark:bg-[#16172D]/30 dark:hover:bg-[#16172D]/60 border-slate-200/60 dark:border-white/[0.04]"
                    }`}
                  >
                    {/* Selected Left Accent Bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-violet-600" />
                    )}

                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className={`p-2.5 rounded-xl shrink-0 ${theme.badge}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${theme.badge}`}>
                            {getCategoryTranslation(group.category)}
                          </span>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate mt-1">
                            {getGroupNameTranslation(group.name)}
                          </h4>
                          <p className="text-[10px] text-slate-450 dark:text-gray-400 line-clamp-1 mt-0.5 font-medium">
                            {getGroupDescTranslation(group.description)}
                          </p>
                        </div>
                      </div>

                      {/* Quick Remove & Member Count */}
                      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemoveGroup(group.id); }}
                          className="text-slate-300 dark:text-gray-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                          title="Delete Group"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-extrabold text-slate-600 dark:text-gray-300 flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-white/[0.04]">
                          <Users className="w-3 h-3 text-indigo-500" />
                          <span>{group.members.length}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredGroups.length === 0 && (
                <div className="py-10 text-center text-xs text-slate-400 dark:text-gray-500 font-semibold bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.05] p-4">
                  {isTe ? "సమూహాలు ఏవీ కనుగొనబడలేదు" : isHi ? "कोई समूह नहीं मिला" : "No matching groups found."}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ─── Right Column: Selected Group Roster or Interactive Dashboard Showcase ─── */}
        <div className="lg:col-span-2 space-y-6">
          {selectedGroup ? (
            /* ACTIVE GROUP DETAIL VIEW */
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-6">
              
              {/* Header Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/10 via-purple-900/5 to-slate-900/5 dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-transparent border border-indigo-100 dark:border-white/[0.06] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getCategoryTheme(selectedGroup.category).badge}`}>
                    <Sparkles className="w-3 h-3" />
                    {getCategoryTranslation(selectedGroup.category)}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {getGroupNameTranslation(selectedGroup.name)}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-gray-400 max-w-lg leading-relaxed font-medium">
                    {getGroupDescTranslation(selectedGroup.description)}
                  </p>

                  {/* Schedule & Location details */}
                  <div className="flex flex-wrap gap-4 pt-2 text-[11px] text-slate-600 dark:text-gray-300 font-semibold">
                    <span className="flex items-center gap-1.5 bg-white/80 dark:bg-white/[0.04] px-3 py-1 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {selectedGroup.meetingTime || "Sundays 10:00 AM"}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/80 dark:bg-white/[0.04] px-3 py-1 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {selectedGroup.location || "Sanctuary Hall"}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsAddMemberOpen(true)}
                  className="py-3 px-5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-650 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  {isTe ? "విశ్వాసులను చేర్చండి" : isHi ? "विश्वासियों को जोड़ें" : "+ Assign Believers"}
                </button>
              </div>

              {/* Roster Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    {isTe ? "సమూహ రికార్డు సభ్యులు" : isHi ? "समूह सदस्य नामावली" : "Group Roster"} ({selectedGroup.members.length})
                  </h3>
                </div>

                {selectedGroup.members.length > 0 && (
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder={isTe ? "సభ్యుల శోధన..." : isHi ? "सदस्य खोजें..." : "Filter roster..."}
                      value={rosterSearchQuery}
                      onChange={(e) => setRosterSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Roster Member Grid */}
              <div className="grid md:grid-cols-2 gap-3">
                {users
                  .filter(u => selectedGroup.members.includes(u.id))
                  .filter(u => 
                    (u.name || "").toLowerCase().includes(rosterSearchQuery.toLowerCase()) ||
                    (u.email || "").toLowerCase().includes(rosterSearchQuery.toLowerCase())
                  )
                  .map((member, idx) => (
                    <div 
                      key={member.id} 
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
                            {idx === 0 && (
                              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-200/60 dark:border-amber-500/20 rounded-md">
                                <Crown className="w-2.5 h-2.5" />
                                {isTe ? "నాయకుడు" : isHi ? "नेता" : "Leader"}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-450 dark:text-gray-400 truncate mt-0.5 font-medium">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleAddMemberToGroup(member.id)}
                        className="text-slate-300 dark:text-gray-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0"
                        title="Remove member"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                {selectedGroup.members.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-slate-50/40 dark:bg-[#16172D]/20 border border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl flex flex-col items-center justify-center gap-3 p-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {isTe ? "ఈ సమూహంలో ఇంకా సభ్యులు లేరు" : isHi ? "इस समूह में अभी कोई सदस्य नहीं है" : "No members assigned to this group yet"}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-gray-500 max-w-sm mt-1 font-medium">
                        {isTe ? "సమృద్ధిగా ఉన్న చర్చి విశ్వాసుల డైరెక్టరీ నుండి సభ్యులను సులభంగా అసైన్ చేయండి." : isHi ? "मंडली निर्देशिका से सदस्यों को आसानी से इस समूह में जोड़ें।" : "Assign congregation believers to this group to track attendance and fellowship growth."}
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsAddMemberOpen(true)}
                      className="mt-2 py-2.5 px-5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/15 transition-all active:scale-95"
                    >
                      <UserPlus className="w-4 h-4" />
                      {isTe ? "సభ్యులను జతచేయండి" : isHi ? "सदस्य जोड़ें" : "Assign Members Now"}
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* INTERACTIVE DASHBOARD SHOWCASE (When no group is explicitly selected) */
            <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-6">
              
              {/* Header Intro */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-150/60 dark:border-white/[0.04]">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {isTe ? "విశ్వాసుల సహవాస కేంద్రం" : isHi ? "विश्वासी संगति केंद्र" : "Believer Fellowship Directory"}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-gray-400 font-semibold mt-1">
                    {isTe ? "విభాగాన్ని ఎంచుకోండి లేదా క్రొత్త కూడికను సృష్టించండి" : isHi ? "किसी समूह का चयन करें या नया संगति समूह बनाएं" : "Select any fellowship group to inspect roster or build new ministry units"}
                  </p>
                </div>
                
                <button 
                  onClick={() => setIsCreateOpen(true)}
                  className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  {isTe ? "క్రొత్త సమూహాన్ని సృష్టించండి" : isHi ? "नया समूह बनाएं" : "Create New Group"}
                </button>
              </div>

              {/* Group Showcase Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {groups.map(group => {
                  const theme = getCategoryTheme(group.category);
                  const IconComponent = theme.icon;
                  return (
                    <div 
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className="p-5 bg-slate-50/50 hover:bg-white dark:bg-[#16172D]/30 dark:hover:bg-[#16172D]/60 border border-slate-200/60 dark:border-white/[0.04] hover:border-indigo-300 dark:hover:border-indigo-500/30 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${theme.badge}`}>
                          <IconComponent className="w-3 h-3" />
                          {getCategoryTranslation(group.category)}
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-500 dark:text-gray-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-indigo-500" />
                          {group.members.length} {isTe ? "సభ్యులు" : isHi ? "सदस्य" : "members"}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {getGroupNameTranslation(group.name)}
                        </h4>
                        <p className="text-xs text-slate-450 dark:text-gray-400 line-clamp-2 mt-1 font-medium leading-relaxed">
                          {getGroupDescTranslation(group.description)}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        <span>{isTe ? "రోస్టర్ చూడండి" : isHi ? "सूची देखें" : "Inspect Roster"}</span>
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

      {/* ─── MODAL: CREATE GROUP ─── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {isTe ? "క్రొత్త విశ్వాస సమూహాన్ని సృష్టించండి" : isHi ? "नया विश्वासी समूह बनाएं" : "Create Believer Group"}
              </h3>
              <button 
                onClick={() => setIsCreateOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">
                  {isTe ? "సమూహం పేరు" : isHi ? "समूह का नाम" : "Group Name"} *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Young Couples Fellowship" 
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">
                  {isTe ? "విభాగం" : isHi ? "श्रेणी" : "Category"}
                </label>
                <div className="relative flex items-center">
                  <select 
                    value={newGroup.category}
                    onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value as any })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="YOUTH">{getCategoryTranslation("YOUTH")}</option>
                    <option value="CHILDREN">{getCategoryTranslation("CHILDREN")}</option>
                    <option value="WOMEN">{getCategoryTranslation("WOMEN")}</option>
                    <option value="MEN">{getCategoryTranslation("MEN")}</option>
                    <option value="SERVICE">{getCategoryTranslation("SERVICE")}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">
                  {isTe ? "వివరణ" : isHi ? "विवरण" : "Description"}
                </label>
                <textarea 
                  placeholder="Describe group goals and fellowship activities..." 
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 resize-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">
                    {isTe ? "సమయం" : isHi ? "समय" : "Meeting Time"}
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sundays 5 PM" 
                    value={newGroup.meetingTime}
                    onChange={(e) => setNewGroup({ ...newGroup, meetingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">
                    {isTe ? "స్థలం" : isHi ? "स्थान" : "Location"}
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Room 102" 
                    value={newGroup.location}
                    onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)} 
                  className="flex-1 py-2.5 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  {isTe ? "రద్దు" : isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-md shadow-indigo-500/10 active:scale-95"
                >
                  {isTe ? "సృష్టించండి" : isHi ? "बनाएं" : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: MANAGE GROUP MEMBERS ─── */}
      {isAddMemberOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {isTe ? "సభ్యుల కేటాయింపు" : isHi ? "सदस्य आवंटन" : "Assign Believers"}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-0.5">
                  {getGroupNameTranslation(selectedGroup.name)}
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
                  placeholder={isTe ? "పేరు లేదా ఈమెయిల్ శోధించండి..." : isHi ? "नाम या ईमेल खोजें..." : "Filter members directory..."}
                  value={searchMemberModal}
                  onChange={(e) => setSearchMemberModal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {users
                  .filter(u => 
                    (u.name || "").toLowerCase().includes(searchMemberModal.toLowerCase()) || 
                    (u.email || "").toLowerCase().includes(searchMemberModal.toLowerCase())
                  )
                  .map(member => {
                    const isAdded = selectedGroup.members.includes(member.id);
                    return (
                      <div 
                        key={member.id}
                        onClick={() => handleAddMemberToGroup(member.id)}
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
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{member.name}</h4>
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
