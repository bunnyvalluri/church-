"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { Play, Calendar, User, Eye, X } from "lucide-react";
import Image from "next/image";
import { getLatestSermons } from "@/app/actions/sermons";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSocketEvent } from "@/hooks/useSocket";
import { motion } from "framer-motion";

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80";

// ── Animation variants defined OUTSIDE component to prevent recreation on every render ──
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

// ── Skeleton card component (memoized) ────────────────────────────────────────
const SermonSkeleton = memo(function SermonSkeleton() {
  return (
    <div className="bg-slate-50 dark:bg-white/[0.01] rounded-3xl overflow-hidden border border-slate-100 dark:border-white/[0.05] animate-pulse">
      <div className="w-full h-48 bg-slate-200 dark:bg-white/[0.03]" />
      <div className="p-6 md:p-8 space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-white/[0.03] rounded-xl w-5/6" />
        <div className="h-6 bg-slate-200 dark:bg-white/[0.03] rounded-xl w-2/3" />
        <div className="space-y-3 pt-2">
          <div className="h-4 bg-slate-200 dark:bg-white/[0.03] rounded-lg w-1/2" />
          <div className="h-4 bg-slate-200 dark:bg-white/[0.03] rounded-lg w-2/3" />
        </div>
        <div className="h-11 bg-slate-200 dark:bg-white/[0.03] rounded-xl w-full mt-4" />
      </div>
    </div>
  );
});

// ── Individual sermon card (memoized to prevent re-render when other cards update) ──
interface SermonCardProps {
  sermon: any;
  onPlay: (sermon: any) => void;
  watchLabel: string;
  viewsLabel: string;
}
const SermonCard = memo(function SermonCard({
  sermon,
  onPlay,
  watchLabel,
  viewsLabel,
}: SermonCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      className="group bg-slate-50 dark:bg-white/[0.02] rounded-3xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300 border border-slate-100 dark:border-white/[0.05]"
    >
      {/* Thumbnail */}
      <div
        className="relative h-48 overflow-hidden cursor-pointer"
        onClick={() => onPlay(sermon)}
      >
        <Image
          src={
            sermon.thumbnail ||
            "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80"
          }
          alt={sermon.title}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="h-8 w-8 text-[hsl(var(--primary))] ml-1" fill="currentColor" />
          </div>
        </div>
        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded">
          {sermon.duration}
        </div>
        {/* Category Badge — CSS-only pulse (no JS timer) */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-[hsl(var(--primary))] text-white text-xs font-semibold rounded-full sermon-badge-live">
          {sermon.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 text-left">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight group-hover:text-[hsl(var(--primary))] dark:group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2 min-h-[3.5rem]">
          {sermon.title}
        </h3>

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
              <span>
                {sermon.views} {viewsLabel}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onPlay(sermon)}
          className="mt-5 w-full py-3 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-shadow duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          <Play className="h-5 w-5" fill="currentColor" />
          {watchLabel}
        </button>
      </div>
    </motion.div>
  );
});

// ── Main Sermons section ───────────────────────────────────────────────────────
function Sermons() {
  const { t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedSermonId, setSelectedSermonId] = useState<string | null>(null);
  const [sermons, setSermons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSermonsFromDatabase = useCallback(async () => {
    try {
      const dbSermons = await getLatestSermons();

      if (dbSermons && dbSermons.length > 0) {
        const formattedSermons = dbSermons.map((s) => {
          let videoId = s.videoUrl || "";
          if (s.videoUrl && s.videoUrl.includes("v=")) {
            videoId = s.videoUrl.split("v=")[1].split("&")[0];
          } else if (s.videoUrl && s.videoUrl.includes("youtu.be/")) {
            videoId = s.videoUrl.split("youtu.be/")[1].split("?")[0];
          }
          return {
            id: s.id,
            title: s.title,
            pastor: s.pastor,
            date: new Date(s.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            views:
              s.views >= 1000
                ? (s.views / 1000).toFixed(1) + "K"
                : s.views.toString(),
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
      console.error("Failed to load sermons.", error);
      setSermons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSermonsFromDatabase();
  }, [fetchSermonsFromDatabase]);

  // ── Real-time refresh via shared singleton socket (no new connection!) ──
  useSocketEvent("sermon:uploaded", () => {
    fetchSermonsFromDatabase();
  });

  const handlePlaySermon = useCallback(
    async (sermon: any) => {
      setSelectedVideo(sermon.videoId);
      setSelectedSermonId(sermon.id);

      if (sermon.id && !sermon.id.startsWith("static-")) {
        try {
          const res = await fetch(`/api/sermons/${sermon.id}/view`, {
            method: "POST",
          });
          if (res.ok) {
            const data = await res.json();
            setSermons((prev) =>
              prev.map((s) =>
                s.id === sermon.id
                  ? {
                      ...s,
                      views:
                        data.views >= 1000
                          ? (data.views / 1000).toFixed(1) + "K"
                          : data.views.toString(),
                    }
                  : s
              )
            );
          }
        } catch (err) {
          console.warn("Failed to increment views:", err);
        }
      }
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setSelectedVideo(null);
    setSelectedSermonId(null);
  }, []);

  return (
    <section
      id="sermons"
      className="py-28 bg-white dark:bg-transparent relative z-10 overflow-hidden transition-colors duration-300"
    >
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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SermonSkeleton />
            <SermonSkeleton />
            <SermonSkeleton />
          </div>
        ) : sermons.length === 0 ? (
          <div className="col-span-full text-center py-16 px-6 bg-slate-50 dark:bg-white/[0.01] rounded-3xl border border-dashed border-slate-200 dark:border-white/[0.05] shadow-[inset_0_4px_12px_rgba(0,0,0,0.01)]">
            <div className="w-16 h-16 bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Play className="w-8 h-8 ml-1" fill="currentColor" />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
              No Sermons Available
            </h3>
            <p className="text-slate-500 dark:text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
              Stay tuned! We are updating our sermon library with powerful,
              life-changing messages. Check back soon.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {sermons.map((sermon, index) => (
              <SermonCard
                key={sermon.id || index}
                sermon={sermon}
                onPlay={handlePlaySermon}
                watchLabel={t.sermons.watch}
                viewsLabel={t.sermons.views}
              />
            ))}
          </motion.div>
        )}

        {/* View All Sermons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label="Close video"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative pt-[56.25%] bg-gray-900">
              {selectedVideo.startsWith("http") &&
              (selectedVideo.includes(".mp4") || selectedVideo.includes(".webm")) ? (
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

// Export as memoized component so re-renders from parent providers don't cascade
export default memo(Sermons);
