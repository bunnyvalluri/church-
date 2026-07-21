"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Heart, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Bell, 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  Quote, 
  MapPin, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";

export default function PrayerPage() {
  const { t } = useLanguage();
  const pageT = t.pages.prayer;

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    request: "",
    anonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { label: pageT.healing, icon: "🏥" },
    { label: pageT.family, icon: "👨‍👩‍👧‍👦" },
    { label: pageT.finance, icon: "💼" },
    { label: pageT.growth, icon: "🌱" },
    { label: pageT.guidance, icon: "🧭" },
    { label: pageT.thanksgiving, icon: "🙌" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate Network Request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      category: "",
      request: "",
      anonymous: false
    });
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* 🌌 Premium Dark Hero Banner (Standard Across Portal Pages) */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 bg-slate-950 text-white overflow-hidden">
        {/* Glow & Grid Overlays */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15" />
        <div className="hero-orb-1 opacity-70" />
        <div className="hero-orb-2 opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <BackToHome label={t.nav?.home || "Back to Home"} variant="glass" />
            </div>

            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-lg animate-bounce-in">
              <Heart className="h-4 w-4 text-rose-400 fill-rose-400/30 animate-pulse" />
              <span>{pageT.heroSubtitle}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight animate-fade-in-up">
              {pageT.title}
            </h1>

            <p className="text-lg sm:text-xl text-slate-200 animate-fade-in-up animate-delay-200 font-medium max-w-2xl mx-auto leading-relaxed">
              {pageT.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* 📖 Encouraging Scripture Floating Section */}
      <section className="relative -mt-12 sm:-mt-16 z-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-900/10 dark:shadow-black/40 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="w-14 h-14 shrink-0 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/30 text-white">
            <Quote className="w-7 h-7" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <p className="text-slate-900 dark:text-white text-base md:text-lg font-serif italic leading-relaxed mb-2 font-medium">
              &quot;{pageT.verseText || "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."}&quot;
            </p>
            <span className="inline-block text-xs font-extrabold text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/50 px-3 py-1 rounded-full uppercase tracking-wider">
              — {pageT.verseRef || "Philippians 4:6-7"}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">

            {/* Introduction */}
            <div className="text-center mb-14">
              <p className="text-lg md:text-xl text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {pageT.intro}
              </p>
            </div>

            {/* How It Works Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { 
                  step: "1", 
                  title: pageT.step1Title, 
                  desc: pageT.step1Desc, 
                  icon: <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                },
                { 
                  step: "2", 
                  title: pageT.step2Title, 
                  desc: pageT.step2Desc, 
                  icon: <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                },
                { 
                  step: "3", 
                  title: pageT.step3Title, 
                  desc: pageT.step3Desc, 
                  icon: <HeartHandshake className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                },
                { 
                  step: "4", 
                  title: pageT.step4Title, 
                  desc: pageT.step4Desc, 
                  icon: <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group"
                >
                  <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-600/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    {item.icon}
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.title}</h3>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Interactive Prayer Request Form / Success State */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl mb-16 relative overflow-hidden transition-all duration-300">
              
              {isSubmitted ? (
                /* Success Confirmation View */
                <div className="py-10 text-center animate-fade-in space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 animate-bounce-in" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {pageT.successTitle || "Prayer Request Received!"}
                  </h3>

                  <p className="text-slate-700 dark:text-slate-300 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
                    {pageT.successMessage || "Thank you for sharing your prayer request. Our prayer team will stand with you in faith and lift you up in prayer."}
                  </p>

                  <div className="pt-4 flex justify-center">
                    <button
                      onClick={handleReset}
                      className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>{pageT.submitAnother || "Submit Another Request"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Form View */
                <>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-3 bg-purple-100 dark:bg-purple-950/60 rounded-2xl text-purple-600 dark:text-purple-400">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {pageT.formTitle}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {pageT.promise}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-2">
                          {pageT.name} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium"
                          placeholder={pageT.name}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-2">
                          {pageT.email} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    {/* Quick Category Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-bold text-slate-900 dark:text-slate-200">
                          {pageT.category} <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-xs text-purple-700 dark:text-purple-400 font-bold">
                          {pageT.quickSelect || "Quick Select"}
                        </span>
                      </div>

                      {/* Category Chips */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {categories.map((cat, idx) => {
                          const isActive = formData.category === cat.label;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFormData({ ...formData, category: cat.label })}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                                isActive
                                  ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/30 scale-105"
                                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 dark:hover:border-purple-700"
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Dropdown fallback */}
                      <select 
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm font-semibold cursor-pointer"
                      >
                        <option value="" disabled className="text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">{pageT.categoryPlaceholder}</option>
                        <option value={pageT.healing} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">{pageT.healing}</option>
                        <option value={pageT.family} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">{pageT.family}</option>
                        <option value={pageT.finance} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">{pageT.finance}</option>
                        <option value={pageT.growth} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">{pageT.growth}</option>
                        <option value={pageT.guidance} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">{pageT.guidance}</option>
                        <option value={pageT.thanksgiving} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">{pageT.thanksgiving}</option>
                      </select>
                    </div>

                    {/* Prayer Request Input */}
                    <div>
                      <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-2">
                        {pageT.request} <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={formData.request}
                        onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium leading-relaxed"
                        placeholder={pageT.request}
                      ></textarea>
                    </div>

                    {/* Anonymous Checkbox */}
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={formData.anonymous}
                        onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                        className="w-5 h-5 text-purple-600 rounded border-slate-300 dark:border-slate-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                      />
                      <label htmlFor="anonymous" className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold select-none cursor-pointer flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        <span>{pageT.anonymous}</span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{pageT.submitting || "Submitting Request..."}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>{pageT.submit}</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              
              {/* Phone Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between group">
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                
                <div className="mb-4 space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                    <a href="tel:+919704090069" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      +91 97040 90069
                    </a>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <a href="tel:+919640943777" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      +91 96409 43777
                    </a>
                    {" • "}
                    <a href="tel:+917396433856" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      +91 73964 33856
                    </a>
                  </p>
                </div>

                <a 
                  href="tel:+919704090069"
                  className="w-full py-2.5 px-4 bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{pageT.callAction || "Call Now"}</span>
                </a>
              </div>

              {/* Email Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between group">
                <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white break-all mb-1">
                    <a href="mailto:kingofchristministries23@gmail.com" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      kingofchristministries23@gmail.com
                    </a>
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {pageT.emailTitle}
                  </span>
                </div>

                <a 
                  href="mailto:kingofchristministries23@gmail.com"
                  className="w-full py-2.5 px-4 bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{pageT.emailAction || "Send Email"}</span>
                </a>
              </div>

              {/* 24/7 Prayer Support Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between sm:col-span-2 md:col-span-1 group">
                <div className="w-14 h-14 bg-gradient-to-tr from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 text-white animate-pulse" />
                </div>
                
                <div className="mb-4">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                    24/7
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {pageT.supportTitle}
                  </span>
                </div>

                <a 
                  href="tel:+919704090069"
                  className="w-full py-2.5 px-4 bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{pageT.supportDesc}</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 🌌 Prayer Meetings Section - Light & Dark Mode Compatible */}
      <section className="py-20 bg-purple-50/70 dark:bg-slate-950 border-t border-purple-100 dark:border-slate-900 transition-colors duration-300 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight">
              {pageT.meetingsTitle}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left mb-10">
              <div 
                onClick={() => {
                  sessionStorage.setItem("pending-contact-branch", "subhash");
                  window.location.href = "/#contact";
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 rounded-3xl p-6 shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-300 group/loc"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-full text-xs font-extrabold">
                    {pageT.thursday}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>{pageT.viewMap || "View Map"}</span>
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-1">
                  {pageT.subhashLoc || "Subhash Nagar Location"}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Kingdom of Christ Ministries, Subhash Nagar
                </p>
              </div>

              <div 
                onClick={() => {
                  sessionStorage.setItem("pending-contact-branch", "bahadur");
                  window.location.href = "/#contact";
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-3xl p-6 shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-300 group/loc"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-full text-xs font-extrabold">
                    {pageT.tuesday}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    <span>{pageT.viewMap || "View Map"}</span>
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-1">
                  {pageT.bahadurLoc || "Bahadurpally Location"}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Kingdom of Christ Ministries, Bahadurpally
                </p>
              </div>
            </div>

            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-2xl font-bold shadow-xl shadow-purple-600/25 hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              <span>{t.links.contact}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}