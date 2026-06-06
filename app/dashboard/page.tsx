"use client";

import React, { useState } from "react";
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
  Sparkles
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

export default function GraceDashboard() {
  // Navigation active states
  const [activeNav, setActiveNav] = useState("Dashboard");
  
  // Tab states for Content Management
  const [activeTab, setActiveTab] = useState<"Sermons" | "Events" | "Announcements" | "Pages">("Sermons");

  // Interactive member list state
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "James Wilson", email: "james.wilson@email.com", phone: "+1 234 567 8901", status: "Active", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
    { id: 2, name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 234 567 8902", status: "Active", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
    { id: 3, name: "Michael Brown", email: "michael.b@email.com", phone: "+1 234 567 8903", status: "Active", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" },
    { id: 4, name: "Emily Davis", email: "emily.d@email.com", phone: "+1 234 567 8904", status: "Pending", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
    { id: 5, name: "David Martinez", email: "david.m@email.com", phone: "+1 234 567 8905", status: "Active", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80" }
  ]);

  // Interactive sermon list state
  const [sermons, setSermons] = useState<Sermon[]>([
    { id: 1, title: "Faith in Difficult Times", speaker: "Pastor John", date: "May 18, 2024", category: "Faith", status: "Published", views: 245, thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=200&q=80" },
    { id: 2, title: "God's Plan for Your Life", speaker: "Pastor John", date: "May 11, 2024", category: "Inspiration", status: "Published", views: 312, thumbnail: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=200&q=80" },
    { id: 3, title: "Walking in Purpose", speaker: "Pastor Sarah", date: "May 4, 2024", category: "Purpose", status: "Published", views: 189, thumbnail: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&q=80" },
    { id: 4, title: "The Power of Prayer", speaker: "Pastor Michael", date: "Apr 27, 2024", category: "Prayer", status: "Draft", views: 0, thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=200&q=80" }
  ]);

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);

  // Form states
  const [newMember, setNewMember] = useState({ name: "", email: "", phone: "", status: "Active" as "Active" | "Pending" });
  const [newSermon, setNewSermon] = useState({ title: "", speaker: "Pastor John", category: "Faith", status: "Published" as "Published" | "Draft" });

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
  };

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
  };

  const handleDeleteSermon = (id: number) => {
    setSermons(sermons.filter(s => s.id !== id));
  };

  const handleDeleteMember = (id: number) => {
    setMembers(members.filter(m => m.id !== id));
  };

  // Filtered lists based on search
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSermons = sermons.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#1E293B] font-sans antialiased">
      
      {/* 1. Left Sidebar Navigation (Dark Mode Theme) */}
      <aside className="w-64 bg-[#0F1021] text-gray-300 flex flex-col shrink-0 border-r border-[#1E203B] relative z-20">
        {/* Header/Logo */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[#1E203B]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/30">
            ✝
          </div>
          <span className="font-extrabold text-white text-base tracking-tight whitespace-nowrap">
            Grace Community Church
          </span>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-7 custom-scrollbar">
          {/* Main Dashboard item */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveNav("Dashboard")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeNav === "Dashboard" 
                  ? "bg-[#6366F1] text-white shadow-lg shadow-indigo-600/30" 
                  : "hover:bg-white/5 hover:text-white"
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
              {[
                { name: "Members", icon: Users },
                { name: "Member Groups", icon: Users },
                { name: "Prayer Requests", icon: MessageSquare },
                { name: "Family Management", icon: Home }
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeNav === item.name 
                      ? "bg-white/10 text-white" 
                      : "hover:bg-white/5 hover:text-white text-gray-400"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* FINANCE SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4">FINANCE</h4>
            <div className="space-y-1">
              {[
                { name: "Donations", icon: DollarSign },
                { name: "Pledges", icon: Heart },
                { name: "Transactions", icon: CreditCard },
                { name: "Accounts", icon: Layers }
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeNav === item.name 
                      ? "bg-white/10 text-white" 
                      : "hover:bg-white/5 hover:text-white text-gray-400"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* ATTENDANCE SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4">ATTENDANCE</h4>
            <div className="space-y-1">
              {[
                { name: "Attendance Records", icon: BarChart2 },
                { name: "Event Attendance", icon: CheckSquare },
                { name: "Reports", icon: FileText }
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeNav === item.name 
                      ? "bg-white/10 text-white" 
                      : "hover:bg-white/5 hover:text-white text-gray-400"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4">CONTENT</h4>
            <div className="space-y-1">
              {[
                { name: "Sermons", icon: Play },
                { name: "Events", icon: Calendar },
                { name: "Announcements", icon: Megaphone },
                { name: "Media Library", icon: ImageIcon },
                { name: "Pages", icon: FileText }
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeNav === item.name 
                      ? "bg-white/10 text-white" 
                      : "hover:bg-white/5 hover:text-white text-gray-400"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* SETTINGS SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4">SETTINGS</h4>
            <div className="space-y-1">
              {[
                { name: "Settings", icon: Settings },
                { name: "Users & Roles", icon: Shield }
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeNav === item.name 
                      ? "bg-white/10 text-white" 
                      : "hover:bg-white/5 hover:text-white text-gray-400"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Profile Footer */}
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
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
          <button className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen custom-scrollbar">
        
        {/* Main Top Header */}
        <header className="h-20 bg-white border-b border-gray-200/80 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Search Input */}
            <div className="relative w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search database, sermons, finance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all"
              />
            </div>

            {/* Notification Icon */}
            <div className="relative">
              <button className="p-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors relative">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#6366F1] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                  5
                </span>
              </button>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200/80 rounded-xl text-xs font-semibold text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>May 12 – May 18, 2024</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </div>
          </div>
        </header>

        {/* Grid Content wrapper */}
        <div className="p-8 space-y-8 flex-1">

          {/* 2. Main Top Metric Cards (5 Columns Grid) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Metric 1 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="space-y-1.5 z-10">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Members</span>
                <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">1,248</h3>
                <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-1">
                  ▲ +12 this week
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="space-y-1.5 z-10">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Donations</span>
                <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">$24,560</h3>
                <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-1">
                  ▲ +18.6% this week
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0 shadow-sm">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="space-y-1.5 z-10">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Attendance (Weekly)</span>
                <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">856</h3>
                <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-1">
                  ▲ +8.3% this week
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center shrink-0 shadow-sm">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="space-y-1.5 z-10">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Events</span>
                <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">7</h3>
                <span className="text-[10px] font-bold text-gray-400">
                  Upcoming events
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center shrink-0 shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 5 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="space-y-1.5 z-10">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">New Members</span>
                <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">24</h3>
                <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-1">
                  ▲ +20% this week
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center shrink-0 shadow-sm">
                <UserPlus className="w-5 h-5" />
              </div>
            </div>

          </section>

          {/* 3. Middle Grid Section (3 Columns Layout) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1: MEMBER MANAGEMENT */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Member Management</h3>
                  <h2 className="text-base font-extrabold text-[#0F172A]">Recent Members</h2>
                </div>
                <button className="text-xs font-bold text-[#6366F1] hover:underline">View All</button>
              </div>

              {/* Members List */}
              <div className="p-6 py-4 space-y-4.5 flex-1">
                {filteredMembers.slice(0, 5).map(member => (
                  <div key={member.id} className="flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0 border border-gray-100">
                        <Image src={member.avatar} alt={member.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#6366F1] transition-colors">{member.name}</h4>
                        <p className="text-[11px] text-gray-400 truncate">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-400 hidden xl:inline">{member.phone}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        member.status === "Active" 
                          ? "bg-emerald-50 text-[#10B981] border border-emerald-100" 
                          : "bg-amber-50 text-[#F59E0B] border border-amber-100"
                      }`}>
                        {member.status}
                      </span>
                      {/* Interactive Delete helper */}
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors"
                        title="Delete member"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-400">No members found.</div>
                )}
              </div>

              <div className="p-6 pt-0">
                <button 
                  onClick={() => setIsMemberModalOpen(true)}
                  className="w-full py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/10"
                >
                  <Plus className="w-4 h-4" />
                  Add New Member
                </button>
              </div>
            </div>

            {/* COLUMN 2: DONATION TRACKING */}
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

              {/* Chart & Stats */}
              <div className="p-6 py-4 flex-1 flex flex-col justify-between">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-extrabold text-[#0F172A] tracking-tight">$24,560</span>
                  <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-0.5">
                    ▲ 18.6% from last month
                  </span>
                </div>

                {/* SVG Line Chart (High-fidelity design) */}
                <div className="h-28 w-full relative mb-5">
                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="300" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="80" x2="300" y2="80" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />

                    {/* Gradient Area */}
                    <path 
                      d="M 0 90 Q 50 80 75 60 T 150 40 T 225 65 T 300 15 L 300 100 L 0 100 Z" 
                      fill="url(#chartGrad)" 
                    />
                    {/* Stroke Line */}
                    <path 
                      d="M 0 90 Q 50 80 75 60 T 150 40 T 225 65 T 300 15" 
                      fill="none" 
                      stroke="#10B981" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />
                    {/* Glowing dots */}
                    <circle cx="300" cy="15" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" className="animate-pulse" />
                  </svg>
                  <div className="absolute top-0 right-0 text-[8px] font-bold text-gray-400 uppercase">$15k</div>
                  <div className="absolute top-[35px] right-0 text-[8px] font-bold text-gray-400 uppercase">$10k</div>
                  <div className="absolute top-[70px] right-0 text-[8px] font-bold text-gray-400 uppercase">$5k</div>
                  
                  <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-1 px-1">
                    <span>May 1</span>
                    <span>May 6</span>
                    <span>May 11</span>
                    <span>May 16</span>
                  </div>
                </div>

                {/* Recent Donations List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recent Donations</span>
                    <button className="text-[10px] font-bold text-[#6366F1] hover:underline">View All</button>
                  </div>
                  
                  <div className="space-y-2.5">
                    {[
                      { name: "John Doe", date: "May 18, 2024", amount: "$200.00", fund: "Tithe" },
                      { name: "Anonymous", date: "May 18, 2024", amount: "$150.00", fund: "Offering" },
                      { name: "Mary Smith", date: "May 17, 2024", amount: "$500.00", fund: "Building Fund" },
                      { name: "David Wilson", date: "May 17, 2024", amount: "$100.00", fund: "Tithe" },
                      { name: "Sarah Johnson", date: "May 16, 2024", amount: "$250.00", fund: "Missions" }
                    ].map((don, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                        <div className="overflow-hidden mr-2">
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
              </div>

              <div className="p-6 pt-0">
                <button className="w-full py-3 bg-[#10B981] hover:bg-[#0F9F6E] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10">
                  View All Donations
                </button>
              </div>
            </div>

            {/* COLUMN 3: ATTENDANCE RECORDS */}
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

              {/* Attendance Chart & Summary */}
              <div className="p-6 py-4 flex-1 flex flex-col justify-between">
                
                {/* Bar chart displaying weekly stats */}
                <div className="h-32 flex items-end justify-between gap-2.5 px-2 relative mb-6">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-gray-100">
                    <div className="w-full border-t border-gray-100 border-dashed" />
                    <div className="w-full border-t border-gray-100 border-dashed" />
                    <div className="w-full border-t border-gray-100 border-dashed" />
                  </div>

                  {/* Y-axis Labels */}
                  <div className="absolute top-0 left-0 text-[8px] font-bold text-gray-400">300</div>
                  <div className="absolute top-[35px] left-0 text-[8px] font-bold text-gray-400">200</div>
                  <div className="absolute top-[70px] left-0 text-[8px] font-bold text-gray-400">100</div>

                  {/* Bars */}
                  {[
                    { day: "Mon", val: 80, height: "h-[30%]" },
                    { day: "Tue", val: 120, height: "h-[45%]" },
                    { day: "Wed", val: 150, height: "h-[55%]" },
                    { day: "Thu", val: 90, height: "h-[35%]" },
                    { day: "Fri", val: 110, height: "h-[40%]" },
                    { day: "Sat", val: 0, height: "h-[0%]" },
                    { day: "Sun", val: 260, height: "h-[85%]" }
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative z-10">
                      <div className="text-[8px] font-bold text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">{bar.val}</div>
                      <div className={`w-full bg-[#6366F1]/15 group-hover:bg-[#6366F1]/30 rounded-t-lg transition-colors flex items-end overflow-hidden ${bar.height} min-h-[4px]`}>
                        <div className="w-full bg-[#6366F1] rounded-t-lg" style={{ height: "100%" }} />
                      </div>
                      <span className="text-[9px] font-bold text-gray-400">{bar.day}</span>
                    </div>
                  ))}
                </div>

                {/* Metrics Summary List */}
                <div className="space-y-3">
                  <div className="border-b border-gray-50 pb-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attendance Summary</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {[
                      { label: "Total Attendance", val: "856", highlight: false },
                      { label: "Average Daily", val: "122", highlight: false },
                      { label: "Highest Day", val: "Sunday", highlight: true },
                      { label: "New Visitors", val: "25", highlight: false },
                      { label: "Returning Visitors", val: "488", highlight: false }
                    ].map((stat, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-500">{stat.label}</span>
                        <span className={`font-bold ${stat.highlight ? "text-[#6366F1]" : "text-gray-900"}`}>{stat.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="p-6 pt-0">
                <button className="w-full py-3 bg-[#6366F1]/10 hover:bg-[#6366F1]/15 text-[#6366F1] rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5">
                  View Full Report
                </button>
              </div>
            </div>

          </section>

          {/* 4. Bottom Section: Content Management Table & Quick Actions */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CONTENT MANAGEMENT (2 Columns Span) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-6 pb-2 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Content Management</h3>
                  
                  {/* Tabs */}
                  <div className="flex gap-6 mt-4">
                    {["Sermons", "Events", "Announcements", "Pages"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-3 text-xs font-bold transition-all relative ${
                          activeTab === tab 
                            ? "text-[#6366F1]" 
                            : "text-gray-400 hover:text-gray-700"
                        }`}
                      >
                        {tab}
                        {activeTab === tab && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#6366F1] rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  {activeTab === "Sermons" && (
                    <button 
                      onClick={() => setIsSermonModalOpen(true)}
                      className="py-2.5 px-4.5 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Sermon
                    </button>
                  )}
                </div>
              </div>

              {/* Table Area */}
              <div className="flex-1 overflow-x-auto">
                {activeTab === "Sermons" ? (
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
                            <div className="w-12 h-8.5 rounded-lg overflow-hidden relative shrink-0 border border-gray-100 shadow-sm">
                              <Image src={sermon.thumbnail} alt={sermon.title} fill sizes="48px" className="object-cover" />
                            </div>
                            <span className="font-extrabold text-[#0F172A] truncate max-w-[180px]">{sermon.title}</span>
                          </td>
                          <td className="py-4 px-6 text-gray-500">{sermon.speaker}</td>
                          <td className="py-4 px-6 text-gray-400">{sermon.date}</td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold">
                              {sermon.category}
                            </span>
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
                            <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" title="View sermon">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" title="Edit sermon">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSermon(sermon.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                              title="Delete sermon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredSermons.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-xs text-gray-400">No sermons found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                    <Sparkles className="w-8 h-8 text-indigo-300 animate-pulse" />
                    <span>{activeTab} Management content database will load here dynamically in production.</span>
                  </div>
                )}
              </div>
            </div>

            {/* 5. RIGHT SIDEBAR PANEL: QUICK ACTIONS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-6 pb-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Church Operations</h3>
                <h2 className="text-base font-extrabold text-[#0F172A]">Quick Actions</h2>
              </div>

              {/* Actions list buttons */}
              <div className="p-6 py-5 flex-1 space-y-3.5">
                
                {/* Action 1 */}
                <button 
                  onClick={() => setIsMemberModalOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-indigo-50/50 border border-gray-100 hover:border-indigo-100 rounded-2xl transition-all text-left group"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0">
                      <UserPlus className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-[#6366F1] transition-colors">Add New Member</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Action 2 */}
                <button className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-emerald-50/50 border border-gray-100 hover:border-emerald-100 rounded-2xl transition-all text-left group">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                      <DollarSign className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-[#10B981] transition-colors">Record Donation</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Action 3 */}
                <button className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-blue-50/50 border border-gray-100 hover:border-blue-100 rounded-2xl transition-all text-left group">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center shrink-0">
                      <UserCheck className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-[#3B82F6] transition-colors">Mark Attendance</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Action 4 */}
                <button className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-amber-50/50 border border-gray-100 hover:border-amber-100 rounded-2xl transition-all text-left group">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center shrink-0">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-[#F59E0B] transition-colors">Create Event</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Action 5 */}
                <button className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-pink-50/50 border border-gray-100 hover:border-pink-100 rounded-2xl transition-all text-left group">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center shrink-0">
                      <Megaphone className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-[#EC4899] transition-colors">Add Announcement</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                </button>

              </div>
            </div>

          </section>

        </div>
      </main>

      {/* --- POPUP MODAL: ADD MEMBER --- */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-extrabold text-gray-900 text-base">Add New Congregation Member</h3>
              <button 
                onClick={() => setIsMemberModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 bg-white border border-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rachel Green"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. rachel@email.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. +1 234 567 8990"
                  value={newMember.phone}
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
                <button 
                  type="button" 
                  onClick={() => setIsMemberModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 hover:text-gray-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
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
              <button 
                onClick={() => setIsSermonModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 bg-white border border-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddSermon} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Sermon Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Walking in His Grace"
                  value={newSermon.title}
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
                  <option value="Salvation">Salvation</option>
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
                <button 
                  type="button" 
                  onClick={() => setIsSermonModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 hover:text-gray-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
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
