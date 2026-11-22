"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Users, 
  Heart, 
  BookOpen, 
  Music, 
  Sparkles, 
  ArrowRight, 
  Quote, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  Flame, 
  Baby, 
  Search, 
  X, 
  ChevronRight, 
  HeartHandshake, 
  Award,
  Home,
  Check
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function LeadershipPage() {
  const { language, t } = useLanguage();
  const pageT = (t as any)?.pages?.leadership || {};

  // Pastor bio tab state
  const [activePastorTab, setActivePastorTab] = useState<"bio" | "vision" | "message">("bio");

  // Ministry directory filter & search
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected ministry modal
  const [selectedMinistry, setSelectedMinistry] = useState<any | null>(null);

  // Prevent background scroll and support Escape key when modal is open
  useEffect(() => {
    if (selectedMinistry !== null) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedMinistry(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedMinistry]);

  // Stats Data — Tone-on-tone refined badges, zero text duplication
  const stats = [
    { 
      value: "20+", 
      label: pageT.statYears || "Years of Leadership", 
      icon: Calendar, 
      color: "text-purple-600 dark:text-purple-400", 
      iconBg: "bg-purple-100/90 dark:bg-purple-950/70 border border-purple-200/80 dark:border-purple-800/60",
      accent: "from-purple-500 to-indigo-500" 
    },
    { 
      value: "6+", 
      label: pageT.statMinistries || "Active Ministries", 
      icon: Award, 
      color: "text-indigo-600 dark:text-indigo-400", 
      iconBg: "bg-indigo-100/90 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/60",
      accent: "from-indigo-500 to-cyan-500" 
    },
    { 
      value: "100+", 
      label: pageT.statServants || "Servant Leaders", 
      icon: Users, 
      color: "text-rose-600 dark:text-rose-400", 
      iconBg: "bg-rose-100/90 dark:bg-rose-950/70 border border-rose-200/80 dark:border-rose-800/60",
      accent: "from-rose-500 to-pink-500" 
    },
    { 
      value: "24/7", 
      label: pageT.statPrayer || "Prayer Support", 
      icon: Flame, 
      color: "text-amber-600 dark:text-amber-400", 
      iconBg: "bg-amber-100/90 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800/60",
      accent: "from-amber-500 to-orange-500" 
    },
  ];

  // Core Pillars of Leadership — Fully Harmonized Palettes (No Harsh Clashing Badges)
  const corePillars = [
    {
      title: pageT.pillar1Title || "Servant Leadership",
      desc: pageT.pillar1Desc || "Leading with humility, putting the needs of God's people first.",
      verse: "Mark 10:45",
      icon: HeartHandshake,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100/90 dark:bg-purple-950/70 border border-purple-200/80 dark:border-purple-800/60",
      badgeBg: "bg-purple-100/80 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 border border-purple-200/90 dark:border-purple-800/70",
      border: "border-purple-200/60 dark:border-purple-900/40 hover:border-purple-400 dark:hover:border-purple-500/60",
      accent: "from-purple-500 to-indigo-500"
    },
    {
      title: pageT.pillar2Title || "Biblical Truth",
      desc: pageT.pillar2Desc || "Preaching and teaching the uncompromised Word of God.",
      verse: "2 Timothy 4:2",
      icon: BookOpen,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100/90 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/60",
      badgeBg: "bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 border border-indigo-200/90 dark:border-indigo-800/70",
      border: "border-indigo-200/60 dark:border-indigo-900/40 hover:border-indigo-400 dark:hover:border-indigo-500/60",
      accent: "from-indigo-500 to-cyan-500"
    },
    {
      title: pageT.pillar3Title || "Prayer & Faith",
      desc: pageT.pillar3Desc || "Anchoring every decision and ministry step in fervent prayer.",
      verse: "1 Thess 5:17",
      icon: Flame,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100/90 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800/60",
      badgeBg: "bg-amber-100/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-200/90 dark:border-amber-800/70",
      border: "border-amber-200/60 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-500/60",
      accent: "from-amber-500 to-orange-500"
    },
    {
      title: pageT.pillar4Title || "Compassionate Care",
      desc: pageT.pillar4Desc || "Shepherding families and individuals with Christ-like love.",
      verse: "1 Peter 5:2",
      icon: ShieldCheck,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100/90 dark:bg-rose-950/70 border border-rose-200/80 dark:border-rose-800/60",
      badgeBg: "bg-rose-100/80 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border border-rose-200/90 dark:border-rose-800/70",
      border: "border-rose-200/60 dark:border-rose-900/40 hover:border-rose-400 dark:hover:border-rose-500/60",
      accent: "from-rose-500 to-pink-500"
    }
  ];

  // Detailed Ministry Data
  const ministries = [
    {
      id: "worship",
      title: pageT.worship || "Worship Ministry",
      desc: pageT.worshipDesc || "Leading our congregation in powerful worship experiences",
      icon: Music,
      category: "worship",
      tag: "Worship & Media",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100/90 dark:bg-purple-950/70 border border-purple-200/80 dark:border-purple-800/60",
      borderColor: "border-purple-200/70 dark:border-purple-800/50",
      accent: "from-purple-500 to-indigo-500",
      focusAreas: [
        "Sunday Praise & Worship Services",
        "Choir & Vocal Training Sessions",
        "Sound, Media & Live Broadcast Team",
        "Worship Nights & Special Events"
      ],
      schedule: "Practices: Saturday 6:00 PM | Services: Sunday Mornings",
      roleTitle: language === "te" ? "ఆరాధన నాయకులు" : language === "hi" ? "आराधना दल" : "Worship Leadership"
    },
    {
      id: "youth",
      title: pageT.youth || "Youth Ministry",
      desc: pageT.youthDesc || "Empowering the next generation for Christ",
      icon: Sparkles,
      category: "youth",
      tag: "Youth & NextGen",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100/90 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/60",
      borderColor: "border-indigo-200/70 dark:border-indigo-800/50",
      accent: "from-indigo-500 to-cyan-500",
      focusAreas: [
        "Weekly Youth Fellowship Meetings",
        "Campus & College Outreach",
        "Youth Leadership & Discipleship Camps",
        "Music & Drama Team"
      ],
      schedule: "Youth Service: Saturday 5:30 PM",
      roleTitle: language === "te" ? "యువజన నాయకులు" : language === "hi" ? "युवा नेतृत्व" : "NextGen Leadership"
    },
    {
      id: "women",
      title: pageT.women || "Women's Ministry",
      desc: pageT.womenDesc || "Building strong, faith-filled women",
      icon: Heart,
      category: "care",
      tag: "Women's Fellowship",
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-100/90 dark:bg-rose-950/70 border border-rose-200/80 dark:border-rose-800/60",
      borderColor: "border-rose-200/70 dark:border-rose-800/50",
      accent: "from-rose-500 to-pink-500",
      focusAreas: [
        "Weekly Sisterhood Prayer Meetings",
        "Community Outreach & Support",
        "Women's Annual Spiritual Conference",
        "Family & Marriage Counseling"
      ],
      schedule: "Sisterhood Fellowship: Saturday 5:00 PM",
      roleTitle: language === "te" ? "స్త్రీల పరిచర్య నాయకత్వం" : language === "hi" ? "महिला नेतृत्व" : "Sisterhood Leadership"
    },
    {
      id: "men",
      title: pageT.men || "Men's Ministry",
      desc: pageT.menDesc || "Equipping men to be spiritual leaders",
      icon: ShieldCheck,
      category: "care",
      tag: "Men of Integrity",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100/90 dark:bg-purple-950/70 border border-purple-200/80 dark:border-purple-800/60",
      borderColor: "border-purple-200/70 dark:border-purple-800/50",
      accent: "from-purple-500 to-indigo-500",
      focusAreas: [
        "Men's Breakfast & Bible Study",
        "Brotherhood Mentorship Network",
        "Church Maintenance & Logistics",
        "Leadership Seminars"
      ],
      schedule: "Men's Fellowship: Saturday 7:00 AM",
      roleTitle: language === "te" ? "పురుషుల పరిచర్య నాయకత్వం" : language === "hi" ? "पुरुष नेतृत्व" : "Brotherhood Leadership"
    },
    {
      id: "children",
      title: pageT.children || "Children's Ministry",
      desc: pageT.childrenDesc || "Teaching children about Jesus in fun, engaging ways",
      icon: Baby,
      category: "youth",
      tag: "Kids Sunday School",
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-100/90 dark:bg-pink-950/70 border border-pink-200/80 dark:border-pink-800/60",
      borderColor: "border-pink-200/70 dark:border-pink-800/50",
      accent: "from-pink-500 to-rose-500",
      focusAreas: [
        "Sunday School Age-Graded Classes",
        "Vacation Bible School (VBS)",
        "Scripture Memorization Programs",
        "Children's Choir & Pageants"
      ],
      schedule: "Sunday School: Sunday 9:00 AM",
      roleTitle: language === "te" ? "సండే స్కూల్ నాయకత్వం" : language === "hi" ? "संडे स्कूल नेतृत्व" : "Sunday School Lead"
    },
    {
      id: "prayer",
      title: pageT.prayer || "Prayer Ministry",
      desc: pageT.prayerDesc || "Interceding for our church family 24/7",
      icon: Flame,
      category: "care",
      tag: "24/7 Intercession",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100/90 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800/60",
      borderColor: "border-amber-200/70 dark:border-amber-800/50",
      accent: "from-amber-500 to-orange-500",
      focusAreas: [
        "24/7 Continuous Prayer Chain",
        "Emergency Prayer Request Hotline",
        "All-Night Prayer Vigils & Fasting",
        "Intercession for Nations & Revival"
      ],
      schedule: "Night Vigil: Every 3rd Friday | 24/7 Prayer Line",
      roleTitle: language === "te" ? "ప్రార్థన పరిచర్య నాయకత్వం" : language === "hi" ? "प्रार्थना दल नेतृत्व" : "Intercession Team"
    }
  ];

  // Filtering Logic
  const filteredMinistries = ministries.filter((item) => {
    const matchesFilter = selectedFilter === "all" || item.category === selectedFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      !query ||
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.desc && item.desc.toLowerCase().includes(query)) ||
      (item.tag && item.tag.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* 🌌 Hero Section with Seamless Ambient Glows */}
      <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 md:pt-44 md:pb-20 bg-gradient-to-b from-purple-50/90 via-indigo-50/50 to-slate-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 dark:opacity-10 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* 🧭 Sleek Breadcrumb Trail (Fixes Pill Stacking & Clutter) */}
            <nav aria-label="Breadcrumb" className="mb-6 flex justify-center items-center">
              <ol className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-xs">
                <li>
                  <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5" />
                    <span>{pageT.breadcrumbHome || "Home"}</span>
                  </Link>
                </li>
                <li className="text-slate-300 dark:text-slate-600" aria-hidden="true">/</li>
                <li>
                  <Link href="/about" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {pageT.breadcrumbAbout || "About"}
                  </Link>
                </li>
                <li className="text-slate-300 dark:text-slate-600" aria-hidden="true">/</li>
                <li className="text-purple-600 dark:text-purple-400 font-bold" aria-current="page">
                  {pageT.title || "Leadership"}
                </li>
              </ol>
            </nav>

            {/* Purposeful Section Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-100/90 dark:bg-purple-900/40 border border-purple-200/80 dark:border-purple-500/30 rounded-full text-purple-900 dark:text-purple-200 text-xs sm:text-sm font-bold tracking-wide mb-5 shadow-xs backdrop-blur-md">
              <Users className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>{pageT.badge || "Our Leaders"}</span>
              <Sparkles className="h-3 w-3 text-amber-500 dark:text-amber-300" />
            </div>

            {/* Primary Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tight leading-tight">
              {pageT.title || "Leadership"}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              {pageT.subtitle || "Shepherds called to serve God's people"}
            </p>
          </div>

          {/* 📊 Integrated Ambient Stats Grid (No Seams, Tone-on-Tone, Pure Craftsmanship) */}
          <div className="mt-10 sm:mt-14 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={idx}
                    className="relative bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/90 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl shadow-lg shadow-purple-900/5 dark:shadow-black/30 hover:shadow-xl hover:border-purple-300/80 dark:hover:border-purple-600/50 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden"
                  >
                    {/* Subtle Top Accent Ribbon */}
                    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${stat.accent} opacity-75 group-hover:opacity-100 transition-opacity`} />
                    
                    {/* Tone-on-Tone Icon Container */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                    </div>

                    {/* Numeric Metric */}
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5 sm:mb-1">
                      {stat.value}
                    </div>

                    {/* Metric Label — Zero Duplicate Text */}
                    <div className="text-[11px] sm:text-xs lg:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-snug">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ✝️ Senior Pastor Section — Clean Hierarchy & Segmented Controller */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Heading — Eliminates "Senior Pastor" duplicate heading & badge */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-100/90 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200 rounded-full text-xs font-bold tracking-wider mb-3.5 border border-purple-200/80 dark:border-purple-500/30 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300" />
              <span>{pageT.badgePastor || "Spiritual Leadership"}</span>
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              {pageT.meetPastor || "Meet Our Senior Pastor"}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 mx-auto rounded-full" />
          </div>

          {/* Senior Pastor Profile Card */}
          <div className="bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 border border-slate-200/90 dark:border-purple-900/40 rounded-3xl p-5 sm:p-8 lg:p-12 shadow-xl shadow-purple-900/5 dark:shadow-black/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Portrait & Title */}
              <div className="lg:col-span-5 flex flex-col items-center text-center">
                <div className="relative group w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl shadow-purple-900/15 dark:shadow-black/60 bg-gradient-to-b from-purple-900 to-slate-950 transition-transform duration-500 hover:scale-[1.02]">
                  <Image
                    src="/pastor.png"
                    alt="Bishop Kurra Kristhu Raju"
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    className="object-cover object-[center_12%] scale-105 transition-transform duration-500 group-hover:scale-110"
                    priority
                    unoptimized
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />
                  
                  {/* Verified Subtle Floating Badge */}
                  <div className="absolute bottom-3 inset-x-4 flex justify-center z-10">
                    <span className="px-3 py-1 bg-slate-900/85 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[11px] sm:text-xs font-bold rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      Bishop & Founder
                    </span>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Bishop Kurra Kristhu Raju
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400 font-bold text-sm sm:text-base mt-1">
                    {pageT.role || "Senior Pastor & Founder"}
                  </p>
                </div>
              </div>

              {/* Right Column: Tabbed Dossier & Quick Actions */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 🎛️ Segmented Controller Tab Bar (100% Accessible, Zero Wrapping on Mobile) */}
                <div 
                  role="tablist" 
                  aria-label="Pastor Profile Information" 
                  className="grid grid-cols-3 p-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 backdrop-blur-md"
                >
                  {[
                    { 
                      id: "bio", 
                      label: pageT.tabBio || "About Pastor",
                      shortLabel: language === "te" ? "పరిచయం" : language === "hi" ? "परिचय" : "About"
                    },
                    { 
                      id: "vision", 
                      label: pageT.tabVision || "Pastoral Vision",
                      shortLabel: language === "te" ? "దర్శనం" : language === "hi" ? "दर्शन" : "Vision"
                    },
                    { 
                      id: "message", 
                      label: pageT.tabMessage || "Message to Church",
                      shortLabel: language === "te" ? "సందేశం" : language === "hi" ? "संदेश" : "Message"
                    },
                  ].map((tab) => {
                    const isSelected = activePastorTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        role="tab"
                        id={`tab-${tab.id}`}
                        aria-selected={isSelected}
                        aria-controls={`panel-${tab.id}`}
                        onClick={() => setActivePastorTab(tab.id as any)}
                        className={`py-2 sm:py-2.5 px-1 sm:px-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 text-center cursor-pointer ${
                          isSelected
                            ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-300 shadow-sm shadow-slate-900/5 dark:shadow-black/20"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Panels */}
                <div className="min-h-[160px]">
                  {activePastorTab === "bio" && (
                    <div 
                      id="panel-bio"
                      role="tabpanel"
                      aria-labelledby="tab-bio"
                      className="space-y-4 animate-fade-in"
                    >
                      <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed font-medium">
                        {pageT.bio ||
                          (language === "te"
                            ? "బిషప్ కుర్రా క్రీస్తు రాజు గారు 2012 నుండి కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్‌ను నమ్మకంగా నడిపిస్తున్నారు. దేవుని వాక్య బోధన, సమాజ సేవ మరియు అనాథల సంరక్షణలో వారి నిబద్ధత అనేక వేల మంది జీవితాలలో మార్పును తెచ్చింది."
                            : language === "hi"
                            ? "बिशप कुर्रा क्रिस्तु राजू जी 2012 से किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज का विश्वासयोग्यता से नेतृत्व कर रहे हैं। परमेश्वर के वचन का प्रचार, सामाजिक सेवा और अनाथों की देखभाल में उनकी प्रतिबद्धता ने हजारों लोगों के जीवन को बदला है।"
                            : "Bishop Kurra Kristhu Raju has been faithfully leading Kingdom of Christ Ministries since 2012, bringing spiritual transformation, social upliftment, and charitable care across Hyderabad and beyond.")}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{language === "te" ? "అంకితభావం గల ఆత్మీయ నాయకత్వం" : language === "hi" ? "समर्पित आत्मिक नेतृत्व" : "Dedicated Pastoral Leadership"}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0" />
                          <span>{language === "te" ? "దర్శనంగల సంఘ వ్యవస్థాపకులు" : language === "hi" ? "दूरदर्शी कलीसिया संस्थापक" : "Visionary Church Founder"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePastorTab === "vision" && (
                    <div 
                      id="panel-vision"
                      role="tabpanel"
                      aria-labelledby="tab-vision"
                      className="relative bg-white/90 dark:bg-slate-900/90 rounded-2xl p-5 sm:p-6 shadow-sm border border-purple-100 dark:border-purple-900/40 animate-fade-in"
                    >
                      <Quote className="h-7 w-7 text-purple-600 dark:text-purple-400 mb-2 opacity-80" />
                      <h4 className="text-sm sm:text-base font-bold text-purple-600 dark:text-purple-300 mb-2">
                        {pageT.visionTitle || "Vision for the Kingdom"}
                      </h4>
                      <p className="text-slate-800 dark:text-slate-100 italic text-sm sm:text-base lg:text-lg leading-relaxed font-semibold">
                        "{pageT.visionQuote || (language === "te" ? "క్రీస్తును తెలుసుకోవడం మరియు ఆయనను అందరికీ తెలియజేయడం, ప్రతి విశ్వాసిని ఆధ్యాత్మిక పరిపక్వతకు నడిపించడం మా ప్రధాన లక్ష్యం." : language === "hi" ? "मसीह को जानना और उन्हें सभी को बताना, और हर विश्वासी को आत्मिक परिपक्वता तक पहुंचाना हमारा मुख्य लक्ष्य है।" : "To know Christ and make Him known, raising disciples who transform our city through worship, love, and community service.")}"
                      </p>
                    </div>
                  )}

                  {activePastorTab === "message" && (
                    <div 
                      id="panel-message"
                      role="tabpanel"
                      aria-labelledby="tab-message"
                      className="p-5 sm:p-6 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 animate-fade-in"
                    >
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 font-bold text-sm">
                        <MessageSquare className="h-4 w-4" />
                        <span>{language === "te" ? "కాపరి హృదయపూర్వక సందేశం" : language === "hi" ? "पादरी का हृदयस्पर्शी संदेश" : "Pastoral Heart"}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-100 text-xs sm:text-sm lg:text-base leading-relaxed italic font-medium">
                        "{pageT.messageText || "Welcome to Kingdom of Christ Ministries. Our heart is to see every individual walk in the fullness of God's love, purpose, and grace. We invite you to grow, worship, and serve together with us."}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Action Links */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Link
                    href="/prayer"
                    className="w-full sm:w-auto px-5 py-3 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Flame className="h-4 w-4 text-amber-300" />
                    <span>{language === "te" ? "పాస్టర్ గారి ప్రార్థన కోరండి" : language === "hi" ? "पादरी की प्रार्थना का अनुरोध करें" : "Request Pastoral Prayer"}</span>
                  </Link>

                  <Link
                    href="/contact"
                    className="w-full sm:w-auto px-5 py-3 bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all duration-200 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98]"
                  >
                    <span>{language === "te" ? "పాస్టరల్ కార్యాలయాన్ని సంప్రదించండి" : language === "hi" ? "कार्यालय से संपर्क करें" : "Contact Pastoral Office"}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 📜 Guiding Principles of Leadership Section */}
      <section className="py-16 sm:py-24 bg-slate-100/60 dark:bg-slate-900/30 border-y border-slate-200/70 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              {pageT.pillarsTitle || "Guiding Principles of Leadership"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg mb-5 font-medium">
              {pageT.pillarsSubtitle || "Rooted in Scripture, committed to servant leadership"}
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {corePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-md shadow-slate-900/5 dark:shadow-black/30 border ${pillar.border} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between overflow-hidden group`}
                >
                  <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${pillar.accent}`} />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl ${pillar.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-5 w-5 ${pillar.color}`} />
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${pillar.badgeBg} shadow-2xs`}>
                        {pillar.verse}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                      {pillar.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 👥 Ministry Leaders Directory Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              {pageT.teamTitle || "Ministry Leaders"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg font-medium">
              {pageT.teamSubtitle || "Dedicated servants leading our various ministries across all campuses"}
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="max-w-3xl mx-auto mb-10 space-y-4">
            
            {/* Horizontal Scrollable Filter Tabs (Mobile Ergonomic, Single Row, Zero Breaking) */}
            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 sm:px-0">
              {[
                { id: "all", label: pageT.filterAll || "All Ministries" },
                { id: "worship", label: pageT.filterWorship || "Worship & Media" },
                { id: "youth", label: pageT.filterYouth || "Youth & NextGen" },
                { id: "care", label: pageT.filterCare || "Care & Prayer" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                    selectedFilter === tab.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-102"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-400 dark:hover:border-purple-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                aria-label={pageT.searchPlaceholder || "Search ministries or leaders"}
                placeholder={pageT.searchPlaceholder || (language === "te" ? "పరిచర్యలు లేదా నాయకులను శోధించండి..." : language === "hi" ? "मंत्रालयों या नेताओं को खोजें..." : "Search ministries or leaders...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium shadow-xs transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>

          {/* Ministry Cards Grid */}
          {filteredMinistries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {filteredMinistries.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg shadow-slate-900/5 dark:shadow-black/20 border ${item.borderColor} hover:border-purple-400/60 dark:hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group overflow-hidden`}
                  >
                    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.accent}`} />

                    <div>
                      {/* Badge & Icon Header */}
                      <div className="flex items-center justify-between mb-5">
                        <div className={`w-12 h-12 ${item.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-6 w-6 ${item.color}`} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
                          {item.tag}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2.5">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                        {item.desc}
                      </p>
                    </div>

                    <div>
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                            {item.roleTitle}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedMinistry(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 cursor-pointer group/btn shrink-0 whitespace-nowrap"
                        >
                          <span>{pageT.viewDetails || "View Details"}</span>
                          <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto">
              <Search className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-semibold text-sm">
                No ministries match your search criteria.
              </p>
              <button
                onClick={() => { setSelectedFilter("all"); setSearchQuery(""); }}
                className="mt-4 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}

        </div>
      </section>

      {/* 🔍 Interactive Ministry Detail Modal */}
      {selectedMinistry && (
        <div 
          className="fixed inset-0 z-[10005] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedMinistry(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ministry-detail-title"
        >
          <div 
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[88dvh] sm:max-h-[85vh] flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Accent Line */}
            <div className={`h-1.5 bg-gradient-to-r ${selectedMinistry.accent} shrink-0`} />

            {/* Modal Header */}
            <div className="p-4 sm:p-6 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 ${selectedMinistry.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0`}>
                  <selectedMinistry.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${selectedMinistry.color}`} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 block truncate">
                    {selectedMinistry.tag}
                  </span>
                  <h3 id="ministry-detail-title" className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white truncate">
                    {selectedMinistry.title}
                  </h3>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedMinistry(null)}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 rounded-xl text-slate-600 dark:text-slate-300 transition-all cursor-pointer shrink-0"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Modal Body - Fluid scroll */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 flex-1 overscroll-contain">
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {selectedMinistry.desc}
              </p>

              {/* Focus Areas List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {pageT.modalKeyAreas || "Key Focus Areas"}
                </h4>
                <div className="space-y-2">
                  {selectedMinistry.focusAreas.map((area: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meeting Schedule */}
              <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                  {pageT.modalSchedule || "Schedule & Gatherings"}
                </h4>
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  {selectedMinistry.schedule}
                </p>
              </div>
            </div>

            {/* Modal Actions - Pinned Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 shrink-0 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/get-involved/volunteer"
                onClick={() => setSelectedMinistry(null)}
                className="flex-1 py-2.5 sm:py-3 px-4 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm text-center shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{pageT.modalJoin || "Get Involved in this Ministry"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <button
                onClick={() => setSelectedMinistry(null)}
                className="py-2.5 sm:py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                {pageT.modalClose || "Close"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🚀 Call to Action Section — Full Multilingual Support */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden text-white border-t border-slate-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              {pageT.serve || "Serve With Us"}
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-10 font-medium">
              {pageT.serveDesc || "Discover your calling and join our ministry team"}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/get-involved/volunteer"
                className="group px-7 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-purple-600/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5"
              >
                <span>{pageT.ctaVolunteer || "Volunteer With Us"}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/contact"
                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center gap-2"
              >
                <span>{pageT.ctaContact || "Contact Us"}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
