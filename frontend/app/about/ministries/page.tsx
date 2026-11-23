"use client";

import { useState, useMemo, useEffect, useTransition, useRef } from "react";
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
  ChevronRight,
  AlertCircle,
  Loader2,
  Send,
  Phone,
  Mail,
  Building,
  Check,
  Activity,
  Compass,
  HelpCircle
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function MinistriesPage() {
  const { language, t } = useLanguage();
  const pageT = (t as any)?.ministries || (t as any)?.pages?.ministries || {};

  // React 18 Concurrent Transitions for <100ms INP responsiveness
  const [isPending, startTransition] = useTransition();

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchInput, setSearchInput] = useState<string>("");
  const [deferredSearch, setDeferredSearch] = useState<string>("");
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Modal states: 'details' | 'join' | 'prayer' | null
  const [activeModal, setActiveModal] = useState<"details" | "join" | "prayer" | null>(null);
  const [selectedMinistryId, setSelectedMinistryId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Join Ministry Form State & Validation
  // -------------------------------------------------------------
  const [joinForm, setJoinForm] = useState({
    ministryId: "worship",
    fullName: "",
    email: "",
    phone: "",
    campus: "All KCM Campuses",
    notes: ""
  });
  const [joinErrors, setJoinErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [joinSubmitSuccess, setJoinSubmitSuccess] = useState(false);
  const [joinSubmitError, setJoinSubmitError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Prayer Request Form State & Validation
  // -------------------------------------------------------------
  const [prayerForm, setPrayerForm] = useState({
    name: "",
    email: "",
    category: "Health & Healing",
    request: "",
    isAnonymous: false,
    isUrgent: false
  });
  const [prayerErrors, setPrayerErrors] = useState<{ name?: string; email?: string; request?: string }>({});
  const [isSubmittingPrayer, setIsSubmittingPrayer] = useState(false);
  const [prayerSubmitSuccess, setPrayerSubmitSuccess] = useState(false);
  const [prayerSubmitError, setPrayerSubmitError] = useState<string | null>(null);

  // Prevent background scroll and support Escape key when any modal is open
  useEffect(() => {
    if (activeModal !== null) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          startTransition(() => {
            setActiveModal(null);
          });
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [activeModal]);

  // Executive Tone-on-Tone Stats Bar
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
      leader: pageT.worshipLeader || "Bishop Kurra Kristhu Raju (Worship Pastor & Media Director)",
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
      leader: pageT.youthLeader || "Bishop Kurra Kristhu Raju (Youth Pastor & NextGen Director)",
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
      leader: pageT.childrenLeader || "Bishop Kurra Kristhu Raju (Sunday School & Kids Director)",
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
      leader: pageT.womenLeader || "Bishop Kurra Kristhu Raju (Women's Fellowship Director)",
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
      leader: pageT.menLeader || "Bishop Kurra Kristhu Raju (Men's Fellowship Coordinator)",
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
      leader: pageT.outreachLeader || "Bishop Kurra Kristhu Raju (Outreach & NGO Program Director)",
      icon: HandHeart,
      accent: "from-emerald-500 to-teal-500",
      border: "border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-400 dark:hover:border-emerald-600",
      badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70 font-bold",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60",
      scheduleColor: "text-emerald-800 dark:text-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 font-semibold"
    },
  ], [pageT]);

  // Derived selected ministry object with multi-language reactivity
  const selectedMinistry = useMemo(() => {
    if (!selectedMinistryId) return ministries[0] || null;
    return ministries.find((m) => m.id === selectedMinistryId) || ministries[0];
  }, [ministries, selectedMinistryId]);

  // Filtered Ministries Calculation (Memoized & Instantaneous)
  const filteredMinistries = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();
    return ministries.filter((ministry) => {
      const matchesCategory = selectedCategory === "all" || ministry.category === selectedCategory;
      const matchesSearch = !q || 
        ministry.title.toLowerCase().includes(q) || 
        ministry.description.toLowerCase().includes(q) || 
        ministry.campus.toLowerCase().includes(q) ||
        ministry.leader.toLowerCase().includes(q) ||
        ministry.details.some((d: string) => d.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [ministries, selectedCategory, deferredSearch]);

  // -------------------------------------------------------------
  // Fast Transitions & Interactions (<100ms response)
  // -------------------------------------------------------------
  const handleCategorySelect = (categoryId: string) => {
    startTransition(() => {
      setSelectedCategory(categoryId);
    });
    // Auto-center smooth scroll for mobile pills
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        const btn = document.getElementById(`cat-pill-${categoryId}`);
        if (btn) {
          btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    startTransition(() => {
      setDeferredSearch(value);
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    startTransition(() => {
      setDeferredSearch("");
    });
  };

  const handleOpenDetails = (ministryId: string) => {
    startTransition(() => {
      setSelectedMinistryId(ministryId);
      setActiveModal("details");
    });
  };

  const handleOpenJoin = (ministryId?: string) => {
    startTransition(() => {
      const targetId = ministryId || selectedMinistryId || "worship";
      setSelectedMinistryId(targetId);
      setJoinForm((prev) => ({ ...prev, ministryId: targetId }));
      setJoinErrors({});
      setJoinSubmitError(null);
      setJoinSubmitSuccess(false);
      setActiveModal("join");
    });
  };

  const handleOpenPrayer = () => {
    startTransition(() => {
      setPrayerErrors({});
      setPrayerSubmitError(null);
      setPrayerSubmitSuccess(false);
      setActiveModal("prayer");
    });
  };

  const handleCloseModal = () => {
    startTransition(() => {
      setActiveModal(null);
    });
  };

  // -------------------------------------------------------------
  // Form Validation & Submission: Join Ministry
  // -------------------------------------------------------------
  const validateJoinForm = () => {
    const errors: { fullName?: string; email?: string; phone?: string } = {};
    if (!joinForm.fullName.trim() || joinForm.fullName.trim().length < 2) {
      errors.fullName = pageT.validationNameRequired || "Please enter your full name (at least 2 characters).";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!joinForm.email.trim() || !emailRegex.test(joinForm.email.trim())) {
      errors.email = pageT.validationEmailRequired || "Please enter a valid email address.";
    }
    const phoneClean = joinForm.phone.replace(/[^0-9]/g, "");
    if (joinForm.phone.trim() && phoneClean.length < 10) {
      errors.phone = pageT.validationPhoneRequired || "Please enter a valid 10-digit phone number.";
    }
    setJoinErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateJoinForm()) return;

    setIsSubmittingJoin(true);
    setJoinSubmitError(null);

    try {
      const { submitToFormspark } = await import("@/lib/formspark");
      const currentTarget = ministries.find((m) => m.id === joinForm.ministryId);
      const ministryName = currentTarget?.title || joinForm.ministryId;

      const res = await submitToFormspark({
        formType: "Ministry Volunteer Application",
        name: joinForm.fullName.trim(),
        email: joinForm.email.trim(),
        phone: joinForm.phone.trim(),
        preferredBranch: joinForm.campus,
        areaOfInterest: ministryName,
        notes: joinForm.notes.trim(),
        subject: `[Ministry Join] ${joinForm.fullName.trim()} applied for ${ministryName}`,
      });

      if (res && res.error) {
        throw new Error(res.error);
      }
      setJoinSubmitSuccess(true);
    } catch (err: any) {
      console.warn("[JOIN_SUBMIT] Fallback handling notice:", err);
      // If network fails or sandbox blocks, provide clean, resilient error messaging
      setJoinSubmitError(
        err?.message || (language === "te" ? "దరఖాస్తు సమర్పించడంలో సమస్య తలెత్తింది. దయచేసి మళ్ళీ ప్రయత్నించండి." : language === "hi" ? "आवेदन जमा करने में समस्या आई। कृपया पुनः प्रयास करें।" : "Unable to submit your application right now. Please check your network and try again.")
      );
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  // -------------------------------------------------------------
  // Form Validation & Submission: Prayer Request
  // -------------------------------------------------------------
  const prayerCategoriesList = [
    { id: "Health & Healing", label: language === "te" ? "ఆరోగ్యం & స్వస్థత" : language === "hi" ? "स्वास्थ्य और चिकित्सा" : "Health & Healing" },
    { id: "Family & Relationships", label: language === "te" ? "కుటుంబం & సంబంధాలు" : language === "hi" ? "परिवार और रिश्ते" : "Family & Relationships" },
    { id: "Financial Needs", label: language === "te" ? "ఆర్థిక అవసరాలు" : language === "hi" ? "वित्तीय आवश्यकताएं" : "Financial Needs" },
    { id: "Spiritual Growth", label: language === "te" ? "ఆత్మీయ ఎదుగుదల" : language === "hi" ? "आध्यात्मिक विकास" : "Spiritual Growth" },
    { id: "Guidance & Direction", label: language === "te" ? "నడిపింపు & మార్గదర్శకత్వం" : language === "hi" ? "मार्गदर्शन और दिशा" : "Guidance & Direction" },
    { id: "Thanksgiving & Praise", label: language === "te" ? "కృతజ్ఞతా స్తుతి" : language === "hi" ? "धन्यवाद और प्रशंसा" : "Thanksgiving & Praise" },
    { id: "Salvation & Deliverance", label: language === "te" ? "రక్షణ & విమోచన" : language === "hi" ? "उद्धार और छुटकारा" : "Salvation & Deliverance" },
    { id: "Other Needs", label: language === "te" ? "ఇతర అవసరాలు" : language === "hi" ? "अन्य आवश्यकताएं" : "Other Needs" },
  ];

  const validatePrayerForm = () => {
    const errors: { name?: string; email?: string; request?: string } = {};
    if (!prayerForm.isAnonymous && (!prayerForm.name.trim() || prayerForm.name.trim().length < 2)) {
      errors.name = pageT.validationNameRequired || "Please enter your name (at least 2 characters).";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!prayerForm.email.trim() || !emailRegex.test(prayerForm.email.trim())) {
      errors.email = pageT.validationEmailRequired || "Please enter a valid email address.";
    }
    if (!prayerForm.request.trim() || prayerForm.request.trim().length < 5) {
      errors.request = pageT.validationRequestRequired || "Please describe your prayer request (at least 5 characters).";
    }
    setPrayerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePrayerForm()) return;

    setIsSubmittingPrayer(true);
    setPrayerSubmitError(null);

    try {
      const { submitToFormspark } = await import("@/lib/formspark");
      const res = await submitToFormspark({
        formType: "Prayer Request",
        name: prayerForm.isAnonymous ? "Anonymous Prayer Request" : prayerForm.name.trim(),
        email: prayerForm.email.trim(),
        category: prayerForm.category,
        message: prayerForm.request.trim(),
        request: prayerForm.request.trim(),
        anonymous: prayerForm.isAnonymous,
        urgent: prayerForm.isUrgent,
        subject: `${prayerForm.isUrgent ? "[URGENT PRAYER] " : ""}Prayer Request: [${prayerForm.category}] from ${prayerForm.isAnonymous ? "Anonymous" : prayerForm.name.trim()}`,
      });

      if (res && res.error) {
        throw new Error(res.error);
      }
      setPrayerSubmitSuccess(true);
    } catch (err: any) {
      console.warn("[PRAYER_SUBMIT] Fallback notice:", err);
      setPrayerSubmitError(
        err?.message || (language === "te" ? "ప్రార్థన విన్నపం సమర్పించడంలో సమస్య తలెత్తింది. దయచేసి మళ్ళీ ప్రయత్నించండి." : language === "hi" ? "प्रार्थना अनुरोध जमा करने में समस्या आई। कृपया पुनः प्रयास करें।" : "Unable to send your prayer request right now. Please check your network and try again.")
      );
    } finally {
      setIsSubmittingPrayer(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* 🌌 Hero Banner Section — Continuous Ambient Gradient */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 md:pt-44 md:pb-28 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25 dark:opacity-15 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
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

      {/* 📊 Tone-on-Tone Floating Stats Bar */}
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
            
            {/* Search Input Box with Real-time Transition */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={pageT.searchPlaceholder || (language === "te" ? "పరిచర్యలను వెతకండి..." : language === "hi" ? "मंत्रालय खोजें..." : "Search ministries or schedules...")}
                className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs transition-all font-medium"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills — Smooth Horizontal Swipe Track on Mobile */}
            <div 
              ref={tabsContainerRef}
              className="flex items-center gap-2 overflow-x-auto scroll-smooth overscroll-x-contain touch-pan-x snap-x snap-mandatory py-2 px-4 sm:px-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] sm:justify-center flex-nowrap"
            >
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`cat-pill-${cat.id}`}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`snap-start shrink-0 whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
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

          {/* Ministries Grid — Uniform 3-Column Desktop Heights with flex-col stretch */}
          <div className="max-w-7xl mx-auto">
            {filteredMinistries.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto">
                <Search className="h-12 w-12 text-slate-400 mx-auto mb-4 opacity-60" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {pageT.noResultsTitle || "No Ministries Found"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  {pageT.noResultsDesc || `We couldn't find any ministry matching "${searchInput}". Try selecting a different category or clearing search terms.`}
                </p>
                <button
                  onClick={() => { 
                    startTransition(() => {
                      setSelectedCategory("all"); 
                      setSearchInput(""); 
                      setDeferredSearch("");
                    });
                  }}
                  className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 active:scale-95 transition shadow-md shadow-purple-600/25 text-sm cursor-pointer"
                >
                  {pageT.resetFilters || "Reset Filters"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                {filteredMinistries.map((ministry) => {
                  const IconComponent = ministry.icon;
                  return (
                    <div
                      key={ministry.id}
                      className={`group bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border ${ministry.border} shadow-xl shadow-slate-900/5 dark:shadow-black/25 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full relative overflow-hidden`}
                    >
                      {/* Top subtle background accent gradient */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${ministry.accent}`} />

                      <div className="flex-1 flex flex-col">
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
                        <div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg mb-4 shadow-2xs w-fit ${ministry.scheduleColor}`}>
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{ministry.schedule}</span>
                        </div>

                        {/* Description (Uniform min-height for baseline alignment) */}
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 font-normal min-h-[44px]">
                          {ministry.description}
                        </p>

                        {/* Bullet Highlights */}
                        <ul className="space-y-2 mb-6 flex-1">
                          {ministry.details.slice(0, 3).map((detail: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-tight">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Card Action Footer: Uniform Baseline */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5 mt-auto">
                        <button
                          onClick={() => handleOpenDetails(ministry.id)}
                          className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] whitespace-nowrap"
                        >
                          <span>{pageT.viewDetails || "View Details"}</span>
                        </button>
                        
                        <button
                          onClick={() => handleOpenJoin(ministry.id)}
                          className="py-2.5 px-3.5 sm:px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap cursor-pointer"
                        >
                          <span>{pageT.getInvolved || "Join"}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 📖 Interactive Ministry Details Modal */}
      {activeModal === "details" && selectedMinistry && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          className="fixed inset-0 z-[10005] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full relative overflow-hidden animate-scale-in max-h-[90dvh] flex flex-col"
          >
            {/* Modal Header */}
            <div className={`p-5 sm:p-6 bg-gradient-to-r ${selectedMinistry.accent} text-white relative shrink-0 z-10`}>
              <div className="pr-12">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-2">
                  {selectedMinistry.categoryLabel}
                </span>
                <h3 className="text-xl sm:text-2xl font-black leading-tight">
                  {selectedMinistry.title}
                </h3>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                aria-label="Close modal"
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 bg-black/25 hover:bg-black/40 active:scale-95 rounded-xl text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 overscroll-contain text-left text-slate-700 dark:text-slate-300">
              <p className="text-sm sm:text-base leading-relaxed font-normal">
                {selectedMinistry.description}
              </p>

              {/* Schedule & Location Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{pageT.modalSchedule || "Gathering Schedule"}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {selectedMinistry.schedule}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{pageT.modalLocation || "Campus Locations"}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {selectedMinistry.campus}
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
                  {selectedMinistry.details.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2.5 p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Leader contact line */}
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 font-medium">
                <ShieldCheck className="h-4 w-4 text-purple-500 shrink-0" />
                <span><strong>{pageT.modalLeader || "Leadership"}:</strong> {selectedMinistry.leader}</span>
              </div>
            </div>

            {/* Actions - Pinned Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={handleCloseModal}
                className="w-full sm:flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center cursor-pointer active:scale-95"
              >
                {pageT.modalClose || "Close"}
              </button>
              
              <button
                onClick={() => handleOpenJoin(selectedMinistry.id)}
                className="w-full sm:flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold transition text-center shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>{pageT.modalJoinBtn || "Volunteer for this Ministry"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🤝 Interactive Ministry Join Form Modal */}
      {activeModal === "join" && selectedMinistry && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          className="fixed inset-0 z-[10005] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full relative overflow-hidden animate-scale-in max-h-[92dvh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white relative shrink-0 z-10">
              <div className="pr-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-2">
                  <Sparkles className="h-3 w-3" />
                  <span>{selectedMinistry.title}</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black leading-tight">
                  {pageT.joinModalTitle || "Join Ministry Team"}
                </h3>
                <p className="text-purple-100 text-xs sm:text-sm mt-1 font-normal">
                  {pageT.joinModalSubtitle || "Take your next step to serve, connect, and make an eternal impact."}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                aria-label="Close modal"
                className="absolute top-4 right-4 p-2 bg-black/25 hover:bg-black/40 active:scale-95 rounded-xl text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              {joinSubmitSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <Check className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                    {pageT.formSuccessJoin || "Application Received!"}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                    {pageT.formSuccessJoinDesc || "Thank you for stepping forward to serve. Our ministry team will review your application and connect with you shortly."}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-600/25 active:scale-95 transition cursor-pointer"
                    >
                      {pageT.formSuccessClose || "Done"}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="space-y-4 text-left">
                  {/* Error Notification Banner */}
                  {joinSubmitError && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
                      <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
                      <div className="flex-1 leading-relaxed">
                        <span className="font-bold">{pageT.formErrorTitle || "Notice"}: </span>
                        {joinSubmitError}
                      </div>
                    </div>
                  )}

                  {/* Ministry Target Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {pageT.formMinistry || "Ministry Department"}
                    </label>
                    <select
                      value={joinForm.ministryId}
                      onChange={(e) => setJoinForm({ ...joinForm, ministryId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    >
                      {ministries.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {pageT.formFullName || "Full Name"} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={joinForm.fullName}
                      onChange={(e) => {
                        setJoinForm({ ...joinForm, fullName: e.target.value });
                        if (joinErrors.fullName) setJoinErrors({ ...joinErrors, fullName: undefined });
                      }}
                      placeholder={pageT.formFullNamePlaceholder || "Enter your full name"}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                        joinErrors.fullName ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700 focus:ring-purple-500"
                      } rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition`}
                    />
                    {joinErrors.fullName && (
                      <p className="mt-1 text-xs text-rose-500 font-semibold">{joinErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        {pageT.formEmail || "Email Address"} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={joinForm.email}
                        onChange={(e) => {
                          setJoinForm({ ...joinForm, email: e.target.value });
                          if (joinErrors.email) setJoinErrors({ ...joinErrors, email: undefined });
                        }}
                        placeholder={pageT.formEmailPlaceholder || "yourname@example.com"}
                        className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                          joinErrors.email ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700 focus:ring-purple-500"
                        } rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition`}
                      />
                      {joinErrors.email && (
                        <p className="mt-1 text-xs text-rose-500 font-semibold">{joinErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        {pageT.formPhone || "Phone Number"}
                      </label>
                      <input
                        type="tel"
                        value={joinForm.phone}
                        onChange={(e) => {
                          setJoinForm({ ...joinForm, phone: e.target.value });
                          if (joinErrors.phone) setJoinErrors({ ...joinErrors, phone: undefined });
                        }}
                        placeholder={pageT.formPhonePlaceholder || "+91 98765 43210"}
                        className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                          joinErrors.phone ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700 focus:ring-purple-500"
                        } rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition`}
                      />
                      {joinErrors.phone && (
                        <p className="mt-1 text-xs text-rose-500 font-semibold">{joinErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Campus Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {pageT.formCampus || "Preferred Campus"}
                    </label>
                    <select
                      value={joinForm.campus}
                      onChange={(e) => setJoinForm({ ...joinForm, campus: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    >
                      <option value="All KCM Campuses">{pageT.allCampuses || "All KCM Campuses"}</option>
                      <option value="Shapur Campus">{pageT.shapurCampus || "Shapur Campus"}</option>
                      <option value="Subhash Nagar Campus">{pageT.subhashCampus || "Subhash Nagar Campus"}</option>
                      <option value="Bahadurpally Campus">{pageT.bahadurpallyCampus || "Bahadurpally Campus"}</option>
                    </select>
                  </div>

                  {/* Personal Notes / Availability */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {pageT.formNotes || "Personal Notes or Experience (Optional)"}
                    </label>
                    <textarea
                      rows={2}
                      value={joinForm.notes}
                      onChange={(e) => setJoinForm({ ...joinForm, notes: e.target.value })}
                      placeholder={pageT.formNotesPlaceholder || "Tell us how you would like to serve or any relevant experience..."}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingJoin}
                      className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-md shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      {isSubmittingJoin ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{pageT.formSubmitting || "Submitting..."}</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>{pageT.formSubmitJoin || "Submit Application"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🙏 Interactive Prayer Request Form Modal */}
      {activeModal === "prayer" && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          className="fixed inset-0 z-[10005] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full relative overflow-hidden animate-scale-in max-h-[92dvh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white relative shrink-0 z-10">
              <div className="pr-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-2">
                  <Flame className="h-3 w-3 text-amber-300" />
                  <span>24/7 Prayer Ministry</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black leading-tight">
                  {pageT.prayerModalTitle || "Submit a Prayer Request"}
                </h3>
                <p className="text-purple-100 text-xs sm:text-sm mt-1 font-normal">
                  {pageT.prayerModalSubtitle || "Our intercessory prayer network is ready to stand in faith with you."}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                aria-label="Close modal"
                className="absolute top-4 right-4 p-2 bg-black/25 hover:bg-black/40 active:scale-95 rounded-xl text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              {prayerSubmitSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <Heart className="h-8 w-8 fill-purple-600/30" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                    {pageT.prayerSuccessTitle || "Prayer Request Received!"}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                    {pageT.prayerSuccessDesc || "\"With God all things are possible.\" (Mark 10:27) Our pastoral team and intercessors are holding you in earnest prayer."}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-600/25 active:scale-95 transition cursor-pointer"
                    >
                      {pageT.formSuccessClose || "Done"}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePrayerSubmit} className="space-y-4 text-left">
                  {/* Error Notification Banner */}
                  {prayerSubmitError && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
                      <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
                      <div className="flex-1 leading-relaxed">
                        <span className="font-bold">{pageT.formErrorTitle || "Notice"}: </span>
                        {prayerSubmitError}
                      </div>
                    </div>
                  )}

                  {/* Anonymous Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {pageT.prayerFormAnonymous || "Keep my request anonymous"}
                    </span>
                    <input
                      type="checkbox"
                      checked={prayerForm.isAnonymous}
                      onChange={(e) => setPrayerForm({ ...prayerForm, isAnonymous: e.target.checked })}
                      className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Name (hidden or optional if anonymous) */}
                  {!prayerForm.isAnonymous && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        {pageT.formFullName || "Full Name"} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={prayerForm.name}
                        onChange={(e) => {
                          setPrayerForm({ ...prayerForm, name: e.target.value });
                          if (prayerErrors.name) setPrayerErrors({ ...prayerErrors, name: undefined });
                        }}
                        placeholder={pageT.formFullNamePlaceholder || "Enter your full name"}
                        className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                          prayerErrors.name ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700 focus:ring-purple-500"
                        } rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition`}
                      />
                      {prayerErrors.name && (
                        <p className="mt-1 text-xs text-rose-500 font-semibold">{prayerErrors.name}</p>
                      )}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {pageT.formEmail || "Email Address"} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={prayerForm.email}
                      onChange={(e) => {
                        setPrayerForm({ ...prayerForm, email: e.target.value });
                        if (prayerErrors.email) setPrayerErrors({ ...prayerErrors, email: undefined });
                      }}
                      placeholder={pageT.formEmailPlaceholder || "yourname@example.com"}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                        prayerErrors.email ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700 focus:ring-purple-500"
                      } rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition`}
                    />
                    {prayerErrors.email && (
                      <p className="mt-1 text-xs text-rose-500 font-semibold">{prayerErrors.email}</p>
                    )}
                  </div>

                  {/* Prayer Category Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {pageT.prayerFormCategory || "Prayer Need Category"}
                    </label>
                    <select
                      value={prayerForm.category}
                      onChange={(e) => setPrayerForm({ ...prayerForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    >
                      {prayerCategoriesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prayer Request Details */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {pageT.prayerFormRequest || "Your Prayer Request"} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={prayerForm.request}
                      onChange={(e) => {
                        setPrayerForm({ ...prayerForm, request: e.target.value });
                        if (prayerErrors.request) setPrayerErrors({ ...prayerErrors, request: undefined });
                      }}
                      placeholder={pageT.prayerFormRequestPlaceholder || "Please share your prayer request or praise report with our prayer team..."}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                        prayerErrors.request ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700 focus:ring-purple-500"
                      } rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition resize-none`}
                    />
                    {prayerErrors.request && (
                      <p className="mt-1 text-xs text-rose-500 font-semibold">{prayerErrors.request}</p>
                    )}
                  </div>

                  {/* Urgent Need Checkbox */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-200/80 dark:border-rose-800/60">
                    <span className="text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300">
                      {pageT.prayerFormUrgent || "Mark as urgent prayer need"}
                    </span>
                    <input
                      type="checkbox"
                      checked={prayerForm.isUrgent}
                      onChange={(e) => setPrayerForm({ ...prayerForm, isUrgent: e.target.checked })}
                      className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingPrayer}
                      className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-md shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      {isSubmittingPrayer ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{pageT.formSubmitting || "Submitting..."}</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>{pageT.prayerFormSubmit || "Send Prayer Request"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
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
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-purple-100 dark:border-slate-800 hover:-translate-y-1 transition duration-300 flex flex-col justify-between">
                <div>
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
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-indigo-100 dark:border-slate-800 hover:-translate-y-1 transition duration-300 flex flex-col justify-between">
                <div>
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
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-pink-100 dark:border-slate-800 hover:-translate-y-1 transition duration-300 flex flex-col justify-between">
                <div>
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
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={handleOpenPrayer}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all duration-200 text-sm sm:text-base cursor-pointer"
              >
                <span>{pageT.submitPrayer || "Submit Prayer Request"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/prayer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-200 text-sm sm:text-base cursor-pointer"
              >
                <span>{language === "te" ? "ప్రార్థన పేజీని చూడండి" : language === "hi" ? "प्रार्थना पृष्ठ देखें" : "View Prayer Wall"}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

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
              <button
                onClick={() => handleOpenJoin()}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-xl shadow-purple-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base text-center cursor-pointer"
              >
                <span>{pageT.volunteerToday || "Volunteer Today"}</span>
              </button>
              
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
