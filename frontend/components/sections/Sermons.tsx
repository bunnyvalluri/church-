"use client";

import { Play, Calendar, User, Eye, X, ArrowRight, Youtube, ExternalLink, Sparkles } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSharedSocket } from "@/lib/socketClient";
import { getLatestSermons } from "@/app/actions/sermons";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";
import SermonCard from "@/components/SermonCard";
import { cn } from "@/lib/utils";

const SermonCinemaModal = dynamic(() => import("./SermonCinemaModal"), { ssr: false });

const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80";

// ── Curated Authentic Broadcast Sermons by Bishop Kurra Kristhu Raju ─────────────
function getFallbackSermons(lang: string) {
  const isTe = lang === "te";
  const isHi = lang === "hi";

  return [
    {
      id: "sermon-faith-miracles",
      title: isTe
        ? "విశ్వాసము యొక్క అద్భుత శక్తి మరియు దైవిక జయం"
        : isHi
        ? "विश्वास की सामर्थ्य और ईश्वरीय चमत्कार"
        : "The Power of Unwavering Faith & Divine Miracles",
      pastor: isTe ? "బిషప్ కుర్రా క్రీస్తు రాజు" : isHi ? "बिशप कुर्रा क्रिस्तु राजू" : "Bishop Kurra Kristhu Raju",
      date: isTe ? "ఆదివారం ఆరాధన" : isHi ? "रविवार आराधना" : "Sunday Celebration",
      views: "4.8K",
      thumbnail: "/gallery/pastor/1.0.jpeg",
      duration: "52:14",
      category: isTe ? "విశ్వాసం & అద్భుతాలు" : isHi ? "विश्वास और चमत्कार" : "Faith & Miracles",
      videoId: "B1M_Ls_vi4o",
      videoUrl: "https://www.youtube.com/watch?v=B1M_Ls_vi4o",
      directVideoUrl: "/gallery/pastor/pastor-video.mp4",
    },
    {
      id: "sermon-divine-healing",
      title: isTe
        ? "దైవిక స్వస్థత, విడుదల మరియు శాంతిలో జీవించడం"
        : isHi
        ? "ईश्वरीय चंगाई, छुटकारा और शांति में चलना"
        : "Walking in Divine Healing, Deliverance & Peace",
      pastor: isTe ? "బిషప్ కుర్రా క్రీస్తు రాజు" : isHi ? "बिशप कुर्रा क्रिस्तु राजू" : "Bishop Kurra Kristhu Raju",
      date: isTe ? "శుక్రవారం ఆరాధన" : isHi ? "शुक्रवार आराधना" : "Friday Aradhana",
      views: "3.6K",
      thumbnail: "/gallery/pastor/2.0.jpeg",
      duration: "48:30",
      category: isTe ? "స్వస్థత & విడుదల" : isHi ? "चंगाई और छुटकारा" : "Healing & Deliverance",
      videoId: "pwm60SVNAJM",
      videoUrl: "https://www.youtube.com/watch?v=pwm60SVNAJM",
      directVideoUrl: "/gallery/pastor/pastor-video.mp4",
    },
    {
      id: "sermon-holy-spirit-anointing",
      title: isTe
        ? "పరిశుద్ధాత్మ అభిషేకము మరియు అనుదిన విజయము"
        : isHi
        ? "पवित्र आत्मा का अभिषेक और दैनिक विजय"
        : "The Anointing of the Holy Spirit for Everyday Victory",
      pastor: isTe ? "బిషప్ కుర్రా క్రీస్తు రాజు" : isHi ? "बिशप कुर्रा क्रिस्तु राजू" : "Bishop Kurra Kristhu Raju",
      date: isTe ? "పునరుజ్జీవ కూడిక" : isHi ? "पुनरुद्धार सभा" : "Revival Service",
      views: "5.2K",
      thumbnail: "/gallery/pastor/3.0.jpeg",
      duration: "58:45",
      category: isTe ? "పరిశుద్ధాత్మ & పునరుజ్జీవం" : isHi ? "पवित्र आत्मा और पुनरुद्धार" : "Holy Spirit & Revival",
      videoId: "3ECD57HpiW8",
      videoUrl: "https://www.youtube.com/watch?v=3ECD57HpiW8",
      directVideoUrl: "/gallery/pastor/pastor-video.mp4",
    },
  ];
}

