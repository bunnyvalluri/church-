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
  Check,
  UserCheck,
  ChevronRight,
  Sparkle
} from "lucide-react";

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
      gradient: "from-purple-600 via-indigo-600 to-violet-700",
      accentBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
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
      gradient: "from-pink-500 via-rose-500 to-purple-600",
      accentBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
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
      gradient: "from-blue-600 via-indigo-600 to-purple-700",
      accentBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
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
      gradient: "from-amber-500 via-rose-500 to-purple-600",
      accentBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
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
      gradient: "from-emerald-500 via-teal-600 to-indigo-600",
      accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
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
      gradient: "from-violet-600 via-purple-600 to-pink-600",
      accentBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/20 text-gray-900 dark:text-gray-100 selection:bg-purple-500 selection:text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 text-white overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Pill Tag Header */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-purple-200 text-xs sm:text-sm font-medium mb-6 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
              <span>Life is Better Together • Connect & Grow</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 font-serif bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-indigo-200 leading-tight">
              {sg.title || "Small Groups"}
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-purple-100/90 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              {sg.subtitle || "Connect with believers, share faith journeys, and build lifelong friendships in a welcoming home group."}
            </p>

            {/* Quick Feature Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-white/15">
              <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold text-white">6+</div>
                <div className="text-xs text-purple-200">Active Groups</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-xs text-purple-200">Group Members</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold text-white">3</div>
                <div className="text-xs text-purple-200">Hub Locations</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-purple-200">Welcome</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Why Join Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 font-serif">
              {sg.whyTitle || "Why Join a Small Group?"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed font-light">
              {sg.whyDesc || "We were created for community. Small groups are where genuine friendships form, spiritual growth happens, and support is found."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-purple-500/5 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 font-serif">
                {sg.connectTitle || "Genuine Connection"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {sg.connectDesc || "Build authentic relationships with people who share your values and support you in everyday life."}
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 font-serif">
                {sg.growTitle || "Spiritual Growth"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {sg.growDesc || "Deepen your understanding of God's Word in an open, conversational, and encouraging setting."}
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-pink-500/5 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                <Coffee className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 font-serif">
                {sg.supportTitle || "Prayer & Care"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {sg.supportDesc || "Walk through life's celebrations and trials together with a caring family of faith."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Directory & Interactive Filters */}
      <section className="py-20 bg-gray-50/80 dark:bg-gray-900/60 border-y border-gray-200/60 dark:border-gray-800/80 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 font-serif">
                {sg.find || "Find Your Group"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Explore our groups by category, meeting day, or format.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative min-w-[280px] sm:min-w-[340px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups, topics, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Pill Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-8 pb-2 overflow-x-auto">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-105"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-gray-200/80 dark:border-gray-700/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Day Filter Sub-row */}
          <div className="flex items-center gap-2 mb-10 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold uppercase tracking-wider mr-1">Day:</span>
            {days.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedDay === d
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold"
                    : "bg-gray-200/70 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
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
                    className="group bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800/90 rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 flex flex-col hover:-translate-y-1.5"
                  >
                    {/* Header Banner with Gradient */}
                    <div className={`h-36 bg-gradient-to-r ${group.gradient} p-6 relative flex items-center justify-between text-white overflow-hidden`}>
                      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
                        <IconComponent className="w-44 h-44" />
                      </div>
                      <div className="z-10">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white uppercase tracking-wider mb-2">
                          {group.category}
                        </span>
                        <h3 className="text-2xl font-bold font-serif leading-tight">
                          {group.title}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 z-10">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Format Badge & Capacity */}
                      <div className="flex items-center justify-between gap-2 mb-4 text-xs">
                        <span className={`px-2.5 py-1 rounded-lg border font-medium ${group.accentBg}`}>
                          {group.format}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                          {group.members}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 flex-1">
                        {group.description}
                      </p>

                      {/* Details Meta list */}
                      <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4 mb-6">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span className="font-medium">{group.time}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>{group.location}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>Led by: <strong className="text-gray-800 dark:text-gray-200">{group.leader}</strong></span>
                        </div>
                      </div>

                      {/* Join Action Button */}
                      <button
                        onClick={() => setActiveModalGroup(group)}
                        className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white dark:bg-purple-950/40 dark:hover:bg-purple-600 dark:text-purple-300 dark:hover:text-white rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 group/btn shadow-sm hover:shadow-md hover:shadow-purple-600/20 active:scale-98"
                      >
                        <span>Join This Group</span>
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No groups match your filters</h3>
              <p className="text-gray-500 text-sm mb-6">Try clearing your search query or selecting a different category.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDay("All");
                }}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition-colors shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Start a Group Callout */}
      <section className="py-20 relative z-10 overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white">
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto mb-6">
              <PlusCircle className="w-8 h-8 text-purple-200" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 font-serif bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-indigo-100">
              {sg.startTitle || "Interested in Leading a Small Group?"}
            </h2>

            <p className="text-purple-100/90 text-base sm:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              {sg.startDesc || "We provide training, study materials, and ongoing coaching to help you facilitate a thriving community group."}
            </p>

            {/* Quick Steps */}
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10 text-left">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-purple-300 text-xs font-bold uppercase mb-1">Step 1</div>
                <div className="font-semibold text-sm">Express Interest</div>
                <div className="text-xs text-purple-200/80">Submit a quick leader form</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-purple-300 text-xs font-bold uppercase mb-1">Step 2</div>
                <div className="font-semibold text-sm">Orientation</div>
                <div className="text-xs text-purple-200/80">Receive study guides & support</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-purple-300 text-xs font-bold uppercase mb-1">Step 3</div>
                <div className="font-semibold text-sm">Launch Your Group</div>
                <div className="text-xs text-purple-200/80">Gather friends & neighbors</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setIsLeaderModalOpen(true)}
                className="px-8 py-4 bg-white text-purple-900 rounded-xl font-bold hover:bg-purple-50 transition-all duration-300 hover:scale-105 shadow-xl flex items-center justify-center gap-2 group"
              >
                <span>{sg.becomeLeader || "Apply to Lead a Group"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-purple-700" />
              </button>

              <Link
                href="/#contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Contact Leaders</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Join Group Modal */}
      {activeModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className={`p-6 bg-gradient-to-r ${activeModalGroup.gradient} text-white relative`}>
              <button
                onClick={() => setActiveModalGroup(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs uppercase font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white mb-2 inline-block">
                Sign Up
              </span>
              <h3 className="text-2xl font-bold font-serif">{activeModalGroup.title}</h3>
              <p className="text-xs text-purple-100 mt-1">{activeModalGroup.time} • {activeModalGroup.location}</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {isJoinSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Request Received!</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Thank you, {joinForm.name || "friend"}! Group leader <strong>{activeModalGroup.leader}</strong> will contact you with meeting details.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={joinForm.name}
                      onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={joinForm.email}
                        onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={joinForm.phone}
                        onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Any questions or prayer requests? (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="I'd love to know more about..."
                      value={joinForm.message}
                      onChange={(e) => setJoinForm({ ...joinForm, message: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
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

      {/* Leader Modal */}
      {isLeaderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 bg-gradient-to-r from-purple-800 to-indigo-900 text-white relative">
              <button
                onClick={() => setIsLeaderModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold font-serif">Group Leadership Application</h3>
              <p className="text-xs text-purple-200 mt-1">Start a new small group or co-lead an existing group.</p>
            </div>

            <div className="p-6">
              {isLeaderSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Application Submitted!</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Thank you for stepping up to serve! Our Discipleship Team will reach out to you within 48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeaderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Connor"
                      value={leaderForm.name}
                      onChange={(e) => setLeaderForm({ ...leaderForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sarah@example.com"
                        value={leaderForm.email}
                        onChange={(e) => setLeaderForm({ ...leaderForm, email: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={leaderForm.phone}
                        onChange={(e) => setLeaderForm({ ...leaderForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      What type of group would you like to lead/start?
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Young Couples Study, College Bible Study, Neighborhood Prayer Group..."
                      value={leaderForm.groupIdea}
                      onChange={(e) => setLeaderForm({ ...leaderForm, groupIdea: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-98"
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

