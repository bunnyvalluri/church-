"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Music, Users, Baby, Heart, Camera, Coffee, Wrench, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";

export default function VolunteerClientPage() {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const opportunities = [
    {
      title: !mounted
        ? "Worship Team"
        : language === "te"
        ? "ఆరాధన బృందం"
        : language === "hi"
        ? "आराधना टीम"
        : "Worship Team",
      areas: !mounted ? ["Singers", "Musicians", "Sound technicians", "Media team"] : t.pages.volunteer.worshipAreas,
      icon: Music,
      color: "purple",
    },
    {
      title: !mounted
        ? "Children's Ministry"
        : language === "te"
        ? "పిల్లల పరిచర్య"
        : language === "hi"
        ? "बाल मंत्रालय"
        : "Children's Ministry",
      areas: !mounted ? ["Sunday School teachers", "Nursery helpers", "VBS volunteers", "Kids camp staff"] : t.pages.volunteer.childrenAreas,
      icon: Baby,
      color: "pink",
    },
    {
      title: !mounted ? "Hospitality" : t.pages.volunteer.hospitalityTitle,
      areas: !mounted ? ["Greeters", "Ushers", "Coffee team", "Setup crew"] : t.pages.volunteer.hospitalityAreas,
      icon: Coffee,
      color: "blue",
    },
    {
      title: !mounted ? "Technical Team" : t.pages.volunteer.techTitle,
      areas: !mounted ? ["Audio/Visual", "Live streaming", "Social media", "Photography"] : t.pages.volunteer.techAreas,
      icon: Camera,
      color: "indigo",
    },
    {
      title: !mounted
        ? "Outreach"
        : language === "te"
        ? "అవుట్‌రీచ్ పరిచర్య"
        : language === "hi"
        ? "आउटरीच मंत्रालय"
        : "Outreach",
      areas: !mounted ? ["Community events", "Food distribution", "Medical camps", "Evangelism teams"] : t.pages.volunteer.outreachAreas,
      icon: Heart,
      color: "green",
    },
    {
      title: !mounted ? "Facilities" : t.pages.volunteer.facilitiesTitle,
      areas: !mounted ? ["Maintenance", "Cleaning", "Setup/Teardown", "Security"] : t.pages.volunteer.facilitiesAreas,
      icon: Wrench,
      color: "gray",
    },
  ];

  const steps = [
    {
      step: "1",
      title: !mounted ? "Sign Up" : t.pages.volunteer.step1,
      desc: !mounted ? "Fill out the form below" : t.pages.volunteer.step1Desc,
    },
    {
      step: "2",
      title: !mounted ? "Meet" : t.pages.volunteer.step2,
      desc: !mounted ? "Meet with a leader" : t.pages.volunteer.step2Desc,
    },
    {
      step: "3",
      title: !mounted ? "Train" : t.pages.volunteer.step3,
      desc: !mounted ? "Get equipped to serve" : t.pages.volunteer.step3Desc,
    },
    {
      step: "4",
      title: !mounted ? "Serve" : t.pages.volunteer.step4,
      desc: !mounted ? "Start making a difference" : t.pages.volunteer.step4Desc,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      {/* Hero */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-24 bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <BackToHome />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm mb-6 animate-bounce-in">
              <Heart className="h-4 w-4 animate-pulse text-pink-300" />
              <span>
                {!mounted
                  ? "Make a Difference"
                  : language === "te"
                  ? "మార్పు తీసుకురండి"
                  : language === "hi"
                  ? "बदलाव लाएं"
                  : "Make a Difference"}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up font-display">
              {!mounted ? "Volunteer" : t.pages.volunteer.title}
            </h1>
            <p className="text-xl text-purple-100 animate-fade-in-up animate-delay-200">
              {!mounted ? "Serve God by serving others" : t.pages.volunteer.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Why Volunteer */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {!mounted ? "Why Volunteer?" : t.pages.volunteer.whyTitle}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              {!mounted ? "Volunteering is a great way to meet new people, grow in your faith, and make a difference." : t.pages.volunteer.whyDesc}
            </p>
          </div>

          {/* Opportunities */}
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              {!mounted ? "Volunteer Opportunities" : t.pages.volunteer.oppsTitle}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {opportunities.map((opp, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover-lift border border-gray-100 dark:border-gray-700 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 hover:rotate-12">
                    <opp.icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {opp.title}
                  </h3>
                  <ul className="space-y-2">
                    {opp.areas.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                        <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Volunteer */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              {!mounted ? "How to Volunteer" : t.pages.volunteer.howTitle}
            </h2>
            <div className="grid md:grid-cols-4 gap-6 stagger-children">
              {steps.map((item, index) => (
                <div key={index} className="text-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold shadow-md">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {!mounted ? "Volunteer Application" : t.pages.volunteer.formTitle}
              </h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      {!mounted ? "First Name" : t.pages.volunteer.fname}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                      placeholder={!mounted ? "First Name" : t.pages.volunteer.fname}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      {!mounted ? "Last Name" : t.pages.volunteer.lname}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                      placeholder={!mounted ? "Last Name" : t.pages.volunteer.lname}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    {!mounted ? "Email" : t.pages.volunteer.email}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    {!mounted ? "Phone" : t.pages.volunteer.phone}
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    {!mounted ? "Area of Interest" : t.pages.volunteer.area}
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all outline-none">
                    <option>{!mounted ? "Select an area" : t.pages.volunteer.areaPlaceholder}</option>
                    <option>{!mounted ? "Worship Team" : (language === "te" ? "ఆరాధన బృందం" : language === "hi" ? "आराधना टीम" : "Worship Team")}</option>
                    <option>{!mounted ? "Children's Ministry" : (language === "te" ? "పిల్లల పరిచర్య" : language === "hi" ? "बाल मंत्रालय" : "Children's Ministry")}</option>
                    <option>{!mounted ? "Hospitality" : t.pages.volunteer.hospitalityTitle}</option>
                    <option>{!mounted ? "Technical Team" : t.pages.volunteer.techTitle}</option>
                    <option>{!mounted ? "Outreach" : (language === "te" ? "అవుట్‌రీచ్ పరిచర్య" : language === "hi" ? "आउटरीच मंत्रालय" : "Outreach")}</option>
                    <option>{!mounted ? "Facilities" : t.pages.volunteer.facilitiesTitle}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    {!mounted ? "Tell us about yourself" : t.pages.volunteer.about}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                    placeholder={!mounted ? "Share your experience, skills, and why you want to volunteer..." : t.pages.volunteer.aboutPlaceholder}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover-lift"
                >
                  {!mounted ? "Submit Application" : t.pages.volunteer.submit}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {!mounted ? "Questions?" : t.pages.volunteer.questions}
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              {!mounted ? "We're here to help you find the perfect place to serve" : t.pages.volunteer.questionsDesc}
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 hover-lift"
            >
              {!mounted ? "Contact Us" : t.nav.contact}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}