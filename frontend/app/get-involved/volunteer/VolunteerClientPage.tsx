"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Music,
  Users,
  Baby,
  Heart,
  Camera,
  Coffee,
  Wrench,
  Sparkles,
  CheckCircle2,
  Send,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  HeartHandshake,
  Check,
  User,
  Mail,
  Phone,
  Layers,
  FileText,
  MapPin,
  Clock
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function VolunteerClientPage() {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Form states
  const [selectedArea, setSelectedArea] = useState<string>("Select an area");
  const [formData, setFormData] = useState({ fname: "", lname: "", email: "", phone: "", about: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const oppsRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const opportunities = [
    {
      id: "worship",
      title: !mounted
        ? "Worship Team"
        : language === "te"
        ? "ఆరాధన బృందం"
        : language === "hi"
        ? "आराधना टीम"
        : "Worship Team",
      areas: !mounted ? ["Singers", "Musicians", "Sound technicians", "Media team"] : t.pages.volunteer.worshipAreas,
      icon: Music,
      accent: "from-violet-500 to-indigo-500",
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-500/10 dark:bg-violet-500/20 border-violet-200/80 dark:border-violet-800/80",
    },
    {
      id: "children",
      title: !mounted
        ? "Children's Ministry"
        : language === "te"
        ? "పిల్లల పరిచర్య"
        : language === "hi"
        ? "बाल मंत्रालय"
        : "Children's Ministry",
      areas: !mounted ? ["Sunday School teachers", "Nursery helpers", "VBS volunteers", "Kids camp staff"] : t.pages.volunteer.childrenAreas,
      icon: Baby,
      accent: "from-pink-500 to-rose-500",
      iconColor: "text-pink-600 dark:text-pink-400",
      iconBg: "bg-pink-500/10 dark:bg-pink-500/20 border-pink-200/80 dark:border-pink-800/80",
    },
    {
      id: "hospitality",
      title: !mounted ? "Hospitality" : t.pages.volunteer.hospitalityTitle,
      areas: !mounted ? ["Greeters", "Ushers", "Coffee team", "Setup crew"] : t.pages.volunteer.hospitalityAreas,
      icon: Coffee,
      accent: "from-amber-500 to-orange-500",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-200/80 dark:border-amber-800/80",
    },
    {
      id: "tech",
      title: !mounted ? "Technical Team" : t.pages.volunteer.techTitle,
      areas: !mounted ? ["Audio/Visual", "Live streaming", "Social media", "Photography"] : t.pages.volunteer.techAreas,
      icon: Camera,
      accent: "from-blue-500 to-indigo-500",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-200/80 dark:border-blue-800/80",
    },
    {
      id: "outreach",
      title: !mounted
        ? "Outreach"
        : language === "te"
        ? "అవుట్‌రీచ్ పరిచర్య"
        : language === "hi"
        ? "आउटरीच मंत्रालय"
        : "Outreach",
      areas: !mounted ? ["Community events", "Food distribution", "Medical camps", "Evangelism teams"] : t.pages.volunteer.outreachAreas,
      icon: Heart,
      accent: "from-emerald-500 to-teal-500",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-200/80 dark:border-emerald-800/80",
    },
    {
      id: "facilities",
      title: !mounted ? "Facilities" : t.pages.volunteer.facilitiesTitle,
      areas: !mounted ? ["Maintenance", "Cleaning", "Setup/Teardown", "Security"] : t.pages.volunteer.facilitiesAreas,
      icon: Wrench,
      accent: "from-cyan-500 to-blue-500",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      iconBg: "bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-200/80 dark:border-cyan-800/80",
    },
  ];

  const steps = [
    {
      step: "1",
      title: !mounted ? "Sign Up" : t.pages.volunteer.step1,
      desc: !mounted ? "Fill out the online application below" : t.pages.volunteer.step1Desc,
      icon: Send,
      accent: "from-purple-500 to-indigo-500",
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-200/80 dark:border-purple-800/80",
    },
    {
      step: "2",
      title: !mounted ? "Meet" : t.pages.volunteer.step2,
      desc: !mounted ? "Meet with a friendly ministry team leader" : t.pages.volunteer.step2Desc,
      icon: Users,
      accent: "from-indigo-500 to-cyan-500",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-200/80 dark:border-indigo-800/80",
    },
    {
      step: "3",
      title: !mounted ? "Train" : t.pages.volunteer.step3,
      desc: !mounted ? "Receive hands-on guides, coaching & tools" : t.pages.volunteer.step3Desc,
      icon: Sparkles,
      accent: "from-pink-500 to-rose-500",
      iconColor: "text-pink-600 dark:text-pink-400",
      iconBg: "bg-pink-500/10 dark:bg-pink-500/20 border-pink-200/80 dark:border-pink-800/80",
    },
    {
      step: "4",
      title: !mounted ? "Serve" : t.pages.volunteer.step4,
      desc: !mounted ? "Start blessing lives and making an eternal impact" : t.pages.volunteer.step4Desc,
      icon: HeartHandshake,
      accent: "from-emerald-500 to-teal-500",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-200/80 dark:border-emerald-800/80",
    },
  ];

  const handleSelectOpportunity = (title: string) => {
    setSelectedArea(title);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToOpps = () => {
    if (oppsRef.current) {
      oppsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    try {
      const { submitToFormspark } = await import("@/lib/formspark");
      await submitToFormspark({
        formType: "Volunteer Application",
        name: `${formData.fname} ${formData.lname}`.trim(),
        firstName: formData.fname,
        lastName: formData.lname,
        email: formData.email,
        phone: formData.phone,
        areaOfInterest: selectedArea,
        about: formData.about,
        message: formData.about,
        subject: `Volunteer Application: [${selectedArea}] from ${formData.fname} ${formData.lname}`,
      });
    } catch (err) {
      console.warn("[VOLUNTEER] Formspark submit notice:", err);
    }

    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ fname: "", lname: "", email: "", phone: "", about: "" });
      setSelectedArea("Select an area");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-purple-500 selection:text-white">
      {/* 🧭 Global Navigation Bar */}
      <Navbar />

      {/* 🌌 Hero Section - Adaptive Light/Dark Design with Executive Metric Highlights */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white border-b border-purple-100/80 dark:border-slate-800/80 overflow-hidden shadow-xs transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25 dark:opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Inline Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-5 flex justify-center">
              <ol className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-purple-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-2xs">
                <li className="inline-flex items-center">
                  <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {t?.nav?.home || (language === "te" ? "హోమ్" : language === "hi" ? "होम" : "Home")}
                  </Link>
                </li>
                <li className="text-slate-400 dark:text-slate-600">/</li>
                <li className="text-purple-700 dark:text-purple-300 font-bold" aria-current="page">
                  {!mounted ? "Volunteer" : (t?.pages?.volunteer?.title || "Volunteer")}
                </li>
              </ol>
            </nav>

            {/* Subtle Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/90 dark:border-purple-800/80 rounded-full text-purple-900 dark:text-purple-200 font-extrabold text-xs sm:text-sm mb-6 shadow-2xs backdrop-blur-md">
              <HeartHandshake className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span>
                {!mounted
                  ? "Make a Difference • Serve With Purpose"
                  : language === "te"
                  ? "మార్పు తీసుకురండి • ఉద్దేశ్యంతో సేవ చేయండి"
                  : language === "hi"
                  ? "बदलाव लाएं • उद्देश्य के साथ सेवा करें"
                  : "Make a Difference • Serve With Purpose"}
              </span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 font-outfit text-slate-900 dark:text-white leading-tight">
              {!mounted ? "Volunteer & Serve" : t.pages.volunteer.title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
              {!mounted 
                ? "Serve God by serving others. Volunteering is a vital way to build lasting friendships, discover your spiritual gifts, and make an eternal impact." 
                : t.pages.volunteer.subtitle}
            </p>

            {/* Quick Jump Action Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <button
                type="button"
                onClick={scrollToOpps}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-purple-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{language === "te" ? "పరిచర్య బృందాలు చూడండి" : language === "hi" ? "मंत्रालय टीमें देखें" : "Explore 6 Ministry Teams"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <a
                href="#how-to-volunteer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-purple-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold border border-slate-200/90 dark:border-slate-800 shadow-xs transition-all active:scale-95"
              >
                <span>{language === "te" ? "ప్రక్రియ ఎలా ఉంటుంది?" : language === "hi" ? "यह कैसे काम करता है?" : "How It Works (4 Steps)"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </a>
            </div>

            {/* Executive Impact Metrics Deck — Frosted Glass with Tone-on-Tone Halos */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 max-w-4xl mx-auto pt-6 border-t border-purple-100/80 dark:border-slate-800">
              
              {/* Stat 1: Teams */}
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-90" />
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight mb-0.5">6+ Teams</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "పరిచర్య విభాగాలు" : language === "hi" ? "मंत्रालय विभाग" : "Ministry Teams"}</div>
              </div>

              {/* Stat 2: Volunteers */}
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-90" />
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <HeartHandshake className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight mb-0.5">200+</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "వారం వాలంటీర్లు" : language === "hi" ? "साप्ताहिक स्वयंसेवक" : "Serving Weekly"}</div>
              </div>

              {/* Stat 3: Campuses */}
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500 opacity-90" />
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 border border-pink-200/80 dark:border-pink-800/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <MapPin className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight mb-0.5">3 Hubs</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "కేంద్రాలు" : language === "hi" ? "कलीसियाई केंद्र" : "Church Campuses"}</div>
              </div>

              {/* Stat 4: Welcome */}
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-90" />
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight mb-0.5">100%</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "అనుభవం అక్కర్లేదు" : language === "hi" ? "अनुभव आवश्यक नहीं" : "No Exp. Needed"}</div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 💡 Opportunities Grid Section — Seamless Transition */}
      <section ref={oppsRef} id="opportunities" className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 relative z-10 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Ministry Teams & Departments</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight font-outfit">
              {!mounted ? "Volunteer Opportunities" : t.pages.volunteer.oppsTitle}
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal max-w-2xl mx-auto">
              {!mounted
                ? "Volunteering is a great way to meet new people, grow in your faith, and make an eternal impact. Select any ministry team below to submit your application."
                : (t.pages.volunteer.whyDesc || "Volunteering is a great way to meet new people, grow in your faith, and make a difference.")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {opportunities.map((opp) => {
              const IconComponent = opp.icon;
              const isSelected = selectedArea === opp.title;
              return (
                <div
                  key={opp.id}
                  onClick={() => handleSelectOpportunity(opp.title)}
                  className={`cursor-pointer rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group select-none ${
                    isSelected
                      ? "bg-purple-50/80 dark:bg-purple-950/40 border-2 border-purple-600 dark:border-purple-500 ring-2 ring-purple-500/20 shadow-xl shadow-purple-900/10 -translate-y-1"
                      : "bg-slate-50/80 dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/60 shadow-md hover:shadow-2xl hover:-translate-y-1"
                  }`}
                >
                  {/* Top Accent Ribbon */}
                  <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${opp.accent} opacity-85 group-hover:opacity-100 transition-opacity`} />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${opp.iconBg} border shadow-2xs group-hover:scale-110 transition-transform`}>
                        <IconComponent className={`h-6 w-6 ${opp.iconColor}`} />
                      </div>
                      {isSelected ? (
                        <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm shadow-purple-600/30">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Selected
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700 group-hover:border-purple-300 dark:group-hover:border-purple-700 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-all">
                          Tap to Select
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight font-outfit group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {opp.title}
                    </h3>

                    {/* Role Chips */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {opp.areas.map((area: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                          <span>{area}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`min-h-[46px] w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98] ${
                      isSelected
                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-md shadow-purple-600/25"
                        : "bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white hover:border-purple-600"
                    }`}
                  >
                    <span>Apply for {opp.title}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 🛠️ How to Volunteer — Sequential 4-Step Journey */}
      <section id="how-to-volunteer" className="py-16 md:py-24 bg-slate-100/70 dark:bg-slate-900/50 relative z-10 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Simple 4-Step Journey</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-outfit">
                {!mounted ? "How to Volunteer" : t.pages.volunteer.howTitle}
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {steps.map((item, index) => {
                const StepIcon = item.icon;
                return (
                  <div
                    key={index}
                    className="relative bg-white/95 dark:bg-slate-900/90 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center overflow-hidden group flex flex-col justify-between"
                  >
                    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.accent} opacity-85 group-hover:opacity-100 transition-opacity`} />
                    
                    <div>
                      <div className={`w-11 h-11 sm:w-13 sm:h-13 ${item.iconBg} border rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-2xs`}>
                        <StepIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.iconColor}`} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 inline-block mb-1.5 sm:mb-2">
                        Step {item.step}
                      </span>
                      <h3 className="font-black text-sm sm:text-lg text-slate-900 dark:text-white mb-1 sm:mb-2 tracking-tight font-outfit">{item.title}</h3>
                      <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 📝 Volunteer Application Form */}
      <section ref={formRef} id="apply" className="py-16 md:py-24 bg-slate-50/80 dark:bg-slate-950 relative z-10 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-purple-500/5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-90" />
            
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/80 flex items-center justify-center mx-auto mb-4 shadow-xs">
                <HeartHandshake className="w-7 h-7" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight font-outfit">
                {!mounted ? "Volunteer Application" : t.pages.volunteer.formTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Fill in your details below and our ministry leaders will reach out to get you plugged in.
              </p>

              {/* Pre-selected Ministry Banner */}
              {selectedArea && selectedArea !== "Select an area" && (
                <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-800 text-xs font-bold text-purple-700 dark:text-purple-300 animate-fade-in">
                  <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Applying for: <strong>{selectedArea}</strong></span>
                  <button
                    type="button"
                    onClick={() => setSelectedArea("Select an area")}
                    className="ml-1 text-slate-400 hover:text-rose-500 text-[10px] font-bold"
                  >
                    (Change)
                  </button>
                </div>
              )}
            </div>

            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-outfit">Application Submitted!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed font-medium">
                  Thank you, <strong>{formData.fname || "friend"}</strong>! We have received your application to serve in <strong>{selectedArea}</strong>.
                </p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-1.5 font-outfit">
                      {!mounted ? "First Name" : t.pages.volunteer.fname} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.fname}
                        onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm font-semibold transition-all shadow-xs"
                        placeholder={!mounted ? "First Name" : t.pages.volunteer.fname}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-1.5 font-outfit">
                      {!mounted ? "Last Name" : t.pages.volunteer.lname} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.lname}
                        onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm font-semibold transition-all shadow-xs"
                        placeholder={!mounted ? "Last Name" : t.pages.volunteer.lname}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-1.5 font-outfit">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm font-semibold transition-all shadow-xs"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-1.5 font-outfit">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm font-semibold transition-all shadow-xs"
                        placeholder="+91 97040 90069"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-1.5 font-outfit">
                    Area of Interest <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      <option value="Select an area">Select a ministry team...</option>
                      {opportunities.map((opp) => (
                        <option key={opp.id} value={opp.title}>
                          {opp.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-1.5 font-outfit">
                    Tell Us About Yourself (Experience & Spiritual Gifts)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
                    <textarea
                      rows={4}
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm font-medium leading-relaxed transition-all shadow-xs"
                      placeholder={!mounted ? "Share any past ministry experience, musical abilities, technical skills, or heart for service..." : t.pages.volunteer.aboutPlaceholder}
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[52px] py-4 px-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{!mounted ? "Submit Volunteer Application" : t.pages.volunteer.submit}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ❓ Questions CTA Section */}
      <section className="py-16 bg-gradient-to-b from-slate-100/70 to-slate-200/50 dark:from-slate-900 dark:to-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 relative z-10 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="w-13 h-13 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/80 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <MessageSquare className="w-6 h-6" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 font-outfit tracking-tight">
            {!mounted ? "Have Questions About Serving?" : t.pages.volunteer.questions}
          </h2>
          
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            {!mounted
              ? "We're here to help you discover your calling and find the perfect team that matches your passion and schedule."
              : t.pages.volunteer.questionsDesc}
          </p>
          
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-purple-600/25 hover:scale-105 active:scale-95 cursor-pointer min-h-[46px]"
          >
            <span>Contact Pastoral Team</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 🦶 Global Footer */}
      <Footer />
    </div>
  );
}
