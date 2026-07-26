"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
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
  Crown,
  ArrowLeft
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

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
  const detailPaneRef = useRef<HTMLDivElement>(null);

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

  // Category visual configurations with vibrant, ultra-high-contrast themes for light & dark mode
  const getCategoryTheme = (category: string) => {
    switch (category.toUpperCase()) {
      case "YOUTH":
        return {
          icon: Sparkles,
          badge: "bg-indigo-100 dark:bg-indigo-600 text-indigo-950 dark:text-white border border-indigo-300 dark:border-indigo-400 font-black shadow-sm",
          glow: "border-indigo-500 shadow-lg shadow-indigo-500/10",
          iconBg: "bg-indigo-600 text-white shadow-sm"
        };
      case "CHILDREN":
        return {
          icon: Smile,
          badge: "bg-sky-100 dark:bg-sky-600 text-sky-950 dark:text-white border border-sky-300 dark:border-sky-400 font-black shadow-sm",
          glow: "border-sky-500 shadow-lg shadow-sky-500/10",
          iconBg: "bg-sky-600 text-white shadow-sm"
        };
      case "WOMEN":
        return {
          icon: Heart,
          badge: "bg-rose-100 dark:bg-rose-600 text-rose-950 dark:text-white border border-rose-300 dark:border-rose-400 font-black shadow-sm",
          glow: "border-rose-500 shadow-lg shadow-rose-500/10",
          iconBg: "bg-rose-600 text-white shadow-sm"
        };
      case "MEN":
        return {
          icon: Users,
          badge: "bg-blue-100 dark:bg-blue-600 text-blue-950 dark:text-white border border-blue-300 dark:border-blue-400 font-black shadow-sm",
          glow: "border-blue-500 shadow-lg shadow-blue-500/10",
          iconBg: "bg-blue-600 text-white shadow-sm"
        };
      default:
        return {
          icon: Shield,
          badge: "bg-purple-100 dark:bg-purple-600 text-purple-950 dark:text-white border border-purple-300 dark:border-purple-400 font-black shadow-sm",
          glow: "border-purple-500 shadow-lg shadow-purple-500/10",
          iconBg: "bg-purple-600 text-white shadow-sm"
        };
    }
  };

  // Initial State
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

  // Handle group click with smooth scrolling on mobile
  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        detailPaneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      
      {/* ─── Top Overview Metric Bar ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1: Total Groups */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:-translate-y-0.5 transition-all flex items-center justify-between min-w-0">
          <div className="min-w-0 pr-1 sm:pr-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block leading-tight">
              {isTe ? "మొత్తం సమూహాలు" : isHi ? "कुल समूह" : "Total Groups"}
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight">{groups.length}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-xl sm:rounded-2xl shrink-0 shadow-sm">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Metric 2: Enrolled Believers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:-translate-y-0.5 transition-all flex items-center justify-between min-w-0">
          <div className="min-w-0 pr-1 sm:pr-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block leading-tight">
              {isTe ? "చేరిన విశ్వాసులు" : isHi ? "नामांकित विश्वासी" : "Enrolled Believers"}
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight">{totalEnrolledBelievers}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-xl sm:rounded-2xl shrink-0 shadow-sm">
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Metric 3: Fellowship Units */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:-translate-y-0.5 transition-all flex items-center justify-between min-w-0">
          <div className="min-w-0 pr-1 sm:pr-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block leading-tight">
              {isTe ? "విభాగాల సంఖ్య" : isHi ? "इकाइयाँ" : "Fellowship Units"}
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight">5</h3>
          </div>
          <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 rounded-xl sm:rounded-2xl shrink-0 shadow-sm">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Metric 4: Registered Members */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:-translate-y-0.5 transition-all flex items-center justify-between min-w-0">
          <div className="min-w-0 pr-1 sm:pr-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block leading-tight">
              {isTe ? "నమోదైన సభ్యులు" : isHi ? "कुल सदस्य" : "Registered Members"}
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight">{users.length}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-xl sm:rounded-2xl shrink-0 shadow-sm">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid: Sidebar List + Right Detail Pane ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ─── Left Column: Groups List ─── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
            
            {/* Header & Create Button */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {isTe ? "విశ్వాస సమూహాలు" : isHi ? "विश्वासी समूह" : "Believer Groups"}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {groups.length} {isTe ? "సమూహాలు అందుబాటులో ఉన్నాయి" : isHi ? "समूह उपलब्ध हैं" : "active fellowship units"}
                </p>
              </div>
              <button 
                onClick={() => setIsCreateOpen(true)} 
                className="py-2 px-3 sm:px-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" /> {isTe ? "కొత్తది" : isHi ? "नया" : "New Group"}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder={isTe ? "సమూహాల శోధన..." : isHi ? "समूह खोजें..." : "Search groups..."}
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 py-0.5">
              {["ALL", "YOUTH", "CHILDREN", "WOMEN", "SERVICE"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all shrink-0 ${
                    categoryFilter === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat === "ALL" ? (isTe ? "అన్నీ" : isHi ? "सभी" : "All") : cat}
                </button>
              ))}
            </div>

            {/* Group Cards List */}
            <div className="space-y-2.5 sm:space-y-3 max-h-[580px] overflow-y-auto pr-0.5 sm:pr-1 custom-scrollbar">
              {filteredGroups.map(group => {
                const isSelected = selectedGroup?.id === group.id;
                const theme = getCategoryTheme(group.category);
                const IconComponent = theme.icon;
                
                return (
                  <div 
                    key={group.id}
                    onClick={() => handleSelectGroup(group)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:-translate-y-0.5 ${
                      isSelected 
                        ? `bg-indigo-50/70 dark:bg-slate-800 border-2 border-indigo-500 shadow-md` 
                        : "bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/60"
                    }`}
                  >
                    {/* Selected Accent Bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600" />
                    )}

                    <div className="flex justify-between items-start gap-2.5">
                      <div className="flex items-start gap-2.5 sm:gap-3 overflow-hidden">
                        <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${theme.iconBg}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider mb-1 ${theme.badge}`}>
                            {getCategoryTranslation(group.category)}
                          </span>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {getGroupNameTranslation(group.name)}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5 font-medium">
                            {getGroupDescTranslation(group.description)}
                          </p>
                        </div>
                      </div>

                      {/* Quick Remove & Member Count */}
                      <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemoveGroup(group.id); }}
                          className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                          title="Delete Group"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                          <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>{group.members.length}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredGroups.length === 0 && (
                <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-4">
                  {isTe ? "సమూహాలు ఏవీ కనుగొనబడలేదు" : isHi ? "कोई समूह नहीं मिला" : "No matching groups found."}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ─── Right Column: Selected Group Roster or Mobile Detail Pane ─── */}
        <div ref={detailPaneRef} className="lg:col-span-2 space-y-6 scroll-mt-20">
          {selectedGroup ? (
            /* ACTIVE GROUP DETAIL VIEW */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm space-y-5 sm:space-y-6">
              
              {/* Mobile Back Button */}
              <div className="lg:hidden flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {isTe ? "సమూహాల జాబితాకు తిరిగి వెళ్లండి" : isHi ? "वापस समूह सूची पर जाएं" : "Back to All Groups"}
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isTe ? "ఎంచుకున్న వివరణ" : isHi ? "चयनित विवरण" : "Group View"}
                </span>
              </div>

              {/* Header Banner */}
              <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-white dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-slate-700 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 shadow-sm">
                <div className="space-y-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] tracking-wider uppercase ${getCategoryTheme(selectedGroup.category).badge}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    {getCategoryTranslation(selectedGroup.category)}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {getGroupNameTranslation(selectedGroup.name)}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed font-medium">
                    {getGroupDescTranslation(selectedGroup.description)}
                  </p>

                  {/* Schedule & Location details */}
                  <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1 sm:pt-2 text-xs text-slate-700 dark:text-slate-200 font-semibold">
                    <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      {selectedGroup.meetingTime || "Sundays 10:00 AM"}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      {selectedGroup.location || "Sanctuary Hall"}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsAddMemberOpen(true)}
                  className="py-2.5 sm:py-3 px-4 sm:px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 shrink-0 w-full md:w-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  {isTe ? "విశ్వాసులను చేర్చండి" : isHi ? "विश्वासियों को जोड़ें" : "+ Assign Believers"}
                </button>
              </div>

              {/* Roster Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-1 sm:pt-2">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isTe ? "సమూహ రికార్డు సభ్యులు" : isHi ? "समूह सदस्य नामावली" : "Group Roster"} ({selectedGroup.members.length})
                  </h3>
                </div>

                {selectedGroup.members.length > 0 && (
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder={isTe ? "సభ్యుల శోధన..." : isHi ? "सदस्य खोजें..." : "Filter roster..."}
                      value={rosterSearchQuery}
                      onChange={(e) => setRosterSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
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
                      className="p-3.5 sm:p-4 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex items-center justify-between gap-3 transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-black rounded-xl flex items-center justify-center uppercase text-xs shadow-md shadow-indigo-500/20 shrink-0">
                          {(member.name || "M").substring(0, 2)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {member.name}
                            </h4>
                            {idx === 0 && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 rounded-md">
                                <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                {isTe ? "నాయకుడు" : isHi ? "नेता" : "Leader"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5 font-medium">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleAddMemberToGroup(member.id)}
                        className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0"
                        title="Remove member"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                {selectedGroup.members.length === 0 && (
                  <div className="col-span-full py-12 sm:py-16 text-center bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-3 p-5 sm:p-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/60 shadow-sm">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {isTe ? "ఈ సమూహంలో ఇంకా సభ్యులు లేరు" : isHi ? "इस समूह में अभी कोई सदस्य नहीं है" : "No members assigned to this group yet"}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mt-1 font-medium">
                        {isTe ? "సమృద్ధిగా ఉన్న చర్చి విశ్వాసుల డైరెక్టరీ నుండి సభ్యులను సులభంగా అసైన్ చేయండి." : isHi ? "मंडली निर्देशिका से सदस्यों को आसानी से इस समूह में जोड़ें।" : "Assign congregation believers to this group to track attendance and fellowship growth."}
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsAddMemberOpen(true)}
                      className="mt-2 py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                    >
                      <UserPlus className="w-4 h-4" />
                      {isTe ? "సభ్యులను జతచేయండి" : isHi ? "सदस्य जोड़ें" : "Assign Members Now"}
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* DIRECTORY SHOWCASE GRID (Hidden on small mobile screens to prevent list duplication, visible on lg screens) */
            <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
              
              {/* Header Intro */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {isTe ? "విశ్వాసుల సహవాస కేంద్రం" : isHi ? "विश्वासी संगति केंद्र" : "Believer Fellowship Directory"}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                    {isTe ? "విభాగాన్ని ఎంచుకోండి లేదా క్రొత్త కూడికను సృష్టించండి" : isHi ? "किसी समूह का चयन करें या नया संगति समूह बनाएं" : "Select any fellowship group to inspect roster or build new ministry units"}
                  </p>
                </div>
                
                <button 
                  onClick={() => setIsCreateOpen(true)}
                  className="py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
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
                      onClick={() => handleSelectGroup(group)}
                      className="p-5 bg-slate-50 hover:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500/50 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] tracking-wider uppercase ${theme.badge}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                          {getCategoryTranslation(group.category)}
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          {group.members.length} {isTe ? "సభ్యులు" : isHi ? "सदस्य" : "members"}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {getGroupNameTranslation(group.name)}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 font-medium leading-relaxed">
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-md">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {isTe ? "క్రొత్త విశ్వాస సమూహాన్ని సృష్టించండి" : isHi ? "नया विश्वासी समूह बनाएं" : "Create Believer Group"}
              </h3>
              <button 
                onClick={() => setIsCreateOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isTe ? "సమూహం పేరు" : isHi ? "समूह का नाम" : "Group Name"} *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Young Couples Fellowship" 
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isTe ? "విభాగం" : isHi ? "श्रेणी" : "Category"}
                </label>
                <div className="relative flex items-center">
                  <select 
                    value={newGroup.category}
                    onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value as any })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
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
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isTe ? "వివరణ" : isHi ? "विवरण" : "Description"}
                </label>
                <textarea 
                  placeholder="Describe group goals and fellowship activities..." 
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isTe ? "సమయం" : isHi ? "समय" : "Meeting Time"}
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sundays 5 PM" 
                    value={newGroup.meetingTime}
                    onChange={(e) => setNewGroup({ ...newGroup, meetingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isTe ? "స్థలం" : isHi ? "स्थान" : "Location"}
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Room 102" 
                    value={newGroup.location}
                    onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)} 
                  className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  {isTe ? "రద్దు" : isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-md shadow-indigo-500/20 active:scale-95"
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-md">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {isTe ? "సభ్యుల కేటాయింపు" : isHi ? "सदस्य आवंटन" : "Assign Believers"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  {getGroupNameTranslation(selectedGroup.name)}
                </p>
              </div>
              <button 
                onClick={() => setIsAddMemberOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 sm:p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={isTe ? "పేరు లేదా ఈమెయిల్ శోధించండి..." : isHi ? "नाम या ईमेल खोजें..." : "Filter members directory..."}
                  value={searchMemberModal}
                  onChange={(e) => setSearchMemberModal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
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
                            ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700/60 shadow-sm" 
                            : "bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 border transition-all ${
                            isAdded 
                              ? "bg-indigo-600 border-indigo-600 text-white" 
                              : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                          }`}>
                            {(member.name || "M").substring(0, 2)}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{member.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">{member.email}</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isAdded ? "bg-indigo-600 text-white" : "border border-slate-300 dark:border-slate-600"
                        }`}>
                          {isAdded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button 
                  onClick={() => setIsAddMemberOpen(false)} 
                  className="py-2.5 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-indigo-500/20 active:scale-95"
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
