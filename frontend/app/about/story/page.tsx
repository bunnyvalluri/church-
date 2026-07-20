"use client";

import Link from "next/link";
import { ArrowRight, Church, Users, Heart, MapPin, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";

export default function OurStoryPage() {
  console.log("useLanguage in story page:", typeof useLanguage, useLanguage);
  const { t } = useLanguage();
  const pageT = t.pages.story;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      {/* Hero Section */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-24 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <BackToHome />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm mb-6 animate-bounce-in">
              <Church className="h-4 w-4" />
              <span>{pageT.journey}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              {pageT.title}
            </h1>
            <p className="text-xl text-purple-100 animate-fade-in-up animate-delay-200">
              {pageT.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">

            {/* How It Began */}
            <div className="mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                How It All Began
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Kingdom of Christ Ministries was founded with a vision to spread the Gospel
                  and serve the community of Hyderabad. Under the leadership of <strong>Bishop Kurra
                    Kristhu Raju Garu</strong>, our church has grown from a small prayer group to a
                  thriving community of believers.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  What started as weekly prayer meetings in a humble setting has blossomed into
                  a multi-location ministry touching thousands of lives across Hyderabad. God's
                  faithfulness has been evident every step of the way.
                </p>
              </div>
            </div>

            {/* Our Journey */}
            <div className="mb-16 animate-fade-in-up animate-delay-200">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
                Our Journey
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 stagger-children">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover-lift">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                    <Church className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Foundation</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Started with weekly prayer meetings, gathering believers who shared a passion for worship and community.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover-lift">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Growth</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Expanded to three locations across Hyderabad: Shapur, Subhash Nagar, and Bahadurpally.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover-lift">
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Community</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Built a family of 1000+ active members who worship, serve, and grow together in Christ.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover-lift">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mission</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Reaching souls and transforming lives through Christ, one person at a time.
                  </p>
                </div>
              </div>
            </div>

            {/* Today */}
            <div className="mb-16 animate-fade-in-up animate-delay-300">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Today
              </h2>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">
                  We are a vibrant, multi-location church serving the communities of Shapur,
                  Subhash Nagar, and Bahadurpally. Our mission remains the same:
                  <strong className="text-purple-600 dark:text-purple-400"> to know Christ and make Him known</strong>.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  Every week, hundreds gather across our locations to worship, learn, and serve.
                  We offer prayer support 24/7, host over 50 events yearly, and continue to see
                  lives transformed by the power of the Gospel.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-fade-in-up">
              Join Our Story
            </h2>
            <p className="text-xl text-purple-100 mb-8 animate-fade-in-up animate-delay-100">
              Become part of our church family today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in animate-delay-200">
              <Link
                href="/membership"
                className="group px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 hover-lift"
              >
                Become a Member
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/#contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 hover-lift"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
