'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Download, Play, ExternalLink, Sparkles } from "lucide-react";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";
import { fetchBibleStudyResources, BibleStudyItem } from "@/lib/firecrawlClient";

export default function BibleStudyPage() {
  const [scrapedResources, setScrapedResources] = useState<BibleStudyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchBibleStudyResources();
        if (res.resources && res.resources.length > 0) {
          setScrapedResources(res.resources);
        }
      } catch (err) {
        console.warn('Failed to fetch Firecrawl Bible study resources:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const defaultStudies = [
    {
      title: "The Book of John",
      description: "A 12-week journey through the Gospel of John, exploring the divinity of Christ.",
      type: "Current Study",
      format: "Video + PDF",
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80"
    },
    {
      title: "Psalms for Daily Life",
      description: "Finding comfort, strength, and joy in the songs of the Bible.",
      type: "Devotional",
      format: "Audio + Guide",
      image: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800&q=80"
    },
    {
      title: "Romans: The Gospel Explained",
      description: "Understanding the foundations of our faith through Paul's letter to the Romans.",
      type: "Theology",
      format: "Study Guide",
      image: "https://images.unsplash.com/photo-1457449940276-e8deed18bfff?w=800&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="bg-blue-900 text-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 flex justify-center">
            <BackToHome />
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-800 mb-6">
            <BookOpen className="w-8 h-8 text-blue-200" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Bible Study & Devotionals</h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Deepen your understanding of Scripture with our curated guides and Firecrawl aggregated web resources.
          </p>
        </div>
      </div>

      {/* Live Firecrawl Aggregated Devotionals */}
      <section className="py-12 bg-slate-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6 text-sm font-mono text-indigo-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Aggregated Intelligence Devotionals (Firecrawl Scraped)
          </div>

          {scrapedResources.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center text-gray-500 text-sm">
              {loading ? "Loading aggregated Bible study resources..." : "No aggregated web devotionals currently cached. Visit Admin Firecrawl Hub to run a scrape sweep."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scrapedResources.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full inline-block">
                      {item.resourceType}
                    </span>
                    {item.scriptureRef && <span className="text-xs text-amber-500 font-mono ml-2">{item.scriptureRef}</span>}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">{item.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">{item.summary}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
                    <span className="text-gray-500">{item.author || "KCM Research"}</span>
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1">
                      Read Source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Primary Study Guides */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Curated Church Study Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {defaultStudies.map((study, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
                <div className="relative h-56">
                  <Image src={study.image} alt={study.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {study.type}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{study.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{study.description}</p>

                  <div className="flex flex-wrap gap-4">
                    <button className="flex-1 py-3 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                      <Download className="w-4 h-4" />
                      Guide
                    </button>
                    <button className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                      <Play className="w-4 h-4" />
                      Watch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}