"use client";

import { Play, Calendar, User, Eye, X } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getLatestSermons } from "@/app/actions/sermons";
import { useLanguage } from "@/components/providers/LanguageProvider";

// 1. Fallback data in case the database is completely empty (for new setups)
const fallbackSermons = [
  {
    title: "The Power of Faith",
    pastor: "Pastor John David",
    date: "Jan 21, 2026",
    views: "1.2K",
    thumbnail: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&q=80",
    duration: "45:30",
    category: "Faith",
    videoId: "M57yrL-0tSs",
  },
  {
    title: "Walking in Love",
    pastor: "Pastor Sarah Johnson",
    date: "Jan 14, 2026",
    views: "980",
    thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80",
    duration: "38:15",
    category: "Love",
    videoId: "wz0z7-6-m1Q",
  },
  {
    title: "Hope in Difficult Times",
    pastor: "Pastor John David",
    date: "Jan 7, 2026",
    views: "1.5K",
    thumbnail: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
    duration: "42:00",
    category: "Hope",
    videoId: "F7U5d9W8Z8k",
  },
  {
    title: "The Grace of God",
    pastor: "Pastor Michael Brown",
    date: "Dec 31, 2025",
    views: "2.1K",
    thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80",
    duration: "50:20",
    category: "Grace",
    videoId: "K-C2O7bEopg",
  },
  {
    title: "Living with Purpose",
    pastor: "Pastor Sarah Johnson",
    date: "Dec 24, 2025",
    views: "1.8K",
    thumbnail: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80",
    duration: "44:45",
    category: "Purpose",
    videoId: "J_M37s4w1oA",
  },
  {
    title: "The Joy of Salvation",
    pastor: "Pastor John David",
    date: "Dec 17, 2025",
    views: "1.3K",
    thumbnail: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
    duration: "39:30",
    category: "Salvation",
    videoId: "T4b-I5D-ksw",
  },
];

export default function Sermons() {
  const { t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  // 2. State to hold our dynamic database sermons
  const [sermons, setSermons] = useState<any[]>(fallbackSermons);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Fetch from Postgres on component mount
  useEffect(() => {
    async function fetchSermonsFromDatabase() {
      try {
        const dbSermons = await getLatestSermons();
        
        // If the database has actual sermons, format them and use them!
        if (dbSermons && dbSermons.length > 0) {
          const formattedSermons = dbSermons.map((s) => ({
            title: s.title,
            pastor: s.pastor,
            date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            views: s.views >= 1000 ? (s.views / 1000).toFixed(1) + 'K' : s.views.toString(),
            thumbnail: s.thumbnail || fallbackSermons[0].thumbnail, // Safe fallback for images
            duration: "45:00", // Defaulting duration as it's not currently in schema
            category: s.category,
            // Extract YouTube ID from full URL, or fallback
            videoId: s.videoUrl?.includes('v=') ? s.videoUrl.split('v=')[1].split('&')[0] : (s.videoUrl || fallbackSermons[0].videoId),
          }));
          
          setSermons(formattedSermons);
        }
      } catch (error) {
        console.error("Failed to load dynamic sermons, defaulting to fallback UI.", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSermonsFromDatabase();
  }, []);

  return (
    <section id="sermons" className="py-24 bg-white dark:bg-transparent relative z-10 transition-colors duration-300">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight">
            {t.sermons.title.split(" ")[0]}{" "}
            <span className="text-gradient">{t.sermons.title.split(" ").slice(1).join(" ")}</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-white/70">
            {t.sermons.subtitle}
          </p>
        </div>

        {/* Sermons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-white/[0.01] rounded-3xl overflow-hidden border border-slate-100 dark:border-white/[0.05] p-0 flex flex-col h-full animate-pulse shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                >
                  {/* Image Placeholder */}
                  <div className="w-full h-48 bg-slate-200 dark:bg-white/[0.03] relative" />
                  {/* Content Placeholder */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title Placeholder */}
                      <div className="h-6 bg-slate-200 dark:bg-white/[0.03] rounded-xl w-5/6 mb-3" />
                      <div className="h-6 bg-slate-200 dark:bg-white/[0.03] rounded-xl w-2/3 mb-6" />
                      {/* Meta Info Placeholders */}
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-200 dark:bg-white/[0.03] rounded-lg w-1/2" />
                        <div className="h-4 bg-slate-200 dark:bg-white/[0.03] rounded-lg w-2/3" />
                      </div>
                    </div>
                    {/* Button Placeholder */}
                    <div className="h-11 bg-slate-200 dark:bg-white/[0.03] rounded-xl w-full mt-6" />
                  </div>
                </div>
              ))
            : sermons.map((sermon, index) => (
                <div
                  key={index}
                  className="group bg-slate-50 dark:bg-white/[0.02] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-2xl dark:hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 border border-slate-100 dark:border-white/[0.05] dark:backdrop-blur-3xl"
                >
              {/* Thumbnail */}
              <div
                className="relative h-48 overflow-hidden cursor-pointer"
                onClick={() => setSelectedVideo(sermon.videoId)}
              >
                <Image
                  src={sermon.thumbnail || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80"}
                  alt={sermon.title}
                  fill
                  loading="lazy"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-8 w-8 text-[hsl(var(--primary))] ml-1" fill="currentColor" />
                  </div>
                </div>
                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded">
                  {sermon.duration}
                </div>
                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-[hsl(var(--primary))] text-white text-xs font-semibold rounded-full">
                  {sermon.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight group-hover:text-[hsl(var(--primary))] dark:group-hover:text-[hsl(var(--primary))] transition-colors">
                  {sermon.title}
                </h3>

                {/* Meta Info */}
                <div className="space-y-3 text-sm text-slate-600 dark:text-white/70 font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[hsl(var(--primary))]" />
                    <span>{sermon.pastor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[hsl(var(--primary))]" />
                      <span>{sermon.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-[hsl(var(--primary))]" />
                      <span>{sermon.views} {t.sermons.views}</span>
                    </div>
                  </div>
                </div>

                {/* Watch Button */}
                <button
                  onClick={() => setSelectedVideo(sermon.videoId)}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <Play className="h-5 w-5" fill="currentColor" />
                  {t.sermons.watch}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Sermons */}
        <div className="mt-16 text-center">
          <a
            href="/sermons"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] dark:from-white/10 dark:to-white/5 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:hover:bg-white/20 text-white rounded-2xl font-bold tracking-wide shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
          >
            {t.sermons.viewAll}
          </a>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Video Player (Placeholder) */}
            <div className="relative pt-[56.25%] bg-gray-900">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="Sermon Video"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
