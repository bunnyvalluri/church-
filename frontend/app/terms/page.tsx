"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ScrollText,
  Clock,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { legalTranslations } from "@/lib/legalTranslations";

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-700 dark:selection:text-purple-200">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 dark:from-slate-950 dark:via-purple-950/70 dark:to-slate-950 text-white border-b border-purple-500/30 dark:border-white/10 shadow-lg">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[280px] sm:w-[600px] h-[150px] sm:h-[300px] bg-white/10 dark:bg-purple-600/20 blur-[60px] sm:blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-4">
            <BackToHome />
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 dark:bg-purple-500/20 border border-white/25 dark:border-purple-500/40 text-white dark:text-purple-300 text-xs font-semibold tracking-wide uppercase mb-3 shadow-xs">
              <ScrollText className="w-3.5 h-3.5 text-white dark:text-purple-300 shrink-0" />
              <span>{t.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight mb-3">
              {t.title}
            </h1>

            <p className="text-purple-100 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Main Notice Content */}
      <main className="flex-1 py-12 sm:py-20 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="p-6 sm:p-12 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl text-center space-y-8">
            {/* Status Icon */}
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-100 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner">
              <ScrollText className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            {/* Notice Heading & Text */}
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{t.status}</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white font-heading">
                {t.noticeTitle}
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {t.noticeText}
              </p>
            </div>

            {/* Contact Information Cards */}
            <div className="pt-6 border-t border-slate-100 dark:border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.contactTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                {t.contactText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                {/* Email */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-xs">
                    <Mail className="w-4 h-4" />
                    <span>{t.emailLabel}</span>
                  </div>
                  <a
                    href={`mailto:${t.email}`}
                    className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 font-medium block truncate"
                  >
                    {t.email}
                  </a>
                </div>

                {/* Phone */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-xs">
                    <Phone className="w-4 h-4" />
                    <span>{t.phoneLabel}</span>
                  </div>
                  <a
                    href={`tel:${t.phone.replace(/\s+/g, "")}`}
                    className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 font-medium block"
                  >
                    {t.phone}
                  </a>
                </div>

                {/* Location */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-xs">
                    <MapPin className="w-4 h-4" />
                    <span>{t.addressLabel}</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block leading-tight">
                    {t.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backHome}</span>
              </Link>
              <Link
                href="/about/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-white/10 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.contactBtn}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
