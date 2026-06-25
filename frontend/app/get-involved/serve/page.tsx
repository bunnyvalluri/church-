import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HandHeart, Mic, Music, Camera, Users, Baby, Car, Coffee, ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Serve | Kingdom of Christ Ministries",
  description: "Use your gifts to serve God and our community.",
};

export default function ServePage() {
  const teams = [
    {
      title: "Worship Team",
      description: "Musicians and vocalists who lead the congregation in praise and worship.",
      icon: Music,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Media & Tech",
      description: "Operate cameras, sound, lighting, and livestreaming equipment.",
      icon: Camera,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Kids Ministry",
      description: "Teach and care for children, helping them learn about Jesus in a fun way.",
      icon: Baby,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Welcome Team",
      description: "Greeters and ushers who make everyone feel at home from the moment they arrive.",
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Hospitality",
      description: "Prepare coffee and refreshments for fellowship times.",
      icon: Coffee,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Transportation",
      description: "Help transport members who don't have vehicles to and from services.",
      icon: Car,
      color: "bg-red-100 text-red-600",
    },
  ];

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
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              Serve with Us
            </h1>
            <p className="text-xl text-purple-100 animate-fade-in-up animate-delay-200">
              Use your gifts to make a difference
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
              <HandHeart className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Why Serve?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Serving is not just about volunteering your time; it's about using the unique gifts God has given you to build His Kingdom. When we serve, we reflect the heart of Jesus, who came not to be served, but to serve.
            </p>
          </div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Ministry Teams
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teams.map((team, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover-lift">
                <div className={`w-16 h-16 ${team.color} dark:bg-opacity-20 rounded-2xl flex items-center justify-center mb-6`}>
                  <team.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {team.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {team.description}
                </p>
                <Link
                  href="/get-involved/volunteer"
                  className="inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold hover:gap-2 transition-all"
                >
                  Join Team <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12">
              How to Get Started
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Sign Up", desc: "Fill out the volunteer interest form." },
                { step: "2", title: "Meet", desc: "Chat with a ministry leader about your interests." },
                { step: "3", title: "Serve", desc: "Start serving and making an impact!" },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="w-16 h-16 bg-white border-4 border-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600 mx-auto mb-4 relative z-10">
                    {item.step}
                  </div>
                  {index !== 2 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-0" />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Serve?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              We'd love to help you find your place in our church family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-involved/volunteer"
                className="group px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 hover-lift"
              >
                Volunteer Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
