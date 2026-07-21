"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Music, 
  Users, 
  Heart, 
  Baby, 
  Briefcase, 
  HandHeart, 
  ArrowRight, 
  Search, 
  X, 
  Sparkles, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Flame
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";

export default function MinistriesPage() {
  const { t } = useLanguage();
  const pageT = t.pages.ministries;

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected ministry modal state
  const [selectedMinistryModal, setSelectedMinistryModal] = useState<any | null>(null);

  // Quick Metrics Stats
  const stats = [
    { value: "6", label: pageT.statCount || "Active Ministries", icon: Sparkles, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 dark:bg-purple-500/20" },
    { value: "150+", label: pageT.statVolunteers || "Servant Volunteers", icon: Users, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10 dark:bg-indigo-500/20" },
    { value: "3", label: pageT.statCampuses || "Campuses Served", icon: MapPin, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-500/10 dark:bg-pink-500/20" },
    { value: "24/7", label: pageT.statSupport || "Prayer Support", icon: Heart, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 dark:bg-emerald-500/20" },
  ];

  // Categories definition
  const categories = [
    { id: "all",      label: pageT.filterAll     || "All Ministries" },
    { id: "worship",  label: pageT.filterWorship  || "Worship & Media" },
    { id: "nextgen",  label: pageT.filterNextGen  || "NextGen & Youth" },
    { id: "care",     label: pageT.filterCare     || "Fellowship & Care" },
    { id: "outreach", label: pageT.filterOutreach || "Outreach & Service" },
  ];

  // Full Ministries Data
  const ministries = useMemo(() => [
    {
      id: "worship",
      title: pageT.worshipTitle || "Worship & Media Ministry",
      category: pageT.worshipCat || "worship",
      categoryLabel: pageT.filterWorship || "Worship & Media",
      schedule: pageT.worshipSchedule || "Sundays 8:00 AM & 10:00 AM",
      description: pageT.worshipDesc || "Leading our congregation into powerful, Spirit-led worship and managing technical media for God's glory.",
      details: pageT.worshipDetails || [
        "Sunday Services Worship",
        "Special Night of Worship & Prophetic Songs",
        "Choir & Instrumentalist Teams",
        "Live Streaming & Audio Production"
      ],
      campus: pageT.worshipCampus || "Shapur, Subhash Nagar, & Bahadurpally Campuses",
      leader: pageT.worshipLeader || "Worship Pastor & Media Director",
      icon: Music,
      color: "purple",
      accent: "from-purple-500 to-indigo-500",
      border: "border-purple-200 dark:border-purple-700",
      cardBg: "bg-white dark:bg-purple-950/60",
      badgeColor: "bg-purple-100 dark:bg-purple-600 text-purple-800 dark:text-white border border-purple-300 dark:border-purple-400 font-bold shadow-sm",
      scheduleColor: "text-purple-700 dark:text-white bg-purple-100 dark:bg-purple-800 border-purple-300 dark:border-purple-400/70 [&_svg]:text-purple-600 dark:[&_svg]:text-white"
    },
    {
      id: "youth",
      title: pageT.youthTitle || "Youth & NextGen Ministry",
      category: pageT.youthCat || "nextgen",
      categoryLabel: pageT.filterNextGen || "NextGen & Youth",
      schedule: pageT.youthSchedule || "Fridays @ 6:30 PM",
      description: pageT.youthDesc || "Empowering teenagers and young adults to ground their lives in Christ and impact their generation.",
      details: pageT.youthDetails || [
        "Friday Night Youth Fire Services",
        "Annual Youth Leadership Retreats",
        "1-on-1 Mentorship & Career Guidance",
        "Campus Outreach & Student Bible Clubs"
      ],
      campus: pageT.youthCampus || "Shapur & Subhash Nagar Campuses",
      leader: pageT.youthLeader || "Youth Director & Mentorship Team",
      icon: Users,
      color: "indigo",
      accent: "from-indigo-500 to-cyan-500",
      border: "border-indigo-200 dark:border-cyan-700",
      cardBg: "bg-white dark:bg-indigo-950/60",
      badgeColor: "bg-cyan-100 dark:bg-cyan-600 text-cyan-800 dark:text-white border border-cyan-300 dark:border-cyan-400 font-bold shadow-sm",
      scheduleColor: "text-indigo-700 dark:text-white bg-indigo-100 dark:bg-indigo-800 border-indigo-300 dark:border-indigo-400/70 [&_svg]:text-indigo-600 dark:[&_svg]:text-white"
    },
    {
      id: "children",
      title: pageT.childrenTitle || "Children's Ministry (Kingdom Kids)",
      category: pageT.childrenCat || "nextgen",
      categoryLabel: pageT.filterNextGen || "NextGen & Youth",
      schedule: pageT.childrenSchedule || "Sundays @ 9:00 AM",
      description: pageT.childrenDesc || "Nurturing children in a safe, joyful environment to learn God's Word through age-tailored lessons and worship.",
      details: pageT.childrenDetails || [
        "Sunday School Classes (Ages 3-12)",
        "Vacation Bible School (VBS)",
        "Kids Worship & Scripture Memorization",
        "Junior Choir & Drama Team"
      ],
      campus: pageT.childrenCampus || "All 3 KCM Campuses",
      leader: pageT.childrenLeader || "Children's Ministry Director",
      icon: Baby,
      color: "pink",
      accent: "from-pink-500 to-rose-500",
      border: "border-pink-200 dark:border-pink-700",
      cardBg: "bg-white dark:bg-pink-950/60",
      badgeColor: "bg-pink-100 dark:bg-pink-600 text-pink-800 dark:text-white border border-pink-300 dark:border-pink-400 font-bold shadow-sm",
      scheduleColor: "text-pink-700 dark:text-white bg-pink-100 dark:bg-pink-800 border-pink-300 dark:border-pink-400/70 [&_svg]:text-pink-600 dark:[&_svg]:text-white"
    },
    {
      id: "women",
      title: pageT.womenTitle || "Women's Fellowship (Daughters of Grace)",
      category: pageT.womenCat || "care",
      categoryLabel: pageT.filterCare || "Fellowship & Care",
      schedule: pageT.womenSchedule || "Saturdays @ 5:00 PM",
      description: pageT.womenDesc || "Building strong, faith-filled women through prayer, biblical encouragement, and mutual support.",
      details: pageT.womenDetails || [
        "Weekly Sisterhood Bible Studies",
        "Annual Women's Spiritual Conference",
        "Mom & Young Women Mentorship",
        "Community Benevolence & Prayer Support"
      ],
      campus: pageT.womenCampus || "Shapur & Subhash Nagar Campuses",
      leader: pageT.womenLeader || "Women's Ministry Coordinator",
      icon: Heart,
      color: "rose",
      accent: "from-rose-500 to-red-500",
      border: "border-rose-200 dark:border-rose-700",
      cardBg: "bg-white dark:bg-rose-950/60",
      badgeColor: "bg-rose-100 dark:bg-rose-600 text-rose-800 dark:text-white border border-rose-300 dark:border-rose-400 font-bold shadow-sm",
      scheduleColor: "text-rose-700 dark:text-white bg-rose-100 dark:bg-rose-800 border-rose-300 dark:border-rose-400/70 [&_svg]:text-rose-600 dark:[&_svg]:text-white"
    },
    {
      id: "men",
      title: pageT.menTitle || "Men's Ministry (Men of Valor)",
      category: pageT.menCat || "care",
      categoryLabel: pageT.filterCare || "Fellowship & Care",
      schedule: pageT.menSchedule || "2nd & 4th Saturday @ 7:00 AM",
      description: pageT.menDesc || "Equipping men to be godly leaders, devoted husbands, and faithful servants in their homes and community.",
      details: pageT.menDetails || [
        "Bi-Weekly Men's Prayer Breakfast",
        "Small Group Accountability Circles",
        "Church Maintenance & Service Projects",
        "Fatherhood & Leadership Seminars"
      ],
      campus: pageT.menCampus || "All KCM Campuses",
      leader: pageT.menLeader || "Men's Ministry Pastoral Team",
      icon: Briefcase,
      color: "blue",
      accent: "from-blue-500 to-indigo-500",
      border: "border-blue-200 dark:border-blue-700",
      cardBg: "bg-white dark:bg-blue-950/60",
      badgeColor: "bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-white border border-blue-300 dark:border-blue-400 font-bold shadow-sm",
      scheduleColor: "text-blue-700 dark:text-white bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-400/70 [&_svg]:text-blue-600 dark:[&_svg]:text-white"
    },
    {
      id: "outreach",
      title: pageT.outreachTitle || "Outreach & Compassion Ministry",
      category: pageT.outreachCat || "outreach",
      categoryLabel: pageT.filterOutreach || "Outreach & Service",
      schedule: pageT.outreachSchedule || "Monthly & Event-Based",
      description: pageT.outreachDesc || "Demonstrating Christ's unconditional love through practical aid, medical camps, and community relief.",
      details: pageT.outreachDetails || [
        "Free Monthly Food & Grocery Distribution",
        "Medical & Health Checkup Camps",
        "Slum & Village Evangelism Outreaches",
        "Youth & Elderly Assistance Programs"
      ],
      campus: pageT.outreachCampus || "Greater Hyderabad & Rural Outreach Centers",
      leader: pageT.outreachLeader || "Outreach & NGO Program Director",
      icon: HandHeart,
      color: "emerald",
      accent: "from-emerald-500 to-teal-500",
      border: "border-emerald-200 dark:border-emerald-700",
      cardBg: "bg-white dark:bg-emerald-950/60",
      badgeColor: "bg-emerald-100 dark:bg-emerald-600 text-emerald-800 dark:text-white border border-emerald-300 dark:border-emerald-400 font-bold shadow-sm",
      scheduleColor: "text-emerald-700 dark:text-white bg-emerald-100 dark:bg-emerald-800 border-emerald-300 dark:border-emerald-400/70 [&_svg]:text-emerald-600 dark:[&_svg]:text-white"
    },
  ], [pageT]);

  // Filtered Ministries Calculation
  const filteredMinistries = useMemo(() => {
    return ministries.filter((ministry) => {
      const matchesCategory = selectedCategory === "all" || ministry.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        ministry.title.toLowerCase().includes(q) || 
        ministry.description.toLowerCase().includes(q) || 
        ministry.details.some((d: string) => d.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [ministries, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* Hero Banner Section (Fixed Deep Obsidian Dark in both Light & Dark modes for crystal clear contrast) */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-24 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <BackToHome />
            </div>
            
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-purple-500/25 backdrop-blur-md border border-purple-300/40 rounded-full text-white text-sm mb-6 animate-bounce-in shadow-lg">
              <Heart className="h-4 w-4 text-pink-400 fill-pink-400/60" />
              <span className="font-semibold tracking-wide text-white">{pageT.badge || "Serving Together"}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 animate-fade-in-up">
              {pageT.title || "Our Ministries"}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-200 font-medium leading-relaxed animate-fade-in-up animate-delay-200">
              {pageT.subtitle || "Find your place to serve, connect, and grow in faith"}
            </p>
          </div>
        </div>
      </section>

      {/* Metric Stats Banner */}
      <section className="-mt-8 relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => {
            const IconComp = stat.icon;
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-center transition-transform hover:-translate-y-1 duration-300"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <IconComp className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Ministries Content Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Controls: Search & Category Filters */}
          <div className="max-w-6xl mx-auto mb-12 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-start">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                        isActive
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-105"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 font-semibold"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={pageT.searchPlaceholder || "Search ministries, schedules..."}
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Ministries Grid */}
          <div className="max-w-6xl mx-auto">
            {filteredMinistries.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <Search className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Ministries Found</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
                  We couldn't find any ministry matching "{searchQuery}". Try selecting a different category or clearing search terms.
                </p>
                <button
                  onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                  className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
                {filteredMinistries.map((ministry) => {
                  const IconComponent = ministry.icon;
                  return (
                    <div
                      key={ministry.id}
                      className={`group bg-white dark:bg-slate-900/90 rounded-3xl p-8 border ${ministry.border} shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden`}
                    >
                      {/* Top subtle background accent gradient */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${ministry.accent}`} />

                      <div>
                        {/* Header & Badges */}
                        <div className="flex items-center justify-between mb-6">
                          <div className={`w-14 h-14 bg-gradient-to-br ${ministry.accent} rounded-2xl flex items-center justify-center shadow-md text-white group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="h-7 w-7" />
                          </div>
                          
                          <span className={`px-3.5 py-1.5 rounded-full text-xs ${ministry.badgeColor}`}>
                            {ministry.categoryLabel}
                          </span>
                        </div>

                        {/* Title & Schedule */}
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {ministry.title}
                        </h3>

                        <div className={`flex items-center gap-2 text-xs font-bold mb-4 border px-3 py-1.5 rounded-lg w-fit shadow-sm ${ministry.scheduleColor}`}>
                          <Clock className="h-3.5 w-3.5" />
                          <span>{ministry.schedule}</span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-200 text-sm leading-relaxed mb-6 font-medium">
                          {ministry.description}
                        </p>

                        {/* Bullet Highlights */}
                        <ul className="space-y-2.5 mb-8">
                          {ministry.details.slice(0, 3).map((detail: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-100">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Card Action Footer */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                        <button
                          onClick={() => setSelectedMinistryModal(ministry)}
                          className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800/90 hover:bg-purple-600 dark:hover:bg-purple-600 text-slate-800 dark:text-white hover:text-white dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <span>{pageT.viewDetails || "View Details"}</span>
                        </button>
                        
                        <Link
                          href={`/get-involved/volunteer?ministry=${encodeURIComponent(ministry.id)}`}
                          className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-md hover:shadow-lg"
                        >
                          <span>{pageT.getInvolved || "Join"}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Interactive Ministry Details Modal Dialog */}
      {selectedMinistryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 sm:p-8 relative overflow-hidden animate-scale-in">
            
            {/* Modal Header accent gradient */}
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${selectedMinistryModal.accent}`} />
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedMinistryModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full bg-slate-100 dark:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Content */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 bg-gradient-to-br ${selectedMinistryModal.accent} rounded-2xl flex items-center justify-center text-white shadow-md`}>
                <selectedMinistryModal.icon className="h-7 w-7" />
              </div>
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs ${selectedMinistryModal.badgeColor}`}>
                  {selectedMinistryModal.categoryLabel}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {selectedMinistryModal.title}
                </h3>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-200 text-sm leading-relaxed mb-6 font-medium">
              {selectedMinistryModal.description}
            </p>

            {/* Schedule & Location Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-200 mb-1">
                  <Clock className="h-4 w-4" />
                  <span>{pageT.modalSchedule || "Gathering Schedule"}</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {selectedMinistryModal.schedule}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-200 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>{pageT.modalLocation || "Campus Locations"}</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {selectedMinistryModal.campus}
                </div>
              </div>
            </div>

            {/* Key Focus Areas Checklist */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>{pageT.modalFocus || "Key Focus Areas & Activities"}</span>
              </h4>
              <ul className="space-y-2">
                {selectedMinistryModal.details.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Leader contact line */}
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800 mb-6 font-medium">
              <ShieldCheck className="h-4 w-4 text-purple-500" />
              <span><strong>{pageT.modalLeader || "Leadership"}:</strong> {selectedMinistryModal.leader}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedMinistryModal(null)}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition"
              >
                {pageT.modalClose || "Close"}
              </button>
              
              <Link
                href={`/get-involved/volunteer?ministry=${encodeURIComponent(selectedMinistryModal.id)}`}
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition text-center shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                <span>{pageT.modalJoinBtn || "Volunteer for this Ministry"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* 24/7 Prayer Ministry Showcase Section */}
      <section className="py-20 bg-purple-50/70 dark:bg-slate-900/80 border-y border-purple-100 dark:border-purple-900/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            
            <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full blur-xl opacity-60 animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl text-white">
                <Heart className="h-10 w-10 fill-white/20 animate-bounce" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              {pageT.prayerTitle || "Prayer Ministry & Support (24/7)"}
            </h2>
            
            <p className="text-lg text-slate-600 dark:text-slate-200 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              {pageT.prayerSubtitle || "24/7 prayer coverage for our church family, city, and nation"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-10">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-slate-800 hover:-translate-y-1 transition duration-300">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 text-white shadow-md">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                  {pageT.chainsTitle || "Prayer Chains"}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                  {pageT.chainsDesc || "Immediate intercessory prayer network for urgent needs"}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-indigo-100 dark:border-slate-800 hover:-translate-y-1 transition duration-300">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 text-white shadow-md">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                  {pageT.teamsTitle || "Intercessory Teams"}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                  {pageT.teamsDesc || "Dedicated prayer warriors meeting weekly to contend in faith"}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-pink-100 dark:border-slate-800 hover:-translate-y-1 transition duration-300">
                <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4 text-white shadow-md">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                  {pageT.meetingsTitle || "Corporate Prayer Meetings"}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                  {pageT.meetingsDesc || "Weekly gatherings for church-wide worship & intercession"}
                </p>
              </div>
            </div>

            <Link
              href="/prayer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <span>{pageT.submitPrayer || "Submit Prayer Request"}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

          </div>
        </div>
      </section>

      {/* Call To Action Banner Section (Fixed Deep Obsidian Dark in both Light & Dark modes) */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 tracking-tight animate-fade-in-up">
              {pageT.ctaTitle || "Get Involved Today"}
            </h2>
            
            <p className="text-lg md:text-xl text-slate-200 font-medium mb-10 leading-relaxed animate-fade-in-up animate-delay-100">
              {pageT.ctaSubtitle || "Discover your God-given spiritual gifts and serve with purpose in our church family"}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in animate-delay-200">
              <Link
                href="/get-involved/volunteer"
                className="group px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 font-extrabold rounded-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-2xl"
              >
                <span className="text-slate-950 font-extrabold">{pageT.volunteerToday || "Volunteer Today"}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-purple-600" />
              </Link>
              
              <Link
                href="/#contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>{pageT.contactUs || "Contact Us"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}