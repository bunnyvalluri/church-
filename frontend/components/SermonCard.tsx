import React from 'react';
import Image from 'next/image';
import { Play, Calendar, User, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface SermonCardProps {
  sermon: any;
  index: number;
  handlePlaySermon: (sermon: any) => void;
  t: any;
}

const SermonCard = React.memo(({ sermon, index, handlePlaySermon, t }: SermonCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group bg-slate-50 dark:bg-white/[0.02] rounded-3xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300 border border-slate-100 dark:border-white/[0.05] contain-paint flex flex-col justify-between"
    >
      {/* ── Video Thumbnail (Interactive Play Trigger — Unobstructed Document & Video View) ── */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Play sermon: ${sermon.title}`}
        className="relative aspect-[16/10] sm:aspect-video w-full overflow-hidden cursor-pointer bg-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        onClick={() => handlePlaySermon(sermon)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handlePlaySermon(sermon);
          }
        }}
      >
        <Image
          src={sermon.thumbnail || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=75"}
          alt={sermon.title}
          fill
          loading="lazy"
          decoding="async"
          quality={75}
          className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Ambient Gradient Overlay (Bottom-biased for high-contrast duration chip) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/15 pointer-events-none" />

        {/* Play Icon Capsule */}
        <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="relative flex items-center justify-center">
            {/* Ambient Pulse Ring on Hover */}
            <span className="absolute w-16 h-16 rounded-full bg-violet-500/30 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            
            {/* Frosted Play Button */}
            <div className="relative w-14 h-14 rounded-full bg-white/95 dark:bg-slate-900/90 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-xl shadow-black/40 border border-white/60 dark:border-white/20 group-hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md">
              <Play className="h-6 w-6 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        {/* Duration Badge (Standard Cinema Position) */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md text-white text-xs font-mono font-bold rounded-lg border border-white/15 shadow-sm">
          {sermon.duration}
        </div>
      </div>

      {/* ── Sermon Details & Primary Action ── */}
      <div className="p-5 sm:p-6 md:p-7 text-left space-y-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Pill & Date Strip (Clean separation — Zero text overlap on thumbnail) */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/25 shadow-2xs font-outfit">
              {sermon.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
              <span>{sermon.date}</span>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2 min-h-[3.25rem] font-outfit">
            {sermon.title}
          </h3>

          {/* Meta Info */}
          <div className="space-y-2 text-sm text-slate-600 dark:text-white/70 font-medium pt-2 border-t border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <User className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{sermon.pastor}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                <Eye className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                <span>{sermon.views} {t?.sermons?.views || "Views"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Watch Button */}
        <button
          type="button"
          onClick={() => handlePlaySermon(sermon)}
          aria-label={`Watch sermon: ${sermon.title}`}
          className="mt-3 w-full py-3 px-5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-extrabold text-sm shadow-md hover:shadow-xl hover:shadow-violet-600/25 transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer select-none"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>{t?.sermons?.watch || "Watch Now"}</span>
        </button>
      </div>
    </motion.div>
  );
});

SermonCard.displayName = 'SermonCard';

export default SermonCard;
