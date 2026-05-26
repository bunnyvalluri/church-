"use client";

import Link from "next/link";
import { Heart, Phone, Mail, Clock } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function PrayerPage() {
  const { t } = useLanguage();
  const pageT = t.pages.prayer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-r from-[hsl(var(--primary-gradient-start))] to-[hsl(var(--primary-gradient-end))] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
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
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* Intro */}
            <div className="text-center mb-12 animate-fade-in-up">
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                {pageT.intro}
              </p>
            </div>

            {/* How It Works */}
            <div className="grid md:grid-cols-4 gap-6 mb-16 stagger-children">
              {[
                { step: "1", title: pageT.step1Title, desc: pageT.step1Desc },
                { step: "2", title: pageT.step2Title, desc: pageT.step2Desc },
                { step: "3", title: pageT.step3Title, desc: pageT.step3Desc },
                { step: "4", title: pageT.step4Title, desc: pageT.step4Desc },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary-gradient-start))] to-[hsl(var(--primary-gradient-end))] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Prayer Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-12 animate-scale-in">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {pageT.formTitle}
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    {pageT.name}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all"
                    placeholder={pageT.name}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    {pageT.email}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    {pageT.category}
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all">
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
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    {pageT.request}
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all"
                    placeholder={pageT.request}
                  ></textarea>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    className="mt-1 w-5 h-5 text-[hsl(var(--primary))] rounded focus:ring-[hsl(var(--primary))]"
                  />
                  <label htmlFor="anonymous" className="text-gray-700 dark:text-gray-300">
                    {pageT.anonymous}
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-[hsl(var(--primary-gradient-start))] to-[hsl(var(--primary-gradient-end))] text-white rounded-xl font-semibold shadow-lg shadow-[hsl(var(--primary))/0.2] hover:shadow-[hsl(var(--primary))/0.4] transition-all duration-300 hover:scale-105 hover-lift"
                >
                  {pageT.submit}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-3 gap-6 stagger-children">
              <div className="bg-gradient-to-br from-[hsl(var(--primary))/0.04] to-[hsl(var(--primary-gradient-end))/0.04] dark:from-[hsl(var(--primary))/0.1] dark:to-[hsl(var(--primary-gradient-end))/0.1] border border-[hsl(var(--primary))/0.08] rounded-xl p-6 text-center">
                <Phone className="h-8 w-8 text-[hsl(var(--primary))] mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{pageT.callTitle}</h3>
                <a href="tel:+919640943777" className="text-[hsl(var(--primary))] hover:underline">
                  +91 96409 43777
                </a>
              </div>

              <div className="bg-gradient-to-br from-[hsl(var(--primary))/0.04] to-[hsl(var(--primary-gradient-end))/0.04] dark:from-[hsl(var(--primary))/0.1] dark:to-[hsl(var(--primary-gradient-end))/0.1] border border-[hsl(var(--primary))/0.08] rounded-xl p-6 text-center">
                <Mail className="h-8 w-8 text-[hsl(var(--primary))] mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{pageT.emailTitle}</h3>
                <a href="mailto:kingofchristministries23@gmail.com" className="text-[hsl(var(--primary))] hover:underline">
                  kingofchristministries23@gmail.com
                </a>
              </div>

              <div className="bg-gradient-to-br from-[hsl(var(--primary))/0.04] to-[hsl(var(--primary-gradient-end))/0.04] dark:from-[hsl(var(--primary))/0.1] dark:to-[hsl(var(--primary-gradient-end))/0.1] border border-[hsl(var(--primary))/0.08] rounded-xl p-6 text-center">
                <Clock className="h-8 w-8 text-[hsl(var(--primary))] mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{pageT.supportTitle}</h3>
                <p className="text-gray-600 dark:text-gray-400">{pageT.supportDesc}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Prayer Meeting Times */}
      <section className="py-16 bg-gradient-to-r from-[hsl(var(--primary-gradient-start))] to-[hsl(var(--primary-gradient-end))]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {pageT.meetingsTitle}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="font-bold text-white mb-2">{pageT.thursday}</h3>
                <p className="text-white/80">Subhash Nagar Location</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="font-bold text-white mb-2">{pageT.tuesday}</h3>
                <p className="text-white/80">Bahadurpally Location</p>
              </div>
            </div>
            <Link
              href="/#contact"
              className="inline-block px-8 py-4 bg-white text-[hsl(var(--primary))] rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 hover-lift"
            >
              {t.links.contact}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
