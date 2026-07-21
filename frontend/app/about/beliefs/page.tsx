"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Cross, 
  Heart, 
  Church, 
  Sparkles, 
  ArrowRight, 
  Search, 
  X, 
  Flame, 
  ShieldCheck, 
  Book, 
  Globe, 
  Users, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileText,
  ChevronRight,
  HeartHandshake,
  Crown
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";

export default function BeliefsPage() {
  const { t } = useLanguage();
  const pageT = t.pages.beliefs;

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Selected doctrine modal state
  const [selectedDoctrine, setSelectedDoctrine] = useState<any | null>(null);

  // Stats Data
  const stats = [
    { value: "66", label: pageT.statBooks || "Inspired Books", icon: BookOpen, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 dark:bg-purple-500/20" },
    { value: "1", label: pageT.statGod || "Eternal Trinity", icon: Cross, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10 dark:bg-indigo-500/20" },
    { value: "100%", label: pageT.statGrace || "Grace by Faith", icon: Heart, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-500/10 dark:bg-pink-500/20" },
    { value: "6", label: pageT.statValues || "Kingdom Core Values", icon: Sparkles, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 dark:bg-amber-400/20" },
  ];

  // Doctrines List
  const doctrines = useMemo(() => [
    {
      id: "d1",
      title: pageT.d1Title || "The Holy Bible",
      category: pageT.d1Category || "god",
      desc: pageT.d1Desc || "We believe the 66 books of the Holy Bible are fully inspired by God, infallible, and the final authority for all Christian faith and practice.",
      verse: pageT.d1Verse || "2 Timothy 3:16-17",
      quote: pageT.d1Quote || "All Scripture is God-breathed and useful for teaching, rebuking, correcting and training in righteousness.",
      passages: pageT.d1Passages || ["2 Timothy 3:16-17", "2 Peter 1:20-21", "Psalm 119:105", "Hebrews 4:12"],
      deep: pageT.d1Deep || "The Holy Bible is God's written revelation to mankind. It provides divine direction, spiritual nourishment, and absolute truth for every generation.",
      icon: BookOpen,
      accent: "from-purple-500 to-indigo-500",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 dark:bg-purple-500/20"
    },
    {
      id: "d2",
      title: pageT.d2Title || "The Holy Trinity",
      category: pageT.d2Category || "god",
      desc: pageT.d2Desc || "We believe in one God, eternally existing in three co-equal persons: Father, Son, and Holy Spirit.",
      verse: pageT.d2Verse || "Matthew 28:19",
      quote: pageT.d2Quote || "Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.",
      passages: pageT.d2Passages || ["Matthew 28:19", "2 Corinthians 13:14", "Genesis 1:26", "John 1:1-3"],
      deep: pageT.d2Deep || "God is one in essence yet distinct in three divine persons. Father is the Creator; Son is the Redeemer; Holy Spirit is the Sanctifier.",
      icon: Cross,
      accent: "from-indigo-500 to-cyan-500",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20"
    },
    {
      id: "d3",
      title: pageT.d3Title || "Jesus Christ the Lord",
      category: pageT.d3Category || "god",
      desc: pageT.d3Desc || "We believe Jesus Christ is fully God and fully man, born of a virgin, died on the cross for our sins, and bodily resurrected.",
      verse: pageT.d3Verse || "John 14:6",
      quote: pageT.d3Quote || "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'",
      passages: pageT.d3Passages || ["John 14:6", "1 Timothy 2:5", "Philippians 2:5-11", "1 Corinthians 15:3-4"],
      deep: pageT.d3Deep || "Jesus Christ is the eternal Son of God who humbled Himself to ransom humanity from sin through His sacrificial death and triumphant resurrection.",
      icon: Crown,
      accent: "from-amber-500 to-orange-500",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20"
    },
    {
      id: "d4",
      title: pageT.d4Title || "Salvation by Grace",
      category: pageT.d4Category || "salvation",
      desc: pageT.d4Desc || "We believe salvation is a free gift of God's grace, received solely through personal faith in Jesus Christ.",
      verse: pageT.d4Verse || "Ephesians 2:8-9",
      quote: pageT.d4Quote || "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God.",
      passages: pageT.d4Passages || ["Ephesians 2:8-9", "Romans 10:9-10", "John 3:16", "Titus 3:5"],
      deep: pageT.d4Deep || "Salvation brings forgiveness, spiritual rebirth, justification, and eternal life for anyone who repents and puts trust in Jesus Christ.",
      icon: Heart,
      accent: "from-pink-500 to-rose-500",
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-500/10 dark:bg-pink-500/20"
    },
    {
      id: "d5",
      title: pageT.d5Title || "The Holy Spirit & Miracles",
      category: pageT.d5Category || "salvation",
      desc: pageT.d5Desc || "We believe in the present ministry of the Holy Spirit, who indwells, empowers, gifts, and equips believers.",
      verse: pageT.d5Verse || "Acts 1:8",
      quote: pageT.d5Quote || "You will receive power when the Holy Spirit comes on you; and you will be my witnesses to the ends of the earth.",
      passages: pageT.d5Passages || ["Acts 1:8", "Galatians 5:22-23", "1 Corinthians 12:4-11", "Romans 8:14-16"],
      deep: pageT.d5Deep || "The Holy Spirit convicts the world of sin, regenerates believers, and imparts spiritual gifts for edifying the Church and operating in divine signs and wonders.",
      icon: Flame,
      accent: "from-red-500 to-amber-500",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10 dark:bg-red-500/20"
    },
    {
      id: "d6",
      title: pageT.d6Title || "The Body of Christ & Church",
      category: pageT.d6Category || "salvation",
      desc: pageT.d6Desc || "We believe the Church is the universal body of Christ, called to gather locally for worship, fellowship, and outreach.",
      verse: pageT.d6Verse || "Matthew 16:18",
      quote: pageT.d6Quote || "And I tell you that you are Peter, and on this rock I will build my church, and the gates of Hades will not overcome it.",
      passages: pageT.d6Passages || ["Matthew 16:18", "Acts 2:42-47", "Hebrews 10:24-25", "1 Corinthians 12:12-27"],
      deep: pageT.d6Deep || "The local church is a lighthouse of prayer, healing, and fellowship. Through baptism and Holy Communion, we celebrate Christ's victory.",
      icon: Church,
      accent: "from-emerald-500 to-teal-500",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20"
    },
    {
      id: "d7",
      title: pageT.d7Title || "Prayer & Faith-Filled Living",
      category: pageT.d7Category || "life",
      desc: pageT.d7Desc || "We believe prayer is vital communication with God, unlocking spiritual breakthroughs and divine healing.",
      verse: pageT.d7Verse || "1 Thessalonians 5:17",
      quote: pageT.d7Quote || "Pray continually, give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
      passages: pageT.d7Passages || ["1 Thessalonians 5:17", "James 5:16", "Philippians 4:6-7", "Hebrews 11:6"],
      deep: pageT.d7Deep || "Prayer is the engine of Kingdom of Christ Ministries. We believe in 24/7 intercession and trusting God for miracles in every situation.",
      icon: ShieldCheck,
      accent: "from-blue-500 to-indigo-500",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/20"
    },
    {
      id: "d8",
      title: pageT.d8Title || "Eternal Hope & Second Coming",
      category: pageT.d8Category || "life",
      desc: pageT.d8Desc || "We believe in the personal return of Jesus Christ in glory, the resurrection of the dead, and eternal life with God.",
      verse: pageT.d8Verse || "1 Thessalonians 4:16-17",
      quote: pageT.d8Quote || "For the Lord himself will come down from heaven, with a loud command, with the voice of the archangel.",
      passages: pageT.d8Passages || ["1 Thessalonians 4:16-17", "Revelation 21:1-4", "John 14:1-3", "Matthew 24:30-31"],
      deep: pageT.d8Deep || "Our ultimate anchor is the blessed hope of Christ's return, inspiring us to live holy, purposeful lives sharing the Gospel with love.",
      icon: Sparkles,
      accent: "from-purple-500 to-pink-500",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 dark:bg-purple-500/20"
    }
  ], [pageT]);

  // Core Values Data
  const values = [
    { name: pageT.v1Name || "Faith", desc: pageT.v1Desc || "Trusting God unconditionally in all circumstances and stepping out in bold obedience.", verse: pageT.v1Verse || "Hebrews 11:1", icon: ShieldCheck, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 dark:bg-purple-500/20" },
    { name: pageT.v2Name || "Love", desc: pageT.v2Desc || "Demonstrating the sacrificial, unconditional love of Christ to every individual.", verse: pageT.v2Verse || "1 Corinthians 13:13", icon: Heart, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-500/10 dark:bg-pink-500/20" },
    { name: pageT.v3Name || "Prayer", desc: pageT.v3Desc || "Seeking God's presence continually through personal and corporate intercession.", verse: pageT.v3Verse || "1 Thess 5:17", icon: Flame, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 dark:bg-amber-500/20" },
    { name: pageT.v4Name || "Scripture", desc: pageT.v4Desc || "Living, teaching, and anchoring every decision in the uncompromised Word of God.", verse: pageT.v4Verse || "Psalm 119:105", icon: BookOpen, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10 dark:bg-indigo-500/20" },
    { name: pageT.v5Name || "Community", desc: pageT.v5Desc || "Building a warm, inclusive spiritual family where everyone belongs and flourishes.", verse: pageT.v5Verse || "Acts 2:42", icon: Users, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 dark:bg-emerald-500/20" },
    { name: pageT.v6Name || "Mission", desc: pageT.v6Desc || "Reaching the lost, serving the needy, and making disciples locally and globally.", verse: pageT.v6Verse || "Mark 16:15", icon: Globe, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10 dark:bg-cyan-500/20" },
  ];

  // Filtering Logic
  const filteredDoctrines = useMemo(() => {
    return doctrines.filter((doc) => {
      const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        doc.title.toLowerCase().includes(query) ||
        doc.desc.toLowerCase().includes(query) ||
        doc.verse.toLowerCase().includes(query) ||
        doc.quote.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [doctrines, selectedCategory, searchQuery]);

  // Copy full statement summary
  const handleCopyStatement = () => {
    const textToCopy = `${pageT.title || "Our Beliefs & Doctrines"}\n${pageT.subtitle}\n\n${doctrines.map((d, i) => `${i + 1}. ${d.title} (${d.verse}): ${d.desc}`).join("\n\n")}\n\nKingdom of Christ Ministries | Hyderabad`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* 🌌 Hero Section with Ambient Glows & Search Bar */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15" />
        <div className="hero-orb-1 opacity-70" />
        <div className="hero-orb-2 opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <BackToHome label={t.nav?.home || "Home"} />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-lg animate-bounce-in">
              <BookOpen className="h-4 w-4 text-purple-300" />
              <span>{pageT.badge || "Statement of Faith"}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight animate-fade-in-up">
              {pageT.title || "Our Beliefs & Doctrines"}
            </h1>

            <p className="text-lg sm:text-xl text-purple-100 animate-fade-in-up animate-delay-200 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
              {pageT.subtitle || "Anchored in the Holy Scripture, Guided by God's Grace"}
            </p>

            {/* Search Input Box */}
            <div className="max-w-xl mx-auto relative animate-scale-in animate-delay-300">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={pageT.searchPlaceholder || "Search doctrines, scriptures, or values..."}
                  className="w-full pl-12 pr-10 py-3.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-2xl transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Floating Faith Stats Bar */}
      <section className="relative z-20 -mt-12 sm:-mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 📜 Core Doctrines Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4">
              <Cross className="h-3.5 w-3.5" />
              <span>Doctrinal Pillars</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              {pageT.doctrinesTitle || "Core Biblical Doctrines"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
              {pageT.doctrinesSubtitle || "The timeless truths that govern our faith, worship, and daily ministry"}
            </p>
          </div>

          {/* Filter Category Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-12">
            {[
              { id: "all", label: pageT.filterAll || "All Doctrines" },
              { id: "god", label: pageT.filterGod || "God & Scripture" },
              { id: "salvation", label: pageT.filterSalvation || "Salvation & Church" },
              { id: "life", label: pageT.filterLife || "Christian Life & Hope" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                  selectedCategory === tab.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Doctrines Grid */}
          {filteredDoctrines.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                No doctrines found matching "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-4 px-6 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 stagger-children">
              {filteredDoctrines.map((doctrine) => {
                const Icon = doctrine.icon;
                return (
                  <div
                    key={doctrine.id}
                    className="relative group bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${doctrine.accent}`} />

                    <div>
                      {/* Top Bar: Icon & Scripture Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-14 h-14 ${doctrine.bg} border border-slate-200/50 dark:border-slate-700/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-7 w-7 ${doctrine.color}`} />
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 rounded-full text-xs font-bold tracking-wide">
                          <BookOpen className="h-3.5 w-3.5" />
                          {doctrine.verse}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                        {doctrine.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6">
                        {doctrine.desc}
                      </p>

                      {/* Key Quote Callout Box */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border-l-4 border-purple-600 dark:border-purple-500 mb-6">
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic font-medium">
                          "{doctrine.quote}"
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <button
                      onClick={() => setSelectedDoctrine(doctrine)}
                      className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800/60 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm"
                    >
                      <span>{pageT.readScripture || "Deep Dive & Verses"}</span>
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 🌟 Our Kingdom Core Values Grid */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Living the Gospel</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              {pageT.valuesTitle || "Our Kingdom Core Values"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
              {pageT.valuesSubtitle || "Guiding principles shaping our spiritual walk and community life"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${val.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${val.color}`} />
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {val.verse}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {val.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 📄 Statement of Faith Download & Share Card */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-900/10 via-slate-900/5 to-indigo-900/10 dark:from-purple-950/40 dark:via-slate-900/60 dark:to-indigo-950/40 border border-purple-200/60 dark:border-purple-800/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-black uppercase tracking-wider">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{pageT.downloadTitle || "Full Statement of Faith"}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Want to Study Our Beliefs Further?
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-base max-w-xl">
                  {pageT.downloadDesc || "Explore or copy our complete, detailed statement of faith for personal or group Bible study."}
                </p>
              </div>

              <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCopyStatement}
                  className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/30 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>{pageT.copyStatement || "Copy Summary Statement"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 Call to Action Section */}
      <section className="py-20 bg-slate-950 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight animate-fade-in-up">
              Deepen Your Spiritual Journey
            </h2>

            <p className="text-lg sm:text-xl text-white/90 mb-10 animate-fade-in-up animate-delay-100 font-medium">
              Join us in worship, study the Word together, and experience the power of faith in action.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in animate-delay-200">
              <Link
                href="/about/story"
                className="group px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2.5 shadow-lg"
              >
                <span>Our Story</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-purple-600" />
              </Link>

              <Link
                href="/membership"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📖 Doctrinal Detail Modal */}
      {selectedDoctrine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className={`p-6 sm:p-8 bg-gradient-to-r ${selectedDoctrine.accent} text-white relative`}>
              <button
                onClick={() => setSelectedDoctrine(null)}
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{selectedDoctrine.verse}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">{selectedDoctrine.title}</h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">
                  {pageT.modalSummary || "Doctrinal Overview"}
                </h4>
                <p className="text-base sm:text-lg leading-relaxed font-medium">
                  {selectedDoctrine.desc}
                </p>
              </div>

              <div className="p-5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/50">
                <p className="text-sm sm:text-base italic font-semibold text-purple-900 dark:text-purple-200">
                  "{selectedDoctrine.quote}"
                </p>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-3">
                  Pastoral Explanation
                </h4>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedDoctrine.deep}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-3">
                  {pageT.modalScripture || "Key Scripture Passages"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedDoctrine.passages.map((passage: string, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <span>{passage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDoctrine(null)}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                {pageT.modalClose || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}