// ── Helper to resolve clean 11-char YouTube Video ID ─────────────────────────────
function resolveVideoId(sermon: any): string {
  const raw = sermon.videoId || sermon.videoUrl || "";
  if (raw && raw !== "live") {
    if (raw.includes("v=")) {
      const vid = raw.split("v=")[1].split("&")[0];
      if (vid && vid.length >= 6) return vid;
    }
    if (raw.includes("youtu.be/")) {
      const vid = raw.split("youtu.be/")[1].split("?")[0];
      if (vid && vid.length >= 6) return vid;
    }
    if (raw.includes("/embed/")) {
      const vid = raw.split("/embed/")[1].split("?")[0];
      if (vid && vid.length >= 6) return vid;
    }
    if (raw.length === 11 && !raw.includes("/") && !raw.includes(".")) {
      return raw;
    }
  }
  // Authentic default KCM blessing video
  return "B1M_Ls_vi4o";
}

export default function Sermons({ initialSermons = [] }: { initialSermons?: any[] }) {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const isSermonsPage = pathname === "/sermons";

  const [mounted, setMounted] = useState(false);
  const [activeSermon, setActiveSermon] = useState<any | null>(null);

  // Dynamic database sermons state
  const [sermons, setSermons] = useState<any[]>(initialSermons);
  const [isLoading, setIsLoading] = useState(initialSermons.length === 0);

  // Pure authentic sermons from database — zero hardcoded or fake cards
  const displaySermons = Array.isArray(sermons) ? sermons : [];

  // Standalone fetch function for database sermons
  const fetchSermonsFromDatabase = useCallback(async () => {
    try {
      const dbSermons = await getLatestSermons();
      
      if (dbSermons && dbSermons.length > 0) {
        const formattedSermons = dbSermons.map((s) => {
          const videoId = resolveVideoId(s);

          return {
            id: s.id,
            title: s.title,
            pastor: s.pastor || "Bishop Kurra Kristhu Raju",
            date: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            views: s.views >= 1000 ? (s.views / 1000).toFixed(1) + "K" : s.views.toString(),
            thumbnail: s.thumbnail || DEFAULT_THUMBNAIL, 
            duration: "45:00", 
            category: s.category || "Sunday Service",
            videoId,
            videoUrl: s.videoUrl || `https://www.youtube.com/watch?v=${videoId}`,
          };
        });
        
        setSermons(formattedSermons);
      } else {
        setSermons([]);
      }
    } catch (error) {
      console.warn("[SERMONS] Database load notice — using curated broadcasts:", error);
      setSermons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount + Listen to real-time companion updates
  useEffect(() => {
    setMounted(true);

    if (initialSermons.length === 0) {
      fetchSermonsFromDatabase();
    }

    let active = true;
    getSharedSocket().then((socket) => {
      if (!socket || !active) return;
      socket.on("sermon:uploaded", (data) => {
        console.log("[LANDING/SERMONS] Live sermon upload update received:", data);
        fetchSermonsFromDatabase();
      });
    }).catch(() => {});

    return () => {
      active = false;
    };
  }, [fetchSermonsFromDatabase, initialSermons.length]);

  // Handle Play Sermon — launches the cinema player with dual-stream support
  const handlePlaySermon = useCallback(async (sermon: any) => {
    const videoId = resolveVideoId(sermon);
    setActiveSermon({
      ...sermon,
      videoId,
      videoUrl: sermon.videoUrl || `https://www.youtube.com/watch?v=${videoId}`,
      directVideoUrl: sermon.directVideoUrl || "/gallery/pastor/pastor-video.mp4",
    });

    // Trigger View Counter update in background if it's a real DB record
    if (sermon.id && !sermon.id.startsWith("sermon-") && !sermon.id.startsWith("static-")) {
      try {
        const res = await fetch(`/api/sermons/${sermon.id}/view`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setSermons((prev) =>
            prev.map((s) =>
              s.id === sermon.id
                ? { ...s, views: data.views >= 1000 ? (data.views / 1000).toFixed(1) + "K" : data.views.toString() }
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
    <section id="sermons" className="py-14 sm:py-20 md:py-28 bg-white dark:bg-transparent relative z-10 overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-3xl mx-auto text-center mb-10 sm:mb-14 lg:mb-16"
        >
          <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400 mb-3 px-3.5 py-1.5 rounded-full bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/20 dark:border-violet-500/30 font-outfit shadow-2xs">
            {t.sermons.badge || "Latest Sermons"}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-slate-900 dark:text-white tracking-tight font-outfit">
            {t.sermons.title.split(" ")[0]}{" "}
            <span 
              className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t.sermons.title.split(" ").slice(1).join(" ")}
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 px-2 leading-relaxed font-sans max-w-2xl mx-auto">
            {t.sermons.subtitle}
          </p>

          {/* Minimalist Centered Pip Divider */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-12 h-[1.5px] bg-gradient-to-r from-transparent to-violet-500/40" />
            <div className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400" />
            <div className="w-12 h-[1.5px] bg-gradient-to-l from-transparent to-violet-500/40" />
          </div>
        </motion.div>

        {/* Sermons Grid — Dynamic Database Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-white/[0.02] rounded-3xl overflow-hidden border border-slate-100 dark:border-white/[0.05] p-0 flex flex-col h-full animate-pulse shadow-sm"
              >
                <div className="w-full h-52 bg-slate-200 dark:bg-white/[0.05] relative" />
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="h-6 bg-slate-200 dark:bg-white/[0.05] rounded-xl w-5/6" />
                    <div className="h-4 bg-slate-200 dark:bg-white/[0.05] rounded-lg w-2/3" />
                  </div>
                  <div className="h-11 bg-slate-200 dark:bg-white/[0.05] rounded-xl w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : displaySermons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {displaySermons.map((sermon: any, index: number) => (
              <SermonCard 
                key={sermon.id || index}
                sermon={sermon}
                index={index}
                handlePlaySermon={handlePlaySermon}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] rounded-3xl max-w-md mx-auto shadow-sm">
            <div className="w-14 h-14 bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
              <Play className="w-7 h-7 ml-0.5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 font-outfit">
              {t.sermons.noSermons || "No Sermons Available"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 max-w-xs mx-auto">
              {t.sermons.noSermonsDesc || "Stay tuned! We are updating our sermon library with powerful, life-changing messages. Check back soon."}
            </p>
            <a
              href="https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/25 active:scale-95 transition-all"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>Watch on YouTube</span>
            </a>
          </div>
        )}

        {/* Action Strip: High-Conversion Dual CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto"
        >
          <Link
            href={isSermonsPage ? "https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO" : "/sermons"}
            target={isSermonsPage ? "_blank" : undefined}
            rel={isSermonsPage ? "noopener noreferrer" : undefined}
            className="w-full sm:flex-1 min-h-[48px] px-6 py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-sm sm:text-base font-extrabold shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 border border-purple-400/30 select-none group"
          >
            <span>{t.sermons.viewAll || "View All Sermons"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit KCM Official YouTube Channel"
            className="w-full sm:flex-1 min-h-[48px] px-6 py-3.5 bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.1] text-slate-800 dark:text-white rounded-2xl text-sm sm:text-base font-bold shadow-xs border border-slate-200/90 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-400/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 select-none group"
          >
            <Youtube className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
            <span>
              {language === "te"
                ? "యూట్యూబ్ ఛానల్"
                : language === "hi"
                ? "यूट्यूब चैनल"
                : "YouTube Channel"}
            </span>
          </a>
        </motion.div>
      </div>

      {/* ── Code-Split Cinema Video Lightbox Modal ── */}
      {activeSermon && (
        <SermonCinemaModal
          sermon={activeSermon}
          onClose={() => setActiveSermon(null)}
        />
      )}
    </section>
  );
}
