"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Heart,
  Coffee,
  BookOpen,
  Calendar,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  X,
  CheckCircle2,
  Send,
  PlusCircle,
  MessageSquare,
  UserCheck,
  ChevronRight
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";

export default function SmallGroupsPage() {
  const { t } = useLanguage();
  const sg = t?.pages?.smallGroups || {};

  // Interactive filter & search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDay, setSelectedDay] = useState("All");

  // Modal states
  const [activeModalGroup, setActiveModalGroup] = useState<any | null>(null);
  const [isJoinSuccess, setIsJoinSuccess] = useState(false);
  const [joinForm, setJoinForm] = useState({ name: "", email: "", phone: "", message: "" });

  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [isLeaderSuccess, setIsLeaderSuccess] = useState(false);
  const [leaderForm, setLeaderForm] = useState({ name: "", email: "", phone: "", groupIdea: "" });

  const categories = ["All", "Young Adults", "Women", "Men", "Couples", "Bible Study", "Prayer"];
  const days = ["All", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

  const groups = [
    {
      id: "young-adults",
      title: sg.youngAdults || "Young Adults Fellowship",
      category: "Young Adults",
      day: "Fridays",
      description: sg.youngAdultsDesc || "A vibrant community for ages 18-30 to grow in faith, share real talks, and navigate life together.",
      time: "Fridays at 7:00 PM",
      location: "Fellowship Hall (Shapur)",
      format: "In-Person",
      leader: "Daniel & Team",
      members: "18 Members",
      icon: Users,
    },
    {
      id: "women-fellowship",
      title: sg.women || "Women's Grace Fellowship",
      category: "Women",
      day: "Wednesdays",
      description: sg.womenDesc || "Empowering women to walk in their God-given identity and purpose through prayer, study, and encouragement.",
      time: "Wednesdays at 10:00 AM",
      location: "Room 204 (Subhash Nagar)",
      format: "In-Person",
      leader: "Sister Mary & Hannah",
      members: "24 Members",
      icon: Heart,
    },
    {
      id: "mens-ministry",
      title: sg.men || "Men of Integrity",
      category: "Men",
      day: "Saturdays",
      description: sg.menDesc || "Equipping and strengthening men to lead faithfully in their homes, church, careers, and community.",
      time: "Saturdays at 7:00 AM",
      location: "Main Sanctuary",
      format: "In-Person",
      leader: "Brother Joseph & Mark",
      members: "20 Members",
      icon: ShieldCheck,
    },
    {
      id: "couples-connection",
      title: sg.couples || "Couples Connection",
      category: "Couples",
      day: "Saturdays",
      description: sg.couplesDesc || "Building Christ-centered marriages through biblically grounded principles, dates, and supportive fellowship.",
      time: "Monthly, 2nd Saturday at 6:00 PM",
      location: "Family Center / Rotational",
      format: "Hybrid",
      leader: "Pastor David & Grace",
      members: "15 Couples",
      icon: Sparkles,
    },
    {
      id: "midweek-bible-study",
      title: sg.bibleStudy || "Midweek Verse-by-Verse",
      category: "Bible Study",
      day: "Thursdays",
      description: sg.bibleStudyDesc || "Interactive verse-by-verse scripture exploration with engaging discussion and practical application.",
      time: "Thursdays at 6:30 PM",
      location: "Online (Zoom)",
      format: "Online",
      leader: "Pastor Kurra & Elders",
      members: "45 Online",
      icon: BookOpen,
    },
    {
      id: "prayer-warriors",
      title: sg.prayer || "Morning Prayer Warriors",
      category: "Prayer",
      day: "Tuesdays",
      description: sg.prayerDesc || "Dedicated time of intercessory prayer and spiritual warfare standing in the gap for our church and world.",
      time: "Tuesdays at 6:00 AM",
      location: "Prayer Room & Zoom",
      format: "Hybrid",
      leader: "KCM Prayer Ministry",
      members: "30 Members",
      icon: Coffee,
    },
  ];

  // Filter logic
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesSearch =
        group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "All" || group.category === selectedCategory;
      const matchesDay = selectedDay === "All" || group.day === selectedDay;

      return matchesSearch && matchesCategory && matchesDay;
    });
  }, [searchQuery, selectedCategory, selectedDay]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoinSuccess(true);
    setTimeout(() => {
      setIsJoinSuccess(false);
      setActiveModalGroup(null);
      setJoinForm({ name: "", email: "", phone: "", message: "" });
    }, 2500);
  };

  const handleLeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLeaderSuccess(true);
    setTimeout(() => {
      setIsLeaderSuccess(false);
      setIsLeaderModalOpen(false);
      setLeaderForm({ name: "", email: "", phone: "", groupIdea: "" });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-purple-500 selection:text-white">
      {/* 🧭 Global Navigation Bar */}
      <Navbar />

      {/* 🌌 Hero Section - Clean Deep Slate with Subtle Purple Orbs */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-slate-950 text-white overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Back to Home Button */}
            <div className="mb-6 flex justify-center">
              <BackToHome label={t?.nav?.home || "Home"} />
            </div>

            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-purple-200 text-xs sm:text-sm font-medium mb-6 shadow-md">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Life is Better Together • Connect & Grow</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 font-serif text-white">
              {sg.title || "Small Groups"}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              {sg.subtitle || "Connect with believers, share faith journeys, and build lifelong friendships in a welcoming home group."}
            </p>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-slate-800">
              <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-800">
                <div className="text-2xl font-bold text-white">6+</div>
                <div className="text-xs text-slate-400">Active Groups</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-800">
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-xs text-slate-400">Group Members</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-800">
                <div className="text-2xl font-bold text-white">3</div>
                <div className="text-xs text-slate-400">Hub Locations</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-800">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-400">Welcome</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💡 Why Join Section */}
      <section className="py-16 md:py-24 relative z-10 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-serif">
              {sg.whyTitle || "Why Join a Small Group?"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed font-light">
              {sg.whyDesc || "We were created for community. Small groups are where genuine friendships form, spiritual growth happens, and support is found."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-serif">
                {sg.connectTitle || "Genuine Connection"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {sg.connectDesc || "Build authentic relationships with people who share your values and support you in everyday life."}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-serif">
                {sg.growTitle || "Spiritual Growth"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {sg.growDesc || "Deepen your understanding of God's Word in an open, conversational, and encouraging setting."}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-6">
                <Coffee className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-serif">
                {sg.supportTitle || "Prayer & Care"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {sg.supportDesc || "Walk through life's celebrations and trials together with a caring family of faith."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🔍 Group Directory Section */}
      <section className="py-16 md:py-24 bg-slate-100/70 dark:bg-slate-900/50 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 font-serif">
                {sg.find || "Find Your Group"}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                Explore our groups by category, meeting day, or format.
              </p>
            </div>

            {/* Live Search Bar */}
            <div className="relative min-w-[280px] sm:min-w-[340px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search groups, topics, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6 pb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/20"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Day Filter Sub-row */}
          <div className="flex items-center gap-2 mb-10 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider mr-1">Day:</span>
            {days.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedDay === d
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold"
                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Group Cards Grid */}
          {filteredGroups.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGroups.map((group) => {
                const IconComponent = group.icon;
                return (
                  <div
                    key={group.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
                  >
                    {/* Header Banner - Elegant Deep Slate Accent */}
                    <div className="bg-slate-900 dark:bg-slate-900 p-6 text-white border-b border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[11px] font-semibold uppercase tracking-wider mb-2">
                          {group.category}
                        </span>
                        <h3 className="text-xl font-bold font-serif text-white leading-tight">
                          {group.title}
                        </h3>
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                        <IconComponent className="w-5 h-5 text-purple-300" />
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-2 mb-4 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                          {group.format}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                          {group.members}
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 flex-1">
                        {group.description}
                      </p>

                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 mb-6">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">{group.time}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>{group.location}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>Led by: <strong className="text-slate-800 dark:text-slate-200">{group.leader}</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveModalGroup(group)}
                        className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-98"
                      >
                        <span>Join This Group</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <div className="w-14 h-14 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No groups match your filters</h3>
              <p className="text-slate-500 text-sm mb-6">Try clearing your search query or selecting a different category.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDay("All");
                }}
                className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition-colors shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 🚀 Start a Group Section - Deep Slate CTA Box */}
      <section className="py-20 relative z-10 bg-slate-950 text-white border-t border-slate-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center mx-auto mb-6">
              <PlusCircle className="w-7 h-7" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 font-serif text-white">
              {sg.startTitle || "Interested in Leading a Small Group?"}
            </h2>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              {sg.startDesc || "We provide training, study materials, and ongoing coaching to help you facilitate a thriving community group."}
            </p>

            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10 text-left">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <div className="text-purple-400 text-xs font-bold uppercase mb-1">Step 1</div>
                <div className="font-semibold text-sm text-white">Express Interest</div>
                <div className="text-xs text-slate-400">Submit a quick leader form</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <div className="text-purple-400 text-xs font-bold uppercase mb-1">Step 2</div>
                <div className="font-semibold text-sm text-white">Orientation</div>
                <div className="text-xs text-slate-400">Receive study guides & support</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <div className="text-purple-400 text-xs font-bold uppercase mb-1">Step 3</div>
                <div className="font-semibold text-sm text-white">Launch Your Group</div>
                <div className="text-xs text-slate-400">Gather friends & neighbors</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setIsLeaderModalOpen(true)}
                className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>{sg.becomeLeader || "Apply to Lead a Group"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/#contact"
                className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Leaders</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🦶 Global Footer */}
      <Footer />

      {/* 📥 Join Group Modal */}
      {activeModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 bg-slate-950 text-white relative border-b border-slate-800">
              <button
                onClick={() => setActiveModalGroup(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs uppercase font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 mb-2 inline-block">
                Sign Up
              </span>
              <h3 className="text-2xl font-bold font-serif text-white">{activeModalGroup.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{activeModalGroup.time} • {activeModalGroup.location}</p>
            </div>

            <div className="p-6 text-slate-900 dark:text-slate-100">
              {isJoinSuccess ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Received!</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Thank you, {joinForm.name || "friend"}! Group leader <strong>{activeModalGroup.leader}</strong> will contact you with meeting details.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={joinForm.name}
                      onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={joinForm.email}
                        onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={joinForm.phone}
                        onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Any questions or prayer requests? (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="I'd love to know more about..."
                      value={joinForm.message}
                      onChange={(e) => setJoinForm({ ...joinForm, message: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Interest</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 👥 Leader Application Modal */}
      {isLeaderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 bg-slate-950 text-white relative border-b border-slate-800">
              <button
                onClick={() => setIsLeaderModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold font-serif text-white">Group Leadership Application</h3>
              <p className="text-xs text-slate-400 mt-1">Start a new small group or co-lead an existing group.</p>
            </div>

            <div className="p-6 text-slate-900 dark:text-slate-100">
              {isLeaderSuccess ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Application Submitted!</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Thank you for stepping up to serve! Our Discipleship Team will reach out to you within 48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeaderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Connor"
                      value={leaderForm.name}
                      onChange={(e) => setLeaderForm({ ...leaderForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sarah@example.com"
                        value={leaderForm.email}
                        onChange={(e) => setLeaderForm({ ...leaderForm, email: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={leaderForm.phone}
                        onChange={(e) => setLeaderForm({ ...leaderForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      What type of group would you like to lead/start?
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Young Couples Study, College Bible Study, Neighborhood Prayer Group..."
                      value={leaderForm.groupIdea}
                      onChange={(e) => setLeaderForm({ ...leaderForm, groupIdea: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Application</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


