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
  UserPlus,
  Edit3,
  Heart,
  Building2,
  Printer,
  ArrowLeft,
  Filter,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface FamilyManagementProps {
  users?: any[];
}

export interface Family {
  id: string;
  familyName: string;
  headOfHouseholdId: string;
  members: string[]; // User IDs
  contactPhone: string;
  address: string;
  anniversaryDate?: string;
  branchName?: string;
  notes?: string;
}

const DEFAULT_FAMILIES: Family[] = [
  {
    id: "fam_001",
    familyName: "Valluri Household",
    headOfHouseholdId: "user_super_admin_001",
    members: ["user_super_admin_001", "user_admin_002", "user_member_004"],
    contactPhone: "+91 96409 43777",
    address: "15-201, Vivekananda Nagar, Jeedimetla, Hyderabad",
    anniversaryDate: "2015-11-26",
    branchName: "Shapur Nagar Sanctuary",
    notes: "Active ministry supporters & prayer hosts"
  },
  {
    id: "fam_002",
    familyName: "Raju Family",
    headOfHouseholdId: "user_pastor_003",
    members: ["user_pastor_003", "user_member_005"],
    contactPhone: "+91 87654 32109",
    address: "Subhash Nagar Sanctuary Road, Hyderabad",
    anniversaryDate: "2012-04-18",
    branchName: "Subhash Nagar",
    notes: "Worship team & choir leaders"
  },
  {
    id: "fam_003",
    familyName: "Reddy Household",
    headOfHouseholdId: "user_member_006",
    members: ["user_member_006", "user_member_007", "user_member_008"],
    contactPhone: "+91 65432 10987",
    address: "Kompally Family Quarters, Hyderabad",
    anniversaryDate: "2019-08-09",
    branchName: "Bahadurpally",
    notes: "Sunday School teachers"
  },
  {
    id: "fam_004",
    familyName: "Sharma Family",
    headOfHouseholdId: "user_member_009",
    members: ["user_member_009", "user_member_010"],
    contactPhone: "+91 98765 12345",
    address: "Suchitra Circle, Quthbullapur, Hyderabad",
    anniversaryDate: "2021-02-14",
    branchName: "Shapur Nagar Sanctuary",
    notes: "New believers family"
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
      case "Sharma Family": return isTe ? "శర్మ కుటుంబం" : isHi ? "शर्मा परिवार" : name;
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
    if (addr.includes("Kompally")) {
      return isTe ? "కొంపల్లి ఫ్యామిలీ క్వార్టర్స్, హైదరాబాద్" :
             isHi ? "कंपल्ली फैमिली क्वार्टर, हैदराबाद" : addr;
    }
    return addr;
  };

  const [families, setFamilies] = useState<Family[]>(DEFAULT_FAMILIES);
  const [loading, setLoading] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(DEFAULT_FAMILIES[0]);
  const [familySearchQuery, setFamilySearchQuery] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState<"ALL" | "LARGE" | "SMALL" | "UNASSIGNED">("ALL");
  const [memberSearchModal, setMemberSearchModal] = useState("");
  
  // Mobile responsive view toggle
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [newFamily, setNewFamily] = useState({ 
    familyName: "", 
    headId: "", 
    contactPhone: "", 
    address: "",
    branchName: "Shapur Nagar Sanctuary",
    anniversaryDate: "",
    notes: ""
  });

  const [editFamily, setEditFamily] = useState<Family | null>(null);

  // Fetch families from API with default fallback
  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/families');
      const data = await res.json();
      if (data.success && Array.isArray(data.families) && data.families.length > 0) {
        setFamilies(data.families);
        if (!selectedFamily) {
          setSelectedFamily(data.families[0]);
        }
      } else {
        setFamilies(DEFAULT_FAMILIES);
        if (!selectedFamily) {
          setSelectedFamily(DEFAULT_FAMILIES[0]);
        }
      }
    } catch (err) {
      console.warn("Backend API unavailable, using seed families", err);
      setFamilies(DEFAULT_FAMILIES);
      if (!selectedFamily) {
        setSelectedFamily(DEFAULT_FAMILIES[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  // Compute unassigned believers (users not in any family members list)
  const assignedUserIds = useMemo(() => {
    const set = new Set<string>();
    families.forEach(f => {
      if (f.members) f.members.forEach(mId => set.add(mId));
    });
    return set;
  }, [families]);

  const unassignedUsers = useMemo(() => {
    return users.filter(u => u.id && !assignedUserIds.has(u.id));
  }, [users, assignedUserIds]);

  // Computed Stats
  const stats = useMemo(() => {
    const totalFamilies = families.length;
    const totalEnrolled = families.reduce((acc, f) => acc + (f.members ? f.members.length : 0), 0);
    const avgSize = totalFamilies > 0 ? (totalEnrolled / totalFamilies).toFixed(1) : "0";
    const unassignedCount = unassignedUsers.length;
    return { totalFamilies, totalEnrolled, avgSize, unassignedCount };
  }, [families, unassignedUsers]);

  // Filtered Families List
  const filteredFamilies = useMemo(() => {
    return families.filter(f => {
      const head = getUserDetails(f.headOfHouseholdId);
      const matchesQuery = 
        f.familyName.toLowerCase().includes(familySearchQuery.toLowerCase()) ||
        f.address.toLowerCase().includes(familySearchQuery.toLowerCase()) ||
        f.contactPhone.toLowerCase().includes(familySearchQuery.toLowerCase()) ||
        (head.name || "").toLowerCase().includes(familySearchQuery.toLowerCase());
      
      if (!matchesQuery) return false;

      const size = f.members ? f.members.length : 0;
      if (activeTabFilter === "LARGE") return size >= 3;
      if (activeTabFilter === "SMALL") return size <= 2;

      return true;
    });
  }, [families, familySearchQuery, activeTabFilter, users]);

  // Lookup helper for user details
  function getUserDetails(userId: string) {
    const found = users.find(u => u.id === userId || u.uid === userId);
    if (found) return found;
    
    // Generative fallback based on sample IDs
    if (userId === "user_super_admin_001") return { name: "Pastor Paul K. C.", email: "paul@church.org", phone: "+91 96409 43777" };
    if (userId === "user_admin_002") return { name: "Mary Valluri", email: "mary.v@church.org", phone: "+91 96409 43778" };
    if (userId === "user_pastor_003") return { name: "Elder David Raju", email: "david.raju@gmail.com", phone: "+91 87654 32109" };
    if (userId === "user_member_004") return { name: "Samuel Valluri", email: "samuel.v@gmail.com", phone: "+91 96409 43779" };
    if (userId === "user_member_005") return { name: "Esther Raju", email: "esther.r@gmail.com", phone: "+91 87654 32110" };
    if (userId === "user_member_006") return { name: "Joseph Reddy", email: "joseph.reddy@gmail.com", phone: "+91 65432 10987" };
    if (userId === "user_member_007") return { name: "Ruth Reddy", email: "ruth.reddy@gmail.com", phone: "+91 65432 10988" };
    if (userId === "user_member_008") return { name: "Grace Reddy", email: "grace.reddy@gmail.com", phone: "+91 65432 10989" };
    if (userId === "user_member_009") return { name: "Anand Sharma", email: "anand.s@gmail.com", phone: "+91 98765 12345" };
    if (userId === "user_member_010") return { name: "Priya Sharma", email: "priya.s@gmail.com", phone: "+91 98765 12346" };

    return { 
      name: "Church Believer", 
      email: "believer@church.org", 
      phone: "+91 98765 43210" 
    };
  }

  // Handlers
  const handleSelectFamily = (fam: Family) => {
    setSelectedFamily(fam);
    setMobileShowDetail(true);
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamily.familyName) return;

    const headId = newFamily.headId || (users.length > 0 ? users[0].id : "user_super_admin_001");
    const created: Family = {
      id: `fam_${Date.now()}`,
      familyName: newFamily.familyName,
      headOfHouseholdId: headId,
      members: [headId],
      contactPhone: newFamily.contactPhone || "+91 96409 43777",
      address: newFamily.address || "Jeedimetla, Hyderabad",
      branchName: newFamily.branchName || "Shapur Nagar Sanctuary",
      anniversaryDate: newFamily.anniversaryDate || "",
      notes: newFamily.notes || ""
    };

    try {
      const res = await fetch('/api/admin/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
      const data = await res.json();
      if (data.success && data.family) {
        setFamilies(prev => [data.family, ...prev]);
        setSelectedFamily(data.family);
      } else {
        setFamilies(prev => [created, ...prev]);
        setSelectedFamily(created);
      }
    } catch (err) {
      setFamilies(prev => [created, ...prev]);
      setSelectedFamily(created);
    }

    setNewFamily({ familyName: "", headId: "", contactPhone: "", address: "", branchName: "Shapur Nagar Sanctuary", anniversaryDate: "", notes: "" });
    setIsCreateOpen(false);
    setMobileShowDetail(true);
  };

  const handleOpenEdit = () => {
    if (!selectedFamily) return;
    setEditFamily({ ...selectedFamily });
    setIsEditOpen(true);
  };

  const handleUpdateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFamily) return;

    try {
      const res = await fetch('/api/admin/families', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFamily)
      });
      const data = await res.json();
      if (data.success && data.family) {
        setFamilies(prev => prev.map(f => f.id === editFamily.id ? data.family : f));
        setSelectedFamily(data.family);
      } else {
        setFamilies(prev => prev.map(f => f.id === editFamily.id ? editFamily : f));
        setSelectedFamily(editFamily);
      }
    } catch (err) {
      setFamilies(prev => prev.map(f => f.id === editFamily.id ? editFamily : f));
      setSelectedFamily(editFamily);
    }

    setIsEditOpen(false);
  };

  const handleAddMemberToFamily = async (userId: string) => {
    if (!selectedFamily) return;

    const alreadyExists = selectedFamily.members ? selectedFamily.members.includes(userId) : false;
    const updatedMembers = alreadyExists 
      ? selectedFamily.members.filter(id => id !== userId) 
      : [...(selectedFamily.members || []), userId];

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
    try {
      await fetch(`/api/admin/families?id=${familyId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn("Backend delete failed, applying locally", err);
    }

    const remaining = families.filter(f => f.id !== familyId);
    setFamilies(remaining);
    if (selectedFamily?.id === familyId) {
      setSelectedFamily(remaining.length > 0 ? remaining[0] : null);
    }
    setDeletingId(null);
  };

  const handlePrintDirectory = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ─── Top Overview Metric Cards (Refined Color Scheme) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:-translate-y-0.5 transition-all group">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "మొత్తం కుటుంబాలు" : isHi ? "कुल परिवार" : "Total Family Units"}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{stats.totalFamilies}</h3>
              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-500/20">
                Active
              </span>
            </div>
          </div>
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:-translate-y-0.5 transition-all group">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "చేరిన కుటుంబ సభ్యులు" : isHi ? "नामांकित सदस्य" : "Enrolled Members"}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{stats.totalEnrolled}</h3>
              <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-white/[0.06]">
                Believers
              </span>
            </div>
          </div>
          <div className="p-3.5 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-500/20 rounded-2xl group-hover:scale-105 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:-translate-y-0.5 transition-all group">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "సగటు కుటుంబ పరిమాణం" : isHi ? "औसत आकार" : "Avg Household Size"}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{stats.avgSize}</h3>
              <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-500/20">
                per unit
              </span>
            </div>
          </div>
          <div className="p-3.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 rounded-2xl group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => setActiveTabFilter(activeTabFilter === "UNASSIGNED" ? "ALL" : "UNASSIGNED")}
          className={`bg-white dark:bg-[#111827] border p-5 rounded-2xl shadow-sm flex items-center justify-between hover:-translate-y-0.5 transition-all cursor-pointer group ${
            activeTabFilter === "UNASSIGNED" 
              ? "border-emerald-500 ring-2 ring-emerald-500/20" 
              : "border-slate-200/80 dark:border-slate-800"
          }`}
        >
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "కేటాయించని విశ్వాసులు" : isHi ? "अनाबंटित विश्वासी" : "Unassigned Believers"}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{stats.unassignedCount}</h3>
              <span className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-500/30 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Assign
              </span>
            </div>
          </div>
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl group-hover:scale-105 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ─── Search & Tab Filters Bar (Cleaned Up without purple scrollbar artifact) ─── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Filter Pills with 4 Distinct Theme Colors */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
          {/* 1. All Households - Royal Blue Theme */}
          <button
            onClick={() => setActiveTabFilter("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTabFilter === "ALL"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/40"
                : "bg-blue-50/80 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            {isTe ? "అన్ని కుటుంబాలు" : isHi ? "सभी परिवार" : "All Households"} ({families.length})
          </button>

          {/* 2. Large (3+) - Purple Theme */}
          <button
            onClick={() => setActiveTabFilter("LARGE")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTabFilter === "LARGE"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 ring-1 ring-purple-400/30"
                : "bg-purple-50/70 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {isTe ? "పెద్ద కుటుంబాలు (3+)" : isHi ? "बड़े परिवार (3+)" : "Large (3+)"}
          </button>

          {/* 3. Small (1-2) - Amber Theme */}
          <button
            onClick={() => setActiveTabFilter("SMALL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTabFilter === "SMALL"
                ? "bg-amber-600 text-white shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30"
                : "bg-amber-50/70 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            {isTe ? "చిన్న కుటుంబాలు (1-2)" : isHi ? "छोटे परिवार (1-2)" : "Small (1-2)"}
          </button>

          {/* 4. Unassigned Members - Emerald Theme */}
          {stats.unassignedCount > 0 && (
            <button
              onClick={() => setActiveTabFilter("UNASSIGNED")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTabFilter === "UNASSIGNED"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30"
                  : "bg-emerald-50/70 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              {isTe ? "కేటాయించని సభ్యులు" : isHi ? "अनाबंटित सदस्य" : "Unassigned Members"} ({stats.unassignedCount})
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handlePrintDirectory}
            className="py-2.5 px-3.5 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200/60 dark:border-white/[0.06] transition-all"
            title="Print Household Summary"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{isTe ? "ముద్రణ" : isHi ? "प्रिंट" : "Print"}</span>
          </button>

          <button 
            onClick={() => setIsCreateOpen(true)} 
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 w-full md:w-auto"
          >
            <Plus className="w-4 h-4" /> {isTe ? "+ కొత్త కుటుంబం" : isHi ? "+ नया परिवार" : "+ Setup Family Unit"}
          </button>
        </div>

      </div>

      {/* ─── Main Grid: Left Directory List + Right Household Detail ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ─── Left Column: Households List ─── */}
        <div className={`lg:col-span-1 space-y-4 ${mobileShowDetail ? "hidden lg:block" : "block"}`}>
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            
            {/* Header & Count */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {t.familyUnits}
                </h2>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-0.5">
                  {filteredFamilies.length} {isTe ? "కుటుంబ రికార్డులు" : isHi ? "परिवार रिकॉर्ड" : "households listed"}
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder={isTe ? "కుటుంబాల శోధన..." : isHi ? "परिवार खोजें..." : "Filter households by name or address..."}
                value={familySearchQuery}
                onChange={(e) => setFamilySearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-semibold"
              />
              {familySearchQuery && (
                <button onClick={() => setFamilySearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Unassigned Believers Drawer Shortcut */}
            {activeTabFilter === "UNASSIGNED" && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-emerald-800 dark:text-emerald-300">
                  <span>Unassigned Believers ({unassignedUsers.length})</span>
                  <button onClick={() => setActiveTabFilter("ALL")} className="text-[10px] text-emerald-600 underline">Show All</button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {unassignedUsers.map(u => (
                    <div key={u.id} className="p-2 bg-white dark:bg-[#121324] rounded-lg border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">{u.name}</span>
                        <span className="text-[9px] text-slate-400 truncate block">{u.email}</span>
                      </div>
                      {selectedFamily && (
                        <button 
                          onClick={() => handleAddMemberToFamily(u.id)}
                          className="py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold rounded-md shrink-0 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add to {selectedFamily.familyName.split(" ")[0]}
                        </button>
                      )}
                    </div>
                  ))}
                  {unassignedUsers.length === 0 && (
                    <p className="text-[10px] text-emerald-600 text-center py-2 font-medium">All church believers are assigned to household units!</p>
                  )}
                </div>
              </div>
            )}

            {/* Household Items List (Refined palette) */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredFamilies.map(fam => {
                const head = getUserDetails(fam.headOfHouseholdId);
                const isSelected = selectedFamily?.id === fam.id;
                const memberCount = fam.members ? fam.members.length : 0;
                
                return (
                  <div 
                    key={fam.id}
                    onClick={() => handleSelectFamily(fam)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected 
                        ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500/60 dark:border-indigo-500/50 shadow-sm" 
                        : "bg-white dark:bg-[#16172D]/30 hover:bg-slate-50 dark:hover:bg-[#16172D]/60 border-slate-200/80 dark:border-white/[0.04]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-400" />
                    )}

                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1.5 overflow-hidden pr-2">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {getFamilyNameTranslation(fam.familyName)}
                        </h4>
                        
                        <p className="text-[10px] text-slate-600 dark:text-gray-300 font-semibold truncate flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{head.name || "Household Head"}</span>
                        </p>

                        <p className="text-[9.5px] text-slate-400 dark:text-gray-500 font-medium truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{getFamilyAddressTranslation(fam.address)}</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                        
                        {/* Delete popover state */}
                        {deletingId === fam.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 p-1 rounded-lg border border-rose-200 dark:border-rose-500/20" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => handleRemoveFamily(fam.id)}
                              className="text-[9px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded hover:bg-rose-700"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => setDeletingId(null)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setDeletingId(fam.id); }}
                            className="text-slate-300 dark:text-gray-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                            title="Delete Household Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <span className="text-[10px] font-bold text-slate-600 dark:text-gray-300 flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04] mt-2">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{memberCount}</span>
                        </span>
                      </div>
                    </div>

                    {/* Member Initials Avatar Stack */}
                    {fam.members && fam.members.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                          {fam.members.slice(0, 4).map((mId, idx) => {
                            const u = getUserDetails(mId);
                            return (
                              <div 
                                key={idx} 
                                className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-slate-700 text-[8px] font-bold flex items-center justify-center uppercase shrink-0 shadow-sm"
                                title={u.name}
                              >
                                {(u.name || "M").substring(0, 1)}
                              </div>
                            );
                          })}
                          {fam.members.length > 4 && (
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/[0.1] border border-white dark:border-[#16172D] text-slate-600 dark:text-gray-300 text-[8px] font-bold flex items-center justify-center shrink-0">
                              +{fam.members.length - 4}
                            </div>
                          )}
                        </div>

                        {fam.branchName && (
                          <span className="text-[9px] font-semibold text-slate-400 dark:text-gray-500 truncate max-w-[120px]">
                            {fam.branchName.replace(" Sanctuary", "")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredFamilies.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400 dark:text-gray-500 font-semibold bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.05] p-6 space-y-2">
                  <Home className="w-8 h-8 mx-auto text-slate-300 dark:text-gray-600" />
                  <p>{isTe ? "కుటుంబ రికార్డులు ఏవీ కనుగొనబడలేదు" : isHi ? "कोई परिवार रिकॉर्ड नहीं मिला" : "No matching family households found."}</p>
                  <button 
                    onClick={() => { setFamilySearchQuery(""); setActiveTabFilter("ALL"); }}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 underline font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ─── Right Column: Selected Household Detail & Roster Workbench ─── */}
        <div className={`lg:col-span-2 space-y-6 ${!mobileShowDetail && "hidden lg:block"}`}>
          
          {/* Mobile Back Button */}
          <div className="lg:hidden">
            <button 
              onClick={() => setMobileShowDetail(false)}
              className="py-2 px-3 bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-white/[0.08]"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Household List
            </button>
          </div>

          {selectedFamily ? (
            /* SELECTED HOUSEHOLD WORKBENCH */
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
              
              {/* Header Card (Clean layout) */}
              <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-[#16172D]/40 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/20">
                      <Home className="w-3 h-3" />
                      {isTe ? "కుటుంబ విభాగం" : isHi ? "परिवार इकाई" : "Household Unit"}
                    </span>

                    {selectedFamily.branchName && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/[0.06]">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {selectedFamily.branchName}
                      </span>
                    )}

                    {selectedFamily.anniversaryDate && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-500/20">
                        <Heart className="w-3 h-3 text-rose-500" />
                        Anniversary: {selectedFamily.anniversaryDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {getFamilyNameTranslation(selectedFamily.familyName)}
                    </h2>
                    <button 
                      onClick={handleOpenEdit}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 bg-white dark:bg-[#16172D] border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-sm"
                      title="Edit Family Information"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="flex flex-wrap gap-3 pt-1 text-xs text-slate-600 dark:text-gray-300 font-semibold">
                    <span className="flex items-center gap-1.5 bg-white dark:bg-[#16172D] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      {t.headOfHousehold}: <strong className="text-slate-900 dark:text-white ml-0.5">{getUserDetails(selectedFamily.headOfHouseholdId).name}</strong>
                    </span>

                    <a href={`tel:${selectedFamily.contactPhone}`} className="flex items-center gap-1.5 bg-white dark:bg-[#16172D] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 transition-colors shadow-sm">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedFamily.contactPhone}</span>
                    </a>

                    <span className="flex items-center gap-1.5 bg-white dark:bg-[#16172D] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{getFamilyAddressTranslation(selectedFamily.address)}</span>
                    </span>
                  </div>

                  {selectedFamily.notes && (
                    <p className="text-xs text-slate-500 dark:text-gray-400 italic bg-white/70 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                      "{selectedFamily.notes}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => setIsAddMemberOpen(true)}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isTe ? "సభ్యులను చేర్చండి" : isHi ? "सदस्य जोड़ें" : "+ Assign Members"}
                  </button>

                  <button 
                    onClick={handleOpenEdit}
                    className="py-2.5 px-4 bg-white dark:bg-[#16172D] text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" /> Edit Family Info
                  </button>
                </div>
              </div>

              {/* Household Roster Section Header */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    {t.householdRoster} ({selectedFamily.members ? selectedFamily.members.length : 0})
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">
                    Believers registered under this household unit
                  </p>
                </div>

                <button 
                  onClick={() => setIsAddMemberOpen(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Manage Roster
                </button>
              </div>

              {/* Roster Members Grid */}
              <div className="grid md:grid-cols-2 gap-3">
                {selectedFamily.members && selectedFamily.members.map((mId) => {
                  const member = getUserDetails(mId);
                  const isHead = mId === selectedFamily.headOfHouseholdId;
                  
                  return (
                    <div 
                      key={mId} 
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-sm ${
                        isHead
                          ? "bg-amber-50/40 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20"
                          : "bg-white dark:bg-[#16172D]/30 border-slate-200/80 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold uppercase text-xs shrink-0 ${
                          isHead
                            ? "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/50"
                            : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-white/10"
                        }`}>
                          {(member.name || "M").substring(0, 2)}
                        </div>

                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {member.name}
                            </h4>
                            {isHead && (
                              <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200/60 rounded-md">
                                <Crown className="w-2.5 h-2.5 text-amber-500" />
                                {isTe ? "ఇంటి పెద్ద" : isHi ? "मुखिया" : "Head"}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-slate-400 dark:text-gray-400 truncate mt-0.5 font-medium flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{member.email}</span>
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
                  <div className="col-span-full py-14 text-center bg-slate-50/40 dark:bg-[#16172D]/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3 p-6">
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
                      className="mt-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      <UserPlus className="w-4 h-4" />
                      {isTe ? "సభ్యులను జతచేయండి" : isHi ? "सदस्य जोड़ें" : "Assign Family Members"}
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Add Unassigned Members Box */}
              {unassignedUsers.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Quick Add Unassigned Believers ({unassignedUsers.length})
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {unassignedUsers.slice(0, 3).map(u => (
                      <div key={u.id} className="p-3 bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl flex items-center justify-between gap-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">{u.name}</span>
                          <span className="text-[9px] text-slate-400 truncate block">{u.email}</span>
                        </div>
                        <button 
                          onClick={() => handleAddMemberToFamily(u.id)}
                          className="py-1 px-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 dark:bg-white/10 dark:text-gray-200 text-[10px] font-bold rounded-lg transition-all shrink-0"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* SHOWCASE DIRECTORY (When no family is selected) */
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-8 rounded-2xl shadow-sm space-y-6 text-center py-20">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-500/20">
                <Home className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {isTe ? "కుటుంబ రికార్డును ఎంచుకోండి" : isHi ? "परिवार रिकॉर्ड चुनें" : "Select a Household Unit"}
                </h3>
                <p className="text-xs text-slate-400 dark:text-gray-400 font-semibold">
                  {isTe ? "సభ్యుల రికార్డులు చూసేందుకు లేదా క్రొత్త రికార్డును సృష్టించడానికి జాబితా నుండి ఎంచుకోండి." : isHi ? "सदस्यों के रिकॉर्ड देखने या नया रिकॉर्ड बनाने के लिए सूची से चुनें।" : "Choose a household from the left directory to inspect members, set household heads, or assign believers."}
                </p>
              </div>
              <button 
                onClick={() => setIsCreateOpen(true)}
                className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {isTe ? "క్రొత్త కుటుంబ రికార్డు సృష్టించు" : isHi ? "नया परिवार रिकॉर्ड बनाएं" : "Setup New Family Unit"}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ─── MODAL: CREATE FAMILY UNIT ─── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-500" />
                {t.setupModalTitle}
              </h3>
              <button 
                onClick={() => setIsCreateOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateFamily} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-400 uppercase mb-1.5">
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
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-400 uppercase mb-1.5">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-400 uppercase mb-1.5">
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
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-400 uppercase mb-1.5">
                    Anniversary Date
                  </label>
                  <input 
                    type="date" 
                    value={newFamily.anniversaryDate}
                    onChange={(e) => setNewFamily({ ...newFamily, anniversaryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-400 uppercase mb-1.5">
                  {t.sanctuaryAddress}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 15-201, Jeedimetla, Hyderabad" 
                  value={newFamily.address}
                  onChange={(e) => setNewFamily({ ...newFamily, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-400 uppercase mb-1.5">
                  Branch / Sanctuary Location
                </label>
                <select 
                  value={newFamily.branchName}
                  onChange={(e) => setNewFamily({ ...newFamily, branchName: e.target.value })}
                  className="w-full py-2.5 px-3.5 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                >
                  <option value="Shapur Nagar Sanctuary">Shapur Nagar Sanctuary</option>
                  <option value="Subhash Nagar">Subhash Nagar</option>
                  <option value="Bahadurpally">Bahadurpally</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-400 uppercase mb-1.5">
                  Notes / Prayer Requests
                </label>
                <textarea 
                  rows={2}
                  placeholder="Family notes or prayer details..." 
                  value={newFamily.notes}
                  onChange={(e) => setNewFamily({ ...newFamily, notes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
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
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-sm active:scale-95"
                >
                  {t.setupFamilyBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT FAMILY DETAILS ─── */}
      {isEditOpen && editFamily && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500" />
                Edit Family Details
              </h3>
              <button 
                onClick={() => setIsEditOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateFamily} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-400 uppercase mb-1.5">
                  Family Title / Name *
                </label>
                <input 
                  type="text" 
                  required 
                  value={editFamily.familyName}
                  onChange={(e) => setEditFamily({ ...editFamily, familyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-400 uppercase mb-1.5">
                  Contact Phone
                </label>
                <input 
                  type="text" 
                  value={editFamily.contactPhone}
                  onChange={(e) => setEditFamily({ ...editFamily, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-400 uppercase mb-1.5">
                  Sanctuary Address
                </label>
                <input 
                  type="text" 
                  value={editFamily.address}
                  onChange={(e) => setEditFamily({ ...editFamily, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-400 uppercase mb-1.5">
                  Anniversary Date
                </label>
                <input 
                  type="date" 
                  value={editFamily.anniversaryDate || ""}
                  onChange={(e) => setEditFamily({ ...editFamily, anniversaryDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-400 uppercase mb-1.5">
                  Notes
                </label>
                <textarea 
                  rows={2}
                  value={editFamily.notes || ""}
                  onChange={(e) => setEditFamily({ ...editFamily, notes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)} 
                  className="flex-1 py-2.5 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-sm active:scale-95"
                >
                  Save Changes
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
                            ? "bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 shadow-sm" 
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
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm active:scale-95"
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
