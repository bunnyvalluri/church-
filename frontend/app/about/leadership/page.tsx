import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, User, Heart, Book, Users, ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Leadership | Kingdom of Christ Ministries",
  description: "Meet our pastoral team and ministry leaders at Kingdom of Christ Ministries",
};

export default function LeadershipPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <Navbar />
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm mb-6 animate-bounce-in">
              <Users className="h-4 w-4" />
              <span>Our Leaders</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              Leadership
            </h1>
            <p className="text-xl text-purple-100 animate-fade-in-up animate-delay-200">
              Shepherds called to serve God's people
            </p>
          </div>
        </div>
      </section>

      {/* Senior Pastor Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">

            {/* Senior Pastor */}
            <div className="mb-20 animate-fade-in-up">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Senior Pastor
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-gradient-start to-gradient-end mx-auto rounded-full"></div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-3xl p-8 md:p-12 shadow-xl">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* Photo */}
                  <div className="w-48 h-48 rounded-full overflow-hidden flex-shrink-0 shadow-2xl border-4 border-white dark:border-gray-800 relative bg-slate-900">
                    <img
                      src="/pastor.png"
                      alt="Bishop Kurra Kristhu Raju"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      Bishop Kurra Kristhu Raju
                    </h3>
                    <p className="text-xl text-purple-600 dark:text-purple-400 mb-6">
                      Senior Pastor & Founder
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      Bishop Kurra Kristhu Raju has been serving in ministry with unwavering dedication.
                      His passion for souls and commitment to God's Word has transformed countless lives
                      across Hyderabad and beyond.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Vision</h4>
                      <p className="text-gray-700 dark:text-gray-300 italic">
                        "To build a church where every person experiences God's love, grows in faith,
                        and serves with purpose."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ministry Leaders */}
            <div className="animate-fade-in-up animate-delay-200">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Ministry Leaders
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Dedicated servants leading our various ministries
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 stagger-children">
                {/* Worship Ministry */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover-lift card-flip">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Heart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Worship Ministry
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    Leading our congregation in powerful worship experiences
                  </p>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-500">Ministry Leader</p>
                  </div>
                </div>

                {/* Youth Ministry */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover-lift card-flip">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Youth Ministry
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    Empowering the next generation for Christ
                  </p>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-500">Ministry Leader</p>
                  </div>
                </div>

                {/* Women's Ministry */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover-lift card-flip">
                  <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Women's Ministry
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    Building strong, faith-filled women
                  </p>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-500">Ministry Leader</p>
                  </div>
                </div>

                {/* Men's Ministry */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover-lift card-flip">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Men's Ministry
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    Equipping men to be spiritual leaders
                  </p>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-500">Ministry Leader</p>
                  </div>
                </div>

                {/* Children's Ministry */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover-lift card-flip">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Children's Ministry
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    Teaching children about Jesus in fun, engaging ways
                  </p>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-500">Ministry Leader</p>
                  </div>
                </div>

                {/* Prayer Ministry */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover-lift card-flip">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Book className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Prayer Ministry
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    Interceding for our church family 24/7
                  </p>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-500">Ministry Leader</p>
                  </div>
                </div>
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
              Serve With Us
            </h2>
            <p className="text-xl text-purple-100 mb-8 animate-fade-in-up animate-delay-100">
              Discover your calling and join our ministry team
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in animate-delay-200">
              <Link
                href="/get-involved/volunteer"
                className="group px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 hover-lift"
              >
                Volunteer
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
