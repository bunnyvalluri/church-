"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Users, Heart, Shield, Award, ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MembershipPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-all text-sm font-medium hover:-translate-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Home
              </a>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up font-serif">
              {t.pages.membership.title}
            </h1>
            <p className="text-xl text-purple-100 animate-fade-in-up animate-delay-200 font-light">
              {t.pages.membership.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 font-serif">
              {t.pages.membership.whyTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 font-light">
              {t.pages.membership.whyDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {[
              { title: t.pages.membership.belongingTitle, desc: t.pages.membership.belongingDesc, icon: Users },
              { title: t.pages.membership.growthTitle, desc: t.pages.membership.growthDesc, icon: Award },
              { title: t.pages.membership.serviceTitle, desc: t.pages.membership.serviceDesc, icon: Heart },
              { title: t.pages.membership.coveringTitle, desc: t.pages.membership.coveringDesc, icon: Shield },
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover-lift text-center">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-serif">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Process */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16 font-serif">
              {t.pages.membership.stepsTitle}
            </h2>
            <div className="space-y-12">
              {[
                {
                  step: 1,
                  title: t.pages.membership.step1Title,
                  desc: t.pages.membership.step1Desc
                },
                {
                  step: 2,
                  title: t.pages.membership.step2Title,
                  desc: t.pages.membership.step2Desc
                },
                {
                  step: 3,
                  title: t.pages.membership.step3Title,
                  desc: t.pages.membership.step3Desc
                },
                {
                  step: 4,
                  title: t.pages.membership.step4Title,
                  desc: t.pages.membership.step4Desc
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-6 md:gap-8 items-start">
                  <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 font-serif">
                      {item.title}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Membership Commitment */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center font-serif">
                {t.pages.membership.covenantTitle}
              </h3>
              <div className="space-y-4 mb-8">
                {[
                  t.pages.membership.covenant1,
                  t.pages.membership.covenant2,
                  t.pages.membership.covenant3,
                  t.pages.membership.covenant4,
                ].map((text, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 font-light">{text}</span>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full md:w-auto hover-lift"
                >
                  {t.pages.membership.signup}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
                <p className="mt-4 text-sm text-gray-500">
                  {t.pages.membership.loginPrompt} <Link href="/login" className="text-purple-600 hover:underline">{t.pages.membership.login}</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
