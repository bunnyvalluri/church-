"use client";

import Link from "next/link";
import { BookOpen, Video, Music, Image as ImageIcon, Download, Share2 } from "lucide-react";

export default function ResourcesPage() {
  const resources = [
    {
      title: "Sermons",
      description: "Watch or listen to life-changing messages from our services.",
      icon: Video,
      href: "/sermons",
      color: "bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))]",
    },
    {
      title: "Bible Study",
      description: "Deep dive into God's word with our study guides and materials.",
      icon: BookOpen,
      href: "/resources/bible-study",
      color: "bg-gradient-start/10 text-gradient-start",
    },
    {
      title: "Media Library",
      description: "Access worship music, photos, and event recordings.",
      icon: ImageIcon,
      href: "/resources/media",
      color: "bg-gradient-end/10 text-gradient-end",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6 animate-fade-in">
            Grow in Faith
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
            Resources for Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gradient-start to-gradient-end">Spiritual Journey</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 animate-fade-in-up animate-delay-100">
            Equip yourself with tools, teachings, and materials designed to help you know Christ more deeply.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <Link
                href={resource.href}
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className={`w-14 h-14 rounded-2xl ${resource.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <resource.icon className="w-7 h-7" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[hsl(var(--primary))] transition-colors">
                  {resource.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {resource.description}
                </p>

                <div className="flex items-center text-[hsl(var(--primary))] font-semibold group-hover:translate-x-2 transition-transform">
                  Explore <span className="ml-2">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Resource */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-gradient-start to-gradient-end rounded-3xl p-8 md:p-16 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BookOpen className="w-64 h-64" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Weekly Bible Study Guide</h2>
              <p className="text-xl text-white/80 mb-8">
                Download this week&apos;s study material on &ldquo;The Power of Prayer&rdquo; and follow along with your small group.
              </p>
              <button className="px-8 py-4 bg-white text-[hsl(var(--primary))] rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto">
                <Download className="w-5 h-5" />
                Download PDF Guide
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
