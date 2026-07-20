import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Book, Check, Heart, Cross, ChevronLeft } from "lucide-react";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Our Beliefs | Kingdom of Christ Ministries",
  description: "Core doctrines and values of Kingdom of Christ Ministries",
};

export default function BeliefsPage() {
  const beliefs = [
    {
      title: "The Bible",
      description: "We believe the Bible is the inspired, infallible Word of God and our ultimate authority for faith and practice.",
      icon: Book,
    },
    {
      title: "The Trinity",
      description: "We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit.",
      icon: Cross,
    },
    {
      title: "Salvation",
      description: "We believe salvation is a gift of God's grace, received through faith in Jesus Christ alone.",
      icon: Heart,
    },
    {
      title: "The Church",
      description: "We believe the Church is the body of Christ, called to worship God, make disciples, and serve the world.",
      icon: Heart,
    },
  ];

  const values = [
    { name: "Faith", description: "Trusting God in all circumstances", icon: "✝️" },
    { name: "Love", description: "Showing Christ's love to all", icon: "❤️" },
    { name: "Prayer", description: "Seeking God's presence continually", icon: "🙏" },
    { name: "Scripture", description: "Living by God's Word", icon: "📖" },
    { name: "Community", description: "Growing together in Christ", icon: "🤝" },
    { name: "Mission", description: "Reaching the lost for Jesus", icon: "🌍" },
  ];

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
              Our Beliefs
            </h1>
            <p className="text-xl text-purple-100 animate-fade-in-up animate-delay-200">
              The foundation of our faith
            </p>
          </div>
        </div>
      </section>

      {/* Core Doctrines */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center animate-fade-in-up">
              Core Doctrines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-children">
              {beliefs.map((belief, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover-lift">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                    <belief.icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {belief.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {belief.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Our Values
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {values.map((value, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center hover-lift">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {value.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
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
              Learn More
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Discover more about our church and ministries
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/about/story"
                className="group px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 hover-lift"
              >
                Our Story
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