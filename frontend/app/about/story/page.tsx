"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Church, 
  Users, 
  Heart, 
  MapPin, 
  Sparkles, 
  Quote, 
  Calendar, 
  Award, 
  Globe, 
  CheckCircle2,
  GraduationCap,
  Stethoscope,
  Utensils,
  ShieldCheck,
  HeartHandshake,
  BookOpen,
  Building,
  Target,
  Eye,
  FileText,
  FileCheck,
  Landmark,
  Briefcase,
  X,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  Copy,
  Check,
  Compass,
  ArrowUpRight,
  HelpCircle,
  Clock,
  Layers,
  Sparkle
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";

export default function OurStoryPage() {
  const { language, t } = useLanguage();
  const pageT = (t as any)?.pages?.story || {};

  // State management
  const [selectedDocIndex, setSelectedDocIndex] = useState<number | null>(null);
  const [docCategory, setDocCategory] = useState<string>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLeaderTab, setActiveLeaderTab] = useState<string>("overview");

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Keyboard navigation for document modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedDocIndex === null) return;
      if (e.key === "Escape") setSelectedDocIndex(null);
      if (e.key === "ArrowLeft" && selectedDocIndex > 0) setSelectedDocIndex(selectedDocIndex - 1);
      if (e.key === "ArrowRight" && selectedDocIndex < officialDocuments.length - 1) setSelectedDocIndex(selectedDocIndex + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDocIndex]);

  const stats = [
    { 
      value: "2012", 
      label: pageT.statYears || "Established Year", 
      sublabel: "12+ Years of Expanding Service",
      icon: Calendar, 
      accent: "from-purple-500 to-indigo-600",
      bg: "bg-purple-600/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
    },
    { 
      value: "3+", 
      label: pageT.statLocations || "Campuses & Centers", 
      sublabel: "Shapur, Subhash Nagar, Bahadurpally",
      icon: MapPin, 
      accent: "from-indigo-500 to-cyan-600",
      bg: "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
    },
    { 
      value: "10,000+", 
      label: pageT.statMembers || "Believers & Beneficiaries", 
      sublabel: "Families, Orphans & Students Supported",
      icon: Users, 
      accent: "from-pink-500 to-rose-600",
      bg: "bg-pink-600/10 text-pink-600 dark:text-pink-400 border-pink-500/20"
    },
    { 
      value: "50+", 
      label: pageT.statOutreaches || "Annual Relief Projects", 
      sublabel: "Food, Health Camps & Education",
      icon: Globe, 
      accent: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    },
  ];

  const officialDocuments = [
    {
      id: "roc",
      num: "1",
      category: "registration",
      title: pageT.doc1Title || "1) ROC",
      subtitle: pageT.doc1Subtitle || "Certificate of Registration",
      authority: "Office of the Registrar of Societies, Ranga Reddy District",
      regNo: "206 of 2012 (206/2012)",
      date: "09-02-2012",
      act: "Andhra Pradesh Societies Registration Act, 2001",
      badge: "Registrar of Societies",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800",
      image: "/documents/roc.png",
      icon: Landmark,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/50",
      status: "Active & Verified",
      highlightField: { label: "Registration No", value: "206/2012" },
      details: [
        { label: "Entity Name", value: "KINGDOM OF CHRIST MINISTRIES", copyable: false },
        { label: "Registration Number", value: "206/2012", copyable: true },
        { label: "Date of Registration", value: "09 February 2012", copyable: false },
        { label: "Issuing Authority", value: "Registrar of Societies, Ranga Reddy District", copyable: false },
        { label: "Governing Act", value: "Andhra Pradesh Societies Registration Act, 2001 (Act No. 35 of 2001)", copyable: false },
        { label: "Registered Address", value: "Plot No. 119/A, Subhashnagar, IDA Jeedimetla, R.R. Dist, Telangana - 500055", copyable: true },
        { label: "Legal Status", value: "Active Registered Society (NGO)", copyable: false }
      ]
    },
    {
      id: "darpan",
      num: "2",
      category: "govt",
      title: pageT.doc2Title || "2) DARPAN",
      subtitle: pageT.doc2Subtitle || "NGO Darpan (NITI Aayog, Govt. of India)",
      authority: "NITI Aayog NGO Portal",
      regNo: "TS/2025/0879909",
      date: "12-11-2025",
      act: "The Societies Registration Act, 1860 (Reg: 206/2012)",
      badge: "NITI Aayog Certified",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800",
      image: "/documents/darpan.png",
      icon: Globe,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/50",
      status: "Active & Verified",
      highlightField: { label: "DARPAN ID", value: "TS/2025/0879909" },
      details: [
        { label: "DARPAN ID", value: "TS/2025/0879909", copyable: true },
        { label: "DARPAN Registration Date", value: "12-11-2025", copyable: false },
        { label: "NPO Type & Act", value: "Society under The Societies Registration Act, 1860", copyable: false },
        { label: "President", value: "Kurra Kristhu Raju", copyable: false },
        { label: "Secretary", value: "Kanumuri Santhosh Varma", copyable: false },
        { label: "Joint Secretary", value: "Gurka Hemanth", copyable: false },
        { label: "Treasurer", value: "Sakineti Sakunthala", copyable: false },
        { label: "Primary Sectors", value: "Children, Drinking Water, Education & Literacy, Aged/Elderly, Environment", copyable: false },
        { label: "Secondary Sectors", value: "Food Processing, Health & Family Welfare, Rural Development, Women Empowerment", copyable: false }
      ]
    },
    {
      id: "12a",
      num: "3",
      category: "tax",
      title: pageT.doc3Title || "3) SECTION 12A",
      subtitle: pageT.doc3Subtitle || "Income Tax Exemption Certificate (Form 10AC)",
      authority: "Income Tax Department, Government of India",
      regNo: "URN: AADTK0007CE20251",
      date: "18-11-2025 (AY 2026-27 to 2028-29)",
      act: "Section 12A (Form No. 10AC)",
      badge: "Tax Exemption (12A)",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
      image: "/documents/12a.png",
      icon: FileCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      status: "Active & Verified",
      highlightField: { label: "PAN / URN", value: "AADTK0007C / AADTK0007CE20251" },
      details: [
        { label: "Permanent Account Number (PAN)", value: "AADTK0007C", copyable: true },
        { label: "Unique Registration Number (URN)", value: "AADTK0007CE20251", copyable: true },
        { label: "Document Identification Number (DIN)", value: "AADTK0007CE2025101", copyable: true },
        { label: "Application Number", value: "534899640111125", copyable: true },
        { label: "Nature of Activities", value: "Charitable", copyable: false },
        { label: "Section Granted", value: "Clause (ac) of sub-section (1) of Section 12A", copyable: false },
        { label: "Assessment Years", value: "From AY 2026-27 to AY 2028-2029", copyable: false },
        { label: "Order Date", value: "18-11-2025", copyable: false }
      ]
    },
    {
      id: "80g",
      num: "4",
      category: "tax",
      title: pageT.doc4Title || "4) SECTION 80G",
      subtitle: pageT.doc4Subtitle || "Tax Exemption for Donors (Form 10AC)",
      authority: "Income Tax Department, Government of India",
      regNo: "URN: AADTK0007CF20251",
      date: "18-11-2025 (AY 2026-27 to 2028-29)",
      act: "Section 80G (Form No. 10AC)",
      badge: "50% Tax Benefit (80G)",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800",
      image: "/documents/80g.png",
      icon: ShieldCheck,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/50",
      status: "Active & Verified",
      highlightField: { label: "Donor Benefit", value: "50% Tax Deductible (Sec 80G)" },
      details: [
        { label: "Permanent Account Number (PAN)", value: "AADTK0007C", copyable: true },
        { label: "Unique Registration Number (URN)", value: "AADTK0007CF20251", copyable: true },
        { label: "Document Identification Number (DIN)", value: "AADTK0007CF2025101", copyable: true },
        { label: "Application Number", value: "535174380111125", copyable: true },
        { label: "Donor Benefit", value: "50% Tax Exemption on contributions under Section 80G", copyable: false },
        { label: "Section Granted", value: "Sub-clause (iv) of first proviso to sub-section (5) of Section 80G", copyable: false },
        { label: "Assessment Years", value: "From AY 2026-27 to AY 2028-2029", copyable: false },
        { label: "Order Date", value: "18-11-2025", copyable: false }
      ]
    },
    {
      id: "e-anudhan",
      num: "5",
      category: "govt",
      title: pageT.doc5Title || "5) E ANUDHAN",
      subtitle: pageT.doc5Subtitle || "Certificate of Enrollment (Ministry of Social Justice & Empowerment)",
      authority: "Ministry of Social Justice & Empowerment, Govt. of India (NIC)",
      regNo: "NGO ID: TG/00050257",
      date: "grants-msje.gov.in",
      act: "Grant in Aid Schemes Authentication",
      badge: "Govt. Grant-in-Aid",
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-800",
      image: "/documents/e-anudhan.png",
      icon: Award,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950/50",
      status: "Active & Verified",
      highlightField: { label: "NGO ID", value: "TG/00050257" },
      details: [
        { label: "NGO ID", value: "TG/00050257", copyable: true },
        { label: "Issuing Ministry", value: "Ministry of Social Justice & Empowerment, Government of India", copyable: false },
        { label: "Technical Partner", value: "National Informatics Centre (NIC)", copyable: false },
        { label: "Portal", value: "www.grants-msje.gov.in", copyable: true },
        { label: "Certificate Purpose", value: "Proof of Authentication As NGO for Grant in Aid Schemes", copyable: false },
        { label: "Beneficiary Status", value: "Enrolled for Central Ministry Schemes and Grants Support", copyable: false },
        { label: "Registered Address", value: "Door No. 119/A, Subhashnagar, IDA Jeedimetla S.O, Qutubullapur, 500055, Telangana", copyable: true }
      ]
    },
    {
      id: "msme",
      num: "6",
      category: "registration",
      title: pageT.doc6Title || "6) MSME",
      subtitle: pageT.doc6Subtitle || "Udyam Registration Certificate (Ministry of MSME)",
      authority: "Ministry of Micro, Small and Medium Enterprises, Govt. of India",
      regNo: "UDYAM-TS-09-0195037",
      date: "13/11/2025 | Inc: 09/02/2012",
      act: "NIC Code 88900 (Social Work Services)",
      badge: "MSME Micro Enterprise",
      badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800",
      image: "/documents/msme.png",
      icon: Briefcase,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/50",
      status: "Active & Verified",
      highlightField: { label: "Udyam Reg No", value: "UDYAM-TS-09-0195037" },
      details: [
        { label: "Udyam Registration Number", value: "UDYAM-TS-09-0195037", copyable: true },
        { label: "Enterprise Type", value: "Micro Enterprise (Services)", copyable: false },
        { label: "Major Activity", value: "SERVICES", copyable: false },
        { label: "Social Category", value: "OBC", copyable: false },
        { label: "NIC 5 Digit Code", value: "88900 - Other social work activities without accommodation n.e.c.", copyable: false },
        { label: "Date of Incorporation", value: "09/02/2012", copyable: false },
        { label: "Date of Udyam Registration", value: "13/11/2025", copyable: false },
        { label: "District Industries Centre", value: "RANGAREDDY (TELANGANA)", copyable: false },
        { label: "MSME-DFO", value: "HYDERABAD (TELANGANA)", copyable: false }
      ]
    },
  ];

  const filteredDocuments = useMemo(() => {
    if (docCategory === "all") return officialDocuments;
    return officialDocuments.filter(d => d.category === docCategory);
  }, [docCategory]);

  const selectedDoc = selectedDocIndex !== null ? officialDocuments[selectedDocIndex] : null;

  const impactPillars = [
    {
      title: pageT.pillar1Title || "Educational & Technical Institutes",
      desc: pageT.pillar1Desc || "School-building initiatives, scholarship programs, teacher training, and technical institutes breaking barriers for youth.",
      icon: GraduationCap,
      badge: "Education & Skills",
      accent: "from-amber-500 to-orange-600",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      title: pageT.pillar2Title || "Medical & Health Services",
      desc: pageT.pillar2Desc || "Establishing medical institutes, health outreach clinics, supportive relief, and essential community wellness.",
      icon: Stethoscope,
      badge: "Healthcare & Relief",
      accent: "from-emerald-500 to-teal-600",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: pageT.pillar3Title || "Food & Orphan Sheltering",
      desc: pageT.pillar3Desc || "Providing nourishing daily meals, safe sanctuary, holistic care, and loving shelter for orphans and children in need.",
      icon: Utensils,
      badge: "Orphan Care & Nutrition",
      accent: "from-rose-500 to-pink-600",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20"
    },
    {
      title: pageT.pillar4Title || "Social Justice & Welfare Policy",
      desc: pageT.pillar4Desc || "Policy contributions at State, National, and International levels, empowering women, children, and tribal communities.",
      icon: ShieldCheck,
      badge: "Justice & Policy",
      accent: "from-purple-500 to-indigo-600",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
  ];

  const journeySteps = [
    {
      step: "01",
      year: "2012",
      title: pageT.foundationTitle || "2012: Inception & Vision",
      desc: pageT.foundationDesc || "Founded by Sri. Kurra Kristhu Raju with a deep calling for prayer, social justice, and selfless community service.",
      icon: Church,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-950/60",
      accent: "from-purple-500 to-indigo-500"
    },
    {
      step: "02",
      year: "Expansion",
      title: pageT.growthTitle || "Holistic Expansion",
      desc: pageT.growthDesc || "Continuous expansion into social and educational development, medical services, food distribution, and orphan sheltering.",
      icon: Building,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-950/60",
      accent: "from-indigo-500 to-cyan-500"
    },
    {
      step: "03",
      year: "Policy Reach",
      title: pageT.communityTitle || "Institutional & Policy Reach",
      desc: pageT.communityDesc || "Establishment of technical/medical institutes, field training, and contributing to welfare policies at State, National & International levels.",
      icon: HeartHandshake,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-100 dark:bg-pink-950/60",
      accent: "from-pink-500 to-rose-500"
    },
    {
      step: "04",
      year: "Vision 2030",
      title: pageT.missionTitle || "Education For All",
      desc: pageT.missionDesc || "Empowering disadvantaged communities, women, children, and tribal sections with schools, scholarships, and skills.",
      icon: GraduationCap,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-950/60",
      accent: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />
      
      {/* 🌌 HERO SECTION: LUXURY EDITORIAL EXPERIENCE */}
      <section className="relative pt-36 pb-28 md:pt-44 md:pb-36 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-[#090e1f] dark:via-[#0c1329] dark:to-[#090e1f] text-slate-900 dark:text-white overflow-hidden border-b border-purple-100/80 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
        {/* Cinematic Ambient Backlight Glows */}
        <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-purple-400/20 via-indigo-400/20 to-pink-400/15 dark:from-purple-600/20 dark:via-indigo-600/20 dark:to-pink-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 dark:opacity-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Top Navigation Pill */}
            <div className="mb-6 flex justify-center">
              <BackToHome label={pageT.backToHome || (t as any)?.nav?.home || (language === "te" ? "హోమ్" : language === "hi" ? "होम" : "Home")} />
            </div>
            
            {/* Verified Organization Emblem Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-purple-100/90 dark:bg-gradient-to-r dark:from-purple-900/80 dark:via-indigo-900/80 dark:to-purple-900/80 border border-purple-200/90 dark:border-purple-400/40 rounded-full text-purple-900 dark:text-white text-xs sm:text-sm font-extrabold tracking-wide mb-6 shadow-sm dark:shadow-xl backdrop-blur-xl animate-fade-in">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-amber-300 animate-pulse" />
              <span className="font-black tracking-wider">
                {language === "te"
                  ? "కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్ • స్థాపన 2012"
                  : language === "hi"
                  ? "द किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज • स्थापना 2012"
                  : "THE KINGDOM OF CHRIST MINISTRIES • ESTABLISHED 2012"}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {/* Main Page Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1] animate-fade-in-up">
              {language === "te" ? "మా ఆత్మీయ ప్రయాణం, " : language === "hi" ? "हमारी यात्रा, " : "Our Journey, "}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 dark:from-purple-300 dark:via-indigo-200 dark:to-pink-300 bg-clip-text text-transparent">
                {language === "te" ? "దర్శనం & ప్రభావం" : language === "hi" ? "दृष्टिकोण और प्रभाव" : "Vision & Impact"}
              </span>
            </h1>
            
            {/* Subtitle Narrative */}
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 animate-fade-in-up animate-delay-200 font-medium max-w-3xl mx-auto leading-relaxed mb-10">
              {pageT.subtitle ||
                (language === "te"
                  ? "కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్ — 2012 నుండి జీవితాలను రూపాంతరం చేస్తూ, విద్యను ప్రోత్సహిస్తూ మరియు సమాజానికి సేవలందిస్తోంది."
                  : language === "hi"
                  ? "द किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज — 2012 से जीवन को बदलते हुए, शिक्षा को बढ़ावा देते हुए और समुदायों की सेवा करते हुए।"
                  : "The KINGDOM OF CHRIST MINISTRIES — Transforming Lives, Championing Education & Serving Communities Since 2012")}
            </p>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up animate-delay-300">
              <a
                href="#our-documents"
                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <FileCheck className="h-4 w-4 text-amber-300" />
                <span>{language === "te" ? "చట్టపరమైన పత్రాలు & ధృవీకరణ" : language === "hi" ? "दस्तावेज़ और अनुपालन वॉल्ट" : "Compliance & Documents Vault"}</span>
              </a>
              <a
                href="#mission-vision"
                className="px-6 py-3.5 bg-white dark:bg-white/10 hover:bg-purple-50 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs sm:text-sm font-bold rounded-2xl border border-purple-200/90 dark:border-white/20 backdrop-blur-md shadow-sm hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                <span>{language === "te" ? "మా మిషన్ & దర్శనం" : language === "hi" ? "हमारा मिशन और दृष्टिकोण" : "Our Mission & Vision"}</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 📊 FLOATING STATS METRIC BAR (ELEVATED UX CARDS) */}
      <section className="relative z-20 -mt-14 sm:-mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="bg-white/95 dark:bg-[#11192e]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-7 rounded-3xl shadow-xl shadow-slate-950/5 dark:shadow-black/40 hover:scale-[1.03] hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center border ${stat.bg} group-hover:scale-110 transition-transform shadow-sm`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <Sparkle className="h-3.5 w-3.5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div>
                  <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                    {stat.sublabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 👑 VISIONARY LEADERSHIP SPOTLIGHT SECTION */}
      <section id="leadership" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Senior Pastor Majestic Portrait Card */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Founder High-Definition Portrait Card */}
              <div className="relative group bg-gradient-to-b from-purple-50 via-white to-purple-100/60 dark:from-[#11192e] dark:via-[#0c1324] dark:to-[#080d1a] rounded-[2.5rem] overflow-hidden border border-purple-100 dark:border-purple-500/20 shadow-2xl shadow-purple-900/10 dark:shadow-black/70 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500/40">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 left-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                
                {/* Pastor Portrait Box */}
                <div className="relative w-full h-[380px] sm:h-[420px] flex items-end justify-center pt-6 px-4 overflow-hidden">
                  <Image
                    src="/pastor.png"
                    alt="Sri. Kurra Kristhu Raju"
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-contain object-bottom drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#090e1f] via-[#090e1f]/80 to-transparent pointer-events-none" />
                </div>

                {/* Name & Title Header Overlay */}
                <div className="relative z-10 p-6 sm:p-7 bg-[#090e1f] border-t border-purple-500/20">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full text-xs font-black uppercase tracking-wider mb-2.5">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span className="text-amber-300 font-bold">{pageT.leaderTitle || "Visionary Leader & Founder"}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                    {pageT.leaderName || "Sri. KURRA KRISTHU RAJU"}
                  </h3>
                  <p className="text-xs font-semibold text-purple-200/80">
                    President &amp; Founder • Kingdom of Christ Ministries
                  </p>
                </div>
              </div>

              {/* Leadership Vision Quote Callout */}
              <div className="relative bg-gradient-to-br from-white to-purple-50/50 dark:from-[#11192e] dark:to-[#0c1324] rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-900/5 dark:shadow-black/40 overflow-hidden border border-purple-100 dark:border-purple-900/50">
                <Quote className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3 opacity-70" />
                <span className="inline-block text-[11px] font-black uppercase tracking-widest text-white bg-purple-600 border border-purple-500 px-3 py-1 rounded-full mb-3 shadow-sm">
                  {pageT.quoteTitle || "Leadership Vision"}
                </span>
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 italic leading-relaxed font-semibold">
                  "{pageT.quoteText || "God called us with a vision to build a prayer-filled, loving community that reflects Christ's light across Hyderabad and empowers the marginalized through education, medical aid, and shelter."}"
                </p>
              </div>

            </div>

            {/* Right Column: Interactive Narrative & Pillars Tabs */}
            <div className="lg:col-span-7 space-y-6">
              
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-600 text-white rounded-full text-xs font-black uppercase tracking-widest mb-3.5 shadow-sm">
                  <Award className="h-3.5 w-3.5 text-amber-300" />
                  <span>The Kingdom of Christ Ministries</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {pageT.leaderTitle || "Visionary Leadership"} &amp; Heritage
                </h2>
              </div>

              {/* Interactive Narrative Navigation Pills */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/70 dark:bg-slate-900/80 rounded-2xl border border-slate-300/60 dark:border-slate-800 w-fit">
                <button
                  onClick={() => setActiveLeaderTab("overview")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeLeaderTab === "overview"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Inception &amp; Driving Force
                </button>
                <button
                  onClick={() => setActiveLeaderTab("welfare")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeLeaderTab === "welfare"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Social Welfare &amp; Healthcare
                </button>
                <button
                  onClick={() => setActiveLeaderTab("marginalized")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeLeaderTab === "marginalized"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Focus on Disadvantaged
                </button>
              </div>

              {/* Dynamic Narrative Display Cards */}
              {activeLeaderTab === "overview" && (
                <div className="p-7 sm:p-8 bg-white dark:bg-[#11192e] rounded-3xl border-l-4 border-purple-600 dark:border-purple-500 shadow-xl shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-800 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 rounded-xl text-purple-600 dark:text-purple-400">
                      <Church className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Founded in 2012 Under Visionary Leadership
                    </h3>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
                    {pageT.leaderDesc || "Our organization is led by a visionary leader, Sri. KURRA KRISTHU RAJU, whose unwavering commitment to our cause has been the driving force behind our success. Established in 2012, since then the organization has been expanding continuously in terms of social and Educational Development and Medical services, Food, and Sheltering for Orphans."}
                  </p>
                </div>
              )}

              {activeLeaderTab === "welfare" && (
                <div className="p-7 sm:p-8 bg-white dark:bg-[#11192e] rounded-3xl border-l-4 border-indigo-600 dark:border-indigo-500 shadow-xl shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-800 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <HeartHandshake className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      {pageT.sustainableTitle || "Sustainable Development & Social Welfare"}
                    </h3>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
                    {pageT.sustainableDesc || "It has worked for the promotion of sustainable, equitable, and participatory development, social welfare, and social justice through Programs for social work, the Establishment of Educational Technical and Medical Institutes, supportive relief and education to the people, Health services, and other human service through social research and dissemination of socially relevant knowledge, social intervention through training and field action, contribution to social and welfare policy and program at State, National and International levels."}
                  </p>
                </div>
              )}

              {activeLeaderTab === "marginalized" && (
                <div className="p-7 sm:p-8 bg-white dark:bg-[#11192e] rounded-3xl border-l-4 border-emerald-600 dark:border-emerald-500 shadow-xl shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-800 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      {pageT.humanResourceTitle || "Human Resource Development & Marginalized Focus"}
                    </h3>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
                    {pageT.humanResourceDesc || "Over the years, the organization has among others (NGOs, Trusts) made a significant contribution to planning, action strategies, and Human Resource Development in several areas, ranging from sustainable rural and urban development to education, health, Agriculture, and Human Rights. In all cases, the focus has been on the disadvantaged and marginalized sections of societies, such as women, children, and tribal communities."}
                  </p>
                </div>
              )}

              {/* Quick Summary Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#11192e]/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Founded</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">February 09, 2012 (Society Reg: 206/2012)</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#11192e]/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Statutory Tax Status</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Section 12A &amp; 80G Tax Exemption Approved</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 📜 STATUTORY & COMPLIANCE DOCUMENTS VAULT (ELEVATED INTERACTIVE UX) */}
      <section id="our-documents" className="py-20 sm:py-28 bg-white dark:bg-[#0c1324] border-y border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-600 text-white rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
              <FileCheck className="h-4 w-4 text-amber-300" />
              <span>Verified Government Approvals</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              {pageT.documentsHeading || "Our Documents"}
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium">
              {pageT.documentsSubheading || "Official Registrations, Certifications & Statutory Approvals of Kingdom of Christ Ministries"}
            </p>
          </div>

          {/* Interactive Document Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { id: "all", label: "All Documents (6)" },
              { id: "tax", label: "Tax Exemptions (12A & 80G)" },
              { id: "govt", label: "Govt & NITI Aayog (Darpan & E-Anudhan)" },
              { id: "registration", label: "Registrations (ROC & MSME)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setDocCategory(cat.id)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                  docCategory === cat.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 6 Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredDocuments.map((doc, idx) => {
              const Icon = doc.icon;
              const globalIndex = officialDocuments.findIndex(d => d.id === doc.id);
              return (
                <div
                  key={doc.id}
                  className="bg-slate-50 dark:bg-[#11192e] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-950/5 dark:shadow-black/30 hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    {/* Top Header with Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${doc.bg} rounded-2xl flex items-center justify-center border border-slate-200/60 dark:border-slate-800 group-hover:scale-110 transition-transform shadow-sm`}>
                        <Icon className={`h-6 w-6 ${doc.color}`} />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${doc.badgeColor}`}>
                          {doc.badge}
                        </span>
                      </div>
                    </div>

                    {/* Document Title */}
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {doc.title}
                    </h3>

                    <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 leading-snug">
                      {doc.subtitle}
                    </p>

                    {/* High-Definition Interactive Document Thumbnail Frame */}
                    <div 
                      onClick={() => setSelectedDocIndex(globalIndex)}
                      className="relative w-full h-48 sm:h-52 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 mb-4 cursor-pointer group/img shadow-inner"
                    >
                      <Image
                        src={doc.image}
                        alt={doc.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain object-top p-2.5 transition-transform duration-500 group-hover/img:scale-105"
                      />
                      <div className="absolute inset-0 bg-slate-950/0 group-hover/img:bg-slate-950/50 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover/img:opacity-100 transition-opacity bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 shadow-2xl">
                          <ZoomIn className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span>Enlarge Certificate</span>
                        </div>
                      </div>
                    </div>

                    {/* Registration Key Fields */}
                    <div className="space-y-2 py-3 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">{doc.highlightField.label}:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-right">{doc.highlightField.value}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">Date:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{doc.date}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">Authority:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right leading-tight">{doc.authority}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <button
                      onClick={() => setSelectedDocIndex(globalIndex)}
                      className="w-full py-3 px-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all duration-200 shadow-sm"
                    >
                      <ZoomIn className="h-4 w-4" />
                      <span>{pageT.viewDetails || "View Certificate & Details"}</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 🎯 OUR MISSION & VISION SIGNATURE DUAL SHOWCASE */}
      <section id="mission-vision" className="py-20 sm:py-28 bg-gradient-to-b from-slate-100/70 to-slate-50 dark:from-[#090e1f] dark:to-[#080d1a] border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-black uppercase tracking-widest mb-3.5 shadow-sm">
              <Target className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>{pageT.missionVisionHeading || "Our Mission & Vision"}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              Guiding Purpose &amp; Strategic Roadmap
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium">
              {pageT.missionVisionSubheading || "Dedicated to holistic community upliftment, quality education, and sustainable transformation for rural communities"}
            </p>
          </div>

          {/* Dual Bento Mission & Vision Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Card 1: Our Mission */}
            <div className="bg-white dark:bg-[#11192e] border-2 border-amber-500/20 dark:border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-slate-950/5 dark:shadow-black/40 flex flex-col justify-between hover:border-amber-500 hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:border-amber-500 transition-all shadow-md">
                    <Target className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-full border border-amber-500/30">
                    Mission Pillars
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-6">
                  {pageT.cardMissionTitle || "Our Mission"}
                </h3>

                <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-normal mb-8">
                  {pageT.cardMissionDesc || "We are destined to support needy rural communities with adequate care, protection, and rehabilitation support with innovative service initiatives to alleviate their lives economically, socially, culturally, and health-wise. In order to realize our vision, we have adopted the following mission objectives: To conceptualize and develop support initiatives to bring sustainable change in the lives of the needy, To promote education and economic growth skills among rural communities for a better tomorrow, To offer a complete range of services and help to remove the social stigma from the lives of rural communities."}
                </p>
              </div>

              {/* Action List Tags */}
              <div className="pt-6 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span>Rural Community Care</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span>Skill &amp; Economic Growth</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span>Removing Social Stigma</span>
                </div>
              </div>
            </div>

            {/* Card 2: Our Vision */}
            <div className="bg-white dark:bg-[#11192e] border-2 border-indigo-500/20 dark:border-indigo-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-slate-950/5 dark:shadow-black/40 flex flex-col justify-between hover:border-indigo-500 hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-500/10 border-2 border-indigo-500/40 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-500 transition-all shadow-md">
                    <Eye className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-500/30">
                    Strategic Vision
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-6">
                  {pageT.cardVisionTitle || "Our Vision"}
                </h3>

                <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-normal mb-8">
                  {pageT.cardVisionDesc || "Education is a fundamental human right, and at KINGDOM OF CHRIST MINISTRIES, we are committed to ensuring that every child has access to quality education. Through our various initiatives, we work tirelessly to bridge the education gap, providing resources, scholarships, and mentorship to young learners. Together, we are shaping a brighter future for the next generation."}
                </p>
              </div>

              {/* Action List Tags */}
              <div className="pt-6 border-t border-indigo-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span>Quality Education Access</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span>Bridging Education Gap</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span>Next-Gen Mentorship</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🎓 EDUCATION AS A FUNDAMENTAL RIGHT SPOTLIGHT (HARMONIOUS LIGHT & DARK MODE) */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/70 dark:from-[#0d142c] dark:via-[#111936] dark:to-[#0a0f24] text-slate-900 dark:text-white relative overflow-hidden border-b border-purple-100 dark:border-purple-500/20 transition-colors duration-300">
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-100/80 dark:bg-amber-500/20 rounded-full text-xs font-black uppercase tracking-widest border border-amber-300 dark:border-amber-400/40 text-amber-900 dark:text-amber-300 shadow-sm">
                <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Transformative Educational Initiative</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {pageT.educationVisionTitle || "Education as a Fundamental Right"}
              </h2>

              <p className="text-base sm:text-lg text-slate-700 dark:text-purple-100/90 leading-relaxed font-normal">
                {pageT.educationVisionDesc || "At KINGDOM OF CHRIST MINISTRIES, we envision a world where education is a fundamental right for all. Since our inception in 2012, we have been dedicated to breaking down barriers to education, especially for marginalized and disadvantaged communities. Through our school-building initiatives, scholarship programs, and teacher training, we are working towards creating a brighter future for children and youth, empowering them with the knowledge and skills they need to succeed."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-3 bg-white dark:bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 dark:border-white/15 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">School-Building Initiatives</span>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 dark:border-white/15 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all">
                  <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Scholarship Programs</span>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 dark:border-white/15 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Teacher &amp; Skills Training</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="bg-white dark:bg-[#11192e] backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10 rounded-3xl text-center space-y-5 max-w-sm shadow-xl shadow-purple-900/5 dark:shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-3xl flex items-center justify-center mx-auto shadow-lg text-slate-950 font-black">
                  <BookOpen className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Empowering Future Generations
                </h3>
                <p className="text-sm text-slate-600 dark:text-purple-100 font-normal leading-relaxed">
                  Equipping children, youth, women, and tribal communities with world-class learning and technical career skills.
                </p>
                <div className="pt-2">
                  <Link
                    href="/member/give"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-amber-300 rounded-xl font-bold text-xs transition-colors shadow-md"
                  >
                    <span>Support A Student</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🏛️ 4 CORE PILLARS OF TRANSFORMATION (BENTO GRID) */}
      <section className="py-20 sm:py-28 bg-slate-50 dark:bg-[#0c1324] border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-600 text-white rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{pageT.pillarsTitle || "Core Pillars of Impact"}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Comprehensive Community Transformation
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium">
              {pageT.pillarsSubtitle || "Holistic ministry advancing spiritual, educational, medical, and social transformation"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#11192e] rounded-3xl p-7 shadow-xl shadow-slate-950/5 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-800 hover:scale-[1.03] hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-13 h-13 ${pillar.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${pillar.color}`} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 leading-snug">
                      {pillar.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 🗺️ MILESTONE JOURNEY TIMELINE */}
      <section className="py-20 sm:py-28 bg-white dark:bg-[#090e1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              {pageT.journey || "Our Milestones of Faith & Action"}
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {journeySteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="relative group bg-slate-50 dark:bg-[#11192e] rounded-3xl p-8 shadow-xl shadow-slate-950/5 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.accent}`} />
                  
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 ${item.bg} border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-7 w-7 ${item.color}`} />
                      </div>
                      
                      <span className="text-sm font-black uppercase tracking-widest px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-purple-600 dark:text-purple-400 shadow-sm">
                        {item.year}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 🌟 TODAY & IMPACT HIGHLIGHT */}
      <section className="py-20 bg-slate-100/70 dark:bg-[#0c1324] border-t border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/10 via-slate-900/5 to-indigo-900/10 dark:from-purple-950/40 dark:via-[#11192e] dark:to-indigo-950/40 border border-purple-200/60 dark:border-purple-800/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                {pageT.today || "Today & Our Continuing Mission"}
              </h2>

              <p className="text-slate-700 dark:text-slate-100 leading-relaxed text-lg sm:text-xl mb-6 font-medium">
                {pageT.todayP1Part1 || "Today, The KINGDOM OF CHRIST MINISTRIES stands as a beacon of hope, spiritual growth, and social transformation with our enduring commitment: "}
                <strong className="font-black px-3 py-1 bg-purple-600 text-white rounded-lg border border-purple-500 shadow-sm mx-1.5 inline-block">
                  "{pageT.todayMissionQuote || "Empowering Lives Through Christ, Compassion & Education"}"
                </strong>
                {pageT.todayP1Part2 || "."}
              </p>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base sm:text-lg mb-8 font-normal">
                {pageT.todayP2 || "Every week, thousands are served through our church worship services, 24/7 prayer support, educational institutes, medical camps, orphan support programs, and community welfare initiatives."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-purple-200/50 dark:border-purple-800/40">
                <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  <span>24/7 Prayer &amp; Counseling</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                  <span>Educational &amp; Medical Camps</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  <CheckCircle2 className="h-5 w-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                  <span>Orphan Sheltering &amp; Relief</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 CALL TO ACTION SECTION */}
      <section className="py-20 bg-[#090e1f] relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight animate-fade-in-up">
              {pageT.join || "Join Our Story & Mission"}
            </h2>

            <p className="text-base sm:text-xl text-slate-300 mb-10 animate-fade-in-up animate-delay-100 font-normal">
              {pageT.joinSubtitle || "Partner with Sri. Kurra Kristhu Raju and Kingdom of Christ Ministries to transform lives and empower communities."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in animate-delay-200">
              <Link
                href="/membership"
                className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2.5 shadow-lg"
              >
                <span>{pageT.becomeMember || "Join Our Community"}</span>
                <ArrowRight className="h-5 w-5 text-purple-600" />
              </Link>
              
              <Link
                href="/give"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-purple-600/30 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-5 w-5 text-amber-300" />
                <span>Donate (80G Tax-Exempt)</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📄 FULL-SCREEN LIGHTBOX & STATUTORY DOCUMENT INSPECTION MODAL */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedDocIndex(null)}
        >
          <div 
            className="bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800 rounded-[2rem] max-w-5xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[94vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header Bar */}
            <div className="flex items-start justify-between pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${selectedDoc.bg} rounded-2xl flex items-center justify-center border border-slate-200/60 dark:border-slate-800 shadow-sm`}>
                  {(() => {
                    const Icon = selectedDoc.icon;
                    return <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${selectedDoc.color}`} />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {selectedDoc.title}
                    </h3>
                    <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${selectedDoc.badgeColor}`}>
                      {selectedDoc.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                    {selectedDoc.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Document Button */}
                <button
                  disabled={selectedDocIndex === 0}
                  onClick={() => setSelectedDocIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  title="Previous Document (Left Arrow)"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Next Document Button */}
                <button
                  disabled={selectedDocIndex === officialDocuments.length - 1}
                  onClick={() => setSelectedDocIndex(prev => (prev !== null && prev < officialDocuments.length - 1 ? prev + 1 : prev))}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  title="Next Document (Right Arrow)"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedDocIndex(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body: Two-Column Side-by-Side Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-6">
              
              {/* Left Column: Full Document Image Viewer */}
              <div className="lg:col-span-6 bg-slate-100 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                <div className="relative w-full h-[400px] sm:h-[460px] rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                  <Image
                    src={selectedDoc.image}
                    alt={selectedDoc.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="mt-3 flex items-center justify-between w-full px-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Official Certificate Document
                  </span>
                  <a
                    href={selectedDoc.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1.5"
                  >
                    <span>Open High Resolution Image</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: Structured Statutory Credentials Table */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Verified Statutory Credentials
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Govt. Verified</span>
                  </span>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {selectedDoc.details.map((item: any, i: number) => {
                    const isCopied = copiedKey === `${selectedDoc.id}-${i}`;
                    return (
                      <div 
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0c1324] border border-slate-200/80 dark:border-slate-800/80 gap-1.5"
                      >
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {item.label}
                        </span>
                        
                        <div className="flex items-center gap-2 sm:justify-end">
                          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white sm:text-right font-mono">
                            {item.value}
                          </span>
                          {item.copyable && (
                            <button
                              onClick={() => handleCopy(item.value, `${selectedDoc.id}-${i}`)}
                              className="p-1 rounded-md text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                              title="Copy to Clipboard"
                            >
                              {isCopied ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <a
                href={selectedDoc.image}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Full Resolution Image</span>
              </a>

              <button
                onClick={() => setSelectedDocIndex(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity text-xs sm:text-sm"
              >
                {pageT.closeModal || "Close Viewer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}