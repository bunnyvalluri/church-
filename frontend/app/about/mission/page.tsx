"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  Eye,
  Heart,
  Users,
  BookOpen,
  Globe,
  Flame,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Search,
  X,
  ChevronRight,
  Copy,
  Check,
  Compass,
  Cross,
  ShieldCheck,
  Award,
  Layers,
  HeartHandshake
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";

export default function MissionPage() {
  const { t } = useLanguage();
  const pageT = (t as any)?.pages?.mission || {};

  // Filter & Search states for Core Values
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Selected item modal state
  const [selectedModalItem, setSelectedModalItem] = useState<{
    title: string;
    category?: string;
    desc: string;
    verse: string;
    quote?: string;
    details: string[];
    icon: any;
    accent: string;
    color: string;
    bg: string;
  } | null>(null);

  // Stats Data
  const stats = [
    {
      value: "1",
      label: pageT.statFocus || "Core Calling",
      subtext: "To Know Christ & Make Him Known",
      icon: Target,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
    },
    {
      value: "4",
      label: pageT.statPillars || "Mission Pillars",
      subtext: "Worship • Grow • Serve • Reach",
      icon: Layers,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    },
    {
      value: "5",
      label: pageT.statVision || "Vision Objectives",
      subtext: "Transforming Lives Across Hyderabad",
      icon: Eye,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-500/10 dark:bg-pink-500/20",
    },
    {
      value: "6",
      label: pageT.statValues || "Kingdom Core Values",
      subtext: "Anchored in Eternal Truth",
      icon: Sparkles,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-400/20",
    },
  ];

  // Mission Pillars
  const missionPillars = [
    {
      id: "worship",
      title: pageT.worshipTitle || "Worship",
      subtitle: pageT.worshipSubtitle || "God with all our hearts",
      desc: pageT.worshipDesc || "Honoring God in spirit and truth through passionate praise, prayer, and lifestyle devotion.",
      verse: "John 4:24",
      quote: "God is spirit, and his worshipers must worship in the Spirit and in truth.",
      details: [
        "Dynamic, Spirit-led Sunday corporate worship services",
        "Cultivating personal daily devotion and intimate prayer",
        "Expressing gratitude and honor to God in all we do",
      ],
      icon: Flame,
      accent: "from-purple-500 to-indigo-500",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
    },
    {
      id: "grow",
      title: pageT.growTitle || "Grow",
      subtitle: pageT.growSubtitle || "Disciples who love Jesus",
      desc: pageT.growDesc || "Nurturing believers to reach spiritual maturity through biblical teaching and discipleship.",
      verse: "2 Peter 3:18",
      quote: "Grow in the grace and knowledge of our Lord and Savior Jesus Christ.",
      details: [
        "Weekly life-transforming Bible studies and cell groups",
        "Discipleship training for foundational Christian living",
        "Empowering members to discover and use their spiritual gifts",
      ],
      icon: BookOpen,
      accent: "from-indigo-500 to-cyan-500",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    },
    {
      id: "serve",
      title: pageT.serveTitle || "Serve",
      subtitle: pageT.serveSubtitle || "Our community with compassion",
      desc: pageT.serveDesc || "Demonstrating Christ's love through hands-on charitable outreach, care, and practical support.",
      verse: "Galatians 5:13",
      quote: "Serve one another humbly in love.",
      details: [
        "Community food distribution, clothing drives, and medical assistance",
        "Supporting widows, orphans, and underprivileged families",
        "Active volunteer teams serving in various ministry departments",
      ],
      icon: HeartHandshake,
      accent: "from-pink-500 to-rose-500",
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-500/10 dark:bg-pink-500/20",
    },
    {
      id: "reach",
      title: pageT.reachTitle || "Reach",
      subtitle: pageT.reachSubtitle || "The lost with the Gospel",
      desc: pageT.reachDesc || "Boldly proclaiming the Good News of salvation locally across Hyderabad and beyond.",
      verse: "Mark 16:15",
      quote: "Go into all the world and preach the gospel to all creation.",
      details: [
        "Street evangelism, gospel rallies, and door-to-door visits",
        "Planting prayer cells and fellowship groups in new areas",
        "Digital media outreach sharing testimony and sermons globally",
      ],
      icon: Globe,
      accent: "from-emerald-500 to-teal-500",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
  ];

  // Vision Goals
  const visionGoals = [
    {
      id: "v1",
      title: pageT.v1Title || "Inclusive Spiritual Family",
      text: pageT.v1Text || "A community where everyone belongs, feels valued, and finds spiritual home.",
      verse: "Romans 12:5",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
    },
    {
      id: "v2",
      title: pageT.v2Title || "Spiritual Maturity & Discipleship",
      text: pageT.v2Text || "Believers growing in faith, biblical wisdom, and Christ-like character.",
      verse: "Ephesians 4:14-15",
      icon: BookOpen,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    },
    {
      id: "v3",
      title: pageT.v3Title || "Strengthened Families",
      text: pageT.v3Text || "Families anchored in God's Word, prayer, and mutual love.",
      verse: "Joshua 24:15",
      icon: Heart,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-500/10 dark:bg-pink-500/20",
    },
    {
      id: "v4",
      title: pageT.v4Title || "Transformed Lives",
      text: pageT.v4Text || "Lives redeemed, healed, and set free by God's supernatural power.",
      verse: "2 Corinthians 5:17",
      icon: Sparkles,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
    },
    {
      id: "v5",
      title: pageT.v5Title || "Gospel Impacting Neighborhoods",
      text: pageT.v5Text || "The light of Christ saturating every corner of Hyderabad and surrounding regions.",
      verse: "Matthew 28:19-20",
      icon: Globe,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
  ];

  // Core Values Data
  const coreValues = useMemo(
    () => [
      {
        id: "val-prayer",
        title: pageT.valPrayerTitle || "Prayer First",
        category: "spiritual",
        desc: pageT.valPrayerDesc || "We seek God in everything through personal & corporate intercession before making any decision.",
        verse: "1 Thessalonians 5:17",
        quote: "Pray continually, give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
        details: [
          "24/7 Prayer support helpline for all believers and seekers",
          "Special Friday & Thursday corporate intercession meetings",
          "Fast & Prayer retreats for breakthroughs and revival",
        ],
        icon: Flame,
        accent: "from-purple-500 to-indigo-500",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-500/10 dark:bg-purple-500/20",
      },
      {
        id: "val-bible",
        title: pageT.valBibleTitle || "Bible-Based",
        category: "spiritual",
        desc: pageT.valBibleDesc || "Scripture guides our lives, teachings, and decision-making as the uncompromised Word of God.",
        verse: "2 Timothy 3:16",
        quote: "All Scripture is God-breathed and useful for teaching, rebuking, correcting and training in righteousness.",
        details: [
          "In-depth verse-by-verse expository preaching",
          "Structured Bible reading plans and memory verses",
          "Anchoring all church leadership guidelines in Biblical truth",
        ],
        icon: BookOpen,
        accent: "from-indigo-500 to-cyan-500",
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      },
      {
        id: "val-love",
        title: pageT.valLoveTitle || "Love-Driven",
        category: "community",
        desc: pageT.valLoveDesc || "We show Christ's sacrificial and unconditional love to everyone, regardless of background.",
        verse: "1 Corinthians 13:13",
        quote: "And now these three remain: faith, hope and love. But the greatest of these is love.",
        details: [
          "Welcoming every individual with open arms and zero judgment",
          "Active compassion ministry serving needy families",
          "Fostering an atmosphere of forgiveness and grace",
        ],
        icon: Heart,
        accent: "from-pink-500 to-rose-500",
        color: "text-pink-600 dark:text-pink-400",
        bg: "bg-pink-500/10 dark:bg-pink-500/20",
      },
      {
        id: "val-community",
        title: pageT.valCommunityTitle || "Community-Focused",
        category: "community",
        desc: pageT.valCommunityDesc || "We do life together, building authentic relationships and supporting one another in faith.",
        verse: "Acts 2:42",
        quote: "They devoted themselves to the apostles' teaching and to fellowship, to the breaking of bread and to prayer.",
        details: [
          "Small cell groups meeting regularly across Hyderabad",
          "Fellowship meals, family events, and youth retreats",
          "Mutual encouragement during life challenges and celebrations",
        ],
        icon: Users,
        accent: "from-emerald-500 to-teal-500",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      },
      {
        id: "val-mission",
        title: pageT.valMissionTitle || "Mission-Minded",
        category: "outreach",
        desc: pageT.valMissionDesc || "We reach the lost and share the hope of Christ in our city, nation, and beyond.",
        verse: "Mark 16:15",
        quote: "Go into all the world and preach the gospel to all creation.",
        details: [
          "Local neighborhood outreach programs in Shapur, Subhash Nagar, and Bahadurpally",
          "Supporting native evangelists and mission expansion",
          "Youth mission trips and community awareness rallies",
        ],
        icon: Globe,
        accent: "from-amber-500 to-orange-500",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
      },
      {
        id: "val-spirit",
        title: pageT.valSpiritTitle || "Spirit-Empowered",
        category: "spiritual",
        desc: pageT.valSpiritDesc || "We depend on the Holy Spirit's guidance, gifts, and supernatural power in every ministry endeavor.",
        verse: "Acts 1:8",
        quote: "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses.",
        details: [
          "Encouraging spiritual gifts for the edification of the Church",
          "Praying for divine healing, deliverance, and breakthroughs",
          "Listening for the Holy Spirit's promptings in ministry planning",
        ],
        icon: Sparkles,
        accent: "from-purple-500 to-pink-500",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-500/10 dark:bg-purple-500/20",
      },
    ],
    [pageT]
  );

  // Filtered Core Values
  const filteredCoreValues = useMemo(() => {
    return coreValues.filter((val) => {
      const matchesCategory = selectedCategory === "all" || val.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        val.title.toLowerCase().includes(query) ||
        val.desc.toLowerCase().includes(query) ||
        val.verse.toLowerCase().includes(query) ||
        val.quote.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [coreValues, selectedCategory, searchQuery]);

  // Copy Mission Statement summary
  const handleCopyMission = () => {
    const textToCopy = `KINGDOM OF CHRIST MINISTRIES - MISSION & VISION SUMMARY\n\n` +
      `Our Mission: "To know Christ and make Him known"\n` +
      `Pillars: Worship, Grow, Serve, Reach\n\n` +
      `Our Vision: "A church where every person experiences transformation through Christ"\n\n` +
      `Core Values:\n` +
      coreValues.map((v, i) => `${i + 1}. ${v.title} (${v.verse}): ${v.desc}`).join("\n") +
      `\n\nKingdom of Christ Ministries | Hyderabad, Telangana`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* 🌌 Hero Section */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 bg-slate-950 overflow-hidden text-white">
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
              <Target className="h-4 w-4 text-purple-300" />
              <span>{pageT.badge || "Mission, Vision & Core Values"}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight animate-fade-in-up">
              {pageT.heroTitle || "Our Purpose & Direction"}
            </h1>

            <p className="text-lg sm:text-xl text-purple-100 animate-fade-in-up animate-delay-200 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
              {pageT.heroSubtitle || "Guided by Holy Scripture, Motivated by Love, Empowered by the Holy Spirit."}
            </p>

            {/* Key Quote Pill */}
            <div className="inline-block p-4 sm:p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-xl mx-auto shadow-2xl animate-scale-in animate-delay-300">
              <p className="text-sm sm:text-base text-purple-200 italic font-semibold">
                "To know Christ and make Him known"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Floating Stats & Pillars Overview Bar */}
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
                <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-0.5">
                  {stat.label}
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
                  {stat.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🎯 Section 1: Our Mission */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/20 animate-glow">
              <Target className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4">
              <span>{pageT.missionBadge || "Our Primary Mandate"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              {pageT.missionHeading || "Our Mission"}
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 mb-6">
              "To know Christ and make Him known"
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              Everything we do as Kingdom of Christ Ministries flows from this singular commitment: deepening our relationship with Jesus and bringing His salvation to our neighbors and the world.
            </p>
          </div>

          {/* 4 Mission Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {missionPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className="relative group bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${pillar.accent}`} />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-13 h-13 ${pillar.bg} border border-slate-200/50 dark:border-slate-700/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${pillar.color}`} />
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {pillar.verse}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-3">
                      {pillar.subtitle}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-5">
                      {pillar.desc}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedModalItem({
                        title: pillar.title,
                        desc: pillar.desc,
                        verse: pillar.verse,
                        quote: pillar.quote,
                        details: pillar.details,
                        icon: pillar.icon,
                        accent: pillar.accent,
                        color: pillar.color,
                        bg: pillar.bg,
                      })
                    }
                    className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800/70 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm"
                  >
                    <span>Pillar Details</span>
                    <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 👁️ Section 2: Our Vision */}
      <section className="py-20 bg-gradient-to-br from-purple-900/10 via-slate-900/5 to-indigo-900/10 dark:from-purple-950/40 dark:via-slate-950/60 dark:to-indigo-950/40 border-y border-purple-200/50 dark:border-purple-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
              <Eye className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4">
              <span>{pageT.visionBadge || "Our Future Picture"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              {pageT.visionHeading || "Our Vision"}
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-8 max-w-3xl mx-auto">
              "A church where every person experiences transformation through Christ"
            </p>
          </div>

          {/* Vision Objectives List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto stagger-children">
            {visionGoals.map((goal) => {
              const Icon = goal.icon;
              return (
                <div
                  key={goal.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-800 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${goal.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${goal.color}`} />
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/40">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        {goal.verse}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {goal.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      {goal.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🌟 Section 3: Core Values with Search & Interactive Modal */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Living the Gospel Daily</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              {pageT.valuesHeading || "Core Values"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
              The non-negotiable spiritual standards that shape our worship, culture, and community interaction.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="max-w-4xl mx-auto mb-12 space-y-6">
            {/* Search Input Box */}
            <div className="max-w-xl mx-auto relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={pageT.searchPlaceholder || "Search values, scripture, or keywords..."}
                  className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
              {[
                { id: "all", label: "All Values" },
                { id: "spiritual", label: "Spiritual Foundations" },
                { id: "community", label: "Community & Love" },
                { id: "outreach", label: "Outreach & Mission" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                    selectedCategory === tab.id
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Core Values Grid */}
          {filteredCoreValues.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl mx-auto">
              <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                No core values found matching "{searchQuery}"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {filteredCoreValues.map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.id}
                    className="relative group bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${val.accent}`} />

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
                        {val.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                        {val.desc}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedModalItem({
                          title: val.title,
                          category: val.category,
                          desc: val.desc,
                          verse: val.verse,
                          quote: val.quote,
                          details: val.details,
                          icon: val.icon,
                          accent: val.accent,
                          color: val.color,
                          bg: val.bg,
                        })
                      }
                      className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800/60 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm"
                    >
                      <span>Deep Dive & Scriptural Proof</span>
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 📄 Downloadable / Copy Statement Section */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-900/10 via-slate-900/5 to-indigo-900/10 dark:from-purple-950/40 dark:via-slate-900/60 dark:to-indigo-950/40 border border-purple-200/60 dark:border-purple-800/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-black uppercase tracking-wider">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Summary & Sharing</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Share Our Mission & Vision
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl">
                  Copy our complete Mission, Vision & Core Values statement for group study, personal reflection, or sharing with friends.
                </p>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={handleCopyMission}
                  className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/30 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Summary Statement</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 Call To Action (CTA) Section */}
      <section className="py-20 bg-slate-950 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight animate-fade-in-up">
              Join Our Mission Today
            </h2>

            <p className="text-lg sm:text-xl text-purple-100 mb-10 animate-fade-in-up animate-delay-100 font-medium">
              Be part of something greater. Experience fellowship, grow in faith, and make a lasting impact across Hyderabad.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in animate-delay-200">
              <Link
                href="/membership"
                className="group px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2.5 shadow-lg"
              >
                <span>Become a Member</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-purple-600" />
              </Link>

              <Link
                href="/about/story"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center"
              >
                Our Story
              </Link>

              <Link
                href="/about/beliefs"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center"
              >
                Our Beliefs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📖 Deep Dive Detail Modal */}
      {selectedModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className={`p-6 sm:p-8 bg-gradient-to-r ${selectedModalItem.accent} text-white relative`}>
              <button
                onClick={() => setSelectedModalItem(null)}
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{selectedModalItem.verse}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">{selectedModalItem.title}</h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">
                  Overview & Purpose
                </h4>
                <p className="text-base sm:text-lg leading-relaxed font-medium">
                  {selectedModalItem.desc}
                </p>
              </div>

              {selectedModalItem.quote && (
                <div className="p-5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/50">
                  <p className="text-sm sm:text-base italic font-semibold text-purple-900 dark:text-purple-200">
                    "{selectedModalItem.quote}"
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-3">
                  Practical Living & Ministry Action
                </h4>
                <div className="space-y-2.5">
                  {selectedModalItem.details.map((item: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedModalItem(null)}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}