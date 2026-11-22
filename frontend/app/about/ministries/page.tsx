"use client";

import { useState, useMemo, useEffect } from "react";
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
  Flame,
  Home,
  ChevronRight
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function MinistriesPage() {
  const { language, t } = useLanguage();
  const pageT = (t as any)?.pages?.ministries || {};

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected ministry modal state
  const [selectedMinistryModal, setSelectedMinistryModal] = useState<any | null>(null);

  // Prevent background scroll and support Escape key when modal is open
  useEffect(() => {
    if (selectedMinistryModal !== null) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedMinistryModal(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedMinistryModal]);

  // Executive Tone-on-Tone Stats Bar (Zero Text Duplication)
  const stats = [
    { 
      value: "6", 
      label: pageT.statCount || (language === "te" ? "క్రియాశీల పరిచర్యలు" : language === "hi" ? "सक्रिय मंत्रालय" : "Active Ministries"), 
      icon: Sparkles, 
      color: "text-purple-600 dark:text-purple-400", 
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-200/50 dark:border-purple-700/50" 
    },
    { 
      value: "150+", 
      label: pageT.statVolunteers || (language === "te" ? "సేవా స్వచ్ఛంద సేవకులు" : language === "hi" ? "सेवक स्वयंसेवक" : "Servant Volunteers"), 
      icon: Users, 
      color: "text-indigo-600 dark:text-indigo-400", 
      iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-200/50 dark:border-indigo-700/50" 
    },
    { 
      value: "3", 
      label: pageT.statCampuses || (language === "te" ? "సేవ అందిస్తున్న ప్రాంతాలు" : language === "hi" ? "सेवा प्रदान किए गए परिसर" : "Campuses Served"), 
      icon: MapPin, 
      color: "text-rose-600 dark:text-rose-400", 
      iconBg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-200/50 dark:border-rose-700/50" 
    },
    { 
      value: "24/7", 
      label: pageT.statSupport || (language === "te" ? "ప్రార్థన మద్దతు" : language === "hi" ? "प्रार्थना सहायता" : "Prayer Support"), 
      icon: Flame, 
      color: "text-emerald-600 dark:text-emerald-400", 
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-200/50 dark:border-emerald-700/50" 
    },
  ];

  // Categories definition
  const categories = [
    { id: "all",      label: pageT.filterAll     || (language === "te" ? "అన్ని పరిచర్యలు" : language === "hi" ? "सभी मंत्रालय" : "All Ministries") },
    { id: "worship",  label: pageT.filterWorship  || (language === "te" ? "ఆరాధన & మీడియా" : language === "hi" ? "आराधना और मीडिया" : "Worship & Media") },
    { id: "nextgen",  label: pageT.filterNextGen  || (language === "te" ? "యువత & పిల్లలు" : language === "hi" ? "नेक्स्टजेन और युवा" : "NextGen & Youth") },
    { id: "care",     label: pageT.filterCare     || (language === "te" ? "సహవాసము & రక్షణ" : language === "hi" ? "संगति और देखभाल" : "Fellowship & Care") },
    { id: "outreach", label: pageT.filterOutreach || (language === "te" ? "సువార్త & సేవా కార్యక్రమాలు" : language === "hi" ? "आउटरीच और सेवा" : "Outreach & Service") },
  ];

  // Full Ministries Data with Harmonized Palettes
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
      accent: "from-purple-500 to-indigo-500",
      border: "border-purple-200/80 dark:border-purple-800/60 hover:border-purple-400 dark:hover:border-purple-600",
      badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/70 font-bold",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60",
      scheduleColor: "text-purple-800 dark:text-purple-200 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 font-semibold"
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
      accent: "from-indigo-500 to-cyan-500",
      border: "border-indigo-200/80 dark:border-indigo-800/60 hover:border-indigo-400 dark:hover:border-indigo-600",
      badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 font-bold",
      iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60",
      scheduleColor: "text-indigo-800 dark:text-indigo-200 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 font-semibold"
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
      accent: "from-pink-500 to-rose-500",
      border: "border-pink-200/80 dark:border-pink-800/60 hover:border-pink-400 dark:hover:border-pink-600",
      badgeColor: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-200/70 dark:border-pink-800/70 font-bold",
      iconBg: "bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-800/60",
      scheduleColor: "text-pink-800 dark:text-pink-200 bg-pink-50/70 dark:bg-pink-950/40 border border-pink-200/60 dark:border-pink-800/60 font-semibold"
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
      accent: "from-rose-500 to-red-500",
      border: "border-rose-200/80 dark:border-rose-800/60 hover:border-rose-400 dark:hover:border-rose-600",
      badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/70 font-bold",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60",
      scheduleColor: "text-rose-800 dark:text-rose-200 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60 font-semibold"
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
      accent: "from-blue-500 to-indigo-500",
      border: "border-blue-200/80 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-600",
      badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/70 font-bold",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60",
      scheduleColor: "text-blue-800 dark:text-blue-200 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 font-semibold"
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
      accent: "from-emerald-500 to-teal-500",
      border: "border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-400 dark:hover:border-emerald-600",
      badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70 font-bold",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60",
      scheduleColor: "text-emerald-800 dark:text-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 font-semibold"
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

      {/* 🌌 Hero Banner Section — Continuous Ambient Gradient (No horizontal seam border) */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 md:pt-44 md:pb-28 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25 dark:opacity-15 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* Inline Breadcrumb Navigation (Replaces stacked Home button) */}
            <nav aria-label="Breadcrumb" className="mb-5 flex justify-center">
              <ol className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-purple-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-xs">
                <li className="inline-flex items-center">
                  <Link href="/" className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <Home className="h-3.5 w-3.5" />
                    <span>{pageT.breadcrumbHome || "Home"}</span>
                  </Link>
                </li>
                <li className="flex items-center text-slate-400 dark:text-slate-600">/</li>
                <li className="inline-flex items-center">
                  <Link href="/about" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {pageT.breadcrumbAbout || "About"}
                  </Link>
                </li>
                <li className="flex items-center text-slate-400 dark:text-slate-600">/</li>
                <li className="text-purple-700 dark:text-purple-300 font-bold truncate max-w-[140px] sm:max-w-none">
                  {pageT.breadcrumbCurrent || "Ministries"}
                </li>
              </ol>
            </nav>
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-300/40 dark:border-rose-500/30 rounded-full text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold tracking-wide mb-5 backdrop-blur-md animate-fade-in-up">
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
              <span>{pageT.badge || (language === "te" ? "కలిసి సేవ చేద్దాం" : language === "hi" ? "साथ मिलकर सेवा करें" : "Serving Together")}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>
            
            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight animate-fade-in-up animate-delay-100">
              {pageT.title || (language === "te" ? "మా పరిచర్యలు" : language === "hi" ? "हमारी सेवकाइयां" : "Our Ministries")}
            </h1>
            
            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
              {pageT.subtitle || (language === "te" ? "విశ్వాసంలో ఎదగడానికి మరియు సేవ చేయడానికి మీ స్థానాన్ని కనుగొనండి" : language === "hi" ? "विश्वास में बढ़ने और सेवा करने के लिए अपना स्थान खोजें" : "Find your place to serve, connect, and grow in faith")}
            </p>
          </div>
        </div>
      </section>

      {/* 📊 Tone-on-Tone Floating Stats Bar (No horizontal cutting border, No duplicate 24/7) */}
      <section className="relative z-20 -mt-10 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {stats.map((stat, idx) => {
            const IconComp = stat.icon;
            return (
              <div 
                key={idx}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 text-center transition-all hover:scale-[1.02] duration-300 flex flex-col items-center group"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 ${stat.iconBg} border rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <IconComp className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-tight">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 👥 Main Ministries Content Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Controls: Search & Category Filter Toolbar */}
          <div className="max-w-4xl mx-auto mb-12 space-y-4">
            
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={pageT.searchPlaceholder || (language === "te" ? "పరిచర్యలను వెతకండి..." : language === "hi" ? "मंत्रालय खोजें..." : "Search ministries or schedules...")}
                className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills — Single Horizontal Swipe Track on Mobile */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 sm:justify-center flex-nowrap">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-[1.02]"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ministries Grid */}
          <div className="max-w-7xl mx-auto">
            {filteredMinistries.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto">
                <Search className="h-12 w-12 text-slate-400 mx-auto mb-4 opacity-60" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {pageT.noResultsTitle || "No Ministries Found"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  {pageT.noResultsDesc || `We couldn't find any ministry matching "${searchQuery}". Try selecting a different category or clearing search terms.`}
                </p>
                <button
                  onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                  className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 active:scale-95 transition shadow-md shadow-purple-600/25 text-sm"
                >
                  {pageT.resetFilters || "Reset Filters"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredMinistries.map((ministry) => {
                  const IconComponent = ministry.icon;
                  return (
                    <div
                      key={ministry.id}
                      className={`group bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border ${ministry.border} shadow-xl shadow-slate-900/5 dark:shadow-black/25 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden`}
                    >
                      {/* Top subtle background accent gradient */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${ministry.accent}`} />

                      <div>
                        {/* Header: Tone-on-tone Icon & Category Badge */}
                        <div className="flex items-center justify-between gap-3 mb-5">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 ${ministry.iconBg} rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                            <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-xs ${ministry.badgeColor} shadow-2xs`}>
                            {ministry.categoryLabel}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {ministry.title}
                        </h3>

                        {/* Schedule Badge */}
                        <div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg mb-4 shadow-2xs ${ministry.scheduleColor}`}>
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{ministry.schedule}</span>
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-5 font-normal">
                          {ministry.description}
                        </p>

                        {/* Bullet Highlights */}
                        <ul className="space-y-2 mb-6">
                          {ministry.details.slice(0, 3).map((detail: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-tight">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Card Action Footer */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5">
                        <button
                          onClick={() => setSelectedMinistryModal(ministry)}
                          className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] whitespace-nowrap"
                        >
                          <span>{pageT.viewDetails || "View Details"}</span>
                        </button>
                        
                        <Link
                          href={`/get-involved/volunteer?ministry=${encodeURIComponent(ministry.id)}`}
                          className="py-2.5 px-3.5 sm:px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap"
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

      {/* 📖 Interactive Ministry Details Modal Dialog */}
      {selectedMinistryModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMinistryModal(null);
          }}
          className="fixed inset-0 z-[10005] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full relative overflow-hidden animate-scale-in max-h-[90dvh] flex flex-col"
          >
            {/* Modal Header */}
            <div className={`p-5 sm:p-6 bg-gradient-to-r ${selectedMinistryModal.accent} text-white relative shrink-0 z-10`}>
              <div className="pr-12">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-2">
                  {selectedMinistryModal.categoryLabel}
                </span>
                <h3 className="text-xl sm:text-2xl font-black leading-tight">
                  {selectedMinistryModal.title}
                </h3>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedMinistryModal(null)}
                aria-label="Close modal"
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 bg-black/25 hover:bg-black/40 active:scale-95 rounded-xl text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 overscroll-contain text-left text-slate-700 dark:text-slate-300">
              <p className="text-sm sm:text-base leading-relaxed font-normal">
                {selectedMinistryModal.description}
              </p>

              {/* Schedule & Location Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{pageT.modalSchedule || "Gathering Schedule"}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {selectedMinistryModal.schedule}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{pageT.modalLocation || "Campus Locations"}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {selectedMinistryModal.campus}
                  </div>
                </div>
              </div>

              {/* Key Focus Areas Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>{pageT.modalFocus || "Key Focus Areas & Activities"}</span>
                </h4>
                <ul className="space-y-2">
                  {selectedMinistryModal.details.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </ul>
              </div>

              {/* Leader contact line */}
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 font-medium">
                <ShieldCheck className="h-4 w-4 text-purple-500 shrink-0" />
                <span><strong>{pageT.modalLeader || "Leadership"}:</strong> {selectedMinistryModal.leader}</span>
              </div>
            </div>

            {/* Actions - Pinned Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => setSelectedMinistryModal(null)}
                className="w-full sm:flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center cursor-pointer active:scale-95"
              >
                {pageT.modalClose || "Close"}
              </button>
              
              <Link
                href={`/get-involved/volunteer?ministry=${encodeURIComponent(selectedMinistryModal.id)}`}
                className="w-full sm:flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold transition text-center shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{pageT.modalJoinBtn || "Volunteer for this Ministry"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* 🔥 24/7 Prayer Ministry Showcase Section */}
      <section className="py-16 sm:py-24 bg-purple-50/70 dark:bg-slate-900/60 border-y border-purple-100 dark:border-purple-900/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl text-white">
                <Heart className="h-8 w-8 sm:h-10 sm:w-10 fill-white/20" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              {pageT.prayerTitle || "Prayer Ministry & Support (24/7)"}
            </h2>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal mb-10 max-w-2xl mx-auto leading-relaxed">
              {pageT.prayerSubtitle || "24/7 prayer coverage for our church family, city, and nation"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-left mb-10">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-purple-100 dark:border-slate-800 hover:-translate-y-1 transition duration-300">
                <div className="w-11 h-11 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 rounded-xl flex items-center justify-center mb-4 shadow-xs">
                  <Flame className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-2">
                  {pageT.chainsTitle || "Prayer Chains"}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
                  {pageT.chainsDesc || "Immediate intercessory prayer network for urgent needs"}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-indigo-100 dark:border-slate-800 hover:-translate-y-1 transition duration-300">
                <div className="w-11 h-11 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl flex items-center justify-center mb-4 shadow-xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-2">
                  {pageT.teamsTitle || "Intercessory Teams"}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
                  {pageT.teamsDesc || "Dedicated prayer warriors meeting weekly to contend in faith"}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-pink-100 dark:border-slate-800 hover:-translate-y-1 transition duration-300">
                <div className="w-11 h-11 bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-800/60 rounded-xl flex items-center justify-center mb-4 shadow-xs">
                  <Users className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-2">
                  {pageT.meetingsTitle || "Corporate Prayer Meetings"}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
                  {pageT.meetingsDesc || "Weekly gatherings for church-wide worship & intercession"}
                </p>
              </div>
            </div>

            <Link
              href="/prayer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all duration-200 text-sm sm:text-base cursor-pointer"
            >
              <span>{pageT.submitPrayer || "Submit Prayer Request"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>
        </div>
      </section>

      {/* 🚀 Call To Action Banner Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden text-white border-t border-slate-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 border border-purple-400/30 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>{pageT.ctaBadge || "Serve With Purpose"}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              {pageT.ctaTitle || "Get Involved Today"}
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-normal mb-8 leading-relaxed max-w-2xl mx-auto">
              {pageT.ctaSubtitle || "Discover your God-given spiritual gifts and serve with purpose in our church family"}
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-center">
              <Link
                href="/get-involved/volunteer"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-xl shadow-purple-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base text-center"
              >
                <span>{pageT.volunteerToday || "Volunteer Today"}</span>
              </Link>
              
              <Link
                href="/contact"
                className="w-full sm:w-auto group px-8 py-3.5 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white border border-white/20 backdrop-blur-md rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base text-center"
              >
                <span>{pageT.contactUs || "Contact Us"}</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
