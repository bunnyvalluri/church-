"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Server,
  UserCheck,
  Bell,
  Heart,
  Mail,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Printer,
  Sparkles,
  HelpCircle,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { legalTranslations } from "@/lib/legalTranslations";

// Lift static icon mapping outside component body for instantaneous execution
const PRIVACY_SECTION_ICONS: Record<string, any> = {
  overview: ShieldCheck,
  collection: FileText,
  usage: Eye,
  security: Lock,
  sharing: Server,
  cookies: Bell,
  rights: UserCheck,
  children: Heart,
  updates: Clock,
  contact: Mail,
};

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const content = legalTranslations[(language as "en" | "te" | "hi") || "en"] || legalTranslations.en;
  const p = content.privacy;

  const [activeSection, setActiveSection] = useState("overview");
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const sections = useMemo(() => {
    return p.sections.map((sec) => ({
      ...sec,
      icon: PRIVACY_SECTION_ICONS[sec.id] || ShieldCheck,
    }));
  }, [p.sections]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-700 dark:selection:text-purple-200">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 dark:from-slate-950 dark:via-purple-950/70 dark:to-slate-950 text-white border-b border-purple-500/30 dark:border-white/10 shadow-lg">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[200px] sm:h-[300px] bg-white/10 dark:bg-purple-600/20 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
            <BackToHome />
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/20 text-white text-xs font-semibold border border-white/25 backdrop-blur-md transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-white shrink-0" />
              <span>{p.printBtn}</span>
            </button>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 dark:bg-purple-500/20 border border-white/25 dark:border-purple-500/40 text-white dark:text-purple-300 text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-white shrink-0" /> {p.heroBadge}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight mb-3">
              {p.title}
            </h1>

            <p className="text-purple-100 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed mb-5">
              {p.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-purple-100 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/15 dark:bg-white/5 border border-white/20 dark:border-white/10 text-white dark:text-slate-200 font-medium">
                <Clock className="w-3.5 h-3.5 text-white shrink-0" />
                {p.lastUpdated} <strong className="text-white dark:text-slate-100 ml-1">{p.lastUpdatedDate}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/15 dark:bg-white/5 border border-white/20 dark:border-white/10 text-white dark:text-slate-200 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 dark:text-emerald-400 shrink-0" />
                {p.complianceBadge}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 py-8 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          {/* Mobile Collapsible Table of Contents */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm font-bold shadow-sm active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{p.jumpToSection} ({sections.length} {p.topicsCount})</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isMobileTocOpen ? "rotate-180" : ""}`} />
            </button>

            {isMobileTocOpen && (
              <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-1 shadow-lg animate-fade-in">
                {sections.map(({ id, label, icon: Icon }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={() => {
                      setActiveSection(id);
                      setIsMobileTocOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      activeSection === id
                        ? "bg-purple-600 text-white"
                        : "text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${activeSection === id ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
                      <span className="truncate">{label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Desktop Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <div className="sticky top-28 space-y-4 p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-xl dark:shadow-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 pb-2 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <span>{p.tocTitle}</span>
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </h3>

                <nav className="space-y-1">
                  {sections.map(({ id, label, icon: Icon }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={() => setActiveSection(id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        activeSection === id
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                          : "text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${activeSection === id ? "text-white" : "text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300"}`} />
                        <span className="truncate">{label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${activeSection === id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                    </a>
                  ))}
                </nav>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10 mt-4 space-y-3">
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-200">
                    <p className="font-semibold mb-1 flex items-center gap-1.5 text-purple-800 dark:text-purple-300">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> {p.questionsTitle}
                    </p>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300/80 leading-relaxed mb-2">
                      {p.questionsDesc}
                    </p>
                    <a
                      href={`mailto:${p.emailDesk}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-white hover:underline"
                    >
                      {p.emailDesk} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Privacy Document Body */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6 sm:space-y-8">
              {/* Section 1: Overview */}
              <section id="overview" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{p.sec1Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {p.sec1Text1}
                </p>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {p.sec1Text2}
                </p>

                <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex gap-3 items-start">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-950 dark:text-white block mb-0.5 font-bold">{p.sec1BadgeTitle}</strong>
                    {p.sec1BadgeText}
                  </div>
                </div>
              </section>

              {/* Section 2: Information We Collect */}
              <section id="collection" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{p.sec2Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {p.sec2Intro}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" /> {p.sec2Card1Title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {p.sec2Card1Text}
                    </p>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" /> {p.sec2Card2Title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {p.sec2Card2Text}
                    </p>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> {p.sec2Card3Title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {p.sec2Card3Text}
                    </p>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                      <Server className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" /> {p.sec2Card4Title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {p.sec2Card4Text}
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3: How We Use Information */}
              <section id="usage" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{p.sec3Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {p.sec3Intro}
                </p>

                <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>{p.sec3Item1Title}</strong> {p.sec3Item1Text}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>{p.sec3Item2Title}</strong> {p.sec3Item2Text}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>{p.sec3Item3Title}</strong> {p.sec3Item3Text}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>{p.sec3Item4Title}</strong> {p.sec3Item4Text}</span>
                  </li>
                </ul>
              </section>

              {/* Section 4: Security & Protection */}
              <section id="security" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{p.sec4Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {p.sec4Intro}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs pt-1">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/30 text-slate-800 dark:text-slate-200 text-center space-y-1">
                    <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto" />
                    <strong className="block text-slate-900 dark:text-white text-xs sm:text-sm">{p.sec4Box1Title}</strong>
                    <span className="text-[11px] sm:text-xs">{p.sec4Box1Text}</span>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/30 text-slate-800 dark:text-slate-200 text-center space-y-1">
                    <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto" />
                    <strong className="block text-slate-900 dark:text-white text-xs sm:text-sm">{p.sec4Box2Title}</strong>
                    <span className="text-[11px] sm:text-xs">{p.sec4Box2Text}</span>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/30 text-slate-800 dark:text-slate-200 text-center space-y-1">
                    <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <strong className="block text-slate-900 dark:text-white text-xs sm:text-sm">{p.sec4Box3Title}</strong>
                    <span className="text-[11px] sm:text-xs">{p.sec4Box3Text}</span>
                  </div>
                </div>
              </section>

              {/* Section 5: Information Sharing */}
              <section id="sharing" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Server className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{p.sec5Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {p.sec5Intro}
                </p>

                <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <strong className="text-slate-900 dark:text-white">{p.sec5Item1Title}</strong> {p.sec5Item1Text}
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <strong className="text-slate-900 dark:text-white">{p.sec5Item2Title}</strong> {p.sec5Item2Text}
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <strong className="text-slate-900 dark:text-white">{p.sec5Item3Title}</strong> {p.sec5Item3Text}
                  </div>
                </div>
              </section>

              {/* Section 6: Cookies */}
              <section id="cookies" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{p.sec6Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {p.sec6Text}
                </p>
              </section>

              {/* Section 7: Rights */}
              <section id="rights" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{p.sec7Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {p.sec7Intro}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-semibold">{p.sec7Box1Title}</strong>
                    <span className="text-slate-600 dark:text-slate-400">{p.sec7Box1Text}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-semibold">{p.sec7Box2Title}</strong>
                    <span className="text-slate-600 dark:text-slate-400">{p.sec7Box2Text}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-semibold">{p.sec7Box3Title}</strong>
                    <span className="text-slate-600 dark:text-slate-400">{p.sec7Box3Text}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-semibold">{p.sec7Box4Title}</strong>
                    <span className="text-slate-600 dark:text-slate-400">{p.sec7Box4Text}</span>
                  </div>
                </div>
              </section>

              {/* Section 8: Children's Privacy */}
              <section id="children" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 dark:text-rose-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{p.sec8Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {p.sec8Text}
                </p>
              </section>

              {/* Section 9: Updates */}
              <section id="updates" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{p.sec9Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {p.sec9Text}
                </p>
              </section>

              {/* Section 10: Contact */}
              <section id="contact" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-purple-950/50 dark:via-slate-900 dark:to-indigo-950/50 border border-purple-200 dark:border-purple-500/30 space-y-5 sm:space-y-6 shadow-md sm:shadow-lg dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-200" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{p.sec10Title}</h2>
                    <p className="text-[11px] sm:text-xs text-purple-700 dark:text-purple-200/80 font-medium">{p.sec10Subtitle}</p>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-base leading-relaxed">
                  {p.sec10Intro}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
                    <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <strong className="text-slate-900 dark:text-white block font-semibold">{p.sec10Box1Title}</strong>
                    <span className="text-slate-600 dark:text-slate-300">{p.sec10Box1Text}</span>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <strong className="text-slate-900 dark:text-white block font-semibold">{p.sec10Box2Title}</strong>
                    <a href={`mailto:${p.emailDesk}`} className="text-purple-600 dark:text-purple-300 font-medium hover:underline">{p.emailDesk}</a>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
                    <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <strong className="text-slate-900 dark:text-white block font-semibold">{p.sec10Box3Title}</strong>
                    <a href={`tel:${p.phone.replace(/\s+/g, '')}`} className="text-slate-600 dark:text-slate-300 hover:underline">{p.phone}</a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
