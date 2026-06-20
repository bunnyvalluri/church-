"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Link from "next/link";
import { ArrowRight, Users, Heart, Coffee, BookOpen, Calendar } from "lucide-react";

export default function SmallGroupsPage() {
  const { t } = useLanguage();

  const groups = [
    {
      title: t.pages.smallGroups.youngAdults,
      description: t.pages.smallGroups.youngAdultsDesc,
      time: "Fridays at 7:00 PM",
      location: "Fellowship Hall",
      image: "👥",
    },
    {
      title: t.pages.smallGroups.women,
      description: t.pages.smallGroups.womenDesc,
      time: "Wednesdays at 10:00 AM",
      location: "Room 204",
      image: "🌸",
    },
    {
      title: t.pages.smallGroups.men,
      description: t.pages.smallGroups.menDesc,
      time: "Saturdays at 7:00 AM",
      location: "Main Sanctuary",
      image: "⚔️",
    },
    {
      title: t.pages.smallGroups.couples,
      description: t.pages.smallGroups.couplesDesc,
      time: "Monthly, 2nd Saturday",
      location: "Family Center",
      image: "💍",
    },
    {
      title: t.pages.smallGroups.bibleStudy,
      description: t.pages.smallGroups.bibleStudyDesc,
      time: "Thursdays at 6:30 PM",
      location: "Online (Zoom)",
      image: "📖",
    },
    {
      title: t.pages.smallGroups.prayer,
      description: t.pages.smallGroups.prayerDesc,
      time: "Tuesdays at 6:00 AM",
      location: "Prayer Room",
      image: "🙏",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up font-serif">
              {t.pages.smallGroups.title}
            </h1>
            <p className="text-xl text-purple-100 animate-fade-in-up animate-delay-200 font-light">
              {t.pages.smallGroups.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 font-serif">
              {t.pages.smallGroups.whyTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-12 font-light">
              {t.pages.smallGroups.whyDesc}
            </p>
            <div className="grid md:grid-cols-3 gap-8 stagger-children">
              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover-lift">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-serif">{t.pages.smallGroups.connectTitle}</h3>
                <p className="text-gray-500">{t.pages.smallGroups.connectDesc}</p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover-lift">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-serif">{t.pages.smallGroups.growTitle}</h3>
                <p className="text-gray-500">{t.pages.smallGroups.growDesc}</p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover-lift">
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-serif">{t.pages.smallGroups.supportTitle}</h3>
                <p className="text-gray-500">{t.pages.smallGroups.supportDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Groups List */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12 font-serif">
            {t.pages.smallGroups.find}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto stagger-children">
            {groups.map((group, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover-lift flex flex-col">
                <div className="h-32 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                  <span className="text-6xl">{group.image}</span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 font-serif">{group.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 flex-1 font-light">{group.description}</p>
                  <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400 border-t pt-4 border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      {group.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      {group.location}
                    </div>
                  </div>
                  <button className="mt-6 w-full py-2 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                    Join Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
              {t.pages.smallGroups.startTitle}
            </h2>
            <p className="text-xl text-purple-100 mb-8 font-light">
              {t.pages.smallGroups.startDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-involved/volunteer"
                className="group px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 hover-lift"
              >
                {t.pages.smallGroups.becomeLeader}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/#contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 hover-lift"
              >
                {t.links.contact}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
