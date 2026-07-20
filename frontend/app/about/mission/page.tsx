import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Target, Eye, Heart, Users, Book, Globe, ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";

export const metadata: Metadata = {
  title: "Mission & Vision | Kingdom of Christ Ministries",
  description: "Our mission, vision, and core values at Kingdom of Christ Ministries",
};

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      {/* Hero */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-24 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <BackToHome />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              Mission & Vision
            </h1>
            <p className="text-xl text-purple-100 animate-fade-in-up animate-delay-200">
              Our purpose and direction
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gradient-start to-gradient-end rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
              <Target className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Mission
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-8">
              "To know Christ and make Him known"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover-lift">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Worship</h3>
                <p className="text-gray-600 dark:text-gray-400">God with all our hearts</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover-lift">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Grow</h3>
                <p className="text-gray-600 dark:text-gray-400">Disciples who love Jesus</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover-lift">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Serve</h3>
                <p className="text-gray-600 dark:text-gray-400">Our community with compassion</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover-lift">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Reach</h3>
                <p className="text-gray-600 dark:text-gray-400">The lost with the Gospel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Vision
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-12">
              "A church where every person experiences transformation through Christ"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {[
                "A community where everyone belongs",
                "Believers growing in spiritual maturity",
                "Families strengthened in faith",
                "Lives transformed by God's power",
                "The Gospel reaching every neighborhood",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Core Values
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {[
                { icon: "🙏", title: "Prayer First", desc: "We seek God in everything" },
                { icon: "📖", title: "Bible-Based", desc: "Scripture guides our lives" },
                { icon: "❤️", title: "Love-Driven", desc: "We show Christ's love to all" },
                { icon: "🤝", title: "Community-Focused", desc: "We do life together" },
                { icon: "🌍", title: "Mission-Minded", desc: "We reach the lost" },
                { icon: "✨", title: "Spirit-Empowered", desc: "We depend on the Holy Spirit" },
              ].map((value, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center hover-lift shadow-lg">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Be part of something greater
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
