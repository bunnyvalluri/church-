"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Play, 
  Calendar, 
  MessageSquare, 
  Megaphone, 
  FileText, 
  Clock, 
  BookOpen, 
  ChevronDown, 
  Search, 
  Bell, 
  Plus, 
  X, 
  Check, 
  AlertCircle,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Heart,
  ChevronRight,
  Sparkles,
  LogOut,
  Loader2,
  Layers
} from "lucide-react";
import Image from "next/image";

// Types
interface RecentSermon {
  id: number;
  title: string;
  date: string;
  scripture: string;
  status: "Published" | "Draft";
  thumbnail: string;
}

interface MemberRequest {
  id: number;
  name: string;
  type: string;
  time: string;
  status: "New" | "Pending" | "Approved" | "Rejected";
  avatar: string;
}

interface PrayerRequest {
  id: number;
  name: string;
  request: string;
  time: string;
  priority: "Urgent" | "Medium" | "Low";
  avatar: string;
}

export default function PastorDashboardPage() {
  const { user, status, mounted, logout } = useAuth();
  const router = useRouter();

  // Navigation states
  const [activeNav, setActiveNav] = useState("Dashboard");

  // In-memory state for Pastor Portal
  const [sermons, setSermons] = useState<RecentSermon[]>([
    { id: 1, title: "Walking in Faith", date: "May 12, 2024", scripture: "Acts 3:1-10", status: "Published", thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=200&q=80" },
    { id: 2, title: "God's Plan for Your Life", date: "May 5, 2024", scripture: "Jeremiah 29:11", status: "Published", thumbnail: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=200&q=80" },
    { id: 3, title: "The Power of Prayer", date: "Apr 28, 2024", scripture: "Philippians 4:6-7", status: "Published", thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=200&q=80" },
    { id: 4, title: "He is Risen!", date: "Apr 21, 2024", scripture: "Luke 24:1-12", status: "Published", thumbnail: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&q=80" }
  ]);

  const [memberRequests, setMemberRequests] = useState<MemberRequest[]>([
    { id: 1, name: "Emily Davis", type: "Baptism Request", time: "2h ago", status: "New", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
    { id: 2, name: "Michael Brown", type: "Transfer of membership", time: "5h ago", status: "New", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" },
    { id: 3, name: "Sarah Johnson", type: "Baptism Request", time: "1d ago", status: "Pending", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
    { id: 4, name: "David Martinez", type: "Membership Reinstatement", time: "2d ago", status: "Approved", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" }
  ]);

  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([
    { id: 1, name: "John Smith", request: "Please pray for my mother's health.", time: "1h ago", priority: "Urgent", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
    { id: 2, name: "Lisa Wilson", request: "Pray for strength and guidance.", time: "3h ago", priority: "Medium", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" },
    { id: 3, name: "Robert Taylor", request: "Pray for our upcoming missions trip.", time: "5h ago", priority: "Low", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
    { id: 4, name: "Amanda White", request: "Pray for my job situation.", time: "1d ago", priority: "Medium", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" }
  ]);

  // Form modals
  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const [newSermon, setNewSermon] = useState({ title: "", scripture: "", status: "Published" as "Published" | "Draft" });
  
  // Feedback
  const [successMsg, setSuccessMsg] = useState("");

  // Route protection
  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [mounted, status, user, router]);

  // Approve member request handler
  const handleApproveRequest = (id: number) => {
    setMemberRequests(
      memberRequests.map(r => r.id === id ? { ...r, status: "Approved" } : r)
    );
    setSuccessMsg("Membership request approved successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Reject member request handler
  const handleRejectRequest = (id: number) => {
    setMemberRequests(
      memberRequests.map(r => r.id === id ? { ...r, status: "Rejected" } : r)
    );
    setSuccessMsg("Membership request has been rejected.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Add Sermon handler
  const handleAddSermon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSermon.title) return;
    const added: RecentSermon = {
      id: Date.now(),
      title: newSermon.title,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      scripture: newSermon.scripture || "Select Scripture",
      status: newSermon.status,
      thumbnail: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=200&q=80"
    };
    setSermons([added, ...sermons]);
    setNewSermon({ title: "", scripture: "", status: "Published" });
    setIsSermonModalOpen(false);
    setSuccessMsg("Sermon uploaded and shared with the congregation!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Calendar dates mock helper
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  if (!mounted || status === "loading" || (user && user.role !== "PASTOR" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#6366F1] mx-auto" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Securing Pastor Connection...</p>
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

        {/* Top Banner button */}
        <div className="px-4 pt-5">
          <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">Pastor Portal</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-7 custom-scrollbar">
          {/* MAIN MENU */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4 mb-2">MAIN</h4>
            {[
              { name: "Dashboard", icon: Layers },
              { name: "Sermons", icon: Play },
              { name: "Member Requests", icon: Users },
              { name: "Prayer Requests", icon: Heart },
              { name: "Events", icon: Calendar },
              { name: "Messages", icon: MessageSquare }
            ].map(item => (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.name)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeNav === item.name 
                    ? "bg-[#6366F1] text-white shadow-md shadow-indigo-600/10" 
                    : "hover:bg-white/5 hover:text-white text-gray-400"
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.name}
              </button>
            ))}
          </div>

          {/* MINISTRY SECTION */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4 mb-2">MINISTRY</h4>
            {[
              { name: "Bible Study Groups", icon: BookOpen },
              { name: "Small Groups", icon: Users },
              { name: "Volunteers", icon: UserCheck }
            ].map(item => (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.name)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeNav === item.name 
                    ? "bg-white/10 text-white" 
                    : "hover:bg-white/5 hover:text-white text-gray-400"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            ))}
          </div>

          {/* SETTINGS SECTION */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4 mb-2">SETTINGS</h4>
            {[
              { name: "Profile", icon: Settings },
              { name: "Church Settings", icon: Settings }
            ].map(item => (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.name)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeNav === item.name 
                    ? "bg-white/10 text-white" 
                    : "hover:bg-white/5 hover:text-white text-gray-400"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#1E203B] bg-[#0A0B16]/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full border border-gray-800 overflow-hidden relative shrink-0">
              <Image 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" 
                alt="Pastor John" 
                fill 
                sizes="40px"
                className="object-cover" 
              />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">Pastor John</h4>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Senior Pastor</p>
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
        
        {/* Main Top Header */}
        <header className="h-20 bg-white border-b border-gray-200/80 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-gray-900 leading-tight">Welcome back, Pastor John! 👋</h2>
            <p className="text-[11px] text-gray-400">Here&apos;s what&apos;s happening in your ministry today.</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Search Input */}
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search requests, sermons, logs..."
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

            {/* Add New dropdown button */}
            <button 
              onClick={() => setIsSermonModalOpen(true)}
              className="py-2 px-4.5 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/10 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              New Sermon
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8 flex-1">
          
          {successMsg && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs rounded-xl flex items-center gap-2 shadow-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Analytics Cards (5 Columns Grid) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Sermons</span>
                <h3 className="text-2xl font-black text-gray-900 leading-none">{sermons.length}</h3>
                <span className="text-[9px] font-bold text-[#6366F1] hover:underline cursor-pointer block pt-1">View all sermons →</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Play className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Member Requests</span>
                <h3 className="text-2xl font-black text-gray-900 leading-none">
                  {memberRequests.filter(r => r.status === "New").length}
                </h3>
                <span className="text-[9px] font-bold text-emerald-500 block pt-1">New this week ▲</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Prayer Requests</span>
                <h3 className="text-2xl font-black text-gray-900 leading-none">{prayerRequests.length}</h3>
                <span className="text-[9px] font-bold text-emerald-500 block pt-1">New this week ▲</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Heart className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Upcoming Events</span>
                <h3 className="text-2xl font-black text-gray-900 leading-none">6</h3>
                <span className="text-[9px] font-bold text-gray-400 block pt-1">Next 30 days</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Members</span>
                <h3 className="text-2xl font-black text-gray-900 leading-none">1,248</h3>
                <span className="text-[9px] font-bold text-[#6366F1] hover:underline cursor-pointer block pt-1">View all members →</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="w-4.5 h-4.5" />
              </div>
            </div>

          </section>

          {/* Middle Row (3 Columns Grid) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1: RECENT SERMONS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pastor Tools</h3>
                  <h2 className="text-base font-extrabold text-[#0F172A]">Recent Sermons</h2>
                </div>
                <button className="text-xs font-bold text-[#6366F1] hover:underline">View All</button>
              </div>

              {/* Sermons List */}
              <div className="p-6 py-4 space-y-4 flex-1">
                {sermons.map(sermon => (
                  <div key={sermon.id} className="flex items-center gap-3">
                    <div className="w-16 h-10 rounded-lg overflow-hidden relative shrink-0 border border-gray-100">
                      <Image src={sermon.thumbnail} alt={sermon.title} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate leading-snug">{sermon.title}</h4>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{sermon.date} • {sermon.scripture}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-50 text-[#10B981] border border-emerald-100 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        {sermon.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 pt-0">
                <button 
                  onClick={() => setIsSermonModalOpen(true)}
                  className="w-full py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Upload New Sermon
                </button>
              </div>
            </div>

            {/* COLUMN 2: MEMBER REQUESTS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Administration</h3>
                  <h2 className="text-base font-extrabold text-[#0F172A]">Member Requests</h2>
                </div>
                <button className="text-xs font-bold text-[#6366F1] hover:underline">View All</button>
              </div>

              {/* Requests List */}
              <div className="p-6 py-4 space-y-4.5 flex-1">
                {memberRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0 border border-gray-100">
                        <Image src={req.avatar} alt={req.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-gray-900 truncate leading-snug">{req.name}</h4>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{req.type} • {req.time}</p>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex items-center gap-1.5">
                      {req.status === "New" ? (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleApproveRequest(req.id)}
                            className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-lg transition-colors"
                            title="Approve Member"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(req.id)}
                            className="p-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors"
                            title="Reject Request"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          req.status === "Approved" 
                            ? "bg-emerald-50 text-emerald-500 border border-emerald-150" 
                            : "bg-red-50 text-red-500 border border-red-150"
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 pt-0">
                <button className="w-full py-3 border border-gray-200 text-gray-500 hover:text-gray-900 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
                  View All Requests
                </button>
              </div>
            </div>

            {/* COLUMN 3: PRAYER REQUESTS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Congregation Feeds</h3>
                  <h2 className="text-base font-extrabold text-[#0F172A]">Prayer Requests</h2>
                </div>
                <button className="text-xs font-bold text-[#6366F1] hover:underline">View All</button>
              </div>

              {/* Prayers List */}
              <div className="p-6 py-4 space-y-4 flex-1">
                {prayerRequests.map(prayer => (
                  <div key={prayer.id} className="flex items-start gap-3 justify-between">
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl overflow-hidden relative shrink-0 border border-gray-100 mt-0.5">
                        <Image src={prayer.avatar} alt={prayer.name} fill sizes="36px" className="object-cover" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-gray-900 leading-snug">{prayer.name}</h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5 line-clamp-1">{prayer.request}</p>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[9px] text-gray-450">{prayer.time}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                        prayer.priority === "Urgent" 
                          ? "bg-red-50 text-red-500 border border-red-100" 
                          : prayer.priority === "Medium"
                          ? "bg-amber-50 text-amber-500 border border-amber-100"
                          : "bg-blue-50 text-blue-500 border border-blue-100"
                      }`}>
                        {prayer.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 pt-0">
                <button className="w-full py-3 border border-gray-200 text-gray-500 hover:text-gray-900 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
                  View All Prayers
                </button>
              </div>
            </div>

          </section>

          {/* Bottom Grid: Events, Calendar & Quick Actions */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* UPCOMING EVENTS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Worship & Ministry</h3>
                  <h2 className="text-base font-extrabold text-[#0F172A]">Upcoming Events</h2>
                </div>
                <button className="text-xs font-bold text-[#6366F1] hover:underline">View Calendar</button>
              </div>

              {/* Events List */}
              <div className="p-6 py-4 space-y-4 flex-1">
                {[
                  { title: "Sunday Worship Service", date: "May 12, 2024", time: "10:00 AM", attending: "156 Attending", month: "MAY", day: "12" },
                  { title: "Midweek Bible Study", date: "May 22, 2024", time: "7:00 PM", attending: "45 Attending", month: "MAY", day: "22" },
                  { title: "Youth Fellowship", date: "May 25, 2024", time: "5:00 PM", attending: "32 Attending", month: "MAY", day: "25" },
                  { title: "Community Outreach", date: "May 28, 2024", time: "9:00 AM", attending: "28 Attending", month: "MAY", day: "28" }
                ].map((ev, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Date Block */}
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-[#6366F1] leading-none uppercase">{ev.month}</span>
                        <span className="text-xs font-extrabold text-gray-900 leading-none mt-0.5">{ev.day}</span>
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-gray-905 truncate leading-snug">{ev.title}</h4>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{ev.time} • {ev.attending}</p>
                      </div>
                    </div>
                    <button className="py-1 px-3 border border-gray-150 hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold shrink-0">
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* MINISTRY CALENDAR */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Church Timeline</h3>
                  <h2 className="text-base font-extrabold text-[#0F172A]">Ministry Calendar</h2>
                </div>
                <span className="text-xs font-bold text-gray-500">May 2024</span>
              </div>

              {/* Calendar grid widget */}
              <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty blocks before start (Wednesday start) */}
                  <span className="aspect-square" />
                  <span className="aspect-square" />
                  <span className="aspect-square" />

                  {/* Calendar Days grid */}
                  {calendarDays.map(day => (
                    <div 
                      key={day} 
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold relative cursor-pointer border ${
                        day === 12 
                          ? "bg-[#6366F1] text-white border-transparent shadow-sm" 
                          : day === 22 || day === 25 || day === 28
                          ? "bg-indigo-50/70 text-[#6366F1] border-indigo-100"
                          : "hover:bg-gray-50 border-transparent text-gray-700"
                      }`}
                    >
                      {day}
                      {/* dot markers for events */}
                      {(day === 12 || day === 22 || day === 25 || day === 28) && (
                        <span className={`absolute bottom-1 w-1 h-1 rounded-full ${day === 12 ? "bg-white" : "bg-[#6366F1]"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-6 pb-4 border-b border-gray-100">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Operations</h3>
                <h2 className="text-base font-extrabold text-[#0F172A]">Quick Actions</h2>
              </div>
              
              <div className="p-6 py-5 flex-1 space-y-3.5">
                {[
                  { label: "Upload New Sermon", sub: "Share God's Word", icon: Play, color: "bg-purple-50 text-purple-600 border-purple-100", act: () => setIsSermonModalOpen(true) },
                  { label: "Add New Event", sub: "Create church event", icon: Calendar, color: "bg-emerald-50 text-emerald-600 border-emerald-100", act: () => {} },
                  { label: "New Announcement", sub: "Send to all members", icon: Megaphone, color: "bg-amber-50 text-amber-600 border-amber-100", act: () => {} },
                  { label: "Message Members", sub: "Send a message", icon: MessageSquare, color: "bg-blue-50 text-blue-600 border-blue-100", act: () => {} },
                  { label: "View Reports", sub: "Ministry insights", icon: FileText, color: "bg-pink-50 text-pink-600 border-pink-100", act: () => {} }
                ].map((act, idx) => (
                  <button 
                    key={idx}
                    onClick={act.act}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-indigo-50/40 border border-gray-100 hover:border-indigo-100 rounded-2xl transition-all text-left group"
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <div className={`w-9 h-9 rounded-xl ${act.color} flex items-center justify-center shrink-0 border`}>
                        <act.icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-gray-700 group-hover:text-[#6366F1] transition-colors block">{act.label}</span>
                        <span className="text-[9px] text-gray-400 block">{act.sub}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

          </section>

        </div>
      </main>

      {/* --- POPUP MODAL: UPLOAD SERMON --- */}
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
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Scripture Reference</label>
                <input 
                  type="text" placeholder="e.g. John 3:16" value={newSermon.scripture}
                  onChange={(e) => setNewSermon({ ...newSermon, scripture: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all bg-gray-50/50"
                />
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
