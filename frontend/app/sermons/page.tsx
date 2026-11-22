"use client";

import Link from "next/link";
import Sermons from "@/components/sections/Sermons";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function SermonsPage() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      {/* Page Header */}
      <div className="bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white pt-32 pb-16 md:pt-40 md:pb-20 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25 dark:opacity-15 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Inline Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-5 flex justify-center">
            <ol className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-purple-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-2xs">
              <li className="inline-flex items-center">
                <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  {(t as any)?.nav?.home || (language === "te" ? "హోమ్" : language === "hi" ? "होम" : "Home")}
                </Link>
              </li>
              <li className="text-slate-400 dark:text-slate-600">/</li>
              <li className="text-purple-700 dark:text-purple-300 font-bold" aria-current="page">
                {t.sermons?.libraryTitle || (language === "te" ? "ప్రసంగాలు" : language === "hi" ? "उपदेश" : "Sermons")}
              </li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">
            {t.sermons?.libraryTitle || (language === "te" ? "ప్రసంగాల భాండాగారం" : language === "hi" ? "उपदेश लाइब्रेरी" : "Sermon Library")}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
            {t.sermons?.librarySubtitle ||
              (language === "te"
                ? "జీవితాలను మార్చే వాక్య సందేశాల సమాహారం. చూడండి, వినండి లేదా నోట్స్ చదవండి."
                : language === "hi"
                ? "जीवन बदलने वाले संदेशों का संग्रह। देखें, सुनें या उपदेश नोट्स पढ़ें।"
                : "Browse our collection of life-changing messages. Watch, listen, or read sermon notes.")}
          </p>
        </div>
      </div>

      {/* Main Sermons List */}
      <Sermons />

      <Footer />
    </div>
  );
}