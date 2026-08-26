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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group bg-slate-50 dark:bg-white/[0.02] rounded-3xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300 border border-slate-100 dark:border-white/[0.05]"
    >
      {/* Thumbnail */}
      <div
        className="relative h-48 overflow-hidden cursor-pointer"
        onClick={() => handlePlaySermon(sermon)}
      >
        <Image
          src={sermon.thumbnail || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80"}
          alt={sermon.title}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Play Overlay & Badge (Visible with enhanced hover lift) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center transition-all duration-300">
          <div className="relative flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {/* Luminous Glow Ring */}
            <span className="absolute w-16 h-16 rounded-full bg-primary/30 animate-ping opacity-60 pointer-events-none" />
            
            {/* Glass Play Button */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/60 dark:border-white/20 shadow-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Play className="h-7 w-7 fill-current ml-1 transform-gpu transition-colors duration-300" />
            </div>
          </div>
        </div>
        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur-md text-white text-[11px] font-mono font-bold rounded-lg border border-white/10 shadow-sm">
          {sermon.duration}
        </div>
        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-primary/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm border border-white/20">
          {sermon.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 text-left">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight group-hover:text-[hsl(var(--primary))] dark:group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2 min-h-[3.5rem]">
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
          onClick={() => handlePlaySermon(sermon)}
          className="mt-5 w-full py-3 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95"
        >
          <Play className="h-5 w-5" fill="currentColor" />
          {t.sermons.watch}
        </button>
      </div>
    </motion.div>
  );
});

SermonCard.displayName = 'SermonCard';

export default SermonCard;
