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
  const pageT = useMemo(() => (t as any)?.pages?.story || {}, [t]);

  // State management
  const [selectedDocIndex, setSelectedDocIndex] = useState<number | null>(null);
  const [modalTab, setModalTab] = useState<"certificate" | "details">("certificate");
  const [docCategory, setDocCategory] = useState<string>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLeaderTab, setActiveLeaderTab] = useState<string>("overview");

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Prevent background scrolling on body when document modal is open (robust iOS & Android scroll lock)
  useEffect(() => {
    if (selectedDocIndex !== null) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedDocIndex]);

  // Direct hash anchor handler for #80g and legal documents
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase().replace("#", "");
      if (hash === "80g" || hash === "12a" || hash === "roc" || hash === "darpan" || hash === "e-anudhan" || hash === "msme") {
        setDocCategory("all");
        setTimeout(() => {
          const el = document.getElementById(hash) || document.getElementById("our-documents");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 200);
      } else if (hash === "our-documents") {
        setTimeout(() => {
          const el = document.getElementById("our-documents");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const stats = [
    { 
      value: "12+", 
      label: pageT.statYears || (language === "te" ? "సంవత్సరాల అవిశ్రాంత సేవ" : language === "hi" ? "वर्षों की समर्पित सेवा" : "Years of Active Service"), 
      sublabel: language === "te" ? "2012 నుండి కొనసాగుతున్న సేవ" : language === "hi" ? "2012 से निरंतर सेवा" : "Faithfully Serving Since 2012",
      icon: Calendar, 
      accent: "from-purple-500 to-indigo-600",
      bg: "bg-purple-100/90 text-purple-700 border-purple-200/90 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-400/30 dark:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
    },
    { 
      value: "3+", 
      label: pageT.statLocations || (language === "te" ? "చర్చి & సేవా కేంద్రాలు" : language === "hi" ? "सक्रिय केंद्र और परिसर" : "Active Centers & Campuses"), 
      sublabel: language === "te" ? "షాపూర్, సుభాష్ నగర్, బహదూర్‌పల్లి" : language === "hi" ? "शापुर, सुभाष नगर, बहादुरपल्ली" : "Shapur, Subhash Nagar, Bahadurpally",
      icon: MapPin, 
      accent: "from-indigo-500 to-cyan-600",
      bg: "bg-indigo-100/90 text-indigo-700 border-indigo-200/90 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-400/30 dark:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
    },
    { 
      value: "10,000+", 
      label: pageT.statMembers || (language === "te" ? "విశ్వాసులు & లబ్ధిదారులు" : language === "hi" ? "विश्वासी और लाभार्थी" : "Believers & Beneficiaries"), 
      sublabel: language === "te" ? "కుటుంబాలు, అనాథలు & విద్యార్థులు" : language === "hi" ? "परिवार, अनाथ और विद्यार्थी" : "Families, Orphans & Students Supported",
      icon: Users, 
      accent: "from-pink-500 to-rose-600",
      bg: "bg-pink-100/90 text-pink-700 border-pink-200/90 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-400/30 dark:shadow-[0_0_15px_rgba(236,72,153,0.2)]"
    },
    { 
      value: "50+", 
      label: pageT.statOutreaches || (language === "te" ? "వార్షిక సేవా ప్రాజెక్ట్‌లు" : language === "hi" ? "वार्षिक सेवा परियोजनाएं" : "Welfare & Mission Projects"), 
      sublabel: language === "te" ? "ఆహారం, ఉచిత వైద్య శిబిరాలు & విద్య" : language === "hi" ? "भोजन, स्वास्थ्य शिविर और शिक्षा" : "Food, Health Camps & Education",
      icon: Globe, 
      accent: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-100/90 text-emerald-700 border-emerald-200/90 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30 dark:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
    },
  ];

  const officialDocuments = useMemo(() => [
    {
      id: "roc",
      num: "1",
      category: "registration",
      title: pageT.doc1Title || "ROC Society Registration",
      subtitle: pageT.doc1Subtitle || "Certificate of Registration (Reg: 206/2012)",
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
      title: pageT.doc2Title || "NGO DARPAN Registration",
      subtitle: pageT.doc2Subtitle || "NITI Aayog NGO Portal, Govt. of India",
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
      title: pageT.doc3Title || "Section 12A Tax Exemption",
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
      title: pageT.doc4Title || "Section 80G Donor Tax Relief",
      subtitle: pageT.doc4Subtitle || "50% Tax Exemption for Donors (Form 10AC)",
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
      title: pageT.doc5Title || "E-Anudhan Govt. Portal",
      subtitle: pageT.doc5Subtitle || "Ministry of Social Justice & Empowerment",
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
      title: pageT.doc6Title || "MSME Enterprise Registration",
      subtitle: pageT.doc6Subtitle || "Ministry of Micro, Small & Medium Enterprises",
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
  ], [pageT]);

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
  }, [selectedDocIndex, officialDocuments.length]);

  const filteredDocuments = useMemo(() => {
    if (docCategory === "all") return officialDocuments;
    return officialDocuments.filter(d => d.category === docCategory);
  }, [docCategory, officialDocuments]);

  const selectedDoc = selectedDocIndex !== null ? officialDocuments[selectedDocIndex] : null;

  const impactPillars = [
    {
      title: pageT.pillar1Title || "Educational & Technical Institutes",
      desc: pageT.pillar1Desc || "School-building initiatives, scholarship programs, teacher training, and technical institutes breaking barriers for youth.",
      icon: GraduationCap,
      badge: "Education & Skills",
      badgeStyle: "bg-amber-100/90 text-amber-800 border-amber-300/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30",
      accent: "from-amber-500 to-orange-600",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100/80 dark:bg-amber-950/60",
      border: "border-amber-200/80 dark:border-amber-500/30",
      tags: ["School Infrastructure", "Merit Scholarships"]
    },
    {
      title: pageT.pillar2Title || "Medical & Health Services",
      desc: pageT.pillar2Desc || "Establishing medical institutes, health outreach clinics, supportive relief, and essential community wellness.",
      icon: Stethoscope,
      badge: "Healthcare & Relief",
      badgeStyle: "bg-emerald-100/90 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
      accent: "from-emerald-500 to-teal-600",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100/80 dark:bg-emerald-950/60",
      border: "border-emerald-200/80 dark:border-emerald-500/30",
      tags: ["Free Health Camps", "Essential Medicines"]
    },
    {
      title: pageT.pillar3Title || "Food & Orphan Sheltering",
      desc: pageT.pillar3Desc || "Providing nourishing daily meals, safe sanctuary, holistic care, and loving shelter for orphans and children in need.",
      icon: Utensils,
      badge: "Orphan Care & Nutrition",
      badgeStyle: "bg-rose-100/90 text-rose-800 border-rose-300/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/30",
      accent: "from-rose-500 to-pink-600",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100/80 dark:bg-rose-950/60",
      border: "border-rose-200/80 dark:border-rose-500/30",
      tags: ["Daily Nutrition", "Loving Sanctuary"]
    },
    {
      title: pageT.pillar4Title || "Social Justice & Welfare Policy",
      desc: pageT.pillar4Desc || "Policy contributions at State, National, and International levels, empowering women, children, and tribal communities.",
      icon: ShieldCheck,
      badge: "Justice & Policy",
      badgeStyle: "bg-purple-100/90 text-purple-800 border-purple-200/90 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500/30",
      accent: "from-purple-500 to-indigo-600",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100/80 dark:bg-purple-950/60",
      border: "border-purple-200/80 dark:border-purple-500/30",
      tags: ["Human Rights", "Marginalized Focus"]
    },
  ];

  const journeySteps = [
    {
      step: "01",
      year: "2012 (ESTABLISHED)",
      title: pageT.foundationTitle || "Foundational Inception & Calling",
      desc: pageT.foundationDesc || "Founded in 2012 by Sri. Kurra Kristhu Raju with a deep spiritual calling for prayer, social justice, and selfless community upliftment.",
      icon: Church,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100/90 dark:bg-purple-950/70",
      border: "border-purple-200/90 dark:border-purple-500/30",
      accent: "from-purple-500 to-indigo-600",
      badgeStyle: "bg-purple-100/90 text-purple-800 border-purple-200/90 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-400/30",
      milestoneTag: "Formal ROC Society Registration (206/2012)"
    },
    {
      step: "02",
      year: "2015 – 2018",
      title: pageT.growthTitle || "Grassroots Welfare & Sanctuary",
      desc: pageT.growthDesc || "Continuous expansion into holistic community care, mobile medical relief clinics, weekly food distribution, and loving shelter for orphans.",
      icon: Building,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100/90 dark:bg-indigo-950/70",
      border: "border-indigo-200/90 dark:border-indigo-500/30",
      accent: "from-indigo-500 to-cyan-600",
      badgeStyle: "bg-indigo-100/90 text-indigo-800 border-indigo-200/90 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-400/30",
      milestoneTag: "Campuses in Shapur, Subhash Nagar & Bahadurpally"
    },
    {
      step: "03",
      year: "2019 – 2024",
      title: pageT.communityTitle || "Statutory Accreditations & Policy",
      desc: pageT.communityDesc || "Achieving key government recognitions, 12A/80G tax exemptions, NITI Aayog Darpan enrollment, and contributing to state and national welfare policies.",
      icon: HeartHandshake,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-100/90 dark:bg-pink-950/70",
      border: "border-pink-200/90 dark:border-pink-500/30",
      accent: "from-pink-500 to-rose-600",
      badgeStyle: "bg-pink-100/90 text-pink-800 border-pink-200/90 dark:bg-pink-950/70 dark:text-pink-300 dark:border-pink-400/30",
      milestoneTag: "12A/80G Tax Exemptions & MSME Certification"
    },
    {
      step: "04",
      year: "VISION 2030",
      title: pageT.missionTitle || "Universal Education & Vision 2030",
      desc: pageT.missionDesc || "Constructing enduring schools, technical institutes, and scholarship programs empowering marginalized youth, women, and tribal sections.",
      icon: GraduationCap,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100/90 dark:bg-emerald-950/70",
      border: "border-emerald-200/90 dark:border-emerald-500/30",
      accent: "from-emerald-500 to-teal-600",
      badgeStyle: "bg-emerald-100/90 text-emerald-800 border-emerald-200/90 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-400/30",
      milestoneTag: "Modern Digital Learning Labs & Tribal Campuses"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />
      
      {/* 🌌 HERO SECTION: LUXURY EDITORIAL EXPERIENCE */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 md:pt-40 md:pb-28 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-[#090e1f] dark:via-[#0c1329] dark:to-[#090e1f] text-slate-900 dark:text-white overflow-hidden border-b border-purple-100/80 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
        {/* Cinematic Ambient Backlight Glows */}
        <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-purple-400/20 via-indigo-400/20 to-pink-400/15 dark:from-purple-600/20 dark:via-indigo-600/20 dark:to-pink-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 dark:opacity-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Top Navigation Pill */}
            <div className="mb-4 sm:mb-6 flex justify-center">
              <BackToHome label={pageT.backToHome || (t as any)?.nav?.home || (language === "te" ? "హోమ్" : language === "hi" ? "होम" : "Home")} />
            </div>
            
            {/* Verified Organization Emblem Badge — Clean, Responsive & Symmetrical */}
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-purple-100/90 dark:bg-purple-950/70 border border-purple-200/90 dark:border-purple-500/30 rounded-full text-purple-900 dark:text-purple-200 text-xs sm:text-sm font-extrabold tracking-wide mb-5 sm:mb-6 shadow-xs backdrop-blur-md animate-fade-in font-outfit">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-amber-300 shrink-0" />
              <span className="font-extrabold tracking-wider uppercase text-[11px] sm:text-xs">
                {language === "te" ? (
                  <>
                    <span className="hidden sm:inline">కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్ • </span>
                    <span className="sm:hidden">KCM • </span>
                    <span>స్థాపన 2012</span>
                  </>
                ) : language === "hi" ? (
                  <>
                    <span className="hidden sm:inline">द किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज • </span>
                    <span className="sm:hidden">KCM • </span>
                    <span>स्थापना 2012</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">THE KINGDOM OF CHRIST MINISTRIES • </span>
                    <span className="sm:hidden">KCM • </span>
                    <span>ESTABLISHED 2012</span>
                  </>
                )}
              </span>
            </div>

            {/* Main Page Title — Bulletproof Phrasing & Hierarchy Across Screen Widths */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-5 sm:mb-6 tracking-tight leading-[1.12] animate-fade-in-up font-outfit">
              <span className="block text-slate-900 dark:text-white">
                {language === "te" ? "మా ఆత్మీయ ప్రయాణం," : language === "hi" ? "हमारी यात्रा," : "Our Journey,"}
              </span>
              <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 dark:from-purple-300 dark:via-indigo-200 dark:to-pink-300 bg-clip-text text-transparent">
                {language === "te" ? "దర్శనం & ప్రభావం" : language === "hi" ? "दृष्टिकोण और प्रभाव" : "Vision & Impact"}
              </span>
            </h1>
            
            {/* Subtitle Narrative — Typography Balanced with No Lonely Orphans */}
            <p className="text-sm sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 animate-fade-in-up animate-delay-200 font-medium max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 font-sans text-balance">
              {pageT.subtitle ||
                (language === "te"
                  ? "కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్ — 2012 నుండి జీవితాలను రూపాంతరం చేస్తూ, విద్యను ప్రోత్సహిస్తూ మరియు సమాజానికి సేవలందిస్తోంది."
                  : language === "hi"
                  ? "द किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज — 2012 से जीवन को बदलते हुए, शिक्षा को बढ़ावा देते हुए और समुदायों की सेवा करते हुए।"
                  : "The Kingdom of Christ Ministries — Transforming Lives, Championing Education & Serving Communities Since 2012")}
            </p>

            {/* Quick Action Navigation Buttons — Elevated Touch-Target Architecture (48px+) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-xl mx-auto animate-fade-in-up animate-delay-300">
              <a
                href="#our-documents"
                className="group w-full sm:w-auto min-h-[48px] sm:min-h-[50px] px-6 py-3.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:via-indigo-500 hover:to-purple-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 border border-white/20 select-none"
              >
                <FileCheck className="h-4 w-4 text-purple-200 group-hover:text-white transition-colors shrink-0" />
                <span>{language === "te" ? "చట్టపరమైన పత్రాలు & ధృవీకరణ" : language === "hi" ? "दस्तावेज़ और अनुपालन वॉल्ट" : "Compliance & Documents Vault"}</span>
                <ChevronRight className="h-4 w-4 text-purple-300/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </a>
              <a
                href="#mission-vision"
                className="group w-full sm:w-auto min-h-[48px] sm:min-h-[50px] px-6 py-3.5 bg-white/95 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/90 text-slate-900 dark:text-white text-xs sm:text-sm font-extrabold rounded-2xl border border-slate-300/80 dark:border-slate-700/80 hover:border-purple-400 dark:hover:border-purple-500/50 backdrop-blur-md shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 select-none"
              >
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
                <span>{language === "te" ? "మా మిషన్ & దర్శనం" : language === "hi" ? "हमारा मिशन और दृष्टिकोण" : "Our Mission & Vision"}</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 📊 FLOATING STATS METRIC BAR (ELEVATED UX CARDS) */}
      <section className="relative z-20 -mt-8 sm:-mt-12 md:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="h-full min-h-[145px] sm:min-h-[165px] bg-white/95 dark:bg-[#11192e]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40 p-4 sm:p-5 md:p-6 rounded-3xl shadow-lg shadow-slate-950/5 dark:shadow-2xl dark:shadow-black/50 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3.5">
                  <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center border ${stat.bg} group-hover:scale-110 transition-transform shadow-xs`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>
                
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1 font-outfit">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-1 font-outfit leading-snug">
                    {stat.label}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
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
              
              {/* Founder High-Definition Portrait Card — Seamless in both Light & Dark modes */}
              <div className="relative group bg-white dark:bg-[#11192e] rounded-[2.5rem] overflow-hidden border border-slate-200/90 dark:border-purple-500/20 shadow-xl shadow-slate-950/5 dark:shadow-black/70 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500/40">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Pastor Portrait Box — Studio Backlight with High-Definition Transparent Cutout */}
                <div className="relative w-full h-[360px] sm:h-[420px] overflow-hidden bg-gradient-to-b from-purple-50/70 via-slate-50 to-white dark:from-[#0d152c] dark:via-[#101938] dark:to-[#0c1324]">
                  <Image
                    src="/pastor.png"
                    alt="Bishop Kurra Kristhu Raju"
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-contain object-top pt-2 sm:pt-4 transition-transform duration-700 group-hover:scale-105"
                    priority
                    unoptimized
                  />
                  <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-[#0c1324] dark:via-[#0c1324]/40 pointer-events-none" />
                </div>

                {/* Name & Title Header Overlay — Theme Adaptive with high-contrast text */}
                <div className="relative z-10 p-5 sm:p-6 md:p-7 bg-white/95 dark:bg-[#0c1324] border-t border-slate-100 dark:border-purple-500/20">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-400/50 rounded-full text-xs font-black uppercase tracking-wider mb-2.5 shadow-2xs">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-amber-700 dark:text-amber-300 font-bold">{pageT.leaderTitle || "Visionary Leader"}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1.5 font-outfit leading-tight">
                    {pageT.leaderName || "Sri. KURRA KRISTHU RAJU"}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300 leading-snug">
                    President &amp; Founder • Kingdom of Christ Ministries
                  </p>
                </div>
              </div>

              {/* Leadership Vision Quote Callout — Editorial Pull-Quote Architecture */}
              <div className="relative bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-[#11192e] dark:via-[#131d38] dark:to-[#0f172a] rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-950/5 dark:shadow-black/50 overflow-hidden border border-slate-200/90 dark:border-purple-500/30 group">
                {/* Ambient Decorative Watermark Quote (Positioned Subtly at Bottom-Right) */}
                <div className="absolute -bottom-4 -right-2 text-purple-600/5 dark:text-purple-400/5 pointer-events-none select-none">
                  <Quote className="h-24 w-24 rotate-12" />
                </div>

                {/* Header: Crisp, Single-Line Verified Badge */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-100/90 dark:bg-purple-950/80 border border-purple-200/90 dark:border-purple-500/30 rounded-full shadow-2xs">
                    <Quote className="h-3.5 w-3.5 text-purple-600 dark:text-purple-300 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-200 font-outfit whitespace-nowrap">
                      {language === "te" ? "దార్శనిక సందేశం" : language === "hi" ? "दूरदर्शी संदेश" : "Visionary Statement"}
                    </span>
                  </div>
                </div>

                {/* Quote Body: Editorial Typography with Balanced Flow */}
                <blockquote className="relative z-10 text-sm sm:text-base text-slate-800 dark:text-slate-100 italic leading-relaxed font-medium mb-5 text-balance">
                  &ldquo;{pageT.quoteText || (language === "te" ? "ఆరాధన ద్వారా క్రీస్తు ప్రేమను పంచడమే కాకుండా, విద్య, వైద్యం మరియు అణగారిన వారికి ఆశ్రయం కల్పించడం ద్వారా పేదరికాన్ని నిర్మూలించే గొప్ప సంస్థను నిర్మించడానికి దేవుడు మమ్మల్ని పిలిచాడు." : language === "hi" ? "परमेश्वर ने हमें केवल आराधना में मसीह के प्रेम को साझा करने के लिए ही नहीं, बल्कि शिक्षा, स्वास्थ्य और अनाथों के आश्रय के माध्यम से गरीबी और अशिक्षा की बेड़ियों को तोड़ने वाले एक महान संस्थान के निर्माण के लिए बुलाया है।" : "God called us to build an enduring institution that not only shares Christ's love in worship, but breaks the chains of poverty and ignorance through education, healthcare, and shelter for the marginalized.")}&rdquo;
                </blockquote>

                {/* Author Attribution Footer: Signature-Grade Polish (No Truncation) */}
                <div className="relative z-10 pt-3.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-purple-300 dark:border-purple-500/50 shadow-sm shrink-0 bg-slate-100 dark:bg-slate-900">
                    <Image
                      src="/pastor.png"
                      alt="Sri. Kurra Kristhu Raju"
                      fill
                      sizes="44px"
                      className="object-cover object-top scale-125"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-outfit leading-snug">
                      {language === "te" ? "శ్రీ కుర్రా క్రీస్తు రాజు" : language === "hi" ? "श्री कुर्रा क्रिस्तु राजू" : "Sri. Kurra Kristhu Raju"}
                    </div>
                    <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 leading-snug mt-0.5">
                      {language === "te" ? (
                        <>
                          <span>వ్యవస్థాపక అధ్యక్షుడు • </span>
                          <span className="sm:inline block">కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్</span>
                        </>
                      ) : language === "hi" ? (
                        <>
                          <span>संस्थापक अध्यक्ष • </span>
                          <span className="sm:inline block">द किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज</span>
                        </>
                      ) : (
                        <>
                          <span>President &amp; Founder • </span>
                          <span className="sm:inline block">Kingdom of Christ Ministries</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Narrative & Pillars Tabs */}
            <div className="lg:col-span-7 space-y-6">
              
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-100 dark:bg-purple-950/70 border border-purple-200/90 dark:border-purple-500/30 text-purple-800 dark:text-purple-200 rounded-full text-xs font-black uppercase tracking-widest mb-3.5 shadow-2xs">
                  <Award className="h-3.5 w-3.5 text-purple-600 dark:text-amber-300" />
                  <span>{language === "te" ? "కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్" : language === "hi" ? "द किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज" : "The Kingdom of Christ Ministries"}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-outfit">
                  {pageT.heritageHeading || (language === "te" ? "దార్శనిక నాయకత్వం & వారసత్వం" : language === "hi" ? "दूरदर्शी नेतृत्व और विरासत" : "Visionary Leadership & Heritage")}
                </h2>
              </div>

              {/* Interactive Narrative Navigation: Mobile-First Tactile Segmented Control */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 w-full shadow-inner">
                {[
                  { id: "overview", label: "Inception & Vision", icon: Church },
                  { id: "welfare", label: "Social Welfare & Care", icon: HeartHandshake },
                  { id: "marginalized", label: "Marginalized Focus", icon: ShieldCheck },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeLeaderTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveLeaderTab(tab.id)}
                      className={`flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 select-none cursor-pointer active:scale-[0.98] ${
                        isActive
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-[1.01]"
                          : "bg-white/60 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 border border-slate-200/40 dark:border-white/5"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
                      <span className="whitespace-nowrap text-center">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Narrative Display Cards — Luxury Card Geometry with Optical Icon Alignment */}
              {activeLeaderTab === "overview" && (
                <div className="p-6 sm:p-8 bg-white dark:bg-[#11192e] rounded-3xl border border-slate-200/90 dark:border-purple-500/20 shadow-xl shadow-slate-900/5 dark:shadow-black/40 space-y-4 animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-600" />
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-950/70 border border-purple-200/80 dark:border-purple-500/30 rounded-2xl text-purple-600 dark:text-purple-400 shrink-0 shadow-xs mt-0.5">
                      <Church className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 block mb-1">
                        2012 — Foundation &amp; Inception
                      </span>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-snug font-outfit">
                        Founded in 2012 Under Visionary Leadership
                      </h3>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
                    {pageT.leaderDesc || "Our organization is guided by visionary leader Sri. Kurra Kristhu Raju, whose dedicated leadership and spiritual commitment have shaped our mission since inception. Established in 2012, Kingdom of Christ Ministries has continuously expanded its reach across social empowerment, quality education, free medical relief camps, food distribution, and loving shelter for orphans and disadvantaged communities."}
                  </p>
                </div>
              )}

              {activeLeaderTab === "welfare" && (
                <div className="p-6 sm:p-8 bg-white dark:bg-[#11192e] rounded-3xl border border-slate-200/90 dark:border-indigo-500/20 shadow-xl shadow-slate-900/5 dark:shadow-black/40 space-y-4 animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-600" />
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-500/30 rounded-2xl text-indigo-600 dark:text-indigo-400 shrink-0 shadow-xs mt-0.5">
                      <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block mb-1">
                        Community Action &amp; Health
                      </span>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-snug font-outfit">
                        {pageT.sustainableTitle || "Sustainable Development & Social Welfare"}
                      </h3>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
                    {pageT.sustainableDesc || "Kingdom of Christ Ministries promotes sustainable community development, public welfare, and social justice. Our outreach encompasses the establishment of educational, technical, and medical institutes, grassroots humanitarian relief, health camps, vocational skills training, and constructive contributions to welfare initiatives at state and national levels."}
                  </p>
                </div>
              )}

              {activeLeaderTab === "marginalized" && (
                <div className="p-6 sm:p-8 bg-white dark:bg-[#11192e] rounded-3xl border border-slate-200/90 dark:border-emerald-500/20 shadow-xl shadow-slate-900/5 dark:shadow-black/40 space-y-4 animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs mt-0.5">
                      <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block mb-1">
                        Empowerment &amp; Inclusion
                      </span>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-snug font-outfit">
                        {pageT.humanResourceTitle || "Human Resource Development & Marginalized Focus"}
                      </h3>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
                    {pageT.humanResourceDesc || "Over more than a decade of active ministry, our initiatives have championed human resource development and community resilience across rural and urban Telangana. We place special focus on uplifting the most disadvantaged and marginalized sections of society, providing holistic support, dignity, education, and economic empowerment to women, orphans, and tribal communities."}
                  </p>
                </div>
              )}

              {/* Quick Summary Highlights Grid — Institutional Verified Credential Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200/90 dark:border-white/10 shadow-sm flex items-center gap-3.5 hover:border-purple-300 dark:hover:border-purple-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200/80 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0 shadow-xs">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      Registration &amp; Society Act
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-outfit leading-snug">
                      Feb 09, 2012 • Reg: 206/2012
                    </div>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200/90 dark:border-white/10 shadow-sm flex items-center gap-3.5 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0 shadow-xs">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Statutory Tax Status
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-outfit leading-snug">
                      Section 12A &amp; 80G Approved
                    </div>
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

          {/* Interactive Document Category Filter Tabs — Modern Responsive Filter Pills */}
          <div className="relative mb-8 sm:mb-12">
            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-2 scroll-smooth overscroll-x-contain">
              {[
                { id: "all", label: "All Documents (6)", shortLabel: "All (6)" },
                { id: "tax", label: "Tax Exemptions (12A & 80G)", shortLabel: "12A & 80G Tax" },
                { id: "govt", label: "NITI Aayog & Govt. Portals", shortLabel: "NITI & Govt" },
                { id: "registration", label: "Registrations (ROC & MSME)", shortLabel: "ROC & MSME" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setDocCategory(cat.id)}
                  className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer active:scale-95 border ${
                    docCategory === cat.id
                      ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/30 scale-[1.02]"
                      : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-500/30"
                  }`}
                >
                  <span className="sm:hidden">{cat.shortLabel}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 6 Document Cards Grid — High-Definition Portrait Framing & Zero Truncation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {filteredDocuments.map((doc, idx) => {
              const Icon = doc.icon;
              const globalIndex = officialDocuments.findIndex(d => d.id === doc.id);
              return (
                <div
                  key={doc.id}
                  id={doc.id}
                  className="bg-white dark:bg-[#11192e] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-950/5 dark:shadow-black/40 hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden scroll-mt-32"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    {/* Top Header with Sequential Document Index and Category Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 ${doc.bg} rounded-xl flex items-center justify-center border border-slate-200/60 dark:border-slate-800 group-hover:scale-105 transition-transform shadow-xs`}>
                          <Icon className={`h-5 w-5 ${doc.color}`} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-mono font-extrabold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
                          DOC #{doc.num.padStart(2, "0")}
                        </span>
                      </div>
                      
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${doc.badgeColor} shrink-0`}>
                        {doc.badge}
                      </span>
                    </div>

                    {/* Document Title & Subtitle */}
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-outfit leading-tight">
                      {doc.title}
                    </h3>

                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3.5 leading-snug line-clamp-2">
                      {doc.subtitle}
                    </p>

                    {/* High-Definition Interactive Document Thumbnail Frame (Authentic Portrait A4 Certificate Aspect 3:4) */}
                    <div 
                      tabIndex={0}
                      role="button"
                      aria-label={`Enlarge certificate: ${doc.title}`}
                      onClick={() => setSelectedDocIndex(globalIndex)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedDocIndex(globalIndex);
                        }
                      }}
                      className="relative w-full aspect-[3/4] bg-slate-100/90 dark:bg-slate-950/90 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 mb-4 cursor-pointer group/img shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-purple-500 p-2 sm:p-2.5 flex items-center justify-center transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-500/50"
                    >
                      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white">
                        <Image
                          src={doc.image}
                          alt={doc.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain p-1.5 transition-transform duration-500 group-hover/img:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-slate-950/0 group-hover/img:bg-slate-950/40 transition-colors flex items-center justify-center p-4">
                        <div className="opacity-0 group-hover/img:opacity-100 transition-all duration-200 transform translate-y-2 group-hover/img:translate-y-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 shadow-2xl border border-slate-200 dark:border-slate-700">
                          <ZoomIn className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span>Inspect Certificate</span>
                        </div>
                      </div>
                    </div>

                    {/* Registration Key Fields — Full Issuing Details with Zero Clamping */}
                    <div className="space-y-2 py-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-sans">
                      <div className="flex items-start justify-between gap-2.5">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">{doc.highlightField.label}:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-right break-words">{doc.highlightField.value}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2.5">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">Date:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{doc.date}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2.5">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">Authority:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 sm:text-right leading-snug">{doc.authority}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDocIndex(globalIndex)}
                      className="w-full min-h-[46px] py-2.5 px-4 bg-purple-50 hover:bg-purple-600 dark:bg-white/[0.06] dark:hover:bg-purple-600 text-purple-900 hover:text-white dark:text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 border border-purple-200/80 dark:border-white/10 hover:border-purple-600 dark:hover:border-purple-600 transition-all duration-200 shadow-2xs active:scale-[0.98] cursor-pointer"
                    >
                      <ZoomIn className="h-4 w-4" />
                      <span>{pageT.viewDetails || "Inspect Statutory Certificate"}</span>
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

          {/* Dual Bento Mission & Vision Cards — Architecturally Structured Cadence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            
            {/* Card 1: Our Mission */}
            <div className="bg-white dark:bg-[#11192e] border-2 border-amber-500/20 dark:border-amber-500/30 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-slate-950/5 dark:shadow-black/40 flex flex-col justify-between hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:border-amber-500 transition-all shadow-xs">
                    <Target className="h-7 w-7 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 bg-amber-500/15 text-amber-800 dark:text-amber-300 rounded-full border border-amber-500/30 font-outfit">
                    Mission Pillars
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 font-outfit">
                  {pageT.cardMissionTitle || "Our Mission"}
                </h3>

                <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-normal mb-6">
                  {pageT.cardMissionDesc || "We are dedicated to supporting vulnerable rural communities through holistic care, social protection, and rehabilitation—uplifting lives economically, socially, and health-wise."}
                </p>

                {/* Structured Strategic Objectives Sub-Cards */}
                <div className="space-y-3 mb-6">
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-500/20 flex items-start gap-3 transition-colors hover:border-amber-300">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                      <HeartHandshake className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-outfit">
                        Sustainable Community Care
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-normal mt-0.5">
                        Conceptualizing and executing targeted relief and rehabilitation initiatives to bring lasting stability.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-500/20 flex items-start gap-3 transition-colors hover:border-amber-300">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-outfit">
                        Skills &amp; Economic Growth
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-normal mt-0.5">
                        Promoting practical vocational skills, literacy, and career development for rural youth and women.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-500/20 flex items-start gap-3 transition-colors hover:border-amber-300">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-outfit">
                        Eradicating Social Stigma
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-normal mt-0.5">
                        Delivering comprehensive care, medical aid, and advocacy to remove discrimination and restore dignity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action List Tags */}
              <div className="pt-4 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span>Rural Care</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span>Economic Skills</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span>Social Dignity</span>
                </div>
              </div>
            </div>

            {/* Card 2: Our Vision */}
            <div className="bg-white dark:bg-[#11192e] border-2 border-indigo-500/20 dark:border-indigo-500/30 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-slate-950/5 dark:shadow-black/40 flex flex-col justify-between hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-500/10 border-2 border-indigo-500/30 rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:border-indigo-500 transition-all shadow-xs">
                    <Eye className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 rounded-full border border-indigo-500/30 font-outfit">
                    Strategic Vision
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 font-outfit">
                  {pageT.cardVisionTitle || "Our Vision"}
                </h3>

                <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-normal mb-6">
                  {pageT.cardVisionDesc || "Education is a fundamental human right. We are committed to ensuring every child has access to quality education, spiritual mentorship, and academic resources to break generational poverty."}
                </p>

                {/* Structured Strategic Objectives Sub-Cards */}
                <div className="space-y-3 mb-6">
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-500/20 flex items-start gap-3 transition-colors hover:border-indigo-300">
                    <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shrink-0 mt-0.5">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-outfit">
                        Universal Education Access
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-normal mt-0.5">
                        Breaking down systemic and financial barriers so every rural child receives quality primary and secondary schooling.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-500/20 flex items-start gap-3 transition-colors hover:border-indigo-300">
                    <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shrink-0 mt-0.5">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-outfit">
                        Bridging Opportunity Gaps
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-normal mt-0.5">
                        Providing scholarships, textbooks, uniforms, and learning kits to talented learners from impoverished backgrounds.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-500/20 flex items-start gap-3 transition-colors hover:border-indigo-300">
                    <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shrink-0 mt-0.5">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-outfit">
                        Next-Gen Mentorship
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-normal mt-0.5">
                        Nurturing leadership, moral grounding, and academic excellence to cultivate resilient, visionary young leaders.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action List Tags */}
              <div className="pt-4 border-t border-indigo-500/20 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span>Quality Schooling</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span>Scholarships</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span>Mentorship</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-100/90 dark:bg-amber-500/20 rounded-full text-xs font-black uppercase tracking-widest border border-amber-300/80 dark:border-amber-400/40 text-amber-900 dark:text-amber-300 shadow-2xs font-outfit">
                <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Transformative Educational Initiative</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight font-outfit">
                {pageT.educationVisionTitle || "Education as a Fundamental Right"}
              </h2>

              <p className="text-base sm:text-lg text-slate-700 dark:text-purple-100/90 leading-relaxed font-normal">
                {pageT.educationVisionDesc || "At KINGDOM OF CHRIST MINISTRIES, we envision a world where education is a fundamental right for all. Since our inception in 2012, we have been dedicated to breaking down barriers to education, especially for marginalized and disadvantaged communities. Through our school-building initiatives, scholarship programs, and teacher training, we are working towards creating a brighter future for children and youth, empowering them with the knowledge and skills they need to succeed."}
              </p>

              {/* 3 High-Context Educational Feature Micro-Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="bg-white dark:bg-[#11192e] p-4 rounded-2xl border border-slate-200/90 dark:border-purple-500/20 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-500/30">
                      <Building className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-outfit leading-tight">
                      School-Building Initiatives
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Constructing classrooms and clean sanitation facilities in remote villages.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#11192e] p-4 rounded-2xl border border-slate-200/90 dark:border-purple-500/20 shadow-sm hover:border-amber-400 dark:hover:border-amber-500/40 transition-all space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-500/30">
                      <Award className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-outfit leading-tight">
                      Scholarship Programs
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Funding full tuition, textbooks, uniforms, and study grants for students.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#11192e] p-4 rounded-2xl border border-slate-200/90 dark:border-purple-500/20 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/80 dark:border-indigo-500/30">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-outfit leading-tight">
                      Teacher &amp; Skills Training
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Equipping educators with modern pedagogy and youth with vocational trades.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: High-Grade Editorial Callout Plaque */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="bg-white dark:bg-[#11192e] border border-slate-200/90 dark:border-purple-500/30 p-7 sm:p-8 rounded-3xl text-center space-y-4 max-w-sm shadow-xl shadow-purple-900/5 dark:shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-600" />
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-purple-600/30 text-white font-black group-hover:scale-105 transition-transform">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-outfit">
                  Empowering Future Generations
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-purple-100/90 font-normal leading-relaxed">
                  Equipping children, youth, women, and tribal communities with world-class learning and technical career skills.
                </p>
                <div className="pt-2">
                  <Link
                    href="/ngo/donations"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-purple-600/25 active:scale-[0.98] cursor-pointer"
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
      <section className="py-20 sm:py-28 bg-slate-50 dark:bg-[#0c1324] border-b border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-600 text-white rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-sm font-outfit">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{pageT.pillarsTitle || "Core Pillars of Impact"}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 font-outfit">
              Comprehensive Community Transformation
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium">
              {pageT.pillarsSubtitle || "Holistic ministry advancing spiritual, educational, medical, and social transformation"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {impactPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#11192e] rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-950/5 dark:shadow-black/30 border border-slate-200/90 dark:border-slate-800 hover:-translate-y-1 hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${pillar.accent}`} />
                  
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 ${pillar.bg} ${pillar.border} border rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs`}>
                        <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${pillar.color}`} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${pillar.badgeStyle} font-outfit`}>
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2.5 leading-snug font-outfit">
                      {pillar.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                      {pillar.desc}
                    </p>
                  </div>

                  {/* Micro-Tags for high context */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                    {pillar.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 🗺️ MILESTONE JOURNEY TIMELINE */}
      <section className="py-20 sm:py-28 bg-white dark:bg-[#090e1f] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-600 text-white rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-sm font-outfit">
              <Clock className="h-3.5 w-3.5 text-amber-300" />
              <span>{language === "te" ? "కాలక్రమానుసార మైలురాళ్ళు" : language === "hi" ? "कालानुक्रमिक मील के पत्थर" : "Chronological Milestones"}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 font-outfit">
              {pageT.journey || "Our Milestones of Faith & Action"}
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 mx-auto rounded-full mb-4" />
            
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium">
              {language === "te" ? "2012లో ప్రారంభమైన చిన్న ప్రార్థనల నుండి నేడు వేలాది మంది జీవితాలను రూపాంతరం చేసే గొప్ప సంస్థగా ఎదిగిన మా విశ్వాస ప్రయాణం." : language === "hi" ? "2012 में साधारण प्रार्थना सभाओं से शुरू होकर आज हजारों जीवन बदलने वाले संस्थान के रूप में विकसित हमारी विश्वास यात्रा।" : "Tracing our 12+ year journey from humble prayer gatherings in 2012 to a comprehensive multi-faceted ministry transforming thousands of lives."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {journeySteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="relative group bg-slate-50 dark:bg-[#11192e] rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-950/5 dark:shadow-black/30 border border-slate-200/90 dark:border-slate-800 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.accent}`} />
                  
                  <div>
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 ${item.bg} border ${item.border} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs`}>
                          <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${item.color}`} />
                        </div>
                        <span className="text-xs font-mono font-black text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md bg-purple-100/80 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-500/20">
                          PHASE {item.step}
                        </span>
                      </div>
                      
                      <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${item.badgeStyle} font-outfit shadow-2xs`}>
                        {item.year}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2.5 font-outfit">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  {/* Concrete institutional accomplishment chip (Zero Truncation, Natural Multi-line Wrapping) */}
                  <div className="pt-3.5 mt-5 border-t border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span className="min-w-0 flex-1 break-words">{item.milestoneTag}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 🌟 TODAY & IMPACT HIGHLIGHT */}
      <section className="py-20 sm:py-28 bg-slate-100/70 dark:bg-[#0c1324] border-t border-slate-200/60 dark:border-slate-800/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 dark:bg-[#11192e] border border-slate-200/90 dark:border-purple-500/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-600" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-100 dark:bg-purple-950/70 border border-purple-200/90 dark:border-purple-500/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-2xs font-outfit">
                <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-amber-300" />
                <span>{language === "te" ? "ప్రస్తుత సేవ & భవిష్యత్ కార్యాచరణ" : language === "hi" ? "वर्तमान सेवा और निरंतर मिशन" : "Present Action & Continuing Mission"}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight font-outfit">
                {pageT.today || "Today & Our Continuing Mission"}
              </h2>

              <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-sm sm:text-base md:text-lg mb-6 font-medium">
                {pageT.todayP1 || "Today, The Kingdom of Christ Ministries stands as a beacon of hope, spiritual growth, and social transformation—advancing holistic community development across Telangana and beyond."}
              </p>

              {/* Dedicated Institutional Manifesto Plaque — Balanced Editorial Geometry */}
              <div className="my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white shadow-xl shadow-purple-900/25 relative overflow-hidden border border-purple-400/30 group">
                {/* Ambient Decorative Watermark Quote (Fills empty right side with editorial depth) */}
                <div className="absolute -bottom-4 -right-2 text-white/[0.08] pointer-events-none select-none">
                  <Quote className="h-28 w-28 sm:h-32 sm:w-32 rotate-12" />
                </div>

                {/* Integrated Verified Header Badge */}
                <div className="flex items-center justify-between mb-3.5 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider text-purple-100 border border-white/20 shadow-2xs font-outfit">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                    <span>{language === "te" ? "మా శాశ్వత సంకల్పం" : language === "hi" ? "हमारा स्थाई संकल्प" : "Our Enduring Commitment"}</span>
                  </div>
                </div>

                {/* Manifesto Quote Body with Fluid Balanced Typography */}
                <blockquote className="relative z-10 text-lg sm:text-xl md:text-2xl font-black text-white font-outfit leading-snug tracking-tight text-balance max-w-2xl">
                  &ldquo;{pageT.todayMissionQuote || "Empowering Lives Through Christ, Compassion & Education"}&rdquo;
                </blockquote>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base mb-8 font-normal">
                {pageT.todayP2 || "Every week, thousands of families are touched through our active church fellowships, 24/7 prayer counseling, educational institutes, free medical relief camps, and orphan sanctuary initiatives."}
              </p>

              {/* High-Craft Interactive Outreach Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 border-t border-slate-200/80 dark:border-purple-800/40">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-purple-500/20 shadow-xs flex items-center gap-3 hover:border-emerald-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-500/30 shadow-2xs">
                    <Church className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-outfit leading-tight">
                      24/7 Prayer &amp; Counseling
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Spiritual care &amp; fellowship</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-purple-500/20 shadow-xs flex items-center gap-3 hover:border-indigo-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/80 dark:border-indigo-500/30 shadow-2xs">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-outfit leading-tight">
                      Health &amp; Study Camps
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Free clinics &amp; learning kits</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-purple-500/20 shadow-xs flex items-center gap-3 hover:border-purple-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/80 dark:border-purple-500/30 shadow-2xs">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-outfit leading-tight">
                      Orphan Sheltering &amp; Food
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Nutritious meals &amp; shelter</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 CALL TO ACTION SECTION */}
      <section className="py-20 sm:py-28 bg-[#090e1f] relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-sm font-outfit">
              <Heart className="h-3.5 w-3.5 text-pink-400" />
              <span>Be A Part of the Transformation</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-5 tracking-tight font-outfit animate-fade-in-up">
              {pageT.join || "Join Our Story & Mission"}
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-8 max-w-2xl mx-auto animate-fade-in-up animate-delay-100 font-normal leading-relaxed">
              {pageT.joinSubtitle || "Partner with Sri. Kurra Kristhu Raju and Kingdom of Christ Ministries to transform lives and empower communities."}
            </p>

            {/* Strategic Action Hierarchy: Primary Brand Gradient on Top, Secondary Glassmorphism Below */}
            <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto animate-scale-in animate-delay-200">
              <Link
                href="/ngo/donations"
                className="px-7 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-purple-600/40 transition-all duration-300 hover:scale-[1.02] shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer border border-purple-400/30"
              >
                <ShieldCheck className="h-5 w-5 text-amber-300" />
                <span className="font-outfit text-sm sm:text-base">Donate (80G Tax-Exempt)</span>
              </Link>

              <Link
                href="/membership"
                className="px-7 py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2.5 shadow-sm active:scale-95 cursor-pointer border border-white/20 backdrop-blur-md"
              >
                <span className="font-outfit text-sm sm:text-base">{pageT.becomeMember || "Join Our Community"}</span>
                <ArrowRight className="h-5 w-5 text-purple-300" />
              </Link>
            </div>

            {/* Trust & Statutory Verification Strip */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-300 font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>80G Tax Deductible (50%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Govt. Verified Society (206/2012)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>100% Direct Welfare Impact</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 📄 FULL-SCREEN LIGHTBOX & STATUTORY DOCUMENT INSPECTION MODAL */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 z-[10005] flex items-center justify-center sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overscroll-none"
          onClick={() => setSelectedDocIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="statutory-doc-title"
        >
          <div 
            className="bg-white dark:bg-[#11192e] sm:border sm:border-slate-200/90 dark:sm:border-slate-800 w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header Bar — Pinned, Sticky & Zero Layout Shift */}
            <div className="shrink-0 z-20 bg-white/98 dark:bg-[#11192e]/98 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 p-3.5 sm:p-5">
              {/* Row 1: Document Icon + Title & Badge + Touch-Friendly Close Button */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 ${selectedDoc.bg} rounded-xl sm:rounded-2xl flex items-center justify-center border border-slate-200/60 dark:border-slate-800 shadow-xs`}>
                    {(() => {
                      const Icon = selectedDoc.icon;
                      return <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${selectedDoc.color}`} />;
                    })()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                        DOC #{selectedDoc.num.padStart(2, "0")}
                      </span>
                      <h3 id="statutory-doc-title" className="text-sm sm:text-lg md:text-xl font-black text-slate-900 dark:text-white leading-snug font-outfit">
                        {selectedDoc.title}
                      </h3>
                    </div>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                      {selectedDoc.subtitle}
                    </p>
                  </div>
                </div>

                {/* Prominent Accessible Close Button (Never scrolls out of view) */}
                <button
                  type="button"
                  onClick={() => setSelectedDocIndex(null)}
                  className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all flex items-center justify-center active:scale-95 shadow-xs cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Row 2: Status Badge + Prev/Next Sequential Controls */}
              <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${selectedDoc.badgeColor}`}>
                  {selectedDoc.badge}
                </span>
                
                <div className="flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                  <button
                    disabled={selectedDocIndex === 0}
                    onClick={() => setSelectedDocIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
                    className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title="Previous Document"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="hidden min-[400px]:inline">Prev</span>
                  </button>
                  <span className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-mono font-bold px-1.5">
                    {(selectedDocIndex ?? 0) + 1}/{officialDocuments.length}
                  </span>
                  <button
                    disabled={selectedDocIndex === officialDocuments.length - 1}
                    onClick={() => setSelectedDocIndex(prev => (prev !== null && prev < officialDocuments.length - 1 ? prev + 1 : prev))}
                    className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title="Next Document"
                  >
                    <span className="hidden min-[400px]:inline">Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Mobile View Switcher Segmented Control (Only on mobile: sm:hidden) */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mt-2.5 sm:hidden border border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalTab("certificate")}
                  className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    modalTab === "certificate"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  <span>Certificate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab("details")}
                  className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    modalTab === "details"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  <span>Statutory Ledger</span>
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable, Single Unified Container with Subtle Scrollbar */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 custom-thin-scrollbar overscroll-contain">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                
                {/* Left Column: Full Document Image Viewer */}
                <div className={`lg:col-span-6 bg-slate-100/90 dark:bg-slate-950/90 rounded-2xl p-2.5 sm:p-4 border border-slate-200 dark:border-slate-800 flex flex-col items-center ${modalTab === "details" ? "hidden sm:flex" : "flex"}`}>
                  <div className="relative w-full aspect-[3/4] sm:h-[440px] lg:h-[520px] rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-center">
                    <Image
                      src={selectedDoc.image}
                      alt={selectedDoc.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="object-contain p-2"
                      priority
                    />
                  </div>
                  {/* Caption row */}
                  <div className="mt-2.5 flex items-center justify-between w-full px-1 gap-2 flex-wrap">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
                      Official Certificate Document
                    </span>
                    <a
                      href={selectedDoc.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>Open High Resolution Image</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Right Column: Structured Statutory Credentials Table */}
                <div className={`lg:col-span-6 space-y-2.5 ${modalTab === "certificate" ? "hidden sm:block" : "block"}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 font-outfit">
                      Verified Statutory Credentials
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Govt. Verified</span>
                    </span>
                  </div>

                  {/* Flow naturally on mobile; scrollable on large desktop screens to match image height */}
                  <div className="space-y-2 lg:max-h-[520px] lg:overflow-y-auto lg:pr-1 custom-thin-scrollbar">
                    {selectedDoc.details.map((item: any, i: number) => {
                      const isCopied = copiedKey === `${selectedDoc.id}-${i}`;
                      return (
                        <div 
                          key={i}
                          className="flex flex-col sm:flex-row sm:items-start justify-between p-3 rounded-xl bg-slate-50/90 dark:bg-[#0c1324] border border-slate-200/80 dark:border-slate-800/80 gap-1.5 sm:gap-3 hover:border-purple-300 dark:hover:border-purple-500/30 transition-colors"
                        >
                          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 sm:max-w-[42%]">
                            {item.label}
                          </span>
                          
                          <div className="flex items-center gap-2 sm:justify-end min-w-0 flex-1">
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white sm:text-right font-mono break-words min-w-0 flex-1">
                              {item.value}
                            </span>
                            {item.copyable && (
                              <button
                                type="button"
                                onClick={() => handleCopy(item.value, `${selectedDoc.id}-${i}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors shrink-0 active:scale-95 cursor-pointer"
                                title="Copy to Clipboard"
                                aria-label={`Copy ${item.label}`}
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
            </div>

            {/* Modal Footer Bar — Pinned & Accessible */}
            <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/95 dark:bg-[#0c1324]/95 backdrop-blur-md shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <a
                href={selectedDoc.image}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98]"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Full Resolution Image</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedDocIndex(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer"
              >
                {pageT.closeModal || "Close Details"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}