"use client";

import { Play, Calendar, User, Eye, X } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import io from "socket.io-client";
import { getLatestSermons } from "@/app/actions/sermons";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion } from "framer-motion";
import SermonCard from "@/components/SermonCard";
import { useCallback } from "react";

const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80";

export default function Sermons({ initialSermons = [] }: { initialSermons?: any[] }) {
  const { t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedSermonId, setSelectedSermonId] = useState<string | null>(null);

  // 2. State to hold our dynamic database sermons
  const [sermons, setSermons] = useState<any[]>(initialSermons);
  const [isLoading, setIsLoading] = useState(initialSermons.length === 0);

  // Standalone fetch function for database sermons
  const fetchSermonsFromDatabase = async () => {
    try {
      const dbSermons = await getLatestSermons();
      
      // If the database has actual sermons, format them and use them!
      if (dbSermons && dbSermons.length > 0) {
        const formattedSermons = dbSermons.map((s) => {
          let videoId = s.videoUrl || "";
          if (s.videoUrl && s.videoUrl.includes('v=')) {
            videoId = s.videoUrl.split('v=')[1].split('&')[0];
          } else if (s.videoUrl && s.videoUrl.includes('youtu.be/')) {
            videoId = s.videoUrl.split('youtu.be/')[1].split('?')[0];
          }

          return {
            id: s.id,
            title: s.title,
            pastor: s.pastor,
            date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            views: s.views >= 1000 ? (s.views / 1000).toFixed(1) + 'K' : s.views.toString(),
            thumbnail: s.thumbnail || DEFAULT_THUMBNAIL, 
            duration: "45:00", 
            category: s.category,
            videoId,
            videoUrl: s.videoUrl,
          };
        });
        
        setSermons(formattedSermons);
      } else {
        setSermons([]);
      }
    } catch (error) {
      console.error("Failed to load dynamic sermons.", error);
      setSermons([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Fetch from Postgres on component mount + Listen to real-time companion updates
  useEffect(() => {
    if (initialSermons.length === 0) {
      fetchSermonsFromDatabase();
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });

    socket.on("sermon:uploaded", (data) => {
      console.log("[LANDING/SERMONS] Auto-refreshing sermon section due to live upload...", data);
      fetchSermonsFromDatabase();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handlePlaySermon = useCallback(async (sermon: any) => {
    setSelectedVideo(sermon.videoId);
    setSelectedSermonId(sermon.id);

    // Trigger View Counter update in background if it's a real DB record
    if (sermon.id && !sermon.id.startsWith("static-")) {
      try {
        const res = await fetch(`/api/sermons/${sermon.id}/view`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          // Update views count locally in UI instantly
          setSermons((prev) =>
            prev.map((s) =>
              s.id === sermon.id
                ? { ...s, views: data.views >= 1000 ? (data.views / 1000).toFixed(1) + 'K' : data.views.toString() }
                : s
            )
          );
        }
      } catch (err) {
        console.warn("Failed to increment views:", err);
      }
    }
  }, []);

  return (
    <section id="sermons" className="py-28 bg-white dark:bg-transparent relative z-10 overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[hsl(var(--primary))] mb-4 px-4 py-1.5 rounded-full bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.15)]">
            Latest Sermons
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-5 text-slate-900 dark:text-white tracking-tight">
            {t.sermons.title.split(" ")[0]}{" "}
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] bg-clip-text text-transparent">
              {t.sermons.title.split(" ").slice(1).join(" ")}
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-white/60">
            {t.sermons.subtitle}
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary)/0.3)]" />
            <div className="w-8 h-[2px] bg-gradient-to-r from-[hsl(var(--primary)/0.3)] to-[hsl(var(--primary))]" />
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_10px_hsl(var(--primary)/0.4)]" />
            <div className="w-8 h-[2px] bg-gradient-to-l from-[hsl(var(--primary)/0.3)] to-[hsl(var(--primary))]" />
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary)/0.3)]" />
          </div>
        </motion.div>

        {/* Sermons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-white/[0.01] rounded-3xl overflow-hidden border border-slate-100 dark:border-white/[0.05] p-0 flex flex-col h-full animate-pulse shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                >
                  <div className="w-full h-48 bg-slate-200 dark:bg-white/[0.03] relative" />
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="h-6 bg-slate-200 dark:bg-white/[0.03] rounded-xl w-5/6 mb-3" />
                      <div className="h-6 bg-slate-200 dark:bg-white/[0.03] rounded-xl w-2/3 mb-6" />
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-200 dark:bg-white/[0.03] rounded-lg w-1/2" />
                        <div className="h-4 bg-slate-200 dark:bg-white/[0.03] rounded-lg w-2/3" />
                      </div>
                    </div>
                    <div className="h-11 bg-slate-200 dark:bg-white/[0.03] rounded-xl w-full mt-6" />
                  </div>
                </div>
              ))
            : sermons.length === 0
            ? (
                <div className="col-span-full text-center py-16 px-6 bg-slate-50 dark:bg-white/[0.01] rounded-3xl border border-dashed border-slate-200 dark:border-white/[0.05] shadow-[inset_0_4px_12px_rgba(0,0,0,0.01)]">
                  <div className="w-16 h-16 bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <Play className="w-8 h-8 ml-1" fill="currentColor" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">No Sermons Available</h3>
                  <p className="text-slate-500 dark:text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
                    Stay tuned! We are updating our sermon library with powerful, life-changing messages. Check back soon.
                  </p>
                </div>
              )
            : sermons.map((sermon, index) => (
                <SermonCard 
                  key={sermon.id || index}
                  sermon={sermon}
                  index={index}
                  handlePlaySermon={handlePlaySermon}
                  t={t}
                />
              ))}
        </div>

        {/* View All Sermons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <a
            href="/pastor"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] text-white rounded-2xl font-bold tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow duration-300 hover:scale-105 active:scale-95"
          >
            {t.sermons.viewAll}
            <span className="text-white/70">→</span>
          </a>
        </motion.div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedVideo(null)}>
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Video Player */}
            <div className="relative pt-[56.25%] bg-gray-900">
              {selectedVideo.startsWith("http") && (selectedVideo.includes(".mp4") || selectedVideo.includes(".webm")) ? (
                <video
                  src={selectedVideo}
                  controls
                  autoPlay
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                  title="Sermon Video"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
