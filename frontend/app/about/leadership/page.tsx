"use client";

import { useState } from "react";
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
  Globe
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
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

  // Stats Data
  const stats = [
    { value: "20+", label: pageT.statYears || "Years of Leadership", icon: Calendar, color: "text-white", bg: "bg-purple-600 shadow-md shadow-purple-600/30" },
    { value: "6+", label: pageT.statMinistries || "Active Ministries", icon: Award, color: "text-white", bg: "bg-indigo-600 shadow-md shadow-indigo-600/30" },
    { value: "100+", label: pageT.statServants || "Servant Leaders", icon: Users, color: "text-white", bg: "bg-pink-600 shadow-md shadow-pink-600/30" },
    { value: "24/7", label: pageT.statPrayer || "Prayer Support", icon: Flame, color: "text-white", bg: "bg-amber-600 shadow-md shadow-amber-600/30" },
  ];

  // Core Pillars of Leadership
  const corePillars = [
    {
      title: pageT.pillar1Title || "Servant Leadership",
      desc: pageT.pillar1Desc || "Leading with humility, putting the needs of God's people first.",
      verse: "Mark 10:45",
      icon: HeartHandshake,
      color: "text-white",
      bg: "bg-purple-600 shadow-md shadow-purple-600/20",
      border: "border-purple-500/20 dark:border-purple-500/30",
      accent: "from-purple-500 to-indigo-500"
    },
    {
      title: pageT.pillar2Title || "Biblical Truth",
      desc: pageT.pillar2Desc || "Preaching and teaching the uncompromised Word of God.",
      verse: "2 Timothy 4:2",
      icon: BookOpen,
      color: "text-white",
      bg: "bg-indigo-600 shadow-md shadow-indigo-600/20",
      border: "border-indigo-500/20 dark:border-indigo-500/30",
      accent: "from-indigo-500 to-cyan-500"
    },
    {
      title: pageT.pillar3Title || "Prayer & Faith",
      desc: pageT.pillar3Desc || "Anchoring every decision and ministry step in fervent prayer.",
      verse: "1 Thess 5:17",
      icon: Flame,
      color: "text-white",
      bg: "bg-amber-600 shadow-md shadow-amber-600/20",
      border: "border-amber-500/20 dark:border-amber-500/30",
      accent: "from-amber-500 to-orange-500"
    },
    {
      title: pageT.pillar4Title || "Compassionate Care",
      desc: pageT.pillar4Desc || "Shepherding families and individuals with Christ-like love.",
      verse: "1 Peter 5:2",
      icon: ShieldCheck,
      color: "text-white",
      bg: "bg-pink-600 shadow-md shadow-pink-600/20",
      border: "border-pink-500/20 dark:border-pink-500/30",
      accent: "from-pink-500 to-rose-500"
    }
  ];

  // Detailed Ministry Data
  const ministries = [
    {
      id: "worship",
      title: pageT.worship,
      desc: pageT.worshipDesc,
      icon: Music,
      category: "worship",
      tag: "Worship & Praise",
      color: "text-white",
      bgColor: "bg-purple-600 shadow-md shadow-purple-600/30",
      borderColor: "border-purple-200 dark:border-purple-800/50",
      accent: "from-purple-500 to-indigo-500",
      focusAreas: [
        "Sunday Praise & Worship Services",
        "Choir & Vocal Training Sessions",
        "Sound, Media & Live Broadcast Team",
        "Worship Nights & Special Events"
      ],
      schedule: "Practices: Saturday 6:00 PM | Services: Sunday Mornings",
      roleTitle: "Ministry Leader"
    },
    {
      id: "youth",
      title: pageT.youth,
      desc: pageT.youthDesc,
      icon: Sparkles,
      category: "youth",
      tag: "NextGen Generation",
      color: "text-white",
      bgColor: "bg-indigo-600 shadow-md shadow-indigo-600/30",
      borderColor: "border-indigo-200 dark:border-indigo-800/50",
      accent: "from-indigo-500 to-cyan-500",
      focusAreas: [
        "Weekly Youth Fellowship Meetings",
        "Campus & College Outreach",
        "Youth Leadership & Discipleship Camps",
        "Music & Drama Team"
      ],
      schedule: "Youth Service: Saturday 5:30 PM",
      roleTitle: "Ministry Leader"
    },
    {
      id: "women",
      title: pageT.women,
      desc: pageT.womenDesc,
      icon: Heart,
      category: "care",
      tag: "Fellowship & Prayer",
      color: "text-white",
      bgColor: "bg-pink-600 shadow-md shadow-pink-600/30",
      borderColor: "border-pink-200 dark:border-pink-800/50",
      accent: "from-pink-500 to-rose-500",
      focusAreas: [
        "Weekly Sisterhood Prayer Meetings",
        "Community Outreach & Support",
        "Women's Annual Spiritual Conference",
        "Family & Marriage Counseling"
      ],
      schedule: "Sisterhood Fellowship: Saturday 5:00 PM",
      roleTitle: "Ministry Leader"
    },
    {
      id: "men",
      title: pageT.men,
      desc: pageT.menDesc,
      icon: ShieldCheck,
      category: "care",
      tag: "Leadership & Integrity",
      color: "text-white",
      bgColor: "bg-purple-600 shadow-md shadow-purple-600/30",
      borderColor: "border-purple-200 dark:border-purple-800/50",
      accent: "from-purple-500 to-indigo-500",
      focusAreas: [
        "Men's Breakfast & Bible Study",
        "Brotherhood Mentorship Network",
        "Church Maintenance & Logistics",
        "Leadership Seminars"
      ],
      schedule: "Men's Fellowship: Saturday 7:00 AM",
      roleTitle: "Ministry Leader"
    },
    {
      id: "children",
      title: pageT.children,
      desc: pageT.childrenDesc,
      icon: Baby,
      category: "youth",
      tag: "Kids Sunday School",
      color: "text-white",
      bgColor: "bg-pink-600 shadow-md shadow-pink-600/30",
      borderColor: "border-pink-200 dark:border-pink-800/50",
      accent: "from-pink-500 to-rose-500",
      focusAreas: [
        "Sunday School Age-Graded Classes",
        "Vacation Bible School (VBS)",
        "Scripture Memorization Programs",
        "Children's Choir & Pageants"
      ],
      schedule: "Sunday School: Sunday 9:00 AM",
      roleTitle: "Ministry Leader"
    },
    {
      id: "prayer",
      title: pageT.prayer,
      desc: pageT.prayerDesc,
      icon: Flame,
      category: "care",
      tag: "24/7 Intercession",
      color: "text-white",
      bgColor: "bg-amber-600 shadow-md shadow-amber-600/30",
      borderColor: "border-amber-200 dark:border-amber-800/50",
      accent: "from-amber-500 to-orange-500",
      focusAreas: [
        "24/7 Continuous Prayer Chain",
        "Emergency Prayer Request Hotline",
        "All-Night Prayer Vigils & Fasting",
        "Intercession for Nations & Revival"
      ],
      schedule: "Night Vigil: Every 3rd Friday | 24/7 Prayer Line",
      roleTitle: "Ministry Leader"
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

      {/* 🌌 Hero Section with Ambient Glows */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden border-b border-purple-100/80 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25 dark:opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-400/25 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/25 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <BackToHome label={(t as any)?.nav?.home || (language === "te" ? "హోమ్" : language === "hi" ? "होम" : "Home")} />
            </div>

            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-purple-100/90 dark:bg-purple-900/60 border border-purple-200/90 dark:border-purple-400/40 rounded-full text-purple-900 dark:text-white text-xs sm:text-sm font-extrabold tracking-wide mb-6 shadow-sm backdrop-blur-md animate-bounce-in">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              <span>{pageT.badge || (language === "te" ? "మా నాయకత్వం" : language === "hi" ? "हमारा नेतृत्व" : "Our Leaders")}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight animate-fade-in-up">
              {pageT.title || (language === "te" ? "సంఘ నాయకత్వం" : language === "hi" ? "कलीसियाई नेतृत्व" : "Leadership")}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 animate-fade-in-up animate-delay-200 font-medium max-w-2xl mx-auto leading-relaxed">
              {pageT.subtitle || (language === "te" ? "దేవుని ప్రజలను ప్రేమతో నడిపించడానికి పిలువబడిన కాపరులు" : language === "hi" ? "परमेश्वर के लोगों की सेवा के लिए बुलाए गए चरवाहे" : "Shepherds called to serve God's people")}
            </p>
          </div>
        </div>
      </section>

      {/* 📊 Floating Stats Bar */}
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
                <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-200">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ✝️ Senior Pastor Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 text-white rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-purple-500 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{pageT.senior}</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              {pageT.senior}
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 mx-auto rounded-full" />
          </div>

          <div className="bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-white dark:from-purple-950/40 dark:via-slate-900/80 dark:to-indigo-950/40 border border-purple-200/90 dark:border-purple-800/40 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl shadow-purple-900/5 dark:shadow-black/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Portrait Column */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative group w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl shadow-purple-900/20 dark:shadow-black/60 bg-gradient-to-b from-purple-900 to-slate-950 transition-transform duration-500 hover:scale-[1.02]">
                  <Image
                    src="/pastor.png"
                    alt="Bishop Kurra Kristhu Raju"
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-4 left-4 right-4 text-center z-10">
                    <span className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-full uppercase tracking-wider shadow-lg">
                      {pageT.role || (language === "te" ? "ప్రధాన కాపరి & వ్యవస్థాపకులు" : language === "hi" ? "वरिष्ठ पादरी और संस्थापक" : "Senior Pastor & Founder")}
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Bishop Kurra Kristhu Raju
                  </h3>
                  <p className="text-purple-600 dark:text-purple-300 font-bold text-base sm:text-lg mt-1">
                    {pageT.role || (language === "te" ? "ప్రధాన కాపరి & వ్యవస్థాపకులు" : language === "hi" ? "वरिष्ठ पादरी और संस्थापक" : "Senior Pastor & Founder")}
                  </p>
                </div>
              </div>

              {/* Right Content & Tabbed Info */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Interactive Bio / Vision / Message Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <button
                    onClick={() => setActivePastorTab("bio")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                      activePastorTab === "bio"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {pageT.tabBio || (language === "te" ? "కాపరి పరిచయం" : language === "hi" ? "पादरी परिचय" : "About Pastor")}
                  </button>

                  <button
                    onClick={() => setActivePastorTab("vision")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                      activePastorTab === "vision"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {pageT.tabVision || (language === "te" ? "పరిచర్య దర్శనం" : language === "hi" ? "सेवा का दृष्टिकोण" : "Pastoral Vision")}
                  </button>

                  <button
                    onClick={() => setActivePastorTab("message")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                      activePastorTab === "message"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {pageT.tabMessage || (language === "te" ? "సంఘానికి సందేశం" : language === "hi" ? "कलीसिया को संदेश" : "Message to Church")}
                  </button>
                </div>

                {/* Tab Content Display */}
                <div className="min-h-[160px]">
                  {activePastorTab === "bio" && (
                    <div className="space-y-4 animate-fade-in">
                      <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-medium">
                        {pageT.bio ||
                          (language === "te"
                            ? "బిషప్ కుర్రా క్రీస్తు రాజు గారు 2012 నుండి కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్‌ను నమ్మకంగా నడిపిస్తున్నారు. దేవుని వాక్య బోధన, సమాజ సేవ మరియు అనాథల సంరక్షణలో వారి నిబద్ధత అనేక వేల మంది జీవితాలలో మార్పును తెచ్చింది."
                            : language === "hi"
                            ? "बिशप कुर्रा क्रिस्तु राजू जी 2012 से किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज का विश्वासयोग्यता से नेतृत्व कर रहे हैं। परमेश्वर के वचन का प्रचार, सामाजिक सेवा और अनाथों की देखभाल में उनकी प्रतिबद्धता ने हजारों लोगों के जीवन को बदला है।"
                            : "Bishop Kurra Kristhu Raju has been faithfully leading Kingdom of Christ Ministries since 2012, bringing spiritual transformation, social upliftment, and charitable care across Hyderabad and beyond.")}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span>{language === "te" ? "అంకితభావం గల ఆత్మీయ నాయకత్వం" : language === "hi" ? "समर्पित आत्मिक नेतृत्व" : "Dedicated Pastoral Leadership"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span>{language === "te" ? "దర్శనంగల సంఘ వ్యవస్థాపకులు" : language === "hi" ? "दूरदर्शी कलीसिया संस्थापक" : "Visionary Church Founder"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePastorTab === "vision" && (
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-purple-100 dark:border-purple-900/50 animate-fade-in">
                      <Quote className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                      <h4 className="text-base font-bold text-purple-600 dark:text-purple-300 mb-2">
                        {pageT.visionTitle || (language === "te" ? "దేవుని రాజ్యం కోసం దర్శనం" : language === "hi" ? "परमेश्वर के राज्य के लिए दृष्टिकोण" : "Vision for the Kingdom")}
                      </h4>
                      <p className="text-slate-800 dark:text-slate-100 italic text-base sm:text-lg leading-relaxed font-semibold">
                        "{pageT.visionQuote || (language === "te" ? "క్రీస్తును తెలుసుకోవడం మరియు ఆయనను అందరికీ తెలియజేయడం, ప్రతి విశ్వాసిని ఆధ్యాత్మిక పరిపక్వతకు నడిపించడం మా ప్రధాన లక్ష్యం." : language === "hi" ? "मसीह को जानना और उन्हें सभी को बताना, और हर विश्वासी को आत्मिक परिपक्वता तक पहुंचाना हमारा मुख्य लक्ष्य है।" : "To know Christ and make Him known, raising disciples who transform our city through worship, love, and community service.")}"
                      </p>
                    </div>
                  )}

                  {activePastorTab === "message" && (
                    <div className="p-6 bg-white/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-3 animate-fade-in">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 font-bold text-sm">
                        <MessageSquare className="h-4 w-4" />
                        <span>{language === "te" ? "కాపరి హృదయపూర్వక సందేశం" : language === "hi" ? "पादरी का हृदयस्पर्शी संदेश" : "Pastoral Heart"}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-relaxed italic font-medium">
                        "{pageT.messageText || (language === "te" ? "కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్‌కు మీకు హృదయపూర్వక స్వాగతం. ప్రతి ఒక్కరూ దేవుని ప్రేమ, ఉద్దేశ్యం మరియు కృపలో ఎదగాలని మేము ప్రార్థిస్తున్నాము. మాతో కలిసి ఆరాధించడానికి, ఎదగడానికి మరియు సేవ చేయడానికి మిమ్మల్ని ఆహ్వానిస్తున్నాము." : language === "hi" ? "किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज में आपका हार्दिक स्वागत है। हमारा उद्देश्य हर व्यक्ति को परमेश्वर के प्रेम और अनुग्रह में बढ़ते देखना है। हम आपको हमारे साथ आराधना और सेवा करने के लिए आमंत्रित करते हैं।" : "Welcome to Kingdom of Christ Ministries. Our heart is to see every individual walk in the fullness of God's love, purpose, and grace. We invite you to grow, worship, and serve together with us.")}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Action Links */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Link
                    href="/prayer"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all duration-300 flex items-center gap-2 hover:scale-105"
                  >
                    <Flame className="h-4 w-4 text-amber-300" />
                    <span>{language === "te" ? "పాస్టర్ గారి ప్రార్థన కోరండి" : language === "hi" ? "पादरी की प्रार्थना का अनुरोध करें" : "Request Pastoral Prayer"}</span>
                  </Link>

                  <Link
                    href="/contact"
                    className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all duration-300 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105"
                  >
                    <span>{language === "te" ? "పాస్టరల్ కార్యాలయాన్ని సంప్రదించండి" : language === "hi" ? "कार्यालय से संपर्क करें" : "Contact Pastoral Office"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 📜 Guiding Principles of Leadership Section */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              {pageT.pillarsTitle || "Guiding Principles of Leadership"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-6 font-medium">
              {pageT.pillarsSubtitle || "Rooted in Scripture, committed to servant leadership"}
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {corePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`relative bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border ${pillar.border} hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden group`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${pillar.accent}`} />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${pillar.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${pillar.color}`} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 bg-purple-600 text-white rounded-full border border-purple-500 shadow-sm">
                        {pillar.verse}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {pillar.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-200 text-sm leading-relaxed font-medium">
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
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              {pageT.teamTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
              {pageT.teamSubtitle}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="max-w-4xl mx-auto mb-12 space-y-4">
            
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { id: "all", label: pageT.filterAll || "All Ministries" },
                { id: "worship", label: pageT.filterWorship || "Worship & Media" },
                { id: "youth", label: pageT.filterYouth || "Youth & NextGen" },
                { id: "care", label: pageT.filterCare || "Care & Prayer" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                    selectedFilter === tab.id
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-purple-400 dark:hover:border-purple-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ministry or leadership department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>

          {/* Ministry Cards Grid */}
          {filteredMinistries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 stagger-children">
              {filteredMinistries.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border ${item.borderColor} hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between group overflow-hidden`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.accent}`} />

                    <div>
                      {/* Badge & Icon Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-7 w-7 ${item.color}`} />
                        </div>
                        <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-full border border-slate-300 dark:border-slate-700">
                          {item.tag}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-200 text-sm leading-relaxed mb-6 font-medium">
                        {item.desc}
                      </p>
                    </div>

                    <div>
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {item.roleTitle}
                        </span>
                        <button
                          onClick={() => setSelectedMinistry(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl shadow-sm transition-all duration-300 hover:scale-105 cursor-pointer group/btn"
                        >
                          <span>{pageT.viewDetails || "View Focus & Details"}</span>
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
              <p className="text-slate-600 dark:text-slate-400 font-semibold">
                No ministries match your search criteria.
              </p>
              <button
                onClick={() => { setSelectedFilter("all"); setSearchQuery(""); }}
                className="mt-4 text-xs font-bold text-purple-600 dark:text-purple-400 underline"
              >
                Clear Filters
              </button>
            </div>
          )}

        </div>
      </section>

      {/* 🔍 Interactive Ministry Detail Modal */}
      {selectedMinistry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-scale-in">
            
            {/* Modal Top Accent Line */}
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${selectedMinistry.accent}`} />

            {/* Close Button */}
            <button
              onClick={() => setSelectedMinistry(null)}
              className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 ${selectedMinistry.bgColor} rounded-2xl flex items-center justify-center`}>
                <selectedMinistry.icon className={`h-7 w-7 ${selectedMinistry.color}`} />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  {selectedMinistry.tag}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedMinistry.title}
                </h3>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
              {selectedMinistry.desc}
            </p>

            {/* Focus Areas List */}
            <div className="mb-6 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {pageT.modalKeyAreas || "Key Focus Areas"}
              </h4>
              <div className="space-y-2">
                {selectedMinistry.focusAreas.map((area: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-800 dark:text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Schedule */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                {pageT.modalSchedule || "Schedule & Gatherings"}
              </h4>
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                {selectedMinistry.schedule}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/get-involved/volunteer"
                onClick={() => setSelectedMinistry(null)}
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs sm:text-sm text-center shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>{pageT.modalJoin || "Get Involved in this Ministry"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <button
                onClick={() => setSelectedMinistry(null)}
                className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs sm:text-sm transition-colors"
              >
                {pageT.modalClose || "Close"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🚀 Call to Action Section */}
      <section className="py-20 bg-slate-950 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight animate-fade-in-up">
              {pageT.serve}
            </h2>

            <p className="text-lg sm:text-xl text-white mb-10 animate-fade-in-up animate-delay-100 font-medium drop-shadow">
              {pageT.serveDesc}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in animate-delay-200">
              <Link
                href="/get-involved/volunteer"
                className="group px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 font-extrabold rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2.5 shadow-lg"
              >
                <span className="text-slate-950 font-extrabold">Volunteer</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-purple-600" />
              </Link>

              <Link
                href="/contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/25 text-white rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}