import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Music, Users, Baby, Heart, Mic, Camera, Coffee, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Volunteer | Kingdom of Christ Ministries",
  description: "Discover volunteer opportunities and serve at Kingdom of Christ Ministries",
};

export default function VolunteerPage() {
  const opportunities = [
    {
      title: "Worship Team",
      areas: ["Singers", "Musicians", "Sound technicians", "Media team"],
      icon: Music,
      color: "purple",
    },
    {
      title: "Children's Ministry",
      areas: ["Sunday School teachers", "Nursery helpers", "VBS volunteers", "Kids camp staff"],
      icon: Baby,
      color: "pink",
    },
    {
      title: "Hospitality",
      areas: ["Greeters", "Ushers", "Coffee team", "Setup crew"],
      icon: Coffee,
      color: "blue",
    },
    {
      title: "Technical Team",
      areas: ["Audio/Visual", "Live streaming", "Social media", "Photography"],
      icon: Camera,
      color: "indigo",
    },
    {
      title: "Outreach",
      areas: ["Community events", "Food distribution", "Medical camps", "Evangelism teams"],
      icon: Heart,
      color: "green",
    },
    {
      title: "Facilities",
      areas: ["Maintenance", "Cleaning", "Setup/Teardown", "Security"],
      icon: Wrench,
      color: "gray",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm mb-6 animate-bounce-in">
              <Heart className="h-4 w-4" />
              <span>Make a Difference</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              Volunteer
            </h1>
            <p className="text-xl text-purple-100 animate-fade-in-up animate-delay-200">
              Use your gifts to serve God and others
            </p>
          </div>
        </div>
      </section>

      {/* Why Volunteer */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Why Volunteer?
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              Volunteering is more than just helping out—it&apos;s about using your God-given gifts
              to make an eternal impact. When you serve, you grow in faith, build meaningful
              relationships, and experience the joy of being part of something bigger than yourself.
            </p>
          </div>

          {/* Opportunities */}
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Volunteer Opportunities
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {opportunities.map((opp, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover-lift card-flip"
                >
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
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
              How to Volunteer
            </h2>
            <div className="grid md:grid-cols-4 gap-6 stagger-children">
              {[
                { step: "1", title: "Fill Out Form", desc: "Complete volunteer application" },
                { step: "2", title: "Attend Orientation", desc: "Learn about our ministry" },
                { step: "3", title: "Get Trained", desc: "Receive area-specific training" },
                { step: "4", title: "Start Serving", desc: "Begin making an impact!" },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl animate-scale-in">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Volunteer Application
              </h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Area of Interest
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all">
                    <option>Select an area</option>
                    <option>Worship Team</option>
                    <option>Children's Ministry</option>
                    <option>Hospitality</option>
                    <option>Technical Team</option>
                    <option>Outreach</option>
                    <option>Facilities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Tell us about yourself
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Share your experience, skills, and why you want to volunteer..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 hover-lift"
                >
                  Submit Application
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
              Questions?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              we&apos;re here to help you find the perfect place to serve
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 hover-lift"
            >
              Contact Us
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

