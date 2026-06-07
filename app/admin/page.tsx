"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  DollarSign, 
  UserCheck, 
  Calendar, 
  UserPlus, 
  Search, 
  Bell, 
  ChevronDown, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Megaphone, 
  FileText, 
  Settings, 
  Shield, 
  Image as ImageIcon,
  MessageSquare,
  Home,
  Heart,
  CreditCard,
  Layers,
  BarChart2,
  CheckSquare,
  Play,
  X,
  TrendingUp,
  Mail,
  Phone,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  LogOut,
  Loader2,
  Printer,
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import Image from "next/image";

// Types
interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Pending";
  avatar: string;
}

interface Sermon {
  id: number;
  title: string;
  speaker: string;
  date: string;
  category: string;
  status: "Published" | "Draft";
  views: number;
  thumbnail: string;
}

export default function AdminDashboardPage() {
  const { user, status, mounted, logout } = useAuth();
  const router = useRouter();

  // Active view: "dashboard" | "members" | "donations" | "settings"
  const [activeView, setActiveView] = useState<"dashboard" | "members" | "donations" | "settings">("dashboard");
  
  // Tab states for Content Management inside dashboard
  const [activeContentTab, setActiveContentTab] = useState<"Sermons" | "Events" | "Announcements" | "Pages">("Sermons");

  // State arrays for dashboard mockup
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "James Wilson", email: "james.wilson@email.com", phone: "+1 234 567 8901", status: "Active", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
    { id: 2, name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 234 567 8902", status: "Active", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
    { id: 3, name: "Michael Brown", email: "michael.b@email.com", phone: "+1 234 567 8903", status: "Active", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" },
    { id: 4, name: "Emily Davis", email: "emily.d@email.com", phone: "+1 234 567 8904", status: "Pending", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
    { id: 5, name: "David Martinez", email: "david.m@email.com", phone: "+1 234 567 8905", status: "Active", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80" }
  ]);

  const [sermons, setSermons] = useState<Sermon[]>([
    { id: 1, title: "Faith in Difficult Times", speaker: "Pastor John", date: "May 18, 2024", category: "Faith", status: "Published", views: 245, thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=200&q=80" },
    { id: 2, title: "God's Plan for Your Life", speaker: "Pastor John", date: "May 11, 2024", category: "Inspiration", status: "Published", views: 312, thumbnail: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=200&q=80" },
    { id: 3, title: "Walking in Purpose", speaker: "Pastor Sarah", date: "May 4, 2024", category: "Purpose", status: "Published", views: 189, thumbnail: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&q=80" },
    { id: 4, title: "The Power of Prayer", speaker: "Pastor Michael", date: "Apr 27, 2024", category: "Prayer", status: "Draft", views: 0, thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=200&q=80" }
  ]);

  // Real data state from database/console APIs
  const [usersDb, setUsersDb] = useState<any[]>([]);
  const [donationsDb, setDonationsDb] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  // Filters for tables
  const [searchTerm, setSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [donationTypeFilter, setDonationTypeFilter] = useState("ALL");

  // Settings
  const [contactEmail, setContactEmail] = useState("kingofchristministries23@gmail.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Modals
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [newMember, setNewMember] = useState({ name: "", email: "", phone: "", status: "Active" as "Active" | "Pending" });
  const [newSermon, setNewSermon] = useState({ title: "", speaker: "Pastor John", category: "Faith", status: "Published" as "Published" | "Draft" });

  // Route protection
  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [mounted, status, user, router]);

  // Fetch real database records
  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersDb(data.users || []);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadDonations() {
    setLoadingDonations(true);
    try {
      const res = await fetch("/api/admin/donations");
      const data = await res.json();
      if (res.ok && data.success) {
        setDonationsDb(data.donations || []);
      }
    } catch (err) {
      console.error("Error loading donations:", err);
    } finally {
      setLoadingDonations(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")) {
      loadUsers();
      loadDonations();
    }
  }, [status, user]);

  // Handle Member Addition (mock/in-memory)
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;
    const added: Member = {
      id: Date.now(),
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone || "+1 234 567 0000",
      status: newMember.status,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"
    };
    setMembers([added, ...members]);
    setNewMember({ name: "", email: "", phone: "", status: "Active" });
    setIsMemberModalOpen(false);
    setSuccessMsg("Believer added to recent members list!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Handle Sermon Addition (mock/in-memory)
  const handleAddSermon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSermon.title) return;
    const added: Sermon = {
      id: Date.now(),
      title: newSermon.title,
      speaker: newSermon.speaker,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      category: newSermon.category,
      status: newSermon.status,
      views: 0,
      thumbnail: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=200&q=80"
    };
    setSermons([added, ...sermons]);
    setNewSermon({ title: "", speaker: "Pastor John", category: "Faith", status: "Published" });
    setIsSermonModalOpen(false);
    setSuccessMsg("Sermon uploaded successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Handle Sermon deletion (mock/in-memory)
  const handleDeleteSermon = (id: number) => {
    setSermons(sermons.filter(s => s.id !== id));
  };

  // Handle Member deletion (mock/in-memory)
  const handleDeleteMember = (id: number) => {
    setMembers(members.filter(m => m.id !== id));
  };

  // Role Promotion Handler
  const handleRoleChange = async (userId: string, newRole: string) => {
    setRoleUpdatingId(userId);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersDb((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setSuccessMsg(`User role promoted to ${newRole}!`);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        throw new Error(data.error || "Failed to update role");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to modify role.");
      setTimeout(() => setErrorMsg(""), 4000);
    } finally {
      setRoleUpdatingId(null);
    }
  };

  // Settings Save Handler
  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSuccessMsg("");
    setTimeout(() => {
      setSettingsLoading(false);
      setSuccessMsg("System administration settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 800);
  };

  // Lists filtering
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSermons = sermons.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsersDb = usersDb.filter(u => {
    const matchesSearch = 
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const completedDonationsDb = donationsDb.filter(d => d.status === "COMPLETED");
  const filteredDonationsDb = completedDonationsDb.filter(d => {
    const matchesSearch = 
      (d.donorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.donorEmail || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = donationTypeFilter === "ALL" || d.purpose === donationTypeFilter;
    return matchesSearch && matchesType;
  });

  const totalFinancials = completedDonationsDb.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  if (!mounted || status === "loading" || (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#6366F1] mx-auto" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Securing Admin Connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#1E293B] font-sans antialiased">
      
      {/* 1. Left Sidebar Navigation (Dark Mode Theme) */}
      <aside className="w-64 bg-[#0F1021] text-gray-300 flex flex-col shrink-0 border-r border-[#1E203B] relative z-20">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[#1E203B]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/30">
            ✝
          </div>
          <span className="font-extrabold text-white text-base tracking-tight whitespace-nowrap">
            Grace Community Church
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-7 custom-scrollbar">
          {/* Dashboard active */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeView === "dashboard" 
                  ? "bg-[#6366F1] text-white shadow-lg shadow-indigo-600/30" 
                  : "hover:bg-white/5 hover:text-white text-gray-400"
              }`}
            >
              <Layers className="w-4.5 h-4.5" />
              Dashboard
            </button>
          </div>

          {/* MEMBERS SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4">MEMBERS</h4>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveView("members"); setUserRoleFilter("ALL"); }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === "members" 
                    ? "bg-white/10 text-white" 
                    : "hover:bg-white/5 hover:text-white text-gray-400"
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                Members
              </button>
              <button className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400/60 cursor-not-allowed">
                <Users className="w-4 h-4 shrink-0" />
                Member Groups
              </button>
              <button className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400/60 cursor-not-allowed">
                <MessageSquare className="w-4 h-4 shrink-0" />
                Prayer Requests
              </button>
              <button className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400/60 cursor-not-allowed">
                <Home className="w-4 h-4 shrink-0" />
                Family Management
              </button>
            </div>
          </div>

          {/* FINANCE SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4">FINANCE</h4>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveView("donations"); setDonationTypeFilter("ALL"); }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === "donations" 
                    ? "bg-white/10 text-white" 
                    : "hover:bg-white/5 hover:text-white text-gray-400"
                }`}
              >
                <DollarSign className="w-4 h-4 shrink-0" />
                Donations
              </button>
              <button className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400/60 cursor-not-allowed">
                <Heart className="w-4 h-4 shrink-0" />
                Pledges
              </button>
              <button className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400/60 cursor-not-allowed">
                <CreditCard className="w-4 h-4 shrink-0" />
                Transactions
              </button>
              <button className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400/60 cursor-not-allowed">
                <Layers className="w-4 h-4 shrink-0" />
                Accounts
              </button>
            </div>
          </div>

          {/* SETTINGS SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4">SETTINGS</h4>
            <div className="space-y-1">
              <button
                onClick={() => setActiveView("settings")}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === "settings" 
                    ? "bg-white/10 text-white" 
                    : "hover:bg-white/5 hover:text-white text-gray-400"
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                Settings
              </button>
              <button
                onClick={() => { setActiveView("members"); setUserRoleFilter("ALL"); }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === "members" && activeView === "members" 
                    ? "bg-white/10 text-white" 
                    : "hover:bg-white/5 hover:text-white text-gray-400"
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                Users & Roles
              </button>
            </div>
          </div>
        </div>

        {/* Profile Footer */}
        <div className="p-4 border-t border-[#1E203B] bg-[#0A0B16]/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full border border-gray-800 overflow-hidden relative shrink-0">
              <Image 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" 
                alt="Pastor John" 
                fill 
                sizes="40px"
                className="object-cover" 
              />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">Pastor John</h4>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user?.role || "Super Admin"}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-colors shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen custom-scrollbar">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200/80 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight uppercase">
              {activeView === "dashboard" ? "Dashboard" : activeView === "members" ? "User Roles Manager" : activeView === "donations" ? "Donations Ledger" : "System Settings"}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Search Input */}
            <div className="relative w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search listings, names, emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button className="p-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors relative">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#6366F1] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                  5
                </span>
              </button>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200/80 rounded-xl text-xs font-semibold text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>May 12 – May 18, 2024</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 space-y-8 flex-1">
          
          {successMsg && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs rounded-xl flex items-center gap-2 shadow-sm">
              <CheckCircle className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-xl flex items-center gap-2 shadow-sm">
              <XCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ────────────────── VIEW 1: DASHBOARD GRID ────────────────── */}
          {activeView === "dashboard" && (
            <>
              {/* Metric Cards Row */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Members</span>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">1,248</h3>
                    <span className="text-[10px] font-bold text-[#10B981]">▲ +12 this week</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0 shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Donations</span>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">$24,560</h3>
                    <span className="text-[10px] font-bold text-[#10B981]">▲ +18.6% this week</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0 shadow-sm">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Attendance (Weekly)</span>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">856</h3>
                    <span className="text-[10px] font-bold text-[#10B981]">▲ +8.3% this week</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center shrink-0 shadow-sm">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Events</span>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">7</h3>
                    <span className="text-[10px] font-bold text-gray-400">Upcoming events</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center shrink-0 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">New Members</span>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">24</h3>
                    <span className="text-[10px] font-bold text-[#10B981]">▲ +20% this week</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center shrink-0 shadow-sm">
                    <UserPlus className="w-5 h-5" />
                  </div>
                </div>
              </section>

              {/* Middle Grid Section */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Member Management */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Member Management</h3>
                      <h2 className="text-base font-extrabold text-[#0F172A]">Recent Members</h2>
                    </div>
                    <button onClick={() => setActiveView("members")} className="text-xs font-bold text-[#6366F1] hover:underline">View All</button>
                  </div>
                  <div className="p-6 py-4 space-y-4 flex-1">
                    {filteredMembers.slice(0, 5).map(member => (
                      <div key={member.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0 border border-gray-100">
                            <Image src={member.avatar} alt={member.name} fill sizes="40px" className="object-cover" />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{member.name}</h4>
                            <p className="text-[11px] text-gray-400 truncate">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            member.status === "Active" 
                              ? "bg-emerald-50 text-[#10B981] border border-emerald-100" 
                              : "bg-amber-50 text-[#F59E0B] border border-amber-100"
                          }`}>
                            {member.status}
                          </span>
                          <button onClick={() => handleDeleteMember(member.id)} className="text-gray-300 hover:text-red-500 p-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 pt-0">
                    <button onClick={() => setIsMemberModalOpen(true)} className="w-full py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm">
                      <Plus className="w-4 h-4" /> Add New Member
                    </button>
                  </div>
                </div>

                {/* Donation Tracking */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Donation Tracking</h3>
                      <h2 className="text-base font-extrabold text-[#0F172A]">Donation Overview</h2>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500">
                      <span>This Month</span>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="p-6 py-4 flex-1 flex flex-col justify-between">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-extrabold text-[#0F172A]">$24,560</span>
                      <span className="text-[10px] font-bold text-[#10B981]">▲ 18.6% from last month</span>
                    </div>
                    {/* SVG Line Chart */}
                    <div className="h-28 w-full relative mb-5">
                      <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="dbChartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M 0 90 Q 50 80 75 60 T 150 40 T 225 65 T 300 15 L 300 100 L 0 100 Z" fill="url(#dbChartGrad)" />
                        <path d="M 0 90 Q 50 80 75 60 T 150 40 T 225 65 T 300 15" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="300" cy="15" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                      </svg>
                      <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-1 px-1">
                        <span>May 1</span>
                        <span>May 6</span>
                        <span>May 11</span>
                        <span>May 16</span>
                      </div>
                    </div>
                    {/* Recent list */}
                    <div className="space-y-2.5">
                      {[
                        { name: "John Doe", date: "May 18, 2024", amount: "$200.00", fund: "Tithe" },
                        { name: "Anonymous", date: "May 18, 2024", amount: "$150.00", fund: "Offering" },
                        { name: "Mary Smith", date: "May 17, 2024", amount: "$500.00", fund: "Building Fund" }
                      ].map((don, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                          <div>
                            <p className="text-gray-900 truncate">{don.name}</p>
                            <p className="text-[9px] text-gray-400">{don.date}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[#10B981] font-bold">{don.amount}</p>
                            <p className="text-[9px] text-gray-400">{don.fund}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <button onClick={() => setActiveView("donations")} className="w-full py-3 bg-[#10B981] hover:bg-[#0F9F6E] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm">
                      View All Donations
                    </button>
                  </div>
                </div>

                {/* Attendance Records */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Attendance Records</h3>
                      <h2 className="text-base font-extrabold text-[#0F172A]">Attendance Overview</h2>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500">
                      <span>This Week</span>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="p-6 py-4 flex-1 flex flex-col justify-between">
                    {/* Bar Chart */}
                    <div className="h-32 flex items-end justify-between gap-2.5 px-2 relative mb-6">
                      {[
                        { day: "Mon", val: 80, height: "h-[30%]" },
                        { day: "Tue", val: 120, height: "h-[45%]" },
                        { day: "Wed", val: 150, height: "h-[55%]" },
                        { day: "Thu", val: 90, height: "h-[35%]" },
                        { day: "Fri", val: 110, height: "h-[40%]" },
                        { day: "Sat", val: 0, height: "h-[0%]" },
                        { day: "Sun", val: 260, height: "h-[85%]" }
                      ].map((bar, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                          <div className={`w-full bg-[#6366F1]/15 group-hover:bg-[#6366F1]/30 rounded-t-lg transition-colors flex items-end overflow-hidden ${bar.height} min-h-[4px]`}>
                            <div className="w-full bg-[#6366F1] rounded-t-lg" style={{ height: "100%" }} />
                          </div>
                          <span className="text-[9px] font-bold text-gray-400">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                    {/* Metrics list */}
                    <div className="space-y-2.5">
                      {[
                        { label: "Total Attendance", val: "856" },
                        { label: "Average Daily", val: "122" },
                        { label: "Highest Day", val: "Sunday", highlight: true }
                      ].map((stat, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-gray-500">{stat.label}</span>
                          <span className={`font-bold ${stat.highlight ? "text-[#6366F1]" : "text-gray-900"}`}>{stat.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <button className="w-full py-3 bg-[#6366F1]/10 hover:bg-[#6366F1]/15 text-[#6366F1] rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
                      View Full Report
                    </button>
                  </div>
                </div>
              </section>

              {/* Bottom Section: Content Table & Quick Actions */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Content Management Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div className="p-6 pb-2 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Content Management</h3>
                      <div className="flex gap-6 mt-4">
                        {["Sermons", "Events", "Announcements", "Pages"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveContentTab(tab as any)}
                            className={`pb-3 text-xs font-bold transition-all relative ${
                              activeContentTab === tab ? "text-[#6366F1]" : "text-gray-400 hover:text-gray-700"
                            }`}
                          >
                            {tab}
                            {activeContentTab === tab && (
                              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#6366F1] rounded-full" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    {activeContentTab === "Sermons" && (
                      <button onClick={() => setIsSermonModalOpen(true)} className="py-2.5 px-4.5 bg-[#6366F1] text-white rounded-xl font-bold text-xs flex items-center gap-1.5">
                        <Plus className="w-4 h-4" /> Add New Sermon
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    {activeContentTab === "Sermons" ? (
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                            <th className="py-4.5 px-6">Title</th>
                            <th className="py-4.5 px-6">Speaker</th>
                            <th className="py-4.5 px-6">Date</th>
                            <th className="py-4.5 px-6">Category</th>
                            <th className="py-4.5 px-6">Status</th>
                            <th className="py-4.5 px-6">Views</th>
                            <th className="py-4.5 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                          {filteredSermons.map((sermon) => (
                            <tr key={sermon.id} className="hover:bg-gray-50/30 transition-colors">
                              <td className="py-4 px-6 flex items-center gap-3">
                                <div className="w-12 h-8.5 rounded-lg overflow-hidden relative shrink-0 border border-gray-100">
                                  <Image src={sermon.thumbnail} alt={sermon.title} fill sizes="48px" className="object-cover" />
                                </div>
                                <span className="font-extrabold text-[#0F172A] truncate max-w-[180px]">{sermon.title}</span>
                              </td>
                              <td className="py-4 px-6 text-gray-500">{sermon.speaker}</td>
                              <td className="py-4 px-6 text-gray-400">{sermon.date}</td>
                              <td className="py-4 px-6">
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold">{sermon.category}</span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  sermon.status === "Published" 
                                    ? "bg-emerald-50 text-[#10B981] border border-emerald-100" 
                                    : "bg-amber-50 text-[#F59E0B] border border-amber-100"
                                }`}>
                                  {sermon.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-gray-400">{sermon.views}</td>
                              <td className="py-4 px-6 text-right space-x-1 shrink-0 whitespace-nowrap">
                                <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg"><Eye className="w-4 h-4" /></button>
                                <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteSermon(sermon.id)} className="p-1.5 text-gray-400 hover:text-red-650 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-xs text-gray-450 flex flex-col items-center justify-center gap-1">
                        <Sparkles className="w-7 h-7 text-indigo-300 animate-pulse" />
                        <span>Content list for {activeContentTab} database will load dynamically.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div className="p-6 pb-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Church Operations</h3>
                    <h2 className="text-base font-extrabold text-[#0F172A]">Quick Actions</h2>
                  </div>
                  <div className="p-6 py-5 flex-1 space-y-3">
                    {[
                      { label: "Add New Member", icon: UserPlus, color: "bg-indigo-50 text-[#6366F1]", act: () => setIsMemberModalOpen(true) },
                      { label: "Record Donation", icon: DollarSign, color: "bg-emerald-50 text-[#10B981]", act: () => setActiveView("donations") },
                      { label: "Mark Attendance", icon: UserCheck, color: "bg-blue-50 text-[#3B82F6]", act: () => {} },
                      { label: "Create Event", icon: Calendar, color: "bg-amber-50 text-[#F59E0B]", act: () => {} },
                      { label: "Add Announcement", icon: Megaphone, color: "bg-pink-50 text-[#EC4899]", act: () => {} }
                    ].map((actItem, idx) => (
                      <button 
                        key={idx}
                        onClick={actItem.act}
                        className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-indigo-50/40 border border-gray-100 hover:border-indigo-100 rounded-2xl transition-all text-left group"
                      >
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          <div className={`w-9 h-9 rounded-xl ${actItem.color} flex items-center justify-center shrink-0`}>
                            <actItem.icon className="w-4.5 h-4.5" />
                          </div>
                          <span className="text-xs font-bold text-gray-700 group-hover:text-[#6366F1] transition-colors">{actItem.label}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-450 -rotate-90" />
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ────────────────── VIEW 2: USERS & ROLES MANAGER ────────────────── */}
          {activeView === "members" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#0F172A]">Platform Users Registry</h2>
                  <p className="text-xs text-gray-400 mt-1">Review church profiles, promote/demote user roles, and assign security credentials.</p>
                </div>
                <div className="flex gap-3 items-center">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold outline-none focus:ring-2 focus:ring-[#6366F1]"
                  >
                    <option value="ALL">Filter Roles (All)</option>
                    <option value="MEMBER">Believers (MEMBER)</option>
                    <option value="PASTOR">Shepherds (PASTOR)</option>
                    <option value="ADMIN">Command Center (ADMIN)</option>
                  </select>
                  <button onClick={loadUsers} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                    <RefreshCw className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {loadingUsers ? (
                <div className="py-24 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-[#6366F1] mx-auto" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsersDb.map((u) => (
                    <div key={u.id} className="bg-white rounded-3xl border border-gray-150 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-all">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-[#6366F1] to-purple-600 text-white font-extrabold rounded-2xl flex items-center justify-center uppercase text-sm">
                            {(u.name || "U").substring(0, 2)}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-extrabold text-gray-950 truncate leading-tight">{u.name || "Congregation Member"}</h4>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{u.email}</p>
                          </div>
                        </div>
                        <hr className="border-gray-100" />
                        <div className="space-y-2 text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-indigo-500/70" />
                            <span>{u.phone || "No phone added"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500/70" />
                            <span>Registered: {new Date(u.createdAt).toLocaleDateString("en-US")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Change Platform Role</label>
                        {roleUpdatingId === u.id ? (
                          <div className="w-full py-2 bg-gray-50 rounded-xl flex items-center justify-center gap-2 border border-gray-200">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6366F1]" />
                            <span className="text-[10px] font-bold text-gray-400">Updating...</span>
                          </div>
                        ) : (
                          <select
                            value={u.role || "MEMBER"}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="w-full py-2.5 px-3 bg-gray-50 text-xs font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6366F1] cursor-pointer"
                          >
                            <option value="MEMBER">Believer (MEMBER)</option>
                            <option value="PASTOR">Shepherd (PASTOR)</option>
                            <option value="ADMIN">Command Center (ADMIN)</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ────────────────── VIEW 3: DONATIONS LEDGER ────────────────── */}
          {activeView === "donations" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Aggregate Income</span>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">₹{totalFinancials.toLocaleString("en-IN")}</h3>
                  </div>
                  <div className="p-3 bg-green-50 text-[#10B981] rounded-xl shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Ledger Volume</span>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">{completedDonationsDb.length}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-xl shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                  <div className="w-full">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Ledger Settings</span>
                    <div className="flex gap-2 mt-2">
                      <select
                        value={donationTypeFilter}
                        onChange={(e) => setDonationTypeFilter(e.target.value)}
                        className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value="ALL">All Offering Types</option>
                        <option value="TITHE">Tithe Only</option>
                        <option value="OFFERING">Offering Only</option>
                        <option value="MISSIONS">Missions Only</option>
                        <option value="BUILDING">Building Only</option>
                      </select>
                      <button onClick={() => window.print()} className="py-1.5 px-3 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions list */}
              <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
                {loadingDonations ? (
                  <div className="py-24 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#6366F1] mx-auto" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-black tracking-wider border-b border-gray-150">
                          <th className="py-4.5 px-6">Donor Info</th>
                          <th className="py-4.5 px-6">Order & Tx IDs</th>
                          <th className="py-4.5 px-6">Offering Type</th>
                          <th className="py-4.5 px-6">Amount</th>
                          <th className="py-4.5 px-6">Date</th>
                          <th className="py-4.5 px-6 text-center">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs font-semibold">
                        {filteredDonationsDb.map((d) => (
                          <tr key={d.id} className="hover:bg-gray-50/30">
                            <td className="py-4 px-6">
                              <span className="font-extrabold text-gray-900 block">{d.donorName || "Anonymous Giver"}</span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">{d.donorEmail || "No email"}</span>
                            </td>
                            <td className="py-4 px-6 font-mono text-[9px] text-gray-400 space-y-0.5">
                              <span className="block">ORDER: {d.razorpayOrderId || "N/A"}</span>
                              <span className="block text-purple-600">PAYID: {d.razorpayPaymentId || d.stripeId || "N/A"}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-2 py-0.5 bg-green-50 text-[#10B981] rounded-full text-[9px] uppercase tracking-wider font-bold">
                                {d.purpose}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm font-extrabold text-gray-900">
                              ₹{d.amount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-4 px-6 text-gray-400">
                              {new Date(d.createdAt).toLocaleDateString("en-US")}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <Link href={`/give/receipt/${d.id}`} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[#6366F1] font-bold text-[9px] uppercase hover:bg-indigo-50 transition-colors">
                                <FileText className="w-3 h-3" /> View 80G
                              </Link>
                            </td>
                          </tr>
                        ))}
                        {filteredDonationsDb.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-xs text-gray-400">No completed donations found in this registry.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────── VIEW 4: SYSTEM SETTINGS ────────────────── */}
          {activeView === "settings" && (
            <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-8 max-w-2xl mx-auto">
              <div className="border-b border-gray-100 pb-5 mb-6">
                <h2 className="text-base font-extrabold text-[#0F172A]">Platform Configuration</h2>
                <p className="text-xs text-gray-400 mt-1">Configure global application variables, overrides, and administrative email routes.</p>
              </div>

              <form onSubmit={handleSettingsSave} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Contact Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all bg-gray-50/50"
                  />
                  <p className="text-[10px] text-gray-450 mt-1.5 leading-relaxed">Used for global public references, tax-exemption receipt footers, and contact templates.</p>
                </div>

                <hr className="border-gray-50" />

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-800 block">Maintenance Override Mode</span>
                    <span className="text-[10px] text-gray-450 block leading-tight">Restrict site access only to pastor and admin roles.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-4.5 h-4.5 text-[#6366F1] border-gray-300 rounded focus:ring-[#6366F1]"
                  />
                </div>

                <hr className="border-gray-50" />

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-800 block">Allow Public Registrations</span>
                    <span className="text-[10px] text-gray-450 block leading-tight">Enables new believers to establish profiles on the portal.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowRegistrations}
                    onChange={(e) => setAllowRegistrations(e.target.checked)}
                    className="w-4.5 h-4.5 text-[#6366F1] border-gray-300 rounded focus:ring-[#6366F1]"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="submit" 
                    disabled={settingsLoading}
                    className="flex-1 py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {settingsLoading ? "Saving Changes..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* --- POPUP MODAL: ADD MEMBER --- */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-extrabold text-gray-900 text-base">Add New Congregation Member</h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 bg-white border border-gray-200 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Full Name</label>
                <input 
                  type="text" required placeholder="e.g. Rachel Green" value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email Address</label>
                <input 
                  type="email" required placeholder="e.g. rachel@email.com" value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Phone Number</label>
                <input 
                  type="tel" placeholder="e.g. +1 234 567 8990" value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Status</label>
                <select 
                  value={newMember.status}
                  onChange={(e) => setNewMember({ ...newMember, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all bg-gray-50/50 font-semibold text-gray-700"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsMemberModalOpen(false)} className="flex-1 py-3 border border-gray-200 text-gray-500 hover:text-gray-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL: ADD SERMON --- */}
      {isSermonModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-extrabold text-gray-900 text-base">Upload New Sermon Content</h3>
              <button onClick={() => setIsSermonModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 bg-white border border-gray-200 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddSermon} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Sermon Title</label>
                <input 
                  type="text" required placeholder="e.g. Walking in His Grace" value={newSermon.title}
                  onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Preacher / Speaker</label>
                <select 
                  value={newSermon.speaker}
                  onChange={(e) => setNewSermon({ ...newSermon, speaker: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all bg-gray-50/50 font-semibold text-gray-700"
                >
                  <option value="Pastor John">Pastor John</option>
                  <option value="Pastor Sarah">Pastor Sarah</option>
                  <option value="Pastor Michael">Pastor Michael</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Category</label>
                <select 
                  value={newSermon.category}
                  onChange={(e) => setNewSermon({ ...newSermon, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all bg-gray-50/50 font-semibold text-gray-700"
                >
                  <option value="Faith">Faith</option>
                  <option value="Inspiration">Inspiration</option>
                  <option value="Purpose">Purpose</option>
                  <option value="Prayer">Prayer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Status</label>
                <select 
                  value={newSermon.status}
                  onChange={(e) => setNewSermon({ ...newSermon, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all bg-gray-50/50 font-semibold text-gray-700"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsSermonModalOpen(false)} className="flex-1 py-3 border border-gray-200 text-gray-500 hover:text-gray-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all">
                  Publish Sermon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
