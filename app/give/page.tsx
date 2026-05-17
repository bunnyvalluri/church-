"use client";

import Link from "next/link";
import { CreditCard, Building, Smartphone, Heart, Check } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function GivePage() {
  const { t } = useLanguage();
  const pageT = t.pages.give;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm mb-6 animate-bounce-in">
              <Heart className="h-4 w-4" />
              <span>Generous Giving</span>
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

      {/* Why We Give */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {pageT.why}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              Giving is an act of worship and obedience to God. Your generosity helps us:
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left stagger-children">
              {[
                "Spread the Gospel locally and globally",
                "Support ministries and programs",
                "Serve the community with compassion",
                "Build and maintain our facilities",
                "Train and equip leaders",
                "Reach the next generation",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Give */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              {pageT.ways}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 stagger-children">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover-lift text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Online Giving
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Secure, convenient online donations. One-time or recurring giving available.
                </p>
                <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Give Now
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover-lift text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Bank Transfer
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Direct bank transfer to our church account.
                </p>
                <div className="text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm">
                  <p className="text-gray-700 dark:text-gray-300 mb-1">
                    <strong>Account Name:</strong><br />Kingdom of Christ Ministries
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-1">
                    <strong>Account Number:</strong><br />[To be added]
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>IFSC Code:</strong><br />[To be added]
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover-lift text-center">
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  In-Person
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Give during any service at our locations.
                </p>
                <div className="text-left space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">• Shapur</p>
                  <p className="text-gray-700 dark:text-gray-300">• Subhash Nagar</p>
                  <p className="text-gray-700 dark:text-gray-300">• Bahadurpally</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Giving Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              {pageT.options}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 stagger-children">
              {[
                { title: "Tithes & Offerings", desc: "Regular giving to support church operations" },
                { title: "Building Fund", desc: "Help us expand and improve our facilities" },
                { title: "Missions", desc: "Support local and global mission work" },
                { title: "Benevolence", desc: "Help those in need in our community" },
                { title: "Special Projects", desc: "Contribute to specific ministry initiatives" },
                { title: "Youth Ministry", desc: "Invest in the next generation" },
              ].map((option, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover-lift">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{option.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tax Info */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Tax Receipts
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-8">
              All donations are tax-deductible. Receipts will be provided for your records.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              For questions about giving, contact us at{" "}
              <a href="mailto:finance@kingdomofchrist.org" className="text-purple-600 dark:text-purple-400 hover:underline">
                finance@kingdomofchrist.org
              </a>
              {" "}or call{" "}
              <a href="tel:+919640943777" className="text-purple-600 dark:text-purple-400 hover:underline">
                +91 96409 43777
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Thank You for Your Generosity
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Your giving makes a real difference in people's lives
            </p>
            <Link
              href="/#contact"
              className="inline-block px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 hover-lift"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

