"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Scale,
  ScrollText,
  UserCheck,
  ShieldAlert,
  Heart,
  DollarSign,
  Calendar,
  AlertTriangle,
  Gavel,
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
const TERMS_SECTION_ICONS: Record<string, any> = {
  acceptance: Scale,
  services: ScrollText,
  accounts: UserCheck,
  conduct: Heart,
  ip: Sparkles,
  giving: DollarSign,
  events: Calendar,
  liability: AlertTriangle,
  governing: Gavel,
  changes: Mail,
};

export default function TermsOfServicePage() {
  const { language } = useLanguage();
  const [lang, setLang] = useState<"en" | "te" | "hi">((language as any) || "en");

  // Sync language with context state
  useEffect(() => {
    if (language) {
      setLang(language as "en" | "te" | "hi");
    }
  }, [language]);

  // Listen directly for global language change custom event
  useEffect(() => {
    const handleLangEvent = (e: Event) => {
      const customEvt = e as CustomEvent<"en" | "te" | "hi">;
      if (customEvt.detail) {
        setLang(customEvt.detail);
      }
    };
    window.addEventListener("kcm-language-change", handleLangEvent);
    return () => window.removeEventListener("kcm-language-change", handleLangEvent);
  }, []);

  const content = legalTranslations[lang] || legalTranslations.en;
  const t = content.terms;

  const [activeSection, setActiveSection] = useState("acceptance");
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const sections = useMemo(() => {
    return t.sections.map((sec) => ({
      ...sec,
      icon: TERMS_SECTION_ICONS[sec.id] || Scale,
    }));
  }, [t.sections, lang]);

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
              <span>{t.printBtn}</span>
            </button>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 dark:bg-purple-500/20 border border-white/25 dark:border-purple-500/40 text-white dark:text-purple-300 text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-3 shadow-xs">
              <Scale className="w-3.5 h-3.5 text-white shrink-0" /> {t.heroBadge}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight mb-3">
              {t.title}
            </h1>

            <p className="text-purple-100 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed mb-5">
              {t.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-purple-100 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/15 dark:bg-white/5 border border-white/20 dark:border-white/10 text-white dark:text-slate-200 font-medium">
                <Clock className="w-3.5 h-3.5 text-white shrink-0" />
                {t.effectiveDate} <strong className="text-white dark:text-slate-100 ml-1">{t.effectiveDateVal}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/15 dark:bg-white/5 border border-white/20 dark:border-white/10 text-white dark:text-slate-200 font-medium">
                <Gavel className="w-3.5 h-3.5 text-indigo-200 dark:text-indigo-400 shrink-0" />
                {t.bindingBadge}
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
                <ScrollText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{t.jumpToSection} ({sections.length} {t.topicsCount})</span>
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
                  <span>{t.tocTitle}</span>
                  <ScrollText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
                      <HelpCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> {t.questionsTitle}
                    </p>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300/80 leading-relaxed mb-2">
                      {t.questionsDesc}
                    </p>
                    <a
                      href={`mailto:${t.emailDesk}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-white hover:underline"
                    >
                      {t.emailDesk} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Terms Document Body */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6 sm:space-y-8">
              {/* Section 1: Acceptance */}
              <section id="acceptance" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{t.sec1Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {t.sec1Text1}
                </p>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {t.sec1Text2}
                </p>
              </section>

              {/* Section 2: Services */}
              <section id="services" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <ScrollText className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{t.sec2Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {t.sec2Intro}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{t.sec2Item1}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{t.sec2Item2}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{t.sec2Item3}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{t.sec2Item4}</span>
                  </div>
                </div>
              </section>

              {/* Section 3: User Registration */}
              <section id="accounts" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{t.sec3Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {t.sec3Intro}
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{t.sec3Item1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{t.sec3Item2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{t.sec3Item3}</span>
                  </li>
                </ul>
              </section>

              {/* Section 4: Community Conduct */}
              <section id="conduct" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 dark:text-rose-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{t.sec4Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {t.sec4Intro}
                </p>

                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200 text-xs sm:text-sm space-y-2">
                  <strong className="text-rose-950 dark:text-white font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" /> {t.sec4BadgeTitle}
                  </strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-xs">
                    <li>{t.sec4Item1}</li>
                    <li>{t.sec4Item2}</li>
                    <li>{t.sec4Item3}</li>
                    <li>{t.sec4Item4}</li>
                  </ul>
                </div>
              </section>

              {/* Section 5: Intellectual Property */}
              <section id="ip" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{t.sec5Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {t.sec5Text1}
                </p>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {t.sec5Text2}
                </p>
              </section>

              {/* Section 6: Online Giving */}
              <section id="giving" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{t.sec6Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {t.sec6Intro}
                </p>

                <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <strong className="text-slate-900 dark:text-white">{t.sec6Box1Title}</strong> {t.sec6Box1Text}
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <strong className="text-slate-900 dark:text-white">{t.sec6Box2Title}</strong> {t.sec6Box2Text}
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <strong className="text-slate-900 dark:text-white">{t.sec6Box3Title}</strong> {t.sec6Box3Text}
                  </div>
                </div>
              </section>

              {/* Section 7: Events */}
              <section id="events" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{t.sec7Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {t.sec7Text}
                </p>
              </section>

              {/* Section 8: Disclaimers */}
              <section id="liability" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{t.sec8Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {t.sec8Text}
                </p>
              </section>

              {/* Section 9: Governing Law */}
              <section id="governing" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Gavel className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{t.sec9Title}</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  {t.sec9Text}
                </p>
              </section>

              {/* Section 10: Changes & Contact */}
              <section id="changes" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-purple-950/50 dark:via-slate-900 dark:to-indigo-950/50 border border-purple-200 dark:border-purple-500/30 space-y-5 sm:space-y-6 shadow-md sm:shadow-lg dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-200" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">{t.sec10Title}</h2>
                    <p className="text-[11px] sm:text-xs text-purple-700 dark:text-purple-200/80 font-medium">{t.sec10Subtitle}</p>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-base leading-relaxed">
                  {t.sec10Intro}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
                    <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <strong className="text-slate-900 dark:text-white block font-semibold">{t.sec10Box1Title}</strong>
                    <span className="text-slate-600 dark:text-slate-300">{t.sec10Box1Text}</span>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <strong className="text-slate-900 dark:text-white block font-semibold">{t.sec10Box2Title}</strong>
                    <a href={`mailto:${t.emailDesk}`} className="text-purple-600 dark:text-purple-300 font-medium hover:underline">{t.emailDesk}</a>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
                    <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <strong className="text-slate-900 dark:text-white block font-semibold">{t.sec10Box3Title}</strong>
                    <a href={`tel:${t.phone.replace(/\s+/g, '')}`} className="text-slate-600 dark:text-slate-300 hover:underline">{t.phone}</a>
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
