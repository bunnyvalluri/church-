"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  Users,
  Award,
  Calendar,
  ArrowRight,
  Loader2,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  TrendingUp,
  Building2,
  Eye,
  Gift
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  targetAmount: number | null;
  raisedAmount: number;
  status: string;
  category?: string;
  location?: string;
  beneficiaries?: string;
  createdAt: string;
}

// Encode a URL path so parentheses and spaces are safe for browsers
function encodeSrc(src: string | null | undefined): string {
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("//") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }
  try {
    const [path, ...queryAndHash] = src.split(/(?=[?#])/);
    const encodedPath = path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return [encodedPath, ...queryAndHash].join("");
  } catch {
    return src;
  }
}

const PROJECT_TRANSLATIONS: Record<string, {
  title: { te: string; hi: string };
  desc: { te: string; hi: string };
  location?: { te: string; hi: string };
  beneficiaries?: { te: string; hi: string };
}> = {
  "preset-gandhi": {
    title: { te: "గాంధీ జనరల్ ఆసుపత్రి సహాయ సేవ", hi: "गांधी जनरल अस्पताल सहायता सेवा" },
    desc: {
      te: "క్రిటికల్ కేర్ వార్డులలో రోగులు మరియు వారి సంరక్షకులకు పౌష్టిక ఆహారం, పాలు, ప్రాథమిక వైద్య సామాగ్రి మరియు పరిశుభ్రత కిట్‌ల పంపిణీ.",
      hi: "क्रिटिकल केयर वार्डों में मरीजों और उनके सहायकों को पौष्टिक भोजन, दूध, दवाएं और स्वच्छता किट का वितरण।"
    },
    location: { te: "గాంధీ హాస్పిటల్, సికింద్రాబాద్", hi: "गांधी अस्पताल, सिकंदराबाद" },
    beneficiaries: { te: "1,500+ రోగులు & కుటుంబాలు", hi: "1,500+ मरीज और परिवार" }
  },
  "preset-bethany": {
    title: { te: "బెథానీ సంరక్షణ ఆశ్రమం సంరక్షణ సేవ", hi: "बेथानी संरक्षण आश्रम देखभाल सेवा" },
    desc: {
      te: "బెథానీ ఆశ్రమంలోని అనాథ పిల్లలు మరియు వృద్ధులకు నెలవారీ కిరాణా సరుకులు, స్కూల్ పుస్తకాలు, దుప్పట్లు మరియు సంరక్షకుల సహాయం అందించడం.",
      hi: "बेथानी आश्रम में अनाथ बच्चों और बुजुर्गों को मासिक राशन, अध्ययन सामग्री, गर्म कंबल और देखभाल सहायता प्रदान करना।"
    },
    location: { te: "బెథానీ ఆశ్రమం, హైదరాబాద్", hi: "बेथानी आश्रम, हैदराबाद" },
    beneficiaries: { te: "120+ వృద్ధులు & పిల్లలు", hi: "120+ बुजुर्ग और बच्चे" }
  },
  "preset-disabled": {
    title: { te: "దివ్యాంగుల సంరక్షణ ఆశ్రమం పునరావాస సహాయం", hi: "दिव्यांग गृह पुनर्वास सहायता" },
    desc: {
      te: "శారీరక పునరావాస కేంద్రాలలో వీల్‌చైర్లు, వాకర్లు, నిత్యావసర సరుకులు మరియు ప్రత్యేక ఆరోగ్య పర్యవేక్షణ కార్యక్రమాల నిర్వహణ.",
      hi: "शारीरिक पुनर्वास केंद्रों में व्हीलचेयर, वॉकर, मासिक राशन और स्वास्थ्य निगरानी कार्यक्रमों की सहायता।"
    },
    location: { te: "పునరావాస కేంద్రం, జీడిమెట్ల", hi: "पुनर्वास केंद्र, जीदीमेतला" },
    beneficiaries: { te: "85+ దివ్యాంగ వ్యక్తులు", hi: "85+ दिव्यांग व्यक्ति" }
  },
  "preset-charity": {
    title: { te: "మిషనరీస్ ఆఫ్ చారిటీ భోయిగూడ సేవ", hi: "मिशनरीज ऑफ चैरिटी भोईगुड़ा सेवा" },
    desc: {
      te: "నిస్సహాయులు మరియు నిరాశ్రయులకు పౌష్టికాహారం, దుప్పట్లు, బెడ్డింగ్ మరియు సంరక్షణ సహాయాన్ని అందించడం.",
      hi: "असहाय और निराश्रित लोगों को पौष्टिक भोजन, कंबल, बिस्तर और देखभाल सहायता प्रदान करना।"
    },
    location: { te: "మిషనరీస్ ఆఫ్ చారిటీ, భోయిగూడ", hi: "मिशनरीज ऑफ चैरिटी, भोईगुड़ा" },
    beneficiaries: { te: "150+ నివాసితులు", hi: "150+ निवासी" }
  },
  "preset-disabled-secunderabad": {
    title: { te: "సికింద్రాబాద్ దివ్యాంగుల హోమ్ సహాయ డ్రైవ్", hi: "सिकंदराबाद दिव्यांग गृह सहायता अभियान" },
    desc: {
      te: "సికింద్రాబాద్‌లోని దివ్యాంగుల హోమ్‌లో నిత్యావసర సరుకులు, పాలు, దుస్తులు, పారిశుద్ధ్య సామాగ్రి మరియు వైద్య సహాయం అందించడం.",
      hi: "सिकंदराबाद स्थित दिव्यांग गृह में राशन, दूध, वस्त्र, स्वच्छता सामग्री और चिकित्सा सहायता प्रदान करना।"
    },
    location: { te: "దివ్యాంగుల హోమ్, సికింద్రాబాద్", hi: "दिव्यांग गृह, सिकंदराबाद" },
    beneficiaries: { te: "200+ దివ్యాంగులు & వృద్ధులు", hi: "200+ दिव्यांग और बुजुर्ग" }
  }
};

export default function NgoProjectsPage() {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = t?.ngo || {};
  const projectsPage = ngoT.projectsPage || {};

  // Preset seed projects with detailed attributes
  const presetProjects: Project[] = [
    {
      id: "preset-gandhi",
      title: "Gandhi General Hospital Support",
      description: "Distributing nutritious milk food, basic medical supplies, sanitary clothes, and patient caretaker assistance kits in critical care wards.",
      imageUrl: "/gandhi_hospital_support_image.png",
      targetAmount: null,
      raisedAmount: 0,
      status: "ACTIVE",
      category: "HOSPITAL",
      location: "Gandhi Hospital, Secunderabad",
      beneficiaries: "1,500+ Patients & Families",
      createdAt: "2026-03-25T00:00:00.000Z",
    },
    {
      id: "preset-bethany",
      title: "Bethany Samrakshana Ashramam Care",
      description: "Supporting orphan children and elders in Bethany Ashramam with monthly groceries, school supplies, clean blankets, and care assistants.",
      imageUrl: "/bethany_ashramam_care_image.png",
      targetAmount: null,
      raisedAmount: 0,
      status: "ACTIVE",
      category: "ASHRAMAM",
      location: "Bethany Ashramam, Hyderabad",
      beneficiaries: "120+ Elders & Children",
      createdAt: "2026-04-21T00:00:00.000Z",
    },
    {
      id: "preset-disabled",
      title: "Home for the Disabled Ashramam Aid",
      description: "Assisting physical rehabilitation centers with wheelchairs, walkers, monthly provisions, and critical healthcare monitoring programs.",
      imageUrl: "/home_for_disabled_rehab_care.png",
      targetAmount: null,
      raisedAmount: 0,
      status: "ACTIVE",
      category: "REHABILITATION",
      location: "Rehab Center, Jeedimetla",
      beneficiaries: "85+ Disabled Individuals",
      createdAt: "2026-06-17T00:00:00.000Z",
    },
    {
      id: "preset-charity",
      title: "Missionaries of Charity Bhoiguda Outreach",
      description: "Providing wholesome nutrition, clean blankets, medical care items, and emotional comfort to residents at Missionaries of Charity, Bhoiguda.",
      imageUrl: "/KCM_NGO_SERVICES/MISSIONARIES OF CHARITY [SECUNDERABAD BHOIGUDA] 25-05-2026/IMG-20260825-WA0008.jpg",
      targetAmount: null,
      raisedAmount: 0,
      status: "ACTIVE",
      category: "CHARITY",
      location: "Missionaries of Charity, Bhoiguda",
      beneficiaries: "150+ Residents",
      createdAt: "2026-05-25T00:00:00.000Z",
    },
    {
      id: "preset-disabled-secunderabad",
      title: "Home for the Disabled Secunderabad Drive",
      description: "Delivering clothing, monthly groceries, blankets, and essential hygiene provisions to special needs individuals and elderly at Home for the Disabled, Secunderabad.",
      imageUrl: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED (SECUNDERABAD) [23-07-2026]/IMG-20260723-WA0001.jpg",
      targetAmount: null,
      raisedAmount: 0,
      status: "ACTIVE",
      category: "REHABILITATION",
      location: "Home for Disabled, Secunderabad",
      beneficiaries: "200+ Special Needs & Elderly",
      createdAt: "2026-07-23T00:00:00.000Z",
    },
  ];

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/ngo/projects");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.projects.length > 0) {
            setProjects(data.projects);
          } else {
            setProjects(presetProjects);
          }
        } else {
          setProjects(presetProjects);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
        setProjects(presetProjects);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const getProjTitle = (p: Project) => {
    if (PROJECT_TRANSLATIONS[p.id]?.title) {
      if (language === "te") return PROJECT_TRANSLATIONS[p.id].title.te;
      if (language === "hi") return PROJECT_TRANSLATIONS[p.id].title.hi;
    }
    return p.title;
  };

  const getProjDesc = (p: Project) => {
    if (PROJECT_TRANSLATIONS[p.id]?.desc) {
      if (language === "te") return PROJECT_TRANSLATIONS[p.id].desc.te;
      if (language === "hi") return PROJECT_TRANSLATIONS[p.id].desc.hi;
    }
    return p.description;
  };

  const getProjLocation = (p: Project) => {
    if (PROJECT_TRANSLATIONS[p.id]?.location) {
      if (language === "te") return PROJECT_TRANSLATIONS[p.id].location!.te;
      if (language === "hi") return PROJECT_TRANSLATIONS[p.id].location!.hi;
    }
    return p.location || "Hyderabad, Telangana";
  };

  const getProjBeneficiaries = (p: Project) => {
    if (PROJECT_TRANSLATIONS[p.id]?.beneficiaries) {
      if (language === "te") return PROJECT_TRANSLATIONS[p.id].beneficiaries!.te;
      if (language === "hi") return PROJECT_TRANSLATIONS[p.id].beneficiaries!.hi;
    }
    return p.beneficiaries || "Community in need";
  };

  const getCategoryLabel = (cat: string) => {
    const c = cat.toUpperCase();
    if (language === "te") {
      if (c === "ALL") return "అన్ని ప్రాజెక్ట్‌లు";
      if (c === "HOSPITAL") return "ఆసుపత్రి సేవ";
      if (c === "ASHRAMAM") return "ఆశ్రమ సంరక్షణ";
      if (c === "REHABILITATION") return "దివ్యాంగుల సాయం";
      return cat;
    }
    if (language === "hi") {
      if (c === "ALL") return "सभी परियोजनाएं";
      if (c === "HOSPITAL") return "अस्पताल राहत";
      if (c === "ASHRAMAM") return "आश्रम देखभाल";
      if (c === "REHABILITATION") return "दिव्यांग सहायता";
      return cat;
    }
    if (c === "ALL") return "All Projects";
    if (c === "HOSPITAL") return "Hospital Relief";
    if (c === "ASHRAMAM") return "Ashramam Care";
    if (c === "REHABILITATION") return "Handicap Aid";
    return cat;
  };

  // Filtered Projects Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory =
        selectedCategory === "ALL" ||
        (p.category && p.category.toUpperCase() === selectedCategory.toUpperCase());
      const pTitle = getProjTitle(p).toLowerCase();
      const pDesc = getProjDesc(p).toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch = pTitle.includes(q) || pDesc.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategory, searchQuery, language]);

  // Active campaign count
  const activeCampaigns = projects.filter((p) => p.status === "ACTIVE").length;

  const categoryTabs = [
    { id: "ALL", label: getCategoryLabel("ALL") },
    { id: "HOSPITAL", label: getCategoryLabel("HOSPITAL") },
    { id: "ASHRAMAM", label: getCategoryLabel("ASHRAMAM") },
    { id: "REHABILITATION", label: getCategoryLabel("REHABILITATION") },
  ];

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 1. Hero Section & Impact Metrics Banner */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Heart className="w-4 h-4 text-red-500 animate-pulse fill-red-500/20" />
                <span>
                  {language === "te" ? "క్రియాశీల మానవతా సేవా కార్యక్రమాలు" : language === "hi" ? "सक्रिय मानव सेवा अभियान" : "Active Humanitarian Relief Campaigns"}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-slate-900 via-slate-800 to-purple-700 dark:from-white dark:via-slate-100 dark:to-purple-300 bg-clip-text text-transparent">
                {projectsPage.title || "Social Service Projects"}
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                {projectsPage.desc || "Discover our active community initiatives and help us achieve our goals. Your support directly finances medical items, wheelchairs, food campaigns, and Ashramam expenses."}
              </p>
            </div>

            {/* Quick Action Button */}
            <Link
              href="/ngo/donations"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm whitespace-nowrap"
            >
              <Gift className="w-4 h-4" />
              <span>{language === "te" ? "అన్ని ప్రాజెక్టులకు విరాళం ఇవ్వండి" : language === "hi" ? "सभी परियोजनाओं के लिए दान करें" : "Donate to All Projects"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Active Campaigns Banner */}
          {activeCampaigns > 0 && (
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 border border-purple-500/20 text-left">
              <TrendingUp className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {language === "te"
                  ? `${activeCampaigns} క్రియాశీల సేవా కార్యక్రమాలు — మీ మద్దతు నేరుగా ఆపన్నులకు చేరుతుంది.`
                  : language === "hi"
                  ? `${activeCampaigns} सक्रिय सेवा अभियान — आपका सहयोग सीधे जरूरतमंदों तक पहुंचता है।`
                  : `${activeCampaigns} Active Relief Campaigns — Your support directly helps communities in need.`}
              </span>
            </div>
          )}
        </div>

        {/* 2. Filter & Search Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          {/* Category Tabs */}
          <div className="w-full md:w-auto">
            {/* Mobile: 2-col grid so all 4 category names are 100% visible */}
            <div className="grid grid-cols-2 gap-2 sm:hidden w-full">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center truncate ${
                    selectedCategory === tab.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 dark:bg-purple-500"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Desktop / Tablet: horizontal row */}
            <div className="hidden sm:flex items-center gap-1.5">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === tab.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 dark:bg-purple-500"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === "te" ? "ప్రాజెక్ట్‌లను శోధించండి..." : language === "hi" ? "परियोजनाएं खोजें..." : "Search projects..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>
        </div>

        {/* 3. Projects Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                {projectsPage.fetching || "Loading active initiatives..."}
              </p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center space-y-3">
            <Filter className="w-10 h-10 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {language === "te" ? "ప్రాజెక్ట్‌లు ఏవీ కనుగొనబడలేదు" : language === "hi" ? "कोई परियोजना नहीं मिली" : "No projects found"}
            </h3>
            <p className="text-slate-500 text-xs max-w-sm">
              {language === "te" ? "మీ శోధనకు సరిపోయే సేవా ప్రాజెక్ట్‌లు ఏవీ లేవు." : language === "hi" ? "आपकी खोज से मेल खाने वाली कोई परियोजना नहीं मिली।" : "No active initiatives match your selected filter or search query."}
            </p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold rounded-xl text-xs hover:bg-purple-500/20 transition-all"
            >
              {language === "te" ? "ఫిల్టర్‌లను రీసెట్ చేయండి" : language === "hi" ? "फ़िल्टर रीसेट करें" : "Reset Filters"}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const displayTitle = getProjTitle(project);
              const displayDesc = getProjDesc(project);
              const displayLoc = getProjLocation(project);
              const displayBen = getProjBeneficiaries(project);

              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 hover:border-purple-500/40 dark:hover:border-purple-500/40 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5 text-left"
                >
                  <div>
                    {/* Cover image & Floating Badges */}
                    <div className="relative aspect-video overflow-hidden bg-slate-950">
                      {project.imageUrl ? (
                        <img
                          src={encodeSrc(project.imageUrl)}
                          alt={displayTitle}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (project.category === "ASHRAMAM") {
                              target.src = "/bethany_ashramam_care_image.png";
                            } else if (project.category === "REHABILITATION") {
                              target.src = "/home_for_disabled_rehab_care.png";
                            } else {
                              target.src = "/ngo_outreach_drive_thumbnail.png";
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900">
                          <Heart className="w-12 h-12" />
                        </div>
                      )}

                      {/* Status Tag */}
                      <div className="absolute top-3.5 right-3.5 bg-slate-950/80 backdrop-blur-md border border-white/20 text-amber-400 text-[10px] font-bold font-mono uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{language === "te" ? "క్రియాశీలం" : language === "hi" ? "सक्रिय" : project.status}</span>
                      </div>

                      {/* Category Pill */}
                      {project.category && (
                        <div className="absolute bottom-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white bg-slate-950/90 backdrop-blur-md border border-white/30 shadow-xl flex items-center gap-1.5 font-mono">
                          <span className={`w-2 h-2 rounded-full ${
                            project.category.toUpperCase() === "HOSPITAL" ? "bg-blue-400" :
                            project.category.toUpperCase() === "ASHRAMAM" ? "bg-pink-400" :
                            "bg-emerald-400"
                          }`} />
                          <span>{getCategoryLabel(project.category)}</span>
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-6 space-y-3.5 text-left">
                      {/* Location / Beneficiary indicator */}
                      {(displayLoc || displayBen) && (
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                            <span className="truncate max-w-[160px]">{displayLoc}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                            <span>{displayBen}</span>
                          </span>
                        </div>
                      )}

                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors leading-snug">
                        {displayTitle}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {displayDesc}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-3">
                    <div className="flex gap-2.5">
                      <Link
                        href={`/ngo/donations?project=${project.id}`}
                        className="flex-1 py-3 bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold text-center rounded-xl text-xs transition-all shadow-md shadow-purple-500/10 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>{projectsPage.donateBtn || "Donate Now"}</span>
                      </Link>
                      
                      <Link
                        href={`/ngo/volunteers?project=${project.id}`}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold text-center rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>{projectsPage.volunteerBtn || "Volunteer"}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Tax Exemption & Verification Trust Footer Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-blue-500/10 dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-900 border border-purple-200/80 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-lg">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Section 80G Tax Exemption Certified</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Every Donation is Tax-Deductible & Fully Audited
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              KCM Society NGO is registered under Regd No: 206/2024 with 12A & 80G(5)(VI) approvals. Instant tax receipts are generated for all campaign donations.
            </p>
          </div>

          <Link
            href="/ngo/donations"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md text-xs whitespace-nowrap transition-all hover:scale-105"
          >
            Support Active Relief Drives
          </Link>
        </div>

      </div>
    </div>
  );
}
