"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Church, Users, Heart, MapPin, Sparkles, Quote, Calendar, Award, Globe, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";

export default function OurStoryPage() {
  const { t } = useLanguage();
  const pageT = t.pages.story;

  const stats = [
    { value: "20+", label: pageT.statYears || "Years of Faith", icon: Calendar, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 dark:bg-purple-500/20" },
    { value: "3", label: pageT.statLocations || "Church Locations", icon: MapPin, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10 dark:bg-indigo-500/20" },
    { value: "1000+", label: pageT.statMembers || "Active Believers", icon: Users, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-500/10 dark:bg-pink-500/20" },
    { value: "50+", label: pageT.statOutreaches || "Annual Outreaches", icon: Globe, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 dark:bg-emerald-500/20" },
  ];

  const journeySteps = [
    {
      step: "01",
      title: pageT.foundationTitle,
      desc: pageT.foundationDesc,
      icon: Church,
      color: "text-purple-600 dark:text-purple-300",
      bg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/20 dark:border-purple-400/30",
      accent: "from-purple-500 to-indigo-500"
    },
    {
      step: "02",
      title: pageT.growthTitle,
      desc: pageT.growthDesc,
      icon: MapPin,
      color: "text-indigo-600 dark:text-indigo-300",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20 dark:border-indigo-400/30",
      accent: "from-indigo-500 to-cyan-500"
    },
    {
      step: "03",
      title: pageT.communityTitle,
      desc: pageT.communityDesc,
      icon: Users,
      color: "text-pink-600 dark:text-pink-300",
      bg: "bg-pink-500/10 dark:bg-pink-500/20 border-pink-500/20 dark:border-pink-400/30",
      accent: "from-pink-500 to-rose-500"
    },
    {
      step: "04",
      title: pageT.missionTitle,
      desc: pageT.missionDesc,
      icon: Heart,
      color: "text-emerald-600 dark:text-emerald-300",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20 dark:border-emerald-400/30",
      accent: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      
      {/* 🌌 Hero Section with Ambient Glows */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15" />
        <div className="hero-orb-1 opacity-70" />
        <div className="hero-orb-2 opacity-60" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <BackToHome label={pageT.backToHome || t.nav.home} />
            </div>
            
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-lg animate-bounce-in">
              <Church className="h-4 w-4 text-purple-300" />
              <span>{pageT.journey}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight animate-fade-in-up">
              {pageT.title}
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 animate-fade-in-up animate-delay-200 font-medium max-w-2xl mx-auto leading-relaxed">
              {pageT.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* 📊 Floating Stats Bar */}
      <section className="relative z-20 -mt-12 sm:-mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 📖 Story Narrative & Leadership Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Senior Pastor Portrait & Leadership Vision Card */}
            <div className="lg:col-span-5 animate-fade-in-up space-y-6">
              
              {/* Senior Pastor High-Definition Portrait Spotlight Card */}
              <div className="relative group bg-gradient-to-b from-purple-50 via-white to-purple-100/60 dark:from-purple-950/60 dark:via-slate-900/90 dark:to-slate-950 rounded-3xl overflow-hidden border border-purple-100 dark:border-purple-500/20 shadow-xl shadow-purple-900/5 dark:shadow-black/60 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500/40">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                
                {/* Pastor Portrait Container */}
                <div className="relative w-full h-[360px] sm:h-[400px] flex items-end justify-center pt-6 px-4 overflow-hidden">
                  <Image
                    src="/pastor.png"
                    alt="Bishop Kurra Kristhu Raju Garu"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-contain object-bottom drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  {/* Theme Adaptive Gradient Overlay for Text Legibility */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-900/60 dark:via-slate-900/20 dark:to-transparent pointer-events-none" />
                </div>

                {/* Name & Title Badge Bar */}
                <div className="relative z-10 p-6" style={{ backgroundColor: '#0f172a' }}>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full text-xs font-black uppercase tracking-wider mb-3">
                    <Sparkles className="h-3 w-3" style={{ color: '#fbbf24' }} />
                    <span style={{ color: '#fcd34d' }}>Senior Pastor &amp; Founder</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                    {pageT.beganPastor}
                  </h3>
                </div>
              </div>

              {/* Leadership Vision Quote Box */}
              <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-900/5 dark:shadow-black/40 overflow-hidden border border-purple-100 dark:border-purple-900/50">
                <Quote className="h-8 w-8 text-purple-600/40 dark:text-purple-400/40 mb-3" />
                <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-white bg-purple-600 dark:bg-purple-500 px-3 py-1 rounded-full mb-3 border border-purple-500 dark:border-purple-400">
                  {pageT.quoteTitle || "Leadership Vision"}
                </span>
                <p className="text-sm sm:text-base text-slate-800 dark:text-white italic leading-relaxed font-medium">
                  "{pageT.quoteText || "God called us with a vision to build a prayer-filled, loving community that reflects Christ's light across Hyderabad."}"
                </p>
              </div>

            </div>

            {/* Right Column: Detailed Story Narrative */}
            <div className="lg:col-span-7 animate-fade-in-up animate-delay-200">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-600 dark:bg-purple-500 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4" style={{ color: '#ffffff' }}>
                <Award className="h-3.5 w-3.5" style={{ color: '#ffffff' }} />
                <span>Our Heritage</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
                {pageT.began}
              </h2>

              <div className="space-y-6 text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                <div className="p-6 bg-white dark:bg-slate-900/60 rounded-2xl border-l-4 border-purple-600 dark:border-purple-500 shadow-sm border border-slate-200/60 dark:border-slate-800">
                  <p>
                    {pageT.beganP1Part1}
                    <strong className="text-purple-700 dark:text-purple-300 font-bold">{pageT.beganPastor}</strong>
                    {pageT.beganP1Part2}
                  </p>
                </div>

                <div className="p-6 bg-white dark:bg-slate-900/60 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
                  <p>
                    {pageT.beganP2}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🗺️ Milestone Journey Cards */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              {pageT.journey}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-children">
            {journeySteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="relative group bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.accent}`} />
                  
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 ${item.bg} border rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-7 w-7 ${item.color}`} />
                      </div>
                      <span className="text-4xl font-black text-slate-200 dark:text-slate-800 tracking-tighter">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🌟 Today & Impact Highlight Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/10 via-slate-900/5 to-indigo-900/10 dark:from-purple-950/40 dark:via-slate-900/60 dark:to-indigo-950/40 border border-purple-200/60 dark:border-purple-800/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                {pageT.today}
              </h2>

              <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-lg sm:text-xl mb-6">
                {pageT.todayP1Part1}
                <strong className="font-extrabold px-2.5 py-1 bg-purple-500/20 rounded-md border border-purple-400/30 text-purple-700 dark:text-purple-300" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                  "{pageT.todayMissionQuote}"
                </strong>
                {pageT.todayP1Part2}
              </p>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base sm:text-lg mb-8">
                {pageT.todayP2}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-purple-200/50 dark:border-purple-800/40">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>24/7 Prayer Support</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                  <span>3 Hyderabad Campuses</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <span>50+ Yearly Events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 Call to Action Section */}
      <section className="py-20 bg-slate-950 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight animate-fade-in-up">
              {pageT.join}
            </h2>

            <p className="text-lg sm:text-xl text-white/90 mb-10 animate-fade-in-up animate-delay-100 font-medium">
              {pageT.joinSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in animate-delay-200">
              <Link
                href="/membership"
                className="group px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2.5 shadow-lg"
              >
                <span>{pageT.becomeMember}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-purple-600" />
              </Link>
              
              <Link
                href="/#contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/25 text-white rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                {pageT.contactUs}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}