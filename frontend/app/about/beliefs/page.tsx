"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Shield, 
  Heart, 
  Church, 
  Sparkles, 
  ArrowRight, 
  Search, 
  X, 
  Flame, 
  ShieldCheck, 
  Globe, 
  Users, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileText,
  ChevronRight,
  Crown,
  Home,
  Layers,
  Printer,
  Download,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function BeliefsPage() {
  const { language, t } = useLanguage();
  const pageT = (t as any)?.pages?.beliefs || {};

  // Interactive filter & search states — preserved across language and theme toggles
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedVerse, setCopiedVerse] = useState<string | null>(null);

  // Modal doctrine selection — storing ID preserves language state seamlessly
  const [selectedDoctrineId, setSelectedDoctrineId] = useState<string | null>(null);

  const filterContainerRef = useRef<HTMLDivElement>(null);

  // Prevent background scroll and support Escape key when modal is open
  useEffect(() => {
    if (selectedDoctrineId !== null) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedDoctrineId(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedDoctrineId]);

  // Executive Tone-on-Tone Stats Bar
  const stats = [
    { 
      value: "8", 
      label: pageT.statPillars || (language === "te" ? "ముఖ్య బోధనలు" : language === "hi" ? "मूल सिद्धांत" : "Core Doctrines"), 
      icon: BookOpen, 
      iconColor: "text-purple-600 dark:text-purple-400", 
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-200/50 dark:border-purple-700/50" 
    },
    { 
      value: "100%", 
      label: pageT.statScripture || (language === "te" ? "లేఖన ప్రామాణికత" : language === "hi" ? "बाइबिल का अधिकार" : "Biblical Authority"), 
      icon: ShieldCheck, 
      iconColor: "text-indigo-600 dark:text-indigo-400", 
      iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-200/50 dark:border-indigo-700/50" 
    },
    { 
      value: "3+", 
      label: pageT.statCampuses || (language === "te" ? "పరిచర్య శాఖలు" : language === "hi" ? "सक्रिय शाखाएं" : "Active Campuses"), 
      icon: Church, 
      iconColor: "text-rose-600 dark:text-rose-400", 
      iconBg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-200/50 dark:border-rose-700/50" 
    },
    { 
      value: "24/7", 
      label: pageT.statGospel || (language === "te" ? "సువార్త ప్రభావం" : language === "hi" ? "सुसमाचार प्रभाव" : "Gospel Reach"), 
      icon: Flame, 
      iconColor: "text-amber-600 dark:text-amber-400", 
      iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-200/50 dark:border-amber-700/50" 
    },
  ];

  // 8 Core Biblical Doctrines with harmonious tone-on-tone palettes
  const doctrines = useMemo(() => [
    {
      id: "d1",
      title: pageT.d1Title || "The Holy Scriptures (Bible)",
      category: "god",
      desc: pageT.d1Desc || "We believe the Bible is the inspired, infallible, and authoritative Word of God, our supreme standard for all Christian faith and living.",
      verse: pageT.d1Verse || "2 Timothy 3:16",
      quote: pageT.d1Quote || "All Scripture is God-breathed and useful for teaching, rebuking, correcting and training in righteousness.",
      passages: pageT.d1Passages || ["2 Timothy 3:16-17", "2 Peter 1:20-21", "Psalm 119:105", "Hebrews 4:12"],
      deep: pageT.d1Deep || "The Holy Bible is God's written revelation to mankind. It provides divine direction, spiritual nourishment, and absolute truth for every generation.",
      icon: BookOpen,
      accent: "from-purple-500 to-indigo-500",
      badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60",
      iconColor: "text-purple-600 dark:text-purple-400",
      quoteBorder: "border-purple-500",
      quoteBg: "bg-purple-50/60 dark:bg-purple-950/20",
      quoteText: "text-purple-950 dark:text-purple-200",
      btnHover: "hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white",
      themeColor: "text-purple-600 dark:text-purple-400",
      checkColor: "text-purple-600 dark:text-purple-400"
    },
    {
      id: "d2",
      title: pageT.d2Title || "The Holy Trinity",
      category: "god",
      desc: pageT.d2Desc || "We believe in one God, eternally existing in three co-equal persons: Father, Son, and Holy Spirit.",
      verse: pageT.d2Verse || "Matthew 28:19",
      quote: pageT.d2Quote || "Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.",
      passages: pageT.d2Passages || ["Matthew 28:19", "2 Corinthians 13:14", "Genesis 1:26", "John 1:1-3"],
      deep: pageT.d2Deep || "God is one in essence yet distinct in three divine persons. Father is the Creator; Son is the Redeemer; Holy Spirit is the Sanctifier.",
      icon: Shield,
      accent: "from-indigo-500 to-cyan-500",
      badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      quoteBorder: "border-indigo-500",
      quoteBg: "bg-indigo-50/60 dark:bg-indigo-950/20",
      quoteText: "text-indigo-950 dark:text-indigo-200",
      btnHover: "hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white",
      themeColor: "text-indigo-600 dark:text-indigo-400",
      checkColor: "text-indigo-600 dark:text-indigo-400"
    },
    {
      id: "d3",
      title: pageT.d3Title || "Jesus Christ the Lord",
      category: "god",
      desc: pageT.d3Desc || "We believe Jesus Christ is fully God and fully man, born of a virgin, died on the cross for our sins, and bodily resurrected.",
      verse: pageT.d3Verse || "John 14:6",
      quote: pageT.d3Quote || "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'",
      passages: pageT.d3Passages || ["John 14:6", "1 Timothy 2:5", "Philippians 2:5-11", "1 Corinthians 15:3-4"],
      deep: pageT.d3Deep || "Jesus Christ is the eternal Son of God who humbled Himself to ransom humanity from sin through His sacrificial death and triumphant resurrection.",
      icon: Crown,
      accent: "from-amber-500 to-orange-500",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60",
      iconColor: "text-amber-600 dark:text-amber-400",
      quoteBorder: "border-amber-500",
      quoteBg: "bg-amber-50/60 dark:bg-amber-950/20",
      quoteText: "text-amber-950 dark:text-amber-200",
      btnHover: "hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white",
      themeColor: "text-amber-600 dark:text-amber-400",
      checkColor: "text-amber-600 dark:text-amber-400"
    },
    {
      id: "d4",
      title: pageT.d4Title || "Salvation by Grace",
      category: "salvation",
      desc: pageT.d4Desc || "We believe salvation is a free gift of God's grace, received solely through personal faith in Jesus Christ.",
      verse: pageT.d4Verse || "Ephesians 2:8-9",
      quote: pageT.d4Quote || "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God.",
      passages: pageT.d4Passages || ["Ephesians 2:8-9", "Romans 10:9-10", "John 3:16", "Titus 3:5"],
      deep: pageT.d4Deep || "Salvation brings forgiveness, spiritual rebirth, justification, and eternal life for anyone who repents and puts trust in Jesus Christ.",
      icon: Heart,
      accent: "from-pink-500 to-rose-500",
      badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60",
      iconColor: "text-rose-600 dark:text-rose-400",
      quoteBorder: "border-rose-500",
      quoteBg: "bg-rose-50/60 dark:bg-rose-950/20",
      quoteText: "text-rose-950 dark:text-rose-200",
      btnHover: "hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white",
      themeColor: "text-rose-600 dark:text-rose-400",
      checkColor: "text-rose-600 dark:text-rose-400"
    },
    {
      id: "d5",
      title: pageT.d5Title || "The Holy Spirit & Miracles",
      category: "salvation",
      desc: pageT.d5Desc || "We believe in the present ministry of the Holy Spirit, who indwells, empowers, gifts, and equips believers.",
      verse: pageT.d5Verse || "Acts 1:8",
      quote: pageT.d5Quote || "You will receive power when the Holy Spirit comes on you; and you will be my witnesses to the ends of the earth.",
      passages: pageT.d5Passages || ["Acts 1:8", "Galatians 5:22-23", "1 Corinthians 12:4-11", "Romans 8:14-16"],
      deep: pageT.d5Deep || "The Holy Spirit convicts the world of sin, regenerates believers, and imparts spiritual gifts for edifying the Church and operating in divine signs and wonders.",
      icon: Flame,
      accent: "from-red-500 to-amber-500",
      badgeClass: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
      iconBg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-800/60",
      iconColor: "text-red-600 dark:text-red-400",
      quoteBorder: "border-red-500",
      quoteBg: "bg-red-50/60 dark:bg-red-950/20",
      quoteText: "text-red-950 dark:text-red-200",
      btnHover: "hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white",
      themeColor: "text-red-600 dark:text-red-400",
      checkColor: "text-red-600 dark:text-red-400"
    },
    {
      id: "d6",
      title: pageT.d6Title || "The Body of Christ & Church",
      category: "salvation",
      desc: pageT.d6Desc || "We believe the Church is the universal body of Christ, called to gather locally for worship, fellowship, and outreach.",
      verse: pageT.d6Verse || "Matthew 16:18",
      quote: pageT.d6Quote || "And I tell you that you are Peter, and on this rock I will build my church, and the gates of Hades will not overcome it.",
      passages: pageT.d6Passages || ["Matthew 16:18", "Acts 2:42-47", "Hebrews 10:24-25", "1 Corinthians 12:12-27"],
      deep: pageT.d6Deep || "The local church is a lighthouse of prayer, healing, and fellowship. Through baptism and Holy Communion, we celebrate Christ's victory.",
      icon: Church,
      accent: "from-emerald-500 to-teal-500",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      quoteBorder: "border-emerald-500",
      quoteBg: "bg-emerald-50/60 dark:bg-emerald-950/20",
      quoteText: "text-emerald-950 dark:text-emerald-200",
      btnHover: "hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white",
      themeColor: "text-emerald-600 dark:text-emerald-400",
      checkColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      id: "d7",
      title: pageT.d7Title || "Prayer & Faith-Filled Living",
      category: "life",
      desc: pageT.d7Desc || "We believe in the power of fervent prayer and a holy, obedient lifestyle that reflects Christ's character daily.",
      verse: pageT.d7Verse || "James 5:16",
      quote: pageT.d7Quote || "The prayer of a righteous person is powerful and effective.",
      passages: pageT.d7Passages || ["James 5:16", "1 Thessalonians 5:16-18", "Philippians 4:6-7", "Colossians 3:12-17"],
      deep: pageT.d7Deep || "Prayer connects humanity with heaven. Through regular devotion, fasting, and intercession, God performs breakthroughs, healing, and revival.",
      icon: Sparkles,
      accent: "from-purple-500 to-pink-500",
      badgeClass: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800",
      iconBg: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200/60 dark:border-fuchsia-800/60",
      iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
      quoteBorder: "border-fuchsia-500",
      quoteBg: "bg-fuchsia-50/60 dark:bg-fuchsia-950/20",
      quoteText: "text-fuchsia-950 dark:text-fuchsia-200",
      btnHover: "hover:bg-fuchsia-600 hover:text-white dark:hover:bg-fuchsia-600 dark:hover:text-white",
      themeColor: "text-fuchsia-600 dark:text-fuchsia-400",
      checkColor: "text-fuchsia-600 dark:text-fuchsia-400"
    },
    {
      id: "d8",
      title: pageT.d8Title || "The Second Coming & Eternity",
      category: "life",
      desc: pageT.d8Desc || "We believe in the glorious, visible return of Jesus Christ, the resurrection of the dead, and eternal life with God.",
      verse: pageT.d8Verse || "Revelation 22:20",
      quote: pageT.d8Quote || "He who testifies to these things says, 'Yes, I am coming soon.' Amen. Come, Lord Jesus.",
      passages: pageT.d8Passages || ["Revelation 22:20", "1 Thessalonians 4:16-17", "John 14:1-3", "2 Corinthians 5:1"],
      deep: pageT.d8Deep || "Our eternal hope is anchored in Christ's triumphant return. We eagerly anticipate the New Heaven and New Earth where righteousness dwells.",
      icon: Globe,
      accent: "from-blue-500 to-indigo-600",
      badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-800/60",
      iconColor: "text-sky-600 dark:text-sky-400",
      quoteBorder: "border-sky-500",
      quoteBg: "bg-sky-50/60 dark:bg-sky-950/20",
      quoteText: "text-sky-950 dark:text-sky-200",
      btnHover: "hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 dark:hover:text-white",
      themeColor: "text-sky-600 dark:text-sky-400",
      checkColor: "text-sky-600 dark:text-sky-400"
    }
  ], [pageT]);

  // Category counts for tab badges
  const categoryCounts = useMemo(() => {
    return {
      all: doctrines.length,
      god: doctrines.filter((d) => d.category === "god").length,
      salvation: doctrines.filter((d) => d.category === "salvation").length,
      life: doctrines.filter((d) => d.category === "life").length,
    };
  }, [doctrines]);

  // Derived selected doctrine — automatically updates when language changes
  const selectedDoctrine = useMemo(() => {
    if (!selectedDoctrineId) return null;
    return doctrines.find((d) => d.id === selectedDoctrineId) || null;
  }, [doctrines, selectedDoctrineId]);

  // Filtered doctrines calculation with combined category and text matching
  const filteredDoctrines = useMemo(() => {
    return doctrines.filter((doc) => {
      const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        doc.title.toLowerCase().includes(query) ||
        doc.desc.toLowerCase().includes(query) ||
        doc.verse.toLowerCase().includes(query) ||
        doc.quote.toLowerCase().includes(query) ||
        doc.deep.toLowerCase().includes(query) ||
        doc.passages.some((p: string) => p.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [doctrines, selectedCategory, searchQuery]);

  // Core Values Data with tone-on-tone badges and harmonized palettes
  const values = useMemo(() => [
    { 
      name: pageT.v1Name || "Faith", 
      desc: pageT.v1Desc || "Trusting God unconditionally in all circumstances and stepping out in bold obedience.", 
      verse: pageT.v1Verse || "Hebrews 11:1", 
      icon: ShieldCheck, 
      color: "text-purple-600 dark:text-purple-400", 
      bg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-200/60 dark:border-purple-800/60",
      badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/70",
      accent: "from-purple-500 to-indigo-500",
      hoverBorder: "hover:border-purple-400/50 dark:hover:border-purple-600/50"
    },
    { 
      name: pageT.v2Name || "Love", 
      desc: pageT.v2Desc || "Demonstrating the sacrificial, unconditional love of Christ to every individual.", 
      verse: pageT.v2Verse || "1 Corinthians 13:13", 
      icon: Heart, 
      color: "text-rose-600 dark:text-rose-400", 
      bg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-200/60 dark:border-rose-800/60",
      badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/70",
      accent: "from-pink-500 to-rose-500",
      hoverBorder: "hover:border-rose-400/50 dark:hover:border-rose-600/50"
    },
    { 
      name: pageT.v3Name || "Prayer", 
      desc: pageT.v3Desc || "Seeking God's presence continually through personal and corporate intercession.", 
      verse: pageT.v3Verse || "1 Thess 5:17", 
      icon: Flame, 
      color: "text-amber-600 dark:text-amber-400", 
      bg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-200/60 dark:border-amber-800/60",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/70",
      accent: "from-amber-500 to-orange-500",
      hoverBorder: "hover:border-amber-400/50 dark:hover:border-amber-600/50"
    },
    { 
      name: pageT.v4Name || "Scripture", 
      desc: pageT.v4Desc || "Living, teaching, and anchoring every decision in the uncompromised Word of God.", 
      verse: pageT.v4Verse || "Psalm 119:105", 
      icon: BookOpen, 
      color: "text-indigo-600 dark:text-indigo-400", 
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-200/60 dark:border-indigo-800/60",
      badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/70",
      accent: "from-indigo-500 to-cyan-500",
      hoverBorder: "hover:border-indigo-400/50 dark:hover:border-indigo-600/50"
    },
    { 
      name: pageT.v5Name || "Community", 
      desc: pageT.v5Desc || "Building a warm, inclusive spiritual family where everyone belongs and flourishes.", 
      verse: pageT.v5Verse || "Acts 2:42", 
      icon: Users, 
      color: "text-emerald-600 dark:text-emerald-400", 
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-200/60 dark:border-emerald-800/60",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/70",
      accent: "from-emerald-500 to-teal-500",
      hoverBorder: "hover:border-emerald-400/50 dark:hover:border-emerald-600/50"
    },
    { 
      name: pageT.v6Name || "Mission", 
      desc: pageT.v6Desc || "Reaching the lost, serving the needy, and making disciples locally and globally.", 
      verse: pageT.v6Verse || "Mark 16:15", 
      icon: Globe, 
      color: "text-sky-600 dark:text-sky-400", 
      bg: "bg-sky-500/10 dark:bg-sky-500/20 border-sky-200/60 dark:border-sky-800/60",
      badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-800/70",
      accent: "from-sky-500 to-blue-500",
      hoverBorder: "hover:border-sky-400/50 dark:hover:border-sky-600/50"
    },
  ], [pageT]);

  // Smooth mobile scroll for category filter tabs
  const handleCategorySelect = (categoryId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedCategory(categoryId);
    e.currentTarget.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  };

  // Copy full statement summary
  const handleCopyStatement = () => {
    const textToCopy = `${pageT.title || "Our Beliefs & Doctrines"}\n\n${doctrines.map((d, i) => `${i + 1}. ${d.title} (${d.verse}): ${d.desc}`).join("\n\n")}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Clean Print / Save PDF Trigger
  const handlePrintStatement = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* 🖨️ Document-Grade Print Stylesheet */}
      <style jsx global>{`
        @media print {
          /* Hide non-printable elements: navbar, footer, search, tabs, buttons, floating widgets */
          header, nav, footer, .no-print, [role="tablist"], [aria-label="Breadcrumb"], input, button, .modal-backdrop {
            display: none !important;
          }
          body, main, #main-content {
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            margin: 0 !important;
            padding: 0.25in !important;
          }
          .print-header-banner {
            display: block !important;
            margin-bottom: 2rem !important;
            padding-bottom: 1rem !important;
            border-bottom: 2px solid #7c3aed !important;
          }
          .doctrines-grid-print {
            display: block !important;
          }
          .doctrine-card-print {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 12px !important;
            padding: 1.25rem !important;
            margin-bottom: 1.25rem !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }
          .doctrine-card-print * {
            color: #0f172a !important;
          }
          .quote-box-print {
            border-left: 3px solid #7c3aed !important;
            background: #f8fafc !important;
            padding: 0.75rem 1rem !important;
            margin: 0.75rem 0 !important;
            font-style: italic !important;
          }
          .values-grid-print {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-top: 2rem !important;
          }
        }
      `}</style>

      {/* Printable Document Header (Rendered solely during @media print) */}
      <div className="hidden print-header-banner">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Kingdom of Christ Ministries
            </h1>
            <p className="text-sm font-bold text-purple-700">
              Official Statement of Faith &amp; Core Biblical Doctrines
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-medium">
            <p>Hyderabad, India • kcmchurch.org</p>
            <p>Senior Pastor: Bishop Kurra Kristhu Raju</p>
          </div>
        </div>
      </div>

      <Navbar />

      {/* 🌌 Hero Section — Seamless Ambient Gradient Flow */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 md:pt-44 md:pb-28 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300 no-print">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25 dark:opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* Inline Breadcrumb Navigation */}
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
                  {pageT.breadcrumbCurrent || "Beliefs & Doctrines"}
                </li>
              </ol>
            </nav>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-300/40 dark:border-purple-500/30 rounded-full text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-bold tracking-wide mb-5 backdrop-blur-md animate-fade-in-up">
              <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>{pageT.badge || "Statement of Faith"}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight animate-fade-in-up animate-delay-100">
              {pageT.title || "Our Beliefs & Doctrines"}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 animate-fade-in-up animate-delay-200 font-medium max-w-2xl mx-auto leading-relaxed">
              {pageT.subtitle || "Anchored in the Holy Scripture, Guided by God's Grace"}
            </p>
          </div>
        </div>
      </section>

      {/* 📊 Tone-on-Tone Floating Stats Bar */}
      <section className="relative z-20 -mt-10 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 no-print">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 ${stat.iconBg} border rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor}`} />
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

      {/* 📜 Core Doctrines Section with Cohesive Search & Smooth Touch Filter Tabs */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>{pageT.doctrinalPillarsBadge || "Doctrinal Pillars"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              {pageT.doctrinesTitle || "Core Biblical Doctrines"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg font-medium">
              {pageT.doctrinesSubtitle || "The timeless truths that govern our faith, worship, and daily ministry"}
            </p>
          </div>

          {/* Unified Search & Category Filter Toolbar */}
          <div className="max-w-3xl mx-auto mb-10 space-y-4 no-print">
            
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={pageT.searchPlaceholder || "Search doctrines, keywords, or scripture verses..."}
                className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* 📱 1. Smooth Mobile Horizontally Scrollable Filter Tabs (No Pills Clip Off-Screen) */}
            <div className="relative">
              <div 
                ref={filterContainerRef}
                role="tablist"
                aria-label="Filter doctrines by category"
                className="flex items-center gap-2 overflow-x-auto scroll-smooth overscroll-x-contain touch-pan-x snap-x snap-mandatory py-2 px-4 sm:px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:justify-center flex-nowrap"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {[
                  { id: "all", label: pageT.filterAll || "All Doctrines", count: categoryCounts.all },
                  { id: "god", label: pageT.filterGod || "God & Scripture", count: categoryCounts.god },
                  { id: "salvation", label: pageT.filterSalvation || "Salvation & Church", count: categoryCounts.salvation },
                  { id: "life", label: pageT.filterLife || "Christian Life & Hope", count: categoryCounts.life },
                ].map((tab) => {
                  const isSelected = selectedCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isSelected}
                      onClick={(e) => handleCategorySelect(tab.id, e)}
                      className={`snap-start shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                        isSelected
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-[1.02]"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 active:scale-95"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-semibold transition-colors ${
                        isSelected ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Filter / Search Count Feedback */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400 px-1 font-medium">
              <span>
                {language === "te" ? "కనిపిస్తున్నవి: " : language === "hi" ? "दिखाए जा रहे हैं: " : "Showing "}
                <strong className="text-slate-900 dark:text-white font-bold">{filteredDoctrines.length}</strong>
                {" "}{language === "te" ? `మొత్తం ${doctrines.length} లో` : language === "hi" ? `कुल ${doctrines.length} में से` : `of ${doctrines.length} doctrines`}
                {searchQuery && (
                  <span className="ml-1">
                    {language === "te" ? "కోసం " : language === "hi" ? "के लिए " : "for "}
                    &ldquo;<span className="text-purple-600 dark:text-purple-400 font-semibold">{searchQuery}</span>&rdquo;
                  </span>
                )}
              </span>
              {(searchQuery || selectedCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
                >
                  {pageT.resetFilter || "Reset all"}
                </button>
              )}
            </div>

          </div>

          {/* Doctrines Grid */}
          {filteredDoctrines.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl mx-auto p-6 shadow-sm no-print">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4 opacity-60" />
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                {pageT.noResultsTitle || "No doctrines found matching"} "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-4 px-5 py-2.5 bg-purple-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-purple-700 active:scale-95 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
              >
                {pageT.resetFilter || "Reset Search Filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 doctrines-grid-print">
              {filteredDoctrines.map((doctrine) => {
                const Icon = doctrine.icon;
                return (
                  <div
                    key={doctrine.id}
                    className="relative group bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/25 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden doctrine-card-print"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${doctrine.accent}`} />

                    <div>
                      {/* Top Bar: Tone-on-tone Icon & Harmonized Scripture Badge */}
                      <div className="flex items-center justify-between gap-3 mb-5">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 ${doctrine.iconBg} border rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs`}>
                          <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${doctrine.iconColor}`} />
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${doctrine.badgeClass} shadow-2xs`}>
                          <BookOpen className="h-3.5 w-3.5 shrink-0" />
                          <span>{doctrine.verse}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2.5 tracking-tight">
                        {doctrine.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-5 font-normal">
                        {doctrine.desc}
                      </p>

                      {/* Harmonized Key Quote Callout Box */}
                      <div className={`p-4 ${doctrine.quoteBg} rounded-2xl border-l-4 ${doctrine.quoteBorder} mb-6 transition-colors quote-box-print`}>
                        <p className={`text-xs sm:text-sm ${doctrine.quoteText} italic font-medium leading-relaxed`}>
                          "{doctrine.quote}"
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <button
                      onClick={() => setSelectedDoctrineId(doctrine.id)}
                      className={`w-full py-3 px-4 bg-slate-100 dark:bg-slate-800/80 ${doctrine.btnHover} text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 group/btn shadow-2xs active:scale-[0.99] cursor-pointer no-print`}
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
      <section className="py-16 sm:py-24 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80 values-grid-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/15 border border-amber-300/40 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>{pageT.livingGospelBadge || "Living the Gospel"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              {pageT.valuesTitle || "Our Kingdom Core Values"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg font-medium">
              {pageT.valuesSubtitle || "Guiding principles shaping our spiritual walk and community life"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className={`relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 ${val.hoverBorder} hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group overflow-hidden doctrine-card-print`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${val.accent}`} />
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className={`w-12 h-12 ${val.bg} border rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs`}>
                        <Icon className={`h-6 w-6 ${val.color}`} />
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${val.badgeClass} shadow-2xs`}>
                        {val.verse}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                      {val.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal pr-4 sm:pr-0">
                      {val.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🚀 3. Bottom CTA Hierarchy: Compact Resource Bar (Doesn't Compete with Dark Closing CTA) */}
      <section className="py-8 sm:py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 no-print">
        <div className="relative overflow-hidden bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg shadow-purple-900/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all">
          
          {/* Subtle Ambient Decorative Glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-2xl pointer-events-none" />

          {/* Left: Compact Resource Indicator */}
          <div className="relative z-10 flex items-start sm:items-center gap-3.5 sm:gap-4 text-left w-full md:w-auto">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/70 dark:border-purple-800/70 shadow-2xs">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="space-y-0.5">
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug tracking-tight">
                {pageT.studyFurtherTitle || "Want to Study Our Beliefs Further?"}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl">
                {pageT.downloadDesc || "Explore or print our complete, detailed statement of faith for personal or group Bible study."}
              </p>
            </div>
          </div>

          {/* Right: Compact Resource Action Controls (Responsive flex: full width stack on mobile, horizontal row on tablet/desktop) */}
          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-end shrink-0">
            <button
              onClick={handleCopyStatement}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              aria-label="Copy doctrinal statement summary to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>{pageT.copiedToast || "Copied!"}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 shrink-0" />
                  <span>{pageT.copyStatement || "Copy Summary Statement"}</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrintStatement}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-[0.98] text-slate-800 dark:text-slate-200 font-bold rounded-xl border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              aria-label="Print or save statement of faith as PDF"
            >
              <Printer className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>{pageT.printStatement || "Print / Save PDF"}</span>
            </button>
          </div>

        </div>
      </section>

      {/* 🚀 Primary Dark Closing Call to Action Section (Definitive Visual Climax) */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden text-white border-t border-slate-800/80 no-print">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 border border-purple-400/30 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>{pageT.ctaBadge || "Next Steps"}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              {pageT.ctaTitle || "Deepen Your Spiritual Journey"}
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 font-normal leading-relaxed max-w-2xl mx-auto">
              {pageT.ctaSubtitle || "Join us in worship, study the Word together, and experience the power of faith in action."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-center">
              <Link
                href="/membership"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-xl shadow-purple-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base text-center"
              >
                {pageT.ctaMembership || "Become a Member"}
              </Link>

              <Link
                href="/about/story"
                className="w-full sm:w-auto group px-8 py-3.5 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white border border-white/20 backdrop-blur-md rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base text-center"
              >
                <span>{pageT.ctaStory || "Our Story"}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-purple-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📖 2. Interactive Deep Dive & Notes Modal with Proper Error/Empty-State Handling */}
      {selectedDoctrineId && (
        <div 
          className="fixed inset-0 z-[10005] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in no-print"
          onClick={() => setSelectedDoctrineId(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="doctrinal-detail-title"
        >
          {selectedDoctrine ? (
            <div 
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90dvh] flex flex-col animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`p-5 sm:p-6 bg-gradient-to-r ${selectedDoctrine.accent} text-white relative shrink-0 z-10`}>
                <div className="pr-12">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{selectedDoctrine.verse}</span>
                  </div>
                  <h3 id="doctrinal-detail-title" className="text-xl sm:text-2xl md:text-3xl font-black leading-tight">
                    {selectedDoctrine.title}
                  </h3>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedDoctrineId(null)}
                  className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 bg-black/25 hover:bg-black/40 active:scale-95 rounded-xl text-white transition-all cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 md:p-8 overflow-y-auto space-y-5 sm:space-y-6 text-slate-700 dark:text-slate-300 overscroll-contain flex-1">
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${selectedDoctrine.themeColor} mb-2`}>
                    {pageT.modalSummary || "Doctrinal Overview"}
                  </h4>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed font-normal">
                    {selectedDoctrine.desc}
                  </p>
                </div>

                {selectedDoctrine.quote && (
                  <div className={`p-4 sm:p-5 ${selectedDoctrine.quoteBg} rounded-2xl border-l-4 ${selectedDoctrine.quoteBorder}`}>
                    <p className={`text-xs sm:text-sm md:text-base italic font-semibold ${selectedDoctrine.quoteText} leading-relaxed`}>
                      "{selectedDoctrine.quote}"
                    </p>
                  </div>
                )}

                {selectedDoctrine.deep && (
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${selectedDoctrine.themeColor} mb-2`}>
                      {pageT.pastoralExplanation || "Pastoral Explanation"}
                    </h4>
                    <p className="text-xs sm:text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
                      {selectedDoctrine.deep}
                    </p>
                  </div>
                )}

                {selectedDoctrine.passages && selectedDoctrine.passages.length > 0 ? (
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${selectedDoctrine.themeColor} mb-2.5`}>
                      {pageT.modalScripture || "Key Scripture Passages"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedDoctrine.passages.map((passage: string, i: number) => {
                        const isThisCopied = copiedVerse === passage;
                        return (
                          <div 
                            key={i} 
                            className="group flex items-center justify-between gap-2 p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <CheckCircle2 className={`h-4 w-4 ${selectedDoctrine.checkColor} flex-shrink-0`} />
                              <span className="truncate">{passage}</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(passage);
                                setCopiedVerse(passage);
                                setTimeout(() => setCopiedVerse(null), 2000);
                              }}
                              title="Copy scripture reference"
                              aria-label={`Copy reference ${passage}`}
                              className="p-1 rounded-md text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-slate-700 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                            >
                              {isThisCopied ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500">
                    No additional passages listed.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 shrink-0 flex justify-end">
                <button
                  onClick={() => setSelectedDoctrineId(null)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs sm:text-sm hover:opacity-90 active:scale-98 transition-all cursor-pointer"
                >
                  {pageT.modalClose || "Close"}
                </button>
              </div>
            </div>
          ) : (
            /* Graceful Empty / Error State Fallback */
            <div 
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Doctrinal Note Not Found
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-5">
                The requested doctrinal detail could not be retrieved. Please try selecting another doctrine.
              </p>
              <button
                onClick={() => setSelectedDoctrineId(null)}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all cursor-pointer"
              >
                {pageT.modalClose || "Close"}
              </button>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
