"use client";

import Link from "next/link";
import { Heart, Phone, Mail, Clock } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function PrayerPage() {
  const { t } = useLanguage();
  const pageT = t.pages.prayer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <section className="relative py-20 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm mb-6 animate-bounce-in">
              <Heart className="h-4 w-4" />
              <span>{pageT.heroSubtitle}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              {pageT.title}
            </h1>
            <p className="text-xl text-white/80 animate-fade-in-up animate-delay-200">
              {pageT.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">

            {/* Intro */}
            <div className="text-center mb-12 animate-fade-in-up">
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                {pageT.intro}
              </p>
            </div>

            {/* How It Works */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 stagger-children">
              {[
                { step: "1", title: pageT.step1Title, desc: pageT.step1Desc },
                { step: "2", title: pageT.step2Title, desc: pageT.step2Desc },
                { step: "3", title: pageT.step3Title, desc: pageT.step3Desc },
                { step: "4", title: pageT.step4Title, desc: pageT.step4Desc },
              ].map((item, index) => (
                <div key={index} className="text-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover-lift">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-md">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-605 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Prayer Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-12 animate-scale-in border border-gray-100 dark:border-gray-700/50">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {pageT.formTitle}
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-gray-750 dark:text-gray-300 font-bold mb-2">
                    {pageT.name}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all font-semibold"
                    placeholder={pageT.name}
                  />
                </div>

                <div>
                  <label className="block text-gray-750 dark:text-gray-300 font-bold mb-2">
                    {pageT.email}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all font-semibold"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-755 dark:text-gray-300 font-bold mb-2">
                    {pageT.category}
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all font-semibold">
                    <option>{pageT.categoryPlaceholder}</option>
                    <option>{pageT.healing}</option>
                    <option>{pageT.family}</option>
                    <option>{pageT.finance}</option>
                    <option>{pageT.growth}</option>
                    <option>{pageT.guidance}</option>
                    <option>{pageT.thanksgiving}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-755 dark:text-gray-300 font-bold mb-2">
                    {pageT.request}
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all"
                    placeholder={pageT.request}
                  ></textarea>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    className="mt-1 w-5 h-5 text-[hsl(var(--primary))] rounded focus:ring-[hsl(var(--primary))]"
                  />
                  <label htmlFor="anonymous" className="text-gray-750 dark:text-gray-300 font-semibold select-none">
                    {pageT.anonymous}
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-xl font-semibold shadow-lg shadow-[hsl(var(--primary))/0.2] hover:shadow-[hsl(var(--primary))/0.4] transition-all duration-300 hover:scale-[1.02] hover-lift"
                >
                  {pageT.submit}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 stagger-children">
              {/* Phone Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-8 text-center shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-extrabold text-gray-955 dark:text-white tracking-tight leading-none mb-1">
                  <a href="tel:+919640943777" className="hover:text-[hsl(var(--primary))] transition-colors">
                    +91 96409 43777
                  </a>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mt-1.5">
                  {pageT.callTitle.toUpperCase()}
                </span>
              </div>

              {/* Email Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-8 text-center shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-purple-500/20">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xs font-extrabold text-gray-955 dark:text-white tracking-tight leading-none mb-1 break-all">
                  <a href="mailto:kingofchristministries23@gmail.com" className="hover:text-[hsl(var(--primary))] transition-colors">
                    kingofchristministries23@gmail.com
                  </a>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mt-1.5">
                  {pageT.emailTitle.toUpperCase()}
                </span>
              </div>

              {/* 24/7 Prayer Support Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-8 text-center shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 flex flex-col items-center justify-center sm:col-span-2 md:col-span-1">
                <div className="w-14 h-14 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-rose-500/20 animate-pulse-slow">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-black text-gray-955 dark:text-white tracking-tight leading-none mb-1">
                  24/7
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mt-1.5">
                  PRAYER SUPPORT
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Prayer Meeting Times */}
      <section className="py-16 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-fade-in-up">
              {pageT.meetingsTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left mb-8">
              <div 
                onClick={() => {
                  sessionStorage.setItem("pending-contact-branch", "subhash");
                  window.location.href = "/#contact";
                }}
                className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-md hover-lift cursor-pointer group/loc"
              >
                <h3 className="font-bold text-white mb-2 flex justify-between items-center">
                  <span>{pageT.thursday}</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-normal text-white opacity-0 group-hover/loc:opacity-100 transition-opacity">
                    View Map
                  </span>
                </h3>
                <p className="text-white/80">Subhash Nagar Location</p>
              </div>
              <div 
                onClick={() => {
                  sessionStorage.setItem("pending-contact-branch", "bahadur");
                  window.location.href = "/#contact";
                }}
                className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-md hover-lift cursor-pointer group/loc"
              >
                <h3 className="font-bold text-white mb-2 flex justify-between items-center">
                  <span>{pageT.tuesday}</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-normal text-white opacity-0 group-hover/loc:opacity-100 transition-opacity">
                    View Map
                  </span>
                </h3>
                <p className="text-white/80">Bahadurpally Location</p>
              </div>
            </div>
            <Link
              href="/#contact"
              className="inline-block px-8 py-4 bg-white text-[hsl(var(--primary))] rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] hover-lift"
            >
              {t.links.contact}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
